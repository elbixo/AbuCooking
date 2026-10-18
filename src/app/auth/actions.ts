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
  if (m.includes("should be different")) return "La nueva contraseña debe ser distinta de la actual.";
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

// Comprueba "contraseña" y "repite la contraseña" del formulario
function checkNewPassword(form: FormData): { password: string; error?: string } {
  const password = String(form.get("password") ?? "");
  if (password !== String(form.get("password2") ?? "")) return { password, error: "Las contraseñas no coinciden." };
  if (password.length < 6) return { password, error: "La contraseña debe tener al menos 6 caracteres." };
  return { password };
}

async function origin(): Promise<string> {
  return (await headers()).get("origin") ?? "http://localhost:3000";
}

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim();
  const { password, error: invalid } = checkNewPassword(form);
  if (invalid) return { error: invalid, email };

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${await origin()}/auth/callback` },
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

// Envía el email con el enlace para elegir una contraseña nueva.
// Responde lo mismo exista o no la cuenta, para no revelar qué emails están registrados.
export async function requestPasswordReset(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim();
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/cuenta/nueva-contrasena`,
  });
  if (error && error.message.toLowerCase().includes("rate limit")) return { error: translate(error.message), email };
  return {
    message: `Si existe una cuenta con ${email}, te hemos enviado un email con un enlace para elegir una contraseña nueva.`,
  };
}

// Tras pulsar el enlace del email (ya hay sesión): guarda la contraseña nueva
export async function setNewPassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  const { password, error: invalid } = checkNewPassword(form);
  if (invalid) return { error: invalid };
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "El enlace ha caducado. Pide uno nuevo desde «¿Olvidaste tu contraseña?»." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: translate(error.message) };
  redirect("/cuenta?ok=contrasena");
}

// Cambio de contraseña desde "Mi cuenta": pide la actual para confirmar que eres tú
export async function changePassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  const current = String(form.get("current") ?? "");
  const { password, error: invalid } = checkNewPassword(form);
  if (invalid) return { error: invalid };

  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) redirect("/login?next=/cuenta");

  const check = await supabase.auth.signInWithPassword({ email: data.user.email, password: current });
  if (check.error) return { error: "La contraseña actual no es correcta." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: translate(error.message) };
  return { message: "Contraseña cambiada correctamente." };
}
