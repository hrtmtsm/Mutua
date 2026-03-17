import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session?.user?.email) {
      const email = data.session.user.email;

      // Look up their existing profile by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('session_id')
        .eq('email', email)
        .maybeSingle();

      if (profile?.session_id) {
        // Restore their session on the client via a redirect
        return NextResponse.redirect(`${origin}/auth/restore?sid=${profile.session_id}`);
      }
    }
  }

  // No code or no profile found — send to onboarding
  return NextResponse.redirect(`${origin}/onboarding`);
}
