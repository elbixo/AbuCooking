"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/", label: "Buscar recetas", match: (p: string) => p === "/" || p.startsWith("/receta/") },
  { href: "/favoritas", label: "Mis favoritas", match: (p: string) => p.startsWith("/favoritas") },
];

export default function SectionNav() {
  const pathname = usePathname();
  return (
    <nav className="mx-auto flex max-w-5xl gap-6 px-4 text-sm font-medium" aria-label="Secciones">
      {SECTIONS.map((s) => {
        const active = s.match(pathname);
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px border-b-2 pb-3 transition-colors ${
              active ? "border-orange-500 text-orange-700" : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            {s.label === "Mis favoritas" ? <>♥ {s.label}</> : s.label}
          </Link>
        );
      })}
    </nav>
  );
}
