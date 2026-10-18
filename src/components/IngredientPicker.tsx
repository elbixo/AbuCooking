"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchQuery, type Ingredient } from "@/lib/data";
import { normalize } from "@/lib/text";

type Props = {
  ingredients: Ingredient[];
  initialSelected: number[];
  initialOnlyComplete: boolean;
};

export default function IngredientPicker({ ingredients, initialSelected, initialOnlyComplete }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<number[]>(initialSelected);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [onlyComplete, setOnlyComplete] = useState(initialOnlyComplete);

  const byId = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);

  const suggestions = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return ingredients
      .filter((i) => !i.is_pantry && !selected.includes(i.id))
      .map((i) => {
        const terms = [i.name, ...i.synonyms].map(normalize);
        const score = terms.some((t) => t.startsWith(q)) ? 0 : terms.some((t) => t.includes(q)) ? 1 : -1;
        return { ingredient: i, score };
      })
      .filter((s) => s.score >= 0)
      .sort((a, b) => a.score - b.score || a.ingredient.name.localeCompare(b.ingredient.name))
      .slice(0, 8)
      .map((s) => s.ingredient);
  }, [ingredients, query, selected]);

  function add(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setQuery("");
    setHighlight(0);
    inputRef.current?.focus();
  }

  function remove(id: number) {
    setSelected((prev) => prev.filter((x) => x !== id));
  }

  function search(only = onlyComplete) {
    router.push(`/${searchQuery(selected, only)}`);
  }

  // Si ya hay ingredientes, cambiar la casilla relanza la búsqueda
  function toggleOnlyComplete(value: boolean) {
    setOnlyComplete(value);
    if (selected.length) search(value);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[highlight]) add(suggestions[highlight].id);
      else if (!query) search();
    } else if (e.key === "Backspace" && !query && selected.length) {
      remove(selected[selected.length - 1]);
    } else if (e.key === "Escape") {
      setQuery("");
    }
  }

  return (
    <div className="w-full">
      <div className="relative">
        <div
          className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border border-stone-300 bg-white px-3 py-2 shadow-sm focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-200"
          onClick={() => inputRef.current?.focus()}
        >
          {selected.map((id) => (
            <span
              key={id}
              className="flex items-center gap-1 rounded-full bg-orange-100 py-1 pl-3 pr-1 text-sm font-medium text-orange-900"
            >
              {byId.get(id)?.name ?? id}
              <button
                type="button"
                onClick={() => remove(id)}
                className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-orange-200"
                aria-label={`Quitar ${byId.get(id)?.name}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlight(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={selected.length ? "Añade otro…" : "Escribe un ingrediente: huevo, patata…"}
            className="min-w-40 flex-1 bg-transparent py-1 text-base outline-none placeholder:text-stone-400"
            aria-label="Ingrediente"
            autoComplete="off"
          />
        </div>

        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
            {suggestions.map((s, idx) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => add(s.id)}
                  onMouseEnter={() => setHighlight(idx)}
                  className={`w-full px-4 py-2 text-left ${idx === highlight ? "bg-orange-50" : ""}`}
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {query && suggestions.length === 0 && (
          <p className="mt-2 text-sm text-stone-500">No conocemos ese ingrediente todavía.</p>
        )}
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3">
        <input
          type="checkbox"
          checked={onlyComplete}
          onChange={(e) => toggleOnlyComplete(e.target.checked)}
          className="mt-0.5 h-5 w-5 accent-orange-500"
        />
        <span>
          <span className="block font-medium text-stone-900">Solo con lo que tengo</span>
          <span className="block text-sm text-stone-500">
            {onlyComplete
              ? "Solo recetas que puedes hacer sin comprar nada."
              : "Incluye recetas a las que les falta algún ingrediente."}
          </span>
        </span>
      </label>

      <button
        type="button"
        onClick={() => search()}
        disabled={selected.length === 0}
        className="mt-4 w-full rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-stone-300 sm:w-auto"
      >
        Buscar recetas
      </button>
    </div>
  );
}
