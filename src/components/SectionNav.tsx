"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/", label: "¡A cocinar!", match: (p: string) => p === "/" },
  { href: "/buscar", label: "Buscar recetas", match: (p: string) => p.startsWith("/buscar") },
  { href: "/favoritas", label: "♥ Mis favoritas", match: (p: string) => p.startsWith("/favoritas") },
];

export default function SectionNav() {
  const pathname = usePathname();
  return (
    // En pantallas muy estrechas se desplaza en horizontal, pero sin barra visible
    // (Windows la muestra siempre) y sin desplazamiento vertical
    <nav
      className="mx-auto flex max-w-5xl gap-5 overflow-x-auto overflow-y-hidden px-4 text-sm font-medium [scrollbar-width:none] sm:gap-6 [&::-webkit-scrollbar]:hidden"
      aria-label="Secciones"
    >
      {SECTIONS.map((s) => {
        const active = s.match(pathname);
        return (
          <Link
            key={s.href}
            href={s.href}
            // Sin precarga: son páginas con datos del usuario y, si se precargan, Next.js
            // puede pintarlas dos veces (y cerrar una ventana de confirmación recién abierta)
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 whitespace-nowrap border-b-2 pb-3 transition-colors ${
              active ? "border-orange-500 text-orange-700" : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
