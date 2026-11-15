import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, ShieldCheck, User } from 'lucide-react';
import api from '../services/api';

export default function VoiceCallModal({
  isOpen,
  onClose,
  requestId,
  participantName = 'Helper / Requester',
  isIncoming = false,
  callSession
}) {
  const [callState, setCallState] = useState(isIncoming ? 'ringing' : 'connecting'); // 'ringing' | 'connected' | 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef(null);
  const toneIntervalRef = useRef(null);

  // Play ringing sound using Web Audio API
  useEffect(() => {
    if (!isOpen) return;

    if (callState === 'ringing' || callState === 'connecting') {
      const playRingTone = () => {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.2);
        } catch (e) {}
      };

      playRingTone();
      toneIntervalRef.current = setInterval(playRingTone, 3000);
    } else {
      if (toneIntervalRef.current) clearInterval(toneIntervalRef.current);
    }

    return () => {
      if (toneIntervalRef.current) clearInterval(toneIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, callState]);

  // Handle call timer when connected
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [callState]);

  // If outgoing, auto-simulate helper answering after 3 seconds for smooth demonstration
  useEffect(() => {
    if (isOpen && !isIncoming && callState === 'connecting') {
      const connectTimeout = setTimeout(() => {
        setCallState('connected');
      }, 3500);
      return () => clearTimeout(connectTimeout);
    }
  }, [isOpen, isIncoming, callState]);

  const handleAccept = async () => {
    setCallState('connected');
    try {
      await api.post(`/calls/${requestId}/answer`);
    } catch (e) {}
  };

  const handleEnd = async () => {
    setCallState('ended');
    try {
      await api.post(`/calls/${requestId}/end`, { status: 'ended' });
    } catch (e) {}
    setTimeout(() => {
      onClose();
      setCallState(isIncoming ? 'ringing' : 'connecting');
      setCallDuration(0);
    }, 800);
  };

  if (!isOpen) return null;

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 text-white rounded-3xl p-6 text-center shadow-2xl border border-slate-800 space-y-6">
        {/* Security badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>In-App Encrypted Call • No Phone Numbers Shared</span>
        </div>

        {/* Participant Avatar */}
        <div className="relative inline-block mx-auto">
          <div className={`w-28 h-28 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-4xl shadow-xl overflow-hidden mx-auto ${
            callState === 'ringing' || callState === 'connecting' ? 'animate-bounce' : ''
          }`}>
            <User className="w-14 h-14 text-slate-400" />
          </div>
          {callState === 'connected' && (
            <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-xs">
              ✓
            </span>
          )}
        </div>

        {/* Name & Call Status */}
        <div>
          <h3 className="text-xl font-bold">{participantName}</h3>
          <p className="text-xs text-slate-400 mt-1">
            {callState === 'connecting' && 'Calling helper via WebRTC...'}
            {callState === 'ringing' && 'Incoming assistance call...'}
            {callState === 'connected' && `In Call • ${formatTimer(callDuration)}`}
            {callState === 'ended' && 'Call Ended'}
          </p>
        </div>

        {/* Call Controls */}
        {callState === 'ringing' ? (
          <div className="flex items-center justify-center gap-8 pt-4">
            <button
              onClick={handleEnd}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transform active:scale-90 transition-all"
              title="Decline"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <button
              onClick={handleAccept}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transform active:scale-90 transition-all animate-pulse"
              title="Accept"
            >
              <Phone className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full transition-all ${
                  isMuted ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                className="p-3.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700"
                title="Speaker"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleEnd}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Call</span>
            </button>
          </div>
        )}

        <div className="text-[10px] text-slate-500">
          Prototype / Simulated WebRTC Calling Engine (STUN/Signaling simulated)
        </div>
      </div>
    </div>
  );
}
