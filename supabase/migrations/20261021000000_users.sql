-- AbuCooking: perfiles de usuario y roles (admin / user).
-- Las cuentas las gestiona Supabase Auth (auth.users); aquí guardamos el rol.

create table profile (
  id          uuid primary key references auth.users on delete cascade,
  email       text not null,
  role        text not null default 'user' check (role in ('admin', 'user')),
  created_at  timestamptz not null default now()
);

alter table profile enable row level security;
create policy "read own profile" on profile for select using (auth.uid() = id);

-- Cada cuenta nueva recibe un perfil de usuario básico
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profile (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Cuentas que ya existieran antes de esta migración
insert into profile (id, email)
select id, email from auth.users
on conflict (id) do nothing;

create or replace function user_role(p_user_id uuid)
returns text
language sql stable
set search_path = public
as $$
  select role from profile where id = p_user_id;
$$;

create or replace function admin_list_users()
returns json
language sql stable
set search_path = public
as $$
  select coalesce(json_agg(json_build_object(
    'id', p.id,
    'email', p.email,
    'role', p.role,
    'created_at', p.created_at
  ) order by p.created_at), '[]'::json)
  from profile p;
$$;

create or replace function admin_set_role(p_user_id uuid, p_role text)
returns void
language plpgsql
set search_path = public
as $$
begin
  if p_role not in ('admin', 'user') then
    raise exception 'Rol no válido: %', p_role;
  end if;
  if p_role = 'user' and not exists (
    select 1 from profile where role = 'admin' and id <> p_user_id
  ) then
    raise exception 'Debe quedar al menos un administrador';
  end if;
  update profile set role = p_role where id = p_user_id;
  if not found then
    raise exception 'El usuario no existe';
  end if;
end;
$$;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke execute on function user_role(uuid), admin_list_users(), admin_set_role(uuid, text)
    from public, anon, authenticated;
    revoke execute on function handle_new_user() from public, anon, authenticated;
  end if;
end;
$$;
