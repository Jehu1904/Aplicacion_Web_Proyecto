-- Actualiza solo la RPC administrativa de citas para rechazar copias viejas.
-- No modifica la RPC de listado ni las políticas RLS.

drop function if exists public.update_appointment_for_admin(
  uuid, text, text, date, time, text, text, numeric, text
);

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

grant execute on function public.update_appointment_for_admin(
  uuid, text, text, date, time, text, text, numeric, text, text
) to authenticated;
