# AbuCooking

Dinos qué ingredientes tienes en casa y te proponemos recetas.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL)

## Puesta en marcha (Windows / PowerShell)

### 1. Crear la base de datos en Supabase
1. Crea un proyecto en https://supabase.com/dashboard (plan gratuito). Región recomendada: Europa.
2. Abre **SQL Editor** → **New query**, pega el contenido de
   `supabase/migrations/20261018000000_init.sql` y pulsa **Run**.
3. Abre otra query, pega `supabase/seed.sql` y pulsa **Run**.
4. Haz lo mismo, en orden, con el resto de archivos de `supabase/migrations/`
   (`…_admin.sql`, `…_images.sql`, `…_users.sql`).
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

### 3. Publicar en Vercel (modo privado, solo por invitación)
1. En https://vercel.com/new importa el repositorio de GitHub.
2. En **Environment Variables** añade:

   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave *publishable* / *anon* |
   | `SUPABASE_SERVICE_ROLE_KEY` | Clave *secret* / *service_role* |
   | `PRIVATE_MODE` | `true` |
   | `INVITE_CODE` | El código que darás a tus invitados (p. ej. `PAELLA2026`) |

3. **Deploy**. Cada `git push` a `main` vuelve a publicar automáticamente.
4. En Supabase → **Authentication → URL Configuration**: pon la URL de Vercel como *Site URL*
   y añade `https://tu-proyecto.vercel.app/**` a *Redirect URLs* (deja también la de localhost).

**Invitar:** envía `https://tu-proyecto.vercel.app/registro?codigo=PAELLA2026` (el código ya va relleno).

**Modo privado:** sin sesión solo se ve la pantalla de entrar/registrarse; los buscadores no la indexan.
Para cambiar el código o abrir la web al público, cambia o quita las variables en Vercel
(Settings → Environment Variables) y vuelve a desplegar (Deployments → ⋯ → Redeploy).

## Usuarios y roles

Cuentas con email y contraseña (Supabase Auth). Registro libre en `/registro`.

| Rol | Puede |
|---|---|
| Visitante sin cuenta | Buscar recetas (en modo privado: nada, solo entrar o registrarse) |
| **Básico** (toda cuenta nueva) | Buscar recetas y guardar favoritas |
| **Administrador** | Todo, incluido el panel `/admin` |

- **Secciones**: **¡A cocinar!** (`/`, buscar por ingredientes que tienes), **Buscar recetas**
  (`/buscar`, por texto en título, descripción, ingredientes y pasos) y **Mis favoritas**.
- **Mis favoritas** (`/favoritas`): el corazón de cada receta la guarda (pide confirmación).
  Cada usuario solo puede ver y cambiar las suyas (RLS en la tabla `favorite`).
- **Mi cuenta** (`/cuenta`, pulsando tu email arriba): ver tu tipo de cuenta y cambiar la contraseña
  (pide la actual).
- **¿Olvidaste tu contraseña?** (`/recuperar`): envía un email con un enlace de un solo uso para elegir
  una nueva. El mensaje es el mismo exista o no la cuenta, para no revelar qué emails están registrados.

**Contraseñas:** no se guardan en nuestras tablas ni pasan por nuestro código salvo en tránsito (HTTPS).
Las gestiona Supabase Auth, que solo guarda un hash bcrypt en `auth.users.encrypted_password`.

**Primer administrador:** regístrate en la web y ejecuta en el SQL Editor de Supabase:
```sql
update profile set role = 'admin' where email = 'tu@email.com';
```
A partir de ahí, los demás se nombran desde `/admin/usuarios` (siempre debe quedar al menos uno).

**Configuración de Supabase** (Authentication):
- **URL Configuration**: *Site URL* `http://localhost:3000` (en producción, tu dominio) y en *Redirect URLs*
  añade `http://localhost:3000/**` (y `https://tu-dominio/**` cuando publiques).
