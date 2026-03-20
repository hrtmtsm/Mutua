'use client';

import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type FlowState =
  | 'matched'
  | 'a_scheduling'
  | 'options_sent'
  | 'b_picked'
  | 'in_session'
  | 'session_ended'
  | 'a_scheduling_again'
  | 'options_sent_again';

const SLOTS = [
  'Tue, Mar 18 · 7:00 PM',
  'Wed, Mar 19 · 10:00 AM',
  'Thu, Mar 20 · 6:30 PM',
];
const PICKED = SLOTS[0];
const DURATION = '2m 24s';

// ── Mini UI primitives ────────────────────────────────────────────────────────

function Badge({ color, label }: { color: 'green' | 'amber'; label: string }) {
  return color === 'green'
    ? <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-xs font-semibold text-green-700 rounded-full">{label}</span>
    : <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-600 rounded-full">{label}</span>;
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0`} style={{ backgroundColor: color }}>
      {initials}
    </div>
  );
}

function Pill({ label, color = 'stone' }: { label: string; color?: 'stone' | 'amber' }) {
  return color === 'amber'
    ? <span className="px-2.5 py-1 bg-amber-50 border border-amber-100 text-xs text-amber-700 rounded-full">{label}</span>
    : <span className="px-2.5 py-1 bg-stone-100 border border-stone-200 text-xs text-stone-600 rounded-full">{label}</span>;
}

function PrimaryBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full py-2.5 bg-[#2B8FFF] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">
      {label}
    </button>
  );
}

function GhostBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full py-2 text-xs text-stone-400 hover:text-stone-600 transition-colors">
      {label}
    </button>
  );
}

// ── Phone wrapper ─────────────────────────────────────────────────────────────

function Phone({ title, subtitle, color, children }: {
  title: string; subtitle: string; color: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center">
      {/* Label above */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: color }}>
          {title[0]}
        </div>
        <div>
          <p className="text-sm font-bold text-neutral-900">{title}</p>
          <p className="text-xs text-stone-400">{subtitle}</p>
        </div>
      </div>

      {/* Device outer shell */}
      <div
        className="relative bg-neutral-900 rounded-[3rem] shadow-2xl"
        style={{ width: 280, padding: '12px' }}
      >
        {/* Side buttons */}
        <div className="absolute -left-[3px] top-24 w-[3px] h-8 bg-neutral-700 rounded-l-sm" />
        <div className="absolute -left-[3px] top-36 w-[3px] h-12 bg-neutral-700 rounded-l-sm" />
        <div className="absolute -left-[3px] top-52 w-[3px] h-12 bg-neutral-700 rounded-l-sm" />
        <div className="absolute -right-[3px] top-32 w-[3px] h-16 bg-neutral-700 rounded-r-sm" />

        {/* Screen bezel */}
        <div className="bg-white rounded-[2.4rem] overflow-hidden flex flex-col" style={{ height: 560 }}>

          {/* Status bar — decorative only */}
          <div className="bg-white px-5 pt-3 pb-1 flex items-center justify-between shrink-0 pointer-events-none select-none">
            <span className="text-xs font-semibold text-neutral-900">9:41</span>
            {/* Dynamic island */}
            <div className="w-20 h-5 bg-neutral-900 rounded-full" />
            <div className="flex items-center gap-1">
              {/* Signal */}
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                <rect x="0" y="6" width="2" height="4" rx="0.5" fill="#1a1a1a"/>
                <rect x="3" y="4" width="2" height="6" rx="0.5" fill="#1a1a1a"/>
                <rect x="6" y="2" width="2" height="8" rx="0.5" fill="#1a1a1a"/>
                <rect x="9" y="0" width="2" height="10" rx="0.5" fill="#1a1a1a"/>
              </svg>
              {/* Battery */}
              <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
                <rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke="#1a1a1a"/>
                <rect x="2" y="2" width="13" height="7" rx="1" fill="#1a1a1a"/>
                <path d="M20 3.5v4a1.5 1.5 0 000-4z" fill="#1a1a1a"/>
              </svg>
            </div>
          </div>

          {/* Nav bar — decorative only */}
          <div className="bg-white border-b border-stone-100 px-4 py-2 flex items-center gap-4 shrink-0 pointer-events-none select-none">
            <span className="font-serif font-black text-sm text-neutral-900">Mutua</span>
            <div className="flex gap-3 text-xs">
              <span className="font-semibold text-neutral-900 border-b-2 border-neutral-900 pb-0.5">Session</span>
              <span className="text-stone-400">History</span>
              <span className="text-stone-400">Messages</span>
              <span className="text-stone-400">Profile</span>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto bg-white p-4 space-y-3 text-sm">
            {children}
          </div>

          {/* Home indicator */}
          <div className="bg-white flex justify-center pb-2 pt-1 shrink-0">
            <div className="w-24 h-1 bg-neutral-900 rounded-full opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screens ───────────────────────────────────────────────────────────────────

// Home screen — partner card with schedule CTA (User A, matched state)
function HomeMatchedA({ onSchedule }: { onSchedule: () => void }) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Upcoming</p>
      <div className="bg-stone-50 border border-dashed border-stone-200 rounded-xl px-4 py-5 text-center">
        <p className="text-xs text-stone-400">No sessions scheduled yet.</p>
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-stone-400 pt-1">Compatible partners</p>
      <div className="border border-stone-200 rounded-xl overflow-hidden">
        <div className="p-3 flex items-center gap-3">
          <Avatar initials="YU" color="#3b82f6" />
          <div className="flex-1">
            <p className="font-bold text-neutral-900 text-sm">Yuki</p>
            <p className="text-xs text-stone-400">Japanese · Practicing English</p>
          </div>
        </div>
        <div className="border-t border-stone-100 px-3 py-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-stone-400">Suggested</p>
            <p className="text-xs font-semibold text-neutral-700">Tue, Mar 18 · 7:00 PM</p>
          </div>
          <button onClick={onSchedule} className="px-3 py-1.5 bg-[#2B8FFF] text-white text-xs font-bold rounded-lg">
            Schedule →
          </button>
        </div>
      </div>
    </>
  );
}

// Home screen — partner card (User B, matched state — symmetric to A)
function HomeMatchedB({ onSchedule }: { onSchedule: () => void }) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Upcoming</p>
      <div className="bg-stone-50 border border-dashed border-stone-200 rounded-xl px-4 py-5 text-center">
        <p className="text-xs text-stone-400">No sessions scheduled yet.</p>
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-stone-400 pt-1">Compatible partners</p>
      <div className="border border-stone-200 rounded-xl overflow-hidden">
        <div className="p-3 flex items-center gap-3">
          <Avatar initials="YO" color="#6366f1" />
          <div className="flex-1">
            <p className="font-bold text-neutral-900 text-sm">Alex</p>
            <p className="text-xs text-stone-400">English · Practicing Japanese</p>
          </div>
        </div>
        <div className="border-t border-stone-100 px-3 py-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-stone-400">Suggested</p>
            <p className="text-xs font-semibold text-neutral-700">Tue, Mar 18 · 7:00 PM</p>
          </div>
          <button onClick={onSchedule} className="px-3 py-1.5 bg-[#2B8FFF] text-white text-xs font-bold rounded-lg">
            Schedule →
          </button>
        </div>
      </div>
    </>
  );
}

// Schedule page — slot picker (User A)
function SchedulePageA({ onSend, slots, picked, onToggle }: {
  onSend: () => void;
  slots: string[];
  picked: Set<string>;
  onToggle: (s: string) => void;
}) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Schedule with Yuki</p>
      <p className="font-black text-base text-neutral-900">When works for you?</p>
      <div className="space-y-2">
        {slots.map(slot => {
          const sel = picked.has(slot);
          return (
            <button
              key={slot}
              onClick={() => onToggle(slot)}
              className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                sel ? 'bg-[#2B8FFF] border-[#2B8FFF] text-white' : 'border-stone-200 text-neutral-800 hover:border-[#2B8FFF]'
              }`}
            >
              {slot}
              <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${sel ? 'bg-white border-white' : 'border-stone-300'}`} />
            </button>
          );
        })}
      </div>
      {picked.size > 0 && (
        <PrimaryBtn label={`Send ${picked.size} option${picked.size > 1 ? 's' : ''} to Yuki`} onClick={onSend} />
      )}
      <GhostBtn label="Schedule later" onClick={() => {}} />
    </>
  );
}

// Home — scheduling status (User A after sending)
function HomeSchedulingA({ slots }: { slots: string[] }) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Upcoming</p>
      <div className="border border-stone-200 rounded-xl overflow-hidden">
        <div className="p-3 flex items-center gap-3">
          <Avatar initials="YU" color="#3b82f6" />
          <div className="flex-1">
            <p className="font-bold text-neutral-900 text-sm">Yuki</p>
          </div>
          <Badge color="amber" label="Scheduling" />
        </div>
        <div className="border-t border-stone-100 px-3 py-3 space-y-2">
          <p className="text-xs text-stone-400">Options sent — waiting for Yuki to pick</p>
          <div className="flex flex-wrap gap-1">
            {slots.map(s => <Pill key={s} label={s} color="amber" />)}
          </div>
        </div>
      </div>
    </>
  );
}

// Home — Yuki sees options to pick from
function HomePickB({ slots, onPick }: { slots: string[]; onPick: (s: string) => void }) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Upcoming</p>
      <div className="border border-stone-200 rounded-xl overflow-hidden">
        <div className="p-3 flex items-center gap-3">
          <Avatar initials="YO" color="#6366f1" />
          <div className="flex-1">
            <p className="font-bold text-neutral-900 text-sm">You (demo)</p>
          </div>
          <Badge color="amber" label="Scheduling" />
        </div>
        <div className="border-t border-stone-100 px-3 py-3 space-y-2">
          <p className="text-xs text-stone-400 font-semibold">Pick a time that works for you:</p>
          <div className="space-y-1.5">
            {slots.map(s => (
              <button
                key={s}
                onClick={() => onPick(s)}
                className="w-full text-left px-3 py-2 rounded-lg border border-stone-200 text-xs font-semibold text-neutral-800 hover:border-[#2B8FFF] hover:text-[#2B8FFF] transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Home — confirmed (both)
function HomeConfirmed({ partnerInitials, partnerName, partnerColor, onJoin }: {
  partnerInitials: string; partnerName: string; partnerColor: string; onJoin: () => void;
}) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Upcoming</p>
      <div className="border border-stone-200 rounded-xl overflow-hidden">
        <div className="p-3 flex items-center gap-3">
          <Avatar initials={partnerInitials} color={partnerColor} />
          <div className="flex-1">
            <p className="font-bold text-neutral-900 text-sm">{partnerName}</p>
          </div>
          <Badge color="green" label="Confirmed" />
        </div>
        <div className="border-t border-stone-100 px-3 py-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-stone-400">Scheduled</p>
            <p className="text-xs font-bold text-neutral-900">{PICKED}</p>
          </div>
          <button onClick={onJoin} className="px-3 py-1.5 bg-[#2B8FFF] text-white text-xs font-bold rounded-lg">
            Join →
          </button>
        </div>
      </div>
    </>
  );
}

// In session
function InSession({ partnerName, onEnd }: { partnerName: string; onEnd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-6">
      <div className="w-16 h-16 rounded-2xl bg-[#2B8FFF] flex items-center justify-center">
        <span className="text-white text-xl font-black">{partnerName[0]}</span>
      </div>
      <div className="text-center">
        <p className="font-bold text-neutral-900">{partnerName}</p>
        <p className="text-xs text-stone-400 mt-0.5">Speaking…</p>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-3 bg-[#2B8FFF] rounded-full animate-pulse" />
        <div className="w-1.5 h-5 bg-[#2B8FFF] rounded-full animate-pulse delay-75" />
        <div className="w-1.5 h-4 bg-[#2B8FFF] rounded-full animate-pulse delay-150" />
        <div className="w-1.5 h-6 bg-[#2B8FFF] rounded-full animate-pulse" />
        <div className="w-1.5 h-3 bg-[#2B8FFF] rounded-full animate-pulse delay-75" />
      </div>
      <button onClick={onEnd} className="mt-4 px-4 py-2 border border-stone-200 text-xs text-stone-500 font-semibold rounded-xl hover:border-red-300 hover:text-red-500 transition-colors">
        End session
      </button>
    </div>
  );
}

// Session review
function SessionReview({ partnerName, onSchedule }: { partnerName: string; onSchedule: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-4">
      <span className="text-4xl">🔥</span>
      <div>
        <p className="text-3xl font-black text-neutral-900">{DURATION}</p>
        <p className="text-xs text-stone-400 mt-1">of practice with {partnerName}</p>
      </div>
      <span className="px-3 py-1 bg-[#2B8FFF]/10 text-[#2B8FFF] text-xs font-semibold rounded-full">1-day streak</span>
      <PrimaryBtn label={`Schedule next session with ${partnerName}`} onClick={onSchedule} />
      <GhostBtn label="Find another partner" onClick={() => {}} />
    </div>
  );
}

// ── Narrative labels ──────────────────────────────────────────────────────────

const NARRATION: Record<FlowState, string> = {
  matched:            'Both users are matched and see each other\'s card with a suggested time. Either can initiate scheduling.',
  a_scheduling:       'You tap "Schedule →" and pick time slots to send to Yuki.',
  options_sent:       'You see "Scheduling" status. Yuki receives your options and picks one.',
  b_picked:           'Yuki picks Tuesday 7 PM. Both see "Confirmed" — tap Join to enter the session.',
  in_session:         'Both are in the live session. You or Yuki can end it.',
  session_ended:      'Session ends. Both see the celebration + duration. You can schedule again.',
  a_scheduling_again: 'You propose new times for the next session.',
  options_sent_again: 'Options sent again. Yuki picks a time to confirm the next session.',
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [flow, setFlow] = useState<FlowState>('matched');
  const [sentSlots, setSentSlots] = useState<string[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const togglePick = (s: string) => {
    setPicked(prev => {
      const n = new Set(prev);
      n.has(s) ? n.delete(s) : n.add(s);
      return n;
    });
  };

  const sendOptions = () => {
    setSentSlots(Array.from(picked));
    setPicked(new Set());
    setFlow('options_sent');
  };

  const pickSlot = (_slot: string) => {
    setFlow('b_picked');
  };

  const reset = () => {
    setFlow('matched');
    setSentSlots([]);
    setPicked(new Set());
  };

  // ── Render screens based on flow state ──────────────────────────────────────

  const renderA = () => {
    switch (flow) {
      case 'matched':
        return <HomeMatchedA onSchedule={() => setFlow('a_scheduling')} />;
      case 'a_scheduling':
        return <SchedulePageA slots={SLOTS} picked={picked} onToggle={togglePick} onSend={sendOptions} />;
      case 'options_sent':
        return <HomeSchedulingA slots={sentSlots} />;
      case 'b_picked':
        return <HomeConfirmed partnerInitials="YU" partnerName="Yuki" partnerColor="#3b82f6" onJoin={() => setFlow('in_session')} />;
      case 'in_session':
        return <InSession partnerName="Yuki" onEnd={() => setFlow('session_ended')} />;
      case 'session_ended':
        return <SessionReview partnerName="Yuki" onSchedule={() => { setPicked(new Set()); setFlow('a_scheduling_again'); }} />;
      case 'a_scheduling_again':
        return <SchedulePageA slots={SLOTS} picked={picked} onToggle={togglePick} onSend={() => { setSentSlots(Array.from(picked)); setPicked(new Set()); setFlow('options_sent_again'); }} />;
      case 'options_sent_again':
        return <HomeSchedulingA slots={sentSlots} />;
    }
  };

  const renderB = () => {
    switch (flow) {
      case 'matched':
        return <HomeMatchedB onSchedule={() => setFlow('a_scheduling')} />;
      case 'a_scheduling':
        return <HomeMatchedB onSchedule={() => setFlow('a_scheduling')} />;
      case 'options_sent':
        return <HomePickB slots={sentSlots} onPick={pickSlot} />;
      case 'b_picked':
        return <HomeConfirmed partnerInitials="YO" partnerName="You (demo)" partnerColor="#6366f1" onJoin={() => setFlow('in_session')} />;
      case 'in_session':
        return <InSession partnerName="You (demo)" onEnd={() => setFlow('session_ended')} />;
      case 'session_ended':
        return <SessionReview partnerName="You (demo)" onSchedule={() => { setPicked(new Set()); setFlow('a_scheduling_again'); }} />;
      case 'a_scheduling_again':
        return <HomeMatchedB onSchedule={() => setFlow('a_scheduling_again')} />;
      case 'options_sent_again':
        return <HomePickB slots={sentSlots} onPick={() => setFlow('b_picked')} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Header */}
      <div className="border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Dev tool</p>
          <p className="font-black text-lg text-neutral-900">Two-user simulator</p>
        </div>
        <button onClick={reset} className="text-xs text-stone-400 hover:text-stone-700 border border-stone-200 px-3 py-1.5 rounded-lg transition-colors">
          Reset
        </button>
      </div>

      {/* Narration */}
      <div className="px-6 pt-5 max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-0.5">{flow.replace(/_/g, ' ')}</p>
          <p className="text-sm text-blue-800">{NARRATION[flow]}</p>
        </div>
      </div>

      {/* Two phones */}
      <div className="px-6 py-5 max-w-4xl mx-auto grid grid-cols-2 gap-12 justify-items-center">
        <Phone title="You" subtitle="English → Japanese" color="#6366f1">
          {renderA()}
        </Phone>
        <Phone title="Yuki" subtitle="Japanese → English" color="#3b82f6">
          {renderB()}
        </Phone>
      </div>

    </div>
  );
}
