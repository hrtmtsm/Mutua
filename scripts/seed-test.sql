-- Mutua test seed script
-- Run this in Supabase SQL editor on any project to set up two linked test accounts
-- in a scheduled state so you can test the full session flow immediately.
--
-- Usage:
--   1. Open Supabase dashboard → SQL editor
--   2. Paste and run this script
--   3. Grab the restore links at the bottom and open them in two browsers/devices

-- ── Config ────────────────────────────────────────────────────────────────────
-- Change these if you want different test identities
DO $$
DECLARE
  sid_a   text := 'test-user-a-' || gen_random_uuid();
  sid_b   text := 'test-user-b-' || gen_random_uuid();
  match_id uuid := gen_random_uuid();
  app_url  text := 'https://trymutua.com'; -- change to staging URL when testing on staging
BEGIN

  -- ── Profiles ──────────────────────────────────────────────────────────────
  INSERT INTO profiles (session_id, email, name, native_language, learning_language, goal, comm_style, practice_frequency)
  VALUES
    (sid_a, 'test-a@trymutua.com', 'Test User A', 'English',  'Japanese', 'Casual conversation', 'Video call', 'Once a week'),
    (sid_b, 'test-b@trymutua.com', 'Test User B', 'Japanese', 'English',  'Casual conversation', 'Video call', 'Once a week')
  ON CONFLICT (session_id) DO UPDATE
    SET name = EXCLUDED.name, email = EXCLUDED.email;

  -- ── Match: scheduled 10 minutes from now ──────────────────────────────────
  INSERT INTO matches (
    id,
    session_id_a, session_id_b,
    name_a,        name_b,
    email_a,       email_b,
    native_language_a, native_language_b,
    goal, comm_style, practice_frequency,
    scheduling_state,
    scheduled_at
  ) VALUES (
    match_id,
    sid_a, sid_b,
    'Test User A', 'Test User B',
    'test-a@trymutua.com', 'test-b@trymutua.com',
    'English', 'Japanese',
    'Casual conversation', 'Video call', 'Once a week',
    'scheduled',
    NOW() + interval '10 minutes'
  )
  ON CONFLICT DO NOTHING;

  -- ── Print restore links ────────────────────────────────────────────────────
  RAISE NOTICE '---';
  RAISE NOTICE 'User A restore link: %/auth/restore?sid=%', app_url, sid_a;
  RAISE NOTICE 'User B restore link: %/auth/restore?sid=%', app_url, sid_b;
  RAISE NOTICE 'Session starts at: %', NOW() + interval '10 minutes';
  RAISE NOTICE '---';

END $$;
