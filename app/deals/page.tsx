"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";

const DEALS_PER_PAGE = 4;

// ── Constants ────────────────────────────────────────────────────────────────
const LOCATIONS = ["All Areas", "Sukhumvit", "Thonglor", "Asok", "Phrom Phong", "Ekkamai", "On Nut"];
const CATEGORIES = ["All", "Grooming", "Day Care", "Training", "Boarding", "Vet Checkup", "Dog Walking", "Pet Taxi"];

// ── Types ────────────────────────────────────────────────────────────────────
interface Deal {
  id: number;
  service: string;
  shop: string;
  category: string;
  area: string;
  rating: number;
  reviews: number;
  originalPrice: number;
  dealPrice: number;
  discount: number;
  timeLabel: string;
  timeType: "ends" | "starts";
  cardBg: string;
  svgContent: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_DEALS: Deal[] = [
  {
    id: 1,
    service: "Full Grooming Package",
    shop: "Happy Paws Grooming",
    category: "Grooming",
    area: "Sukhumvit",
    rating: 4.9,
    reviews: 128,
    originalPrice: 900,
    dealPrice: 630,
    discount: 30,
    timeLabel: "Ends in 3h 42min",
    timeType: "ends",
    cardBg: "#d7f0e4",
    svgContent: `<svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="82" r="58" fill="#9dd8b8"/>
      <ellipse cx="82" cy="65" rx="12" ry="16" fill="#6b4226" transform="rotate(-8 82 65)"/>
      <ellipse cx="118" cy="65" rx="12" ry="16" fill="#6b4226" transform="rotate(8 118 65)"/>
      <ellipse cx="100" cy="85" rx="30" ry="26" fill="#6b4226"/>
      <ellipse cx="100" cy="92" rx="22" ry="16" fill="#c8906c"/>
      <circle cx="89" cy="79" r="5" fill="white"/>
      <circle cx="111" cy="79" r="5" fill="white"/>
      <circle cx="90" cy="79.5" r="3" fill="#1a1a1a"/>
      <circle cx="112" cy="79.5" r="3" fill="#1a1a1a"/>
      <circle cx="91.5" cy="78" r="1.2" fill="white"/>
      <circle cx="113.5" cy="78" r="1.2" fill="white"/>
      <ellipse cx="100" cy="90" rx="6" ry="4.5" fill="#3d1f0a"/>
      <path d="M93 97 Q100 102 107 97" stroke="#3d1f0a" stroke-width="2" stroke-linecap="round" fill="none"/>
    </svg>`,
  },
  {
    id: 2,
    service: "Dog Day Care (Full Day)",
    shop: "Furever Friends",
    category: "Day Care",
    area: "Thonglor",
    rating: 4.8,
    reviews: 94,
    originalPrice: 1000,
    dealPrice: 800,
    discount: 20,
    timeLabel: "Starts in 17min",
    timeType: "starts",
    cardBg: "#fff3cd",
    svgContent: `<svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="82" r="58" fill="#ffe090"/>
      <ellipse cx="81" cy="64" rx="13" ry="17" fill="#c48a00"/>
      <ellipse cx="119" cy="64" rx="13" ry="17" fill="#c48a00"/>
      <ellipse cx="100" cy="86" rx="30" ry="26" fill="#c48a00"/>
      <ellipse cx="100" cy="93" rx="22" ry="16" fill="#e6aa30"/>
      <circle cx="89" cy="80" r="5" fill="white"/>
      <circle cx="111" cy="80" r="5" fill="white"/>
      <circle cx="90" cy="80.5" r="3" fill="#1a1a1a"/>
      <circle cx="112" cy="80.5" r="3" fill="#1a1a1a"/>
      <circle cx="91.5" cy="79" r="1.2" fill="white"/>
      <circle cx="113.5" cy="79" r="1.2" fill="white"/>
      <ellipse cx="100" cy="91" rx="6" ry="4.5" fill="#7a5500"/>
      <path d="M93 99 Q100 105 107 99" stroke="#7a5500" stroke-width="2" stroke-linecap="round" fill="none"/>
      <ellipse cx="100" cy="107" rx="6" ry="4.5" fill="#e05070"/>
    </svg>`,
  },
  {
    id: 3,
    service: "Basic Training Session",
    shop: "Paws Academy",
    category: "Training",
    area: "Ekkamai",
    rating: 5.0,
    reviews: 47,
    originalPrice: 800,
    dealPrice: 680,
    discount: 15,
    timeLabel: "Ends in 5h 10min",
    timeType: "ends",
    cardBg: "#ddeeff",
    svgContent: `<svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="82" r="58" fill="#aaccee"/>
      <ellipse cx="84" cy="66" rx="9" ry="13" fill="#3a5880" transform="rotate(-10 84 66)"/>
      <ellipse cx="116" cy="66" rx="9" ry="13" fill="#3a5880" transform="rotate(10 116 66)"/>
      <ellipse cx="100" cy="78" rx="24" ry="22" fill="#5070a0"/>
      <ellipse cx="100" cy="84" rx="16" ry="12" fill="#7898c8"/>
      <ellipse cx="100" cy="106" rx="20" ry="14" fill="#5070a0"/>
      <circle cx="92" cy="73" r="4.5" fill="white"/>
      <circle cx="108" cy="73" r="4.5" fill="white"/>
      <circle cx="92.5" cy="73.5" r="2.8" fill="#1a1a1a"/>
      <circle cx="108.5" cy="73.5" r="2.8" fill="#1a1a1a"/>
      <circle cx="93.8" cy="72.2" r="1.1" fill="white"/>
      <circle cx="109.8" cy="72.2" r="1.1" fill="white"/>
      <ellipse cx="100" cy="83" rx="5" ry="3.5" fill="#2a4060"/>
      <circle cx="130" cy="52" r="14" fill="#FFB800"/>
      <text x="130" y="58" text-anchor="middle" fill="white" font-size="18" font-weight="bold" font-family="serif">★</text>
    </svg>`,
  },
  {
    id: 4,
    service: "Cat Spa & Grooming",
    shop: "Paw & Relax Spa",
    category: "Grooming",
    area: "Phrom Phong",
    rating: 4.7,
    reviews: 63,
    originalPrice: 700,
    dealPrice: 525,
    discount: 25,
    timeLabel: "Ends in 2h 15min",
    timeType: "ends",
    cardBg: "#f0e8ff",
    svgContent: `<svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="82" r="58" fill="#d0b8f8"/>
      <polygon points="82,70 75,48 94,62" fill="#8050c8"/>
      <polygon points="118,70 125,48 106,62" fill="#8050c8"/>
      <ellipse cx="100" cy="84" rx="30" ry="26" fill="#8050c8"/>
      <ellipse cx="100" cy="91" rx="20" ry="14" fill="#b090e0"/>
      <circle cx="89" cy="78" r="5" fill="white"/>
      <circle cx="111" cy="78" r="5" fill="white"/>
      <ellipse cx="89.5" cy="78.5" rx="2.2" ry="3.5" fill="#2a1a4a"/>
      <ellipse cx="111.5" cy="78.5" rx="2.2" ry="3.5" fill="#2a1a4a"/>
      <circle cx="90.5" cy="77" r="1" fill="white"/>
      <circle cx="112.5" cy="77" r="1" fill="white"/>
      <polygon points="100,88 96,93 104,93" fill="#e06090"/>
      <line x1="82" y1="91" x2="95" y2="92" stroke="#6040a0" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="80" y1="95" x2="94" y2="95" stroke="#6040a0" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="118" y1="91" x2="105" y2="92" stroke="#6040a0" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="120" y1="95" x2="106" y2="95" stroke="#6040a0" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M95 95 Q100 99 105 95" stroke="#6040a0" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    </svg>`,
  },
  {
    id: 5,
    service: "Dog Boarding (1 Night)",
    shop: "Cozy Paws Hotel",
    category: "Boarding",
    area: "Asok",
    rating: 4.6,
    reviews: 41,
    originalPrice: 800,
    dealPrice: 600,
    discount: 25,
    timeLabel: "Ends in 4h 30min",
    timeType: "ends",
    cardBg: "#ffe8d8",
    svgContent: `<svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="82" r="58" fill="#ffc8a0"/>
      <path d="M68 108 L68 80 L100 58 L132 80 L132 108 Z" fill="#e8a060"/>
      <path d="M62 84 L100 56 L138 84" stroke="#c07830" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="84" cy="74" rx="7" ry="9" fill="#7a5230"/>
      <ellipse cx="116" cy="74" rx="7" ry="9" fill="#7a5230"/>
      <ellipse cx="100" cy="88" rx="22" ry="18" fill="#7a5230"/>
      <ellipse cx="100" cy="95" rx="16" ry="11" fill="#c8906c"/>
      <circle cx="91" cy="84" r="4" fill="white"/>
      <circle cx="109" cy="84" r="4" fill="white"/>
      <circle cx="91.5" cy="84.5" r="2.5" fill="#1a1a1a"/>
      <circle cx="109.5" cy="84.5" r="2.5" fill="#1a1a1a"/>
      <circle cx="93" cy="83" r="1" fill="white"/>
      <circle cx="111" cy="83" r="1" fill="white"/>
      <ellipse cx="100" cy="93" rx="5" ry="4" fill="#3d1f0a"/>
    </svg>`,
  },
  {
    id: 6,
    service: "Vet Health Checkup",
    shop: "Dr. Pet Clinic",
    category: "Vet Checkup",
    area: "Sukhumvit",
    rating: 4.9,
    reviews: 82,
    originalPrice: 600,
    dealPrice: 480,
    discount: 20,
    timeLabel: "Starts in 45min",
    timeType: "starts",
    cardBg: "#d8f4f0",
    svgContent: `<svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="82" r="58" fill="#90d8d0"/>
      <rect x="88" y="56" width="24" height="52" rx="8" fill="white"/>
      <rect x="74" y="70" width="52" height="24" rx="8" fill="white"/>
      <ellipse cx="100" cy="122" rx="8" ry="6" fill="#60b8b0" opacity="0.6"/>
      <circle cx="88" cy="116" r="4" fill="#60b8b0" opacity="0.6"/>
      <circle cx="112" cy="116" r="4" fill="#60b8b0" opacity="0.6"/>
      <circle cx="80" cy="120" r="3" fill="#60b8b0" opacity="0.5"/>
      <circle cx="120" cy="120" r="3" fill="#60b8b0" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 7,
    service: "Dog Walking (1 hr)",
    shop: "Walk & Wag",
    category: "Dog Walking",
    area: "On Nut",
    rating: 4.5,
    reviews: 29,
    originalPrice: 250,
    dealPrice: 200,
    discount: 20,
    timeLabel: "Ends in 6h 0min",
    timeType: "ends",
    cardBg: "#e8f8ee",
    svgContent: `<svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="80" r="58" fill="#a8e0c8"/>
      <path d="M76 98 Q68 114 64 128" stroke="#7a5230" stroke-width="9" stroke-linecap="round" fill="none"/>
      <path d="M88 104 Q82 118 78 132" stroke="#7a5230" stroke-width="9" stroke-linecap="round" fill="none"/>
      <path d="M114 96 Q122 110 126 122" stroke="#7a5230" stroke-width="9" stroke-linecap="round" fill="none"/>
      <ellipse cx="98" cy="96" rx="26" ry="18" fill="#8B5E3C" transform="rotate(-12 98 96)"/>
      <ellipse cx="124" cy="76" rx="20" ry="18" fill="#8B5E3C"/>
      <ellipse cx="120" cy="64" rx="8" ry="11" fill="#6b4226" transform="rotate(18 120 64)"/>
      <ellipse cx="134" cy="80" rx="12" ry="9" fill="#c8906c"/>
      <circle cx="127" cy="71" r="4" fill="white"/>
      <circle cx="127.5" cy="71.5" r="2.5" fill="#1a1a1a"/>
      <circle cx="129" cy="70.5" r="1" fill="white"/>
      <ellipse cx="136" cy="78" rx="4.5" ry="3.5" fill="#3d1f0a"/>
      <path d="M74 88 Q60 78 58 64" stroke="#8B5E3C" stroke-width="8" stroke-linecap="round" fill="none"/>
    </svg>`,
  },
  {
    id: 8,
    service: "Pet Taxi (One-way)",
    shop: "Pawmobile",
    category: "Pet Taxi",
    area: "Thonglor",
    rating: 4.8,
    reviews: 56,
    originalPrice: 350,
    dealPrice: 266,
    discount: 24,
    timeLabel: "Ends in 1h 50min",
    timeType: "ends",
    cardBg: "#fff8d8",
    svgContent: `<svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="80" r="58" fill="#f8e060"/>
      <ellipse cx="100" cy="92" rx="22" ry="19" fill="#c8a000"/>
      <circle cx="86" cy="70" r="9" fill="#c8a000"/>
      <circle cx="100" cy="65" r="9" fill="#c8a000"/>
      <circle cx="114" cy="70" r="9" fill="#c8a000"/>
      <circle cx="77" cy="82" r="7" fill="#c8a000"/>
      <circle cx="123" cy="82" r="7" fill="#c8a000"/>
      <ellipse cx="100" cy="92" rx="14" ry="12" fill="#e8c000"/>
      <circle cx="100" cy="90" r="5" fill="#c8a000"/>
    </svg>`,
  },
];

// ── Deal Card ─────────────────────────────────────────────────────────────────
function DealCard({ deal }: { deal: Deal }) {
  const save = deal.originalPrice - deal.dealPrice;
  return (
    <div className="deal-card">
      <div className="deal-card-img" style={{ background: deal.cardBg }}>
        <div className="deal-card-discount">-{deal.discount}%</div>
        <div className="deal-card-illustration" dangerouslySetInnerHTML={{ __html: deal.svgContent }} />
      </div>
      <div className="deal-card-body">
        <div className="deal-card-name">{deal.service}</div>
        <div className="deal-card-shop">{deal.shop}</div>
        <div className="deal-card-meta">
          <span className="deal-card-stars">★ {deal.rating}</span>
          <span className="deal-card-reviews">({deal.reviews})</span>
          <span className="deal-card-area">{deal.area}</span>
        </div>
        <div className="deal-card-pricing">
          <span className="deal-card-old">฿{deal.originalPrice.toLocaleString()}</span>
          <span className="deal-card-new">฿{deal.dealPrice.toLocaleString()}</span>
          <span className="deal-card-save">Save ฿{save}</span>
        </div>
        <div className={`deal-card-timer ${deal.timeType}`}>
          <span className="deal-card-timer-dot" />
          {deal.timeLabel}
        </div>
        <button className="deal-card-btn">Book now</button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DealsPage() {
  const [search, setSearch]       = useState("");
  const [location, setLocation]   = useState("All Areas");
  const [category, setCategory]   = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [search, location, category]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_DEALS.filter((d) => {
      const matchSearch = !q || d.service.toLowerCase().includes(q) || d.shop.toLowerCase().includes(q);
      const matchLoc = location === "All Areas" || d.area === location;
      const matchCat = category === "All" || d.category === category;
      return matchSearch && matchLoc && matchCat;
    });
  }, [search, location, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / DEALS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * DEALS_PER_PAGE, currentPage * DEALS_PER_PAGE);

  return (
    <div className="deals-page">

      {/* ── Nav ── */}
      <nav className="deals-nav">
        <div className="deals-nav-inner">
          <Link href="/" className="deals-nav-logo">Pawtal</Link>
          <div />
          {/* My Account with dropdown */}
          <div className="deals-nav-account-wrap" ref={accountRef}>
            <button
              className={`deals-nav-account${dropdownOpen ? " open" : ""}`}
              onClick={() => setDropdownOpen((v) => !v)}
            >
              <div className="deals-nav-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              My Account
              <svg className="deals-nav-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {dropdownOpen && (
              <div className="deals-nav-dropdown">
                <Link href="/bookings" className="deals-nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  My Bookings
                </Link>
                <div className="deals-nav-dropdown-divider" />
                <Link href="/profile" className="deals-nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  Profile Settings
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="deals-hero">
        <div className="deals-hero-inner">
          <div className="deals-hero-badge">TODAY ONLY</div>
          <h1 className="deals-hero-h1">Flash deals near you</h1>
          <p className="deals-hero-sub">
            Limited-time offers from top-rated vendors in Sukhumvit and surrounding areas.
          </p>
        </div>
      </div>

      {/* ── Unified Controls: search + location + pills ── */}
      <div className="deals-controls-bar">
        <div className="deals-controls-bar-inner">
          {/* Row 1: search + location */}
          <div className="deals-controls-row1">
            <div className="deals-search-wrap">
              <svg className="deals-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="deals-search-input"
                placeholder="Search shops or services…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="deals-search-clear" onClick={() => setSearch("")}>✕</button>
              )}
            </div>
            <div className="deals-loc-wrap">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "#7eb5d6" }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <select className="deals-loc-select" value={location} onChange={(e) => setLocation(e.target.value)}>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          {/* Row 2: category pills */}
          <div className="deals-controls-row2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`deals-filter-pill${category === cat ? " active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Deal Grid ── */}
      <div className="deals-grid-wrap">
        {filtered.length > 0 ? (
          <>
            <div className="deals-grid">
              {paginated.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="deals-pagination">
                <button
                  className="deals-page-arrow"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className={`deals-page-num${currentPage === n ? " active" : ""}`}
                    onClick={() => setCurrentPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className="deals-page-arrow"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="deals-empty">
            <div className="deals-empty-icon">🔍</div>
            <div className="deals-empty-title">No deals found</div>
            <div className="deals-empty-sub">Try a different location, category, or search term.</div>
            <button className="deals-empty-reset" onClick={() => { setSearch(""); setLocation("All Areas"); setCategory("All"); }}>
              Clear filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
