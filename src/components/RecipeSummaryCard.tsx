import Link from "next/link";
import FavoriteButton from "./FavoriteButton";
import type { RecipeSummary } from "@/lib/data";

type Props = {
  recipe: RecipeSummary;
  favorite: boolean;
  loggedIn: boolean;
  onRemoved?: () => void;
};

// Tarjeta de receta para listados (Buscar recetas, Mis favoritas)
export default function RecipeSummaryCard({ recipe: r, favorite, loggedIn, onRemoved }: Props) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {r.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.image_url} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
      )}
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton
          recipeId={r.id}
          recipeTitle={r.title}
          initial={favorite}
          loggedIn={loggedIn}
          onRemoved={onRemoved}
        />
      </div>
      <div className={`p-5 ${r.image_url ? "" : "pr-14"}`}>
        <h3 className="text-lg font-semibold text-stone-900">
          {/* El enlace cubre toda la tarjeta salvo el corazón, que queda por encima */}
          <Link href={`/receta/${r.slug}`} prefetch={false} className="after:absolute after:inset-0">
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
  );
}
