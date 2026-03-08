'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AppShell from '@/components/AppShell';

export default function LoginPage() {
  const router = useRouter();
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Incorrect email or password.');
      setSubmitting(false);
      return;
    }

    router.push('/profile');
  };

  return (
    <AppShell>
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="bg-white border-2 border-neutral-900 rounded-2xl shadow-[5px_5px_0_0_#111] px-10 py-12 max-w-sm w-full text-center space-y-8">

          <div className="space-y-2">
            <p className="font-serif font-black text-xl text-neutral-900">Sign in.</p>
            <p className="text-sm text-stone-500 leading-relaxed">
              Welcome back.
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
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-amber-400 text-neutral-900 border-2 border-neutral-900 font-bold text-sm rounded-lg shadow-[2px_2px_0_0_#111] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-xs text-stone-400">
            Don&rsquo;t have an account?{' '}
            <Link href="/signup" className="text-neutral-900 font-semibold hover:underline">
              Create one
            </Link>
          </p>

        </div>
      </div>
    </AppShell>
  );
}
