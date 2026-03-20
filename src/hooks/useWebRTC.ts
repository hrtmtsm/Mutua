'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export type RTCState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'failed';

interface Options {
  myId:      string;
  partnerId: string;
  muted:     boolean;
  cameraOn:  boolean;
}

export function useWebRTC({ myId, partnerId, muted, cameraOn }: Options) {
  const [rtcState,       setRtcState]       = useState<RTCState>('idle');
  const [localStream,    setLocalStream]    = useState<MediaStream | null>(null);
  const [partnerStream,  setPartnerStream]  = useState<MediaStream | null>(null);
  const [partnerMuted,   setPartnerMuted]   = useState(false);
  const [partnerCamOn,   setPartnerCamOn]   = useState(false);

  const pcRef           = useRef<RTCPeerConnection | null>(null);
  const channelRef      = useRef<RealtimeChannel | null>(null);
  const iceBuf          = useRef<RTCIceCandidateInit[]>([]);
  const remoteSetRef    = useRef(false);
  const localStreamRef  = useRef<MediaStream | null>(null);
  const partnerReadyRef = useRef(false);
  const readyTimer      = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep mutable refs so async callbacks always see latest values
  const mutedRef        = useRef(muted);
  const cameraOnRef     = useRef(cameraOn);

  const isCaller    = myId < partnerId;
  const channelName = `rtc:${[myId, partnerId].sort().join(':')}`;

  // ── helpers ──────────────────────────────────────────────────────────────────

  const send = useCallback((event: string, payload: Record<string, unknown>) => {
    channelRef.current?.send({ type: 'broadcast', event, payload: { from: myId, ...payload } });
  }, [myId]);

  const flushIce = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    for (const c of iceBuf.current) {
      try { await pc.addIceCandidate(c); } catch { /* ignore stale candidates */ }
    }
    iceBuf.current = [];
  }, []);

  const buildPC = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) send('ice', { candidate: candidate.toJSON() });
    };

    pc.ontrack = ({ streams }) => {
      if (streams[0]) setPartnerStream(streams[0]);
    };

    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === 'connected')    setRtcState('connected');
      if (s === 'disconnected') setRtcState('disconnected');
      if (s === 'failed')       setRtcState('failed');
    };

    pcRef.current = pc;
    return pc;
  }, [send]);

  const addTracks = useCallback((pc: RTCPeerConnection) => {
    const stream = localStreamRef.current;
    if (stream) stream.getTracks().forEach(t => pc.addTrack(t, stream));
  }, []);

  // ── main effect: media + signaling ───────────────────────────────────────────

  useEffect(() => {
    if (!myId || !partnerId) return;
    setRtcState('connecting');

    // Acquire local media — try video first, fall back to audio-only
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .catch(() => navigator.mediaDevices.getUserMedia({ audio: true, video: false }))
      .catch(() => new MediaStream())
      .then(stream => {
        localStreamRef.current = stream;
        stream.getAudioTracks().forEach(t => { t.enabled = !mutedRef.current; });
        stream.getVideoTracks().forEach(t => { t.enabled = cameraOnRef.current; });
        setLocalStream(stream);
      });

    // Signaling channel
    const ch = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = ch;

    ch
      .on('broadcast', { event: 'ready' }, async ({ payload }) => {
        if (payload.from !== partnerId) return;
        partnerReadyRef.current = true;

        if (isCaller) {
          if (readyTimer.current) { clearInterval(readyTimer.current); readyTimer.current = null; }
          const pc = buildPC();
          addTracks(pc);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          send('offer', { sdp: offer });
        }
      })
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (payload.from !== partnerId || isCaller) return;
        const pc = buildPC();
        addTracks(pc);
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        remoteSetRef.current = true;
        await flushIce();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        send('answer', { sdp: answer });
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (payload.from !== partnerId || !isCaller) return;
        const pc = pcRef.current;
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        remoteSetRef.current = true;
        await flushIce();
      })
      .on('broadcast', { event: 'ice' }, async ({ payload }) => {
        if (payload.from !== partnerId) return;
        if (remoteSetRef.current && pcRef.current) {
          try { await pcRef.current.addIceCandidate(payload.candidate); } catch { /* ignore */ }
        } else {
          iceBuf.current.push(payload.candidate);
        }
      })
      .on('broadcast', { event: 'media' }, ({ payload }) => {
        if (payload.from !== partnerId) return;
        setPartnerMuted(payload.muted as boolean);
        setPartnerCamOn(payload.cameraOn as boolean);
      })
      .subscribe(status => {
        if (status !== 'SUBSCRIBED') return;
        send('ready', {});

        if (isCaller) {
          // Retry every 2s until callee signals back
          readyTimer.current = setInterval(() => {
            if (partnerReadyRef.current) {
              clearInterval(readyTimer.current!);
              readyTimer.current = null;
            } else {
              send('ready', {});
            }
          }, 2000);
        }
      });

    return () => {
      if (readyTimer.current) clearInterval(readyTimer.current);
      pcRef.current?.close();
      pcRef.current = null;
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      remoteSetRef.current = false;
      iceBuf.current = [];
      partnerReadyRef.current = false;
      setLocalStream(null);
      setPartnerStream(null);
      ch.unsubscribe();
    };
  // intentionally omit muted/cameraOn — managed via the sync effect below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId, partnerId]);

  // ── sync mute/camera → tracks + notify partner ───────────────────────────────

  useEffect(() => {
    mutedRef.current   = muted;
    cameraOnRef.current = cameraOn;
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !muted; });
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = cameraOn; });
    if (myId && partnerId) send('media', { muted, cameraOn });
  }, [muted, cameraOn, myId, partnerId, send]);

  return { rtcState, localStream, partnerStream, partnerMuted, partnerCameraOn: partnerCamOn };
}
