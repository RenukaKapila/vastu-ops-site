-- Vastu Ops inquiry table for Supabase Free Plan.
-- Security model:
-- - Anonymous website visitors can insert simple inquiry rows.
-- - Anonymous users cannot read, update, or delete inquiries.
-- - Approved admins can read, create, schedule, and update inquiry records.
-- - Never expose a service role key in the public website.

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  service_interested_in text not null,
  consultation_type text not null,
  message text,
  preferred_contact_method text,
  scheduled_for timestamptz,
  admin_notes text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inquiries_full_name_required check (length(trim(full_name)) > 0),
  constraint inquiries_phone_required check (length(trim(phone)) > 0),
  constraint inquiries_service_allowed check (service_interested_in in ('Vastu', 'Numerology', 'Remedies')),
  constraint inquiries_consultation_type_allowed check (consultation_type in ('in-person', 'online')),
  constraint inquiries_vastu_in_person_only check (
    service_interested_in <> 'Vastu' or consultation_type = 'in-person'
  ),
  constraint inquiries_status_allowed check (status in ('new', 'contacted', 'booked', 'closed'))
);

alter table public.inquiries enable row level security;

grant usage on schema public to anon;
grant usage on schema public to authenticated;
grant insert on public.inquiries to anon;
grant select, insert, update on public.inquiries to authenticated;

alter table public.inquiries add column if not exists scheduled_for timestamptz;
alter table public.inquiries add column if not exists admin_notes text not null default '';
alter table public.inquiries add column if not exists updated_at timestamptz not null default now();

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  constraint admin_users_display_name_required check (length(trim(display_name)) > 0)
);

alter table public.admin_users enable row level security;
grant select on public.admin_users to authenticated;

create or replace function public.is_vastu_ops_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_vastu_ops_admin() to authenticated;

drop policy if exists "Allow anonymous inquiry inserts only" on public.inquiries;
create policy "Allow anonymous inquiry inserts only"
on public.inquiries
for insert
to anon
with check (
  length(trim(full_name)) > 0
  and length(trim(phone)) > 0
  and service_interested_in in ('Vastu', 'Numerology', 'Remedies')
  and consultation_type in ('in-person', 'online')
  and (service_interested_in <> 'Vastu' or consultation_type = 'in-person')
);

drop policy if exists "Allow approved admins to read inquiries" on public.inquiries;
create policy "Allow approved admins to read inquiries"
on public.inquiries
for select
to authenticated
using (public.is_vastu_ops_admin());

drop policy if exists "Allow approved admins to create inquiries" on public.inquiries;
create policy "Allow approved admins to create inquiries"
on public.inquiries
for insert
to authenticated
with check (public.is_vastu_ops_admin());

drop policy if exists "Allow approved admins to update inquiries" on public.inquiries;
create policy "Allow approved admins to update inquiries"
on public.inquiries
for update
to authenticated
using (public.is_vastu_ops_admin())
with check (public.is_vastu_ops_admin());

drop policy if exists "Allow admins to read admin users" on public.admin_users;
create policy "Allow admins to read admin users"
on public.admin_users
for select
to authenticated
using (public.is_vastu_ops_admin() or user_id = auth.uid());

-- No select/update/delete policies are created for anon users.
-- With Row Level Security enabled, this prevents public reads and edits.
-- No delete policy is created for admins; use status updates instead of deleting records.
