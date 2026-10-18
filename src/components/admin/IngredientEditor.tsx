"use client";

import { useRouter } from "next/navigation";
import IngredientForm from "./IngredientForm";
import type { AdminIngredient } from "@/lib/admin";

// Versión de página completa del formulario: al guardar vuelve al listado
export default function IngredientEditor({ initial }: { initial?: AdminIngredient }) {
  const router = useRouter();
  return (
    <IngredientForm
      initial={initial}
      onSaved={() => router.push("/admin/ingredientes")}
      onCancel={() => router.push("/admin/ingredientes")}
    />
  );
}
