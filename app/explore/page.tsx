"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import CustomerNav from "@/components/CustomerNav";

// ── Constants ─────────────────────────────────────────────────────────────────
const LOCATIONS  = ["All Areas", "Sukhumvit", "Thonglor", "Asok", "Phrom Phong", "Ekkamai", "On Nut"];
const CATEGORIES = ["All", "Grooming", "Day Care", "Training", "Boarding", "Vet Checkup", "Dog Walking", "Pet Taxi"];

// ── Types ─────────────────────────────────────────────────────────────────────
interface Provider {
  id:         string;
  name:       string;
  area:       string;
  rating:     number;
  reviews:    number;
  isVerified: boolean;
  bio:        string;
  categories: string[];
  address:    string;
  hasDeals:   boolean;
}

// ── Mock data (mirrors real provider IDs from DB) ─────────────────────────────
const PROVIDERS: Provider[] = [
  {
    id:         "d23e0531-31a5-4862-859d-3072df70e1d5",
    name:       "Happy Paws Grooming",
    area:       "Sukhumvit",
    rating:     4.9,
    reviews:    128,
    isVerified: true,
    bio:        "Award-winning grooming salon serving Sukhumvit since 2018. Full grooming, bath & trim, and spa packages for dogs and cats.",
    categories: ["Grooming"],
    address:    "88 Sukhumvit Soi 39, Khlong Toei Nuea, Bangkok",
    hasDeals:   true,
  },
  {
    id:         "f45a2753-53c7-6a84-a7bf-5294fa92f3f7",
    name:       "Furever Friends Hotel",
    area:       "Thonglor",
    rating:     4.8,
    reviews:    94,
    isVerified: true,
    bio:        "Full-day dog boarding and day care in Thonglor. Safe, spacious facilities with trained staff and 24/7 monitoring.",
    categories: ["Day Care", "Boarding"],
    address:    "30 Thonglor Soi 7, Khlong Toei Nuea, Bangkok",
    hasDeals:   true,
  },
  {
    id:         "a1000001-0000-0000-0000-000000000003",
    name:       "Dr. Pet Clinic",
    area:       "Sukhumvit",
    rating:     4.9,
    reviews:    82,
    isVerified: true,
    bio:        "Full-service vet clinic on Sukhumvit with experienced veterinarians, health checkups, vaccinations, and dental care.",
    categories: ["Vet Checkup"],
    address:    "99 Sukhumvit Soi 11, Bangkok",
    hasDeals:   true,
  },
  {
    id:         "a1000001-0000-0000-0000-000000000001",
    name:       "Paws Academy",
    area:       "Ekkamai",
    rating:     5.0,
    reviews:    47,
    isVerified: true,
    bio:        "Professional dog training school in Ekkamai. Obedience training, behaviour correction, and puppy classes for all breeds.",
    categories: ["Training"],
    address:    "23 Ekkamai Rd, Watthana, Bangkok",
    hasDeals:   true,
  },
  {
    id:         "e34f1642-42b6-5973-96ae-4183ea81e2e6",
    name:       "Paw & Relax Spa",
    area:       "Phrom Phong",
    rating:     4.7,
    reviews:    63,
    isVerified: true,
    bio:        "Boutique cat spa and grooming in Phrom Phong. Specialising in cats with stress-free handling and premium products.",
    categories: ["Grooming"],
    address:    "55 Sukhumvit Soi 31, Khlong Toei Nuea, Bangkok",
    hasDeals:   true,
  },
  {
    id:         "a1000001-0000-0000-0000-000000000002",
    name:       "Cozy Paws Hotel",
    area:       "Asok",
    rating:     4.6,
    reviews:    41,
    isVerified: true,
    bio:        "Comfortable overnight boarding for dogs and cats in Asok. Private rooms, regular walks, and live camera access for owners.",
    categories: ["Boarding"],
    address:    "12 Asok-Montri Rd, Bangkok",
    hasDeals:   true,
  },
  {
    id:         "a1000001-0000-0000-0000-000000000004",
    name:       "Walk & Wag",
    area:       "On Nut",
    rating:     4.5,
    reviews:    29,
    isVerified: true,
    bio:        "Trusted dog walkers covering On Nut and Phra Khanong. GPS-tracked walks with real-time photo updates sent to owners.",
    categories: ["Dog Walking"],
    address:    "77 On Nut Rd, Suan Luang, Bangkok",
    hasDeals:   true,
  },
  {
    id:         "a1000001-0000-0000-0000-000000000005",
    name:       "Pawmobile",
    area:       "Thonglor",
    rating:     4.8,
    reviews:    56,
    isVerified: true,
    bio:        "Safe and comfortable pet taxi around Thonglor and surrounding areas. Air-conditioned vehicle with pet-safe carriers.",
    categories: ["Pet Taxi"],
    address:    "15 Thonglor Soi 10, Bangkok",
    hasDeals:   true,
  },
];

// ── Category styling ──────────────────────────────────────────────────────────
const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  "Grooming":    { bg: "#e0f2fe", color: "#0284c7" },
  "Day Care":    { bg: "#fef9c3", color: "#a16207" },
  "Training":    { bg: "#dcfce7", color: "#16a34a" },
  "Boarding":    { bg: "#ffedd5", color: "#c2410c" },
  "Vet Checkup": { bg: "#fce7f3", color: "#be185d" },
  "Dog Walking": { bg: "#ccfbf1", color: "#0f766e" },
  "Pet Taxi":    { bg: "#ede9fe", color: "#6d28d9" },
};

