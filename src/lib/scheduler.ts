/**
 * Scheduling engine — implements docs/scheduling-spec.md
 *
 * Call `runScheduler(matchId)` from an API route (server-side only).
 * Uses service role client so it can read both users' availability and
 * write confirmed_sessions + update matches without RLS interference.
 */

import { createClient } from '@supabase/supabase-js';
import type { UserAvailability, ConfirmedSession, SchedulingState } from './supabase';

// ── Admin client (server-side only) ──────────────────────────────────────────

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Slot {
  start: Date;
  end:   Date;  // always start + 30 min
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Expand recurring weekly availability into concrete UTC slots over the next 7 days */
function expandToUTC(rows: UserAvailability[]): Slot[] {
  const slots: Slot[] = [];
  const now = new Date();

  // Check the next 7 days (starting from today)
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(now);
    date.setDate(now.getDate() + dayOffset);

    // day_of_week: 0=Mon … 6=Sun  (spec convention)
    // JS getDay(): 0=Sun … 6=Sat
    const jsDay = date.getDay();
    const specDay = jsDay === 0 ? 6 : jsDay - 1; // convert JS→spec

    for (const row of rows) {
      if (row.day_of_week !== specDay) continue;

      // Build a local datetime string in the user's timezone, then convert to UTC
      const year  = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day   = String(date.getDate()).padStart(2, '0');
      const hours = String(Math.floor(row.start_minute / 60)).padStart(2, '0');
      const mins  = String(row.start_minute % 60).padStart(2, '0');

      // Use Intl to convert local time in stored timezone → UTC
      const localStr = `${year}-${month}-${day}T${hours}:${mins}:00`;
      const utcStart = localToUTC(localStr, row.timezone);
      if (!utcStart) continue;

      const utcEnd = new Date(utcStart.getTime() + 30 * 60 * 1000);
      slots.push({ start: utcStart, end: utcEnd });
    }
  }

  return slots;
}

/** Convert a local datetime string + IANA timezone to a UTC Date */
function localToUTC(localDatetime: string, timezone: string): Date | null {
  try {
    // Create a formatter that tells us what UTC time corresponds to
    // the given local time in the given timezone
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).formatToParts(new Date(localDatetime));

    // This is a known technique: parse the reference date and compute the offset
    const ref = new Date(localDatetime);
    // Get what the timezone formatter shows for the same epoch millisecond
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });

    // Binary-search-free approach: use the offset between UTC and local display
    // We construct an approximate UTC time, format it in the target tz, check
    // if it matches our desired local time. Iterate once to correct for DST.
    const desired = new Date(localDatetime + 'Z'); // treat as UTC initially
    const displayed = formatInTZ(desired, timezone);
    if (!displayed) return null;

    // Diff in ms between what we wanted and what we got (local offset)
    const offset = desired.getTime() - new Date(displayed + 'Z').getTime();
    return new Date(desired.getTime() + offset);
  } catch {
    return null;
  }
}

function formatInTZ(date: Date, timezone: string): string | null {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const get = (t: string) => parts.find(p => p.type === t)?.value ?? '00';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
  } catch {
    return null;
  }
}

/** Find overlapping 30-min windows between two slot arrays (partial overlap supported) */
function intersect(a: Slot[], b: Slot[]): Slot[] {
  const result: Slot[] = [];
  for (const sa of a) {
    for (const sb of b) {
      const overlapStart = sa.start > sb.start ? sa.start : sb.start;
      const overlapEnd   = sa.end   < sb.end   ? sa.end   : sb.end;
      const durationMs   = overlapEnd.getTime() - overlapStart.getTime();
      // Overlap must be exactly 30 min (or the full 30-min block fits)
      if (durationMs >= 30 * 60 * 1000) {
        // Take exactly the first 30 min of the overlap
        result.push({
          start: overlapStart,
          end:   new Date(overlapStart.getTime() + 30 * 60 * 1000),
        });
      }
    }
  }
  return result;
}

/** Remove any slot that overlaps with an already-confirmed session */
function subtractBooked(slots: Slot[], booked: ConfirmedSession[]): Slot[] {
  return slots.filter(slot => {
    return !booked.some(b => {
      const bs = new Date(b.starts_at);
      const be = new Date(b.ends_at);
      // Slot and booking overlap if they share any time
      return slot.start < be && slot.end > bs;
    });
  });
}

