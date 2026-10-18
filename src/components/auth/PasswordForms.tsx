"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { changePassword, requestPasswordReset, setNewPassword, type AuthState } from "@/app/auth/actions";

function Feedback({ state }: { state: AuthState }) {
  if (state.error) return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>;
  if (state.message) return <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{state.message}</p>;
  return null;
}

function NewPasswordFields() {
  return (
    <>
      <label className="block text-sm">
        Contraseña nueva
        <input name="password" type="password" required minLength={6} autoComplete="new-password" className="input mt-1" />
      </label>
      <label className="block text-sm">
        Repite la contraseña nueva
        <input name="password2" type="password" required minLength={6} autoComplete="new-password" className="input mt-1" />
      </label>
    </>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, {});

  if (state.message) return <p className="card text-sm leading-relaxed text-green-800">{state.message}</p>;

  return (
    <form action={action} className="card space-y-4">
      <p className="text-sm text-stone-600">Escribe tu email y te enviaremos un enlace para elegir una contraseña nueva.</p>
      <label className="block text-sm">
        Email
        <input name="email" type="email" required autoComplete="email" defaultValue={state.email} className="input mt-1" />
      </label>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Enviando…" : "Enviar enlace"}
      </button>
      <p className="text-center text-sm">
        <Link href="/login" className="text-orange-700 hover:underline">
          Volver a entrar
        </Link>
      </p>
    </form>
  );
}

export function SetNewPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(setNewPassword, {});
  return (
    <form action={action} className="card space-y-4">
      <NewPasswordFields />
      <Feedback state={state} />
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(changePassword, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Vacía los campos tras un cambio correcto
  useEffect(() => {
    if (state.message) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <label className="block text-sm">
        Contraseña actual
        <input name="current" type="password" required autoComplete="current-password" className="input mt-1" />
      </label>
      <NewPasswordFields />
      <Feedback state={state} />
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
