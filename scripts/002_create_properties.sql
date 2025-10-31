-- Create properties table
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric not null,
  property_type text not null check (property_type in ('house', 'apartment', 'event_center', 'land', 'commercial')),
  listing_type text not null check (listing_type in ('for_sale', 'for_rent', 'for_lease')),
  address text not null,
  city text not null,
  state text,
  postal_code text,
  country text not null,
  latitude numeric,
  longitude numeric,
  bedrooms integer,
  bathrooms numeric,
  square_feet numeric,
  year_built integer,
  status text not null default 'active' check (status in ('active', 'sold', 'rented', 'inactive')),
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.properties enable row level security;

-- RLS Policies for properties
create policy "properties_select_all"
  on public.properties for select
  using (status = 'active' or auth.uid() = owner_id);

create policy "properties_insert_own"
  on public.properties for insert
  with check (auth.uid() = owner_id);

create policy "properties_update_own"
  on public.properties for update
  using (auth.uid() = owner_id);

create policy "properties_delete_own"
  on public.properties for delete
  using (auth.uid() = owner_id);
