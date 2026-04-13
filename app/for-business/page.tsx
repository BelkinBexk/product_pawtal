import Link from "next/link";

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    title: "Smart booking management",
    desc: "View, confirm, and manage all bookings from one clean dashboard. Get notified instantly when a new request comes in.",
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
    title: "Flexible booking modes",
    desc: "Choose Instant Book, Request to Book, or Inquire First. Screen customers your way before accepting any appointment.",
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    title: "Payout in 3 days",
    desc: "Every completed booking pays directly to your Thai bank account within 3 business days. No clearing invoices.",
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    title: "Built-in customer chat",
    desc: "Message customers directly and manage bookings. Keep all communication in one place — no LINE managing required.",
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    title: "Pre-booking questionnaire",
    desc: "Ask anything you need upfront — age, health info, temperament — so you're fully prepared before every appointment.",
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    title: "Revenue analytics",
    desc: "See earnings trends, booking patterns, and customer retention in real time. Know exactly what's driving your growth.",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Create your listing",
    desc: "Add your services, pricing, photos, and availability. Our guided setup takes less than 15 minutes.",
    link: "Start listing →",
  },
  {
    num: "2",
    title: "Get verified",
    desc: "We verify your business credentials and go live within 24 hours. Your badge builds instant trust with customers.",
    link: "Learn more →",
  },
  {
    num: "3",
    title: "Receive bookings",
    desc: "Customers find you, book, and pay through Pawtal. You manage everything from your vendor dashboard.",
    link: "Try it today →",
  },
];

const MODES = [
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    title: "Instant Book",
    desc: "Customers book and pay immediately. Best for high-volume services where you trust the workflow.",
  },
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    title: "Request to Book",
    desc: "Customers request; you review and approve. Great when you want to set expectations first.",
  },
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    title: "Inquire First",
    desc: "Customers message you before booking. Full context — ideal for premium or bespoke services only.",
  },
];

const PLANS = [
  {
    tier: "STARTER",
    price: "Free",
    priceSub: "Get started with no commitment",
    badge: null,
    featured: false,
    cta: "Get started free",
    features: [
      "2 service listings",
      "Booking management dashboard",
      "Instant messaging",
      "5-day payouts",
    ],
  },
  {
    tier: "PRO",
    price: "฿499",
    priceSub: "/month",
    badge: "Most popular",
    featured: true,
    cta: "Start 14-day free trial",
    features: [
      "Up to 10 service listings",
      "Booking management dashboard",
      "Booking questionnaire",
      "Analytics & revenue insights",
      "Priority listing placement",
    ],
  },
  {
    tier: "BUSINESS",
    price: "฿1,299",
    priceSub: "/month",
    badge: null,
    featured: false,
    cta: "Contact sales",
    features: [
      "Unlimited service listings",
      "Multi-staff booking management",
      "Advanced analytics & reporting",
      "Priority listing placement",
      "Dedicated account manager",
      "Custom booking page URL",
    ],
  },
];

const TESTIMONIALS = [
  {
    stars: 5,
    quote: "Before Pawtal, I spent half my day managing LINE messages and missed bookings. Now everything is in one place and I've doubled my monthly revenue in 4 months.",
    name: "Nong Saorjimun",
    business: "Happy Paws · Mobile Groomer",
    avatar: "N",
    avatarBg: "#b2e8cd",
  },
  {
    stars: 5,
    quote: "The 'Request to Book' feature is a game changer. I can screen dogs before accepting — especially for boarding. I've had zero problem clients since switching to Pawtal.",
    name: "Tum Wonchaoren",
    business: "DAG Boarding Cafe",
    avatar: "T",
    avatarBg: "#ddd0ff",
  },
  {
    stars: 5,
    quote: "Setup took me less than an hour and I had my first booking the same day. The analytics dashboard showed me which service was most popular so I could price it right.",
    name: "Ploy Rattanakan",
    business: "Cat Boarding Salon",
    avatar: "P",
    avatarBg: "#ffd0b0",
  },
];

