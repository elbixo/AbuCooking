// Importa recetas (y los ingredientes que falten) desde data/ a Supabase.
//
//   npm run importar-recetas              -> importa las recetas nuevas
//   npm run importar-recetas:prueba      -> solo comprueba y muestra qué haría
//   npm run importar-recetas:actualizar
//                                          -> además sobrescribe las recetas que ya existen
//                                             (conserva sus traducciones al francés e inglés)
//
// Se puede ejecutar las veces que haga falta: no duplica recetas ni ingredientes.
// Necesita NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (en .env.local).

import { readdir } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import dictionary from "../data/ingredientes.mjs";

const DRY_RUN = process.argv.includes("--prueba");
const UPDATE = process.argv.includes("--actualizar");
const LOCALES = ["es", "fr", "en"];

const normalize = (s) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

// --- 1. Cargar y validar los datos -------------------------------------------------

async function loadRecipes() {
  const dir = new URL("../data/recetas/", import.meta.url);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mjs")).sort();
  const recipes = [];
  for (const file of files) {
    const { default: list } = await import(new URL(file, dir));
    list.forEach((r) => recipes.push({ ...r, file }));
  }
  return recipes;
}

function validate(recipes) {
  const errors = [];
  const slugs = new Set();
  for (const r of recipes) {
    const where = `${r.file} › ${r.slug ?? "(sin slug)"}`;
    if (!r.slug || !/^[a-z0-9-]+$/.test(r.slug)) errors.push(`${where}: slug no válido`);
    if (slugs.has(r.slug)) errors.push(`${where}: slug repetido`);
    slugs.add(r.slug);
    if (!r.title?.trim()) errors.push(`${where}: falta el título`);
    if (!Array.isArray(r.steps) || r.steps.length === 0) errors.push(`${where}: no tiene pasos`);
    if (!Array.isArray(r.ingredients) || r.ingredients.length === 0) errors.push(`${where}: no tiene ingredientes`);
    const seen = new Set();
    for (const [slug, quantity] of r.ingredients ?? []) {
      if (!dictionary[slug]) errors.push(`${where}: ingrediente «${slug}» no está en data/ingredientes.mjs`);
      if (seen.has(slug)) errors.push(`${where}: ingrediente «${slug}» repetido`);
      if (quantity != null && (typeof quantity !== "number" || quantity <= 0)) {
        errors.push(`${where}: cantidad no válida para «${slug}»`);
      }
      seen.add(slug);
    }
  }
  return errors;
}

// --- 2. Conexión ------------------------------------------------------------------

function connect() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("✖ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. ¿Has ejecutado con npm run (que carga .env.local)?");
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });
  return async (fn, args) => {
    const { data, error } = await db.rpc(fn, args);
    if (error) throw new Error(`${fn}: ${error.message}`);
    return data;
  };
}

// --- 3. Ingredientes: reutilizar los existentes y crear los que falten -------------

async function syncIngredients(rpc, usedSlugs) {
  const existing = await rpc("admin_list_ingredients");
  const bySlug = new Map(existing.map((i) => [i.slug, i]));
  const byName = new Map(existing.filter((i) => i.translations.es).map((i) => [normalize(i.translations.es.name), i]));

  const ids = new Map();
  const stats = { reused: 0, created: 0, translated: 0 };

  for (const slug of usedSlugs) {
    const [es, fr, en, synonyms = [], pantry = false] = dictionary[slug];
    const wanted = { es: { name: es, synonyms }, fr: { name: fr, synonyms: [] }, en: { name: en, synonyms: [] } };
    // Mismo slug o mismo nombre en español = mismo ingrediente
    const found = bySlug.get(slug) ?? byName.get(normalize(es));

    if (found) {
      ids.set(slug, found.id);
      stats.reused++;
      // Añade solo las traducciones que falten; lo existente no se toca
      const missing = LOCALES.filter((l) => !found.translations[l]);
      if (missing.length) {
        const translations = { ...found.translations };
        missing.forEach((l) => (translations[l] = wanted[l]));
        if (!DRY_RUN) {
          await rpc("admin_save_ingredient", {
            p: { id: found.id, slug: found.slug, is_pantry: found.is_pantry, translations },
          });
        }
        stats.translated++;
      }
    } else {
      if (DRY_RUN) {
        ids.set(slug, -1);
      } else {
        const id = await rpc("admin_save_ingredient", { p: { slug, is_pantry: pantry, translations: wanted } });
        ids.set(slug, id);
      }
      stats.created++;
      console.log(`  + ingrediente nuevo: ${es}`);
    }
  }
  return { ids, stats };
}

// --- 4. Recetas -------------------------------------------------------------------

async function importRecipes(rpc, recipes, ingredientIds) {
  const existing = await rpc("admin_list_recipes");
  const bySlug = new Map(existing.map((r) => [r.slug, r]));
  const stats = { created: 0, updated: 0, skipped: 0 };

  for (const [n, r] of recipes.entries()) {
    const prefix = `[${String(n + 1).padStart(3)}/${recipes.length}]`;
    const current = bySlug.get(r.slug);
    if (current && !UPDATE) {
      stats.skipped++;
      continue;
    }

    // Al actualizar, conserva las traducciones que no sean español
    let translations = { es: { title: r.title, description: r.description ?? "", steps: r.steps } };
    if (current) {
      const full = await rpc("admin_get_recipe", { p_id: current.id });
      translations = { ...full.translations, ...translations };
    }

    const payload = {
      id: current?.id,
      slug: r.slug,
      prep_minutes: r.minutes ?? null,
      servings: r.servings ?? null,
      image_url: current?.image_url ?? null,
      translations,
      ingredients: r.ingredients.map(([slug, quantity = null, unit = null, optional = false]) => ({
        ingredient_id: ingredientIds.get(slug),
        quantity,
        unit,
        optional,
      })),
    };

    if (!DRY_RUN) await rpc("admin_save_recipe", { p: payload });
    if (current) stats.updated++;
    else stats.created++;
    console.log(`${prefix} ${current ? "actualizada" : "nueva"}: ${r.title}`);
  }
  return stats;
}

// --- Principal --------------------------------------------------------------------

const recipes = await loadRecipes();
console.log(`📖 ${recipes.length} recetas en data/recetas/`);

const errors = validate(recipes);
if (errors.length) {
  console.error(`✖ Hay ${errors.length} error(es) en los datos; no se ha importado nada:`);
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log("✔ Datos correctos");
if (DRY_RUN) console.log("🔎 Modo prueba: no se escribirá nada en la base de datos\n");

const rpc = connect();
try {
  const used = [...new Set(recipes.flatMap((r) => r.ingredients.map(([slug]) => slug)))];
  console.log(`\n🥕 Ingredientes (${used.length} distintos)`);
  const { ids, stats: ing } = await syncIngredients(rpc, used);

  console.log("\n🍳 Recetas");
  const rec = await importRecipes(rpc, recipes, ids);

  console.log(`
Resumen${DRY_RUN ? " (modo prueba)" : ""}:
  Ingredientes: ${ing.created} nuevos, ${ing.reused} ya existían (${ing.translated} con traducciones añadidas)
  Recetas:      ${rec.created} nuevas, ${rec.updated} actualizadas, ${rec.skipped} ya existían (sin tocar)`);
} catch (e) {
  console.error(`\n✖ Error: ${e.message}`);
  console.error("Lo importado hasta este punto se ha guardado; puedes volver a ejecutar el script sin duplicar nada.");
  process.exit(1);
}
