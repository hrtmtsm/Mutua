/**
 * GET /api/get-availability
 * Headers: Authorization: Bearer <supabase_access_token>
 * Returns the authenticated user's saved weekly availability.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ slots: [], timezone: null });
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: { user } } = await db.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ slots: [], timezone: null });
  }

  const { data } = await db
    .from('user_availability')
    .select('day_of_week, start_minute, timezone, updated_at')
    .eq('user_id', user.id)
    .order('day_of_week', { ascending: true })
    .order('start_minute', { ascending: true });

  const slots = (data ?? []).map(r => ({
    day_of_week:  r.day_of_week,
    start_minute: r.start_minute,
  }));
  const timezone  = data?.[0]?.timezone ?? null;
  const updatedAt = data?.[0]?.updated_at ?? null;

  return NextResponse.json({ slots, timezone, updatedAt });
}
