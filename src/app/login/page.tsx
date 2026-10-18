import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { getCurrentUser, safeNext } from "@/lib/auth";

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  if (await getCurrentUser()) redirect(safeNext(next));

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Entrar</h1>
      <AuthForm
        mode="login"
        next={next}
        initialError={error === "enlace" ? "El enlace no es válido o ha caducado. Inténtalo de nuevo." : undefined}
      />
    </div>
  );
}
