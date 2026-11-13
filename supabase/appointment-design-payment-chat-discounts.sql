create table if not exists public.catalog_designs (
  id text primary key,
  name text not null,
  artist text not null,
  style text not null,
  image_url text not null,
  stage text not null check (stage in ('hecho', 'proximo')),
  created_at timestamptz not null default now()
);

insert into public.catalog_designs (id, name, artist, style, image_url, stage)
values
  ('h-1', 'Dragon de Sombras', 'Carlos Ink', 'Realismo', 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=900&q=80', 'hecho'),
  ('h-2', 'Rosa en Tinta Negra', 'Ana Tattoo', 'Blackwork', 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80', 'hecho'),
  ('h-3', 'Linea Geometrica', 'Jordan Solorzano', 'Minimalista', 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=900&q=80', 'hecho')
on conflict (id) do nothing;

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
grant select on public.artists to authenticated;

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

grant execute on function public.get_artists_for_admin() to authenticated;
grant execute on function public.add_artist_for_admin(text) to authenticated;
grant execute on function public.remove_artist_for_admin(uuid) to authenticated;

alter table public.appointments
  add column if not exists tattoo_reference_path text,
  add column if not exists catalog_design_id text references public.catalog_designs(id) on delete set null,
  add column if not exists catalog_image_url text,
  add column if not exists payment_receipt_path text,
  add column if not exists ai_analysis jsonb,
  add column if not exists original_price numeric(10, 2),
  add column if not exists discount_code_id uuid,
  add column if not exists payment_verified_at timestamptz;

alter table public.appointments
  drop constraint if exists appointments_status_check;
alter table public.appointments
  add constraint appointments_status_check
  check (status in ('pendiente', 'confirmada', 'en diseño', 'completada', 'cancelada'));

alter table public.appointments
  drop constraint if exists appointments_catalog_design_id_fkey;
alter table public.appointments
  add constraint appointments_catalog_design_id_fkey
  foreign key (catalog_design_id) references public.catalog_designs(id) on delete restrict;

create table if not exists public.studio_payment_settings (
  id boolean primary key default true check (id),
  bank_name text not null default 'Banco Pichincha',
  account_holder text not null default '',
  account_type text not null default '',
  account_number text not null default '',
  account_id_number text not null default '',
  deposit_amount numeric(10, 2),
  updated_at timestamptz not null default now()
);

insert into public.studio_payment_settings (id)
values (true)
on conflict (id) do nothing;

create table if not exists public.appointment_messages (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sender_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('cliente', 'admin')),
  body text not null check (length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists appointment_messages_appointment_created_idx
  on public.appointment_messages (appointment_id, created_at);

create table if not exists public.appointment_discount_codes (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  code text not null unique,
  original_price numeric(10, 2) not null check (original_price >= 0),
  final_price numeric(10, 2) not null check (final_price >= 0 and final_price <= original_price),
  created_at timestamptz not null default now(),
  redeemed_at timestamptz
);

alter table public.appointments
  drop constraint if exists appointments_discount_code_id_fkey;
alter table public.appointments
  add constraint appointments_discount_code_id_fkey
  foreign key (discount_code_id) references public.appointment_discount_codes(id);

drop policy if exists "Users update their appointments" on public.appointments;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('tattoo-attachments', 'tattoo-attachments', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('tattoo-catalog', 'tattoo-catalog', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

alter table public.catalog_designs enable row level security;
alter table public.studio_payment_settings enable row level security;
alter table public.appointment_messages enable row level security;
alter table public.appointment_discount_codes enable row level security;

grant select on public.catalog_designs to anon, authenticated;
grant insert, update, delete on public.catalog_designs to authenticated;
grant select, insert, update on public.studio_payment_settings to authenticated;
grant select, insert on public.appointment_messages to authenticated;
grant select on public.appointment_discount_codes to authenticated;

drop policy if exists "Anyone can view tattoo catalog" on public.catalog_designs;
create policy "Anyone can view tattoo catalog" on public.catalog_designs
  for select to anon, authenticated using (true);
drop policy if exists "Admins manage tattoo catalog" on public.catalog_designs;
create policy "Admins manage tattoo catalog" on public.catalog_designs
  for all to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@inkiorn.com')
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@inkiorn.com');

drop policy if exists "Authenticated users read payment settings" on public.studio_payment_settings;
create policy "Authenticated users read payment settings" on public.studio_payment_settings
  for select to authenticated using (true);
drop policy if exists "Admins manage payment settings" on public.studio_payment_settings;
create policy "Admins manage payment settings" on public.studio_payment_settings
  for all to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@inkiorn.com')
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@inkiorn.com');

drop policy if exists "Appointment participants read messages" on public.appointment_messages;
create policy "Appointment participants read messages" on public.appointment_messages
  for select to authenticated using (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@inkiorn.com'
    or (user_id = auth.uid() and exists (
      select 1 from public.appointments a where a.id = appointment_id and a.user_id = auth.uid()
    ))
  );
drop policy if exists "Appointment participants send messages" on public.appointment_messages;
create policy "Appointment participants send messages" on public.appointment_messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and (
      (sender_role = 'admin' and lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@inkiorn.com')
      or (sender_role = 'cliente' and user_id = auth.uid() and exists (
        select 1 from public.appointments a where a.id = appointment_id and a.user_id = auth.uid()
      ))
    )
  );

create or replace function public.set_appointment_message_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select a.user_id into new.user_id
  from public.appointments a
  where a.id = new.appointment_id;

  if new.user_id is null then
    raise exception 'No se encontró la cita de esta conversación.';
  end if;
  return new;
end;
$$;

drop trigger if exists set_appointment_message_owner_trigger on public.appointment_messages;
create trigger set_appointment_message_owner_trigger
  before insert on public.appointment_messages
  for each row execute function public.set_appointment_message_owner();

drop policy if exists "Appointment owners and admins read discount codes" on public.appointment_discount_codes;
create policy "Appointment owners and admins read discount codes" on public.appointment_discount_codes
  for select to authenticated using (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@inkiorn.com'
    or exists (
      select 1 from public.appointments a
      where a.id = appointment_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "Users upload their appointment attachments" on storage.objects;
create policy "Users upload their appointment attachments" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'tattoo-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "Owners and admins read appointment attachments" on storage.objects;
create policy "Owners and admins read appointment attachments" on storage.objects
  for select to authenticated using (
    bucket_id = 'tattoo-attachments'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@inkiorn.com'
    )
  );
drop policy if exists "Owners and admins delete appointment attachments" on storage.objects;
create policy "Owners and admins delete appointment attachments" on storage.objects
  for delete to authenticated using (
    bucket_id = 'tattoo-attachments'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@inkiorn.com'
    )
  );

drop policy if exists "Admins upload tattoo catalog images" on storage.objects;
create policy "Admins upload tattoo catalog images" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'tattoo-catalog'
    and lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@inkiorn.com'
  );
drop policy if exists "Admins update tattoo catalog images" on storage.objects;
create policy "Admins update tattoo catalog images" on storage.objects
  for update to authenticated
  using (bucket_id = 'tattoo-catalog' and lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@inkiorn.com')
  with check (bucket_id = 'tattoo-catalog' and lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@inkiorn.com');
drop policy if exists "Admins delete tattoo catalog images" on storage.objects;
create policy "Admins delete tattoo catalog images" on storage.objects
  for delete to authenticated using (
    bucket_id = 'tattoo-catalog'
    and lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@inkiorn.com'
  );

create or replace function public.validate_appointment_payment_files()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT'
     and lower(coalesce(auth.jwt() ->> 'email', '')) <> 'admin@inkiorn.com'
     and auth.uid() = new.user_id then
    if new.payment_receipt_path is null
       or (storage.foldername(new.payment_receipt_path))[1] <> auth.uid()::text
       or not exists (
         select 1 from storage.objects
         where bucket_id = 'tattoo-attachments' and name = new.payment_receipt_path
       )
       or (new.tattoo_reference_path is null and new.catalog_design_id is null) then
      raise exception 'Adjunta el comprobante de abono y una referencia del diseño antes de enviar la cita.';
    end if;
    if new.tattoo_reference_path is not null and (
      (storage.foldername(new.tattoo_reference_path))[1] <> auth.uid()::text
      or not exists (
        select 1 from storage.objects
        where bucket_id = 'tattoo-attachments' and name = new.tattoo_reference_path
      )
    ) then
      raise exception 'La referencia debe ser un archivo cargado por tu cuenta.';
    end if;
    new.status := 'pendiente';
    new.payment_verified_at := null;
    new.original_price := null;
    new.discount_code_id := null;
  end if;

  if new.status = 'confirmada'
     and old.status is distinct from new.status
     and new.payment_verified_at is null then
    raise exception 'El admin debe verificar el pago antes de confirmar la cita.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_appointment_payment_files_trigger on public.appointments;
create trigger validate_appointment_payment_files_trigger
  before insert or update of status, payment_verified_at
  on public.appointments
  for each row execute function public.validate_appointment_payment_files();

create or replace function public.confirm_appointment_payment(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'admin@inkiorn.com' then
    raise exception 'No tienes permisos de administrador.';
  end if;

  update public.appointments
  set payment_verified_at = now(),
      status = 'confirmada'
  where id = p_id
    and payment_receipt_path is not null
    and status = 'pendiente';

  if not found then
    raise exception 'No se encontró una cita pendiente con comprobante para verificar.';
  end if;
end;
$$;

create or replace function public.create_discount_code_for_admin(
  p_appointment_id uuid,
  p_final_price numeric
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_original_price numeric(10, 2);
  v_code text;
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'admin@inkiorn.com' then
    raise exception 'No tienes permisos de administrador.';
  end if;

  select price into v_original_price
  from public.appointments
  where id = p_appointment_id and status in ('pendiente', 'confirmada')
  for update;

  if not found then
    raise exception 'No se encontró una cita activa para crear el descuento.';
  end if;
  if p_final_price < 0 or p_final_price > v_original_price then
    raise exception 'El precio final debe estar entre cero y el precio actual de la cita.';
  end if;

  delete from public.appointment_discount_codes
  where appointment_id = p_appointment_id and redeemed_at is null;

  v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
  insert into public.appointment_discount_codes (appointment_id, code, original_price, final_price)
  values (p_appointment_id, v_code, v_original_price, p_final_price);
  return v_code;
end;
$$;

create or replace function public.apply_discount_code(p_appointment_id uuid, p_code text)
returns table (original_price numeric, final_price numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_discount public.appointment_discount_codes%rowtype;
begin
  select dc.* into v_discount
  from public.appointment_discount_codes dc
  join public.appointments a on a.id = dc.appointment_id
  where dc.appointment_id = p_appointment_id
    and upper(dc.code) = upper(trim(p_code))
    and dc.redeemed_at is null
    and a.user_id = auth.uid()
    and a.status = 'pendiente'
  for update of dc;

  if not found then
    raise exception 'El código no es válido para esta cita o ya fue utilizado.';
  end if;

  update public.appointments
  set original_price = v_discount.original_price,
      price = v_discount.final_price,
      discount_code_id = v_discount.id
  where id = p_appointment_id;

  update public.appointment_discount_codes
  set redeemed_at = now()
  where id = v_discount.id;

  return query select v_discount.original_price, v_discount.final_price;
end;
$$;

create or replace function public.cancel_appointment_for_client(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.appointments
  set status = 'cancelada'
  where id = p_id
    and user_id = auth.uid()
    and status = 'pendiente';

  if not found then
    raise exception 'Solo puedes cancelar una cita pendiente.';
  end if;
end;
$$;

grant execute on function public.confirm_appointment_payment(uuid) to authenticated;
grant execute on function public.create_discount_code_for_admin(uuid, numeric) to authenticated;
grant execute on function public.apply_discount_code(uuid, text) to authenticated;
grant execute on function public.cancel_appointment_for_client(uuid) to authenticated;

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
  size_cm integer,
  notes text,
  price numeric,
  status text,
  tattoo_reference_path text,
  catalog_design_id text,
  catalog_image_url text,
  payment_receipt_path text,
  ai_analysis jsonb,
  original_price numeric,
  discount_code_id uuid,
  payment_verified_at timestamptz,
  user_id uuid
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
    a.price, a.status, a.tattoo_reference_path, a.catalog_design_id,
    a.catalog_image_url, a.payment_receipt_path, a.ai_analysis, a.original_price,
    a.discount_code_id, a.payment_verified_at, a.user_id
  from public.appointments a
  order by a.appointment_date asc, a.start_time asc nulls last;
end;
$$;

grant execute on function public.get_appointments_for_admin() to authenticated;

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

  perform pg_advisory_xact_lock(
    hashtext(lower(trim(new.artist))),
    hashtext(new.appointment_date::text)
  );

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

create or replace function public.create_appointment_with_fair_artist(
  p_id uuid,
  p_client_name text,
  p_style text,
  p_appointment_date date,
  p_start_time time,
  p_duration_minutes integer,
  p_price numeric,
  p_body_area text,
  p_size_cm integer,
  p_notes text,
  p_tattoo_reference_path text,
  p_catalog_design_id text,
  p_catalog_image_url text,
  p_payment_receipt_path text,
  p_ai_analysis jsonb
)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_artist text;
  v_artist_to_lock text;
begin
  if auth.uid() is null then
    raise exception 'Inicia sesión antes de solicitar una cita.';
  end if;

  if p_start_time is null or p_duration_minutes is null or p_duration_minutes <= 0 then
    raise exception 'Selecciona un horario válido para la cita.';
  end if;

  perform pg_advisory_xact_lock(hashtext('fair-artist-assignment'));

  for v_artist_to_lock in
    select artist.name
    from public.artists artist
    where artist.active
    order by lower(artist.name)
  loop
    perform pg_advisory_xact_lock(
      hashtext(lower(trim(v_artist_to_lock))),
      hashtext(p_appointment_date::text)
    );
  end loop;

  select artist.name
  into v_artist
  from public.artists artist
  where artist.active
    and not exists (
      select 1
      from public.appointments occupied
      where lower(occupied.artist) = lower(artist.name)
        and occupied.appointment_date = p_appointment_date
        and occupied.status <> 'cancelada'
        and occupied.start_time is not null
        and (occupied.start_time, occupied.start_time + (occupied.duration_minutes || ' minutes')::interval)
          overlaps (p_start_time, p_start_time + (p_duration_minutes || ' minutes')::interval)
    )
  order by (
    select count(*)
    from public.appointments assigned
    where lower(assigned.artist) = lower(artist.name)
      and assigned.status in ('pendiente', 'confirmada')
      and assigned.appointment_date >= current_date
  ), random()
  limit 1;

  if v_artist is null then
    raise exception 'No hay tatuadores disponibles para ese horario. Elige otra hora.';
  end if;

  insert into public.appointments (
    id,
    user_id,
    client_name,
    artist,
    style,
    appointment_date,
    start_time,
    duration_minutes,
    body_area,
    size_cm,
    notes,
    price,
    status,
    tattoo_reference_path,
    catalog_design_id,
    catalog_image_url,
    payment_receipt_path,
    ai_analysis
  )
  values (
    p_id,
    auth.uid(),
    p_client_name,
    v_artist,
    p_style,
    p_appointment_date,
    p_start_time,
    p_duration_minutes,
    p_body_area,
    p_size_cm,
    p_notes,
    p_price,
    'pendiente',
    p_tattoo_reference_path,
    p_catalog_design_id,
    p_catalog_image_url,
    p_payment_receipt_path,
    p_ai_analysis
  );

  return v_artist;
end;
$$;

grant execute on function public.create_appointment_with_fair_artist(
  uuid, text, text, date, time, integer, numeric, text, integer, text, text, text, text, text, jsonb
) to authenticated;
