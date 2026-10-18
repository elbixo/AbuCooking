"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { adminDb, adminStorage } from "@/lib/supabase-admin";
import {
  IMAGE_MAX_BYTES,
  LOCALES,
  type ActionResult,
  type AdminIngredient,
  type IngredientInput,
  type RecipeInput,
  type Role,
} from "@/lib/admin";

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  if (!(await isAdmin())) return { ok: false, error: "No tienes permiso de administrador." };
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
  return run(async () => {
    const previous = input.id ? await adminDb.getRecipe(input.id) : null;
    const id = await adminDb.saveRecipe(input);
    if (previous?.image_url && previous.image_url !== input.image_url) {
      await adminStorage.remove(previous.image_url);
    }
    return id;
  });
}

export async function deleteRecipe(id: number): Promise<ActionResult<null>> {
  return run(async () => {
    const recipe = await adminDb.getRecipe(id);
    await adminDb.deleteRecipe(id);
    await adminStorage.remove(recipe?.image_url);
    return null;
  });
}

// Recibe la imagen ya reducida en el navegador y devuelve su URL pública
export async function uploadRecipeImage(formData: FormData): Promise<ActionResult<string>> {
  const file = formData.get("file");
  if (!(file instanceof File) || !["image/webp", "image/jpeg", "image/png"].includes(file.type)) {
    return { ok: false, error: "Formato de imagen no válido" };
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return { ok: false, error: `La imagen ocupa ${Math.round(file.size / 1024)} KB (máximo ${IMAGE_MAX_BYTES / 1024} KB)` };
  }
  return run(() => adminStorage.upload(file));
}

export async function deleteIngredient(id: number): Promise<ActionResult<null>> {
  return run(() => adminDb.deleteIngredient(id));
}

export async function setUserRole(userId: string, role: Role): Promise<ActionResult<null>> {
  return run(() => adminDb.setRole(userId, role));
}
