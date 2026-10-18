"use client";

import Link from "next/link";
import { useState } from "react";
import RecipeSummaryCard from "./RecipeSummaryCard";
import type { FavoriteRecipe } from "@/lib/favorites";

// Al quitar una favorita desaparece de la lista al momento
// (después FavoriteButton vuelve a leer la página del servidor)
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
        <RecipeSummaryCard
          key={r.id}
          recipe={r}
          favorite
          loggedIn
          onRemoved={() => setRemoved((prev) => new Set(prev).add(r.id))}
        />
      ))}
    </div>
  );
}
