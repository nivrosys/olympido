import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Olympido — Competitive Academic Olympiad & Contest Arena",
  description:
    "Discover, register, and compete in accredited Olympiad competitions worldwide. Verified school and university hosts, dynamic rating ladders, and digital scorecards.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Olympido — Competitive Academic Olympiad & Contest Arena",
    description:
      "Discover, register, and compete in accredited Olympiad competitions worldwide.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Olympido Brand Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col"
        style={{
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          backgroundColor: "var(--bg-canvas)",
          color: "var(--text-primary)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
