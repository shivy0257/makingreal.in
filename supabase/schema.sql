-- MAKINGREAL creator studio schema.
-- Run once in the Supabase SQL editor (Project -> SQL -> New query), then run the
-- admin promotion statement at the bottom with your own email.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text unique not null,
  display_name text not null default 'New creator',
  headline text,
  bio text,
  location text,
  specialties text[] not null default '{}',
  website text,
  instagram text,
  avatar_url text,
  cover_url text,
  availability text,
  role text not null default 'creator' check (role in ('creator', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_status_idx on public.profiles (status, updated_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.protect_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.role := 'creator';
      new.status := 'pending';
    else
      new.role := old.role;
      -- Saving a rejected profile sends it back for review so creators can resubmit.
      new.status := case when old.status = 'rejected' then 'pending' else old.status end;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_profile on public.profiles;
create trigger protect_profile before insert or update on public.profiles
for each row execute function public.protect_profile();

-- Creates a pending profile for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
  suffix int := 0;
begin
  base := lower(regexp_replace(split_part(coalesce(new.email, 'creator'), '@', 1), '[^a-z0-9]+', '-', 'g'));
  base := trim(both '-' from base);
  if base = '' then base := 'creator'; end if;
  candidate := base;
  while exists (select 1 from public.profiles where slug = candidate) loop
    suffix := suffix + 1;
    candidate := base || '-' || suffix;
  end loop;
  insert into public.profiles (id, slug, display_name)
  values (new.id, candidate, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read" on public.profiles for select
using (status = 'approved' or id = auth.uid() or public.is_admin());

drop policy if exists "profiles own insert" on public.profiles;
create policy "profiles own insert" on public.profiles for insert to authenticated
with check (id = auth.uid());

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles admin delete" on public.profiles;
create policy "profiles admin delete" on public.profiles for delete to authenticated
using (public.is_admin());

grant select on public.profiles to anon, authenticated;
grant insert, update, delete on public.profiles to authenticated;

-- ---------------------------------------------------------- portfolio items
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  caption text,
  category text,
  year int check (year is null or (year between 1900 and 2100)),
  image_url text not null,
  width int,
  height int,
  position int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists portfolio_items_owner_idx on public.portfolio_items (owner_id, status, position, created_at desc);
create index if not exists portfolio_items_status_idx on public.portfolio_items (status, created_at);

create or replace function public.protect_portfolio_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  creator_approved boolean;
begin
  if public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.owner_id := auth.uid();
    select status = 'approved' into creator_approved from public.profiles where id = auth.uid();
    new.status := case when coalesce(creator_approved, false) then 'published' else 'pending' end;
  else
    new.owner_id := old.owner_id;
    new.status := old.status;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_portfolio_item on public.portfolio_items;
create trigger protect_portfolio_item before insert or update on public.portfolio_items
for each row execute function public.protect_portfolio_item();

alter table public.portfolio_items enable row level security;

drop policy if exists "items public read" on public.portfolio_items;
create policy "items public read" on public.portfolio_items for select
using (status = 'published' or owner_id = auth.uid() or public.is_admin());

drop policy if exists "items own insert" on public.portfolio_items;
create policy "items own insert" on public.portfolio_items for insert to authenticated
with check (owner_id = auth.uid());

drop policy if exists "items own update" on public.portfolio_items;
create policy "items own update" on public.portfolio_items for update to authenticated
using (owner_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "items own delete" on public.portfolio_items;
create policy "items own delete" on public.portfolio_items for delete to authenticated
using (owner_id = auth.uid() or public.is_admin());

grant select on public.portfolio_items to anon, authenticated;
grant insert, update, delete on public.portfolio_items to authenticated;

-- --------------------------------------------------------------- storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = true, file_size_limit = 8388608, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "portfolio public read" on storage.objects;
create policy "portfolio public read" on storage.objects for select
using (bucket_id = 'portfolio');

drop policy if exists "portfolio owner upload" on storage.objects;
create policy "portfolio owner upload" on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "portfolio owner update" on storage.objects;
create policy "portfolio owner update" on storage.objects for update to authenticated
using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "portfolio owner delete" on storage.objects;
create policy "portfolio owner delete" on storage.objects for delete to authenticated
using (bucket_id = 'portfolio' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- Promote your own account after signing in once. Replace the email.
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
