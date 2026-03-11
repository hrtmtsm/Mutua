'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SavedPartner } from '@/lib/types';
import { LANG_FLAGS } from '@/lib/constants';
import { getSessionStarters } from '@/lib/prompts';

const LANG_COLORS: Record<string, string> = {
  Japanese:   '#3b82f6',
  Korean:     '#8b5cf6',
  Mandarin:   '#ef4444',
  Spanish:    '#f59e0b',
  French:     '#10b981',
  English:    '#6366f1',
  Portuguese: '#f97316',
  German:     '#64748b',
  Italian:    '#ec4899',
  Arabic:     '#14b8a6',
};

function Avatar({ name, lang }: { name: string; lang: string }) {
  const bg = LANG_COLORS[lang] ?? '#3b82f6';
  return (
    <div
      style={{ backgroundColor: bg }}
      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shrink-0"
    >
      {name.trim().slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function PreSessionPage() {
  const router = useRouter();
  const [partner,  setPartner]  = useState<SavedPartner | null>(null);
  const [starters, setStarters] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('mutua_current_partner');
    if (!stored) { router.replace('/'); return; }
    const p: SavedPartner = JSON.parse(stored);
    setPartner(p);
    setStarters(getSessionStarters(p.native_language));
  }, [router]);

  if (!partner) return null;

  const flag = LANG_FLAGS[partner.native_language] ?? '';

  const handleStart = () => {
    const sessionMatch = {
      partner: {
        session_id:         partner.partner_id,
        name:               partner.name,
        native_language:    partner.native_language,
        learning_language:  partner.learning_language,
        goal:               partner.goal,
        comm_style:         partner.comm_style,
        practice_frequency: partner.practice_frequency,
      },
      score:    0,
      reasons:  [],
      starters,
    };
    localStorage.setItem('mutua_match', JSON.stringify(sessionMatch));
    router.push('/session');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">

      <nav className="px-6 py-4 border-b border-stone-100 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-stone-400 hover:text-neutral-900 transition-colors"
        >
          ← Back
        </button>
        <span className="font-serif font-black text-xl text-neutral-900">Mutua</span>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="max-w-md w-full space-y-4">

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400 text-center mb-2">
            Ready to practice
          </p>

          {/* Partner */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Avatar name={partner.name} lang={partner.native_language} />
              <div>
                <p className="font-serif font-black text-xl text-neutral-900">{partner.name}</p>
                <p className="text-sm text-stone-500 mt-0.5">
                  {flag} Native {partner.native_language} · Learning {partner.learning_language}
                </p>
                {partner.goal && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 bg-sky-50 border border-sky-200 text-xs font-semibold text-[#2B8FFF] rounded-full">
                    {partner.goal}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Conversation starters */}
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-stone-400 mb-4">
              To start the conversation
            </p>
            <ul className="space-y-3">
              {starters.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#2B8FFF] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-stone-700 leading-relaxed">{s}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <button
            onClick={handleStart}
            className="w-full py-4 btn-primary text-white font-bold text-base rounded-xl shadow-md"
          >
            Start session →
          </button>

        </div>
      </main>
    </div>
  );
}
