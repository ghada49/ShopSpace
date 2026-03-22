import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', active: true },
  { icon: 'search', label: 'Browse Spaces' },
  { icon: 'calendar_today', label: 'My Bookings' },
  { icon: 'chat_bubble', label: 'Messages' },
];

const STATUS_COLOR = {
  pending: { text: 'text-amber-600', dot: 'bg-amber-500 ring-amber-500/20', label: 'Pending Review' },
  approved: { text: 'text-emerald-600', dot: 'bg-emerald-500 ring-emerald-500/20', label: 'Approved' },
  rejected: { text: 'text-rose-600', dot: 'bg-rose-500 ring-rose-500/20', label: 'Rejected' },
};

export default function BrandDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'brand') { navigate('/host-dashboard'); return; }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'brand') return;
    Promise.all([
      bookingsAPI.getBrandBookings(),
      listingsAPI.getAll(),
    ])
      .then(([bookRes, listRes]) => {
        setBookings(bookRes.data);
        // Recommendations: top 3 by match_score (already sorted by backend)
        setRecommendations(listRes.data.slice(0, 3));
      })
      .catch(err => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeBookings = bookings.filter(b => b.status === 'approved').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const topMatchScore = recommendations[0]?.match_score;

  const analytics = [
    { label: 'Active Bookings', value: String(activeBookings), badge: 'Approved', badgeColor: 'bg-emerald-100 text-emerald-700', sub: 'Across listings' },
    { label: 'Pending Reviews', value: String(pendingBookings), badge: 'Waiting', badgeColor: 'bg-amber-100 text-amber-700', sub: 'Awaiting host' },
    { label: 'Total Bookings', value: String(bookings.length), badge: 'All time', badgeColor: 'bg-slate-100 text-slate-500', sub: 'Since joining' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">storefront</span>
            </div>
            <span className="text-xl font-bold tracking-tight">ShopSpace</span>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map(({ icon, label, active }) => (
            <a
              key={label}
              href={label === 'Browse Spaces' ? '/browse' : '#'}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              {label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name || 'Brand'}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.preferred_category || 'Brand'}</p>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold md:text-2xl">Brand Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button
              onClick={() => navigate('/browse')}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Browse Spaces
            </button>
          </div>
        </header>

        <div className="p-6 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">Loading dashboard...</div>
          ) : (
            <>
              {/* Analytics */}
              <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.map(({ label, value, badge, badgeColor, sub }) => (
                    <div key={label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-slate-500 text-sm font-medium">{label}</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeColor}`}>{badge}</span>
                      </div>
                      <p className="text-3xl font-bold">{value}</p>
                      <p className="text-xs text-slate-400 mt-2">{sub}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Booking Status */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Current Booking Status</h2>
                  <a className="text-primary text-sm font-semibold hover:underline" href="#">View all</a>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {bookings.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <span className="material-symbols-outlined text-3xl mb-2 block">calendar_today</span>
                      No bookings yet. <button onClick={() => navigate('/browse')} className="text-primary font-semibold hover:underline">Browse spaces</button>
                    </div>
                  ) : (
                    <div className="flex flex-col divide-y divide-slate-100">
                      {bookings.map((booking) => {
                        const s = STATUS_COLOR[booking.status] || STATUS_COLOR.pending;
                        return (
                          <div key={booking.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                            <div
                              className="w-14 h-14 rounded-lg bg-slate-200 flex-shrink-0 bg-cover bg-center"
                              style={{ backgroundImage: `url('${booking.listing_image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200'}')` }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{booking.listing_title}</p>
                              <p className="text-sm text-slate-500">
                                {booking.start_date?.slice(0, 10)} → {booking.end_date?.slice(0, 10)} • {booking.listing_location}
                              </p>
                              {booking.total_price && (
                                <p className="text-xs font-bold text-primary mt-0.5">${booking.total_price?.toLocaleString()}</p>
                              )}
                            </div>
                            <div className="hidden sm:flex flex-col items-end mr-4">
                              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</span>
                              <span className={`text-sm font-semibold ${s.text}`}>{s.label}</span>
                            </div>
                            <div className={`w-3 h-3 rounded-full ring-4 ${s.dot}`} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              {/* Recommended Spaces */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">Recommended for You</h2>
                    {topMatchScore && (
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Match {topMatchScore}%
                      </span>
                    )}
                  </div>
                  <button onClick={() => navigate('/browse')} className="text-slate-500 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">tune</span>
                  </button>
                </div>
                {recommendations.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">No recommendations yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((listing) => (
                      <div
                        key={listing.id}
                        className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                      >
                        <div className="relative h-48 w-full bg-slate-200 overflow-hidden">
                          <div
                            className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                            style={{ backgroundImage: `url('${listing.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}')` }}
                          />
                          {listing.match_score && (
                            <div className="absolute top-3 left-3">
                              <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                <span className="material-symbols-outlined text-[12px]">bolt</span>
                                {listing.match_score}% MATCH
                              </span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-1.5 shadow-sm">
                            <span className="material-symbols-outlined text-slate-400 text-sm">favorite</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-slate-900 truncate">{listing.title}</h3>
                          </div>
                          <p className="text-sm text-slate-500 mb-4">{listing.location} {listing.size && `• ${listing.size}`}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-primary">${listing.price_per_day}<span className="text-xs font-normal text-slate-400">/day</span></p>
                            <button className="text-xs font-bold bg-slate-100 px-3 py-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 pt-2 pb-6 z-50">
        <div className="flex justify-around items-center h-14">
          {NAV_ITEMS.map(({ icon, label, active }) => (
            <a key={label} href="#" className={`flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-slate-400'}`}>
              <span className={`material-symbols-outlined ${active ? 'fill-1' : ''}`}>{icon}</span>
              <span className="text-[10px] font-medium">{label.split(' ')[0]}</span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
