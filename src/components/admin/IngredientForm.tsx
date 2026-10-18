"use client";

import { useState } from "react";
import { saveIngredient } from "@/app/admin/actions";
import { LOCALES, LOCALE_LABELS, type AdminIngredient, type Locale } from "@/lib/admin";
import { slugify } from "@/lib/text";

type Props = {
  initial?: AdminIngredient;
  // Prerrelleno al crear desde el formulario de receta
  initialName?: string;
  onSaved: (ingredient: AdminIngredient) => void;
  onCancel?: () => void;
};

type Fields = Record<Locale, { name: string; synonyms: string }>;

export default function IngredientForm({ initial, initialName, onSaved, onCancel }: Props) {
  const [fields, setFields] = useState<Fields>(() => {
    const f = {} as Fields;
    for (const l of LOCALES) {
      const t = initial?.translations[l];
      f[l] = { name: t?.name ?? (l === "es" ? (initialName ?? "") : ""), synonyms: t?.synonyms.join(", ") ?? "" };
    }
    return f;
  });
  const [isPantry, setIsPantry] = useState(initial?.is_pantry ?? false);
  const [slug, setSlug] = useState(initial?.slug ?? slugify(initialName ?? ""));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update(locale: Locale, key: "name" | "synonyms", value: string) {
    setFields((prev) => ({ ...prev, [locale]: { ...prev[locale], [key]: value } }));
    // El identificador se genera a partir del nombre en inglés (o español si aún no hay)
    if (!slugTouched && key === "name" && (locale === "en" || (locale === "es" && !fields.en.name))) {
      setSlug(slugify(value));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const translations = {} as Record<Locale, { name: string; synonyms: string[] }>;
    for (const l of LOCALES) {
      translations[l] = {
        name: fields[l].name.trim(),
        synonyms: fields[l].synonyms.split(",").map((s) => s.trim()).filter(Boolean),
      };
    }
    const res = await saveIngredient({
      id: initial?.id,
      slug: slug || slugify(translations.en.name || translations.es.name),
      is_pantry: isPantry,
      translations,
    });
    setSaving(false);
    if (res.ok) onSaved(res.data);
    else setError(res.error);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {LOCALES.map((l) => (
          <fieldset key={l} className="space-y-2 rounded-xl border border-stone-200 p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
              {LOCALE_LABELS[l]}
            </legend>
            <label className="block text-sm">
              Nombre *
              <input
                value={fields[l].name}
                onChange={(e) => update(l, "name", e.target.value)}
                required
                autoFocus={l === "es" && !initial}
                className="input mt-1"
              />
            </label>
            <label className="block text-sm">
              Sinónimos <span className="text-stone-400">(separados por comas)</span>
              <input
                value={fields[l].synonyms}
                onChange={(e) => update(l, "synonyms", e.target.value)}
                className="input mt-1"
              />
            </label>
          </fieldset>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPantry} onChange={(e) => setIsPantry(e.target.checked)} />
          Básico de despensa <span className="text-stone-400">(se da por hecho que se tiene: sal, aceite…)</span>
        </label>
        <label className="block text-sm">
          Identificador
          <input
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugTouched(true);
            }}
            className="input mt-1 block w-56 font-mono text-xs"
          />
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Guardando…" : initial ? "Guardar cambios" : "Crear ingrediente"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
