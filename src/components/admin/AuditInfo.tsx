import type { Audit } from "@/lib/admin";

// Fechas en hora de España (el servidor de Vercel trabaja en UTC)
const full = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Madrid" });
const short = new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeZone: "Europe/Madrid" });

export function formatAuditDate(date: string | null, style: "full" | "short" = "full"): string {
  return date ? (style === "full" ? full : short).format(new Date(date)) : "—";
}

// Sin email pero con fecha = lo hizo el script de importación
export function auditWho(date: string | null, email: string | null): string {
  if (email) return email;
  return date ? "Importación" : "—";
}

// Recuadro con quién creó y modificó por última vez (en las páginas de edición)
export default function AuditInfo({ audit }: { audit: Audit }) {
  const rows = [
    { label: "Creado", date: audit.created_at, who: auditWho(audit.created_at, audit.created_by_email) },
    { label: "Última modificación", date: audit.updated_at, who: auditWho(audit.updated_at, audit.updated_by_email) },
  ];
  return (
    <section className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm" aria-label="Auditoría">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Auditoría</h2>
      <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-[auto_1fr]">
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <dt className="text-stone-500">{r.label}</dt>
            <dd className="text-stone-800">
              {r.date ? (
                <>
                  {formatAuditDate(r.date)} · <span className="font-medium">{r.who}</span>
                </>
              ) : (
                <span className="text-stone-400">Sin datos (anterior a la auditoría)</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
