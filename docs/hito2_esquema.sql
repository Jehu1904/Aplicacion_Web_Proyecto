-- Extracto de evidencia del esquema de INK & IRON para el taller.
-- No es una migración para ejecutar: las fuentes vigentes son
-- supabase/schema.sql y supabase/admin-appointments-management.sql.

alter table public.appointments enable row level security;

create policy "Users read their appointments" on public.appointments
  for select to authenticated using (auth.uid() = user_id);

create policy "Users create their appointments" on public.appointments
  for insert to authenticated with check (auth.uid() = user_id);

-- No se concede UPDATE directo a appointments; los cambios administrativos
-- se realizan mediante RPCs que validan el rol.
drop policy if exists "Users update their appointments" on public.appointments;

grant execute on function public.get_appointments_for_admin() to authenticated;
grant execute on function public.update_appointment_for_admin(
  uuid, text, text, date, time, text, text, numeric, text, text
) to authenticated;
grant execute on function public.delete_appointment_for_admin(uuid) to authenticated;
