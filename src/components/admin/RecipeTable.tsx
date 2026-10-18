"use client";

import Link from "next/link";
import { useMemo } from "react";
import DeleteButton from "./DeleteButton";
import AuditCell from "./AuditCell";
import TranslationBadges from "./TranslationBadges";
import { SearchBox, SortHeader } from "./ListControls";
import { compareDate, compareNumber, compareText, useListParams } from "./useListParams";
import { deleteRecipe } from "@/app/admin/actions";
import type { AdminRecipeSummary } from "@/lib/admin";
import { normalize } from "@/lib/text";

const SORTS = ["title", "ingredients", "time", "updated"] as const;
type SortKey = (typeof SORTS)[number];

export default function RecipeTable({ recipes }: { recipes: AdminRecipeSummary[] }) {
  const { query, setQuery, sort, dir, toggleSort } = useListParams<SortKey>("title", SORTS);

  const rows = useMemo(() => {
    const q = normalize(query);
    const filtered = q
      ? recipes.filter((r) => [r.slug, ...Object.values(r.titles)].some((t) => t && normalize(t).includes(q)))
      : recipes;
    return [...filtered].sort((a, b) => {
      if (sort === "ingredients") return compareNumber(a.ingredient_count, b.ingredient_count, dir);
      if (sort === "time") return compareNumber(a.prep_minutes, b.prep_minutes, dir);
      if (sort === "updated") return compareDate(a.updated_at, b.updated_at, dir);
      return compareText(a.titles.es ?? a.slug, b.titles.es ?? b.slug, dir);
    });
  }, [recipes, query, sort, dir]);

  const header = (key: SortKey, label: string) => (
    <SortHeader label={label} active={sort === key} dir={dir} onClick={() => toggleSort(key)} />
  );

  return (
    <>
      <SearchBox
        value={query}
        onChange={setQuery}
        placeholder="Buscar por título (en cualquier idioma)…"
        shown={rows.length}
        total={recipes.length}
      />
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 text-left text-xs text-stone-500">
            <tr>
              <th className="w-16 px-4 py-3" />
              {header("title", "Título")}
              <th className="px-4 py-3 uppercase tracking-wide">Idiomas</th>
              {header("ingredients", "Ingredientes")}
              {header("time", "Tiempo")}
              {header("updated", "Últ. modificación")}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((r) => {
              const title = r.titles.es ?? r.slug;
              return (
                <tr key={r.id} className="hover:bg-stone-50">
                  <td className="px-4 py-2">
                    {r.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image_url} alt="" loading="lazy" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-stone-100" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/recetas/${r.id}`} className="font-medium text-stone-900 hover:text-orange-700">
                      {title}
                    </Link>
                    <div className="font-mono text-xs text-stone-400">{r.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <TranslationBadges present={r.titles} />
                  </td>
                  <td className="px-4 py-3">{r.ingredient_count}</td>
                  <td className="px-4 py-3">{r.prep_minutes ? `${r.prep_minutes} min` : "—"}</td>
                  <td className="px-4 py-3">
                    <AuditCell audit={r} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link href={`/receta/${r.slug}`} className="mr-4 text-sm text-stone-500 hover:underline">
                      Ver
                    </Link>
                    <Link href={`/admin/recetas/${r.id}`} className="mr-4 text-sm text-orange-700 hover:underline">
                      Editar
                    </Link>
                    <DeleteButton label={title} action={() => deleteRecipe(r.id)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-4 py-8 text-center text-sm text-stone-500">Ninguna receta coincide.</p>}
      </div>
    </>
  );
}
