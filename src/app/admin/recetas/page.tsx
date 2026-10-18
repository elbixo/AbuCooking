import Link from "next/link";
import RecipeTable from "@/components/admin/RecipeTable";
import { adminDb } from "@/lib/supabase-admin";

export default async function AdminRecipes() {
  const recipes = await adminDb.listRecipes();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Recetas</h1>
        <Link href="/admin/recetas/nueva" className="btn-primary">
          + Nueva receta
        </Link>
      </div>
      <RecipeTable recipes={recipes} />
    </div>
  );
}
