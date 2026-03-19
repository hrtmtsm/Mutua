/**
 * POST /api/cancel-session
 * Body: { matchId: string }
 * Cancels a scheduled session: deletes confirmed_sessions, resets match to pending_both.
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
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { matchId } = await request.json().catch(() => ({}));
  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 });

  const db = adminClient();

  const { data: { user }, error: authErr } = await db.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Verify user is a member of this match
  const { data: profile } = await db
    .from('profiles')
    .select('session_id')
    .eq('email', user.email)
    .maybeSingle();

  const { data: match } = await db
    .from('matches')
    .select('id, session_id_a, session_id_b')
    .eq('id', matchId)
    .maybeSingle();

  if (!match || !profile) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const isMember = match.session_id_a === profile.session_id || match.session_id_b === profile.session_id;
  if (!isMember) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  // Delete confirmed session
  await db.from('confirmed_sessions').delete().eq('match_id', matchId);

  // Reset match state — both sides need to re-engage
  await db.from('matches').update({
    scheduling_state: 'pending_both',
    scheduled_at: null,
    availability_a_set_at: null,
    availability_b_set_at: null,
  }).eq('id', matchId);

  return NextResponse.json({ ok: true });
}
