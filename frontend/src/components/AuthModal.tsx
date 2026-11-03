import React, { useState } from 'react';
import { X, Sparkles, Phone, Mail, Key, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register, requestOtp, verifyOtp } = useAuth();
  const [mode, setMode] = useState<'REGISTER' | 'LOGIN_PASSWORD' | 'LOGIN_OTP'>('REGISTER');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // OTP Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setOtpSent(false);
    setOtpCode('');
  };

  // Step 1 of Registration: Validates Full Name, Email, Phone, Password & Dispatches Live Email OTP
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim() || !email.trim() || !password || !phone.trim()) {
      setErrorMsg('All fields including Full Name, Email, Phone Number, and Password are required.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    setLoading(true);
    const res = await register(fullName.trim(), email.trim(), password, phone.trim());
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Step 2 of Registration or OTP Login: Verifies the code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setErrorMsg('');
    setLoading(true);
    const res = await verifyOtp(email.trim(), otpCode.trim(), phone.trim() || undefined);
    setLoading(false);

    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  // Email + Password direct login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  // Request OTP for Email OTP Login
  const handleRequestLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setErrorMsg('');
    setLoading(true);
    const res = await requestOtp(email.trim(), undefined, phone.trim() || undefined);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-luxury-cream w-full max-w-md rounded-2xl shadow-2xl border border-luxury-gold/30 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-luxury-wine to-luxury-wine-dark text-luxury-ivory p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-luxury-ivory/70 hover:text-luxury-ivory rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center space-x-1 text-luxury-gold mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">ANAMIKA COLLECTIONS</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-2xl font-bold tracking-wide">
            {mode === 'REGISTER' && (otpSent ? 'Verify Your Email' : 'Join Our Royal Circle')}
            {mode === 'LOGIN_PASSWORD' && 'Sign in with Password'}
            {mode === 'LOGIN_OTP' && (otpSent ? 'Enter Verification Code' : 'Sign in via Email OTP')}
          </h3>
          <p className="text-xs text-luxury-ivory/80 mt-1 font-light">
            Elegance in Every Thread | Live Email Verification
          </p>
        </div>

        {/* Tab Switcher */}
        {!otpSent && (
          <div className="grid grid-cols-3 border-b border-luxury-gold/20 text-xs font-semibold uppercase tracking-wider text-center bg-luxury-ivory">
            <button
              onClick={() => {
                setMode('REGISTER');
                resetForm();
              }}
              className={`py-3 transition-colors ${
                mode === 'REGISTER'
                  ? 'border-b-2 border-luxury-wine text-luxury-wine bg-white'
                  : 'text-luxury-espresso/60 hover:text-luxury-wine'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => {
                setMode('LOGIN_PASSWORD');
                resetForm();
              }}
              className={`py-3 transition-colors ${
                mode === 'LOGIN_PASSWORD'
                  ? 'border-b-2 border-luxury-wine text-luxury-wine bg-white'
                  : 'text-luxury-espresso/60 hover:text-luxury-wine'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => {
                setMode('LOGIN_OTP');
                resetForm();
              }}
              className={`py-3 transition-colors ${
                mode === 'LOGIN_OTP'
                  ? 'border-b-2 border-luxury-wine text-luxury-wine bg-white'
                  : 'text-luxury-espresso/60 hover:text-luxury-wine'
              }`}
            >
              Email OTP
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg leading-relaxed">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* OTP Verification Screen (Used for both Registration & OTP Login) */}
          {otpSent ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs text-luxury-espresso/70">
                  Verification code dispatched to:
                </span>
                <p className="font-semibold text-sm text-luxury-wine font-mono">{email}</p>
                <p className="text-[11px] text-luxury-espresso/60">
                  Please check your inbox (and spam/promotions folder).
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-1 text-center">
                  Enter 6-Digit Email Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  autoFocus
                  placeholder="••••••"
                  className="w-full text-center tracking-[0.6em] text-2xl font-bold bg-white border border-luxury-gold/40 rounded-lg py-3 text-luxury-wine focus:outline-none focus:border-luxury-wine"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full bg-luxury-wine hover:bg-luxury-wine-light disabled:opacity-50 text-luxury-ivory font-serif font-bold py-3 rounded-lg shadow-md transition-colors text-xs uppercase tracking-widest"
              >
                {loading ? 'Verifying Code...' : 'Complete & Enter Store'}
              </button>

              <div className="flex justify-between items-center text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-luxury-wine hover:underline"
                >
                  ← Change Email / Phone
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    await requestOtp(email, fullName, phone, password);
                    setLoading(false);
                    setSuccessMsg(`Resent fresh verification code to ${email}`);
                  }}
                  className="text-luxury-gold-dark hover:underline font-semibold"
                >
                  Resend Code
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* TAB 1: REGISTRATION (Collects Full Name, Email, Phone, Password + Email OTP) */}
              {mode === 'REGISTER' && (
                <form onSubmit={handleInitiateRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-luxury-espresso/40 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="e.g. Radhika Sharma"
                        className="w-full bg-white border border-luxury-gold/30 rounded-lg pl-9 pr-3 py-2 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-1">
                      Email Address (for Verification Code) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-luxury-espresso/40 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="name@example.com"
                        className="w-full bg-white border border-luxury-gold/30 rounded-lg pl-9 pr-3 py-2 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-1">
                      Mobile Number (Mandatory for Courier & Order Updates) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-luxury-espresso/40 absolute left-3 top-3" />
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        required
                        placeholder="10-digit Indian Mobile (e.g. 9876543210)"
                        className="w-full bg-white border border-luxury-gold/30 rounded-lg pl-9 pr-3 py-2 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-1">
                      Secret Password *
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-luxury-espresso/40 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="At least 6 characters"
                        className="w-full bg-white border border-luxury-gold/30 rounded-lg pl-9 pr-3 py-2 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-luxury-wine hover:bg-luxury-wine-light disabled:opacity-50 text-luxury-ivory font-serif font-bold py-3 rounded-lg shadow-md transition-colors text-xs uppercase tracking-widest mt-2"
                  >
                    {loading ? 'Sending Email Verification...' : 'Send Verification OTP →'}
                  </button>
                </form>
              )}

              {/* TAB 2: EMAIL + PASSWORD LOGIN */}
              {mode === 'LOGIN_PASSWORD' && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-luxury-espresso/40 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="name@example.com"
                        className="w-full bg-white border border-luxury-gold/30 rounded-lg pl-9 pr-3 py-2 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-luxury-espresso/40 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••••••"
                        className="w-full bg-white border border-luxury-gold/30 rounded-lg pl-9 pr-3 py-2 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-luxury-wine hover:bg-luxury-wine-light disabled:opacity-50 text-luxury-ivory font-serif font-bold py-3 rounded-lg shadow-md transition-colors text-xs uppercase tracking-widest"
                  >
                    {loading ? 'Signing In...' : 'Sign In with Password'}
                  </button>
                </form>
              )}

              {/* TAB 3: EMAIL OTP INSTANT LOGIN */}
              {mode === 'LOGIN_OTP' && (
                <form onSubmit={handleRequestLoginOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-1">
                      Enter Your Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-luxury-espresso/40 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="name@example.com"
                        className="w-full bg-white border border-luxury-gold/30 rounded-lg pl-9 pr-3 py-2 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                      />
                    </div>
                    <p className="text-[11px] text-luxury-espresso/60 mt-1">
                      We will dispatch a real-time 6-digit verification code directly to your email inbox.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-luxury-wine hover:bg-luxury-wine-light disabled:opacity-50 text-luxury-ivory font-serif font-bold py-3 rounded-lg shadow-md transition-colors text-xs uppercase tracking-widest"
                  >
                    {loading ? 'Sending Code...' : 'Get Email OTP Code →'}
                  </button>
                </form>
              )}

              {/* Guest Checkout Notice */}
              <div className="mt-6 pt-4 border-t border-luxury-gold/20 text-center">
                <p className="text-xs text-luxury-espresso/60">
                  Prefer not to create an account yet? You can continue directly with <strong>Guest Checkout</strong> anytime.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
