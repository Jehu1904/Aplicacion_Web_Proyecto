-- PostgreSQL requires dropping this signature before changing its returned columns.
drop function if exists public.get_appointments_for_admin();

create function public.get_appointments_for_admin()
returns table (
  id uuid,
  client_name text,
  artist text,
  style text,
  appointment_date date,
  start_time time,
  duration_minutes integer,
  body_area text,
  notes text,
  price numeric,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'admin@inkiorn.com' then
    raise exception 'No tienes permisos de administrador.';
  end if;

  return query
  select a.id, a.client_name, a.artist, a.style, a.appointment_date,
    a.start_time, a.duration_minutes, a.body_area, a.notes, a.price, a.status
  from public.appointments a
  order by a.appointment_date asc, a.start_time asc nulls last;
end;
$$;

drop function if exists public.update_appointment_for_admin(uuid, text, text, date, time, text, text, numeric, text);

create or replace function public.update_appointment_for_admin(
  p_id uuid,
  p_artist text,
  p_style text,
  p_date date,
  p_start_time time,
  p_body_area text,
  p_status text,
  p_price numeric,
  p_notes text,
  p_expected_status text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'admin@inkiorn.com' then
    raise exception 'No tienes permisos de administrador.';
  end if;

  update public.appointments
  set artist = p_artist,
      style = p_style,
      appointment_date = p_date,
      start_time = coalesce(p_start_time, start_time),
      body_area = p_body_area,
      status = p_status,
      price = p_price,
      notes = p_notes
  where id = p_id and status = p_expected_status;

  return found;
end;
$$;

create or replace function public.delete_appointment_for_admin(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'admin@inkiorn.com' then
    raise exception 'No tienes permisos de administrador.';
  end if;
  delete from public.appointments where id = p_id;
end;
$$;

grant execute on function public.get_appointments_for_admin() to authenticated;
grant execute on function public.update_appointment_for_admin(uuid, text, text, date, time, text, text, numeric, text, text) to authenticated;
grant execute on function public.delete_appointment_for_admin(uuid) to authenticated;