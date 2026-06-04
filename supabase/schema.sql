create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  name text not null,
  email text unique not null,
  role text not null default '相談員',
  created_at timestamptz default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  status text not null default '新規相談',
  source text,
  assigned_user_id uuid,
  consultant_name text not null,
  consultant_kana text,
  consultant_phone text not null,
  consultant_email text,
  relationship text,
  consultant_area text,
  resident_name text,
  resident_age int,
  resident_gender text,
  current_address text,
  care_level text,
  dementia_status text,
  welfare_status text,
  medical_needs text,
  mental_illness text,
  guarantor_status text,
  budget text,
  desired_area text,
  desired_move_in_date text,
  note text,
  lp_name text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  gclid text,
  loss_reason text,
  reapproach_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.conversion_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  lead_id uuid references public.leads(id) on delete set null,
  label text,
  page_path text,
  referrer text,
  user_agent text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  user_id uuid,
  activity_type text not null,
  content text not null,
  next_action_date date,
  created_at timestamptz default now()
);

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  area text,
  nearest_station text,
  type text,
  capacity int,
  vacancy_count int default 0,
  monthly_fee int,
  initial_fee int,
  acceptable_care_levels text,
  accepts_dementia boolean default false,
  accepts_welfare boolean default false,
  medical_support text,
  end_of_life_care boolean default false,
  photo_url text,
  description text,
  management_note text,
  created_at timestamptz default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references public.facilities(id) on delete cascade,
  room_number text not null,
  floor text,
  rent int,
  common_fee int,
  meal_fee int,
  management_fee int,
  status text not null default '空室',
  note text,
  updated_at timestamptz default now()
);

create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  facility_id uuid references public.facilities(id),
  scheduled_at timestamptz not null,
  participants text,
  staff_id uuid,
  meeting_place text,
  result text,
  impression text,
  next_action text,
  note text,
  created_at timestamptz default now()
);

create table if not exists public.referrers (
  id uuid primary key default gen_random_uuid(),
  type text,
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  referral_count int default 0,
  tour_count int default 0,
  contract_count int default 0,
  expected_sales int default 0,
  last_contact_date date,
  note text
);

create table if not exists public.ad_reports (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  campaign_name text,
  ad_group_name text,
  keyword text,
  cost int default 0,
  impressions int default 0,
  clicks int default 0,
  conversions int default 0,
  tours int default 0,
  move_ins int default 0,
  cpa int,
  move_in_unit_cost int
);

alter table public.ad_reports add column if not exists cpa int;
alter table public.ad_reports add column if not exists move_in_unit_cost int;

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.lp_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  target_keyword text,
  hero_copy text,
  body jsonb default '{}'::jsonb,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.conversion_events enable row level security;
alter table public.facilities enable row level security;
alter table public.rooms enable row level security;
alter table public.tours enable row level security;
alter table public.referrers enable row level security;
alter table public.ad_reports enable row level security;
alter table public.lp_pages enable row level security;
alter table public.site_settings enable row level security;

create policy "public inquiry insert" on public.leads for insert to anon with check (true);
create policy "public conversion event insert" on public.conversion_events for insert to anon with check (event_type in ('CV2', 'CV3'));
create policy "service role full leads" on public.leads for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full activities" on public.lead_activities for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full conversion events" on public.conversion_events for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full facilities" on public.facilities for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full rooms" on public.rooms for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full tours" on public.tours for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full referrers" on public.referrers for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full ad reports" on public.ad_reports for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full lp pages" on public.lp_pages for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role full site settings" on public.site_settings for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
