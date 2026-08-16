-- Østfold Bud Service CRM — Phase 1 schema
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query -> paste -> Run).

create extension if not exists "pgcrypto";

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  pickup_address text not null,
  pickup_lat double precision,
  pickup_lng double precision,
  delivery_address text not null,
  delivery_lat double precision,
  delivery_lng double precision,
  weight_kg numeric not null,
  length_cm numeric not null,
  width_cm numeric not null,
  height_cm numeric not null,
  colli integer not null default 1,
  service_type text not null check (service_type in ('standard', 'ekspress')),
  distance_km numeric,
  price_estimate numeric,
  price_breakdown jsonb,
  status text not null default 'Ny' check (status in ('Ny', 'Kontaktet', 'Bekreftet', 'Avvist')),
  created_at timestamptz not null default now()
);

create index if not exists leads_customer_id_idx on leads(customer_id);
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_created_at_idx on leads(created_at desc);

-- Row Level Security: deny all access by default. The app never talks to
-- these tables from the browser — every read/write goes through Next.js
-- server code using the service_role key, which bypasses RLS entirely.
-- This just makes sure the anon/publishable key (used client-side only for
-- login) can never read or write customer/lead data directly.
alter table customers enable row level security;
alter table leads enable row level security;
