create or replace function public.get_completed_appointments_for_admin()
returns table (
  id uuid,
  client_name text,
  artist text,
  style text,
  appointment_date date,
  start_time time,
  duration_minutes integer,
  body_area text,
  size_cm integer,
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
    a.start_time, a.duration_minutes, a.body_area, a.size_cm, a.notes,
    a.price, a.status
  from public.appointments a
  where a.status = 'completada'
  order by a.appointment_date desc, a.start_time desc nulls last;
end;
$$;

grant execute on function public.get_completed_appointments_for_admin() to authenticated;