// ── Main scheduler function ───────────────────────────────────────────────────

export interface SchedulerResult {
  state: SchedulingState;
  slot:  Slot | null;
}

export async function runScheduler(matchId: string): Promise<SchedulerResult> {
  const db = adminClient();

  // 1. Fetch the match
  const { data: match, error: matchErr } = await db
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();
  if (matchErr || !match) throw new Error(`Match not found: ${matchId}`);

  // 2. Resolve auth user IDs from session IDs
  const { data: profiles } = await db
    .from('profiles')
    .select('session_id, id')
    .in('session_id', [match.session_id_a, match.session_id_b]);

  const profileA = profiles?.find(p => p.session_id === match.session_id_a);
  const profileB = profiles?.find(p => p.session_id === match.session_id_b);

  // We need auth.users IDs, which are stored as `id` in profiles if profiles.id = auth user id
  // Actually profiles table uses its own UUID as id. We need to get user_id from auth.
  // The profiles table doesn't directly store auth user id — look up via email or use a join.
  // For now, use profiles.id as a proxy — this will need to be reconciled when
  // user_availability is populated (it stores auth.users id as user_id).
  // Short-term: query user_availability by matching session_id via profiles.

  // Get auth user IDs from Supabase auth
  const { data: usersData } = await db.auth.admin.listUsers();
  const users = usersData?.users ?? [];

  const emailA = match.email_a;
  const emailB = match.email_b;
  const authUserA = users.find(u => u.email === emailA);
  const authUserB = users.find(u => u.email === emailB);

  if (!authUserA || !authUserB) {
    // One or both users haven't signed up yet — can't schedule
    return { state: 'pending_both', slot: null };
  }

  // 3. Fetch availability for both users
  const [{ data: availA }, { data: availB }] = await Promise.all([
    db.from('user_availability').select('*').eq('user_id', authUserA.id),
    db.from('user_availability').select('*').eq('user_id', authUserB.id),
  ]);

  const hasA = (availA?.length ?? 0) > 0;
  const hasB = (availB?.length ?? 0) > 0;

  if (!hasA && !hasB) return { state: 'pending_both', slot: null };
  if (!hasA)           return { state: 'pending_a',    slot: null };
  if (!hasB)           return { state: 'pending_b',    slot: null };

  // 4. Expand to concrete UTC slots for next 7 days
  const slotsA = expandToUTC(availA as UserAvailability[]);
  const slotsB = expandToUTC(availB as UserAvailability[]);

  // 5. Find overlapping windows
  let candidates = intersect(slotsA, slotsB);

  // 6. Subtract confirmed sessions for both users
  const [{ data: bookedA }, { data: bookedB }] = await Promise.all([
    db.from('confirmed_sessions').select('*').eq('user_id', authUserA.id),
    db.from('confirmed_sessions').select('*').eq('user_id', authUserB.id),
  ]);

  candidates = subtractBooked(candidates, (bookedA ?? []) as ConfirmedSession[]);
  candidates = subtractBooked(candidates, (bookedB ?? []) as ConfirmedSession[]);

  // 7. Filter: skip slots within next 2 hours
  const minStart = new Date(Date.now() + 2 * 60 * 60 * 1000);
  candidates = candidates.filter(s => s.start > minStart);

  // 8. Sort by soonest
  candidates.sort((a, b) => a.start.getTime() - b.start.getTime());

  const best = candidates[0] ?? null;

  if (!best) {
    return { state: 'no_overlap', slot: null };
  }

  // 9. Book the slot in a transaction (re-check for concurrent conflicts)
  const { error: txError } = await db.rpc('book_session_slot', {
    p_match_id:   matchId,
    p_user_id_a:  authUserA.id,
    p_user_id_b:  authUserB.id,
    p_starts_at:  best.start.toISOString(),
    p_ends_at:    best.end.toISOString(),
  });

  if (txError) {
    // Slot was taken by a concurrent scheduler — caller should retry
    throw new Error(`slot_conflict: ${txError.message}`);
  }

  return { state: 'scheduled', slot: best };
}
