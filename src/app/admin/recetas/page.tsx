import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import TranslationBadges from "@/components/admin/TranslationBadges";
import { deleteRecipe } from "../actions";
import { adminDb } from "@/lib/supabase-admin";

export default async function AdminRecipes() {
  const recipes = await adminDb.listRecipes();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Recetas ({recipes.length})</h1>
        <Link href="/admin/recetas/nueva" className="btn-primary">
          + Nueva receta
        </Link>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Idiomas</th>
              <th className="px-4 py-3">Ingredientes</th>
              <th className="px-4 py-3">Tiempo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {recipes.map((r) => {
              const title = r.titles.es ?? r.slug;
              return (
                <tr key={r.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/recetas/${r.id}`} className="font-medium text-stone-900 hover:text-orange-700">
                      {title}
                    </Link>
                    <div className="font-mono text-xs text-stone-400">{r.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <TranslationBadges present={r.titles} />
                  </td>
                  <td className="px-4 py-3">{r.ingredient_count}</td>
                  <td className="px-4 py-3">{r.prep_minutes ? `${r.prep_minutes} min` : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link href={`/receta/${r.slug}`} className="mr-4 text-sm text-stone-500 hover:underline">
                      Ver
                    </Link>
                    <Link href={`/admin/recetas/${r.id}`} className="mr-4 text-sm text-orange-700 hover:underline">
                      Editar
                    </Link>
                    <DeleteButton label={title} action={deleteRecipe.bind(null, r.id)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
