import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, User, Key, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/admin/login', {
        usernameOrEmail: usernameOrEmail.trim(),
        password: password.trim(),
      });

      if (res.data?.success) {
        const { token, admin } = res.data.data;
        localStorage.setItem('anamika_admin_token', token);
        localStorage.setItem('anamika_admin_user', JSON.stringify(admin));
        navigate('/admin/dashboard');
      } else {
        setErrorMsg(res.data?.message || 'Authentication failed');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-luxury-warmWhite">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-luxury border border-luxury-gold/30 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-luxury-wine/10 border border-luxury-gold/40 flex items-center justify-center mx-auto text-luxury-wine">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-luxury-gold-dark">
            SECURE EXECUTIVE ACCESS
          </span>
          <h1 className="font-serif text-2xl font-bold text-luxury-espresso">
            ANAMIKA COLLECTIONS
          </h1>
          <p className="text-xs text-luxury-espresso/60">
            Store Owner & Executive Administration Portal
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-luxury-espresso mb-1">
              Admin Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-luxury-espresso/40 absolute left-3 top-3" />
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                placeholder="e.g. anamika_admin or admin@anamikacollections.com"
                className="w-full bg-luxury-warmWhite border border-luxury-gold/30 rounded-lg pl-9 pr-3 py-2.5 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-luxury-espresso mb-1">
              Secret Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-luxury-espresso/40 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full bg-luxury-warmWhite border border-luxury-gold/30 rounded-lg pl-9 pr-3 py-2.5 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
              />
            </div>
          </div>

          <div className="bg-luxury-ivory p-3 rounded text-[11px] text-luxury-espresso/70 border border-luxury-gold/20">
            <p className="font-semibold text-luxury-wine mb-0.5">Seeded Development Credentials:</p>
            <p>Username: <strong className="font-mono">anamika_admin</strong></p>
            <p>Password: <strong className="font-mono">AnamikaAdmin@2026</strong></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-luxury-wine hover:bg-luxury-wine-light text-luxury-ivory font-serif font-bold py-3 rounded-lg text-xs uppercase tracking-widest shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4 text-luxury-gold" />
            <span>{loading ? 'Authenticating...' : 'Authorize Admin Session'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

