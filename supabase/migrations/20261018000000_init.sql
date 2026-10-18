-- AbuCooking: esquema inicial
-- Entidades neutras (ingredient, recipe) + tablas de traducción por idioma.
-- La búsqueda trabaja con IDs, así que es independiente del idioma.

create table ingredient (
  id         serial primary key,
  slug       text unique not null,
  is_pantry  boolean not null default false  -- básicos que se asumen en casa (sal, aceite, agua...)
);

create table ingredient_translation (
  ingredient_id int not null references ingredient on delete cascade,
  locale        text not null,
  name          text not null,
  synonyms      text[] not null default '{}',
  primary key (ingredient_id, locale)
);

create table recipe (
  id            serial primary key,
  slug          text unique not null,
  prep_minutes  int,
  servings      int,
  image_url     text
);

create table recipe_translation (
  recipe_id    int not null references recipe on delete cascade,
  locale       text not null,
  title        text not null,
  description  text,
  steps        text[] not null,
  primary key (recipe_id, locale)
);

create table recipe_ingredient (
  recipe_id      int not null references recipe on delete cascade,
  ingredient_id  int not null references ingredient,
  quantity       numeric,         -- null = "al gusto"
  unit           text,
  optional       boolean not null default false,
  position       int not null default 0,
  primary key (recipe_id, ingredient_id)
);

create index recipe_ingredient_ingredient_idx on recipe_ingredient (ingredient_id);

-- Lectura pública, escritura solo desde el panel / service role
alter table ingredient enable row level security;
alter table ingredient_translation enable row level security;
alter table recipe enable row level security;
alter table recipe_translation enable row level security;
alter table recipe_ingredient enable row level security;

create policy "public read" on ingredient for select using (true);
create policy "public read" on ingredient_translation for select using (true);
create policy "public read" on recipe for select using (true);
create policy "public read" on recipe_translation for select using (true);
create policy "public read" on recipe_ingredient for select using (true);

-- Recetas ordenadas por el % de ingredientes necesarios que ya tienes.
-- No cuentan los básicos de despensa ni los ingredientes opcionales.
create or replace function search_recipes(p_ingredient_ids int[], p_locale text default 'es')
returns table (
  id            int,
  slug          text,
  title         text,
  description   text,
  prep_minutes  int,
  servings      int,
  total         int,
  matched       int,
  missing       text[]
)
language sql stable
set search_path = public
as $$
  with required as (
    select ri.recipe_id, ri.ingredient_id
    from recipe_ingredient ri
    join ingredient i on i.id = ri.ingredient_id
    where not ri.optional and not i.is_pantry
  ),
  stats as (
    select
      recipe_id,
      count(*)::int as total,
      count(*) filter (where ingredient_id = any(p_ingredient_ids))::int as matched,
      array_agg(ingredient_id) filter (where not ingredient_id = any(p_ingredient_ids)) as missing_ids
    from required
    group by recipe_id
  )
  select
    r.id, r.slug, t.title, t.description, r.prep_minutes, r.servings,
    s.total, s.matched,
    coalesce((
      select array_agg(it.name order by it.name)
      from ingredient_translation it
      where it.locale = p_locale and it.ingredient_id = any(s.missing_ids)
    ), '{}')
  from stats s
  join recipe r on r.id = s.recipe_id
  join recipe_translation t on t.recipe_id = r.id and t.locale = p_locale
  where s.matched > 0
  order by s.matched::float / s.total desc, s.total - s.matched, t.title
  limit 50;
$$;

-- Ingredientes de un idioma (para el autocompletado, que se hace en el cliente)
create or replace function list_ingredients(p_locale text default 'es')
returns table (id int, name text, synonyms text[], is_pantry boolean)
language sql stable
set search_path = public
as $$
  select i.id, it.name, it.synonyms, i.is_pantry
  from ingredient i
  join ingredient_translation it on it.ingredient_id = i.id and it.locale = p_locale
  order by it.name;
$$;

-- Detalle de una receta como JSON (null si no existe en ese idioma)
create or replace function get_recipe(p_slug text, p_locale text default 'es')
returns json
language sql stable
set search_path = public
as $$
  select json_build_object(
    'id', r.id,
    'slug', r.slug,
    'title', t.title,
    'description', t.description,
    'steps', t.steps,
    'prep_minutes', r.prep_minutes,
    'servings', r.servings,
    'image_url', r.image_url,
    'ingredients', coalesce((
      select json_agg(json_build_object(
        'id', i.id,
        'name', it.name,
        'quantity', ri.quantity,
        'unit', ri.unit,
        'optional', ri.optional,
        'is_pantry', i.is_pantry
      ) order by ri.position)
      from recipe_ingredient ri
      join ingredient i on i.id = ri.ingredient_id
      join ingredient_translation it on it.ingredient_id = i.id and it.locale = p_locale
      where ri.recipe_id = r.id
    ), '[]'::json)
  )
  from recipe r
  join recipe_translation t on t.recipe_id = r.id and t.locale = p_locale
  where r.slug = p_slug;
$$;
