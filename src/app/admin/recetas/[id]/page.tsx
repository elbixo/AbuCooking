import { notFound } from "next/navigation";
import RecipeForm from "@/components/admin/RecipeForm";
import { adminDb } from "@/lib/supabase-admin";

export default async function EditRecipe({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [recipe, ingredients] = await Promise.all([adminDb.getRecipe(id), adminDb.listIngredients()]);
  if (!recipe) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">
        Editar: {recipe.translations.es?.title ?? recipe.slug}
      </h1>
      <RecipeForm key={recipe.id} initial={recipe} ingredients={ingredients} />
    </div>
  );
}