// ── Dashboard Mockup ──────────────────────────────────────────────────────────
function DashboardMock() {
  const bars = [35, 55, 42, 75, 50, 92, 65];
  return (
    <div className="biz-mock">
      <div className="biz-mock-header">
        <span className="biz-mock-logo">PAWTAL</span>
        <span className="biz-mock-online-dot" />
      </div>
      <div className="biz-mock-stats-row">
        <div className="biz-mock-stat">
          <div className="biz-mock-stat-num">42,800</div>
          <div className="biz-mock-stat-lbl">Total views</div>
        </div>
        <div className="biz-mock-stat-sep" />
        <div className="biz-mock-stat">
          <div className="biz-mock-stat-num">94</div>
          <div className="biz-mock-stat-lbl">This month</div>
        </div>
        <div className="biz-mock-stat-sep" />
        <div className="biz-mock-stat">
          <div className="biz-mock-stat-num">4.9</div>
          <div className="biz-mock-stat-lbl">Avg rating</div>
        </div>
      </div>
      <div className="biz-mock-section-lbl">Upcoming bookings</div>
      <div className="biz-mock-bookings">
        {[
          { name: "Mochi · Grooming", time: "Sat 10am", tag: "Confirmed", tagColor: "#16a34a", bg: "#b2e8cd", letter: "M" },
          { name: "Luna · Day Care",  time: "Sat 9am",  tag: "Pending",   tagColor: "#d97706", bg: "#ffd0b0", letter: "L" },
          { name: "Buddy · Training", time: "Sun 2pm",  tag: "New",       tagColor: "#17A8FF", bg: "#ddd0ff", letter: "B" },
        ].map((b) => (
          <div key={b.name} className="biz-mock-booking">
            <div className="biz-mock-booking-av" style={{ background: b.bg }}>{b.letter}</div>
            <div className="biz-mock-booking-info">
              <div className="biz-mock-booking-name">{b.name}</div>
              <div className="biz-mock-booking-time">{b.time}</div>
            </div>
            <div className="biz-mock-booking-tag" style={{ color: b.tagColor }}>{b.tag}</div>
          </div>
        ))}
      </div>
      <div className="biz-mock-section-lbl">Weekly revenue</div>
      <div className="biz-mock-chart">
        {bars.map((h, i) => (
          <div key={i} className="biz-mock-bar" style={{ height: `${h}%`, background: i === 5 ? "#17A8FF" : "rgba(23,168,255,0.22)" }} />
        ))}
      </div>
    </div>
  );
}

