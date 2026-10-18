import Link from "next/link";
import type { RecipeMatch } from "@/lib/data";

export default function RecipeCard({ recipe, query }: { recipe: RecipeMatch; query: string }) {
  const complete = recipe.missing.length === 0;
  const pct = Math.round((recipe.matched / recipe.total) * 100);

  return (
    <Link
      href={`/receta/${recipe.slug}${query}`}
      className="block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {recipe.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={recipe.image_url} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-stone-900">{recipe.title}</h3>
          {recipe.prep_minutes && (
            <span className="shrink-0 text-sm text-stone-500">{recipe.prep_minutes} min</span>
          )}
        </div>
        {recipe.description && <p className="mt-1 text-sm text-stone-600">{recipe.description}</p>}

        {/* Parte de los ingredientes necesarios (sin básicos ni opcionales) que ya tienes */}
        <div className="mt-4 flex items-center gap-3">
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={recipe.total}
            aria-valuenow={recipe.matched}
            aria-label="Ingredientes que tienes"
          >
            <div
              className={`h-full rounded-full ${complete ? "bg-green-500" : "bg-orange-400"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-medium text-stone-500">
            Tienes {recipe.matched} de {recipe.total}
          </span>
        </div>
        <p className="mt-2 text-sm">
          {complete ? (
            <span className="font-medium text-green-700">¡Lo tienes todo!</span>
          ) : (
            <span className="text-stone-600">
              Te falta: <span className="font-medium text-stone-800">{recipe.missing.join(", ")}</span>
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
