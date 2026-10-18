import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { adminEnabled } from "@/lib/admin";
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
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-stone-900">
              Abu<span className="text-orange-500">Cooking</span>
            </Link>
            {adminEnabled() && (
              <Link href="/admin" className="text-sm text-stone-500 hover:text-orange-700">
                Administración
              </Link>
            )}
          </div>
        </header>
        <main className="px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
