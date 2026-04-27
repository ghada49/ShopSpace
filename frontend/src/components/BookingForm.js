import { useState } from 'react';

const CATEGORIES = ['Apparel', 'Home Decor', 'Beauty', 'Art'];

const today = new Date().toISOString().split('T')[0];

function getBillingUnits(days, priceUnit) {
  if (priceUnit === 'week') return Math.ceil(days / 7);
  if (priceUnit === 'month') return Math.ceil(days / 30);
  return days;
}

export default function BookingForm({ listing, onSubmitBooking, submitting, startDate, setStartDate, endDate, setEndDate }) {
  const [brandName, setBrandName] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Apparel');

  const dailyRate = listing?.price_per_day || listing?.pricePerDay || 1200;
  const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000));
  const priceUnit = listing?.price_unit || 'day';
  const billingUnits = getBillingUnits(days, priceUnit);
  const subtotal = dailyRate * billingUnits;
  const platformCommission = Math.round(subtotal * 0.1); 
  const total = subtotal + platformCommission 

  function handleSubmit(e) {
    e.preventDefault();
    if (onSubmitBooking) {
      onSubmitBooking({
        listing_id: listing?.id,
        start_date: startDate,
        end_date: endDate,
        brand_name: brandName,
        brand_description: description,
        total_price: total,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Listing Summary */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">storefront</span>
          Listing Summary
        </h2>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-primary/10 flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-40 aspect-video md:aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
            <img
              className="w-full h-full object-cover"
              src={listing?.image_url || listing?.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
              alt={listing?.title || 'Retail Space'}
            />
          </div>
          <div className="flex flex-col justify-between flex-1 py-1">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wider">ID: SS-{listing?.id || '0000'}</p>
              <h3 className="text-lg font-bold mt-1">{listing?.title || 'Retail Space'}</h3>
              <div className="flex items-center text-slate-500 text-sm mt-1">
                <span className="material-symbols-outlined text-sm mr-1">location_on</span>
                {listing?.address || listing?.location || 'Lebanon'}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">Pop-up Ready</span>
              <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">Daily Rental</span>
            </div>
          </div>
        </div>
      </section>

      {/* Date Selection */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">calendar_month</span>
          Select Dates
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-primary/10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Check In</p>
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Check Out</p>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-primary/10">
            <div className="text-sm"><span className="text-slate-500">Selected:</span> <span className="font-bold">{startDate} → {endDate}</span></div>
            <div className="text-sm"><span className="text-slate-500">Duration:</span> <span className="font-bold">{days} Day{days !== 1 ? 's' : ''}</span></div>
          </div>
        </div>
      </section>

      {/* Brand Details */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">badge</span>
          Brand Details
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-primary/10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary py-2.5 px-4 text-slate-900 placeholder:text-slate-400"
                placeholder="e.g. Minimalist Home"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Website / Social</label>
              <input
                type="text"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary py-2.5 px-4 text-slate-900 placeholder:text-slate-400"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">What will you be selling?</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-primary/5 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary py-2.5 px-4 resize-none text-slate-900 placeholder:text-slate-400"
              placeholder="Describe your products and vision for the pop-up..."
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Primary Product Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full border text-sm transition-colors
                    ${selectedCategory === cat
                      ? 'border-primary text-primary font-medium bg-primary/5'
                      : 'border-primary/20 text-slate-600 hover:border-primary/50 bg-white'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Price Breakdown (mobile only — desktop sidebar handles this) */}
      <div className="lg:hidden bg-white rounded-xl p-6 shadow-lg border border-primary/10">
        <h3 className="text-lg font-bold mb-6">Price Breakdown</h3>
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Rate (${dailyRate} x {billingUnits} {priceUnit}{billingUnits !== 1 ? 's' : ''})</span>
            <span className="font-medium">${subtotal.toLocaleString()}</span>
          </div>
          <div className = "flex justify-between items-center text-sm">
            <span className = "text-slate-500">BaynSpace commission (10%)</span>
            <span className = "font-medium">${platformCommission}</span>
          </div>
          <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-2xl text-primary">${total.toLocaleString()}</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
          <span className="material-symbols-outlined">send</span>
        </button>
        <p className="text-[11px] text-center text-slate-400 px-2 mt-3">
          You won't be charged yet. The host has 48 hours to accept or decline your request.
        </p>
      </div>
    </form>
  );
}
