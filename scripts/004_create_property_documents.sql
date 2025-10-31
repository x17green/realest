-- Create property documents table
create table if not exists public.property_documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  document_type text not null check (document_type in ('title_deed', 'building_permit', 'energy_certificate', 'survey', 'inspection_report', 'other')),
  document_url text not null,
  file_name text not null,
  file_size integer,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  verified_by uuid references public.profiles(id),
  verified_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.property_documents enable row level security;

-- RLS Policies for property documents
create policy "property_documents_select_all"
  on public.property_documents for select
  using (true);

create policy "property_documents_insert_own"
  on public.property_documents for insert
  with check (
    exists (
      select 1 from public.properties
      where id = property_id and owner_id = auth.uid()
    )
  );

create policy "property_documents_update_own"
  on public.property_documents for update
  using (
    exists (
      select 1 from public.properties
      where id = property_id and owner_id = auth.uid()
    )
  );
