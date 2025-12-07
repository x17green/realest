-- Create inquiries table
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  status text not null default 'new' check (status in ('new', 'viewed', 'responded', 'closed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.inquiries enable row level security;

-- RLS Policies for inquiries
create policy "inquiries_select_own"
  on public.inquiries for select
  using (auth.uid() = sender_id or auth.uid() = owner_id);

create policy "inquiries_insert_own"
  on public.inquiries for insert
  with check (auth.uid() = sender_id);

create policy "inquiries_update_own"
  on public.inquiries for update
  using (auth.uid() = owner_id or auth.uid() = sender_id);
