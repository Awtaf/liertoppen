-- Telia Liertoppen — Ansatt-app: innsjekk/utsjekk (GPS-geofence), timer,
-- oppgaver/rutiner og poeng/leaderboard for butikkens ansatte.
--
-- Dette er en helt egen, selvstendig del av databasen for en annen
-- virksomhet enn resten av dette repoet (kurerselskapet Østfold Bud
-- Service AS) — tabellene er derfor prefikset "staff_" for å unngå kollisjon
-- med eksisterende tabeller (customers, leads, zones, services, surcharges,
-- shipments, shipment_events, customer_invites) og med Supabase sin egen
-- auth.users. Ansatt-appen bruker IKKE Supabase Auth (se lib/staff/*.ts for
-- egen PIN/passord-innlogging), så staff_members har egne credential-felter
-- i stedet for en kobling til auth.users.

create table if not exists staff_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  username text not null unique,
  email text unique,
  pin_hash text,
  password_hash text,
  role text not null check (role in ('ansatt', 'leder')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists staff_shifts (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_members(id) on delete cascade,
  checkin_at timestamptz not null default now(),
  checkin_lat double precision not null,
  checkin_lng double precision not null,
  checkin_distance_m integer not null,
  checkout_at timestamptz,
  checkout_lat double precision,
  checkout_lng double precision,
  checkout_distance_m integer,
  checkout_corrected_by_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists staff_shifts_staff_id_idx on staff_shifts(staff_id);
create index if not exists staff_shifts_checkin_at_idx on staff_shifts(checkin_at desc);
-- Speeds up "glemt å sjekke ut"-varsling til leder (finn alle åpne økter).
create index if not exists staff_shifts_open_idx on staff_shifts(staff_id) where checkout_at is null;

create table if not exists staff_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  description text,
  type text not null check (type in ('daily', 'weekly', 'one_time')),
  points integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists staff_task_completions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff_members(id) on delete cascade,
  task_id uuid not null references staff_tasks(id) on delete cascade,
  -- "YYYY-MM-DD" for daglige oppgaver, ISO-uke "YYYY-Www" for ukentlige,
  -- eller "once" for engangsoppgaver. Sammen med unique-constraint under er
  -- dette hele nullstillingsmekanismen: en ny periode = en ny rad kan
  -- opprettes, og appen viser oppgaven som ikke fullført igjen.
  period_key text not null,
  completed_at timestamptz not null default now(),
  points_awarded integer not null default 0,
  unique (staff_id, task_id, period_key)
);

create index if not exists staff_task_completions_staff_id_idx on staff_task_completions(staff_id);
create index if not exists staff_task_completions_completed_at_idx on staff_task_completions(completed_at desc);

-- Nullstilling av poeng ("ny periode") lukker aktiv periode og åpner en ny,
-- i stedet for å slette/endre fullførte oppgaver — så historikken bevares
-- og kan revideres i ettertid.
create table if not exists staff_point_periods (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  starts_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists staff_point_periods_active_idx on staff_point_periods(ended_at) where ended_at is null;

-- Én rad i praksis (butikkens koordinater + geofence-radius).
create table if not exists staff_settings (
  id uuid primary key default gen_random_uuid(),
  store_lat double precision not null,
  store_lng double precision not null,
  radius_meters integer not null default 150,
  updated_at timestamptz not null default now()
);

-- Row Level Security: samme mønster som resten av databasen — deny-all som
-- standard, uten policies. All faktisk lesing/skriving skjer fra Next.js
-- server-kode via service_role-klienten (lib/supabase/admin.ts), etter en
-- manuell sesjonssjekk (lib/staff/auth.ts). RLS er dermed et
-- forsvar-i-dybden-nett, ikke et finmasket policy-system.
alter table staff_members enable row level security;
alter table staff_shifts enable row level security;
alter table staff_tasks enable row level security;
alter table staff_task_completions enable row level security;
alter table staff_point_periods enable row level security;
alter table staff_settings enable row level security;
