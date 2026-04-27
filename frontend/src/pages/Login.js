import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, formatCategory } from '../constants/categories';

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
      const res = mode === 'signup'
        ? await authAPI.register({
            name,
            email,
            password,
            role,
            ...(role === 'brand' ? { preferred_category, preferred_location } : {}),
          })
        : await authAPI.login({ email, password });

      const { token, ...userData } = res.data;
      login(token, userData);
      navigate(userData.role === 'host' ? '/host-dashboard' : '/brand-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background-light">
      <div className="hidden lg:flex lg:w-5/12 bg-[#0c0b1e] flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <span className="material-symbols-outlined">storefront</span>
          </div>
          <span className="text-xl font-black tracking-tight text-white">BaynSpace</span>
        </Link>

        <div>
          <h2 className="text-4xl font-black text-white leading-tight">
            Retail spaces for pop-up brands.
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed max-w-sm">
            Browse spaces, request bookings, and let hosts approve or reject requests.
          </p>
        </div>

        <p className="text-xs text-slate-600">BaynSpace MVP</p>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">BaynSpace</span>
            </Link>
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-1">
            {mode === 'login' ? 'Log in' : 'Create account'}
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            {mode === 'login' ? 'Use your email and password.' : 'Choose a role and sign up.'}
          </p>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                Sign Up
              </button>
            </div>

            {mode === 'signup' && (
              <div className="mb-6">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'brand', icon: 'storefront', label: 'Brand' },
                    { value: 'host', icon: 'store', label: 'Host' },
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 ${
                        role === option.value ? 'border-primary bg-primary/5' : 'border-slate-200'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-2xl ${role === option.value ? 'text-primary' : 'text-slate-400'}`}>
                        {option.icon}
                      </span>
                      <span className={`text-sm font-bold ${role === option.value ? 'text-primary' : 'text-slate-600'}`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Full Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </label>
              )}

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </label>

              {mode === 'signup' && role === 'brand' && (
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Category</span>
                    <select
                      value={preferred_category}
                      onChange={e => setPreferredCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{formatCategory(c)}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">City</span>
                    <select
                      value={preferred_location}
                      onChange={e => setPreferredLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-6">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-primary font-bold hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
