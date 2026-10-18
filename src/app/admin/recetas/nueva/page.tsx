import RecipeForm from "@/components/admin/RecipeForm";
import { adminDb } from "@/lib/supabase-admin";

export default async function NewRecipe() {
  const ingredients = await adminDb.listIngredients();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Nueva receta</h1>
      <RecipeForm ingredients={ingredients} />
    </div>
  );
}
