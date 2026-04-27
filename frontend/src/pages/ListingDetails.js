import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCategory } from '../constants/categories';

const MS_PER_DAY = 86400000;

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

const today = formatDate(new Date());

function getBillingUnits(days, priceUnit) {
  if (priceUnit === 'week') return Math.ceil(days / 7);
  if (priceUnit === 'month') return Math.ceil(days / 30);
  return days;
}

function getPriceUnitLabel(priceUnit) {
  return priceUnit || 'day';
}

function formatSurfaceArea(listing) {
  if (listing.area_value) {
    return `${listing.area_value} ${listing.area_unit || 'sq ft'}`;
  }

  if (!listing.size) {
    return 'N/A';
  }

  const rawSize = String(listing.size).trim();
  const alreadyHasUnit = /[a-zA-Z]/.test(rawSize);
  return alreadyHasUnit ? rawSize : `${rawSize} sq ft`;
}

export default function ListingDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(formatDate(addDays(new Date(), 7)));
  const [saved, setSaved] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    listingsAPI.getById(id)
      .then(res => setListing(res.data))
      .catch(err => console.error('Failed to fetch listing:', err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const savedListings = JSON.parse(localStorage.getItem('savedListings') || '[]');
    setSaved(savedListings.includes(Number(id)));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <p className="text-slate-400">Loading listing...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <p className="text-slate-500">Listing not found.</p>
      </div>
    );
  }

  const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / MS_PER_DAY));
  const billingUnits = getBillingUnits(days, listing.price_unit);
  const priceUnitLabel = getPriceUnitLabel(listing.price_unit);
  const subtotal = listing.price_per_day * billingUnits;
  const surfaceArea = formatSurfaceArea(listing);
  const platformCommission = Math.round(subtotal * 0.10);
  const total = subtotal + platformCommission;

  const matchScore = listing.match_score;
  const isTourist = ['zaitunay', 'byblos'].some(k => listing.location?.toLowerCase().includes(k));
  const isStudent = listing.location?.toLowerCase().includes('hamra');
  const isHighTraffic = listing.foot_traffic > 200;

  const circumference = 2 * Math.PI * 28; // ≈ 176
  const dashOffset = matchScore ? circumference * (1 - matchScore / 100) : circumference * 0.06;

  const images = listing.image_url
    ? [listing.image_url, listing.image_url, listing.image_url]
    : ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800'];

  const insights = [
    { label: 'Foot Traffic', value: listing.foot_traffic ? `~${listing.foot_traffic}` : 'N/A', sub: `Per ${listing.traffic_unit || 'day'}`, subColor: 'text-green-500' },
    { label: 'Exposure Score', value: listing.exposure_score ? `${listing.exposure_score}${listing.exposure_unit || '/10'}` : 'N/A', sub: 'Visibility rating', subColor: 'text-slate-500', valueColor: 'text-primary' },
    { label: 'Category', value: listing.category ? formatCategory(listing.category) : 'General', sub: 'Space type', subColor: 'text-slate-500' },
    { label: 'Surface Area', value: surfaceArea, sub: 'Available space', subColor: 'text-slate-500' },
  ];

  function handleStartDateChange(e) {
    const nextStartDate = e.target.value;
    setStartDate(nextStartDate);

    if (new Date(endDate) <= new Date(nextStartDate)) {
      setEndDate(formatDate(addDays(new Date(nextStartDate), 1)));
    }
  }

  function handleEndDateChange(e) {
    setEndDate(e.target.value);
  }

  function handleBookingClick() {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'brand') {
      return;
    }

    const query = new URLSearchParams({ startDate, endDate });
    navigate(`/listings/${id}/book?${query.toString()}`);
  }

  function handleSaveToggle() {
    const listingId = Number(id);
    const savedListings = JSON.parse(localStorage.getItem('savedListings') || '[]');
    const nextSaved = savedListings.includes(listingId)
      ? savedListings.filter(savedId => savedId !== listingId)
      : [...savedListings, listingId];

    localStorage.setItem('savedListings', JSON.stringify(nextSaved));
    setSaved(nextSaved.includes(listingId));
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage('Link copied');
      window.setTimeout(() => setShareMessage(''), 1800);
    } catch {
      setShareMessage('Copy failed');
      window.setTimeout(() => setShareMessage(''), 1800);
    }
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center bg-white/80 backdrop-blur-md px-4 py-3 justify-between border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 cursor-pointer">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-tight">Listing Details</h2>
        </div>
        <div className="flex items-center gap-2">
          {shareMessage && <span className="text-xs font-semibold text-primary">{shareMessage}</span>}
          <button onClick={handleShare} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 text-slate-900">
            <span className="material-symbols-outlined">share</span>
          </button>
          <button onClick={handleSaveToggle} className={`flex size-10 items-center justify-center rounded-full hover:bg-slate-100 ${saved ? 'text-primary' : 'text-slate-900'}`}>
            <span className={`material-symbols-outlined ${saved ? 'fill-1' : ''}`}>favorite</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 md:grid md:grid-cols-12 md:gap-8">
        {/* Left Column */}
        <div className="md:col-span-8 space-y-8">
          {/* Photo Gallery */}
          <section className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px]">
              <div className="col-span-3 row-span-2 bg-cover bg-center" style={{ backgroundImage: `url('${images[0]}')` }} />
              <div className="col-span-1 row-span-1 bg-cover bg-center" style={{ backgroundImage: `url('${images[1]}')` }} />
              <div className="col-span-1 row-span-1 bg-cover bg-center" style={{ backgroundImage: `url('${images[2]}')` }} />
            </div>
          </section>

          {/* Title & Meta */}
          <section className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight">{listing.title}</h1>
                {(listing.verified === 1 || listing.verified === true) && (
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">verified</span> Verified
                  </span>
                )}
                {isHighTraffic && (
                  <span className="bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full text-xs font-bold">
                    High Traffic
                  </span>
                )}
                {isTourist && (
                  <span className="bg-sky-50 text-sky-600 border border-sky-100 px-2 py-0.5 rounded-full text-xs font-bold">
                    Tourist Area
                  </span>
                )}
                {isStudent && (
                  <span className="bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-full text-xs font-bold">
                    Student Area
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                  {listing.region && (
                    <span className="font-semibold text-primary">{listing.region}</span>
                  )}
                  {listing.region && listing.location && <span className="mx-1 text-slate-300">·</span>}
                  {listing.location}
                </span>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { icon: 'storefront', label: 'Retail' },
                surfaceArea !== 'N/A' && {
                  icon: 'square_foot',
                  label: surfaceArea,
                },
                { icon: 'calendar_today', label: 'Min 1 day' },
              ].filter(Boolean).map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
                  <span className="material-symbols-outlined text-slate-500">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Compatibility Match — only for brand users */}
          {user?.role === 'brand' && matchScore && (
            <section className="p-6 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">analytics</span> Compatibility Match
                </h3>
                <p className="text-slate-600 text-sm">Based on your category and preferred location.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <svg className="size-16" viewBox="0 0 64 64">
                    <circle className="text-primary/10" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4" />
                    <circle
                      className="text-primary"
                      cx="32" cy="32" fill="transparent" r="28"
                      stroke="currentColor"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      strokeWidth="4"
                      transform="rotate(-90 32 32)"
                    />
                  </svg>
                  <span className="absolute text-sm font-bold">{matchScore}%</span>
                </div>
              </div>
            </section>
          )}

          {/* About */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold">About the space</h3>
            <p className="text-slate-600 leading-relaxed">
              {listing.description || 'A great retail space in Lebanon for your brand pop-up.'}
            </p>
            {listing.shop_url && (
              <a
                href={listing.shop_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-1 text-sm font-semibold text-primary bg-primary/5 border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">language</span>
                Visit Shop Page
              </a>
            )}
          </section>

          {/* Space Insights */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold">Space Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {insights.map(({ label, value, sub, subColor, valueColor }) => (
                <div key={label} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
                  <div className="flex flex-col">
                    <span className={`text-2xl font-bold ${valueColor || ''}`}>{value}</span>
                    <span className={`text-xs font-medium ${subColor}`}>{sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Location */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold">Location</h3>
            <div className="rounded-xl bg-white border border-slate-200 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-primary text-[22px]">location_on</span>
              </div>
              <div className="flex-1 space-y-1">
                {listing.region && (
                  <span className="inline-block text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full mb-1">{listing.region}</span>
                )}
                <p className="font-semibold text-slate-900">{listing.location || 'Lebanon'}</p>
                {listing.location_url && (
                  <a
                    href={listing.location_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline mt-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Open in Maps
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Booking Sidebar */}
        <aside className="md:col-span-4 mt-8 md:mt-0">
          <div className="sticky top-24 p-6 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-6">
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">${listing.price_per_day?.toLocaleString()}</span>
              <span className="text-slate-500 pb-1">/ {priceUnitLabel}</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 border border-slate-200 rounded-lg">
                <p className="text-[10px] font-bold uppercase text-slate-400">Date Range</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="sr-only">Start date</span>
                    <input
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={handleStartDateChange}
                      className="w-full rounded-md bg-slate-50 px-2 py-2 text-sm font-medium text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">End date</span>
                    <input
                      type="date"
                      value={endDate}
                      min={formatDate(addDays(new Date(startDate), 1))}
                      onChange={handleEndDateChange}
                      className="w-full rounded-md bg-slate-50 px-2 py-2 text-sm font-medium text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary"
                    />
                  </label>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{days} day{days !== 1 ? 's' : ''} selected</span>
                  <span className="material-symbols-outlined text-base text-slate-400">calendar_month</span>
                </div>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <p className="text-[10px] font-bold uppercase text-slate-400">Guests / Team Size</p>
                <div className="flex items-center justify-between mt-1 cursor-pointer">
                  <span className="text-sm font-medium">4 People</span>
                  <span className="material-symbols-outlined text-slate-400">group</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  ${listing.price_per_day?.toLocaleString()} x {billingUnits} {priceUnitLabel}{billingUnits !== 1 ? 's' : ''}
                </span>
                <span className="font-medium">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">BaynSpace commission (10%)</span>
                <span className="font-medium">${platformCommission}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg text-primary">${total.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleBookingClick}
              disabled={user?.role === 'host'}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {!user ? 'Log In to Book' : user.role === 'brand' ? 'Request Booking' : 'Only Brands Can Book'}
            </button>
            <p className="text-center text-[11px] text-slate-400">
              {user?.role === 'host'
                ? 'Host accounts can manage listings and requests from the host dashboard.'
                : "* You won't be charged yet. The host has 48 hours to accept or decline your request."}
            </p>
          </div>
        </aside>
      </main>

      <footer className="mt-20 border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center gap-6">
            {['Terms', 'Privacy', 'Support'].map(item => (
              <span key={item} className="text-slate-400 hover:text-primary cursor-pointer transition-colors font-medium">{item}</span>
            ))}
          </div>
          <p className="text-sm text-slate-500">© 2024 ShopSpace Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
