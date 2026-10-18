"use client";

import { useId, useState } from "react";

// Icono "i" con explicación: se abre al pasar el ratón, con el teclado o al tocarlo en el móvil
export default function InfoTooltip({ text, label = "Más información" }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        // En móvil un toque dispara focus y click seguidos: abrir (no alternar) evita que se cierre al momento
        onClick={() => setOpen(true)}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-stone-300 text-xs font-semibold text-stone-500 hover:border-orange-400 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full -right-2 z-30 mb-2 w-64 rounded-xl bg-stone-900 px-3 py-2 text-xs leading-relaxed text-white shadow-lg sm:w-72"
        >
          {text}
          <span aria-hidden className="absolute right-3 top-full border-4 border-transparent border-t-stone-900" />
        </span>
      )}
    </span>
  );
}
