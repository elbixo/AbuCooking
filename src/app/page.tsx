import IngredientPicker from "@/components/IngredientPicker";
import RecipeCard from "@/components/RecipeCard";
import { listIngredients, parseIds, searchRecipes } from "@/lib/data";

type Props = { searchParams: Promise<{ i?: string | string[]; aviso?: string }> };

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const selected = parseIds(params.i);
  const [ingredients, recipes] = await Promise.all([listIngredients(), searchRecipes(selected)]);
  const pantry = ingredients.filter((i) => i.is_pantry).map((i) => i.name);
  const query = selected.length ? `?i=${selected.join(",")}` : "";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {params.aviso === "sin-permiso" && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Esa sección es solo para administradores.
        </p>
      )}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">¿Qué tienes en la nevera?</h1>
        <p className="mt-2 text-stone-600">
          Añade los ingredientes que tienes y te diremos qué puedes cocinar.
        </p>
        <div className="mt-6">
          <IngredientPicker key={query} ingredients={ingredients} initialSelected={selected} />
        </div>
        <p className="mt-3 text-xs text-stone-500">Damos por hecho que tienes {pantry.join(", ")}.</p>
      </section>

      {selected.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-stone-900">
            {recipes.length ? `${recipes.length} recetas para ti` : "No hemos encontrado recetas"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} query={query} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
