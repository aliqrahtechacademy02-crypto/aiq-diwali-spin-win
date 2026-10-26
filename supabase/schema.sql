-- Starter schema only. Review and test security policies before production.
create extension if not exists pgcrypto;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default false,
  max_spins_per_participant integer not null default 1 check (max_spins_per_participant > 0),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.prizes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  description text,
  prize_type text not null check (prize_type in ('discount_percent','discount_amount','workshop','bundle','guidance','special')),
  discount_value numeric(10,2),
  eligible_courses text[] not null default '{}',
  total_quantity integer check (total_quantity is null or total_quantity >= 0),
  awarded_quantity integer not null default 0 check (awarded_quantity >= 0),
  weight integer not null default 1 check (weight >= 0),
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  check (total_quantity is null or awarded_quantity <= total_quantity)
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  full_name text not null check (length(trim(full_name)) between 2 and 100),
  phone_e164 text not null,
  course_interest text not null,
  email text,
  terms_accepted_at timestamptz not null default now(),
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  unique (campaign_id, phone_e164)
);

create table if not exists public.spins (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  prize_id uuid not null references public.prizes(id),
  created_at timestamptz not null default now(),
  unique (campaign_id, participant_id)
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  spin_id uuid not null unique references public.spins(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  prize_id uuid not null references public.prizes(id),
  code text not null unique,
  status text not null default 'issued' check (status in ('issued','redeemed','expired','cancelled')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by uuid,
  cancellation_reason text
);

create table if not exists public.leads (
  participant_id uuid primary key references public.participants(id) on delete cascade,
  status text not null default 'new' check (status in ('new','contacted','interested','follow_up_required','admitted','not_interested')),
  follow_up_notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','manager')),
  created_at timestamptz not null default now()
);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id),
  admin_user_id uuid not null references auth.users(id),
  redeemed_at timestamptz not null default now(),
  notes text
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id),
  action text not null,
  target_type text,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists participants_campaign_created_idx on public.participants(campaign_id, created_at desc);
create index if not exists spins_campaign_created_idx on public.spins(campaign_id, created_at desc);
create index if not exists coupons_status_idx on public.coupons(status);
create index if not exists coupons_code_idx on public.coupons(code);

-- Deny public browser access by default. Add narrowly scoped policies only after
-- implementing a secure participant identity / server-side registration flow.
alter table public.campaigns enable row level security;
alter table public.prizes enable row level security;
alter table public.participants enable row level security;
alter table public.spins enable row level security;
alter table public.coupons enable row level security;
alter table public.leads enable row level security;
alter table public.admin_roles enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.audit_logs enable row level security;

-- Intentionally no public policies here. Use trusted Edge Functions with server-side
-- authorization for registration, prize allocation, and redemption. Admin policies
-- must verify the authenticated user's role in admin_roles.
