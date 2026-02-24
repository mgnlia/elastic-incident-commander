import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Incident Commander | Elastic Agent Builder",
  description:
    "Multi-agent DevOps incident response system powered by Elasticsearch Agent Builder. Reduces MTTR from 45 minutes to 5 minutes.",
  keywords: ["elasticsearch", "incident response", "devops", "ai agents", "mttr"],
  openGraph: {
    title: "Incident Commander — Elastic Agent Builder",
    description: "AI-powered incident response: 45min MTTR → 5min",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-elastic-darker min-h-screen">
        {children}
      </body>
    </html>
  );
}
