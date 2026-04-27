import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const STATS = [
  { value: '2,500+', label: 'Active Brands' },
  { value: '850+', label: 'Retail Spaces' },
  { value: '4.8★', label: 'Average Rating' },
  { value: '$2.4k', label: 'Avg. Monthly Earnings' },
];

const INSIGHTS = [
  { icon: 'analytics', value: '4.2k', label: 'Avg. Foot Traffic / Day', desc: 'Measured across top locations in the marketplace.', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  { icon: 'visibility', value: '88/100', label: 'Exposure Score', desc: 'Proprietary score for brand visibility & window space.', iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
  { icon: 'schedule', value: '3–12 Mo.', label: 'Average Duration', desc: 'Flexibility from pop-ups to long-term residencies.', iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
  { icon: 'payments', value: '$2.4k', label: 'Avg. Host Earnings', desc: 'Monthly passive income per 100 sq ft listed.', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
];

const ACTIVITY = [
  { icon: 'check_circle', bg: 'bg-emerald-100', color: 'text-emerald-600', title: 'New Booking Confirmed', desc: 'EcoHome Collective joined Modern Living, Beirut', time: '2 min ago' },
  { icon: 'add_location_alt', bg: 'bg-primary/10', color: 'text-primary', title: 'New Listing: Hamra Boutique', desc: '240 sq ft available in Hamra, Beirut', time: '15 min ago' },
  { icon: 'handshake', bg: 'bg-amber-100', color: 'text-amber-600', title: 'Contract Signed', desc: 'Luxe Skincare x Urban Wellness, Achrafieh', time: '1 hr ago' },
];

const TRUST = [
  { icon: 'verified_user', title: 'Vetted Partners', desc: 'Every host and brand undergoes a 12-point quality check before going live.' },
  { icon: 'gavel', title: 'Secure Contracts', desc: 'Standardized retail sub-leasing agreements built for speed and compliance.' },
  { icon: 'shield', title: 'Automated Insurance', desc: 'Industry-leading liability coverage activated for every single booking.' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light text-slate-900 font-display">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0c0b1e] px-4 py-24 sm:px-6 lg:py-36">
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/25 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Copy */}
            <div className="flex flex-col gap-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Smart Retail Matching · Lebanon
              </div>

              <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
                The Smarter Way<br />to{' '}
                <span className="bg-gradient-to-r from-primary via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Grow Your Brand.
                </span>
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-slate-400">
                List your retail space or find the perfect pop-up location across Lebanon.
                Smart matching, instant bookings, zero guesswork.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="flex h-14 min-w-[180px] items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-bold text-white shadow-2xl shadow-primary/40 transition-all hover:-translate-y-1 hover:shadow-primary/50"
                >
                  <span className="material-symbols-outlined">add_business</span>
                  List Your Space
                </button>
                <button
                  onClick={() => navigate('/browse')}
                  className="flex h-14 min-w-[180px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <span className="material-symbols-outlined">search</span>
                  Browse Spaces
                </button>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {['bg-primary', 'bg-violet-400', 'bg-pink-400', 'bg-amber-400'].map((c, i) => (
                    <div key={i} className={`h-9 w-9 rounded-full ${c} border-2 border-[#0c0b1e] flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-white text-[14px]">person</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-400">
                  Trusted by <span className="font-bold text-white">2,500+</span> retailers in Lebanon
                </p>
              </div>
            </div>

            {/* Right: Visual card */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm shadow-2xl">
                <div
                  className="h-80 w-full rounded-2xl bg-cover bg-center"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80')" }}
                />
                {/* Overlay stats */}
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-3">
                  <div className="flex-1 rounded-2xl bg-black/60 p-4 backdrop-blur-md border border-white/10">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Match Today</div>
                    <div className="mt-1 text-base font-black text-white">Hamra Boutique</div>
                    <div className="mt-1 flex items-center gap-1 text-xs font-bold text-primary">
                      <span className="material-symbols-outlined text-[14px]">bolt</span>
                      98% Match Score
                    </div>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/90 p-4 backdrop-blur-md text-white text-center">
                    <div className="text-2xl font-black">+32%</div>
                    <div className="text-xs font-semibold opacity-90">Revenue Boost</div>
                  </div>
                </div>
              </div>

              {/* Floating verified badge */}
              <div className="absolute -top-4 -right-4 hidden sm:flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 shadow-xl shadow-primary/40">
                <span className="material-symbols-outlined text-white text-sm">verified</span>
                <span className="text-xs font-black text-white">Verified Space</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 divide-x divide-slate-100 md:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center py-8 px-4 text-center">
                <span className="text-3xl font-black text-slate-900">{value}</span>
                <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section id="how-it-works" className="bg-background-light py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              Simple Process
            </span>
            <h2 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">
              From signup to<br />
              <span className="text-primary">launch in 3 steps.</span>
            </h2>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            {[
              { step: '01', icon: 'account_circle', title: 'Create Profile', desc: 'Define your retail space attributes or brand requirements in minutes.' },
              { step: '02', icon: 'hub', title: 'Match with Partners', desc: 'Our AI identifies synergies based on foot traffic, demographics, and brand identity.' },
              { step: '03', icon: 'rocket_launch', title: 'Launch & Sell', desc: 'Sign digital sub-leases, secure your spot, and start your pop-up journey.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={title} className="group flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-primary shadow-md border border-primary/10 group-hover:-translate-y-2 transition-transform duration-300">
                    <span className="material-symbols-outlined text-3xl">{icon}</span>
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-lg">
                    {step}
                  </span>
                </div>
                <h4 className="text-xl font-black text-slate-900">{title}</h4>
                <p className="mt-2 text-slate-500 leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Smart Matching ───────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Dark card */}
            <div className="relative order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-[#1a1440] p-8 text-white shadow-2xl">
                <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
                <div className="relative">
                  <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">storefront</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold">Swift Footwear</div>
                        <div className="text-xs text-slate-400">Direct-to-Consumer Brand</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-primary">98%</div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Match Score</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { icon: 'group', label: 'Audience Synergy', width: '95%', color: 'bg-primary' },
                      { icon: 'location_on', label: 'Location Vitality', width: '88%', color: 'bg-violet-400' },
                    ].map(({ icon, label, width, color }) => (
                      <div key={label} className="rounded-xl bg-white/5 p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">{icon}</span>
                            <span className="text-sm">{label}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-400">{width}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div className={`h-full ${color} rounded-full`} style={{ width }} />
                        </div>
                      </div>
                    ))}
                    <div className="rounded-xl bg-primary/20 border border-primary/30 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-primary uppercase">
                        <span className="material-symbols-outlined text-sm">insights</span>
                        AI Insight
                      </div>
                      <p className="text-sm text-slate-300">"Swift Footwear matches your morning peak traffic hours. Expected uplift: +18% daily visitors."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="order-1 lg:order-2">
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-4">
                Smart Matching
              </span>
              <h2 className="text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
                Zero Guesswork.<br />
                <span className="text-primary">100% Data-Driven.</span>
              </h2>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                Our proprietary algorithm analyzes thousands of data points to find retailers and brands that share the same target audience, aesthetic, and peak performance hours.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'Demographic cross-referencing',
                  'Aesthetic compatibility scoring',
                  'Foot traffic optimization analytics',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 font-semibold text-slate-800">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <span className="material-symbols-outlined text-primary text-sm">check</span>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/browse')}
                className="mt-10 flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
              >
                Explore Matches
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Insights ─────────────────────────────────────── */}
      <section id="insights" className="bg-background-light py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Actionable Insights</h2>
              <p className="mt-2 text-slate-500 max-w-md">Get data-backed confidence before you sign. Understand the true potential of every retail partnership.</p>
            </div>
            <button className="rounded-xl bg-white border border-slate-200 px-6 py-3 font-bold text-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-sm">
              View Sample Report
            </button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INSIGHTS.map(({ icon, value, label, desc, iconBg, iconColor }) => (
              <div key={label} className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
                  <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
                </div>
                <div className="text-3xl font-black text-slate-900">{value}</div>
                <div className="mt-1 text-sm font-bold text-slate-700">{label}</div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Activity ────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <h2 className="text-2xl font-black text-slate-900">Live Activity</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Real-time</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {ACTIVITY.map(({ icon, bg, color, title, desc, time }) => (
              <div key={title} className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg} ${color}`}>
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                  <div className="mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust ────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-background-light py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-10 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
            Why Partners Trust BaynSpace
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {TRUST.map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 rounded-2xl bg-white p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-2xl">{icon}</span>
                </div>
                <div>
                  <h5 className="font-bold text-slate-900">{title}</h5>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0c0b1e] px-4 py-28 text-center text-white sm:px-6">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/30 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-600/20 blur-[80px]" />
        <div className="relative mx-auto max-w-3xl">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-6">
            Start Today
          </span>
          <h2 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Ready to redefine your<br />
            <span className="bg-gradient-to-r from-primary via-violet-400 to-purple-400 bg-clip-text text-transparent">
              retail footprint?
            </span>
          </h2>
          <p className="mt-6 text-lg text-slate-400">
            Join 2,500+ retailers already transforming the way they grow across Lebanon.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="flex h-14 min-w-[200px] items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-bold text-white shadow-2xl shadow-primary/40 transition-all hover:-translate-y-1"
            >
              <span className="material-symbols-outlined">add_business</span>
              Start Hosting
            </button>
            <button
              onClick={() => navigate('/browse')}
              className="flex h-14 min-w-[200px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 text-base font-bold text-white transition-all hover:bg-white/20"
            >
              <span className="material-symbols-outlined">search</span>
              Browse Locations
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-slate-950 py-16 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-4 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-white mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
                  <span className="material-symbols-outlined text-white text-sm">storefront</span>
                </div>
                <span className="text-xl font-black tracking-tight">BaynSpace</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                The marketplace for retail partnerships and pop-up experiences across Lebanon.
              </p>
              <div className="flex gap-3 mt-6">
                {['instagram', 'facebook', 'language'].map(icon => (
                  <button key={icon} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 hover:bg-primary/20 transition-colors border border-white/10">
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h6 className="mb-4 font-bold text-white text-xs uppercase tracking-wider">Platform</h6>
              <ul className="space-y-3 text-sm">
                {['How it Works', 'List your Space', 'Find a Brand', 'Success Stories'].map(item => (
                  <li key={item}><span>{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h6 className="mb-4 font-bold text-white text-xs uppercase tracking-wider">Company</h6>
              <ul className="space-y-3 text-sm">
                {['About Us', 'Careers', 'Privacy Policy', 'Contact'].map(item => (
                  <li key={item}><span>{item}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-xs">
            © 2026 BaynSpace Technologies Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
