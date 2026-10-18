"use client";

import Link from "next/link";
import { useMemo } from "react";
import DeleteButton from "./DeleteButton";
import TranslationBadges from "./TranslationBadges";
import { SearchBox, SortHeader } from "./ListControls";
import { compareNumber, compareText, useListParams } from "./useListParams";
import { deleteIngredient } from "@/app/admin/actions";
import { ingredientLabel, type AdminIngredient } from "@/lib/admin";
import { normalize } from "@/lib/text";

const SORTS = ["es", "fr", "en", "recipes"] as const;
type SortKey = (typeof SORTS)[number];

export default function IngredientTable({ ingredients }: { ingredients: AdminIngredient[] }) {
  const { query, setQuery, sort, dir, toggleSort } = useListParams<SortKey>("es", SORTS);

  const rows = useMemo(() => {
    const q = normalize(query);
    const filtered = q
      ? ingredients.filter((i) =>
          [i.slug, ...Object.values(i.translations).flatMap((t) => (t ? [t.name, ...t.synonyms] : []))].some((t) =>
            normalize(t).includes(q),
          ),
        )
      : ingredients;
    return [...filtered].sort((a, b) =>
      sort === "recipes"
        ? compareNumber(a.recipe_count, b.recipe_count, dir)
        : compareText(a.translations[sort]?.name, b.translations[sort]?.name, dir),
    );
  }, [ingredients, query, sort, dir]);

  const header = (key: SortKey, label: string) => (
    <SortHeader label={label} active={sort === key} dir={dir} onClick={() => toggleSort(key)} />
  );

  return (
    <>
      <SearchBox
        value={query}
        onChange={setQuery}
        placeholder="Buscar por nombre o sinónimo (en cualquier idioma)…"
        shown={rows.length}
        total={ingredients.length}
      />
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 text-left text-xs text-stone-500">
            <tr>
              {header("es", "Español")}
              {header("fr", "Francés")}
              {header("en", "Inglés")}
              <th className="px-4 py-3 uppercase tracking-wide">Idiomas</th>
              {header("recipes", "Recetas")}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((i) => (
              <tr key={i.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/ingredientes/${i.id}`} className="font-medium text-stone-900 hover:text-orange-700">
                    {i.translations.es?.name ?? "—"}
                  </Link>
                  {i.is_pantry && <span className="ml-2 text-xs text-stone-400">despensa</span>}
                </td>
                <td className="px-4 py-3 text-stone-600">{i.translations.fr?.name ?? "—"}</td>
                <td className="px-4 py-3 text-stone-600">{i.translations.en?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <TranslationBadges present={i.translations} />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/ingredientes/${i.id}`} className="text-orange-700 hover:underline">
                    {i.recipe_count}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link href={`/admin/ingredientes/${i.id}`} className="mr-4 text-sm text-orange-700 hover:underline">
                    Ver / editar
                  </Link>
                  <DeleteButton label={ingredientLabel(i)} action={() => deleteIngredient(i.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-4 py-8 text-center text-sm text-stone-500">Ningún ingrediente coincide.</p>}
      </div>
    </>
  );
}
