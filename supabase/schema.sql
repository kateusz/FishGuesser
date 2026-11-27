-- FishGuesser schema for the remote Supabase project (EU).
-- Run this file once in the SQL editor. No local stack.
-- The browser never talks to these tables. Next.js uses the secret key.

create table if not exists public.games (
  id uuid primary key,
  type text not null check (type in ('multiplayer', 'solo')),
  status text not null,
  code text unique,
  pool text not null,
  mode text not null,
  rounds_count smallint not null,
  seconds smallint,
  difficulty text not null,
  current_round smallint not null default 0,
  phase_ends_at bigint,
  host_user_id uuid not null,
  state_version bigint not null default 1,
  summary jsonb,
  created_at bigint not null
);

create table if not exists public.players (
  id uuid primary key,
  game_id uuid not null references public.games (id) on delete cascade,
  user_id uuid not null,
  nickname text not null,
  avatar_id text not null,
  status text not null,
  total_score integer not null default 0,
  accuracy_sum double precision not null default 0,
  response_sum bigint not null default 0,
  joined_at bigint not null,
  last_seen bigint not null,
  unique (game_id, user_id)
);

create unique index if not exists players_active_nick
  on public.players (game_id, lower(nickname))
  where status = 'active';

create table if not exists public.rounds (
  id uuid primary key,
  game_id uuid not null references public.games (id) on delete cascade,
  idx smallint not null,
  mode text not null,
  status text not null,
  question jsonb not null,
  truth jsonb not null,
  photo_token uuid not null unique,
  starts_at bigint,
  deadline_at bigint,
  unique (game_id, idx)
);

create table if not exists public.answers (
  id uuid primary key,
  round_id uuid not null references public.rounds (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  request_id uuid not null,
  answer jsonb not null,
  accuracy double precision not null,
  points integer not null,
  response_ms integer not null,
  submitted_at bigint not null,
  unique (round_id, player_id),
  unique (player_id, request_id)
);

create table if not exists public.rate_limits (
  bucket text primary key,
  hits integer not null,
  window_start bigint not null
);

alter table public.games enable row level security;
alter table public.players enable row level security;
alter table public.rounds enable row level security;
alter table public.answers enable row level security;
alter table public.rate_limits enable row level security;

drop policy if exists games_member_read on public.games;
drop policy if exists players_member_read on public.players;

revoke all on table public.games from anon, authenticated;
revoke all on table public.players from anon, authenticated;
revoke all on table public.rounds from anon, authenticated;
revoke all on table public.answers from anon, authenticated;
revoke all on table public.rate_limits from anon, authenticated;
