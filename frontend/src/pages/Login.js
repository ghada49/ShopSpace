import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['fashion', 'beauty', 'lifestyle', 'handmade', 'fitness'];
const LOCATIONS = ['Beirut', 'Saida', 'Tripoli', 'Byblos', 'Jounieh'];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('brand');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [preferred_category, setPreferredCategory] = useState('fashion');
  const [preferred_location, setPreferredLocation] = useState('Beirut');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (mode === 'signup') {
        res = await authAPI.register({
          name, email, password, role,
          ...(role === 'brand' ? { preferred_category, preferred_location } : {}),
        });
      } else {
        res = await authAPI.login({ email, password });
      }
      const { token, ...userData } = res.data;
      login(token, userData);
      if (userData.role === 'host') navigate('/host-dashboard');
      else navigate('/brand-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Branding ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-[#0c0b1e] flex-col justify-between p-12">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/25 blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-[400px] w-[400px] rounded-full bg-violet-600/20 blur-[100px]" />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-2 z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined">storefront</span>
          </div>
          <span className="text-xl font-black tracking-tight text-white">ShopSpace</span>
        </Link>

        {/* Headline + Stats */}
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight">
            Find your perfect<br />
            <span className="bg-gradient-to-r from-primary via-violet-400 to-purple-400 bg-clip-text text-transparent">
              retail partner.
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed max-w-xs">
            Connect brands and spaces across Lebanon with smart matching and instant bookings.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              { value: '2,500+', label: 'Active Brands' },
              { value: '850+', label: 'Retail Spaces' },
              { value: '98%', label: 'Match Accuracy' },
              { value: '$2.4k', label: 'Avg. Host Earnings' },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="mt-1 text-xs text-slate-400 font-medium">{label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300 italic leading-relaxed">
              "ShopSpace helped us find the perfect pop-up location in Beirut in under 48 hours. The match score is incredibly accurate."
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white">Sarah K.</div>
                <div className="text-[10px] text-slate-400">Brand Owner · Beirut</div>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-600">© 2024 ShopSpace Technologies Inc.</p>
      </div>

      {/* ── Right Panel: Form ────────────────────────────── */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto bg-background-light px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">ShopSpace</span>
            </Link>
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Join ShopSpace'}
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            {mode === 'login'
              ? 'Sign in to continue to your dashboard.'
              : 'Create your free account and start today.'}
          </p>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            {/* Mode Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Log In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Sign Up
              </button>
            </div>

            {/* Role Selector */}
            <div className="mb-6">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('brand')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    role === 'brand'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-slate-200 hover:border-primary/40'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${role === 'brand' ? 'text-primary' : 'text-slate-400'}`}>
                    storefront
                  </span>
                  <span className={`text-sm font-bold ${role === 'brand' ? 'text-primary' : 'text-slate-600'}`}>
                    Brand
                  </span>
                  <span className="text-[10px] text-slate-400 text-center">Looking for retail space</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('host')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    role === 'host'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-slate-200 hover:border-primary/40'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${role === 'host' ? 'text-primary' : 'text-slate-400'}`}>
                    store
                  </span>
                  <span className={`text-sm font-bold ${role === 'host' ? 'text-primary' : 'text-slate-600'}`}>
                    Host
                  </span>
                  <span className="text-[10px] text-slate-400 text-center">Listing retail space</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                <span className="material-symbols-outlined text-sm mt-0.5 shrink-0">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="Your full name"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              {mode === 'signup' && role === 'brand' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Category
                    </label>
                    <select
                      value={preferred_category}
                      onChange={e => setPreferredCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Preferred City
                    </label>
                    <select
                      value={preferred_location}
                      onChange={e => setPreferredLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <button type="button" className="text-xs text-primary font-semibold hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs text-slate-400 bg-white px-3">or</div>
            </div>

            <button className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-xs text-slate-400 mt-6">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-primary font-bold hover:underline"
              >
                {mode === 'login' ? 'Sign Up Free' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
