import { redirect } from "next/navigation";
import { SetNewPasswordForm } from "@/components/auth/PasswordForms";
import { getCurrentUser } from "@/lib/auth";

// Se llega aquí desde el enlace del email de recuperación (que ya inicia la sesión)
export default async function NewPasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?error=enlace");

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-2 text-2xl font-bold text-stone-900">Elige una contraseña nueva</h1>
      <p className="mb-6 text-sm text-stone-500">Para {user.email}</p>
      <SetNewPasswordForm />
    </div>
  );
}
