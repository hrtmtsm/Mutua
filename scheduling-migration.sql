-- ── Scheduling System Migration ───────────────────────────────────────────────
-- Run this in your Supabase SQL editor AFTER the base schema.sql
-- Implements: docs/scheduling-spec.md

-- ── 1. Add scheduling columns to matches ──────────────────────────────────────

alter table matches
  add column if not exists scheduling_state       text        not null default 'pending_both',
  add column if not exists scheduled_at           timestamptz,
  add column if not exists availability_a_set_at  timestamptz,
  add column if not exists availability_b_set_at  timestamptz,
  add column if not exists expires_at             timestamptz;

-- Set expiration for existing matches that don't have it yet
update matches
  set expires_at = created_at + interval '7 days'
  where expires_at is null;

-- Migrate existing 'confirmed' rows to scheduled state
update matches
  set scheduling_state = 'scheduled',
      scheduled_at     = suggested_time
  where status = 'confirmed'
    and scheduled_at is null;

-- ── 2. user_availability ──────────────────────────────────────────────────────
-- One row per 30-min block per user.
-- day_of_week: 0=Mon … 6=Sun
-- start_minute: minutes from midnight (0–1410, step 30)
-- timezone: IANA string stored at write time; never converted at rest

create table if not exists user_availability (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users (id) on delete cascade,
  day_of_week  int         not null check (day_of_week between 0 and 6),
  start_minute int         not null check (start_minute >= 0 and start_minute <= 1410 and start_minute % 30 = 0),
  timezone     text        not null,
  updated_at   timestamptz not null default now()
);

-- One row per (user, day, minute) — prevent duplicates
create unique index if not exists user_availability_unique_idx
  on user_availability (user_id, day_of_week, start_minute);

create index if not exists user_availability_user_idx
  on user_availability (user_id);

alter table user_availability enable row level security;

-- Users can only read/write their own availability
create policy "user_availability_select" on user_availability
  for select using (auth.uid() = user_id);

create policy "user_availability_insert" on user_availability
  for insert with check (auth.uid() = user_id);

create policy "user_availability_update" on user_availability
  for update using (auth.uid() = user_id);

create policy "user_availability_delete" on user_availability
  for delete using (auth.uid() = user_id);

-- ── 3. confirmed_sessions ─────────────────────────────────────────────────────
-- One row per user per confirmed session (two rows per match slot).
-- Used by scheduler to exclude already-booked time.

create table if not exists confirmed_sessions (
  id         uuid        primary key default gen_random_uuid(),
  match_id   uuid        not null references matches (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,  -- always starts_at + 30 min
  created_at timestamptz not null default now()
);

create index if not exists confirmed_sessions_user_time_idx
  on confirmed_sessions (user_id, starts_at);

create index if not exists confirmed_sessions_match_idx
  on confirmed_sessions (match_id);

alter table confirmed_sessions enable row level security;

-- Users can see their own sessions; service role handles inserts
create policy "confirmed_sessions_select" on confirmed_sessions
  for select using (auth.uid() = user_id);

-- Service role (API routes) inserts on behalf of users
create policy "confirmed_sessions_service_insert" on confirmed_sessions
  for insert with check (true);

-- ── 4. Index on matches scheduling state ──────────────────────────────────────

create index if not exists matches_scheduling_state_idx
  on matches (scheduling_state);

create index if not exists matches_expires_at_idx
  on matches (expires_at)
  where scheduling_state not in ('scheduled', 'archived');

-- ── 5. Transaction-safe slot booking function ────────────────────────────────
-- Called by the scheduler to atomically:
--   a) re-check neither user has a conflicting confirmed session
--   b) insert two rows into confirmed_sessions
--   c) update matches.scheduling_state + scheduled_at

create or replace function book_session_slot(
  p_match_id   uuid,
  p_user_id_a  uuid,
  p_user_id_b  uuid,
  p_starts_at  timestamptz,
  p_ends_at    timestamptz
) returns void
language plpgsql
security definer
as $$
begin
  -- Re-check: no confirmed session overlaps this slot for either user
  if exists (
    select 1 from confirmed_sessions
    where user_id = p_user_id_a
      and starts_at < p_ends_at
      and ends_at   > p_starts_at
  ) or exists (
    select 1 from confirmed_sessions
    where user_id = p_user_id_b
      and starts_at < p_ends_at
      and ends_at   > p_starts_at
  ) then
    raise exception 'slot_conflict: slot already taken';
  end if;

  -- Insert confirmed sessions (one row per user)
  insert into confirmed_sessions (match_id, user_id, starts_at, ends_at) values
    (p_match_id, p_user_id_a, p_starts_at, p_ends_at),
    (p_match_id, p_user_id_b, p_starts_at, p_ends_at);

  -- Update match state
  update matches
    set scheduling_state = 'scheduled',
        scheduled_at     = p_starts_at
    where id = p_match_id;
end;
$$;

-- ── Done ──────────────────────────────────────────────────────────────────────
-- Next: run src/lib/scheduler.ts via /api/schedule-match
