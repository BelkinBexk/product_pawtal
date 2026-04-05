"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Data ──────────────────────────────────────────────────────────────────────

const services = [
  { name: "Grooming", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#d7f0e4"/><circle cx="40" cy="30" r="20" fill="#b2e8cd"/><path d="M30 36c0-4 2-6 5-8s5-3 5-5c0-2-1-4-3-4s-2 2-2 4" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/><circle cx="48" cy="22" r="4" fill="#1a7a4a"/><path d="M33 36c1-2 3-4 4-4s3 2 4 4" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/></svg>` },
  { name: "Day Care", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#fff3cd"/><circle cx="40" cy="30" r="20" fill="#ffe8a0"/><ellipse cx="32" cy="28" rx="6" ry="7" fill="#c48a00"/><ellipse cx="48" cy="28" rx="6" ry="7" fill="#c48a00"/><rect x="28" y="31" width="24" height="10" rx="3" fill="#c48a00"/><circle cx="34" cy="26" r="2.5" fill="#fff3cd"/><circle cx="46" cy="26" r="2.5" fill="#fff3cd"/><circle cx="34.5" cy="26.5" r="1.2" fill="#333"/><circle cx="46.5" cy="26.5" r="1.2" fill="#333"/></svg>` },
  { name: "Training", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#ddeeff"/><circle cx="40" cy="30" r="20" fill="#b8d8f8"/><path d="M40 16c-7 0-12 5-12 12 0 4 2 7.5 5 9.5v3h14v-3c3-2 5-5.5 5-9.5 0-7-5-12-12-12z" fill="#1a6fba"/><rect x="35" y="42" width="10" height="2.5" rx="1" fill="#1a6fba"/><circle cx="36" cy="27" r="2" fill="#fff"/><circle cx="44" cy="27" r="2" fill="#fff"/></svg>` },
  { name: "Cat Care", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#f0e8ff"/><circle cx="40" cy="30" r="20" fill="#ddd0ff"/><ellipse cx="40" cy="32" rx="11" ry="10" fill="#6a3fbf"/><ellipse cx="30" cy="22" rx="5" ry="6" fill="#6a3fbf"/><ellipse cx="50" cy="22" rx="5" ry="6" fill="#6a3fbf"/><circle cx="36" cy="31" r="2.5" fill="#fff"/><circle cx="44" cy="31" r="2.5" fill="#fff"/><circle cx="36.5" cy="31.5" r="1.2" fill="#333"/><circle cx="44.5" cy="31.5" r="1.2" fill="#333"/><path d="M36 37 Q40 40 44 37" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>` },
  { name: "Boarding", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#ffeee8"/><circle cx="40" cy="30" r="20" fill="#ffd0c0"/><rect x="28" y="30" width="24" height="14" rx="4" fill="#c04a00"/><circle cx="34" cy="26" r="6" fill="#c04a00"/><circle cx="46" cy="26" r="6" fill="#c04a00"/><circle cx="36" cy="30" r="2.5" fill="#fff"/><circle cx="44" cy="30" r="2.5" fill="#fff"/><circle cx="36.5" cy="30.5" r="1.2" fill="#333"/><circle cx="44.5" cy="30.5" r="1.2" fill="#333"/></svg>` },
  { name: "Vet Checkup", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#e8f4ff"/><circle cx="40" cy="30" r="20" fill="#b8d8f8"/><rect x="36" y="20" width="8" height="20" rx="2" fill="#1a6fba"/><rect x="30" y="26" width="20" height="8" rx="2" fill="#1a6fba"/></svg>` },
  { name: "Pet Taxi", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#fffde8"/><circle cx="40" cy="30" r="20" fill="#fff5b0"/><rect x="24" y="28" width="32" height="14" rx="4" fill="#b8a000"/><rect x="28" y="22" width="24" height="10" rx="3" fill="#b8a000"/><circle cx="30" cy="42" r="4" fill="#555"/><circle cx="50" cy="42" r="4" fill="#555"/><circle cx="30" cy="42" r="2" fill="#999"/><circle cx="50" cy="42" r="2" fill="#999"/></svg>` },
  { name: "Dog Walking", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#e8fff0"/><circle cx="40" cy="30" r="20" fill="#b0f0c8"/><ellipse cx="40" cy="32" rx="10" ry="9" fill="#0f7a3a"/><ellipse cx="30" cy="22" rx="5" ry="6" fill="#0f7a3a"/><ellipse cx="50" cy="22" rx="5" ry="6" fill="#0f7a3a"/><path d="M35 38 Q40 42 45 38" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><line x1="40" y1="44" x2="38" y2="52" stroke="#0f7a3a" strokeWidth="2" strokeLinecap="round"/><line x1="40" y1="48" x2="44" y2="54" stroke="#0f7a3a" strokeWidth="2" strokeLinecap="round"/></svg>` },
];

const deals = [
  { id: 1, title: "Full Grooming Package", cat: "Grooming", rating: "4.9 (128)", location: "Sukhumvit", old: "฿900", price: "฿630", save: "Save ฿270", discount: "-30%", timer: "Ends in 3h 42min", desc: "A complete grooming experience including bath, blowdry, haircut, nail trim, and ear cleaning. Perfect for dogs of all sizes.", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#d7f0e4"/><circle cx="40" cy="30" r="20" fill="#b2e8cd"/><path d="M30 36c0-4 2-6 5-8s5-3 5-5c0-2-1-4-3-4s-2 2-2 4" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/><circle cx="48" cy="22" r="4" fill="#1a7a4a"/><path d="M33 36c1-2 3-4 4-4s3 2 4 4" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/></svg>` },
  { id: 2, title: "Dog Day Care (Full Day)", cat: "Day Care", rating: "4.8 (94)", location: "Thonglor", old: "฿1,000", price: "฿800", save: "Save ฿200", discount: "-20%", timer: "Starts in 17min", desc: "Full-day supervised care with playtime, meals, and rest. Drop off from 7am, pickup until 8pm. Limited spots available daily.", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#fff3cd"/><circle cx="40" cy="30" r="20" fill="#ffe8a0"/><ellipse cx="32" cy="28" rx="6" ry="7" fill="#c48a00"/><ellipse cx="48" cy="28" rx="6" ry="7" fill="#c48a00"/><rect x="28" y="31" width="24" height="10" rx="3" fill="#c48a00"/><circle cx="34" cy="26" r="2.5" fill="#fff3cd"/><circle cx="46" cy="26" r="2.5" fill="#fff3cd"/><circle cx="34.5" cy="26.5" r="1.2" fill="#333"/><circle cx="46.5" cy="26.5" r="1.2" fill="#333"/></svg>` },
  { id: 3, title: "Basic Training Session", cat: "Training", rating: "5.0 (47)", location: "Ekkamai", old: "฿800", price: "฿680", save: "Save ฿120", discount: "-15%", timer: "Ends in 5h 10min", desc: "1-hour one-on-one training session covering basic commands: sit, stay, come, heel. Suitable for puppies and adult dogs.", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#ddeeff"/><circle cx="40" cy="30" r="20" fill="#b8d8f8"/><path d="M40 16c-7 0-12 5-12 12 0 4 2 7.5 5 9.5v3h14v-3c3-2 5-5.5 5-9.5 0-7-5-12-12-12z" fill="#1a6fba"/><rect x="35" y="42" width="10" height="2.5" rx="1" fill="#1a6fba"/><circle cx="36" cy="27" r="2" fill="#fff"/><circle cx="44" cy="27" r="2" fill="#fff"/></svg>` },
  { id: 4, title: "Cat Spa & Grooming", cat: "Grooming", rating: "4.7 (63)", location: "Phrom Phong", old: "฿700", price: "฿525", save: "Save ฿175", discount: "-25%", timer: "Ends in 2h 15min", desc: "Gentle cat grooming session including brush out, nail trim, and ear cleaning. Our cat-specialist groomers ensure a stress-free experience.", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#f0e8ff"/><circle cx="40" cy="30" r="20" fill="#ddd0ff"/><ellipse cx="40" cy="32" rx="11" ry="10" fill="#6a3fbf"/><ellipse cx="30" cy="22" rx="5" ry="6" fill="#6a3fbf"/><ellipse cx="50" cy="22" rx="5" ry="6" fill="#6a3fbf"/><circle cx="36" cy="31" r="2.5" fill="#fff"/><circle cx="44" cy="31" r="2.5" fill="#fff"/><circle cx="36.5" cy="31.5" r="1.2" fill="#333"/><circle cx="44.5" cy="31.5" r="1.2" fill="#333"/><path d="M36 37 Q40 40 44 37" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>` },
  { id: 5, title: "Overnight Boarding", cat: "Boarding", rating: "4.9 (82)", location: "Ari", old: "฿1,200", price: "฿900", save: "Save ฿300", discount: "-25%", timer: "Ends today", desc: "Safe and comfortable overnight stay at a certified boarding facility. Includes 2 meals, walks, and playtime. Daily photo updates.", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#ffeee8"/><circle cx="40" cy="30" r="20" fill="#ffd0c0"/><rect x="28" y="30" width="24" height="14" rx="4" fill="#c04a00"/><circle cx="34" cy="26" r="6" fill="#c04a00"/><circle cx="46" cy="26" r="6" fill="#c04a00"/><circle cx="36" cy="30" r="2.5" fill="#fff"/><circle cx="44" cy="30" r="2.5" fill="#fff"/><circle cx="36.5" cy="30.5" r="1.2" fill="#333"/><circle cx="44.5" cy="30.5" r="1.2" fill="#333"/></svg>` },
  { id: 6, title: "Vet Health Check", cat: "Vet Checkup", rating: "4.8 (115)", location: "Silom", old: "฿600", price: "฿480", save: "Save ฿120", discount: "-20%", timer: "Ends in 6h", desc: "Full health examination including weight check, dental inspection, and general wellness assessment. Certificate issued on request.", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#e8f4ff"/><circle cx="40" cy="30" r="20" fill="#b8d8f8"/><rect x="36" y="20" width="8" height="20" rx="2" fill="#1a6fba"/><rect x="30" y="26" width="20" height="8" rx="2" fill="#1a6fba"/></svg>` },
  { id: 7, title: "Dog Walking (60 min)", cat: "Dog Walking", rating: "4.9 (203)", location: "Sukhumvit", old: "฿350", price: "฿280", save: "Save ฿70", discount: "-20%", timer: "Ends in 4h", desc: "Professional 60-minute dog walk with GPS tracking and post-walk report. Our walkers are insured and background-checked.", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#e8fff0"/><circle cx="40" cy="30" r="20" fill="#b0f0c8"/><ellipse cx="40" cy="32" rx="10" ry="9" fill="#0f7a3a"/><ellipse cx="30" cy="22" rx="5" ry="6" fill="#0f7a3a"/><ellipse cx="50" cy="22" rx="5" ry="6" fill="#0f7a3a"/><path d="M35 38 Q40 42 45 38" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><line x1="40" y1="44" x2="38" y2="52" stroke="#0f7a3a" strokeWidth="2" strokeLinecap="round"/><line x1="40" y1="48" x2="44" y2="54" stroke="#0f7a3a" strokeWidth="2" strokeLinecap="round"/></svg>` },
  { id: 8, title: "Pet Taxi (per trip)", cat: "Pet Taxi", rating: "4.7 (56)", location: "Bangkok-wide", old: "฿250", price: "฿190", save: "Save ฿60", discount: "-24%", timer: "Ends in 8h", desc: "Safe, air-conditioned pet transport for vet visits, grooming appointments, or any trip around Bangkok. Carrier included.", svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="60" fill="#fffde8"/><circle cx="40" cy="30" r="20" fill="#fff5b0"/><rect x="24" y="28" width="32" height="14" rx="4" fill="#b8a000"/><rect x="28" y="22" width="24" height="10" rx="3" fill="#b8a000"/><circle cx="30" cy="42" r="4" fill="#555"/><circle cx="50" cy="42" r="4" fill="#555"/><circle cx="30" cy="42" r="2" fill="#999"/><circle cx="50" cy="42" r="2" fill="#999"/></svg>` },
];

const categories = ["All", "Grooming", "Day Care", "Training", "Boarding", "Vet Checkup", "Dog Walking", "Pet Taxi"];

const faqGroups = [
  { label: "All", group: "all" },
  { label: "Booking", group: "booking" },
  { label: "For vendors", group: "vendors" },
  { label: "Payment", group: "payment" },
  { label: "Safety", group: "safety" },
];

const faqs = [
  { group: "booking", q: "How do I book a service on Pawtal?", a: "Search for the service you need, pick a vendor that suits your pet and schedule, then choose Instant Book, Request to Book, or Inquire First. Follow the on-screen steps to confirm and pay securely." },
  { group: "booking", q: "What is the difference between Instant Book and Request to Book?", a: "Instant Book confirms your slot right away. Request to Book sends a request to the vendor, who may ask a few questions before accepting. Some vendors prefer this to ensure a good fit." },
  { group: "booking", q: "Can I cancel or reschedule a booking?", a: "Yes. You can cancel or reschedule from your booking history up to 24 hours before the appointment. Cancellation policies vary by vendor and are shown on each listing." },
  { group: "booking", q: "What happens if the vendor cancels on me?", a: "If a vendor cancels a confirmed booking, you will receive a full refund within 3–5 business days and a notification to help you find an alternative." },
  { group: "vendors", q: "How do I list my pet service business on Pawtal?", a: "Click 'Start your free listing' and complete vendor onboarding in about 10 minutes. You'll need a valid Thai business ID or freelancer registration, photos, and a service description." },
  { group: "vendors", q: "Can I screen customers before accepting a booking?", a: "Absolutely. Use Request to Book or Inquire First mode, and optionally set up a pre-booking questionnaire to collect pet info upfront." },
  { group: "vendors", q: "How and when do I get paid?", a: "Earnings are transferred to your Thai bank account within 3 business days after each completed booking, trackable in your vendor dashboard." },
  { group: "payment", q: "What payment methods does Pawtal accept?", a: "Visa, Mastercard, PromptPay, and major Thai e-wallets. All transactions use our PCI-compliant payment gateway — card details are never stored." },
  { group: "payment", q: "Will I receive a receipt for my booking?", a: "Yes. A confirmation and receipt are sent to your email immediately after payment. You can also download receipts anytime from your booking history." },
  { group: "safety", q: "How does Pawtal verify vendors?", a: "Every vendor is identity-checked before going live. We verify credentials, review photos, and monitor ratings to maintain quality standards." },
  { group: "safety", q: "What if something goes wrong during a service?", a: "Contact support immediately via the app or website. We have a dedicated resolution process and may offer compensation or a rebooking." },
  { group: "safety", q: "Are vendors insured?", a: "Pawtal strongly encourages liability insurance — some service types require it. Insurance status is shown on each vendor profile." },
];

type Deal = typeof deals[number];

// ── Component ─────────────────────────────────────────────────────────────────

const LOCATIONS = ["Sukhumvit", "Thonglor", "Asok", "Phrom Phong", "Ekkamai", "On Nut"];

export default function LandingPage() {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState("All");
  const [activeSvc, setActiveSvc] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState("all");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [modalDeal, setModalDeal] = useState<Deal | null>(null);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLoc, setSelectedLoc] = useState("Sukhumvit");
  const [locOpen, setLocOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dealsRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
  };

  const filteredDeals = activeCat === "All" ? deals : deals.filter((d) => d.cat === activeCat);

  const filteredFaqs = activeGroup === "all" ? faqs : faqs.filter((f) => f.group === activeGroup);

  const scrollToDeals = () => {
    dealsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = () => {
    if (!search.trim()) { scrollToDeals(); return; }
    const q = search.trim().toLowerCase();
    const match = deals.find((d) => d.title.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q));
    if (match) { setActiveCat(match.cat); scrollToDeals(); }
    else { showToast(`No results for "${search}". Try: Grooming, Day Care, Training…`); }
  };

  const handleSvcClick = (name: string) => {
    setActiveSvc(name);
    setActiveCat(name);
    scrollToDeals();
  };

  const handleCatClick = (cat: string) => {
    setActiveCat(cat);
  };

  const openModal = (d: Deal) => setModalDeal(d);
  const closeModal = () => setModalDeal(null);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = modalDeal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalDeal]);

  return (
    <>
      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>PAWTAL</div>
          <div className="nav-center">
            <a className="nav-link" href="#deals">Services</a>
            <a className="nav-link" href="#how">How it works</a>
            <a className="nav-link" href="#faq">FAQ</a>
            <a className="nav-link" href="#vendor">For Business</a>
          </div>
          <div className="nav-right">
            <button className="nav-login" onClick={() => router.push("/login")}>Sign in</button>
            <button className="nav-cta" onClick={() => router.push("/login")}>Get started</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              Bangkok&apos;s trusted pet services platform
            </div>
            <h1 className="hero-h1">
              Your pet deserves<br />
              <span>the best care</span>,<br />
              close to home.
            </h1>
            <p className="hero-sub">
              Find vetted groomers, sitters, trainers and more — book instantly or take your time to choose the right fit for your furry family.
            </p>
            <div className="hero-search">
              <input
                className="hero-search-input"
                type="text"
                placeholder="What service are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <div className="hero-search-sep" />
              <div style={{ position: "relative" }}>
                <div className="hero-search-loc" onClick={() => setLocOpen((o) => !o)}>
                  📍 {selectedLoc}
                  <svg style={{ marginLeft: 6, display: "inline", verticalAlign: "middle", transition: "transform 0.2s", transform: locOpen ? "rotate(180deg)" : "rotate(0deg)" }} width="10" height="10" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="#5a8fa8" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                {locOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid var(--border2)", borderRadius: 14, boxShadow: "0 8px 24px rgba(0,52,89,0.12)", overflow: "hidden", zIndex: 100, minWidth: 160 }}>
                    {LOCATIONS.map((loc) => (
                      <div
                        key={loc}
                        onClick={() => { setSelectedLoc(loc); setLocOpen(false); }}
                        style={{ padding: "10px 18px", fontSize: 13, fontWeight: selectedLoc === loc ? 600 : 400, color: selectedLoc === loc ? "var(--blue)" : "var(--navy)", background: selectedLoc === loc ? "var(--blue-light)" : "transparent", cursor: "pointer" }}
                        onMouseEnter={(e) => { if (selectedLoc !== loc) (e.currentTarget as HTMLDivElement).style.background = "var(--surface)"; }}
                        onMouseLeave={(e) => { if (selectedLoc !== loc) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                      >
                        {loc}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="hero-search-btn" onClick={handleSearch}>Search</button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-num">1,200+</div>
                <div className="stat-label">Verified vendors</div>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <div className="stat-num">48,000+</div>
                <div className="stat-label">Happy pets served</div>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <div className="stat-num">4.9</div>
                <div className="stat-label">Avg. rating</div>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <div className="stat-num">25+</div>
                <div className="stat-label">Districts</div>
              </div>
            </div>
          </div>

          {/* Hero Collage */}
          <div className="hero-collage">
            <div className="collage-img" style={{ gridRow: "span 2", height: 380, marginTop: 40 }}>
              <div className="mock-panel" style={{ background: "#d7f0e4", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <circle cx="36" cy="36" r="36" fill="#b2e8cd" />
                  <path d="M24 46c0-5 3-8 7-10s6-4 6-7c0-3-2-5-4-5s-3 2-3 5" stroke="#1a7a4a" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="46" cy="26" r="5" fill="#1a7a4a" />
                  <path d="M30 46c1-3 4-5 6-5s5 2 6 5" stroke="#1a7a4a" strokeWidth="2" strokeLinecap="round" />
                  <path d="M26 52 C28 50 32 49 36 49 C40 49 44 50 46 52" stroke="#1a7a4a" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="collage-badge">
                <div className="cb-dot" />
                <div className="cb-text">Now available nearby</div>
              </div>
            </div>
            <div className="collage-img" style={{ height: 176 }}>
              <div className="mock-panel" style={{ background: "#fff3cd", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="28" r="28" fill="#ffe8a0" />
                  <ellipse cx="20" cy="26" rx="7" ry="8" fill="#c48a00" />
                  <ellipse cx="36" cy="26" rx="7" ry="8" fill="#c48a00" />
                  <rect x="16" y="30" width="24" height="12" rx="4" fill="#c48a00" />
                  <circle cx="22" cy="24" r="3" fill="#fff3cd" /><circle cx="34" cy="24" r="3" fill="#fff3cd" />
                  <circle cx="23" cy="24" r="1.5" fill="#333" /><circle cx="35" cy="24" r="1.5" fill="#333" />
                </svg>
              </div>
              <div className="collage-pill">-30%</div>
            </div>
            <div className="collage-img" style={{ height: 176 }}>
              <div className="mock-panel" style={{ background: "#f0e8ff", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="28" r="28" fill="#ddd0ff" />
                  <ellipse cx="28" cy="30" rx="10" ry="9" fill="#6a3fbf" />
                  <ellipse cx="20" cy="22" rx="4" ry="5" fill="#6a3fbf" />
                  <ellipse cx="36" cy="22" rx="4" ry="5" fill="#6a3fbf" />
                  <circle cx="24" cy="29" r="2" fill="#fff" /><circle cx="32" cy="29" r="2" fill="#fff" />
                  <circle cx="24.5" cy="29.5" r="1" fill="#333" /><circle cx="32.5" cy="29.5" r="1" fill="#333" />
                  <path d="M24 34 Q28 37 32 34" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES STRIP ── */}
      <div className="services-strip">
        <div className="services-strip-inner">
          {services.map((s) => (
            <div
              key={s.name}
              className={`svc-item${activeSvc === s.name ? " active" : ""}`}
              onClick={() => handleSvcClick(s.name)}
            >
              <div className="svc-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: s.svg }} />
              <div className="svc-name">{s.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DEALS ── */}
      <div className="section reveal" id="deals" ref={dealsRef}>
        <div className="section-wrap">
          <div className="section-header">
            <div>
              <div className="section-label">Today only</div>
              <h2 className="section-h2">Flash deals near you</h2>
              <p className="section-sub">Limited-time offers from top-rated vendors in Sukhumvit and surrounding areas.</p>
            </div>
            <div className="see-all" onClick={() => router.push("/login")}>Explore all deals &rsaquo;</div>
          </div>

          {/* Category pills */}
          <div className="category-row">
            {categories.map((c) => (
              <button
                key={c}
                className={`cat-pill${activeCat === c ? " active" : ""}`}
                onClick={() => handleCatClick(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Cards grid */}
          <div className="cards-grid">
            {filteredDeals.length === 0 ? (
              <div style={{ gridColumn: "span 4", textAlign: "center", padding: "60px 0", color: "var(--hint)", fontSize: 15, fontWeight: 300 }}>
                No deals found in this category right now. Check back soon!
              </div>
            ) : (
              filteredDeals.map((d) => (
                <div key={d.id} className="card" onClick={() => openModal(d)}>
                  <div className="card-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <div dangerouslySetInnerHTML={{ __html: d.svg }} style={{ width: "100%", height: "100%" }} />
                    <div className="card-badge">{d.discount}</div>
                  </div>
                  <div className="card-body">
                    <div className="card-title">{d.title}</div>
                    <div className="card-meta">
                      <span className="card-rating">★ {d.rating}</span>
                      <span>{d.location}</span>
                    </div>
                    <div className="card-price">
                      <span className="price-old">{d.old}</span>
                      <span className="price-new">{d.price}</span>
                      <span className="price-save">{d.save}</span>
                    </div>
                    <div className="card-timer">
                      <div className="timer-dot" />
                      {d.timer}
                    </div>
                    <button className="book-btn" onClick={(e) => { e.stopPropagation(); openModal(d); }}>Book now</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section reveal" id="how">
        <div className="how-inner">
          <div className="how-layout">
            <div className="how-image">
              <div className="mock-panel" style={{ background: "#dff0ea", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="50" fill="#b5e3d0" />
                  <ellipse cx="50" cy="40" rx="16" ry="18" fill="#1a7a4a" />
                  <ellipse cx="50" cy="72" rx="22" ry="14" fill="#1a7a4a" />
                  <circle cx="45" cy="38" r="3" fill="#fff" /><circle cx="55" cy="38" r="3" fill="#fff" />
                  <circle cx="45.5" cy="38.5" r="1.5" fill="#333" /><circle cx="55.5" cy="38.5" r="1.5" fill="#333" />
                  <path d="M44 46 Q50 50 56 46" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  <path d="M28 72 Q35 60 50 58 Q65 60 72 72" fill="#0f5c38" />
                </svg>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f5c38", letterSpacing: "0.3px" }}>Professional Pet Care</div>
              </div>
              <div className="how-image-badge">
                <div className="hib-avatar">
                  <svg viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="22" fill="#1a7a4a" /><text x="22" y="27" textAnchor="middle" fontFamily="Lexend Deca,sans-serif" fontSize="14" fontWeight="600" fill="#fff">NP</text></svg>
                </div>
                <div>
                  <div className="hib-name">Nong&apos;s Pet Spa</div>
                  <div className="hib-meta">Sukhumvit 23 · Verified vendor</div>
                </div>
                <div className="hib-rating">★ 4.9</div>
              </div>
            </div>
            <div>
              <div style={{ marginBottom: 40 }}>
                <div className="section-label">Simple process</div>
                <h2 className="section-h2">Booking in 3 easy steps</h2>
                <p className="section-sub">We take the hassle out of finding great pet care — so you can focus on the tail wags.</p>
              </div>
              <div>
                <div className="step-item">
                  <div className="step-num-circle">1</div>
                  <div>
                    <div className="step-content-title">Browse &amp; filter</div>
                    <p className="step-content-desc">Search by service type, location, and price. Read real reviews from verified pet owners in your area.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-num-circle">2</div>
                  <div>
                    <div className="step-content-title">Choose how to book</div>
                    <p className="step-content-desc">Instant Book for convenience, Request to Book if the vendor needs to approve, or chat first before committing.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-num-circle">3</div>
                  <div>
                    <div className="step-content-title">Confirm &amp; go</div>
                    <p className="step-content-desc">Pay securely through Pawtal and receive booking confirmation instantly. Post-service, leave a review for the community.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testi-section reveal">
        <div className="testi-inner">
          <div className="testi-header">
            <div>
              <div className="section-label">What owners say</div>
              <h2 className="section-h2">Trusted by thousands of pet families</h2>
            </div>
            <div className="see-all" onClick={() => showToast("All reviews coming soon!")}>Read all reviews &rsaquo;</div>
          </div>
          <div className="testi-grid">
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">&ldquo;Found an amazing groomer for Mochi right in Thonglor. The booking was smooth, the vendor responded fast, and Mochi came back looking incredible. Will definitely use Pawtal again.&rdquo;</p>
              <div className="testi-author">
                <div className="testi-avatar"><svg viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="22" fill="#17A8FF" /><text x="22" y="27" textAnchor="middle" fontFamily="Lexend Deca,sans-serif" fontSize="14" fontWeight="600" fill="#fff">N</text></svg></div>
                <div><div className="testi-name">Natthida P.</div><div className="testi-pet">Shiba Inu owner, Thonglor</div></div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">&ldquo;I love that vendors can set up questionnaires. Our trainer took time to understand Luna&apos;s anxiety before the first session. This is how pet care should work.&rdquo;</p>
              <div className="testi-author">
                <div className="testi-avatar"><svg viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="22" fill="#003459" /><text x="22" y="27" textAnchor="middle" fontFamily="Lexend Deca,sans-serif" fontSize="14" fontWeight="600" fill="#fff">K</text></svg></div>
                <div><div className="testi-name">Krit W.</div><div className="testi-pet">Border Collie owner, Ekkamai</div></div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">&ldquo;Used Pawtal for boarding during Songkran. The vendor sent daily updates and photos. Came back to a happy, well-rested cat. Highly recommend for peace of mind.&rdquo;</p>
              <div className="testi-author">
                <div className="testi-avatar"><svg viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="22" fill="#0B93E8" /><text x="22" y="27" textAnchor="middle" fontFamily="Lexend Deca,sans-serif" fontSize="14" fontWeight="600" fill="#fff">P</text></svg></div>
                <div><div className="testi-name">Ploy S.</div><div className="testi-pet">Scottish Fold owner, Ari</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section reveal" id="faq">
        <div className="faq-inner">
          <div className="faq-layout">
            <div>
              <div className="faq-img">
                <div className="mock-panel" style={{ background: "#fff3cd", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="40" fill="#ffe8a0" />
                    <ellipse cx="40" cy="46" rx="18" ry="16" fill="#c48a00" />
                    <ellipse cx="28" cy="32" rx="8" ry="10" fill="#c48a00" />
                    <ellipse cx="52" cy="32" rx="8" ry="10" fill="#c48a00" />
                    <circle cx="30" cy="30" r="4" fill="#fff3cd" /><circle cx="50" cy="30" r="4" fill="#fff3cd" />
                    <circle cx="31" cy="30.5" r="2" fill="#333" /><circle cx="51" cy="30.5" r="2" fill="#333" />
                    <path d="M33 42 Q40 47 47 42" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                    <ellipse cx="40" cy="54" rx="6" ry="4" fill="#a06800" />
                  </svg>
                </div>
              </div>
              <div className="faq-sidebar-label">Got questions?</div>
              <h2 className="faq-sidebar-h2">Everything you need to know</h2>
              <p className="faq-sidebar-sub">Can&apos;t find what you&apos;re looking for? Our support team is happy to help.</p>
              <button className="faq-contact-btn" onClick={() => showToast("Support chat opening soon!")}>Contact support &rsaquo;</button>
            </div>
            <div>
              <div className="faq-tabs">
                {faqGroups.map((t) => (
                  <button
                    key={t.group}
                    className={`faq-tab${activeGroup === t.group ? " active" : ""}`}
                    onClick={() => { setActiveGroup(t.group); setOpenFaq(null); }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div>
                {filteredFaqs.map((f, i) => {
                  const key = `${f.group}-${i}`;
                  const isOpen = openFaq === key;
                  return (
                    <div key={key} className={`faq-item${isOpen ? " open" : ""}`}>
                      <div className="faq-q" onClick={() => setOpenFaq(isOpen ? null : key)}>
                        <div className="faq-q-text">{f.q}</div>
                        <div className="faq-icon">
                          <svg viewBox="0 0 12 12" fill="none">
                            <path d="M6 2v8M2 6h8" stroke="#17A8FF" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>
                      <div className="faq-a">{f.a}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VENDOR STRIP ── */}
      <div className="vendor-strip reveal" id="vendor">
        <div className="vendor-inner">
          <div className="vendor-text">
            <h2>Are you a pet service provider?</h2>
            <p>Join 1,200+ vendors already growing their business on Pawtal. Set your own schedule, manage bookings your way, and reach thousands of pet owners across Bangkok.</p>
          </div>
          <button className="vendor-btn" onClick={() => showToast("Vendor onboarding coming soon!")}>Start your free listing</button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-logo">PAWTAL</div>
              <p className="footer-brand-desc">Bangkok&apos;s most trusted platform for pet services. Connecting loving owners with verified professionals.</p>
              <div className="footer-img">
                <div className="mock-panel" style={{ background: "#e8f4ff", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="24" fill="#b8d8f8" />
                    <ellipse cx="24" cy="28" rx="10" ry="9" fill="#1a6fba" />
                    <ellipse cx="16" cy="20" rx="5" ry="6" fill="#1a6fba" /><ellipse cx="32" cy="20" rx="5" ry="6" fill="#1a6fba" />
                    <circle cx="20" cy="27" r="2" fill="#fff" /><circle cx="28" cy="27" r="2" fill="#fff" />
                    <circle cx="20.5" cy="27.5" r="1" fill="#333" /><circle cx="28.5" cy="27.5" r="1" fill="#333" />
                  </svg>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="20" fill="#ddd0ff" />
                    <ellipse cx="20" cy="22" rx="8" ry="7" fill="#6a3fbf" />
                    <ellipse cx="14" cy="15" rx="3.5" ry="4" fill="#6a3fbf" /><ellipse cx="26" cy="15" rx="3.5" ry="4" fill="#6a3fbf" />
                    <circle cx="17" cy="21" r="1.5" fill="#fff" /><circle cx="23" cy="21" r="1.5" fill="#fff" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <a href="#">Grooming</a>
              <a href="#">Day Care</a>
              <a href="#">Training</a>
              <a href="#">Boarding</a>
              <a href="#">Vet Checkup</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About us</a>
              <a href="#">For Business</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact us</a>
              <a href="#">Privacy policy</a>
              <a href="#">Terms of service</a>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">2025 Pawtal. All rights reserved.</div>
            <div className="footer-copy">Made with care, for pets everywhere.</div>
          </div>
        </div>
      </footer>

      {/* ── MODAL ── */}
      {modalDeal && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">
            <button className="modal-close" onClick={closeModal}>&#x2715;</button>
            <div className="modal-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: modalDeal.svg }} />
            <div className="modal-badge">{modalDeal.discount}</div>
            <div className="modal-title">{modalDeal.title}</div>
            <div className="modal-meta">
              <span className="modal-rating">★ {modalDeal.rating}</span>
              <span>{modalDeal.location}</span>
            </div>
            <p className="modal-desc">{modalDeal.desc}</p>
            <div className="modal-price-row">
              <div className="modal-price">
                <span className="modal-old">{modalDeal.old}</span>
                <span className="modal-new">{modalDeal.price}</span>
                <span className="modal-save">{modalDeal.save}</span>
              </div>
              <div className="modal-timer">
                <div className="modal-timer-dot" />
                <span>{modalDeal.timer}</span>
              </div>
            </div>
            <button className="modal-book-btn" onClick={() => { closeModal(); router.push("/login"); }}>
              Confirm Booking
            </button>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      <div className={`toast${toastVisible ? " show" : ""}`}>{toast}</div>

      {/* Backdrop to close location dropdown */}
      {locOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setLocOpen(false)} />
      )}
    </>
  );
}
