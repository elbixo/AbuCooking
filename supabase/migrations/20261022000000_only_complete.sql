-- AbuCooking: opción "solo con lo que tengo" en el buscador.
-- p_only_complete = true -> solo recetas sin ingredientes obligatorios que falten
-- (los básicos de despensa y los opcionales no cuentan).

drop function if exists search_recipes(int[], text);
create function search_recipes(
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
  order by s.matched::float / s.total desc, s.total - s.matched, t.title
  limit 50;
$$;
