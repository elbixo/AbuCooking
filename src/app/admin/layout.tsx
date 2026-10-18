import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return (
    <div className="mx-auto max-w-5xl">
      <nav className="mb-8 flex gap-6 border-b border-stone-200 text-sm font-medium">
        <Link href="/admin/recetas" className="-mb-px border-b-2 border-transparent pb-3 hover:border-orange-400">
          Recetas
        </Link>
        <Link href="/admin/ingredientes" className="-mb-px border-b-2 border-transparent pb-3 hover:border-orange-400">
          Ingredientes
        </Link>
        <Link href="/admin/usuarios" className="-mb-px border-b-2 border-transparent pb-3 hover:border-orange-400">
          Usuarios
        </Link>
      </nav>
      {children}
    </div>
  );
}
