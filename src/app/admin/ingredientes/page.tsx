import Link from "next/link";
import IngredientTable from "@/components/admin/IngredientTable";
import { adminDb } from "@/lib/supabase-admin";

export default async function AdminIngredients() {
  const ingredients = await adminDb.listIngredients();
  const untranslated = ingredients.filter((i) => !i.translations.fr || !i.translations.en).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Ingredientes</h1>
          {untranslated > 0 && (
            <p className="mt-1 text-sm text-stone-500">{untranslated} sin traducir del todo.</p>
          )}
        </div>
        <Link href="/admin/ingredientes/nuevo" className="btn-primary">
          + Nuevo ingrediente
        </Link>
      </div>
      <IngredientTable ingredients={ingredients} />
    </div>
  );
}
