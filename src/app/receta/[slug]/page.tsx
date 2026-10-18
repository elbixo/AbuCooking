import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";
import FavoriteButton from "@/components/FavoriteButton";
import { getCurrentUser } from "@/lib/auth";
import { getRecipe, parseIds, searchQuery } from "@/lib/data";
import { favoriteIds } from "@/lib/favorites";
import { formatQuantity } from "@/lib/text";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ i?: string | string[]; solo?: string }>;
};

export default async function RecipePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const have = new Set(parseIds(query.i));
  const [recipe, user] = await Promise.all([getRecipe(slug), getCurrentUser()]);
  if (!recipe) notFound();
  const isFavorite = user ? (await favoriteIds()).has(recipe.id) : false;

  const backHref = `/${searchQuery(have, query.solo === "1")}`;

  return (
    <article className="mx-auto max-w-3xl">
      <BackLink fallback={backHref} />

      {recipe.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="mt-4 aspect-[16/9] w-full rounded-2xl object-cover"
        />
      )}

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">{recipe.title}</h1>
        <FavoriteButton recipeId={recipe.id} recipeTitle={recipe.title} initial={isFavorite} loggedIn={Boolean(user)} size="lg" />
      </div>
      {recipe.description && <p className="mt-2 text-stone-600">{recipe.description}</p>}
      <p className="mt-3 flex gap-4 text-sm text-stone-500">
        {recipe.prep_minutes && <span>⏱ {recipe.prep_minutes} min</span>}
        {recipe.servings && <span>🍽 {recipe.servings} raciones</span>}
      </p>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">Ingredientes</h2>
        <ul className="divide-y divide-stone-100">
          {recipe.ingredients.map((ing) => {
            const owned = have.has(ing.id) || ing.is_pantry;
            const missing = have.size > 0 && !owned;
            return (
              <li key={ing.id} className="flex items-center justify-between gap-3 py-2">
                <span className={missing ? "text-stone-400" : ""}>
                  {have.size > 0 && <span className="mr-2">{owned ? "✅" : "⬜"}</span>}
                  <span className="inline-block first-letter:uppercase">{ing.name}</span>
                  {ing.optional && <span className="ml-2 text-xs text-stone-400">(opcional)</span>}
                </span>
                <span className="shrink-0 text-sm text-stone-500">{formatQuantity(ing.quantity, ing.unit)}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">Preparación</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step, idx) => (
            <li key={idx} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-800">
                {idx + 1}
              </span>
              <p className="pt-0.5 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
