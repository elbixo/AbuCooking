-- AbuCooking: funciones de administración.
-- Solo las puede ejecutar service_role (la clave secreta, usada desde el servidor).

create or replace function admin_list_ingredients()
returns json
language sql stable
set search_path = public
as $$
  select coalesce(json_agg(json_build_object(
    'id', i.id,
    'slug', i.slug,
    'is_pantry', i.is_pantry,
    'translations', coalesce((
      select json_object_agg(t.locale, json_build_object('name', t.name, 'synonyms', t.synonyms))
      from ingredient_translation t
      where t.ingredient_id = i.id
    ), '{}'::json),
    'recipe_count', (select count(*) from recipe_ingredient ri where ri.ingredient_id = i.id)
  ) order by coalesce(
    (select t.name from ingredient_translation t where t.ingredient_id = i.id and t.locale = 'es'),
    i.slug
  )), '[]'::json)
  from ingredient i;
$$;

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

create or replace function admin_get_recipe(p_id int)
returns json
language sql stable
set search_path = public
as $$
  select json_build_object(
    'id', r.id,
    'slug', r.slug,
    'prep_minutes', r.prep_minutes,
    'servings', r.servings,
    'image_url', r.image_url,
    'translations', coalesce((
      select json_object_agg(t.locale, json_build_object(
        'title', t.title, 'description', t.description, 'steps', t.steps
      ))
      from recipe_translation t
      where t.recipe_id = r.id
    ), '{}'::json),
    'ingredients', coalesce((
      select json_agg(json_build_object(
        'ingredient_id', ri.ingredient_id,
        'quantity', ri.quantity,
        'unit', ri.unit,
        'optional', ri.optional
      ) order by ri.position)
      from recipe_ingredient ri
      where ri.recipe_id = r.id
    ), '[]'::json)
  )
  from recipe r
  where r.id = p_id;
$$;

-- Crea o actualiza un ingrediente con sus traducciones. Devuelve el id.
-- p = { id?, slug, is_pantry, translations: { es: { name, synonyms[] }, fr: {...}, en: {...} } }
create or replace function admin_save_ingredient(p jsonb)
returns int
language plpgsql
set search_path = public
as $$
declare
  v_id   int := (p->>'id')::int;
  v_base text := coalesce(nullif(trim(p->>'slug'), ''), 'ingredient');
  v_slug text := v_base;
  n      int := 1;
begin
  if coalesce(trim(p->'translations'->'es'->>'name'), '') = '' then
    raise exception 'El nombre en español es obligatorio';
  end if;

  while exists (select 1 from ingredient where slug = v_slug and id is distinct from v_id) loop
    n := n + 1;
    v_slug := v_base || '-' || n;
  end loop;

  if v_id is null then
    insert into ingredient (slug, is_pantry)
    values (v_slug, coalesce((p->>'is_pantry')::boolean, false))
    returning id into v_id;
  else
    update ingredient
    set slug = v_slug, is_pantry = coalesce((p->>'is_pantry')::boolean, false)
    where id = v_id;
    if not found then
      raise exception 'El ingrediente % no existe', v_id;
    end if;
  end if;

  delete from ingredient_translation where ingredient_id = v_id;
  insert into ingredient_translation (ingredient_id, locale, name, synonyms)
  select
    v_id,
    t.key,
    trim(t.value->>'name'),
    array(
      select trim(s) from jsonb_array_elements_text(coalesce(t.value->'synonyms', '[]')) s
      where trim(s) <> ''
    )
  from jsonb_each(p->'translations') t
  where coalesce(trim(t.value->>'name'), '') <> '';

  return v_id;
end;
$$;

-- Crea o actualiza una receta con traducciones e ingredientes. Devuelve el id.
-- p = { id?, slug, prep_minutes, servings, image_url,
--       translations: { es: { title, description, steps[] }, ... },
--       ingredients: [ { ingredient_id, quantity, unit, optional } ] }
create or replace function admin_save_recipe(p jsonb)
returns int
language plpgsql
set search_path = public
as $$
declare
  v_id   int := (p->>'id')::int;
  v_base text := coalesce(nullif(trim(p->>'slug'), ''), 'receta');
  v_slug text := v_base;
  n      int := 1;
begin
  if coalesce(trim(p->'translations'->'es'->>'title'), '') = '' then
    raise exception 'El título en español es obligatorio';
  end if;

  while exists (select 1 from recipe where slug = v_slug and id is distinct from v_id) loop
    n := n + 1;
    v_slug := v_base || '-' || n;
  end loop;

  if v_id is null then
    insert into recipe (slug, prep_minutes, servings, image_url)
    values (
      v_slug,
      nullif(p->>'prep_minutes', '')::int,
      nullif(p->>'servings', '')::int,
      nullif(trim(p->>'image_url'), '')
    )
    returning id into v_id;
  else
    update recipe set
      slug = v_slug,
      prep_minutes = nullif(p->>'prep_minutes', '')::int,
      servings = nullif(p->>'servings', '')::int,
      image_url = nullif(trim(p->>'image_url'), '')
    where id = v_id;
    if not found then
      raise exception 'La receta % no existe', v_id;
    end if;
  end if;

  delete from recipe_translation where recipe_id = v_id;
  insert into recipe_translation (recipe_id, locale, title, description, steps)
  select
    v_id,
    t.key,
    trim(t.value->>'title'),
    nullif(trim(t.value->>'description'), ''),
    array(
      select trim(s) from jsonb_array_elements_text(coalesce(t.value->'steps', '[]')) s
      where trim(s) <> ''
    )
  from jsonb_each(p->'translations') t
  where coalesce(trim(t.value->>'title'), '') <> '';

  delete from recipe_ingredient where recipe_id = v_id;
  insert into recipe_ingredient (recipe_id, ingredient_id, quantity, unit, optional, position)
  select
    v_id,
    (x.value->>'ingredient_id')::int,
    nullif(x.value->>'quantity', '')::numeric,
    nullif(trim(x.value->>'unit'), ''),
    coalesce((x.value->>'optional')::boolean, false),
    x.ord
  from jsonb_array_elements(coalesce(p->'ingredients', '[]')) with ordinality as x(value, ord)
  on conflict (recipe_id, ingredient_id) do nothing;

  return v_id;
end;
$$;

create or replace function admin_delete_recipe(p_id int)
returns void
language sql
set search_path = public
as $$
  delete from recipe where id = p_id;
$$;

create or replace function admin_delete_ingredient(p_id int)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_count int;
begin
  select count(*) into v_count from recipe_ingredient where ingredient_id = p_id;
  if v_count > 0 then
    raise exception 'No se puede borrar: se usa en % receta(s)', v_count;
  end if;
  delete from ingredient where id = p_id;
end;
$$;

-- Que no las pueda llamar la clave pública (anon) ni usuarios autenticados
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke execute on function
      admin_list_ingredients(), admin_list_recipes(), admin_get_recipe(int),
      admin_save_ingredient(jsonb), admin_save_recipe(jsonb),
      admin_delete_recipe(int), admin_delete_ingredient(int)
    from public, anon, authenticated;
  end if;
end;
$$;
