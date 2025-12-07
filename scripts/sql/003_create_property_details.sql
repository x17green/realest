-- Create property details table
create table if not exists public.property_details (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  amenities text[] default array[]::text[],
  features text[] default array[]::text[],
  parking_spaces integer,
  has_pool boolean default false,
  has_garage boolean default false,
  has_garden boolean default false,
  heating_type text,
  cooling_type text,
  flooring_type text,
  roof_type text,
  foundation_type text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.property_details enable row level security;

-- RLS Policies for property details
create policy "property_details_select_all"
  on public.property_details for select
  using (true);

create policy "property_details_insert_own"
  on public.property_details for insert
  with check (
    exists (
      select 1 from public.properties
      where id = property_id and owner_id = auth.uid()
    )
  );

create policy "property_details_update_own"
  on public.property_details for update
  using (
    exists (
      select 1 from public.properties
      where id = property_id and owner_id = auth.uid()
    )
  );
