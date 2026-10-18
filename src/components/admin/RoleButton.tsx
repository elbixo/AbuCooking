"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUserRole } from "@/app/admin/actions";
import type { AdminUser } from "@/lib/admin";

export default function RoleButton({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const makeAdmin = user.role !== "admin";

  async function onClick() {
    const question = makeAdmin
      ? `¿Dar permisos de administrador a ${user.email}?`
      : isSelf
        ? "¿Quitarte a ti mismo los permisos de administrador? Perderás el acceso a este panel."
        : `¿Quitar los permisos de administrador a ${user.email}?`;
    if (!confirm(question)) return;
    setBusy(true);
    const res = await setUserRole(user.id, makeAdmin ? "admin" : "user");
    setBusy(false);
    if (!res.ok) alert(res.error);
    else router.refresh();
  }

  return (
    <button onClick={onClick} disabled={busy} className="text-sm text-orange-700 hover:underline disabled:opacity-50">
      {busy ? "Guardando…" : makeAdmin ? "Hacer administrador" : "Quitar administrador"}
    </button>
  );
}
