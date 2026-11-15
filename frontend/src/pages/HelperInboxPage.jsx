import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Radio,
  AlertTriangle,
  Compass,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Flame,
  UserCheck
} from 'lucide-react';

export default function HelperInboxPage() {
  const { user, helperProfile, toggleAvailability } = useAuth();
  const navigate = useNavigate();

  const [inboxRequests, setInboxRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchInbox = async () => {
    try {
      const res = await api.get('/helpers/inbox');
      setInboxRequests(res.data.requests || []);
    } catch (e) {
      console.warn('Failed to fetch inbox', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (requestId) => {
    setAcceptingId(requestId);
    try {
      const res = await api.post(`/requests/${requestId}/accept`);
      alert('Request accepted successfully! Navigating to live command center.');
      navigate(`/requests/${requestId}`);
    } catch (err) {
      if (err.response?.status === 409) {
        alert('Another nearby helper already accepted this request.');
      } else {
        alert(err.response?.data?.message || 'Could not accept request.');
      }
      fetchInbox();
    } finally {
      setAcceptingId(null);
    }
  };

  const isAvailable = Boolean(helperProfile?.isAvailable);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner: Availability Radar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-all ${
            isAvailable ? 'bg-emerald-500 shadow-emerald-500/20 animate-pulse' : 'bg-slate-400'
          }`}>
            <Radio className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">Helper Dispatch Radar</h1>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {isAvailable ? 'Online & Listening' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAvailable ? 'Scanning your vicinity for incoming emergency and general requests' : 'Toggle online to receive nearby assistance notifications'}
            </p>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleAvailability}
          className={`px-6 py-3 rounded-2xl font-bold text-xs shadow-md transition-all ${
            isAvailable
              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
          }`}
        >
          {isAvailable ? 'Go Offline' : 'Go Online Now'}
        </button>
      </div>

      {/* Helper Verification Badge Info */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 flex items-center justify-between shadow-lg text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="font-bold block">
              {helperProfile?.safetyEligible ? 'Verified Emergency First-Responder' : 'Community Volunteer'}
            </span>
            <span className="text-slate-400 text-[11px]">
              {helperProfile?.safetyEligible
                ? 'Authorized to accept high-priority personal safety and accident alerts'
                : 'Eligible for general and scheduled community assistance'}
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-[10px] font-mono font-bold text-emerald-400 border border-slate-700">
          Rating: {helperProfile?.rating || '5.0'} ★
        </span>
      </div>

      {/* INCOMING REQUESTS FEED */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-lg font-black text-slate-900">Nearby Incoming Requests</h2>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {inboxRequests.length} pending
          </span>
        </div>

        {inboxRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Radar Clear</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No pending requests matching your current radius. As soon as someone nearby triggers help, it will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {inboxRequests.map(req => {
              const isSOS = req.type === 'emergency';
              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-3xl p-6 border shadow-sm transition-all space-y-4 ${
                    isSOS ? 'border-rose-400 ring-2 ring-rose-500/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isSOS ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.type} • {req.category.replace('_', ' ')}
                        </span>
                        {req.requiresVerifiedHelper && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                            Safety Verified Required
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-1">{req.description}</h3>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-rose-600">
                        {req.distanceKm} km away
                      </span>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">
                        Within current {req.radius?.currentKm} km radius
                      </span>
                    </div>
                  </div>

                  {/* Location & Compensation Details */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>{req.location?.address || 'User Coordinates'}</span>
                    </div>

                    {!isSOS && (
                      <span className="font-bold text-emerald-700">
                        Estimated Compensation: ₹{req.travelCompensationEstimate || 40} + ₹{req.voluntaryReward || 0} reward
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setInboxRequests(prev => prev.filter(r => r.id !== req.id))}
                      className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={acceptingId === req.id}
                      className={`px-6 py-2.5 rounded-2xl text-white font-extrabold text-xs shadow-md transition-all ${
                        isSOS
                          ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                          : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                      }`}
                    >
                      {acceptingId === req.id ? 'Accepting...' : 'Accept & Navigate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
