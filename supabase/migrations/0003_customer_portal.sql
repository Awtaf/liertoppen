-- Østfold Bud Service — Kundeportal: invitasjonsbasert onboarding.
--
-- VIKTIG: kunder kan IKKE selv opprette en bruker noe sted på nettsiden.
-- Eier genererer en engangslenke fra /admin/kunder/[id] og sender den selv
-- (e-post/SMS/annet) først når dere er blitt enige. Lenken er gyldig i
-- 7 dager og kan kun brukes én gang.

alter table customers add column if not exists user_id uuid references auth.users(id);
create unique index if not exists customers_user_id_idx on customers(user_id) where user_id is not null;

create table if not exists customer_invites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create index if not exists customer_invites_customer_id_idx on customer_invites(customer_id);
create index if not exists customer_invites_token_idx on customer_invites(token);

alter table customer_invites enable row level security;
