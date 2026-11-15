import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send, Play, Pause } from 'lucide-react';

export default function VoiceNoteRecorder({ onAudioReady, onCancel }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied or unsupported:', err);
      alert('Microphone access required to record audio note.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleDiscard = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordDuration(0);
    setIsRecording(false);
    if (onCancel) onCancel();
  };

  const handleSend = () => {
    if (audioUrl && onAudioReady) {
      onAudioReady({
        url: audioUrl,
        durationSec: recordDuration,
        type: 'audio',
        fileName: `voice_note_${Date.now()}.webm`
      });
      handleDiscard();
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatSec = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-inner">
      {!audioUrl ? (
        <>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2.5 rounded-xl text-white font-bold transition-all ${
                isRecording ? 'bg-red-600 animate-pulse' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-400'}`} />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {isRecording ? `Recording voice note: ${formatSec(recordDuration)}` : 'Click mic to record voice note'}
              </span>
            </div>
          </div>
          {isRecording && (
            <button
              type="button"
              onClick={handleDiscard}
              className="text-xs text-slate-500 hover:text-red-600 font-semibold"
            >
              Cancel
            </button>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-1">
            <button
              type="button"
              onClick={togglePlayback}
              className="p-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="flex-1">
              <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full w-2/3 animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                Duration: {formatSec(recordDuration)}
              </span>
            </div>
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDiscard}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50"
              title="Discard"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              title="Send Voice Note"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
