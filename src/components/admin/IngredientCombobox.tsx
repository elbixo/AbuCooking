"use client";

import { useMemo, useState } from "react";
import { ingredientLabel, type AdminIngredient } from "@/lib/admin";
import { normalize } from "@/lib/text";

type Props = {
  ingredients: AdminIngredient[];
  excludeIds: number[];
  onSelect: (ingredient: AdminIngredient) => void;
  onCreate: (name: string) => void;
};

// Busca entre los ingredientes existentes (en cualquier idioma y sinónimos).
// Si no hay coincidencia exacta, ofrece crear uno nuevo.
export default function IngredientCombobox({ ingredients, excludeIds, onSelect, onCreate }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const { matches, exact } = useMemo(() => {
    const q = normalize(query);
    if (!q) return { matches: [], exact: false };
    let exact = false;
    const scored = ingredients
      .map((i) => {
        const terms = Object.values(i.translations).flatMap((t) => (t ? [t.name, ...t.synonyms] : [])).map(normalize);
        if (terms.includes(q)) exact = true;
        const score = terms.includes(q) ? 0 : terms.some((t) => t.startsWith(q)) ? 1 : terms.some((t) => t.includes(q)) ? 2 : -1;
        return { i, score };
      })
      .filter((s) => s.score >= 0 && !excludeIds.includes(s.i.id))
      .sort((a, b) => a.score - b.score || ingredientLabel(a.i).localeCompare(ingredientLabel(b.i)))
      .slice(0, 8)
      .map((s) => s.i);
    return { matches: scored, exact };
  }, [ingredients, excludeIds, query]);

  const showCreate = query.trim() !== "" && !exact;
  const optionCount = matches.length + (showCreate ? 1 : 0);

  function choose(idx: number) {
    if (idx < matches.length) onSelect(matches[idx]);
    else onCreate(query.trim());
    setQuery("");
    setHighlight(0);
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, optionCount - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (optionCount) choose(highlight);
          } else if (e.key === "Escape") {
            setQuery("");
          }
        }}
        placeholder="Buscar ingrediente para añadir…"
        className="input"
        aria-label="Añadir ingrediente"
      />
      {open && optionCount > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
          {matches.map((m, idx) => (
            <li key={m.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(idx)}
                onMouseEnter={() => setHighlight(idx)}
                className={`flex w-full justify-between px-4 py-2 text-left text-sm ${idx === highlight ? "bg-orange-50" : ""}`}
              >
                <span>{ingredientLabel(m)}</span>
                <span className="text-stone-400">
                  {[m.translations.fr?.name, m.translations.en?.name].filter(Boolean).join(" · ")}
                </span>
              </button>
            </li>
          ))}
          {showCreate && (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(matches.length)}
                onMouseEnter={() => setHighlight(matches.length)}
                className={`w-full border-t border-stone-100 px-4 py-2 text-left text-sm font-medium text-orange-700 ${highlight === matches.length ? "bg-orange-50" : ""}`}
              >
                + Crear ingrediente «{query.trim()}»
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
