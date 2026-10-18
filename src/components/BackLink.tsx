"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { hasInternalHistory } from "./NavigationTracker";

// "Volver" a la página anterior dentro de la web (¡A cocinar!, búsqueda, favoritas…).
// Si se ha llegado desde fuera (enlace compartido), va a la página indicada.
export default function BackLink({ fallback, label = "Volver" }: { fallback: string; label?: string }) {
  const router = useRouter();
  return (
    <Link
      href={fallback}
      onClick={(e) => {
        if (hasInternalHistory()) {
          e.preventDefault();
          router.back();
        }
      }}
      className="text-sm text-orange-600 hover:underline"
    >
      ← {label}
    </Link>
  );
}
