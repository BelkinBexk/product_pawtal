"use client";

import Link from "next/link";
import { useState } from "react";

// ── Bangkok areas ─────────────────────────────────────────────────────────────
const AREAS = [
  "Sukhumvit",
  "Ekkamai",
  "Thonglor",
  "Phrom Phong",
  "Asok",
  "On Nut",
  "Nana",
  "Phra Khanong",
  "Bang Na",
  "Bearing",
  "Ari",
  "Silom",
];

// ── Nav links ─────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Services", href: "/" },
  { label: "About Us", href: "/" },
  { label: "Blogs",    href: "/" },
];

// ── Sample deals (prototype) ──────────────────────────────────────────────────
const PREVIEW_DEALS = [
  {
    id: 1,
    gradient: "from-[#D1FAE5] to-[#BBF7D0]",
    icon: "✂️",
    discount: 20,
    shop: "Fur & Fresh Grooming",
    service: "Test Day Care QA",
    area: "Sukhumvit",
    rating: 4.8,
    reviews: 124,
    original: 800,
    deal: 640,
    timer: { label: "Ends in 57 min", active: true },
  },
  {
    id: 2,
    gradient: "from-[#FEF9C3] to-[#FDE68A]",
    icon: "✂️",
    discount: 20,
    shop: "Happy Paws Studio",
    service: "Test Grooming QA",
    area: "Sukhumvit",
    rating: 4.9,
    reviews: 87,
    original: 1000,
    deal: 800,
    timer: { label: "Starts in 27 min", active: false },
  },
  {
    id: 3,
    gradient: "from-[#D1FAE5] to-[#BBF7D0]",
    icon: "✂️",
    discount: 20,
    shop: "Paw & Relax Spa",
    service: "Test Day Care QA",
    area: "Sukhumvit",
    rating: 4.7,
    reviews: 56,
    original: 800,
    deal: 640,
    timer: { label: "Ends in 57 min", active: true },
  },
  {
    id: 4,
    gradient: "from-[#FEF9C3] to-[#FDE68A]",
    icon: "✂️",
    discount: 20,
    shop: "Snip & Style BKK",
    service: "Test Grooming QA",
    area: "Sukhumvit",
    rating: 4.6,
    reviews: 43,
    original: 1000,
    deal: 800,
    timer: { label: "Starts in 27 min", active: false },
  },
];

export default function LandingPage() {
  const [selectedArea, setSelectedArea] = useState("Sukhumvit");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-6 sm:px-12 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="text-xl font-extrabold text-[#002949] tracking-tight flex-shrink-0">
          PAWTAL
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden sm:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-[#374151] hover:text-[#002949] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* For Business — outlined CI button */}
          <Link
            href="/vendor"
            className="hidden sm:inline-flex items-center px-5 py-2 rounded-full border-2 border-[#002949] text-[#002949] text-sm font-bold hover:bg-[#002949] hover:text-white transition-all"
          >
            For Business
          </Link>
          {/* Get Start — filled CI button */}
          <Link
            href="/auth/customer/login"
            className="inline-flex items-center px-5 py-2 rounded-full bg-[#1AB0EB] text-white text-sm font-bold hover:bg-[#00508D] transition-colors shadow-[0_4px_14px_rgba(26,176,235,0.30)]"
          >
            Get Start
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 sm:px-12 pt-16 sm:pt-24 pb-10 text-center">
        <h1 className="text-[42px] sm:text-[68px] font-extrabold text-[#002949] leading-[1.1] mb-5">
          Welcome to Pawtal
        </h1>
        <p className="text-[#6B7280] text-base sm:text-lg max-w-[500px] mx-auto leading-relaxed mb-10">
          Discover off-peak deals on grooming, spa &amp; pet care near you —
          connect with trusted pet service providers in Bangkok.
        </p>

        {/* Location pill with dropdown */}
        <div className="flex items-center justify-center mb-12">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2.5 px-5 py-3 rounded-full border border-[#E5E7EB] bg-white shadow-sm text-sm font-semibold text-[#002949] hover:border-[#1AB0EB] transition-colors min-w-[180px]"
            >
              <span>📍</span>
              <span className="font-bold">{selectedArea}</span>
              <span className="text-[#9CA3AF] font-normal">{PREVIEW_DEALS.length} deals</span>
              <svg
                className={`w-3.5 h-3.5 text-[#6B7280] ml-auto transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                viewBox="0 0 12 8" fill="none"
              >
                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E7EB] rounded-2xl shadow-lg overflow-hidden z-50">
                {AREAS.map((area) => (
                  <button
                    key={area}
                    onClick={() => { setSelectedArea(area); setDropdownOpen(false); }}
                    className={`w-full text-left px-5 py-3 text-sm font-semibold flex items-center gap-2 transition-colors ${
                      area === selectedArea
                        ? "bg-[#E6F6FD] text-[#1AB0EB]"
                        : "text-[#374151] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {area === selectedArea && <span className="text-[#1AB0EB] text-xs">✓</span>}
                    {area !== selectedArea && <span className="w-3" />}
                    {area}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Deal Cards ── */}
      <section className="px-6 sm:px-12 pb-14">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PREVIEW_DEALS.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>

        {/* Explore — outlined */}
        <div className="text-center mt-12">
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 px-16 py-3.5 rounded-xl border-2 border-[#16A34A] text-[#16A34A] text-sm font-bold hover:bg-[#16A34A] hover:text-white transition-all"
          >
            Explore
          </Link>
        </div>
      </section>

      {/* Backdrop to close dropdown */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
      )}

    </div>
  );
}

// ── Deal Card ─────────────────────────────────────────────────────────────────
type Deal = typeof PREVIEW_DEALS[number];

function DealCard({ deal }: { deal: Deal }) {
  const save = deal.original - deal.deal;
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Image area */}
      <div className={`h-36 bg-gradient-to-br ${deal.gradient} flex items-center justify-center text-5xl relative`}>
        {deal.icon}
        <span className="absolute top-3 right-3 bg-[#DC2626] text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full">
          -{deal.discount}%
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="font-extrabold text-[#002949] text-sm mb-0.5 truncate">{deal.shop}</div>
        <div className="text-xs text-[#6B7280] mb-2.5 truncate">{deal.service}</div>

        <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-2.5">
          <span className="text-[#D97706] font-bold">★ {deal.rating}</span>
          <span>({deal.reviews})</span>
          <span className="text-[#D1D5DB]">·</span>
          <span>📍 {deal.area}</span>
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs text-[#9CA3AF] line-through">฿{deal.original.toLocaleString()}</span>
          <span className="text-base font-extrabold text-[#002949]">฿{deal.deal.toLocaleString()}</span>
          <span className="text-xs font-bold text-[#16A34A]">Save ฿{save.toLocaleString()}</span>
        </div>

        <div className={`flex items-center gap-1 text-[11px] font-semibold mb-4 ${deal.timer.active ? "text-[#DC2626]" : "text-[#6B7280]"}`}>
          <span>⏰</span>
          <span>{deal.timer.label}</span>
        </div>

        <button className="w-full py-2.5 rounded-xl bg-[#1AB0EB] text-white text-sm font-bold hover:bg-[#00508D] transition-colors">
          Book Now
        </button>
      </div>
    </div>
  );
}
