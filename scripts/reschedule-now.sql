-- Reschedule a match to 5 minutes from now so you can test the session join flow.
-- Run in Supabase SQL editor.
--
-- Replace the session IDs below with your actual test account session IDs
-- (find them in the profiles table or from localStorage → mutua_session_id)

UPDATE matches
SET
  scheduling_state = 'scheduled',
  scheduled_at     = NOW() + interval '5 minutes'
WHERE
  session_id_a = 'REPLACE_WITH_SESSION_ID_A'
  OR session_id_b = 'REPLACE_WITH_SESSION_ID_A'
  -- add the second account's session ID too if needed:
  -- OR session_id_a = 'REPLACE_WITH_SESSION_ID_B'
RETURNING id, scheduling_state, scheduled_at;
