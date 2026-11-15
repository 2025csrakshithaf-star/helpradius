import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  AlertTriangle,
  User,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  Compass,
  Bell,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('priya@example.com');
  const [password, setPassword] = useState('password123');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center mx-auto shadow-md shadow-rose-600/30">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Welcome to Help Radius</h1>
        <p className="text-xs text-slate-500">Sign in to access emergency radar & community assistance</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-rose-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-rose-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [locationConsent, setLocationConsent] = useState(true);
  const [notifConsent, setNotifConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const sendSimulatedOtp = async () => {
    try {
      const res = await api.post('/auth/send-otp', { phone });
      alert(res.data.message);
      setOtpSent(true);
    } catch (e) {
      alert('Could not send OTP');
    }
  };

  const handleRegister = async () => {
    setSubmitting(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        permissions: {
          locationGranted: locationConsent,
          notificationsGranted: notifConsent
        }
      });
      alert('Registration complete! Welcome to Help Radius.');
      navigate('/dashboard');
    } catch (e) {
      alert('Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-900">Create Help Radius Account</h1>
        <p className="text-xs text-slate-500">Step {step} of 3: Community Registration</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl border text-sm outline-none focus:border-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
              <input
                type="email"
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border text-sm outline-none focus:border-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile (+91)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-xl border text-sm outline-none focus:border-rose-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl border text-sm outline-none focus:border-rose-500"
                required
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (!name || !email) { alert('Please enter name and email'); return; }
                sendSimulatedOtp();
                setStep(2);
              }}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow"
            >
              Continue to Phone Verification
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <span className="text-xs text-slate-600 block">
              Enter 6-digit verification code sent to <strong>{phone}</strong> (Prototype code: <strong>123456</strong>)
            </span>
            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3.5 text-center text-xl font-mono tracking-widest rounded-xl border outline-none"
            />
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow"
            >
              Verify OTP & Proceed
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-2xl border space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={locationConsent}
                  onChange={(e) => setLocationConsent(e.target.checked)}
                />
                <span>Allow GPS location access for emergency geofence search</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={notifConsent}
                  onChange={(e) => setNotifConsent(e.target.checked)}
                />
                <span>Allow Push Notifications for immediate alerts</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleRegister}
              disabled={submitting}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow"
            >
              {submitting ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
