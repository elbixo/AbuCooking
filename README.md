# AbuCooking

Dinos qué ingredientes tienes en casa y te proponemos recetas.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL)

## Puesta en marcha (Windows / PowerShell)

### 1. Crear la base de datos en Supabase
1. Crea un proyecto en https://supabase.com/dashboard (plan gratuito). Región recomendada: Europa.
2. Abre **SQL Editor** → **New query**, pega el contenido de
   `supabase/migrations/20261018000000_init.sql` y pulsa **Run**.
3. Abre otra query, pega `supabase/seed.sql` y pulsa **Run**.
4. En **Project Settings → API** (o **Data API**) copia la *Project URL* y la clave *anon* / *publishable*.

### 2. Arrancar la web en local
```powershell
git clone https://github.com/<tu-usuario>/AbuCooking.git
cd AbuCooking
npm install
Copy-Item .env.example .env.local   # y rellena las dos variables
npm run dev
```
Abre http://localhost:3000

### 3. Publicar en Vercel
1. En https://vercel.com/new importa el repositorio de GitHub.
2. Añade las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **Deploy**. Cada `git push` a `main` vuelve a publicar automáticamente.

## Cómo está organizado

```
supabase/
  migrations/…_init.sql   Tablas, permisos (solo lectura pública) y funciones SQL
  seed.sql                49 ingredientes y 26 recetas en español
src/
  app/page.tsx            Buscador + resultados (lee ?i=1,2,3 de la URL)
  app/receta/[slug]/      Detalle de receta, marca lo que tienes y lo que falta
  components/             Selector de ingredientes y tarjeta de receta
  lib/data.ts             Acceso a datos (llamadas RPC a Supabase)
```

### Modelo de datos
- `ingredient` / `recipe`: entidades neutras, identificadas por `slug` en inglés.
- `ingredient_translation` / `recipe_translation`: textos por idioma (`es`, más adelante `fr`, `en`).
- `recipe_ingredient`: cantidades, unidad y si es opcional.
- `ingredient.is_pantry`: básicos (sal, aceite, agua…) que se dan por supuestos.

La búsqueda (`search_recipes`) trabaja con IDs de ingredientes, así que no depende del idioma.
Ordena por el % de ingredientes necesarios que tienes, sin contar básicos ni opcionales.

### Añadir recetas
Añade filas en `seed.sql` siguiendo el mismo formato (o insértalas desde el Table Editor de Supabase).
Para traducir, basta con añadir filas con `locale = 'fr'` / `'en'` en las tablas `*_translation`.
