import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { listingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCategory } from '../constants/categories';
import { LEBANON_REGIONS } from '../constants/regions';

export default function BrowseListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [category, setCategory] = useState('all');
  const [minTraffic, setMinTraffic] = useState('');
  const [minArea, setMinArea] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [region, setRegion] = useState('all');

  useEffect(() => {
    listingsAPI.getAll()
      .then(res => setListings(res.data))
      .catch(err => console.error('Failed to fetch listings:', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...Array.from(new Set(listings.map(l => l.category).filter(Boolean)))];

  const filtered = listings.filter(listing => {
    const q = search.toLowerCase();
    const price = Number(listing.price_per_day || 0);
    const min = Number(minPrice);
    const max = Number(maxPrice);
    const matchesSearch = !q ||
      listing.title?.toLowerCase().includes(q) ||
      listing.location?.toLowerCase().includes(q) ||
      listing.category?.toLowerCase().includes(q);
    const matchesVerified = !verifiedOnly || listing.verified === 1 || listing.verified === true;
    const matchesMin = !minPrice || price >= min;
    const matchesMax = !maxPrice || price <= max;
    const matchesCategory = category === 'all' || listing.category === category;
    const matchesTraffic = !minTraffic || Number(listing.foot_traffic || 0) >= Number(minTraffic);
    const matchesArea = !minArea || Number(listing.area_value || 0) >= Number(minArea);
    const matchesRegion = region === 'all' || listing.region === region;
    return matchesSearch && matchesVerified && matchesMin && matchesMax && matchesCategory && matchesTraffic && matchesArea && matchesRegion;
  });

  function resetFilters() {
    setSearch('');
    setVerifiedOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setCategory('all');
    setMinTraffic('');
    setMinArea('');
    setSortBy('default');
    setRegion('all');
  }

  function sortListings(list) {
    if (sortBy === 'price_asc') return [...list].sort((a, b) => (a.price_per_day || 0) - (b.price_per_day || 0));
    if (sortBy === 'price_desc') return [...list].sort((a, b) => (b.price_per_day || 0) - (a.price_per_day || 0));
    if (sortBy === 'traffic') return [...list].sort((a, b) => (b.foot_traffic || 0) - (a.foot_traffic || 0));
    if (sortBy === 'match') return [...list].sort((a, b) => (b.match_score || b.matchScore || 0) - (a.match_score || a.matchScore || 0));
    if (sortBy === 'area') return [...list].sort((a, b) => (b.area_value || 0) - (a.area_value || 0));
    return list;
  }

  const isBrand = user?.role === 'brand';
  const recommended = isBrand ? sortListings(filtered).slice(0, 3) : [];
  const allListings = isBrand ? sortListings(filtered).slice(3) : sortListings(filtered);

  return (
    <div className="min-h-screen bg-background-light">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-screen-2xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 shrink-0">
            <div className="bg-primary text-white p-2 rounded-xl">
              <span className="material-symbols-outlined block text-sm">storefront</span>
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 hidden sm:block">BaynSpace</span>
          </button>

          <div className="flex flex-1 max-w-2xl items-center rounded-xl bg-slate-100 h-10 px-3">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
            <input
              className="w-full bg-transparent text-sm px-3 outline-none text-slate-700 placeholder:text-slate-400"
              placeholder="Search by title, location, or category"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => navigate(user ? (user.role === 'host' ? '/host-dashboard' : '/brand-dashboard') : '/login')}
            className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">person</span>
          </button>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row w-full">
        <aside className="lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 lg:p-6 bg-white shrink-0">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-sm">tune</span>
              Filters
            </h3>
            <button onClick={resetFilters} className="text-xs text-primary font-semibold hover:underline">
              Reset
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Region</label>
              <select
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">Any region</option>
                {LEBANON_REGIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Price Range</label>
              <div className="flex items-center gap-2">
                <input
                  className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Min"
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                />
                <span className="text-slate-300 font-bold">-</span>
                <input
                  className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Max"
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'all' ? 'Any category' : formatCategory(c)}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center justify-between cursor-pointer border-t border-slate-100 pt-4">
              <span className="text-sm font-semibold text-slate-700">Verified Only</span>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={e => setVerifiedOnly(e.target.checked)}
                className="accent-primary"
              />
            </label>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="default">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="traffic">Highest Foot Traffic</option>
                <option value="match">Best Match</option>
                <option value="area">Largest Area</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Min Foot Traffic (/ day)</label>
              <input
                className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. 100"
                type="number"
                min="0"
                value={minTraffic}
                onChange={e => setMinTraffic(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Min Area (sq ft)</label>
              <input
                className="w-full text-xs rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. 50"
                type="number"
                min="0"
                value={minArea}
                onChange={e => setMinArea(e.target.value)}
              />
            </div>
          </div>
        </aside>

        <section className="flex-1 p-4 md:p-6 xl:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-slate-400">Loading spaces...</div>
          ) : (
            <>
              {isBrand && recommended.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                    Recommended for You
                  </h2>
                  <p className="text-xs text-slate-400 mb-5">Sorted by your match score</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {recommended.map(listing => (
                      <ListingCard key={listing.id} listing={listing} recommended />
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-5 border-t border-slate-200 pt-6">
                <h2 className="text-xl font-black tracking-tight text-slate-900">Available Spaces</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {allListings.length} retail space{allListings.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {allListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <span className="material-symbols-outlined text-4xl">search_off</span>
                  <p className="font-semibold">No spaces found</p>
                  <button onClick={resetFilters} className="text-sm text-primary font-semibold hover:underline">
                    Clear filters
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
        </section>
      </main>
    </div>
  );
}
