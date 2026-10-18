# AbuCooking

Dinos qué ingredientes tienes en casa y te proponemos recetas.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL)

## Puesta en marcha (Windows / PowerShell)

### 1. Crear la base de datos en Supabase
1. Crea un proyecto en https://supabase.com/dashboard (plan gratuito). Región recomendada: Europa.
2. Abre **SQL Editor** → **New query**, pega el contenido de
   `supabase/migrations/20261018000000_init.sql` y pulsa **Run**.
3. Abre otra query, pega `supabase/seed.sql` y pulsa **Run**.
4. Abre otra query, pega `supabase/migrations/20261019000000_admin.sql` y pulsa **Run**.
5. En **Project Settings → API Keys** copia la *Project URL*, la clave *publishable* (o *anon*) y la clave *secret* (o *service_role*).

> Cada vez que se añada un archivo nuevo en `supabase/migrations/`, ejecútalo igual en el SQL Editor (en orden).

### 2. Arrancar la web en local
```powershell
git clone https://github.com/<tu-usuario>/AbuCooking.git
cd AbuCooking
npm install
Copy-Item .env.example .env.local   # y rellena las tres variables
npm run dev
```
Abre http://localhost:3000

### 3. Publicar en Vercel
1. En https://vercel.com/new importa el repositorio de GitHub.
2. Añade las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **Deploy**. Cada `git push` a `main` vuelve a publicar automáticamente.

## Panel de administración

En local (`npm run dev`) tienes `/admin` (enlace "Administración" arriba a la derecha):

- **Recetas**: crear, editar y borrar. Título, descripción y pasos en español (obligatorio), francés e inglés.
- **Ingredientes**: crear, editar y borrar, con nombre y sinónimos en los tres idiomas.
- Al añadir ingredientes a una receta se busca entre los existentes (en cualquier idioma o sinónimo).
  Si no existe, ofrece **«+ Crear ingrediente»** y lo da de alta sin salir de la receta.

⚠️ Todavía **no tiene autenticación**. Por eso solo funciona en desarrollo: en producción `/admin` devuelve 404
(salvo que se defina `ADMIN_ENABLED=true`, que no debe hacerse hasta tener login).
Escribe en la base de datos desde el servidor con `SUPABASE_SERVICE_ROLE_KEY`, que nunca llega al navegador.

## Cómo está organizado

```
supabase/
  migrations/…_init.sql   Tablas, permisos (solo lectura pública) y funciones SQL
  seed.sql                49 ingredientes y 26 recetas en español
src/
  app/page.tsx            Buscador + resultados (lee ?i=1,2,3 de la URL)
  app/receta/[slug]/      Detalle de receta, marca lo que tienes y lo que falta
  app/admin/              Panel de administración (+ actions.ts: server actions)
  components/             Selector de ingredientes y tarjeta de receta
  components/admin/       Formularios de receta e ingrediente
  lib/data.ts             Lectura pública (clave publishable)
  lib/supabase-admin.ts   Lectura/escritura de admin (clave secreta, solo servidor)
```

### Modelo de datos
- `ingredient` / `recipe`: entidades neutras, identificadas por `slug` en inglés.
- `ingredient_translation` / `recipe_translation`: textos por idioma (`es`, más adelante `fr`, `en`).
- `recipe_ingredient`: cantidades, unidad y si es opcional.
- `ingredient.is_pantry`: básicos (sal, aceite, agua…) que se dan por supuestos.

La búsqueda (`search_recipes`) trabaja con IDs de ingredientes, así que no depende del idioma.
Ordena por el % de ingredientes necesarios que tienes, sin contar básicos ni opcionales.

### Añadir recetas
Desde `/admin`. Las traducciones al francés e inglés se guardan ya, aunque la web pública
de momento solo muestra español.
