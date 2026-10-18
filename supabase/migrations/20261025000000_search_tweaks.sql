-- AbuCooking: ajustes de búsqueda con muchas recetas.
-- ¡A cocinar!: a igualdad de porcentaje y de ingredientes que faltan, primero las recetas
-- que usan más de los ingredientes que tienes (la tortilla antes que el tocino de cielo).
-- Buscar recetas: hasta 1000 resultados (antes 100), para que "Todas" sea realmente todas.

create or replace function search_recipes(
  p_ingredient_ids int[],
  p_locale text default 'es',
  p_only_complete boolean default false
)
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
    and (not p_only_complete or s.matched = s.total)
  order by s.matched::float / s.total desc, s.total - s.matched, s.matched desc, t.title
  limit 50;
$$;

-- Sin texto: todas las recetas por título. Con texto: las que contienen todas las palabras,
-- primero las que coinciden en el título, luego descripción, ingredientes y pasos.
create or replace function search_recipes_text(p_query text, p_locale text default 'es')
returns table (
  id            int,
  slug          text,
  title         text,
  description   text,
  prep_minutes  int,
  servings      int,
  image_url     text
)
language sql stable
set search_path = public
as $$
  with words as (
    select regexp_replace(w, '[%_\\]', '', 'g') as w
    from unnest(string_to_array(normalize_text(trim(p_query)), ' ')) as w
  ),
  terms as (
    select w from words where length(w) > 0
  ),
  docs as (
    select
      r.id, r.slug, t.title, t.description, r.prep_minutes, r.servings, r.image_url,
      normalize_text(t.title) as n_title,
      normalize_text(t.description) as n_desc,
      normalize_text((
        select string_agg(it.name || ' ' || array_to_string(it.synonyms, ' '), ' ')
        from recipe_ingredient ri
        join ingredient_translation it on it.ingredient_id = ri.ingredient_id and it.locale = p_locale
        where ri.recipe_id = r.id
      )) as n_ingr,
      normalize_text(array_to_string(t.steps, ' ')) as n_steps
    from recipe r
    join recipe_translation t on t.recipe_id = r.id and t.locale = p_locale
  )
  select d.id, d.slug, d.title, d.description, d.prep_minutes, d.servings, d.image_url
  from docs d
  where not exists (
    select 1 from terms
    where position(terms.w in d.n_title || ' ' || d.n_desc || ' ' || d.n_ingr || ' ' || d.n_steps) = 0
  )
  order by
    (
      select coalesce(sum(case
        when position(terms.w in d.n_title) > 0 then 8
        when position(terms.w in d.n_desc) > 0 then 4
        when position(terms.w in d.n_ingr) > 0 then 2
        else 1
      end), 0)
      from terms
    ) desc,
    d.title
  limit 1000;
$$;
