alter table public.profiles add column if not exists avatar_scale numeric not null default 1;
alter table public.profiles add column if not exists avatar_position_x integer not null default 50;
alter table public.profiles add column if not exists avatar_position_y integer not null default 50;