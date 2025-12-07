-- Create property media table
create table if not exists public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  media_url text not null,
  file_name text not null,
  display_order integer default 0,
  is_featured boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.property_media enable row level security;

-- RLS Policies for property media
create policy "property_media_select_all"
  on public.property_media for select
  using (true);

create policy "property_media_insert_own"
  on public.property_media for insert
  with check (
    exists (
      select 1 from public.properties
      where id = property_id and owner_id = auth.uid()
    )
  );

create policy "property_media_delete_own"
  on public.property_media for delete
  using (
    exists (
      select 1 from public.properties
      where id = property_id and owner_id = auth.uid()
    )
  );
