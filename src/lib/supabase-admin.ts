import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { AdminIngredient, AdminIngredientDetail, AdminRecipe, AdminRecipeSummary, AdminUser, Role } from "./admin";

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
  getIngredient: (id: number) => rpc<AdminIngredientDetail | null>("admin_get_ingredient", { p_id: id }),
  getRecipe: (id: number) => rpc<AdminRecipe | null>("admin_get_recipe", { p_id: id }),
  saveIngredient: (p: unknown) => rpc<number>("admin_save_ingredient", { p }),
  saveRecipe: (p: unknown) => rpc<number>("admin_save_recipe", { p }),
  deleteRecipe: (id: number) => rpc<null>("admin_delete_recipe", { p_id: id }),
  deleteIngredient: (id: number) => rpc<null>("admin_delete_ingredient", { p_id: id }),
  userRole: (userId: string) => rpc<Role | null>("user_role", { p_user_id: userId }),
  listUsers: () => rpc<AdminUser[]>("admin_list_users"),
  setRole: (userId: string, role: Role) => rpc<null>("admin_set_role", { p_user_id: userId, p_role: role }),
};

const BUCKET = "recipe-images";

export const adminStorage = {
  async upload(file: File): Promise<string> {
    const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const storage = client().storage.from(BUCKET);
    const { error } = await storage.upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);
    return storage.getPublicUrl(path).data.publicUrl;
  },

  // Borra la imagen si es nuestra (ignora URLs externas y errores: no debe bloquear el guardado)
  async remove(publicUrl: string | null | undefined): Promise<void> {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = publicUrl?.indexOf(marker) ?? -1;
    if (!publicUrl || idx < 0) return;
    await client().storage.from(BUCKET).remove([publicUrl.slice(idx + marker.length)]);
  },
};
