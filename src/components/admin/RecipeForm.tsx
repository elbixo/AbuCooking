"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import IngredientCombobox from "./IngredientCombobox";
import IngredientForm from "./IngredientForm";
import ImageField from "./ImageField";
import { saveRecipe } from "@/app/admin/actions";
import {
  LOCALES,
  LOCALE_LABELS,
  ingredientLabel,
  type AdminIngredient,
  type AdminRecipe,
  type Locale,
} from "@/lib/admin";
import { slugify } from "@/lib/text";

const UNITS = ["ud", "g", "kg", "ml", "l", "cda", "cdta", "diente", "dientes", "hoja", "rama", "pizca", "lata", "latas", "rebanada", "piel"];

type Row = { ingredient_id: number; quantity: string; unit: string; optional: boolean };
type Texts = Record<Locale, { title: string; description: string; steps: string }>;

type Props = {
  initial?: AdminRecipe;
  ingredients: AdminIngredient[];
};

export default function RecipeForm({ initial, ingredients: initialIngredients }: Props) {
  const router = useRouter();
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [prepMinutes, setPrepMinutes] = useState(initial?.prep_minutes?.toString() ?? "");
  const [servings, setServings] = useState(initial?.servings?.toString() ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [tab, setTab] = useState<Locale>("es");
  const [texts, setTexts] = useState<Texts>(() => {
    const t = {} as Texts;
    for (const l of LOCALES) {
      const tr = initial?.translations[l];
      t[l] = { title: tr?.title ?? "", description: tr?.description ?? "", steps: tr?.steps.join("\n") ?? "" };
    }
    return t;
  });
  const [rows, setRows] = useState<Row[]>(
    initial?.ingredients.map((r) => ({
      ingredient_id: r.ingredient_id,
      quantity: r.quantity?.toString() ?? "",
      unit: r.unit ?? "",
      optional: r.optional,
    })) ?? [],
  );
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const byId = new Map(ingredients.map((i) => [i.id, i]));

  function setText(locale: Locale, key: keyof Texts[Locale], value: string) {
    setTexts((prev) => ({ ...prev, [locale]: { ...prev[locale], [key]: value } }));
    if (!slugTouched && locale === "es" && key === "title") setSlug(slugify(value));
  }

  function addRow(ingredientId: number) {
    setRows((prev) =>
      prev.some((r) => r.ingredient_id === ingredientId)
        ? prev
        : [...prev, { ingredient_id: ingredientId, quantity: "", unit: "", optional: false }],
    );
  }

  function updateRow(idx: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function moveRow(idx: number, delta: number) {
    setRows((prev) => {
      const next = [...prev];
      const target = idx + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const badQty = rows.find((r) => r.quantity.trim() && isNaN(Number(r.quantity.replace(",", "."))));
    if (badQty) {
      setError(`Cantidad no válida para «${ingredientLabel(byId.get(badQty.ingredient_id)!)}»`);
      return;
    }
    setSaving(true);
    const translations = {} as Record<Locale, { title: string; description: string; steps: string[] }>;
    for (const l of LOCALES) {
      translations[l] = {
        title: texts[l].title.trim(),
        description: texts[l].description.trim(),
        steps: texts[l].steps.split("\n").map((s) => s.trim()).filter(Boolean),
      };
    }
    const res = await saveRecipe({
      id: initial?.id,
      slug: slug || slugify(translations.es.title),
      prep_minutes: prepMinutes ? Number(prepMinutes) : null,
      servings: servings ? Number(servings) : null,
      image_url: imageUrl.trim() || null,
      translations,
      ingredients: rows.map((r) => ({
        ingredient_id: r.ingredient_id,
        quantity: r.quantity.trim() ? Number(r.quantity.replace(",", ".")) : null,
        unit: r.unit.trim(),
        optional: r.optional,
      })),
    });
    setSaving(false);
    if (res.ok) router.push("/admin/recetas");
    else setError(res.error);
  }

  const filled = (l: Locale) => texts[l].title.trim() !== "";

  return (
    <>
      <form onSubmit={submit} className="space-y-8">
        <section className="card grid gap-4 sm:grid-cols-4">
          <label className="block text-sm sm:col-span-2">
            Identificador (URL)
            <input
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugTouched(true);
              }}
              placeholder="se genera del título"
              className="input mt-1 font-mono text-xs"
            />
          </label>
          <label className="block text-sm">
            Tiempo (min)
            <input type="number" min={0} value={prepMinutes} onChange={(e) => setPrepMinutes(e.target.value)} className="input mt-1" />
          </label>
          <label className="block text-sm">
            Raciones
            <input type="number" min={1} value={servings} onChange={(e) => setServings(e.target.value)} className="input mt-1" />
          </label>
          <div className="text-sm sm:col-span-4">
            <p className="mb-2">
              Imagen <span className="text-stone-400">(opcional)</span>
            </p>
            <ImageField value={imageUrl} onChange={setImageUrl} />
          </div>
        </section>

        <section className="card">
          <div className="mb-4 flex gap-1 border-b border-stone-200">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setTab(l)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                  tab === l ? "border-orange-500 text-orange-700" : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                {LOCALE_LABELS[l]}
                {l === "es" && " *"}
                <span className={`ml-2 inline-block h-2 w-2 rounded-full ${filled(l) ? "bg-green-500" : "bg-stone-300"}`} />
              </button>
            ))}
          </div>
          <div className="space-y-4">
            <label className="block text-sm">
              Título {tab === "es" && "*"}
              <input
                value={texts[tab].title}
                onChange={(e) => setText(tab, "title", e.target.value)}
                required={tab === "es"}
                className="input mt-1"
              />
            </label>
            <label className="block text-sm">
              Descripción breve
              <input value={texts[tab].description} onChange={(e) => setText(tab, "description", e.target.value)} className="input mt-1" />
            </label>
            <label className="block text-sm">
              Pasos <span className="text-stone-400">(uno por línea)</span>
              <textarea
                value={texts[tab].steps}
                onChange={(e) => setText(tab, "steps", e.target.value)}
                rows={8}
                className="input mt-1 font-normal leading-relaxed"
              />
            </label>
            {tab !== "es" && (
              <p className="text-xs text-stone-500">
                Si dejas el título vacío, la receta no aparecerá en {LOCALE_LABELS[tab].toLowerCase()}.
              </p>
            )}
          </div>
        </section>

        <section className="card">
          <h2 className="mb-3 font-semibold text-stone-900">Ingredientes *</h2>
          {rows.length > 0 && (
            <ul className="mb-4 divide-y divide-stone-100">
              {rows.map((r, idx) => {
                const ing = byId.get(r.ingredient_id);
                return (
                  <li key={r.ingredient_id} className="flex flex-wrap items-center gap-2 py-2">
                    <span className="min-w-36 flex-1 font-medium first-letter:uppercase">
                      {ing ? ingredientLabel(ing) : `#${r.ingredient_id}`}
                      {ing?.is_pantry && <span className="ml-2 text-xs font-normal text-stone-400">despensa</span>}
                    </span>
                    <input
                      value={r.quantity}
                      onChange={(e) => updateRow(idx, { quantity: e.target.value })}
                      placeholder="al gusto"
                      inputMode="decimal"
                      className="input w-24"
                      aria-label="Cantidad"
                    />
                    <input
                      value={r.unit}
                      onChange={(e) => updateRow(idx, { unit: e.target.value })}
                      list="units"
                      placeholder="unidad"
                      className="input w-28"
                      aria-label="Unidad"
                    />
                    <label className="flex items-center gap-1 text-sm text-stone-600">
                      <input type="checkbox" checked={r.optional} onChange={(e) => updateRow(idx, { optional: e.target.checked })} />
                      opcional
                    </label>
                    <span className="flex gap-1">
                      <button type="button" onClick={() => moveRow(idx, -1)} className="icon-btn" aria-label="Subir">↑</button>
                      <button type="button" onClick={() => moveRow(idx, 1)} className="icon-btn" aria-label="Bajar">↓</button>
                      <button
                        type="button"
                        onClick={() => setRows((prev) => prev.filter((_, i) => i !== idx))}
                        className="icon-btn text-red-600"
                        aria-label="Quitar"
                      >
                        ×
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <datalist id="units">
            {UNITS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
          <IngredientCombobox
            ingredients={ingredients}
            excludeIds={rows.map((r) => r.ingredient_id)}
            onSelect={(i) => addRow(i.id)}
            onCreate={(name) => setCreating(name)}
          />
        </section>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Guardando…" : initial ? "Guardar cambios" : "Crear receta"}
          </button>
          <button type="button" onClick={() => router.push("/admin/recetas")} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>

      {creating !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true">
            <h2 className="mb-1 text-lg font-semibold text-stone-900">Nuevo ingrediente</h2>
            <p className="mb-4 text-sm text-stone-500">
              «{creating}» no existe todavía. Rellena su nombre en los tres idiomas para añadirlo.
            </p>
            <IngredientForm
              initialName={creating}
              onSaved={(ing) => {
                setIngredients((prev) => [...prev, ing]);
                addRow(ing.id);
                setCreating(null);
              }}
              onCancel={() => setCreating(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
