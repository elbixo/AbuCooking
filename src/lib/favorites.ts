import "server-only";
import { LOCALE, type RecipeSummary } from "./data";
import { createSessionClient } from "./supabase-server";

// Se ejecutan con la sesión del usuario: la base de datos (auth.uid() + RLS)
// garantiza que cada uno solo ve y cambia sus propias favoritas.

export type FavoriteRecipe = RecipeSummary & { favorited_at: string };

export async function listFavorites(): Promise<FavoriteRecipe[]> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase.rpc("list_favorites", { p_locale: LOCALE });
  if (error) throw new Error(error.message);
  return data;
}

export async function favoriteIds(): Promise<Set<number>> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase.rpc("favorite_recipe_ids");
  if (error) throw new Error(error.message);
  return new Set(data as number[]);
}

export async function setFavorite(recipeId: number, favorite: boolean): Promise<void> {
  const supabase = await createSessionClient();
  const { error } = await supabase.rpc("set_favorite", { p_recipe_id: recipeId, p_favorite: favorite });
  if (error) throw new Error(error.message);
}
