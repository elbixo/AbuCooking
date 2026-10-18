"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/supabase-admin";
import {
  LOCALES,
  adminEnabled,
  type ActionResult,
  type AdminIngredient,
  type IngredientInput,
  type RecipeInput,
} from "@/lib/admin";

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  if (!adminEnabled()) return { ok: false, error: "La administración está desactivada." };
  try {
    const data = await fn();
    revalidatePath("/", "layout");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function saveIngredient(input: IngredientInput): Promise<ActionResult<AdminIngredient>> {
  const missing = LOCALES.filter((l) => !input.translations[l]?.name.trim());
  if (missing.length) {
    return { ok: false, error: `Falta el nombre en: ${missing.join(", ").toUpperCase()}` };
  }
  return run(async () => {
    const id = await adminDb.saveIngredient(input);
    const saved = (await adminDb.listIngredients()).find((i) => i.id === id);
    if (!saved) throw new Error("No se encontró el ingrediente guardado");
    return saved;
  });
}

export async function saveRecipe(input: RecipeInput): Promise<ActionResult<number>> {
  if (!input.translations.es.title.trim()) {
    return { ok: false, error: "El título en español es obligatorio" };
  }
  if (input.ingredients.length === 0) {
    return { ok: false, error: "Añade al menos un ingrediente" };
  }
  return run(() => adminDb.saveRecipe(input));
}

export async function deleteRecipe(id: number): Promise<ActionResult<null>> {
  return run(() => adminDb.deleteRecipe(id));
}

export async function deleteIngredient(id: number): Promise<ActionResult<null>> {
  return run(() => adminDb.deleteIngredient(id));
}
