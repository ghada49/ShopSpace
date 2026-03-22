import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { listingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BrowseListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    listingsAPI.getAll()
      .then(res => setListings(res.data))
      .catch(err => console.error('Failed to fetch listings:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = listings.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      l.title?.toLowerCase().includes(q) ||
      l.location?.toLowerCase().includes(q) ||
      l.category?.toLowerCase().includes(q);
    const matchVerified = !verifiedOnly || l.verified === 1 || l.verified === true;
    return matchSearch && matchVerified;
  });

  const isBrand = user?.role === 'brand';
  const recommended = isBrand ? filtered.slice(0, 3) : [];
  const allListings = isBrand ? filtered.slice(3) : filtered;

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4 px-4 py-3 max-w-screen-2xl mx-auto">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={() => navigate('/')}
          >
            <div className="bg-primary text-white p-2 rounded-xl shadow-md shadow-primary/20">
              <span className="material-symbols-outlined block text-sm">storefront</span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 hidden sm:block">ShopSpace</h1>
          </div>

          {/* Search bar */}
          <div className="flex flex-1 max-w-2xl items-stretch rounded-xl bg-slate-100 border border-transparent focus-within:border-primary focus-within:bg-white transition-all shadow-sm h-10">
            <div className="flex items-center justify-center pl-3 text-slate-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              className="w-full bg-transparent border-none focus:ring-0 text-sm px-3 outline-none text-slate-700 placeholder:text-slate-400"
              placeholder="Search locations, categories, or brands..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="flex items-center px-3 border-l border-slate-200 text-slate-400 gap-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              <span className="text-xs font-semibold hidden sm:block">Lebanon</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center justify-center rounded-xl w-10 h-10 bg-slate-100 hover:bg-slate-200 transition-colors">
              <span className="material-symbols-outlined text-slate-600 text-[20px]">notifications</span>
            </button>
            <div
              className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/25 cursor-pointer hover:bg-primary/25 transition-colors"
              onClick={() => navigate('/login')}
            >
              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row max-w-screen-2xl mx-auto w-full">
        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 p-6 gap-6 bg-white shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-sm">tune</span>
              Filters
            </h3>
            <button
              onClick={() => { setSearch(''); setVerifiedOnly(false); }}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                Price Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="Min"
                  type="text"
                />
                <span className="text-slate-300 font-bold">—</span>
                <input
                  className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="Max"
                  type="text"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                Space Size (sq ft)
              </label>
              <select className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                <option>Any size</option>
                <option>Under 500</option>
                <option>500 – 1,500</option>
                <option>1,500 – 5,000</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                Duration
              </label>
              <div className="space-y-2.5">
                {['Daily', 'Weekly', 'Monthly'].map(d => (
                  <label key={d} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" defaultChecked={d === 'Weekly'} className="rounded text-primary accent-primary" />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-semibold text-slate-700">Verified Only</span>
                <div
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`w-10 h-5.5 rounded-full cursor-pointer transition-colors relative flex items-center ${verifiedOnly ? 'bg-primary' : 'bg-slate-200'}`}
                  style={{ height: '22px' }}
                >
                  <div
                    className={`absolute w-4 h-4 bg-white rounded-full shadow-sm transition-transform mx-0.5 ${verifiedOnly ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Help card */}
          <div className="mt-auto">
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 p-4 border border-primary/15">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-sm">support_agent</span>
                <p className="text-xs font-bold text-primary">Expert Assistance</p>
              </div>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                Need help choosing the right space for your brand?
              </p>
              <button className="w-full bg-primary text-white text-xs py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
                Talk to Concierge
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────── */}
        <div className="flex-1 p-4 md:p-6 xl:p-8 overflow-y-auto">
          {/* Mobile filter pills */}
          <div className="flex lg:hidden gap-2 mb-5 overflow-x-auto pb-1">
            {['Filters', 'Price', 'Size', 'Verified'].map(f => (
              <button
                key={f}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-600 whitespace-nowrap shadow-sm hover:border-primary/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {f === 'Filters' ? 'tune' : 'expand_more'}
                </span>
                {f}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <span className="h-8 w-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
                <span className="text-sm font-medium">Loading spaces...</span>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {/* Recommended — brand users only */}
              {isBrand && recommended.length > 0 && (
                <section className="mb-10">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                        Recommended for You
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Sorted by your match score</p>
                    </div>
                    <a className="text-sm text-primary font-semibold hover:underline" href="#">
                      See all matches
                    </a>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {recommended.map(listing => (
                      <ListingCard key={listing.id} listing={listing} recommended />
                    ))}
                  </div>
                </section>
              )}

              {/* All Listings */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4 border-t border-slate-200 pt-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Available Spaces in Lebanon
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {allListings.length} retail space{allListings.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit">
                  <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white shadow-sm text-sm font-semibold text-slate-700">
                    <span className="material-symbols-outlined text-[16px]">grid_view</span>
                    Grid
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-slate-400 text-sm font-semibold hover:text-slate-600 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">map</span>
                    Map
                  </button>
                </div>
              </div>

              {allListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <span className="material-symbols-outlined text-4xl">search_off</span>
                  <p className="font-semibold">No spaces found</p>
                  <button
                    onClick={() => setSearch('')}
                    className="text-sm text-primary font-semibold hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {allListings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="sticky bottom-0 z-40 lg:hidden flex border-t border-slate-100 bg-white/90 backdrop-blur-xl px-4 pb-4 pt-2">
        {[
          { icon: 'search', label: 'Browse', active: true, to: '/browse' },
          { icon: 'favorite', label: 'Saved', to: '/' },
          { icon: 'add_circle', label: 'List', to: '/login' },
          { icon: 'chat_bubble', label: 'Inbox', to: '/' },
          { icon: 'person', label: 'Profile', to: '/login' },
        ].map(({ icon, label, active, to }) => (
          <a
            key={label}
            href={to}
            className={`flex flex-1 flex-col items-center justify-end gap-1 ${active ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined ${active ? 'fill-1' : ''}`}>{icon}</span>
            <p className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</p>
          </a>
        ))}
      </nav>
    </div>
  );
}
