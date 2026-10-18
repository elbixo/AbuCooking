import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { AdminIngredient, AdminRecipe, AdminRecipeSummary } from "./admin";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente con la clave secreta: salta las políticas RLS. Nunca debe llegar al navegador.
function client() {
  if (!url || !key) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local (clave secreta de Supabase: Project Settings → API Keys).",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await client().rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export const adminDb = {
  listIngredients: () => rpc<AdminIngredient[]>("admin_list_ingredients"),
  listRecipes: () => rpc<AdminRecipeSummary[]>("admin_list_recipes"),
  getRecipe: (id: number) => rpc<AdminRecipe | null>("admin_get_recipe", { p_id: id }),
  saveIngredient: (p: unknown) => rpc<number>("admin_save_ingredient", { p }),
  saveRecipe: (p: unknown) => rpc<number>("admin_save_recipe", { p }),
  deleteRecipe: (id: number) => rpc<null>("admin_delete_recipe", { p_id: id }),
  deleteIngredient: (id: number) => rpc<null>("admin_delete_ingredient", { p_id: id }),
};
