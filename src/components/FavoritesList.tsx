"use client";

import Link from "next/link";
import { useState } from "react";
import FavoriteButton from "./FavoriteButton";
import type { FavoriteRecipe } from "@/lib/favorites";

// Al quitar una favorita desaparece de la lista sin recargar
export default function FavoritesList({ recipes }: { recipes: FavoriteRecipe[] }) {
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const visible = recipes.filter((r) => !removed.has(r.id));

  if (visible.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-4xl" aria-hidden>
          ♡
        </p>
        <p className="mt-2 font-medium text-stone-900">Aún no tienes recetas favoritas</p>
        <p className="mt-1 text-sm text-stone-500">Pulsa el corazón de cualquier receta para guardarla aquí.</p>
        <Link href="/" className="btn-primary mt-4 inline-block">
          Buscar recetas
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {visible.map((r) => (
        <article
          key={r.id}
          className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          {r.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.image_url} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
          )}
          <div className="absolute right-3 top-3 z-10">
            <FavoriteButton
              recipeId={r.id}
              initial
              loggedIn
              onRemoved={() => setRemoved((prev) => new Set(prev).add(r.id))}
            />
          </div>
          <div className={`p-5 ${r.image_url ? "" : "pr-14"}`}>
            <h3 className="text-lg font-semibold text-stone-900">
              <Link href={`/receta/${r.slug}`} className="after:absolute after:inset-0">
                {r.title}
              </Link>
            </h3>
            {r.description && <p className="mt-1 text-sm text-stone-600">{r.description}</p>}
            <p className="mt-3 flex gap-4 text-sm text-stone-500">
              {r.prep_minutes && <span>⏱ {r.prep_minutes} min</span>}
              {r.servings && <span>🍽 {r.servings} raciones</span>}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
