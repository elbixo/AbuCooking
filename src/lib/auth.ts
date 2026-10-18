import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "./admin";
import { adminDb } from "./supabase-admin";
import { createSessionClient } from "./supabase-server";

export type CurrentUser = { id: string; email: string; role: Role };

// Usuario de la petición actual (o null). Se cachea durante la petición.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const role = (await adminDb.userRole(data.user.id)) ?? "user";
  return { id: data.user.id, email: data.user.email ?? "", role };
});

// Para páginas: si no hay sesión, al login; si no es admin, a la portada.
export async function requireAdminPage(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  const next = (await headers()).get("x-pathname") ?? "/admin";
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (user.role !== "admin") redirect("/?aviso=sin-permiso");
  return user;
}

export async function isAdmin(): Promise<boolean> {
  return (await getCurrentUser())?.role === "admin";
}

// Evita redirecciones a otros dominios (?next=//malicioso.com)
export function safeNext(next: unknown): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
