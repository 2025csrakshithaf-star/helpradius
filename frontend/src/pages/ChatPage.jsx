import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VoiceNoteRecorder from '../components/VoiceNoteRecorder';
import VoiceCallModal from '../components/VoiceCallModal';
import api from '../services/api';
import {
  Send,
  Phone,
  Image,
  Mic,
  MoreVertical,
  ShieldAlert,
  Check,
  CheckCheck,
  ArrowLeft,
  Lock,
  User
} from 'lucide-react';

export default function ChatPage() {
  const { id } = useParams(); // requestId
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const fetchChat = async () => {
    try {
      const res = await api.get(`/chats/${id}/messages`);
      setChat(res.data.chat);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.warn('Could not load chat messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 2500);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (customPayload) => {
    const payload = customPayload || { text: inputText };
    if (!payload.text && !payload.media) return;

    try {
      await api.post(`/chats/${id}/messages`, payload);
      setInputText('');
      fetchChat();
    } catch (e) {
      alert(e.response?.data?.message || 'Could not send message.');
    }
  };

  const handleAudioReady = (audioItem) => {
    handleSendMessage({
      type: 'audio',
      text: 'Voice Note',
      media: audioItem
    });
    setShowVoiceRecorder(false);
  };

  const handleSimulatePhoto = () => {
    handleSendMessage({
      type: 'image',
      text: 'Shared photo',
      media: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=600',
        fileName: 'location_snapshot.jpg'
      }
    });
  };

  const handleReport = async () => {
    const reason = prompt('Reason for reporting user (safety moderation):');
    if (!reason) return;
    try {
      await api.post(`/chats/${id}/report`, {
        reason,
        reportedUserId: chat?.participants?.find(p => p !== user?.id)
      });
      alert('Report submitted to safety moderators. Thank you.');
      setMenuOpen(false);
    } catch (e) {
      alert('Could not submit report.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center text-xs font-bold text-slate-500">
        Loading encrypted chat...
      </div>
    );
  }

  const isLocked = chat && !chat.active;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[750px]">
        {/* Chat Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/requests/${id}`)}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white border border-slate-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Assistance Chat</h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Encrypted • No Phone Numbers Shared</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isLocked && (
              <button
                onClick={() => setCallModalOpen(true)}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                title="In-App Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-300"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-44 bg-slate-800 rounded-xl shadow-xl py-1 text-xs border border-slate-700 z-30">
                  <button
                    onClick={handleReport}
                    className="w-full px-3 py-2 text-left text-rose-400 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Report User</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            const isSystem = msg.type === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-[11px] font-semibold">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3.5 space-y-1 shadow-sm ${
                  isMe
                    ? 'bg-rose-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                }`}>
                  <span className={`block text-[10px] font-bold ${isMe ? 'text-rose-200' : 'text-slate-500'}`}>
                    {msg.senderName}
                  </span>

                  {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}

                  {/* Photo Preview */}
                  {msg.media?.type === 'image' && (
                    <div className="rounded-xl overflow-hidden mt-1 max-h-48">
                      <img src={msg.media.url} alt="Attached" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Audio Note Player */}
                  {msg.media?.type === 'audio' && (
                    <div className="pt-1">
                      <audio controls src={msg.media.url} className="w-full h-8" />
                    </div>
                  )}

                  <div className={`flex items-center justify-end gap-1 text-[9px] pt-1 ${isMe ? 'text-rose-200' : 'text-slate-400'}`}>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-rose-200" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Chips */}
        {!isLocked && (
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
            {["I'm on my way!", "Where are you exactly?", "I have reached the location."].map((quick, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage({ text: quick })}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap text-[11px] font-medium"
              >
                {quick}
              </button>
            ))}
          </div>
        )}

        {/* Voice Note Recorder Tray */}
        {showVoiceRecorder && (
          <div className="p-3 bg-white border-t border-slate-200">
            <VoiceNoteRecorder
              onAudioReady={handleAudioReady}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          </div>
        )}

        {/* Composer Bar */}
        {!isLocked ? (
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSimulatePhoto}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Attach Photo"
            >
              <Image className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              title="Record Voice Note"
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type encrypted message..."
              className="flex-1 p-3 rounded-2xl bg-slate-100 border border-slate-200 text-sm outline-none focus:border-rose-500"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 bg-slate-100 text-center text-xs text-slate-500 flex items-center justify-center gap-2 font-medium">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Assistance session has ended. Private chat is locked to protect user privacy.</span>
          </div>
        )}
      </div>

      <VoiceCallModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        requestId={id}
        participantName="Connected Helper"
        isIncoming={false}
      />
    </div>
  );
}
