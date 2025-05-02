import QRCode from 'react-qr-code';

export default function Home() {
  // const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/join`;
  const joinUrl = "https://triviagame-sigma.vercel.app/join";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-6">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--foreground)] text-center">
        Scan to Join the Trivia!
      </h1>

      <div className="p-4 bg-white rounded-lg shadow-md mb-6">
        <QRCode value={joinUrl} size={200} />
      </div>

      <a
        href={joinUrl}
        className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
      >
        Join Now
      </a>
    </main>
  );
}
