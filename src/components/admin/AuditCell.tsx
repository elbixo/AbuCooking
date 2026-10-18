import type { Audit } from "@/lib/admin";
import { auditWho, formatAuditDate } from "./AuditInfo";

// Celda "Última modificación" de los listados del panel
export default function AuditCell({ audit }: { audit: Audit }) {
  if (!audit.updated_at) return <span className="text-stone-300">—</span>;
  return (
    <span title={`Creado: ${formatAuditDate(audit.created_at)} · ${auditWho(audit.created_at, audit.created_by_email)}`}>
      <span className="block whitespace-nowrap text-stone-700">{formatAuditDate(audit.updated_at, "short")}</span>
      <span className="block max-w-44 truncate text-xs text-stone-400">{auditWho(audit.updated_at, audit.updated_by_email)}</span>
    </span>
  );
}
