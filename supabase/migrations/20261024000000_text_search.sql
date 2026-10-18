-- AbuCooking: búsqueda de recetas por texto (título, descripción, ingredientes y pasos).

-- Minúsculas y sin tildes, para comparar "Calabacin" con "calabacín".
-- (Se hace con translate para no depender de la extensión unaccent.)
create or replace function normalize_text(t text)
returns text
language sql immutable
as $$
  select translate(lower(coalesce(t, '')), 'áàâäéèêëíìîïóòôöúùûüçñ', 'aaaaeeeeiiiioooouuuucn');
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
  limit 100;
$$;
