import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { signOut } from "./auth/actions";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AbuCooking — ¿Qué cocino hoy?",
  description: "Dinos qué ingredientes tienes en casa y te proponemos recetas.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="es">
      <body className={`${geistSans.variable} min-h-screen bg-orange-50/40 text-stone-800 antialiased`}>
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-stone-900">
              Abu<span className="text-orange-500">Cooking</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link href="/admin" className="text-stone-600 hover:text-orange-700">
                      Administración
                    </Link>
                  )}
                  <span className="hidden text-stone-400 sm:inline">{user.email}</span>
                  <form action={signOut}>
                    <button type="submit" className="text-stone-600 hover:text-orange-700">
                      Salir
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-stone-600 hover:text-orange-700">
                    Entrar
                  </Link>
                  <Link href="/registro" className="rounded-lg bg-orange-500 px-3 py-1.5 font-medium text-white hover:bg-orange-600">
                    Crear cuenta
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
