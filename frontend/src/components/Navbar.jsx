import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import {
  AlertTriangle,
  Shield,
  Activity,
  User,
  Bell,
  Radio,
  CheckCircle2,
  Menu,
  X,
  PhoneCall,
  Clock,
  Compass,
  Lock,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function Navbar({ onOpenSOS }) {
  const { user, helperProfile, loginAsDemo, logout, toggleAvailability } = useAuth();
  const { notifications } = useNotifications();
  const [backendStatus, setBackendStatus] = useState('checking');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res.data.status === 'ok') {
          setBackendStatus('online');
        } else {
          setBackendStatus('degraded');
        }
      } catch (err) {
        setBackendStatus('offline');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-rose-950 to-rose-600 bg-clip-text text-transparent">
                  Help Radius
                </span>
                <span className="block text-[10px] font-semibold text-rose-600 tracking-wider uppercase -mt-1">
                  Emergency & Community
                </span>
              </div>
            </Link>

            {/* Backend status badge */}
            <div className="hidden md:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200">
              <span className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-600">
                Backend: <strong className={backendStatus === 'online' ? 'text-emerald-700' : 'text-rose-700'}>{backendStatus}</strong>
              </span>
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                location.pathname === '/dashboard' ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/helper-inbox"
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                location.pathname === '/helper-inbox' ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-600" />
              Helper Inbox
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                  location.pathname === '/admin' ? 'text-amber-700 bg-amber-50' : 'text-amber-800 hover:bg-amber-100/50'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                Admin Panel
              </Link>
            )}

            <Link
              to="/profile"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                location.pathname === '/profile' ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Profile & Contacts
            </Link>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Role Switcher for Examiners */}
            <div className="hidden xl:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold px-1.5">Demo:</span>
              <button
                onClick={() => loginAsDemo('user')}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                  user?.id === 'usr_demo_001' ? 'bg-white shadow text-rose-600' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Priya Sharma (Requester Demo)"
              >
                Priya
              </button>
              <button
                onClick={() => loginAsDemo('helper')}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                  user?.id === 'hlp_001' ? 'bg-white shadow text-emerald-600' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Arjun Verma (Helper Demo)"
              >
                Arjun
              </button>
              <button
                onClick={() => loginAsDemo('admin')}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                  user?.role === 'admin' ? 'bg-white shadow text-amber-700' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Admin Demo"
              >
                Admin
              </button>
            </div>

            {/* User Session HUD: Signed in vs Signed out */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-6 h-6 rounded-lg object-cover border border-slate-300"
                  />
                  <div className="hidden sm:block text-left text-xs leading-none">
                    <span className="font-bold text-slate-900 block truncate max-w-[100px]">{user.name}</span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {user.role === 'admin' ? 'Admin' : (user.isHelper ? 'Helper' : 'Requester')}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Big Prominent Emergency SOS button in navbar */}
            <button
              onClick={onOpenSOS}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all transform active:scale-95 animate-pulse"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>SOS</span>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {user ? (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-xl object-cover"
                />
                <div>
                  <span className="font-bold text-slate-900 block text-xs">{user.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{user.email || user.phone}</span>
                </div>
              </div>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-100"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-xs font-bold rounded-xl bg-slate-900 text-white shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}

          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            Dashboard
          </Link>
          <Link
            to="/helper-inbox"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            Helper Inbox
          </Link>
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            Emergency Contacts & Profile
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-amber-700 hover:bg-amber-50"
            >
              Admin Moderation Panel
            </Link>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 w-full font-bold">Quick Demo Accounts:</span>
            <button
              onClick={() => { loginAsDemo('user'); setMobileMenuOpen(false); }}
              className="px-2.5 py-1 text-xs bg-slate-100 rounded-md font-medium text-slate-700"
            >
              Priya (Requester)
            </button>
            <button
              onClick={() => { loginAsDemo('helper'); setMobileMenuOpen(false); }}
              className="px-2.5 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-md font-medium"
            >
              Arjun (Helper)
            </button>
            <button
              onClick={() => { loginAsDemo('admin'); setMobileMenuOpen(false); }}
              className="px-2.5 py-1 text-xs bg-amber-50 text-amber-800 rounded-md font-medium"
            >
              Admin
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
