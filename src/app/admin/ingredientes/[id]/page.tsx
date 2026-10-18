import Link from "next/link";
import { notFound } from "next/navigation";
import IngredientEditor from "@/components/admin/IngredientEditor";
import { LOCALES, LOCALE_LABELS, ingredientLabel } from "@/lib/admin";
import { adminDb } from "@/lib/supabase-admin";
import { formatQuantity } from "@/lib/text";

export default async function IngredientDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const ingredient = await adminDb.getIngredient(id);
  if (!ingredient) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/ingredientes" className="text-sm text-orange-600 hover:underline">
          ← Ingredientes
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900 first-letter:uppercase">{ingredientLabel(ingredient)}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {LOCALES.filter((l) => l !== "es")
            .map((l) => `${LOCALE_LABELS[l]}: ${ingredient.translations[l]?.name ?? "—"}`)
            .join(" · ")}
          {ingredient.is_pantry && " · básico de despensa"}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-stone-900">Editar ingrediente</h2>
        <div className="card">
          <IngredientEditor initial={ingredient} />
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-stone-900">
          Recetas que lo usan ({ingredient.recipes.length})
        </h2>
        {ingredient.recipes.length === 0 ? (
          <p className="card text-sm text-stone-500">Ninguna receta usa este ingrediente todavía.</p>
        ) : (
          <ul className="card divide-y divide-stone-100 p-0">
            {ingredient.recipes.map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-4 py-3">
                {r.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image_url} alt="" loading="lazy" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-stone-100" />
                )}
                <Link href={`/admin/recetas/${r.id}`} className="flex-1 font-medium text-stone-900 hover:text-orange-700">
                  {r.title}
                </Link>
                <span className="text-sm text-stone-500">
                  {formatQuantity(r.quantity, r.unit)}
                  {r.optional && " · opcional"}
                </span>
                <Link href={`/receta/${r.slug}`} className="text-sm text-stone-500 hover:underline">
                  Ver
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
