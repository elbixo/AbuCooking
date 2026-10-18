import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AbuCooking — ¿Qué cocino hoy?",
  description: "Dinos qué ingredientes tienes en casa y te proponemos recetas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} min-h-screen bg-orange-50/40 text-stone-800 antialiased`}>
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center px-4 py-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-stone-900">
              Abu<span className="text-orange-500">Cooking</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
