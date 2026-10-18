# AbuCooking — notas para Claude

Web de recetas: el usuario indica los ingredientes que tiene y se le proponen recetas.
El propietario (Víctor) es ingeniero informático, trabaja en **Windows + PowerShell** y habla **español**:
responde en español y escribe en español los textos de la web, comentarios y commits.

## Stack
- Next.js 15 (App Router, server components y server actions) + TypeScript + Tailwind v4.
- Supabase: PostgreSQL, Auth (email y contraseña, `@supabase/ssr`) y Storage (bucket `recipe-images`).
- Despliegue en Vercel (cada push a `main` se publica). Estadísticas: Vercel Analytics + Speed Insights.
- La base de datos de Supabase es **la misma** en local y en producción.

## Estructura y decisiones
- `supabase/migrations/`: esquema y funciones SQL. **No hay CLI de Supabase**: Víctor ejecuta cada
  migración a mano en el SQL Editor, en orden. Una migración nueva = archivo nuevo con fecha mayor;
  nunca editar una ya aplicada. Deben ser compatibles con la versión publicada (`create or replace`, defaults).
- Multiidioma en datos: `ingredient`/`recipe` neutros + `*_translation` (`es`, `fr`, `en`). La web pública
  solo muestra `es` por ahora (`LOCALE` en `src/lib/data.ts`).
- Toda lectura/escritura pasa por **funciones RPC** (`search_recipes`, `search_recipes_text`, `get_recipe`,
  `admin_*`, `set_favorite`…), no por consultas a tablas desde el cliente.
- Claves: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (lectura pública) y `SUPABASE_SERVICE_ROLE_KEY` (solo servidor,
  `src/lib/supabase-admin.ts`, para el panel). Las favoritas usan la sesión del usuario + RLS (`auth.uid()`).
- Roles en `profile.role` (`admin` / `user`). `/admin` y todas sus server actions comprueban rol en servidor.
- Auditoría: `created_*`/`updated_*` en `recipe` e `ingredient`; el servidor pasa `actor_id`. Sin historial.
- Modo privado (`PRIVATE_MODE=true`) + `INVITE_CODE` para registrarse: web solo para family & friends.
- Ingredientes "de despensa" (`is_pantry`: sal, aceite, agua…) y opcionales no cuentan como "falta".
- Recetas en lote: `data/recetas/*.mjs` + `data/ingredientes.mjs`, se cargan con `npm run importar-recetas`
  (`:prueba`, `:actualizar`). En PowerShell `npm run x -- --flag` pierde el `--`: usar scripts propios.

## Forma de trabajar
- Cambios **con migración** → rama + **pull request** (con `gh api`, no `gh pr create`, que usa GraphQL
  bloqueado), indicando qué migración ejecutar antes del merge. Cambios pequeños sin migración → directo a `main`.
- Este entorno no puede borrar ramas remotas (el repo tiene borrado automático tras el merge).
- Tras `git pull`, recordar a Víctor `npm install` si hay dependencias nuevas.
- Comprobar siempre `npx tsc --noEmit` y `npm run lint`, y probar en navegador con Playwright.
- Para probar sin Supabase real: cargar las migraciones en PGlite (`@electric-sql/pglite`) con un shim de
  `auth.users` / `auth.uid()`, y un servidor HTTP falso que imite `/rest/v1/rpc/*`, `/auth/v1/*` y
  `/storage/v1/*`. Arrancar la app con `.env.local` apuntando a ese servidor.
- Antes de publicar algo que dependa de una migración, confirmar que Víctor la ha ejecutado.
