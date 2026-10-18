-- AbuCooking: imágenes de recetas y detalle de ingrediente en el panel.

-- Bucket público para las imágenes (máx. 512 KB; la web ya las reduce antes de subir)
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('recipe-images', 'recipe-images', true, 524288, array['image/webp', 'image/jpeg', 'image/png'])
    on conflict (id) do nothing;
  end if;
end;
$$;

-- search_recipes ahora devuelve también la imagen (cambia el tipo de retorno: hay que recrearla)
drop function if exists search_recipes(int[], text);
create function search_recipes(p_ingredient_ids int[], p_locale text default 'es')
returns table (
  id            int,
  slug          text,
  title         text,
  description   text,
  prep_minutes  int,
  servings      int,
  image_url     text,
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
    r.id, r.slug, t.title, t.description, r.prep_minutes, r.servings, r.image_url,
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

-- Listado de recetas del panel, ahora con imagen
create or replace function admin_list_recipes()
returns json
language sql stable
set search_path = public
as $$
  select coalesce(json_agg(json_build_object(
    'id', r.id,
    'slug', r.slug,
    'prep_minutes', r.prep_minutes,
    'servings', r.servings,
    'image_url', r.image_url,
    'titles', coalesce((
      select json_object_agg(t.locale, t.title)
      from recipe_translation t
      where t.recipe_id = r.id
    ), '{}'::json),
    'ingredient_count', (select count(*) from recipe_ingredient ri where ri.recipe_id = r.id)
  ) order by coalesce(
    (select t.title from recipe_translation t where t.recipe_id = r.id and t.locale = 'es'),
    r.slug
  )), '[]'::json)
  from recipe r;
$$;

-- Ingrediente con las recetas que lo usan
create or replace function admin_get_ingredient(p_id int)
returns json
language sql stable
set search_path = public
as $$
  select json_build_object(
    'id', i.id,
    'slug', i.slug,
    'is_pantry', i.is_pantry,
    'translations', coalesce((
      select json_object_agg(t.locale, json_build_object('name', t.name, 'synonyms', t.synonyms))
      from ingredient_translation t
      where t.ingredient_id = i.id
    ), '{}'::json),
    'recipe_count', (select count(*) from recipe_ingredient ri where ri.ingredient_id = i.id),
    'recipes', coalesce((
      select json_agg(json_build_object(
        'id', r.id,
        'slug', r.slug,
        'title', coalesce(t.title, r.slug),
        'image_url', r.image_url,
        'quantity', ri.quantity,
        'unit', ri.unit,
        'optional', ri.optional
      ) order by coalesce(t.title, r.slug))
      from recipe_ingredient ri
      join recipe r on r.id = ri.recipe_id
      left join recipe_translation t on t.recipe_id = r.id and t.locale = 'es'
      where ri.ingredient_id = i.id
    ), '[]'::json)
  )
  from ingredient i
  where i.id = p_id;
$$;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke execute on function admin_list_recipes(), admin_get_ingredient(int) from public, anon, authenticated;
  end if;
end;
$$;
