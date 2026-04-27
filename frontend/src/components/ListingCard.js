import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function getDynamicBadges(listing) {
  const badges = [];
  if (listing.foot_traffic > 200) badges.push({ label: 'High Traffic', color: 'bg-orange-50 text-orange-600 border-orange-100' });
  const loc = (listing.location || '').toLowerCase();
  if (loc.includes('zaitunay') || loc.includes('byblos')) badges.push({ label: 'Tourist Area', color: 'bg-sky-50 text-sky-600 border-sky-100' });
  if (loc.includes('hamra')) badges.push({ label: 'Student Area', color: 'bg-violet-50 text-violet-600 border-violet-100' });
  return badges;
}

function getPriceUnitLabel(unit) {
  return unit || 'day';
}

export default function ListingCard({ listing, recommended = false }) {
  const navigate = useNavigate();
  const {
    id, title, location, size, pricePerDay, price_per_day,
    image, image_url, badge, foot_traffic, matchScore, match_score, verified, region,
  } = listing;

  const imgSrc = image_url || image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400';
  const dailyPrice = price_per_day || pricePerDay;
  const score = match_score || matchScore;
  const dynamicBadges = getDynamicBadges(listing);
  const priceUnit = getPriceUnitLabel(listing.price_unit);
  const displaySize = listing.area_value ? `${listing.area_value} ${listing.area_unit || 'sq ft'}` : size;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedListings = JSON.parse(localStorage.getItem('savedListings') || '[]');
    setSaved(savedListings.includes(Number(id)));
  }, [id]);

  function toggleSaved(e) {
    e.stopPropagation();
    const listingId = Number(id);
    const savedListings = JSON.parse(localStorage.getItem('savedListings') || '[]');
    const nextSaved = savedListings.includes(listingId)
      ? savedListings.filter(savedId => savedId !== listingId)
      : [...savedListings, listingId];

    localStorage.setItem('savedListings', JSON.stringify(nextSaved));
    setSaved(nextSaved.includes(listingId));
  }

  if (recommended) {
    return (
      <div
        className="group relative rounded-2xl overflow-hidden bg-white border-2 border-primary/20 hover:border-primary/50 hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/10 cursor-pointer"
        onClick={() => navigate(`/listings/${id}`)}
      >
        {/* Match score badge */}
        {score && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
              <span className="material-symbols-outlined text-[12px]">bolt</span>
              {score}% MATCH
            </span>
          </div>
        )}

        {/* Favorite button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={toggleSaved}
            className={`w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-colors ${saved ? 'text-primary' : 'text-slate-400 hover:text-red-500'}`}
          >
            <span className={`material-symbols-outlined text-[18px] ${saved ? 'fill-1' : ''}`}>favorite</span>
          </button>
        </div>

        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-slate-100">
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={imgSrc}
            alt={title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex justify-between items-start mb-1.5">
            <h3 className="font-bold text-slate-900 truncate flex-1 mr-2">{title}</h3>
            <span className="text-primary font-black text-lg shrink-0">
              ${dailyPrice}
              <span className="text-slate-400 text-[11px] font-normal">/{priceUnit}</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {region && <span className="font-semibold text-primary">{region}</span>}
            {region && location && <span className="text-slate-300">·</span>}
            {location}{displaySize && ` · ${displaySize}`}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(verified === 1 || verified === true) && (
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">verified</span> Verified
              </span>
            )}
            {dynamicBadges.slice(0, 2).map(b => (
              <span key={b.label} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.color}`}>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/listings/${id}`)}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={imgSrc}
          alt={title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {foot_traffic && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[12px]">group</span>
              {foot_traffic}/{listing.traffic_unit || 'day'}
            </span>
          </div>
        )}

        {score && (
          <div className="absolute top-2 left-2">
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]">bolt</span>
              {score}%
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1.5">
          <h4 className="font-bold text-sm text-slate-900 truncate flex-1 mr-2">{title}</h4>
          <span className="text-primary font-bold text-sm shrink-0">
            ${dailyPrice}
            <span className="text-[10px] text-slate-400 font-normal">/{priceUnit}</span>
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">location_on</span>
          {region && <span className="font-semibold text-primary">{region}</span>}
          {region && location && <span className="text-slate-300">·</span>}
          {location}{displaySize && ` · ${displaySize}`}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(verified === 1 || verified === true) && (
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[11px]">verified</span> Verified
            </span>
          )}
          {dynamicBadges.slice(0, 1).map(b => (
            <span key={b.label} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.color}`}>
              {b.label}
            </span>
          ))}
          {badge && (
            <span className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/10">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

