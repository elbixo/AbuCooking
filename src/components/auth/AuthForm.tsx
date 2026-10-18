"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";

type Props = { mode: "login" | "register"; next?: string; initialError?: string };

export default function AuthForm({ mode, next, initialError }: Props) {
  const isLogin = mode === "login";
  const [state, action, pending] = useActionState<AuthState, FormData>(isLogin ? signIn : signUp, {
    error: initialError,
  });

  if (state.message) {
    return <p className="card text-sm leading-relaxed text-green-800">{state.message}</p>;
  }

  return (
    <form action={action} className="card space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <label className="block text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.email}
          className="input mt-1"
        />
      </label>
      <label className="block text-sm">
        Contraseña
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={isLogin ? "current-password" : "new-password"}
          className="input mt-1"
        />
      </label>
      {!isLogin && (
        <label className="block text-sm">
          Repite la contraseña
          <input name="password2" type="password" required minLength={6} autoComplete="new-password" className="input mt-1" />
        </label>
      )}

      {isLogin && (
        <p className="-mt-2 text-right text-sm">
          <Link href="/recuperar" className="text-stone-500 hover:text-orange-700 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      )}

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Un momento…" : isLogin ? "Entrar" : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-stone-500">
        {isLogin ? (
          <>
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-orange-700 hover:underline">
              Regístrate
            </Link>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-orange-700 hover:underline">
              Entra
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