// ── Chat Mockup ───────────────────────────────────────────────────────────────
function ChatMock() {
  return (
    <div className="biz-chat-mock">
      <div className="biz-chat-header">
        <div className="biz-chat-av">M</div>
        <div>
          <div className="biz-chat-name">Mochi&apos;s Owner</div>
          <div className="biz-chat-status">● Online</div>
        </div>
      </div>
      <div className="biz-chat-body">
        <div className="biz-chat-msg left">
          <div className="biz-chat-bubble left">Hi! I&apos;d like to book Full Grooming for Mochi on Saturday 10am.</div>
        </div>
        <div className="biz-chat-msg right">
          <div className="biz-chat-bubble right">Booking confirmed for Mochi – Saturday 10am. See you then! ✅</div>
        </div>
        <div className="biz-chat-msg left">
          <div className="biz-chat-bubble left">Perfect, thank you! Mochi is a golden retriever, about 3 years old.</div>
        </div>
        <div className="biz-chat-msg right">
          <div className="biz-chat-bubble right">Great! No prep needed – just bring Mochi and we&apos;re good to go 🐾</div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ForBusinessPage() {
  return (
    <div className="biz-page">

      {/* ── Nav ── */}
      <nav className="biz-nav">
        <div className="biz-nav-inner">
          <div className="biz-nav-logo-wrap">
            <Link href="/" className="biz-nav-logo">PAWTAL</Link>
            <span className="biz-nav-for-biz">FOR BUSINESS</span>
          </div>
          <div className="biz-nav-links">
            <a href="#features"    className="biz-nav-link">Features</a>
            <a href="#how-it-works" className="biz-nav-link">How it works</a>
            <a href="#stories"     className="biz-nav-link">Stories</a>
          </div>
          <div className="biz-nav-right">
            <Link href="/vendor/login" className="biz-nav-login">Vendor login</Link>
            <Link href="/vendor/signup" className="biz-nav-cta">Start free listing</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="biz-hero">
        <div className="biz-hero-inner">
          <div className="biz-hero-left">
            <div className="biz-hero-crumb">← Pawtal for Business</div>
            <h1 className="biz-hero-h1">
              Grow your pet business with{" "}
              <span>Bangkok&apos;s #1 platform.</span>
            </h1>
            <p className="biz-hero-sub">
              List your services, manage bookings your way, and reach thousands of verified pet owners across Bangkok — all from one dashboard.
            </p>
            <div className="biz-hero-btns">
              <Link href="/vendor/signup" className="biz-hero-cta">Start your free listing</Link>
              <Link href="/vendor/login"  className="biz-hero-login">Vendor login</Link>
            </div>
            <div className="biz-hero-trust">
              <span className="biz-trust-item">✓ Free to list</span>
              <span className="biz-trust-sep" />
              <span className="biz-trust-item">✓ No upfront fees</span>
              <span className="biz-trust-sep" />
              <span className="biz-trust-item">✓ Setup in 30 min</span>
            </div>
          </div>
          <div className="biz-hero-right">
            <DashboardMock />
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="biz-stats">
        <div className="biz-stats-inner">
          {[
            { num: "1,200+",  label: "Active vendor listings" },
            { num: "2.4M+",   label: "Paid to vendors monthly" },
            { num: "48,000+", label: "Bookings processed" },
            { num: "25+",     label: "Bangkok districts covered" },
          ].map((s) => (
            <div key={s.num} className="biz-stat">
              <div className="biz-stat-num">{s.num}</div>
              <div className="biz-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="biz-features" id="features">
        <div className="biz-section-inner">
          <div className="biz-section-badge">BUILT FOR VENDORS</div>
          <h2 className="biz-section-h2">Everything you need to run<br />your pet business</h2>
          <p className="biz-section-sub">From your first listing to your 500th booking — Pawtal gives you the tools to grow on your terms.</p>
          <div className="biz-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="biz-feature-card">
                <div className="biz-feature-icon" dangerouslySetInnerHTML={{ __html: f.icon }} />
                <div className="biz-feature-title">{f.title}</div>
                <div className="biz-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="biz-how" id="how-it-works">
        <div className="biz-section-inner">
          <div className="biz-section-badge light">GET STARTED IN MINUTES</div>
          <h2 className="biz-section-h2 light">From sign up to first booking</h2>
          <p className="biz-section-sub light">No complicated setup. No contracts. Just create your listing and start receiving customers.</p>
          <div className="biz-steps">
            {STEPS.map((s, i) => (
              <div key={s.num} className="biz-step">
                {i < STEPS.length - 1 && <div className="biz-step-connector" />}
                <div className="biz-step-num">{s.num}</div>
                <div className="biz-step-title">{s.title}</div>
                <div className="biz-step-desc">{s.desc}</div>
                <a href="#" className="biz-step-link">{s.link}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Booking modes ── */}
      <section className="biz-modes">
        <div className="biz-modes-inner">
          <div className="biz-modes-left">
            <div className="biz-section-badge">BOOKING MODES</div>
            <h2 className="biz-section-h2" style={{ fontSize: 32, marginBottom: 12 }}>You decide how<br />customers book you</h2>
            <p className="biz-section-sub" style={{ marginBottom: 36 }}>Different vendors have different needs. Pawtal gives you three modes so you can set customer expectations that work for your business.</p>
            <div className="biz-mode-list">
              {MODES.map((m) => (
                <div key={m.title} className="biz-mode-item">
                  <div className="biz-mode-icon" dangerouslySetInnerHTML={{ __html: m.icon }} />
                  <div>
                    <div className="biz-mode-title">{m.title}</div>
                    <div className="biz-mode-desc">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="biz-modes-right">
            <ChatMock />
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="biz-testimonials" id="stories">
        <div className="biz-section-inner">
          <div className="biz-section-badge">VENDOR STORIES</div>
          <h2 className="biz-section-h2">Real results from real businesses</h2>
          <div className="biz-testi-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="biz-testi-card">
                <div className="biz-testi-stars">{"★".repeat(t.stars)}</div>
                <p className="biz-testi-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="biz-testi-author">
                  <div className="biz-testi-av" style={{ background: t.avatarBg }}>{t.avatar}</div>
                  <div>
                    <div className="biz-testi-name">{t.name}</div>
                    <div className="biz-testi-biz">{t.business}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="biz-bottom-cta">
        <div className="biz-bottom-cta-inner">
          <div className="biz-bottom-cta-left">
            <h2 className="biz-bottom-cta-h2">Ready to grow your<br />pet business?</h2>
            <p className="biz-bottom-cta-sub">Join 1,200+ vendors already earning more and working smarter on Pawtal. Your first listing is completely free.</p>
          </div>
          <div className="biz-bottom-cta-right">
            <Link href="/vendor/signup" className="biz-hero-cta">Start your free listing today</Link>
            <div className="biz-bottom-signin">Already a vendor? <Link href="/vendor/login" className="biz-bottom-signin-link">Sign in</Link></div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="biz-footer">
        <div className="biz-footer-inner">
          <div className="biz-footer-top">
            <div className="biz-footer-brand">
              <div className="biz-footer-logo">PAWTAL</div>
              <Link href="/" className="biz-footer-owner-link">Go to pet owner site →</Link>
            </div>
            <div className="biz-footer-cols">
              <div className="biz-footer-col">
                <div className="biz-footer-col-title">Contact</div>
                <a href="#" className="biz-footer-link">hello@pawtal.co</a>
                <a href="#" className="biz-footer-link">LINE Official</a>
                <a href="#" className="biz-footer-link">Support Center</a>
              </div>
              <div className="biz-footer-col">
                <div className="biz-footer-col-title">Support</div>
                <a href="#" className="biz-footer-link">Vendor Help Center</a>
                <a href="#" className="biz-footer-link">Getting Started</a>
                <a href="#" className="biz-footer-link">Vendor Login</a>
              </div>
              <div className="biz-footer-col">
                <div className="biz-footer-col-title">Legal</div>
                <a href="#" className="biz-footer-link">Privacy Policy</a>
                <a href="#" className="biz-footer-link">Terms of Service</a>
                <a href="#" className="biz-footer-link">PDPA</a>
              </div>
            </div>
          </div>
          <div className="biz-footer-bottom">© 2026 Pawtal · Bangkok, Thailand</div>
        </div>
      </footer>

    </div>
  );
}
