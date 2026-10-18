"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { setFavorite } from "@/lib/favorites";

export async function toggleFavorite(
  recipeId: number,
  favorite: boolean,
): Promise<{ ok: true } | { ok: false; error: string; needsLogin?: boolean }> {
  if (!(await getCurrentUser())) return { ok: false, error: "Inicia sesión para guardar favoritas", needsLogin: true };
  try {
    await setFavorite(recipeId, favorite);
    revalidatePath("/favoritas");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
