import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { inviteCode } from "@/lib/site";

type Props = { searchParams: Promise<{ codigo?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  if (await getCurrentUser()) redirect("/");
  const { codigo } = await searchParams;
  const askInvite = inviteCode() !== null;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-2 text-2xl font-bold text-stone-900">Crear cuenta</h1>
      {askInvite && (
        <p className="mb-6 text-sm text-stone-500">
          AbuCooking está en pruebas privadas: necesitas el código que te ha enviado quien te invitó.
        </p>
      )}
      <AuthForm mode="register" askInvite={askInvite} invite={codigo} />
    </div>
  );
}
