import { supabase } from "./supabase";

// De momento solo español; cuando haya traducciones vendrá de la ruta (/es, /fr, /en)
export const LOCALE = "es";

export type Ingredient = {
  id: number;
  name: string;
  synonyms: string[];
  is_pantry: boolean;
};

export type RecipeMatch = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  prep_minutes: number | null;
  servings: number | null;
  image_url: string | null;
  total: number;
  matched: number;
  missing: string[];
};

// Datos básicos de una receta para listados (búsqueda por texto, favoritas)
export type RecipeSummary = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  prep_minutes: number | null;
  servings: number | null;
  image_url: string | null;
};

export type RecipeDetail = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  steps: string[];
  prep_minutes: number | null;
  servings: number | null;
  image_url: string | null;
  ingredients: {
    id: number;
    name: string;
    quantity: number | null;
    unit: string | null;
    optional: boolean;
    is_pantry: boolean;
  }[];
};

export async function listIngredients(): Promise<Ingredient[]> {
  const { data, error } = await supabase.rpc("list_ingredients", { p_locale: LOCALE });
  if (error) throw error;
  return data;
}

// onlyComplete: solo recetas que se pueden hacer sin comprar nada
export async function searchRecipes(ingredientIds: number[], onlyComplete = false): Promise<RecipeMatch[]> {
  if (ingredientIds.length === 0) return [];
  const { data, error } = await supabase.rpc("search_recipes", {
    p_ingredient_ids: ingredientIds,
    p_locale: LOCALE,
    p_only_complete: onlyComplete,
  });
  if (error) throw error;
  return data;
}

// Búsqueda por texto en título, descripción, ingredientes y pasos (sin texto: todas)
export async function searchRecipesText(query: string): Promise<RecipeSummary[]> {
  const { data, error } = await supabase.rpc("search_recipes_text", { p_query: query, p_locale: LOCALE });
  if (error) throw error;
  return data;
}

export async function getRecipe(slug: string): Promise<RecipeDetail | null> {
  const { data, error } = await supabase.rpc("get_recipe", { p_slug: slug, p_locale: LOCALE });
  if (error) throw error;
  return data;
}

// Query string de una búsqueda: "?i=3,7,12" (+ "&solo=1" si es solo con lo que tengo)
export function searchQuery(ids: Iterable<number>, onlyComplete: boolean): string {
  const list = [...ids];
  if (list.length === 0) return "";
  return `?i=${list.join(",")}${onlyComplete ? "&solo=1" : ""}`;
}

// "?i=3,7,12" -> [3, 7, 12]
export function parseIds(param: string | string[] | undefined): number[] {
  const raw = Array.isArray(param) ? param[0] : param;
  if (!raw) return [];
  return [...new Set(raw.split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0))];
}
