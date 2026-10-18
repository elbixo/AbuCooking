import Link from "next/link";
import { notFound } from "next/navigation";
import { adminEnabled } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!adminEnabled()) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-800">
        Administración sin autenticación: solo disponible en local (<code>npm run dev</code>).
      </div>
      <nav className="mb-8 flex gap-6 border-b border-stone-200 text-sm font-medium">
        <Link href="/admin/recetas" className="-mb-px border-b-2 border-transparent pb-3 hover:border-orange-400">
          Recetas
        </Link>
        <Link href="/admin/ingredientes" className="-mb-px border-b-2 border-transparent pb-3 hover:border-orange-400">
          Ingredientes
        </Link>
      </nav>
      {children}
    </div>
  );
}
