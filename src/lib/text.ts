// Minúsculas y sin tildes, para comparar "Calabacin" con "calabacín"
export function normalize(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

const FRACTIONS: Record<number, string> = { 0.25: "¼", 0.5: "½", 0.75: "¾" };

export function formatQuantity(quantity: number | null, unit: string | null): string {
  if (quantity == null) return "al gusto";
  const whole = Math.floor(quantity);
  const frac = FRACTIONS[quantity - whole];
  const n = frac ? `${whole || ""}${frac}` : String(quantity);
  return unit ? `${n} ${unit}` : n;
}

// "Tortilla de Patatas" -> "tortilla-de-patatas"
export function slugify(s: string): string {
  return normalize(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
