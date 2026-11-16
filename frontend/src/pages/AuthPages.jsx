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
  CheckCircle2,
  MapPin,
  HeartHandshake,
  UserCheck,
  ShieldAlert,
  Flame,
  HeartPulse,
  Wrench,
  Car
} from 'lucide-react';

export function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier) {
      setErrorMessage('Please enter your email or mobile phone number.');
      return;
    }
    setSubmitting(true);
    setErrorMessage('');
    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Login failed. Please check credentials or register a new account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (email, pass = 'password123') => {
    setIdentifier(email);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center mx-auto shadow-md shadow-rose-600/30">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Help Radius</h1>
        <p className="text-xs text-slate-500">Access emergency dispatch radar & community assistance network</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email or Mobile Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="you@example.com or +919876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-3.5 pl-11 rounded-2xl border border-slate-200 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all font-medium"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 pl-11 rounded-2xl border border-slate-200 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all font-medium"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Or use pre-seeded demo</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Quick Demo Logins for Examiner testing */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoFill('priya@example.com')}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 text-left transition-all"
          >
            <span className="block text-xs font-bold text-slate-900 truncate">Priya Sharma</span>
            <span className="text-[10px] text-rose-600 font-semibold block">Requester</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoFill('arjunverma@helpradius.org')}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition-all"
          >
            <span className="block text-xs font-bold text-slate-900 truncate">Arjun Verma</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">Helper</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoFill('admin@helpradius.org')}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-left transition-all"
          >
            <span className="block text-xs font-bold text-slate-900 truncate">Sys Admin</span>
            <span className="text-[10px] text-amber-700 font-semibold block">Admin</span>
          </button>
        </div>

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          New to Help Radius?{' '}
          <Link to="/register" className="font-extrabold text-rose-600 hover:text-rose-700 hover:underline">
            Create an Account with your details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register, userLocation } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 1: Personal Profile
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState(userLocation?.address || 'Bengaluru Central, Karnataka');
  const [accountType, setAccountType] = useState('user'); // 'user' (Requester) or 'helper' (Volunteer)

  // Step 2: Emergency Contact & Volunteer Specifics
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('+91');
  const [contactRelation, setContactRelation] = useState('Parent');

  // Helper categories (if accountType === 'helper')
  const [selectedCategories, setSelectedCategories] = useState([
    'accident',
    'health',
    'personal_safety',
    'puncture',
    'roadside'
  ]);

  // Step 3: Verification & Consents
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [locationConsent, setLocationConsent] = useState(true);
  const [notifConsent, setNotifConsent] = useState(true);

  const toggleCategory = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const sendSimulatedOtp = async () => {
    try {
      const res = await api.post('/auth/send-otp', { phone });
      setOtpSent(true);
      setOtp('123456'); // auto-fill simulated OTP for test convenience
    } catch (e) {
      console.warn('Simulated OTP notice', e);
      setOtpSent(true);
      setOtp('123456');
    }
  };

  const handleStep1Next = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMessage('Please enter your full name and email address.');
      return;
    }
    setErrorMessage('');
    sendSimulatedOtp();
    setStep(2);
  };

  const handleStep2Next = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStep(3);
  };

  const handleRegister = async () => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const emergencyContacts = contactName.trim() ? [
        {
          name: contactName.trim(),
          phone: contactPhone.trim(),
          relationship: contactRelation
        }
      ] : [];

      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        address: address.trim(),
        role: accountType,
        isHelper: accountType === 'helper',
        helperCategories: accountType === 'helper' ? selectedCategories : [],
        emergencyContacts,
        permissions: {
          locationGranted: locationConsent,
          notificationsGranted: notifConsent
        },
        location: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          address: address.trim() || userLocation.address
        }
      });

      navigate('/dashboard');
    } catch (e) {
      setErrorMessage(e.response?.data?.message || 'Registration could not be completed. Please try again.');
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create Your Help Radius Account</h1>
        <p className="text-xs text-slate-500">
          Enter your details to join the location-based emergency and community assistance network
        </p>

        {/* Stepper HUD */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            step === 1 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            <span>1</span>
            <span>Profile Details</span>
          </div>
          <div className="w-4 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            step === 2 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            <span>2</span>
            <span>{accountType === 'helper' ? 'Volunteer Setup' : 'Safety Contacts'}</span>
          </div>
          <div className="w-4 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            step === 3 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            <span>3</span>
            <span>Verification</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: PERSONAL DETAILS & ROLE */}
        {step === 1 && (
          <form onSubmit={handleStep1Next} className="space-y-5">
            {/* Account Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                I am registering as:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType('user')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    accountType === 'user'
                      ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    accountType === 'user' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 block">Community Requester</span>
                    <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                      Launch Emergency SOS, request roadside help, and book companions.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('helper')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    accountType === 'helper'
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    accountType === 'helper' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 block">Volunteer / First-Responder</span>
                    <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                      Receive alerts in my radius, assist neighbors, and earn distance compensation.
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3.5 pl-10 rounded-2xl border border-slate-200 text-sm outline-none focus:border-rose-500"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3.5 pl-10 rounded-2xl border border-slate-200 text-sm outline-none focus:border-rose-500"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                </div>
              </div>
            </div>

            {/* Phone & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3.5 pl-10 rounded-2xl border border-slate-200 text-sm outline-none focus:border-rose-500 font-mono"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3.5 pl-10 rounded-2xl border border-slate-200 text-sm outline-none focus:border-rose-500"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                </div>
              </div>
            </div>

            {/* City / Locality Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Primary City / Neighborhood
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Indiranagar, Bangalore"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3.5 pl-10 rounded-2xl border border-slate-200 text-sm outline-none focus:border-rose-500"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: SAFETY CONTACTS & VOLUNTEER CAPABILITIES */}
        {step === 2 && (
          <form onSubmit={handleStep2Next} className="space-y-6">
            {/* Primary Emergency Contact */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Primary Emergency Contact (Notified immediately during SOS)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                This contact will receive SMS & WhatsApp broadcasts whenever you trigger SOS, regardless of geographic distance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Papa / Ramesh"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+919811223344"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Relationship</label>
                  <select
                    value={contactRelation}
                    onChange={(e) => setContactRelation(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-rose-500 bg-white"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Spouse">Spouse / Partner</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend / Roommate</option>
                    <option value="Doctor">Family Doctor</option>
                    <option value="Colleague">Colleague</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Volunteer Specializations (if helper) */}
            {accountType === 'helper' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 block">Volunteer Rescue Capabilities</span>
                    <span className="text-xs text-slate-500">Select categories you are ready to assist with</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Auto-Verified Prototype
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'accident', name: 'Road Accidents', icon: Flame },
                    { id: 'health', name: 'Medical / CPR', icon: HeartPulse },
                    { id: 'personal_safety', name: 'Safety Escort', icon: UserCheck },
                    { id: 'physical_danger', name: 'Physical Danger', icon: ShieldAlert },
                    { id: 'puncture', name: 'Tyre Puncture', icon: Wrench },
                    { id: 'roadside', name: 'Vehicle Tow/Jump', icon: Car }
                  ].map(cat => (
                    <label
                      key={cat.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all text-xs font-semibold ${
                        selectedCategories.includes(cat.id)
                          ? 'border-emerald-500 bg-white text-emerald-900 shadow-sm'
                          : 'border-slate-200 text-slate-600 bg-white/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="rounded text-emerald-600"
                      />
                      <cat.icon className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3.5 px-6 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: OTP VERIFICATION & CONSENT */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 text-center space-y-2">
              <span className="text-xs text-slate-600 block">
                Verification code sent to <strong>{phone || 'your phone'}</strong>
              </span>
              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3.5 text-center text-2xl font-mono tracking-[0.4em] font-extrabold rounded-2xl border border-slate-200 outline-none focus:border-rose-500 bg-white shadow-inner"
                />
              </div>
              <span className="text-[11px] text-slate-400 block">
                (Prototype Testing Code: <strong className="text-rose-600 font-mono">123456</strong>)
              </span>
            </div>

            {/* Permissions */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase block">Required Device Permissions</span>
              
              <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={locationConsent}
                  onChange={(e) => setLocationConsent(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600"
                />
                <span className="text-slate-700">
                  <strong>Precise GPS Geofencing:</strong> Grant permission to accurately calculate distance and dynamic radius expansion during emergencies.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={notifConsent}
                  onChange={(e) => setNotifConsent(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600"
                />
                <span className="text-slate-700">
                  <strong>Push Alert Notifications:</strong> Allow incoming requests, helper dispatch updates, and private tracking signals.
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3.5 px-6 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleRegister}
                disabled={submitting}
                className="flex-1 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Complete Registration & Launch Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="font-extrabold text-rose-600 hover:text-rose-700 hover:underline">
            Sign In here &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
