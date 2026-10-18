// Tipos y utilidades compartidas por el panel de administración (cliente y servidor)

export const LOCALES = ["es", "fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  es: "Español",
  fr: "Francés",
  en: "Inglés",
};

export type AdminIngredient = {
  id: number;
  slug: string;
  is_pantry: boolean;
  translations: Partial<Record<Locale, { name: string; synonyms: string[] }>>;
  recipe_count: number;
};

export type AdminRecipeSummary = {
  id: number;
  slug: string;
  prep_minutes: number | null;
  servings: number | null;
  image_url: string | null;
  titles: Partial<Record<Locale, string>>;
  ingredient_count: number;
};

export type AdminIngredientDetail = AdminIngredient & {
  recipes: {
    id: number;
    slug: string;
    title: string;
    image_url: string | null;
    quantity: number | null;
    unit: string | null;
    optional: boolean;
  }[];
};

export type AdminRecipe = {
  id: number;
  slug: string;
  prep_minutes: number | null;
  servings: number | null;
  image_url: string | null;
  translations: Partial<Record<Locale, { title: string; description: string | null; steps: string[] }>>;
  ingredients: {
    ingredient_id: number;
    quantity: number | null;
    unit: string | null;
    optional: boolean;
  }[];
};

export type IngredientInput = {
  id?: number;
  slug: string;
  is_pantry: boolean;
  translations: Record<Locale, { name: string; synonyms: string[] }>;
};

export type RecipeInput = {
  id?: number;
  slug: string;
  prep_minutes: number | null;
  servings: number | null;
  image_url: string | null;
  translations: Record<Locale, { title: string; description: string; steps: string[] }>;
  ingredients: { ingredient_id: number; quantity: number | null; unit: string; optional: boolean }[];
};

export const IMAGE_MAX_BYTES = 512 * 1024;

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

// Sin autenticación todavía: el panel solo funciona en local (npm run dev),
// salvo que se active explícitamente con ADMIN_ENABLED=true.
export function adminEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ADMIN_ENABLED === "true";
}

export function ingredientLabel(i: Pick<AdminIngredient, "slug" | "translations">): string {
  return i.translations.es?.name ?? i.translations.en?.name ?? i.translations.fr?.name ?? i.slug;
}
