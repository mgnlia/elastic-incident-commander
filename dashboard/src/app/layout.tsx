import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elastic Incident Commander",
  description:
    "Multi-agent production incident response built with Elastic Agent Builder.",
};

const nav = [
  { href: "/", label: "Home" },
  { href: "/demo", label: "Demo" },
  { href: "/architecture", label: "Architecture" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-900 text-gray-100 antialiased">
        <header className="sticky top-0 z-50 border-b border-dark-600 bg-dark-900/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-semibold tracking-wide text-white">
              <span className="mr-2">🚨</span>
              Elastic Incident Commander
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-400 transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href="https://github.com/mgnlia/elastic-incident-commander"
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-dark-500 bg-dark-700 px-3 py-1.5 text-gray-300 transition hover:border-elastic-teal/50 hover:text-white"
              >
                GitHub ↗
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
