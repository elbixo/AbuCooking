"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Cuenta las páginas visitadas dentro de la web desde que se cargó (se reinicia al recargar).
// Sirve para saber si "Volver" puede usar el historial o si se llegó desde fuera.
let visited = 0;

export function hasInternalHistory(): boolean {
  return visited > 1;
}

export default function NavigationTracker() {
  const pathname = usePathname();
  const params = useSearchParams();
  useEffect(() => {
    visited++;
  }, [pathname, params]);
  return null;
}
