import { ForgotPasswordForm } from "@/components/auth/PasswordForms";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Recuperar contraseña</h1>
      <ForgotPasswordForm />
    </div>
  );
}