- **Sign In / Providers → Email**: con *Confirm email* activado, cada cuenta nueva recibe un email de confirmación.
  El servidor de correo gratuito de Supabase solo envía unos pocos emails por hora; para desarrollar
  puedes desactivarlo y las cuentas quedarán activas al momento.

## Panel de administración

En `/admin` (enlace "Administración" arriba a la derecha, solo visible para administradores):

- **Recetas**: buscar, ordenar (título, nº de ingredientes, tiempo), crear, editar y borrar.
  Título, descripción y pasos en español (obligatorio), francés e inglés. Imagen opcional.
- **Ingredientes**: buscar, ordenar por nombre en cualquiera de los 3 idiomas o por nº de recetas.
  Al pulsar uno se puede editar (nombre y sinónimos en los 3 idiomas) y se ven las recetas que lo usan.
- **Usuarios**: lista de cuentas y botón para hacer / quitar administrador.
- **Imágenes**: el navegador las reduce a 800 px en WebP antes de subirlas (normalmente 30-100 KB;
  máximo 512 KB). Se guardan en Supabase Storage y se borran al cambiarlas o al borrar la receta.

Seguridad: cada página y cada acción del panel comprueba en el servidor que el usuario es administrador.
Las escrituras usan `SUPABASE_SERVICE_ROLE_KEY`, que solo existe en el servidor (nunca llega al navegador).

## Cómo está organizado

```
supabase/
  migrations/…_init.sql   Tablas, permisos (solo lectura pública) y funciones SQL
  seed.sql                49 ingredientes y 26 recetas en español
src/
  app/page.tsx            Buscador + resultados (lee ?i=1,2,3 de la URL)
  app/receta/[slug]/      Detalle de receta, marca lo que tienes y lo que falta
  app/admin/              Panel de administración (+ actions.ts: server actions)
  app/login, app/registro Entrar y crear cuenta (app/auth: acciones y callback del email)
  app/recuperar, app/cuenta  Recuperar contraseña y "Mi cuenta"
  middleware.ts           Refresca la sesión de Supabase en cada petición
  components/             Selector de ingredientes y tarjeta de receta
  components/admin/       Formularios de receta e ingrediente
  lib/data.ts             Lectura pública (clave publishable)
  lib/supabase-admin.ts   Lectura/escritura de admin (clave secreta, solo servidor)
  lib/auth.ts             Usuario actual y su rol; protección de páginas de admin
```

### Modelo de datos
- `ingredient` / `recipe`: entidades neutras, identificadas por `slug` en inglés.
- `ingredient_translation` / `recipe_translation`: textos por idioma (`es`, más adelante `fr`, `en`).
- `recipe_ingredient`: cantidades, unidad y si es opcional.
- `ingredient.is_pantry`: básicos (sal, aceite, agua…) que se dan por supuestos.

La búsqueda (`search_recipes`) trabaja con IDs de ingredientes, así que no depende del idioma.
Ordena por el % de ingredientes necesarios que tienes, sin contar básicos ni opcionales.

### Importar muchas recetas de golpe
En `data/recetas/` hay 142 recetas típicas españolas (tapas, cuchara, arroces, carnes, pescados,
verduras y masas, postres) y en `data/ingredientes.mjs` sus ingredientes en español, francés e inglés.

```powershell
npm run importar-recetas -- --prueba   # comprueba los datos y muestra qué haría, sin escribir
npm run importar-recetas               # importa las recetas nuevas
npm run importar-recetas -- --actualizar  # sobrescribe también las que ya existen
```
- Reutiliza los ingredientes existentes (por slug o nombre en español) y crea los que falten.
  A los existentes solo les añade las traducciones que les falten.
- No duplica nada: las recetas con un slug que ya existe no se tocan (salvo `--actualizar`,
  que conserva su foto y sus traducciones).
- Para añadir más, crea otro archivo en `data/recetas/` con el mismo formato.

### Añadir recetas
Desde `/admin`. Las traducciones al francés e inglés se guardan ya, aunque la web pública
de momento solo muestra español.
