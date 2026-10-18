import { redirect } from "next/navigation";
import FavoritesList from "@/components/FavoritesList";
import { getCurrentUser } from "@/lib/auth";
import { listFavorites } from "@/lib/favorites";

export default async function FavoritesPage() {
  if (!(await getCurrentUser())) redirect("/login?next=/favoritas");
  const favorites = await listFavorites();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Mis favoritas</h1>
        {favorites.length > 0 && (
          <p className="mt-2 text-stone-600">
            {favorites.length} {favorites.length === 1 ? "receta guardada" : "recetas guardadas"}
          </p>
        )}
      </div>
      <FavoritesList recipes={favorites} />
    </div>
  );
}
