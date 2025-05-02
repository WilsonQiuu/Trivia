// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Trivia Game",
  description: "Join and play!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
