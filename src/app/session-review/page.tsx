'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  if (sec === 0) return `${m}m`;
  return `${m}m ${sec}s`;
}

export default function SessionReviewPage() {
  const router = useRouter();
  const [duration,    setDuration]    = useState(0);
  const [partnerName, setPartnerName] = useState('your partner');
  const [streak,      setStreak]      = useState(0);

  useEffect(() => {
    const session = localStorage.getItem('mutua_last_session');
    if (session) {
      const { duration: d, partnerName: n } = JSON.parse(session);
      setDuration(d ?? 0);
      setPartnerName(n ?? 'your partner');
    }
    const streakRaw = localStorage.getItem('mutua_streak');
    if (streakRaw) setStreak(JSON.parse(streakRaw).count ?? 0);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-10 max-w-sm mx-auto">

      <div className="w-full flex flex-col items-center text-center gap-6">
        {/* Celebration */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-6xl">🔥</span>
          <div>
            <p className="text-5xl font-black text-neutral-900">{formatDuration(duration)}</p>
            <p className="text-sm text-neutral-400 mt-2">of practice with {partnerName}</p>
          </div>
          {streak > 1 && (
            <p className="text-sm font-semibold text-[#2B8FFF] bg-[#2B8FFF]/8 px-4 py-1.5 rounded-full">
              {streak}-day streak 🎉
            </p>
          )}
        </div>

        {/* CTAs */}
        <div className="w-full flex flex-col gap-3 pt-2">
          <button
            onClick={() => router.push('/session-schedule')}
            className="w-full py-4 btn-primary text-white font-bold rounded-2xl text-base"
          >
            Schedule next session with {partnerName}
          </button>
          <button
            onClick={() => router.push('/find-match')}
            className="w-full py-3 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Find another partner
          </button>
        </div>
      </div>

    </div>
  );
}
