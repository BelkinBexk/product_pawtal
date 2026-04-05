import Link from "next/link";

// ── Sample deals (prototype — hardcoded) ─────────────────────────────────────
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
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-6 sm:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-extrabold text-[#002949] tracking-tight">
          PAWTAL
        </Link>

        {/* Right: For Business + Get Start */}
        <div className="flex items-center gap-4">
          <Link
            href="/vendor"
            className="text-sm font-semibold text-[#D97706] hover:text-[#B45309] transition-colors"
          >
            For Business
          </Link>
          <Link
            href="/auth/customer/login"
            className="px-5 py-2 rounded-full bg-[#16A34A] text-white text-sm font-bold hover:bg-[#15803D] transition-colors"
          >
            Get start
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 sm:px-10 pt-16 sm:pt-24 pb-10 text-center">
        <h1 className="text-[42px] sm:text-[68px] font-extrabold text-[#002949] leading-[1.1] mb-5">
          welcome to pawtal
        </h1>
        <p className="text-[#6B7280] text-base sm:text-xl max-w-[520px] mx-auto leading-relaxed mb-10">
          Discover off-peak deals on grooming, spa &amp; pet care near you —
          book in seconds, save up to 40%.
        </p>

        {/* Area + deal count combined pill */}
        <div className="flex items-center justify-center mb-12">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E5E7EB] bg-white shadow-sm text-sm font-semibold text-[#002949] hover:border-[#1AB0EB] transition-colors">
            <span>📍</span>
            <span className="font-bold">Sukhumvit</span>
            <span className="text-[#6B7280]">{PREVIEW_DEALS.length} deals</span>
            <svg className="w-3.5 h-3.5 text-[#6B7280]" viewBox="0 0 12 8" fill="none">
              <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── Deal Cards ── */}
      <section className="px-6 sm:px-10 pb-14">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PREVIEW_DEALS.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>

        {/* Explore CTA — outlined */}
        <div className="text-center mt-12">
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 px-16 py-3.5 rounded-xl border-2 border-[#16A34A] text-[#16A34A] text-sm font-bold hover:bg-[#16A34A] hover:text-white transition-all"
          >
            Explore
          </Link>
        </div>
      </section>

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
        {/* Shop + service */}
        <div className="font-extrabold text-[#002949] text-sm mb-0.5 truncate">{deal.shop}</div>
        <div className="text-xs text-[#6B7280] mb-2.5 truncate">{deal.service}</div>

        {/* Rating + area */}
        <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-2.5">
          <span className="text-[#D97706] font-bold">★ {deal.rating}</span>
          <span>({deal.reviews})</span>
          <span className="text-[#D1D5DB]">·</span>
          <span>📍 {deal.area}</span>
        </div>

        {/* Price row */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs text-[#9CA3AF] line-through">฿{deal.original.toLocaleString()}</span>
          <span className="text-base font-extrabold text-[#002949]">฿{deal.deal.toLocaleString()}</span>
          <span className="text-xs font-bold text-[#16A34A]">Save ฿{save.toLocaleString()}</span>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-1 text-[11px] font-semibold mb-4 ${deal.timer.active ? "text-[#DC2626]" : "text-[#6B7280]"}`}>
          <span>⏰</span>
          <span>{deal.timer.label}</span>
        </div>

        {/* Book Now */}
        <button className="w-full py-2.5 rounded-xl bg-[#1AB0EB] text-white text-sm font-bold hover:bg-[#00508D] transition-colors">
          Book Now
        </button>
      </div>
    </div>
  );
}
