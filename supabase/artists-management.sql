create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.artists (name)
values ('Jehu Villamar'), ('Jesus Macias'), ('Jordan Solorzano')
on conflict (name) do nothing;

alter table public.artists enable row level security;

drop policy if exists "Authenticated users read active artists" on public.artists;
create policy "Authenticated users read active artists" on public.artists
  for select to authenticated using (active = true);

create or replace function public.get_artists_for_admin()
returns table (id uuid, name text, active boolean)
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'admin@inkiorn.com' then
    raise exception 'No tienes permisos de administrador.';
  end if;

  return query
  select a.id, a.name, a.active
  from public.artists a
  where a.active = true
  order by a.name;
end;
$$;

create or replace function public.add_artist_for_admin(p_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'admin@inkiorn.com' then
    raise exception 'No tienes permisos de administrador.';
  end if;

  if trim(coalesce(p_name, '')) = '' then
    raise exception 'El nombre del tatuador es obligatorio.';
  end if;

  insert into public.artists (name)
  values (trim(p_name))
  on conflict (name) do update set active = true;
end;
$$;

create or replace function public.remove_artist_for_admin(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'admin@inkiorn.com' then
    raise exception 'No tienes permisos de administrador.';
  end if;

  update public.artists set active = false where id = p_id;
end;
$$;

grant select on public.artists to authenticated;
grant execute on function public.get_artists_for_admin() to authenticated;
grant execute on function public.add_artist_for_admin(text) to authenticated;
grant execute on function public.remove_artist_for_admin(uuid) to authenticated;