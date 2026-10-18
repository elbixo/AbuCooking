"use client";

import type { SortDir } from "./useListParams";

export function SearchBox({
  value,
  onChange,
  placeholder,
  shown,
  total,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  shown: number;
  total: number;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative min-w-64 flex-1">
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input pl-9"
          aria-label="Buscar"
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">⌕</span>
      </div>
      <span className="text-sm text-stone-500">{shown === total ? `${total} en total` : `${shown} de ${total}`}</span>
    </div>
  );
}

export function SortHeader({
  label,
  active,
  dir,
  onClick,
  className = "",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <th className={`px-4 py-3 ${className}`} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}>
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-1 uppercase tracking-wide hover:text-stone-900 ${active ? "text-stone-900" : ""}`}
      >
        {label}
        <span className={active ? "" : "opacity-30"}>{active && dir === "desc" ? "↓" : "↑"}</span>
      </button>
    </th>
  );
}
