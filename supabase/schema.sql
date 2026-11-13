-- Ejecutar este script una vez en Supabase: SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists avatar_scale numeric not null default 1;
alter table public.profiles add column if not exists avatar_position_x integer not null default 50;
alter table public.profiles add column if not exists avatar_position_y integer not null default 50;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_name text not null,
  artist text not null,
  style text not null,
  appointment_date date not null,
  start_time time,
  duration_minutes integer not null default 60,
  body_area text not null,
  size_cm integer,
  notes text,
  price numeric(10, 2) not null default 0,
  status text not null default 'pendiente' check (status in ('pendiente', 'confirmada', 'en diseño', 'completada', 'cancelada')),
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.appointments enable row level security;

create policy "Users read their profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Users create their profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "Users update their profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users read their appointments" on public.appointments
  for select to authenticated using (auth.uid() = user_id);
create policy "Users create their appointments" on public.appointments
  for insert to authenticated with check (auth.uid() = user_id);
-- Appointment changes go through RPCs that validate the caller's role.
drop policy if exists "Users update their appointments" on public.appointments;

create policy "Users upload their avatars" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users update their avatars" on storage.objects
  for update to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users delete their avatars" on storage.objects
  for delete to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );