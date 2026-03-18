/**
 * POST /api/set-availability
 * Headers: Authorization: Bearer <supabase_access_token>
 * Body: { slots: Array<{ day_of_week: number; start_minute: number }>, timezone: string }
 *
 * Saves the user's recurring weekly availability, then triggers the scheduler
 * for all their active matches that are waiting on availability.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { slots, timezone } = body as {
    slots?: Array<{ day_of_week: number; start_minute: number }>;
    timezone?: string;
  };

  if (!slots || !timezone) {
    return NextResponse.json({ error: 'slots and timezone required' }, { status: 400 });
  }

  const db = adminClient();

  // Verify token and get user
  const { data: { user }, error: authErr } = await db.auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const now = new Date().toISOString();

  // Replace all availability for this user (delete + insert)
  await db.from('user_availability').delete().eq('user_id', user.id);

  if (slots.length > 0) {
    const rows = slots.map(s => ({
      user_id:      user.id,
      day_of_week:  s.day_of_week,
      start_minute: s.start_minute,
      timezone,
      updated_at:   now,
    }));

    const { error: insertErr } = await db.from('user_availability').insert(rows);
    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }
  }

  // Find the user's session_id from profiles
  const { data: profile } = await db
    .from('profiles')
    .select('session_id')
    .eq('email', user.email)
    .maybeSingle();

  if (!profile?.session_id) {
    return NextResponse.json({ ok: true, matchesTriggered: 0 });
  }

  // Find all active matches waiting on availability
  const { data: matches } = await db
    .from('matches')
    .select('id, scheduling_state, session_id_a, session_id_b')
    .or(`session_id_a.eq.${profile.session_id},session_id_b.eq.${profile.session_id}`)
    .in('scheduling_state', ['pending_both', 'pending_a', 'pending_b', 'no_overlap']);

  if (!matches?.length) {
    return NextResponse.json({ ok: true, matchesTriggered: 0 });
  }

  // Update availability timestamps and transition to computing
  const isA = (m: any) => m.session_id_a === profile.session_id;
  for (const m of matches) {
    await db
      .from('matches')
      .update(isA(m)
        ? { availability_a_set_at: now, scheduling_state: 'computing' }
        : { availability_b_set_at: now, scheduling_state: 'computing' }
      )
      .eq('id', m.id);
  }

  // Trigger scheduler for each match (fire-and-forget)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  Promise.allSettled(
    matches.map(m =>
      fetch(`${baseUrl}/api/schedule-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: m.id }),
      }).catch(err => console.error('[set-availability] scheduler trigger failed', err))
    )
  );

  return NextResponse.json({ ok: true, matchesTriggered: matches.length });
}
