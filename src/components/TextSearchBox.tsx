"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Buscador por texto: actualiza los resultados mientras se escribe (con una pequeña espera)
export default function TextSearchBox({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      const q = value.trim();
      router.replace(q ? `/buscar?q=${encodeURIComponent(q)}` : "/buscar", { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [value, router]);

  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 fill-none stroke-stone-400"
        strokeWidth={2}
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tortilla, lentejas, postre…"
        aria-label="Buscar recetas"
        autoFocus
        className="w-full rounded-2xl border border-stone-300 bg-white py-3.5 pl-12 pr-4 text-base shadow-sm outline-none placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
      />
    </form>
  );
}
