"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/admin";

type Props = {
  label: string;
  action: () => Promise<ActionResult<null>>;
};

export default function DeleteButton({ label, action }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!confirm(`¿Seguro que quieres borrar «${label}»? No se puede deshacer.`)) return;
    setBusy(true);
    const res = await action();
    setBusy(false);
    if (res.ok) router.refresh();
    else alert(res.error);
  }

  return (
    <button onClick={onClick} disabled={busy} className="text-sm text-red-600 hover:underline disabled:opacity-50">
      {busy ? "Borrando…" : "Borrar"}
    </button>
  );
}
