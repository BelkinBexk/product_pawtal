import Link from "next/link";

const PREVIEW_DEALS = [
  {
    id: 1,
    gradient: "from-[#D1FAE5] to-[#A7F3D0]",
    icon: "✂️",
    discount: 30,
    shop: "Fur & Fresh Grooming",
    service: "Bath & Full Groom",
    area: "Sukhumvit 39",
    rating: 4.8,
    reviews: 124,
    original: 650,
    deal: 455,
  },
  {
    id: 2,
    gradient: "from-[#FEF9C3] to-[#FDE68A]",
    icon: "✂️",
    discount: 40,
    shop: "Happy Paws Studio",
    service: "Puppy Trim + Bath",
    area: "Thonglor",
    rating: 4.9,
    reviews: 87,
    original: 800,
    deal: 480,
  },
  {
    id: 3,
    gradient: "from-[#E0E7FF] to-[#C7D2FE]",
    icon: "🛁",
    discount: 25,
    shop: "Paw & Relax Spa",
    service: "Aromatherapy Bath",
    area: "Phrom Phong",
    rating: 4.7,
    reviews: 56,
    original: 550,
    deal: 413,
  },
  {
    id: 4,
    gradient: "from-[#FCE7F3] to-[#FBCFE8]",
    icon: "✂️",
    discount: 35,
    shop: "Snip & Style BKK",
    service: "Full Groom + Nail Clip",
    area: "Asok",
    rating: 4.6,
    reviews: 43,
    original: 700,
    deal: 455,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 sm:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold text-[#002949] tracking-tight">
          PAWTAL
        </Link>

        <div className="hidden sm:flex items-center gap-8">
          {["Services", "Pricing", "FAQ"].map((item) => (
            <a key={item} href="#" className="text-sm font-medium text-[#6B7280] hover:text-[#002949] transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/vendor" className="hidden sm:inline text-sm font-semibold text-[#002949] hover:text-[#1AB0EB] transition-colors">
            For Business
          </Link>
          <Link
            href="/gateway"
            className="px-5 py-2 rounded-full bg-[#1AB0EB] text-white text-sm font-bold hover:bg-[#00508D] transition-colors shadow-[0_4px_14px_rgba(26,176,235,0.25)]"
          >
            Get Start
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 sm:px-12 pt-16 sm:pt-24 pb-8 text-center">
        <h1 className="text-[42px] sm:text-[68px] font-extrabold text-[#002949] leading-[1.1] mb-5">
          welcome to pawtal
        </h1>
        <p className="text-[#6B7280] text-base sm:text-lg max-w-[500px] mx-auto leading-relaxed mb-10">
          Discover off-peak deals on grooming, spa &amp; pet care near you —
          book in seconds, save up to 40%.
        </p>

        {/* Area pill + live badge */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] text-sm font-semibold text-[#002949] hover:border-[#1AB0EB] transition-colors">
            <span>📍</span>
            <span>Sukhumvit</span>
            <svg className="w-3 h-3 text-[#9CA3AF]" viewBox="0 0 12 8" fill="none">
              <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E6F6FD] text-[#1AB0EB] text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1AB0EB] animate-pulse inline-block" />
            {PREVIEW_DEALS.length} deals live
          </span>
        </div>
      </section>

      {/* ── Deal Cards ── */}
      <section className="px-6 sm:px-12 pb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PREVIEW_DEALS.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>

        {/* Explore CTA */}
        <div className="text-center mt-12">
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-[#1AB0EB] text-white text-sm font-bold hover:bg-[#00508D] transition-colors shadow-[0_6px_24px_rgba(26,176,235,0.30)]"
          >
            Explore
          </Link>
          <p className="text-xs text-[#9CA3AF] mt-3">No account needed to browse</p>
        </div>
      </section>

      {/* ── Why Pawtal ── */}
      <section className="bg-[#F9FAFB] border-t border-[#E5E7EB] px-6 sm:px-12 py-16">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <div className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#1AB0EB] mb-3">Why Pawtal</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002949]">
            Great pet care shouldn&apos;t cost full price
          </h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: "⚡", title: "Off-Peak Prices", desc: "Providers offer real discounts during quiet hours. You save — they earn." },
            { icon: "✅", title: "Verified Providers", desc: "Every groomer and salon is vetted. Transparent ratings and real reviews." },
            { icon: "📱", title: "Book in Seconds", desc: "Pick a slot, confirm your pet, pay upfront. No LINE, no waiting." },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-extrabold text-[#002949] mb-2">{f.title}</div>
              <div className="text-sm text-[#6B7280] leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Vendor CTA ── */}
      <section className="px-6 sm:px-12 py-16 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[2px] text-[#1AB0EB] mb-2">For Pet Service Providers</div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#002949] mb-2">
            Turn your empty slots into revenue
          </h3>
          <p className="text-sm text-[#6B7280] max-w-[400px]">
            Join groomers and salons in Bangkok already filling their off-peak hours with Pawtal.
          </p>
        </div>
        <Link
          href="/vendor"
          className="flex-shrink-0 px-8 py-3.5 rounded-full border-2 border-[#002949] text-[#002949] text-sm font-bold hover:bg-[#002949] hover:text-white transition-all"
        >
          List Your Business →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E5E7EB] px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-sm font-extrabold text-[#002949]">PAWTAL</span>
        <span className="text-xs text-[#9CA3AF]">© 2026 Pawtal · Sukhumvit, Bangkok</span>
        <div className="flex gap-5 text-xs text-[#6B7280]">
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a key={l} href="#" className="hover:text-[#002949] transition-colors">{l}</a>
          ))}
        </div>
      </footer>

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
        <span className="absolute top-3 right-3 bg-[#DC2626] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full">
          -{deal.discount}%
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="font-extrabold text-[#002949] text-sm mb-0.5 truncate">{deal.shop}</div>
        <div className="text-xs text-[#6B7280] mb-3 truncate">{deal.service}</div>

        <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-3">
          <span className="font-bold text-[#D97706]">★ {deal.rating}</span>
          <span className="text-[#9CA3AF]">({deal.reviews})</span>
          <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
          <span className="truncate">📍 {deal.area}</span>
        </div>

        <div className="flex items-end gap-2 mb-0.5">
          <span className="text-xs text-[#9CA3AF] line-through">฿{deal.original.toLocaleString()}</span>
          <span className="text-lg font-extrabold text-[#002949]">฿{deal.deal.toLocaleString()}</span>
        </div>
        <div className="text-[10px] font-bold text-[#16A34A] mb-4">Save ฿{save.toLocaleString()}</div>

        <button className="w-full py-2.5 rounded-xl bg-[#1AB0EB] text-white text-sm font-bold hover:bg-[#00508D] transition-colors">
          Book Now
        </button>
      </div>
    </div>
  );
}
