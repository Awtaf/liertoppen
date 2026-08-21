-- Østfold Bud Service — Fraktsystem Fase 1: soner, tjenester, tillegg og
-- sendinger. Extends 0001_init.sql (customers/leads unchanged).
--
-- Priser lever i disse tabellene, ikke i app-koden — admin kan endre satser
-- uten ny deploy (se app/admin/priser). Se ostfoldbud-system-spek.md §1-2.

create table if not exists zones (
  id uuid primary key default gen_random_uuid(),
  code integer not null unique,
  name text not null,
  -- Array of [min, max] postnr-prefiks-intervaller, f.eks. [[3000,3099]].
  postnr_ranges jsonb not null default '[]'::jsonb,
  express_start_price integer not null,
  per_stop_price integer,
  created_at timestamptz not null default now()
);

create table if not exists services (
  key text primary key,
  name text not null,
  description text,
  -- Tjenestespesifikke satser som ikke passer i zones-tabellen (pallepriser,
  -- timepris, km-tillegg utenfor sone). Redigeres i /admin/priser.
  config jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0
);

create table if not exists surcharges (
  key text primary key,
  label text not null,
  type text not null check (type in ('PCT', 'FIXED')),
  value numeric not null,
  sort_order integer not null default 0
);

create table if not exists shipments (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique,
  customer_id uuid references customers(id) on delete set null,
  sender jsonb not null,
  receiver jsonb not null,
  goods jsonb not null,
  service_key text not null references services(key),
  zone_id uuid references zones(id),
  requested_delivery text,
  price_breakdown jsonb not null,
  price_ex_mva integer not null,
  price_inc_mva integer not null,
  status text not null default 'BOOKET'
    check (status in ('BOOKET', 'TILDELT', 'HENTET', 'UNDERVEIS', 'LEVERT', 'AVVIK', 'KANSELLERT')),
  reference text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists shipments_customer_id_idx on shipments(customer_id);
create index if not exists shipments_status_idx on shipments(status);
create index if not exists shipments_created_at_idx on shipments(created_at desc);
create index if not exists shipments_tracking_number_idx on shipments(tracking_number);

create table if not exists shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references shipments(id) on delete cascade,
  status text not null,
  note text,
  occurred_at timestamptz not null default now()
);

create index if not exists shipment_events_shipment_id_idx on shipment_events(shipment_id);

-- Sporingsnummer genereres atomisk på server via denne sekvensen + funksjonen
-- (unngår race conditions ved samtidige bookinger). Format: OBS{ÅÅ}{MM}{DD}{løpenr4}.
create sequence if not exists shipment_tracking_seq;

create or replace function next_tracking_number()
returns text
language sql
as $$
  select 'OBS' || to_char(now(), 'YYMMDD') || lpad((nextval('shipment_tracking_seq') % 10000)::text, 4, '0');
$$;

-- Row Level Security: samme deny-all-mønster som 0001_init.sql. Appen
-- snakker aldri med disse tabellene fra nettleseren — alt går via
-- service_role-klienten på serveren.
alter table zones enable row level security;
alter table services enable row level security;
alter table surcharges enable row level security;
alter table shipments enable row level security;
alter table shipment_events enable row level security;

-- ---------------------------------------------------------------------------
-- Seed-data — startverdier fra ostfoldbud-system-spek.md §1.2-1.7. Redigeres
-- senere i /admin/priser, ikke ment å være permanente tall.
-- ---------------------------------------------------------------------------
insert into zones (code, name, postnr_ranges, express_start_price, per_stop_price) values
  (1, 'Sone 1 · Lokal', '[[3000,3099]]', 490, 120),
  (2, 'Sone 2 · Nær', '[[1370,1385],[3400,3449],[3480,3495]]', 690, 150),
  (3, 'Sone 3 · Bærum', '[[1300,1369]]', 850, 175),
  (4, 'Sone 4 · Oslo', '[[1,999]]', 990, 190),
  (5, 'Sone 5 · Østfold-korridoren', '[[1800,1899]]', 950, null)
on conflict (code) do nothing;

insert into services (key, name, description, config, sort_order) values
  ('EXPRESS', 'Bud / ekspress', 'Dedikert direktekjøring A→B. Startpris inkl. henting, første 10 km og 15 min lasting/lossing.',
    '{"kmRateOutsideZone": 22}', 1),
  ('SAMEDAY_ROUTE', 'Fast distribusjon', 'Samme-dag distribusjon på fast rute, pris per stopp. Minstepris 2 500 kr/rute/dag.',
    '{"minRoutePricePerDay": 2500, "fallbackPerStopPrice": 190}', 2),
  ('PALLET', 'Pallegods', 'Per EUR-pall, maks 700 kg, inkl. 15 min lasting/lossing.',
    '{"onRoutePrice": 350, "directPrice": 1200, "extraPalletPrice": 250, "onRouteMaxZoneCode": 2}', 3),
  ('HOURLY', 'Timepris', 'Dedikert bil + sjåfør, minimum 2 timer. Dagsleie (8t) 4 600 kr.',
    '{"perHour": 650, "minHours": 2, "fullDayHours": 8, "fullDayPrice": 4600}', 4)
on conflict (key) do nothing;

insert into surcharges (key, label, type, value, sort_order) values
  ('EXPRESS_GUARANTEE', 'Garantert innen 1–2 timer', 'PCT', 50, 1),
  ('EVENING_WEEKEND', 'Kveld (16–22) eller helg', 'PCT', 40, 2),
  ('NIGHT', 'Natt', 'PCT', 60, 3),
  ('CARRY', 'Bæring / etasjer / to mann', 'FIXED', 150, 4)
on conflict (key) do nothing;
