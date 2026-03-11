'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMatchBySessionId, type Match } from '@/lib/supabase';
import { LANG_FLAGS } from '@/lib/constants';

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
      className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg shrink-0"
    >
      {name.trim().slice(0, 2).toUpperCase()}
    </div>
  );
}

function getSuggestedTime(frequency?: string): string {
  const now  = new Date();
  let daysAhead = 3;
  if      (frequency === 'Every day')          daysAhead = 1;
  else if (frequency === '2–3 times a week')   daysAhead = 2;
  else if (frequency === 'Once a week')        daysAhead = 5;

  const date = new Date(now);
  date.setDate(now.getDate() + daysAhead);

  return date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }) + ' at 7:00 PM';
}

export default function MatchResultPage() {
  const router = useRouter();

  const [partnerName,     setPartnerName]     = useState('');
  const [partnerNative,   setPartnerNative]   = useState('');
  const [partnerLearning, setPartnerLearning] = useState('');
  const [reasons,         setReasons]         = useState<string[]>([]);
  const [suggestedTime,   setSuggestedTime]   = useState('');
  const [goal,            setGoal]            = useState('');
  const [commStyle,       setCommStyle]       = useState('');
  const [frequency,       setFrequency]       = useState('');
  const [match,           setMatch]           = useState<Match | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [noMatch,         setNoMatch]         = useState(false);

  useEffect(() => {
    async function load() {
      const sessionId = localStorage.getItem('mutua_session_id');
      if (!sessionId) { router.replace('/onboarding'); return; }

      // Try Supabase first
      try {
        const m = await getMatchBySessionId(sessionId);
        if (m) {
          const isA = m.session_id_a === sessionId;
          setPartnerName(    isA ? (m.name_b  ?? 'Your partner') : (m.name_a  ?? 'Your partner'));
          setPartnerNative(  isA ? m.native_language_b           :  m.native_language_a);
          setPartnerLearning(isA ? m.native_language_a           :  m.native_language_b);
          setGoal(     m.goal            ?? '');
          setCommStyle(m.comm_style      ?? '');
          setFrequency(m.practice_frequency ?? '');
          setReasons(  m.reasons         ?? []);
          setSuggestedTime(
            m.suggested_time
              ? new Date(m.suggested_time).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric',
                  hour: 'numeric', minute: '2-digit',
                })
              : getSuggestedTime(m.practice_frequency),
          );
          setMatch(m);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('getMatchBySessionId error:', err);
      }

      // Fallback to localStorage (demo / dev mode)
      const stored = localStorage.getItem('mutua_match');
      if (stored) {
        const parsed = JSON.parse(stored);
        const p = parsed.partner;
        setPartnerName(    p.name              ?? 'Demo partner');
        setPartnerNative(  p.native_language);
        setPartnerLearning(p.learning_language);
        setGoal(     p.goal            ?? '');
        setCommStyle(p.comm_style      ?? '');
        setFrequency(p.practice_frequency ?? '');
        setReasons(  parsed.reasons    ?? []);
        setSuggestedTime(getSuggestedTime(p.practice_frequency));
        setLoading(false);
        return;
      }

      setNoMatch(true);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleConfirm = () => {
    const isA = match?.session_id_a === localStorage.getItem('mutua_session_id');
    const partner = {
      partner_id:         match ? (isA ? match.session_id_b : match.session_id_a) : 'demo',
      name:               partnerName,
      native_language:    partnerNative,
      learning_language:  partnerLearning,
      goal,
      comm_style:         commStyle,
      practice_frequency: frequency,
      saved_at:           new Date().toISOString(),
    };
    localStorage.setItem('mutua_current_partner', JSON.stringify(partner));
    router.push('/pre-session');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-stone-400 text-sm">Loading your match...</p>
    </div>
  );

  if (noMatch) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-3">
        <p className="font-serif font-black text-xl text-neutral-900">No match yet</p>
        <p className="text-sm text-stone-500">We'll email you as soon as we find someone compatible.</p>
      </div>
    </div>
  );

  const flag = LANG_FLAGS[partnerNative] ?? '';

  return (
    <div className="min-h-screen flex flex-col bg-white">

      <nav className="px-6 py-4 border-b border-stone-100">
        <span className="font-serif font-black text-xl text-neutral-900">Mutua</span>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="max-w-md w-full space-y-4">

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2B8FFF] text-center mb-2">
            You matched
          </p>

          {/* Partner */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Avatar name={partnerName} lang={partnerNative} />
              <div>
                <p className="font-serif font-black text-2xl text-neutral-900 leading-tight">{partnerName}</p>
                <p className="text-sm text-stone-500 mt-1">
                  {flag} Native {partnerNative} · Learning {partnerLearning}
                </p>
                {goal && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 bg-sky-50 border border-sky-200 text-xs font-semibold text-[#2B8FFF] rounded-full">
                    {goal}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Why you matched */}
          {reasons.length > 0 && (
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-stone-400 mb-3">
                Why you matched
              </p>
              <ul className="space-y-2.5">
                {reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-stone-700 leading-relaxed">
                    <span className="text-[#2B8FFF] font-black mt-0.5 shrink-0">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested session */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-stone-400 mb-2">
              Suggested first session
            </p>
            <p className="font-serif font-black text-xl text-neutral-900 mb-1">{suggestedTime}</p>
            <p className="text-xs text-stone-400">Based on your timezone and practice goals</p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleConfirm}
              className="w-full py-4 btn-primary text-white font-bold text-base rounded-xl shadow-md"
            >
              Confirm session →
            </button>
            <button
              onClick={() => {}}
              className="w-full py-3 border border-stone-200 bg-white text-neutral-600 font-semibold text-sm rounded-xl hover:border-stone-300 transition-all"
            >
              See other times
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
