import { LOCALES, type Locale } from "@/lib/admin";

// ES FR EN en verde si existe esa traducción, en gris si falta
export default function TranslationBadges({ present }: { present: Partial<Record<Locale, unknown>> }) {
  return (
    <span className="flex gap-1">
      {LOCALES.map((l) => (
        <span
          key={l}
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
            present[l] ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-400"
          }`}
        >
          {l}
        </span>
      ))}
    </span>
  );
}
