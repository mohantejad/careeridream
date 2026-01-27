import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career IDream",
  description: "An AI Platform to help you land your dream job",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
