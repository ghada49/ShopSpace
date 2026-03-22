import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', active: true },
  { icon: 'map', label: 'My Spaces' },
  { icon: 'event_note', label: 'Booking Requests' },
  { icon: 'account_balance_wallet', label: 'Earnings' },
  { icon: 'chat_bubble', label: 'Messages' },
];

const STATUS_COLOR = {
  pending: 'text-amber-500',
  approved: 'text-emerald-500',
  rejected: 'text-rose-500',
};

export default function HostDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'host') { navigate('/brand-dashboard'); return; }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'host') return;
    Promise.all([
      listingsAPI.getHostListings(),
      bookingsAPI.getHostBookings(),
    ])
      .then(([listRes, bookRes]) => {
        setListings(listRes.data);
        setBookings(bookRes.data);
      })
      .catch(err => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusUpdate(bookingId, status) {
    try {
      await bookingsAPI.updateStatus(bookingId, status);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    } catch (err) {
      console.error('Status update failed:', err);
    }
  }

  // Compute stats from data
  const totalEarnings = bookings
    .filter(b => b.status === 'approved')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const stats = [
    { label: 'Total Listings', value: String(listings.length), icon: 'storefront', iconColor: 'text-primary', badge: 'Active', badgeColor: 'text-emerald-500 bg-emerald-50' },
    { label: 'Pending Requests', value: String(bookings.filter(b => b.status === 'pending').length), icon: 'pending_actions', iconColor: 'text-amber-500', badge: 'Review', badgeColor: 'text-amber-500 bg-amber-50' },
    { label: 'Active Bookings', value: String(bookings.filter(b => b.status === 'approved').length), icon: 'event_available', iconColor: 'text-blue-500', badge: 'Live', badgeColor: 'text-blue-500 bg-blue-50' },
    { label: 'Total Earnings', value: `$${totalEarnings.toLocaleString()}`, icon: 'payments', iconColor: 'text-emerald-500', badge: 'Approved', badgeColor: 'text-emerald-500 bg-emerald-50' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background-light">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 p-6 gap-8">
        <div className="flex items-center gap-3 px-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-sm">storefront</span>
          </div>
          <span className="text-xl font-bold tracking-tight">ShopSpace</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ icon, label, active }) => (
            <a
              key={label}
              href="#"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span className="font-medium">{label}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || 'Host'}</p>
              <p className="text-xs text-slate-500">Host Account</p>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold md:text-2xl">Dashboard Overview</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button
              onClick={() => navigate('/browse')}
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Listing
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-24 md:pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">Loading dashboard...</div>
          ) : (
            <>
              {/* Stats */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(({ label, value, icon, iconColor, badge, badgeColor }) => (
                  <div key={label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-500 text-sm font-medium">{label}</span>
                      <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <h4 className="text-3xl font-bold">{value}</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${badgeColor}`}>{badge}</span>
                    </div>
                  </div>
                ))}
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Listings */}
                <div className="xl:col-span-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">My Active Spaces</h2>
                    <a className="text-primary text-sm font-semibold hover:underline" href="#">View All</a>
                  </div>

                  {listings.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
                      <span className="material-symbols-outlined text-3xl mb-2 block">storefront</span>
                      No listings yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {listings.slice(0, 3).map((listing) => {
                        const listingBookings = bookings.filter(b => b.listing_id === listing.id);
                        const activeCount = listingBookings.filter(b => b.status === 'approved').length;
                        return (
                          <div key={listing.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm group">
                            <div className="h-32 bg-slate-200 relative">
                              <img
                                alt={listing.title}
                                className="w-full h-full object-cover"
                                src={listing.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                              />
                              <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-lg text-xs font-bold shadow-sm">${listing.price_per_day}/day</div>
                            </div>
                            <div className="p-4">
                              <h4 className="font-bold group-hover:text-primary transition-colors truncate">{listing.title}</h4>
                              <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                <span>{listing.location}</span>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                {activeCount > 0 ? (
                                  <>
                                    <span className="text-xs font-medium text-slate-500">{activeCount} active booking{activeCount !== 1 ? 's' : ''}</span>
                                    <span className="text-xs font-medium text-emerald-500">Active Booking</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-xs text-slate-400 font-medium italic">No current bookings</span>
                                    <button className="text-primary text-xs font-bold px-2 py-1 rounded bg-primary/10 hover:bg-primary/20">Promote</button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Booking Requests Table */}
                <div className="xl:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Recent Booking Requests</h2>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {bookings.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <span className="material-symbols-outlined text-3xl mb-2 block">event_note</span>
                        No booking requests yet
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              {['Brand', 'Space', 'Dates', 'Amount', 'Status', 'Action'].map(h => (
                                <th key={h} className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {bookings.map((booking) => (
                              <tr key={booking.id}>
                                <td className="px-4 py-4">
                                  <div>
                                    <p className="text-sm font-semibold">{booking.brand_name || 'Brand'}</p>
                                    <p className="text-[10px] text-slate-400">{booking.brand_email}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-sm font-medium">{booking.listing_title}</p>
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-600">
                                  {booking.start_date?.slice(0, 10)} → {booking.end_date?.slice(0, 10)}
                                </td>
                                <td className="px-4 py-4 text-sm font-bold">
                                  ${booking.total_price?.toLocaleString()}
                                </td>
                                <td className="px-4 py-4">
                                  <span className={`text-xs font-bold capitalize ${STATUS_COLOR[booking.status] || 'text-slate-500'}`}>
                                    {booking.status}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  {booking.status === 'pending' && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleStatusUpdate(booking.id, 'approved')}
                                        className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"
                                        title="Approve"
                                      >
                                        <span className="material-symbols-outlined">check_circle</span>
                                      </button>
                                      <button
                                        onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                        title="Reject"
                                      >
                                        <span className="material-symbols-outlined">cancel</span>
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden flex border-t border-slate-200 bg-white px-2 py-3 fixed bottom-0 left-0 right-0 z-50">
        {NAV_ITEMS.map(({ icon, label, active }) => (
          <a key={label} href="#" className={`flex flex-col flex-1 items-center gap-1 ${active ? 'text-primary' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined">{icon}</span>
            <span className="text-[10px] font-medium">{label.split(' ')[0]}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
