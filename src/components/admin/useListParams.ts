"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export type SortDir = "asc" | "desc";

// Búsqueda y orden guardados en la URL (?q=…&sort=…&dir=…) sin recargar la página,
// para que se conserven al volver de editar.
export function useListParams<K extends string>(defaultSort: K, validSorts: readonly K[]) {
  const params = useSearchParams();
  const initialSort = params.get("sort") as K | null;
  const [query, setQueryState] = useState(params.get("q") ?? "");
  const [sort, setSortState] = useState<K>(initialSort && validSorts.includes(initialSort) ? initialSort : defaultSort);
  const [dir, setDir] = useState<SortDir>(params.get("dir") === "desc" ? "desc" : "asc");

  function sync(next: { q: string; sort: K; dir: SortDir }) {
    const p = new URLSearchParams();
    if (next.q) p.set("q", next.q);
    if (next.sort !== defaultSort) p.set("sort", next.sort);
    if (next.dir !== "asc") p.set("dir", next.dir);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }

  function setQuery(q: string) {
    setQueryState(q);
    sync({ q, sort, dir });
  }

  // Pulsar la misma columna invierte el orden
  function toggleSort(key: K) {
    const nextDir: SortDir = key === sort && dir === "asc" ? "desc" : "asc";
    setSortState(key);
    setDir(nextDir);
    sync({ q: query, sort: key, dir: nextDir });
  }

  return { query, setQuery, sort, dir, toggleSort };
}

// Compara textos en español (ignora mayúsculas y tildes). Los vacíos siempre al final.
export function compareText(a: string | null | undefined, b: string | null | undefined, dir: SortDir): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const r = a.localeCompare(b, "es", { sensitivity: "base", numeric: true });
  return dir === "asc" ? r : -r;
}

export function compareNumber(a: number | null | undefined, b: number | null | undefined, dir: SortDir): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return dir === "asc" ? a - b : b - a;
}

// Fechas ISO; las vacías siempre al final
export function compareDate(a: string | null | undefined, b: string | null | undefined, dir: SortDir): number {
  return compareNumber(a ? Date.parse(a) : null, b ? Date.parse(b) : null, dir);
}
