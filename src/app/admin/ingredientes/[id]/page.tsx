import { notFound } from "next/navigation";
import IngredientEditor from "@/components/admin/IngredientEditor";
import { ingredientLabel } from "@/lib/admin";
import { adminDb } from "@/lib/supabase-admin";

export default async function EditIngredient({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const ingredient = (await adminDb.listIngredients()).find((i) => i.id === id);
  if (!ingredient) notFound();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-stone-900">Editar: {ingredientLabel(ingredient)}</h1>
      <p className="mb-6 text-sm text-stone-500">Se usa en {ingredient.recipe_count} receta(s).</p>
      <IngredientEditor initial={ingredient} />
    </div>
  );
}
