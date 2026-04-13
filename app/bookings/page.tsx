"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import CustomerNav from "@/components/CustomerNav";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LanguageContext";

const EN = {
  title: "My Bookings", subtitle: "All your pet care transactions.",
  search: "Search services or pets...", status: "Status", all: "All",
  confirmed: "Confirmed", pending: "Pending", completed: "Completed", cancelled: "Cancelled",
  pet: "Pet", dateRange: "Date Range",
  colShop: "AT SHOP", colService: "SERVICE", colDate: "DATE & TIME",
  colPrice: "PRICE", colStatus: "STATUS", colAction: "ACTION",
  view: "View", loading: "Loading bookings…",
  noBookings: "No bookings yet. Book your first deal!", noResults: "No bookings match your filters.",
};
const TH = {
  title: "การจองของฉัน", subtitle: "ธุรกรรมการดูแลสัตว์เลี้ยงทั้งหมดของคุณ",
  search: "ค้นหาบริการหรือสัตว์เลี้ยง...", status: "สถานะ", all: "ทั้งหมด",
  confirmed: "ยืนยันแล้ว", pending: "รอดำเนินการ", completed: "เสร็จสิ้น", cancelled: "ยกเลิก",
  pet: "สัตว์เลี้ยง", dateRange: "ช่วงวันที่",
  colShop: "ที่ร้าน", colService: "บริการ", colDate: "วันและเวลา",
  colPrice: "ราคา", colStatus: "สถานะ", colAction: "การกระทำ",
  view: "ดู", loading: "กำลังโหลดการจอง…",
  noBookings: "ยังไม่มีการจอง จองดีลแรกของคุณเลย!", noResults: "ไม่พบการจองที่ตรงกับตัวกรอง",
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Booking {
  id:        string;
  ref:       string;
  shop:      string;
  shopInit:  string;
  shopBg:    string;
  service:   string;
  pet:       string;
  date:      string;
  time:      string;
  price:     number;
  status:    string;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed:   "mybk-badge-confirmed",
  pending:     "mybk-badge-pending",
  cancelled:   "mybk-badge-cancelled",
  completed:   "mybk-badge-confirmed",
  in_progress: "mybk-badge-pending",
  new:         "mybk-badge-pending",
  no_show:     "mybk-badge-cancelled",
};

function shopColor(name: string) {
  const colors = ["#17A8FF","#f59e0b","#8b5cf6","#10b981","#ef4444","#f97316"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function ServiceIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#17A8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
  );
}

function formatScheduledAt(raw: string) {
  const d = new Date(raw);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const date = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  let h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const time = `${h}:${String(m).padStart(2,"0")} ${ampm}`;
  return { date, time };
}

export default function MyBookingsPage() {
  const [lang] = useLang();
  const T = lang === "en" ? EN : TH;
  const [bookings,      setBookings]      = useState<Booking[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [petFilter,     setPetFilter]     = useState("all");
  const [showStatusDd,  setShowStatusDd]  = useState(false);
  const [showPetDd,     setShowPetDd]     = useState(false);

  // ── Fetch from Supabase ──────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!customer) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id, booking_reference, status, scheduled_at, total_amount, pet_name,
          providers ( business_name ),
          off_peak_slots ( service_name )
        `)
        .eq("customer_id", customer.id)
        .order("scheduled_at", { ascending: false });

      if (error || !data) { setLoading(false); return; }

      const mapped: Booking[] = data.map((b: any) => {
        const shop    = b.providers?.business_name ?? "Unknown Shop";
        const service = b.off_peak_slots?.service_name ?? "Service";
        const pet     = b.pet_name ?? "—";
        const { date, time } = formatScheduledAt(b.scheduled_at);
        return {
          id:       b.id,
          ref:      b.booking_reference ?? b.id,
          shop,
          shopInit: shop.charAt(0).toUpperCase(),
          shopBg:   shopColor(shop),
          service,
          pet,
          date,
          time,
          price:  Number(b.total_amount),
          status: b.status ?? "pending",
        };
      });

      setBookings(mapped);
      setLoading(false);
    })();
  }, []);

  const pets = [...new Set(bookings.map(b => b.pet))].filter(p => p !== "—");

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (petFilter !== "all" && b.pet.toLowerCase() !== petFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!b.shop.toLowerCase().includes(q) && !b.service.toLowerCase().includes(q) && !b.pet.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [bookings, search, statusFilter, petFilter]);

  return (
    <div className="mybk-page">
      <CustomerNav />

      <div className="mybk-container">

        {/* Header */}
        <div className="mybk-header">
          <div>
            <h1 className="mybk-title">{T.title}</h1>
            <p className="mybk-subtitle">{T.subtitle}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mybk-filters">
          <div className="mybk-search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="mybk-search"
              placeholder={T.search}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <div className="mybk-filter-dd-wrap" style={{ position: "relative" }}>
            <button className="mybk-filter-btn" onClick={() => { setShowStatusDd(v => !v); setShowPetDd(false); }}>
              {T.status}: {statusFilter === "all" ? T.all : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showStatusDd && (
              <div className="mybk-dd">
                {(["all","confirmed","pending","completed","cancelled"] as const).map(s => (
                  <button key={s} className={`mybk-dd-item${statusFilter === s ? " selected" : ""}`}
                    onClick={() => { setStatusFilter(s); setShowStatusDd(false); }}>
                    {s === "all" ? T.all : s === "confirmed" ? T.confirmed : s === "pending" ? T.pending : s === "completed" ? T.completed : T.cancelled}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pet filter */}
          <div className="mybk-filter-dd-wrap" style={{ position: "relative" }}>
            <button className="mybk-filter-btn" onClick={() => { setShowPetDd(v => !v); setShowStatusDd(false); }}>
              {T.pet}: {petFilter === "all" ? T.all : petFilter.charAt(0).toUpperCase() + petFilter.slice(1)}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showPetDd && (
              <div className="mybk-dd">
                <button className={`mybk-dd-item${petFilter === "all" ? " selected" : ""}`}
                  onClick={() => { setPetFilter("all"); setShowPetDd(false); }}>{T.all}</button>
                {pets.map(p => (
                  <button key={p} className={`mybk-dd-item${petFilter === p.toLowerCase() ? " selected" : ""}`}
                    onClick={() => { setPetFilter(p.toLowerCase()); setShowPetDd(false); }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="mybk-filter-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {T.dateRange}
          </button>
        </div>

        {/* Table */}
        <div className="mybk-table-card">
          {loading ? (
            <div className="mybk-empty">{T.loading}</div>
          ) : filtered.length === 0 ? (
            <div className="mybk-empty">
              {bookings.length === 0 ? T.noBookings : T.noResults}
            </div>
          ) : (
            <table className="mybk-table">
              <thead>
                <tr>
                  <th>{T.colShop}</th>
                  <th>{T.colService}</th>
                  <th>{T.colDate}</th>
                  <th>{T.colPrice}</th>
                  <th>{T.colStatus}</th>
                  <th>{T.colAction}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div className="mybk-shop-cell">
                        <div className="mybk-shop-avatar" style={{ background: b.shopBg }}>{b.shopInit}</div>
                        <span className="mybk-shop-name">{b.shop}</span>
                      </div>
                    </td>
                    <td>
                      <div className="mybk-service-cell">
                        <ServiceIcon />
                        <span className="mybk-service-name">{b.service}</span>
                        {b.pet !== "—" && <span className="mybk-service-pet">({b.pet})</span>}
                      </div>
                    </td>
                    <td>
                      <div className="mybk-date-val">{b.date}</div>
                      <div className="mybk-time-val">{b.time}</div>
                    </td>
                    <td className="mybk-price">฿{b.price.toLocaleString()}</td>
                    <td>
                      <span className={`mybk-badge ${STATUS_COLORS[b.status] ?? "mybk-badge-pending"}`}>
                        {b.status.replace(/_/g," ").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <Link href={`/bookings/${b.ref}`} className="mybk-view-btn">{T.view}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
