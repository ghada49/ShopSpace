import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import { listingsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

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

function isValidDateValue(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(new Date(value).getTime());
}

function getBillingUnits(days, priceUnit) {
  if (priceUnit === 'week') return Math.ceil(days / 7);
  if (priceUnit === 'month') return Math.ceil(days / 30);
  return days;
}

export default function BookingRequest() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const today = formatDate(new Date());
  const requestedStartDate = searchParams.get('startDate');
  const initialStartDate = isValidDateValue(requestedStartDate) ? requestedStartDate : today;
  const requestedEndDate = searchParams.get('endDate');
  const initialEndDate = isValidDateValue(requestedEndDate) && new Date(requestedEndDate) > new Date(initialStartDate)
    ? requestedEndDate
    : formatDate(addDays(new Date(initialStartDate), 7));

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'brand') {
      navigate('/host-dashboard');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    listingsAPI.getById(id)
      .then(res => setListing(res.data))
      .catch(() => setError('Failed to load listing.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmitBooking(formData) {
    setError('');
    setSubmitting(true);
    try {
      await bookingsAPI.create(formData);
      navigate('/brand-dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit booking. Are you logged in as a brand?';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // Compute price breakdown from listing
  const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / MS_PER_DAY));
  const dailyRate = listing?.price_per_day || 0;
  const priceUnit = listing?.price_unit || 'day';
  const billingUnits = getBillingUnits(days, priceUnit);
  const subtotal = dailyRate * billingUnits;
  const platformCommission = Math.round(subtotal * 0.10);
  const total = subtotal + platformCommission;

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-lg font-bold tracking-tight">Booking Request</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Drafting</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-2">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">Loading listing...</div>
          ) : (
            <BookingForm
              listing={listing}
              onSubmitBooking={handleSubmitBooking}
              submitting={submitting}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          )}
        </div>

        {/* Right: Price Breakdown (desktop) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-primary/10">
              <h3 className="text-lg font-bold mb-6">Price Breakdown</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Rate (${dailyRate} x {billingUnits} {priceUnit}{billingUnits !== 1 ? 's' : ''})</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className = "flex justify-between items-center text-sm">
                  <span className = "text-slate-500">BaynSpace commission (10%)</span>
                  <span className = "font-medium">${platformCommission.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  // Trigger form submit from outside by finding and submitting the form
                  document.querySelector('form')?.requestSubmit();
                }}
                disabled={submitting || loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                <span className="material-symbols-outlined">send</span>
              </button>
              <p className="text-[11px] text-center text-slate-400 px-2 mt-3">
                You won't be charged yet. The host has 48 hours to accept or decline your request.
              </p>
            </div>

            {/* Trust Badge */}
            <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3 border border-primary/10">
              <span className="material-symbols-outlined text-primary">verified_user</span>
              <div>
                <p className="text-sm font-bold text-primary">BaynSpace Protection</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Every booking is insured for up to $1M in liability and includes 24/7 support.
                </p>
              </div>
            </div>

            {/* Location Widget */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-primary/5">
              <div className="h-32 w-full rounded-lg bg-slate-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
                  <span className="text-xs font-bold uppercase tracking-wider">{listing?.location || 'Lebanon'}</span>
                </div>
              </div>
              <p className="text-xs font-bold mt-2 text-center uppercase tracking-widest text-slate-400">
                {listing?.location || 'Lebanon'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto p-8 mt-8 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">store</span>
            </span>
            <span className="font-bold tracking-tight">BaynSpace</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
