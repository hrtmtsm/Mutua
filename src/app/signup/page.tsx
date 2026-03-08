'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AppShell from '@/components/AppShell';

export default function SignupPage() {
  const router = useRouter();
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [done,        setDone]        = useState(false);
  const [error,       setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }

    setSubmitting(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
  };

  return (
    <AppShell>
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="bg-white border-2 border-neutral-900 rounded-2xl shadow-[5px_5px_0_0_#111] px-10 py-12 max-w-sm w-full text-center space-y-8">

          {done ? (
            <div className="space-y-3">
              <p className="font-serif font-black text-xl text-neutral-900">Check your email.</p>
              <p className="text-sm text-stone-500 leading-relaxed">
                We sent a confirmation link to <strong>{email}</strong>.<br />
                Click it to activate your account.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="font-serif font-black text-xl text-neutral-900">Create your account.</p>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Save your profile and matches across devices.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-left">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={submitting}
                  className="w-full px-4 py-2.5 border-2 border-neutral-900 rounded-lg text-sm text-neutral-900 placeholder:text-stone-400 focus:outline-none disabled:opacity-50"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={submitting}
                  className="w-full px-4 py-2.5 border-2 border-neutral-900 rounded-lg text-sm text-neutral-900 placeholder:text-stone-400 focus:outline-none disabled:opacity-50"
                />
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Confirm password"
                  disabled={submitting}
                  className="w-full px-4 py-2.5 border-2 border-neutral-900 rounded-lg text-sm text-neutral-900 placeholder:text-stone-400 focus:outline-none disabled:opacity-50"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-amber-400 text-neutral-900 border-2 border-neutral-900 font-bold text-sm rounded-lg shadow-[2px_2px_0_0_#111] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submitting ? 'Creating...' : 'Create account'}
                </button>
              </form>

              <p className="text-xs text-stone-400">
                Already have an account?{' '}
                <Link href="/login" className="text-neutral-900 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}

        </div>
      </div>
    </AppShell>
  );
}
