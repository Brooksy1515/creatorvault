create extension if not exists "pgcrypto";

create type public.platform_type as enum ('TikTok Shop', 'Amazon', 'Instagram', 'YouTube Shorts', 'Pinterest');
create type public.sample_status_type as enum ('not requested', 'requested', 'approved', 'shipped', 'delivered', 'ready to film', 'received', 'needs follow-up');
create type public.script_status_type as enum ('idea', 'scripted', 'filmed', 'posted');
create type public.calendar_status_type as enum ('planned', 'filming', 'editing', 'scheduled', 'posted');
create type public.asset_type as enum ('raw clip', 'ai clip', 'capcut export', 'tiktok draft backup', 'final video', 'reusable b-roll', 'thumbnail', 'voiceover');
create type public.asset_status as enum ('needs review', 'usable', 'needs edit', 'final', 'posted', 'reuse later', 'needs refilm');
create type public.connected_account_platform as enum ('TikTok', 'TikTok Shop', 'Instagram', 'Amazon');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  creator_niche text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text,
  category text not null,
  platform public.platform_type not null,
  product_link text,
  sample_status public.sample_status_type not null default 'not requested',
  sample_approved_at date,
  shipped_at date,
  expected_delivery_at date,
  delivered_at date,
  tracking_number text,
  tracking_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  hook text not null,
  created_at timestamptz not null default now()
);

create table public.scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  hook_id uuid references public.hooks(id) on delete set null,
  title text not null,
  hook text not null,
  pain_point text,
  voiceover text,
  on_screen_text text,
  cta text,
  hashtags text[],
  status public.script_status_type not null default 'idea',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_calendar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  script_id uuid references public.scripts(id) on delete set null,
  filming_date date,
  post_date date,
  platform public.platform_type not null,
  status public.calendar_status_type not null default 'planned',
  notes text,
  created_at timestamptz not null default now()
);

create table public.film_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  filming_date date not null default current_date,
  location text,
  shot_list text,
  capture_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.film_batch_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  batch_id uuid not null references public.film_batches(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  script_id uuid references public.scripts(id) on delete set null,
  missing_shots text,
  created_at timestamptz not null default now(),
  unique(batch_id, product_id)
);

create table public.content_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  script_id uuid references public.scripts(id) on delete set null,
  batch_id uuid references public.film_batches(id) on delete set null,
  calendar_id uuid references public.content_calendar(id) on delete set null,
  title text not null,
  asset_type public.asset_type not null,
  status public.asset_status not null default 'needs review',
  storage_url text,
  source_app text,
  file_name text,
  notes text,
  reuse_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform public.connected_account_platform not null,
  account_handle text,
  external_account_id text,
  scopes text[],
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  connected_at timestamptz not null default now(),
  unique(user_id, platform, external_account_id)
);

create table public.tiktok_videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  connected_account_id uuid references public.connected_accounts(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  script_id uuid references public.scripts(id) on delete set null,
  asset_id uuid references public.content_assets(id) on delete set null,
  external_video_id text,
  title text,
  video_url text,
  thumbnail_url text,
  posted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.showcase_product_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  connected_account_id uuid references public.connected_accounts(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  external_showcase_product_id text,
  showcase_title text,
  showcase_url text,
  match_status text not null default 'needs confirm',
  created_at timestamptz not null default now(),
  unique(user_id, connected_account_id, external_showcase_product_id)
);

create table public.performance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  script_id uuid references public.scripts(id) on delete set null,
  calendar_id uuid references public.content_calendar(id) on delete set null,
  views integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  clicks integer not null default 0,
  sales integer not null default 0,
  notes text,
  tracked_at date not null default current_date,
  created_at timestamptz not null default now()
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

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger scripts_set_updated_at
before update on public.scripts
for each row execute function public.set_updated_at();

create trigger film_batches_set_updated_at
before update on public.film_batches
for each row execute function public.set_updated_at();

create trigger content_assets_set_updated_at
before update on public.content_assets
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.hooks enable row level security;
alter table public.scripts enable row level security;
alter table public.content_calendar enable row level security;
alter table public.film_batches enable row level security;
alter table public.film_batch_products enable row level security;
alter table public.content_assets enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.tiktok_videos enable row level security;
alter table public.showcase_product_matches enable row level security;
alter table public.performance enable row level security;

create policy "Users manage own profile" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage own products" on public.products
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own hooks" on public.hooks
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own scripts" on public.scripts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own calendar" on public.content_calendar
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own film batches" on public.film_batches
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own batch products" on public.film_batch_products
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own content assets" on public.content_assets
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own connected accounts" on public.connected_accounts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own tiktok videos" on public.tiktok_videos
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own showcase matches" on public.showcase_product_matches
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own performance" on public.performance
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index products_user_id_idx on public.products(user_id);
create index products_platform_idx on public.products(platform);
create index hooks_user_id_category_idx on public.hooks(user_id, category);
create index scripts_user_id_status_idx on public.scripts(user_id, status);
create index calendar_user_id_dates_idx on public.content_calendar(user_id, filming_date, post_date);
create index film_batches_user_id_date_idx on public.film_batches(user_id, filming_date);
create index film_batch_products_batch_idx on public.film_batch_products(batch_id);
create index content_assets_user_id_type_status_idx on public.content_assets(user_id, asset_type, status);
create index content_assets_product_id_idx on public.content_assets(product_id);
create index connected_accounts_user_id_platform_idx on public.connected_accounts(user_id, platform);
create index tiktok_videos_user_id_product_idx on public.tiktok_videos(user_id, product_id);
create index showcase_matches_user_id_product_idx on public.showcase_product_matches(user_id, product_id);
create index performance_product_id_idx on public.performance(product_id);
create index performance_user_id_tracked_at_idx on public.performance(user_id, tracked_at);
