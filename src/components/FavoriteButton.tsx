"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useConfirm } from "./ui/ConfirmProvider";
import { toggleFavorite } from "@/app/favoritas/actions";

type Props = {
  recipeId: number;
  recipeTitle: string;
  initial: boolean;
  loggedIn: boolean;
  size?: "sm" | "lg";
  // Para quitarla de la lista de favoritas al desmarcarla
  onRemoved?: () => void;
};

// Corazón para guardar/quitar una receta de favoritas, con confirmación.
// Tras confirmar cambia al instante y, si falla en el servidor, vuelve atrás.
export default function FavoriteButton({ recipeId, recipeTitle, initial, loggedIn, size = "sm", onRemoved }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const confirm = useConfirm();
  const [favorite, setFavorite] = useState(initial);
  const [pending, startTransition] = useTransition();

  // Si la página se vuelve a pintar con datos nuevos del servidor, manda lo guardado
  useEffect(() => setFavorite(initial), [initial]);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn) {
      const here = pathname + (params.size ? `?${params}` : "");
      router.push(`/login?next=${encodeURIComponent(here)}`);
      return;
    }
    const ok = await confirm({
      title: favorite ? "¿Quitar de favoritas?" : "¿Añadir a favoritas?",
      message: favorite
        ? `«${recipeTitle}» dejará de estar en Mis favoritas.`
        : `«${recipeTitle}» se guardará en Mis favoritas.`,
      confirmLabel: favorite ? "Quitar" : "Añadir",
      danger: favorite,
    });
    if (ok) apply();
  }

  function apply() {
    const next = !favorite;
    setFavorite(next);
    startTransition(async () => {
      const res = await toggleFavorite(recipeId, next);
      if (!res.ok) {
        setFavorite(!next);
        alert(res.error);
      } else {
        if (!next) onRemoved?.();
        router.refresh();
      }
    });
  }

  const label = favorite ? "Quitar de favoritas" : "Guardar en favoritas";
  const dims = size === "lg" ? "h-11 w-11" : "h-9 w-9";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={favorite}
      aria-label={label}
      title={label}
      className={`${dims} flex shrink-0 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-stone-200 backdrop-blur transition hover:scale-110 hover:ring-orange-300 disabled:opacity-70`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={`${size === "lg" ? "h-6 w-6" : "h-5 w-5"} transition-colors ${
          favorite ? "fill-red-500 stroke-red-500" : "fill-none stroke-stone-500"
        }`}
        strokeWidth={2}
        strokeLinejoin="round"
      >
        <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3.2 4.5 6.9 4.5c2.1 0 3.6 1.1 5.1 2.9 1.5-1.8 3-2.9 5.1-2.9 3.7 0 6 3.7 4.5 7.2C19.5 16.4 12 21 12 21z" />
      </svg>
    </button>
  );
}
