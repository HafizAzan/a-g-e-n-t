create table if not exists public.searches (
  id text primary key,
  query text not null default '',
  city text not null default '',
  country text not null default '',
  status text not null default 'queued',
  total_found integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id text primary key,
  search_id text not null references public.searches (id) on delete cascade,
  business_name text not null default '',
  category text not null default '',
  phone text not null default '',
  email text not null default '',
  website text not null default '',
  website_status text not null default 'unknown',
  lead_score integer not null default 0,
  address text not null default '',
  rating numeric not null default 0,
  review_count integer not null default 0,
  google_maps_url text not null default '',
  ai_notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- website_analysis (one row per lead website scan)
-- id | lead_id | mobile_friendly | https | seo_score | speed_score
-- technology | has_booking | has_contact_form | social_links | last_checked
-- ─────────────────────────────────────────────
create table if not exists public.website_analysis (
  id text primary key,
  lead_id text not null references public.leads (id) on delete cascade,
  mobile_friendly boolean not null default false,
  https boolean not null default false,
  seo_score integer not null default 0,
  speed_score integer not null default 0,
  technology jsonb not null default '[]'::jsonb,
  has_booking boolean not null default false,
  has_contact_form boolean not null default false,
  social_links jsonb not null default '[]'::jsonb,
  last_checked timestamptz not null default now()
);

create index if not exists leads_search_id_idx on public.leads (search_id);
create unique index if not exists website_analysis_lead_id_uidx
  on public.website_analysis (lead_id);

-- ─────────────────────────────────────────────
-- exports
-- id | search_id | file_url | created_at
-- ─────────────────────────────────────────────
create table if not exists public.exports (
  id text primary key,
  search_id text not null references public.searches (id) on delete cascade,
  file_url text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists exports_search_id_idx on public.exports (search_id);
