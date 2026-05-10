create extension if not exists pgcrypto;

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  budget_amount numeric(10, 2) not null default 0,
  currency text not null default 'USD',
  is_public boolean not null default false,
  public_slug text not null unique default substring(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_valid_dates check (end_date >= start_date)
);

create table if not exists public.stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  city text not null,
  country text not null,
  start_date date not null,
  end_date date not null,
  stay_cost numeric(10, 2) not null default 0,
  transport_cost numeric(10, 2) not null default 0,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stops_valid_dates check (end_date >= start_date)
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  stop_id uuid not null references public.stops(id) on delete cascade,
  activity_date date not null,
  title text not null,
  category text not null default 'activity',
  start_time time,
  duration_minutes integer,
  cost numeric(10, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_category_check check (
    category in ('flight', 'hotel', 'food', 'transport', 'activity', 'shopping', 'other')
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trips_set_updated_at on public.trips;
create trigger trips_set_updated_at
before update on public.trips
for each row execute function public.set_updated_at();

drop trigger if exists stops_set_updated_at on public.stops;
create trigger stops_set_updated_at
before update on public.stops
for each row execute function public.set_updated_at();

drop trigger if exists activities_set_updated_at on public.activities;
create trigger activities_set_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

alter table public.trips enable row level security;
alter table public.stops enable row level security;
alter table public.activities enable row level security;

grant select, insert, update, delete on table public.trips to authenticated;
grant select, insert, update, delete on table public.stops to authenticated;
grant select, insert, update, delete on table public.activities to authenticated;

grant select on table public.trips to anon;
grant select on table public.stops to anon;
grant select on table public.activities to anon;

drop policy if exists "trips_owner_all" on public.trips;
create policy "trips_owner_all"
on public.trips for all
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "trips_public_read" on public.trips;
create policy "trips_public_read"
on public.trips for select
to anon, authenticated
using (is_public = true);

drop policy if exists "stops_owner_all" on public.stops;
create policy "stops_owner_all"
on public.stops for all
to authenticated
using (
  exists (
    select 1
    from public.trips
    where trips.id = stops.trip_id
    and trips.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.trips
    where trips.id = stops.trip_id
    and trips.owner_id = (select auth.uid())
  )
);

drop policy if exists "stops_public_read" on public.stops;
create policy "stops_public_read"
on public.stops for select
to anon, authenticated
using (
  exists (
    select 1
    from public.trips
    where trips.id = stops.trip_id
    and trips.is_public = true
  )
);

drop policy if exists "activities_owner_all" on public.activities;
create policy "activities_owner_all"
on public.activities for all
to authenticated
using (
  exists (
    select 1
    from public.trips
    where trips.id = activities.trip_id
    and trips.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.trips
    where trips.id = activities.trip_id
    and trips.owner_id = (select auth.uid())
  )
);

drop policy if exists "activities_public_read" on public.activities;
create policy "activities_public_read"
on public.activities for select
to anon, authenticated
using (
  exists (
    select 1
    from public.trips
    where trips.id = activities.trip_id
    and trips.is_public = true
  )
);

create index if not exists trips_owner_id_idx on public.trips(owner_id);
create index if not exists trips_public_slug_idx on public.trips(public_slug);
create index if not exists stops_trip_id_sort_order_idx on public.stops(trip_id, sort_order);
create index if not exists activities_trip_id_idx on public.activities(trip_id);
create index if not exists activities_stop_id_date_idx on public.activities(stop_id, activity_date);
