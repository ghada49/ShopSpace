import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/25">
            <span className="material-symbols-outlined text-sm">storefront</span>
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">BaynSpace</span>
        </Link>

        <div className="hidden space-x-1 md:flex">
          <Link
            to="/browse"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Marketplace
          </Link>
          <a
            href="#how-it-works"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Solutions
          </a>
          <a
            href="#insights"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Pricing
          </a>
        </div>

        <div className="flex gap-2.5 items-center">
          {user ? (
            <>
              <button
                onClick={() => navigate(user.role === 'host' ? '/host-dashboard' : '/brand-dashboard')}
                className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                Log In
              </button>
              <button onClick={() => navigate('/login')} className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
