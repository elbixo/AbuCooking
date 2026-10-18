// Tipos y utilidades compartidas por el panel de administración (cliente y servidor)

export const LOCALES = ["es", "fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  es: "Español",
  fr: "Francés",
  en: "Inglés",
};

// Quién y cuándo creó / modificó por última vez (null = sin datos o importación)
export type Audit = {
  created_at: string | null;
  created_by_email: string | null;
  updated_at: string | null;
  updated_by_email: string | null;
};

export type AdminIngredient = Audit & {
  id: number;
  slug: string;
  is_pantry: boolean;
  translations: Partial<Record<Locale, { name: string; synonyms: string[] }>>;
  recipe_count: number;
};

export type AdminRecipeSummary = Audit & {
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

export type AdminRecipe = Audit & {
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

export type Role = "admin" | "user";

export type AdminUser = {
  id: string;
  email: string;
  role: Role;
  created_at: string;
};

export function ingredientLabel(i: Pick<AdminIngredient, "slug" | "translations">): string {
  return i.translations.es?.name ?? i.translations.en?.name ?? i.translations.fr?.name ?? i.slug;
}
