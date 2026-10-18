import RecipeSummaryCard from "@/components/RecipeSummaryCard";
import TextSearchBox from "@/components/TextSearchBox";
import { getCurrentUser } from "@/lib/auth";
import { searchRecipesText } from "@/lib/data";
import { favoriteIds } from "@/lib/favorites";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function TextSearchPage({ searchParams }: Props) {
  const q = ((await searchParams).q ?? "").trim();
  const user = await getCurrentUser();
  const [recipes, favorites] = await Promise.all([
    searchRecipesText(q),
    user ? favoriteIds() : Promise.resolve(new Set<number>()),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Buscar recetas</h1>
        <p className="mt-2 text-stone-600">Busca por nombre, descripción, ingrediente o cualquier palabra de la receta.</p>
        <div className="mt-6">
          <TextSearchBox initial={q} />
        </div>
      </section>

      <section aria-live="polite">
        <h2 className="mb-4 text-sm font-medium text-stone-500">
          {q
            ? recipes.length
              ? `${recipes.length} ${recipes.length === 1 ? "receta" : "recetas"} con «${q}»`
              : `Ninguna receta con «${q}»`
            : `Todas las recetas (${recipes.length})`}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {recipes.map((r) => (
            <RecipeSummaryCard key={r.id} recipe={r} favorite={favorites.has(r.id)} loggedIn={Boolean(user)} />
          ))}
        </div>
      </section>
    </div>
  );
}
