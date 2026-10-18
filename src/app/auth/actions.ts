"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNext } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase-server";

export type AuthState = { error?: string; message?: string; email?: string };

// Mensajes de Supabase Auth traducidos
function translate(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "Aún no has confirmado tu email. Revisa tu bandeja de entrada.";
  if (m.includes("already registered")) return "Ya existe una cuenta con ese email.";
  if (m.includes("password should be")) return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("rate limit")) return "Demasiados intentos. Espera unos minutos y vuelve a probar.";
  if (m.includes("invalid") && m.includes("email")) return "El email no es válido.";
  return message;
}

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translate(error.message), email };
  redirect(safeNext(form.get("next")));
}

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (password !== String(form.get("password2") ?? "")) {
    return { error: "Las contraseñas no coinciden.", email };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres.", email };
  }

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: translate(error.message), email };

  // Si Supabase exige confirmar el email, no hay sesión todavía
  if (!data.session) {
    return { message: `Te hemos enviado un email a ${email}. Pulsa el enlace para activar tu cuenta.` };
  }
  redirect("/");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/");
}
