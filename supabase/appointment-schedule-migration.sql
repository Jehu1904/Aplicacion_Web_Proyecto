alter table public.appointments add column if not exists start_time time;
alter table public.appointments add column if not exists duration_minutes integer not null default 60;

create or replace function public.get_artist_schedule(p_artist text, p_date date)
returns table (start_time time, duration_minutes integer)
language sql
security definer
set search_path = public
as $$
  select a.start_time, a.duration_minutes
  from public.appointments a
  where lower(a.artist) = lower(trim(p_artist))
    and a.appointment_date = p_date
    and a.status <> 'cancelada'
    and a.start_time is not null;
$$;

grant execute on function public.get_artist_schedule(text, date) to authenticated;

create or replace function public.prevent_appointment_overlap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.start_time is null then
    return new;
  end if;

  if exists (
    select 1
    from public.appointments a
    where lower(a.artist) = lower(trim(new.artist))
      and a.appointment_date = new.appointment_date
      and a.status <> 'cancelada'
      and a.start_time is not null
      and (a.start_time, a.start_time + (a.duration_minutes || ' minutes')::interval)
        overlaps (new.start_time, new.start_time + (new.duration_minutes || ' minutes')::interval)
      and (tg_op = 'INSERT' or a.id <> new.id)
  ) then
    raise exception 'El tatuador ya tiene una cita que se cruza con ese horario.';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_appointment_schedule on public.appointments;
create trigger validate_appointment_schedule
  before insert or update of artist, appointment_date, start_time, duration_minutes, status
  on public.appointments
  for each row execute function public.prevent_appointment_overlap();