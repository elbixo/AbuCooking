import IngredientPicker from "@/components/IngredientPicker";
import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listIngredients, parseIds, searchQuery, searchRecipes } from "@/lib/data";
import { favoriteIds } from "@/lib/favorites";

type Props = { searchParams: Promise<{ i?: string | string[]; solo?: string; aviso?: string }> };

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const selected = parseIds(params.i);
  const onlyComplete = params.solo === "1";
  const user = await getCurrentUser();
  const [ingredients, recipes, favorites] = await Promise.all([
    listIngredients(),
    searchRecipes(selected, onlyComplete),
    user && selected.length ? favoriteIds() : Promise.resolve(new Set<number>()),
  ]);
  const pantry = ingredients.filter((i) => i.is_pantry).map((i) => i.name);
  const query = searchQuery(selected, onlyComplete);

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
          <IngredientPicker
            key={query}
            ingredients={ingredients}
            initialSelected={selected}
            initialOnlyComplete={onlyComplete}
          />
        </div>
        <p className="mt-3 text-xs text-stone-500">Damos por hecho que tienes {pantry.join(", ")}.</p>
      </section>

      {selected.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-stone-900">
            {recipes.length >= 50
              ? "Las 50 recetas que mejor encajan"
              : recipes.length
              ? `${recipes.length} ${recipes.length === 1 ? "receta" : "recetas"} para ti`
              : onlyComplete
                ? "No hay recetas solo con esos ingredientes"
                : "No hemos encontrado recetas"}
          </h2>
          {recipes.length === 0 && onlyComplete && (
            <p className="text-stone-600">
              Prueba a añadir algún ingrediente más o{" "}
              <Link href={searchQuery(selected, false)} className="font-medium text-orange-700 hover:underline">
                mira las recetas a las que les falta poco
              </Link>
              .
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} query={query} favorite={favorites.has(r.id)} loggedIn={Boolean(user)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
