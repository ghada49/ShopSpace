import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, formatCategory } from '../constants/categories';
import { LEBANON_REGIONS } from '../constants/regions';

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'spaces', icon: 'map', label: 'My Spaces' },
  { id: 'requests', icon: 'event_note', label: 'Booking Requests' },
  { id: 'earnings', icon: 'account_balance_wallet', label: 'Earnings' },
];

const STATUS_COLOR = {
  pending: 'text-amber-500',
  approved: 'text-emerald-500',
  rejected: 'text-rose-500',
};

const EMPTY_LISTING = {
  title: '',
  description: '',
  category: 'fashion',
  size: '',
  price_per_day: '',
  price_unit: 'day',
  area_value: '',
  area_unit: 'sq ft',
  location: '',
  region: '',
  location_url: '',
  shop_url: '',
  image_url: '',
  foot_traffic: '',
  traffic_unit: 'day',
  exposure_score: '',
  exposure_unit: '/10',
  verified: true,
};

function priceUnitLabel(unit) {
  return unit || 'day';
}

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image.'));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error('Failed to load image.'));
      image.onload = () => {
        const maxSide = 1200;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

export default function HostDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showListingForm, setShowListingForm] = useState(false);
  const [listingForm, setListingForm] = useState(EMPTY_LISTING);
  const [editingListingId, setEditingListingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

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
  }, [user]);

  function resetListingForm() {
    setListingForm(EMPTY_LISTING);
    setEditingListingId(null);
    setFormError('');
  }

  function openCreateListingForm() {
    resetListingForm();
    setShowListingForm(true);
  }

  function openEditListingForm(listing) {
    setListingForm({
      title: listing.title || '',
      description: listing.description || '',
      category: listing.category || 'fashion',
      size: listing.size || '',
      price_per_day: listing.price_per_day || '',
      price_unit: listing.price_unit || 'day',
      area_value: listing.area_value || '',
      area_unit: listing.area_unit || 'sq ft',
      location: listing.location || '',
      region: listing.region || '',
      location_url: listing.location_url || '',
      shop_url: listing.shop_url || '',
      image_url: listing.image_url || '',
      foot_traffic: listing.foot_traffic || '',
      traffic_unit: listing.traffic_unit || 'day',
      exposure_score: listing.exposure_score || '',
      exposure_unit: listing.exposure_unit || '/10',
      verified: listing.verified === 1 || listing.verified === true,
    });
    setEditingListingId(listing.id);
    setFormError('');
    setShowListingForm(true);
  }

  function closeListingForm() {
    setShowListingForm(false);
    resetListingForm();
  }

  async function handleSaveListing(e) {
    e.preventDefault();
    setFormError('');
    setCreating(true);

    try {
      const payload = {
        ...listingForm,
        price_per_day: Number(listingForm.price_per_day),
        area_value: listingForm.area_value ? Number(listingForm.area_value) : null,
        foot_traffic: listingForm.foot_traffic ? Number(listingForm.foot_traffic) : 0,
        exposure_score: listingForm.exposure_score ? Number(listingForm.exposure_score) : null,
      };
      const res = editingListingId
        ? await listingsAPI.update(editingListingId, payload)
        : await listingsAPI.create(payload);

      setListings(prev => editingListingId
        ? prev.map(listing => listing.id === editingListingId ? res.data : listing)
        : [res.data, ...prev]
      );
      resetListingForm();
      setShowListingForm(false);
      setActiveSection('spaces');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save listing.');
    } finally {
      setCreating(false);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please upload an image file.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setFormError('Please choose an image smaller than 8 MB.');
      return;
    }

    try {
      const resizedImage = await resizeImageFile(file);
      setListingForm(prev => ({ ...prev, image_url: resizedImage }));
      setFormError('');
    } catch {
      setFormError('Could not process that image. Try another photo or paste an image URL.');
    }
  }

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

  const pageTitle = {
    dashboard: 'Dashboard Overview',
    spaces: 'My Spaces',
    requests: 'Booking Requests',
    earnings: 'Earnings',
  }[activeSection];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background-light">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 p-6 gap-8">
        <div className="flex items-center gap-3 px-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-sm">storefront</span>
          </div>
          <span className="text-xl font-bold tracking-tight">BaynSpace</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, icon, label }) => {
            const active = id === activeSection;
            return (
            <button
              key={label}
              type="button"
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span className="font-medium">{label}</span>
            </button>
            );
          })}
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
          <h1 className="text-xl font-bold md:text-2xl">{pageTitle}</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              Home
            </button>
            <button
              onClick={openCreateListingForm}
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
              {(activeSection === 'dashboard' || activeSection === 'earnings') && (
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
              )}

              {(activeSection === 'dashboard' || activeSection === 'spaces' || activeSection === 'requests') && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Listings */}
                {(activeSection === 'dashboard' || activeSection === 'spaces') && (
                <div className={activeSection === 'spaces' ? 'xl:col-span-3 space-y-4' : 'xl:col-span-1 space-y-4'}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">My Active Spaces</h2>
                    <button
                      type="button"
                      onClick={() => setActiveSection('spaces')}
                      className="text-primary text-sm font-semibold hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  {listings.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
                      <span className="material-symbols-outlined text-3xl mb-2 block">storefront</span>
                      No listings yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(activeSection === 'spaces' ? listings : listings.slice(0, 3)).map((listing) => {
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
                              <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                                ${listing.price_per_day}/{priceUnitLabel(listing.price_unit)}
                              </div>
                            </div>
                            <div className="p-4">
                              <h4 className="font-bold group-hover:text-primary transition-colors truncate">{listing.title}</h4>
                              <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                <span>{listing.location}</span>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500">
                                  {activeCount > 0 ? `${activeCount} active booking${activeCount !== 1 ? 's' : ''}` : <span className="italic text-slate-400">No bookings</span>}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/listings/${listing.id}`)}
                                    className="text-primary text-xs font-bold px-2 py-1 rounded bg-primary/10 hover:bg-primary/20"
                                  >
                                    View
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openEditListingForm(listing)}
                                    className="text-slate-600 text-xs font-bold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                )}

                {/* Booking Requests Table */}
                {(activeSection === 'dashboard' || activeSection === 'requests') && (
                <div className={activeSection === 'requests' ? 'xl:col-span-3 space-y-4' : 'xl:col-span-2 space-y-4'}>
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
                )}
              </div>
              )}
            </>
          )}
        </div>
      </main>

      {showListingForm && (
        <div className="fixed inset-0 z-[70] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveListing} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-primary/10">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{editingListingId ? 'Edit Listing' : 'Create Listing'}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {editingListingId ? 'Update this retail space information.' : 'Add a retail space brands can book.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeListingForm}
                className="size-10 rounded-full hover:bg-slate-100 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-bold uppercase text-slate-500">Title</span>
                  <input
                    value={listingForm.title}
                    onChange={e => setListingForm({ ...listingForm, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Achrafieh Boutique Shelf"
                    required
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-bold uppercase text-slate-500">Category</span>
                  <select
                    value={listingForm.category}
                    onChange={e => setListingForm({ ...listingForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{formatCategory(c)}</option>
                    ))}
                  </select>
                </label>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase text-slate-500">Pricing</span>
                  <div className="grid grid-cols-[1fr_120px] gap-2">
                    <input
                      type="number"
                      min="1"
                      value={listingForm.price_per_day}
                      onChange={e => setListingForm({ ...listingForm, price_per_day: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                      placeholder="100"
                      required
                    />
                    <select
                      value={listingForm.price_unit}
                      onChange={e => setListingForm({ ...listingForm, price_unit: e.target.value })}
                      className="rounded-xl border border-slate-200 bg-primary/5 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="day">/ day</option>
                      <option value="week">/ week</option>
                      <option value="month">/ month</option>
                    </select>
                  </div>
                </div>

                <label className="space-y-1.5">
                  <span className="text-xs font-bold uppercase text-slate-500">Region</span>
                  <select
                    value={listingForm.region}
                    onChange={e => setListingForm({ ...listingForm, region: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a region</option>
                    {LEBANON_REGIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-bold uppercase text-slate-500">Specific Location</span>
                  <input
                    value={listingForm.location}
                    onChange={e => setListingForm({ ...listingForm, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. ABC Mall, 2nd floor"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-bold uppercase text-slate-500">Location Link</span>
                  <input
                    type="url"
                    value={listingForm.location_url}
                    onChange={e => setListingForm({ ...listingForm, location_url: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://maps.google.com/..."
                  />
                </label>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase text-slate-500">Surface Area</span>
                  <div className="grid grid-cols-[1fr_120px] gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={listingForm.area_value}
                      onChange={e => setListingForm({ ...listingForm, area_value: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                      placeholder="50"
                    />
                    <select
                      value={listingForm.area_unit}
                      onChange={e => setListingForm({ ...listingForm, area_unit: e.target.value })}
                      className="rounded-xl border border-slate-200 bg-primary/5 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="sq ft">sq ft</option>
                      <option value="sq m">sq m</option>
                      <option value="m2">m2</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase text-slate-500">Traffic</span>
                  <div className="grid grid-cols-[1fr_120px] gap-2">
                    <input
                      type="number"
                      min="0"
                      value={listingForm.foot_traffic}
                      onChange={e => setListingForm({ ...listingForm, foot_traffic: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                      placeholder="200"
                    />
                    <select
                      value={listingForm.traffic_unit}
                      onChange={e => setListingForm({ ...listingForm, traffic_unit: e.target.value })}
                      className="rounded-xl border border-slate-200 bg-primary/5 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="day">/ day</option>
                      <option value="week">/ week</option>
                      <option value="month">/ month</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase text-slate-500">Exposure</span>
                  <div className="grid grid-cols-[1fr_120px] gap-2">
                    <input
                      type="number"
                      min="0"
                      max={listingForm.exposure_unit === '%' ? '100' : '10'}
                      step="0.1"
                      value={listingForm.exposure_score}
                      onChange={e => setListingForm({ ...listingForm, exposure_score: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                      placeholder="8.5"
                    />
                    <select
                      value={listingForm.exposure_unit}
                      onChange={e => setListingForm({ ...listingForm, exposure_unit: e.target.value })}
                      className="rounded-xl border border-slate-200 bg-primary/5 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="/10">/10</option>
                      <option value="%">%</option>
                    </select>
                  </div>
                </div>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-bold uppercase text-slate-500">Image</span>
                  {listingForm.image_url && (
                    <img src={listingForm.image_url} alt="Listing preview" className="h-36 w-full rounded-xl object-cover border border-slate-200" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full rounded-xl border border-slate-200 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={listingForm.image_url}
                    onChange={e => setListingForm({ ...listingForm, image_url: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Or paste an image URL"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-bold uppercase text-slate-500">Shop Website / Social Link</span>
                  <input
                    type="url"
                    value={listingForm.shop_url}
                    onChange={e => setListingForm({ ...listingForm, shop_url: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://instagram.com/yourshop or website URL"
                  />
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-bold uppercase text-slate-500">Description</span>
                  <textarea
                    rows={4}
                    value={listingForm.description}
                    onChange={e => setListingForm({ ...listingForm, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Describe the space and best-fit brands."
                  />
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeListingForm}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {creating ? 'Saving...' : editingListingId ? 'Save Changes' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden flex border-t border-slate-200 bg-white px-2 py-3 fixed bottom-0 left-0 right-0 z-50">
        {NAV_ITEMS.map(({ id, icon, label }) => {
          const active = id === activeSection;
          return (
          <button
            key={label}
            type="button"
            onClick={() => setActiveSection(id)}
            className={`flex flex-col flex-1 items-center gap-1 ${active ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="text-[10px] font-medium">{label.split(' ')[0]}</span>
          </button>
          );
        })}
      </nav>
    </div>
  );
}
