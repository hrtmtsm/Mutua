'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthSendPage() {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">

        <div>
          <p className="font-serif font-black text-2xl text-neutral-900">Sign in</p>
          <p className="text-sm text-stone-500 mt-1">We&rsquo;ll email you a link — no password needed.</p>
        </div>

        {sent ? (
          <div className="bg-stone-50 border border-stone-200 rounded-xl px-5 py-4 space-y-1">
            <p className="text-sm font-semibold text-neutral-900">Check your inbox</p>
            <p className="text-sm text-stone-500">
              We sent a link to <span className="font-medium">{email}</span>. Click it to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm text-neutral-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2B8FFF]"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-primary text-white font-bold text-sm rounded-xl shadow-sm disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