const AVATAR_BG: Record<string, string> = {
  "Grooming":    "#0284c7",
  "Day Care":    "#ca8a04",
  "Training":    "#16a34a",
  "Boarding":    "#c2410c",
  "Vet Checkup": "#be185d",
  "Dog Walking": "#0f766e",
  "Pet Taxi":    "#6d28d9",
};

// ── Provider Card ─────────────────────────────────────────────────────────────
function ProviderCard({ provider }: { provider: Provider }) {
  const primaryCat = provider.categories[0] ?? "Grooming";
  const avatarBg   = AVATAR_BG[primaryCat] ?? "#17A8FF";

  return (
    <div className="explore-card">
      {/* Card header */}
      <div className="explore-card-header" style={{ background: `${avatarBg}18` }}>
        <div className="explore-card-avatar" style={{ background: avatarBg }}>
          {provider.name.charAt(0)}
        </div>
        {provider.isVerified && (
          <div className="explore-card-verified">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
            </svg>
            Verified
          </div>
        )}
        {provider.hasDeals && (
          <div className="explore-card-deals-badge">Off-peak deals</div>
        )}
      </div>

      {/* Card body */}
      <div className="explore-card-body">
        <div className="explore-card-name">{provider.name}</div>

        <div className="explore-card-meta">
          <span className="explore-card-stars">★ {provider.rating.toFixed(1)}</span>
          <span className="explore-card-reviews">({provider.reviews})</span>
          <span className="explore-card-sep">·</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9aabb8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span className="explore-card-area">{provider.area}</span>
        </div>

        <div className="explore-card-cats">
          {provider.categories.map(cat => {
            const s = CAT_STYLE[cat] ?? { bg: "#f0f6ff", color: "#17A8FF" };
            return (
              <span key={cat} className="explore-card-cat-tag" style={{ background: s.bg, color: s.color }}>
                {cat}
              </span>
            );
          })}
        </div>

        <p className="explore-card-bio">{provider.bio}</p>

        <Link
          href={`/deals`}
          className="explore-card-btn"
        >
          View deals
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const [search,      setSearch]      = useState("");
  const [location,    setLocation]    = useState("All Areas");
  const [category,    setCategory]    = useState("All");
  const [locOpen,     setLocOpen]     = useState(false);
  const locRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (locRef.current && !locRef.current.contains(e.target as Node)) setLocOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PROVIDERS.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.bio.toLowerCase().includes(q) || p.categories.some(c => c.toLowerCase().includes(q));
      const matchLoc    = location === "All Areas" || p.area === location;
      const matchCat    = category === "All" || p.categories.includes(category);
      return matchSearch && matchLoc && matchCat;
    });
  }, [search, location, category]);

  return (
    <div className="explore-page">
      <CustomerNav />

      {/* Hero */}
      <div className="explore-hero">
        <div className="explore-hero-inner">
          <div className="explore-hero-badge">DISCOVER</div>
          <h1 className="explore-hero-h1">Explore pet services near you</h1>
          <p className="explore-hero-sub">Find trusted groomers, vets, trainers, and more across Bangkok.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="explore-controls">
        <div className="explore-controls-inner">

          {/* Row 1: search + location */}
          <div className="explore-controls-row1">
            <div className="deals-search-wrap" style={{ maxWidth: "none", flex: 1 }}>
              <svg className="deals-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="deals-search-input"
                placeholder="Search shops or services…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="deals-search-clear" onClick={() => setSearch("")}>✕</button>}
            </div>

            <div className={`deals-loc-wrap${locOpen ? " open" : ""}`} ref={locRef}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "#7eb5d6" }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <button className="deals-loc-btn" onClick={() => setLocOpen(o => !o)}>
                {location}
                <svg className={`deals-loc-chevron${locOpen ? " flipped" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {locOpen && (
                <div className="deals-loc-dropdown">
                  {LOCATIONS.map(l => (
                    <button
                      key={l}
                      className={`deals-loc-dropdown-item${location === l ? " selected" : ""}`}
                      onClick={() => { setLocation(l); setLocOpen(false); }}
                    >
                      {location === l && <span className="deals-loc-check">✓</span>}
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: category pills */}
          <div className="deals-controls-row2">
            {CATEGORIES.map(cat => (
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

      {/* Results count */}
      <div className="explore-grid-wrap">
        <div className="explore-results-meta">
          <span className="explore-results-count">{filtered.length} shop{filtered.length !== 1 ? "s" : ""}</span>
          {(search || location !== "All Areas" || category !== "All") && (
            <button className="explore-clear-btn" onClick={() => { setSearch(""); setLocation("All Areas"); setCategory("All"); }}>
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="explore-empty">
            <div className="explore-empty-icon">🔍</div>
            <div className="explore-empty-title">No shops found</div>
            <div className="explore-empty-sub">Try adjusting your filters or search term.</div>
          </div>
        ) : (
          <div className="explore-grid">
            {filtered.map(p => <ProviderCard key={p.id} provider={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
