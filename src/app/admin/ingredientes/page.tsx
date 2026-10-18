import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import TranslationBadges from "@/components/admin/TranslationBadges";
import { deleteIngredient } from "../actions";
import { ingredientLabel } from "@/lib/admin";
import { adminDb } from "@/lib/supabase-admin";

export default async function AdminIngredients() {
  const ingredients = await adminDb.listIngredients();
  const untranslated = ingredients.filter((i) => !i.translations.fr || !i.translations.en).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Ingredientes ({ingredients.length})</h1>
          {untranslated > 0 && (
            <p className="mt-1 text-sm text-stone-500">{untranslated} sin traducir del todo.</p>
          )}
        </div>
        <Link href="/admin/ingredientes/nuevo" className="btn-primary">
          + Nuevo ingrediente
        </Link>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Español</th>
              <th className="px-4 py-3">Francés</th>
              <th className="px-4 py-3">Inglés</th>
              <th className="px-4 py-3">Idiomas</th>
              <th className="px-4 py-3">Recetas</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {ingredients.map((i) => (
              <tr key={i.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/ingredientes/${i.id}`} className="font-medium text-stone-900 hover:text-orange-700">
                    {i.translations.es?.name ?? "—"}
                  </Link>
                  {i.is_pantry && <span className="ml-2 text-xs text-stone-400">despensa</span>}
                </td>
                <td className="px-4 py-3 text-stone-600">{i.translations.fr?.name ?? "—"}</td>
                <td className="px-4 py-3 text-stone-600">{i.translations.en?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <TranslationBadges present={i.translations} />
                </td>
                <td className="px-4 py-3">{i.recipe_count}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link href={`/admin/ingredientes/${i.id}`} className="mr-4 text-sm text-orange-700 hover:underline">
                    Editar
                  </Link>
                  <DeleteButton label={ingredientLabel(i)} action={deleteIngredient.bind(null, i.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
