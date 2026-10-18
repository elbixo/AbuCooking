-- AbuCooking: recetas favoritas de cada usuario.
-- Las funciones usan auth.uid() (el usuario de la sesión) y la tabla tiene RLS:
-- cada usuario solo puede ver y cambiar sus propias favoritas.

create table favorite (
  user_id     uuid not null references auth.users on delete cascade,
  recipe_id   int not null references recipe on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create index favorite_recipe_idx on favorite (recipe_id);

alter table favorite enable row level security;
create policy "own favorites: read" on favorite for select using (auth.uid() = user_id);
create policy "own favorites: add" on favorite for insert with check (auth.uid() = user_id);
create policy "own favorites: remove" on favorite for delete using (auth.uid() = user_id);

-- Marca o desmarca una receta como favorita del usuario actual
create or replace function set_favorite(p_recipe_id int, p_favorite boolean)
returns void
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Tienes que iniciar sesión';
  end if;
  if p_favorite then
    insert into favorite (user_id, recipe_id) values (auth.uid(), p_recipe_id)
    on conflict do nothing;
  else
    delete from favorite where user_id = auth.uid() and recipe_id = p_recipe_id;
  end if;
end;
$$;

-- IDs de las favoritas del usuario actual (para pintar los corazones)
create or replace function favorite_recipe_ids()
returns int[]
language sql stable
set search_path = public
as $$
  select coalesce(array_agg(recipe_id), '{}') from favorite where user_id = auth.uid();
$$;

-- Favoritas del usuario actual, la más reciente primero
create or replace function list_favorites(p_locale text default 'es')
returns table (
  id            int,
  slug          text,
  title         text,
  description   text,
  prep_minutes  int,
  servings      int,
  image_url     text,
  favorited_at  timestamptz
)
language sql stable
set search_path = public
as $$
  select r.id, r.slug, t.title, t.description, r.prep_minutes, r.servings, r.image_url, f.created_at
  from favorite f
  join recipe r on r.id = f.recipe_id
  join recipe_translation t on t.recipe_id = r.id and t.locale = p_locale
  where f.user_id = auth.uid()
  order by f.created_at desc;
$$;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke execute on function set_favorite(int, boolean), favorite_recipe_ids(), list_favorites(text)
    from public, anon;
    grant execute on function set_favorite(int, boolean), favorite_recipe_ids(), list_favorites(text)
    to authenticated;
  end if;
end;
$$;
