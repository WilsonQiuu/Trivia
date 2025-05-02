import { createServer } from "http";
import next from "next";
import { Server, Socket } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

interface Scores {
  team1: number;
  team2: number;
}

interface Question {
  text: string;
  correctAnswer: string;
  wrongAnswers: string[];
  points: number;
}

interface Session {
  name: string;
  team: "team1" | "team2";
  isHost: boolean;
}

const gameState = {
  questions: [
    {
      text: "What is the capital of France?",
      correctAnswer: "Paris",
      wrongAnswers: ["Madrid", "Berlin", "Rome"],
      points: 10,
    },
    {
      text: "Which planet is known as the Red Planet?",
      correctAnswer: "Mars",
      wrongAnswers: ["Jupiter", "Saturn", "Venus"],
      points: 5,
    },
    {
      text: "Who wrote 'To Kill a Mockingbird'?",
      correctAnswer: "Harper Lee",
      wrongAnswers: ["Mark Twain", "F. Scott Fitzgerald", "Ernest Hemingway"],
      points: 10,
    },
  ],
  currentIndex: 0,
  scores: { team1: 0, team2: 0 },
  buzzLocked: false,
};

const sessions: Record<string, Session> = {};
let buzzTeam: "team1" | "team2" | null = null;
let buzzPlayer: string | null = null;
let answerTimer: NodeJS.Timeout | null = null;

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  const io = new Server(server);

  io.on("connection", (socket: Socket) => {
    socket.on("joinGame", ({ name, team }: { name: string; team: "team1" | "team2" }) => {
      const isHost = name.toLowerCase() === "wilsonqiu";
      sessions[socket.id] = { name, team, isHost };
      socket.emit("hostAssigned", isHost);
      io.emit("playerList", Object.values(sessions));
    });

    socket.on("startGame", () => {
      if (!sessions[socket.id]?.isHost) return;

      gameState.currentIndex = 0;
      gameState.scores = { team1: 0, team2: 0 };
      gameState.buzzLocked = false;
      buzzTeam = null;
      buzzPlayer = null;

      io.emit("scoreUpdate", gameState.scores);
      io.emit("gameState", { state: "scoreboard", payload: gameState.scores });

      setTimeout(() => {
        io.emit("gameState", { state: "question", payload: currentQuestion() });
      }, 3000);
    });

    socket.on("nextQuestion", () => {
      if (!sessions[socket.id]?.isHost) return;
      nextQuestion();
    });

    socket.on("prevQuestion", () => {
      if (!sessions[socket.id]?.isHost) return;
      if (gameState.currentIndex > 0) gameState.currentIndex--;
      resetBuzz();
      io.emit("gameState", { state: "question", payload: currentQuestion() });
    });

    socket.on("skipQuestion", () => {
      if (!sessions[socket.id]?.isHost) return;
      nextQuestion();
    });

    socket.on("editPoints", ({ team, points }: { team: "team1" | "team2"; points: number }) => {
      if (!sessions[socket.id]?.isHost) return;
      gameState.scores[team] = points;
      io.emit("scoreUpdate", gameState.scores);
    });

    socket.on("buzz", () => {
      const player = sessions[socket.id];
      if (!player || gameState.buzzLocked) return;

      buzzTeam = player.team;
      buzzPlayer = player.name;
      gameState.buzzLocked = true;

      io.emit("buzzLocked");
      io.emit("showBuzzInfo", { name: buzzPlayer, team: buzzTeam });

      io.to(socket.id).emit("promptAnswer", { time: 5 });

      answerTimer = setTimeout(() => {
        promptOtherTeam();
      }, 5000);
    });

    socket.on("submitAnswer", (selected: string) => {
        //debug 
        console.log(`Player ${sessions[socket.id]?.name} submitted answer: ${selected}`);
      const player = sessions[socket.id];
      if (!player) return;

      const q = currentQuestion();
      if (!q) return;

      if (buzzPlayer && player.name !== buzzPlayer) return;

      const correct = selected === q.correctAnswer;
      clearTimeout(answerTimer!);
    
      io.emit("answerResult", { correct, player: player.name, team: player.team });
    
      if (correct) {
        // debug line
        console.log(`Player ${player.name} answered correctly!`);
        gameState.scores[player.team] += q.points;
        io.emit("scoreUpdate", gameState.scores);
        resetBuzz();
        
      } else {
        promptOtherTeam();
      }
      
    });

    function promptOtherTeam() {
      if (!buzzTeam) return;
      const otherTeam = buzzTeam === "team1" ? "team2" : "team1";

      buzzTeam = otherTeam;
      buzzPlayer = null;

      io.emit("showBuzzInfo", { name: null, team: otherTeam });
      emitToTeam(otherTeam, "promptAnswer", { time: 30 });

      answerTimer = setTimeout(() => {
        io.emit("answerResult", { correct: false, player: null });
        resetBuzz();
      }, 30000);
    }

    function nextQuestion() {
      gameState.currentIndex++;
      resetBuzz();
      clearTimeout(answerTimer!);

      if (gameState.currentIndex >= gameState.questions.length) {
        io.emit("gameState", { state: "results", payload: gameState.scores });
      } else {
        io.emit("gameState", { state: "question", payload: currentQuestion() });
      }
    }

    function resetBuzz() {
      gameState.buzzLocked = false;
      buzzTeam = null;
      buzzPlayer = null;
    }

    function currentQuestion(): Question {
      return gameState.questions[gameState.currentIndex];
    }

    function emitToTeam(team: "team1" | "team2", event: string, payload: any) {
      Object.entries(sessions).forEach(([id, s]) => {
        if (s.team === team) {
          io.to(id).emit(event, payload);
        }
      });
    }
  });

  const port = parseInt(process.env.PORT || "3000", 10);

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
