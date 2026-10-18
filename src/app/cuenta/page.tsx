import { redirect } from "next/navigation";
import { signOut } from "../auth/actions";
import { ChangePasswordForm } from "@/components/auth/PasswordForms";
import { getCurrentUser } from "@/lib/auth";

type Props = { searchParams: Promise<{ ok?: string }> };

export default async function AccountPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cuenta");
  const { ok } = await searchParams;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <h1 className="text-2xl font-bold text-stone-900">Mi cuenta</h1>

      {ok === "contrasena" && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">Contraseña guardada correctamente.</p>
      )}

      <section className="card">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-stone-500">Email</dt>
          <dd className="font-medium text-stone-900">{user.email}</dd>
          <dt className="text-stone-500">Tipo de cuenta</dt>
          <dd className="font-medium text-stone-900">{user.role === "admin" ? "Administrador" : "Básica"}</dd>
        </dl>
      </section>

      <section className="card">
        <h2 className="mb-4 font-semibold text-stone-900">Cambiar contraseña</h2>
        <ChangePasswordForm />
      </section>

      <form action={signOut}>
        <button type="submit" className="btn-secondary">
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
