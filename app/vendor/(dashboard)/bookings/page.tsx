"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
type BookingStatus = "confirmed" | "in-progress" | "completed" | "cancelled" | "pending";

type Booking = {
  id: string; petName: string; avatarBg: string;
  owner: string; breed: string; hasHealth: boolean;
  service: string; serviceCategory: string; serviceColor: string; serviceBg: string;
  time: string; dur: string; amount: number; ref: string;
  scheduledAt: string; // ISO string for date filtering
  status: BookingStatus;
  customerId: string;
  pet: { age: string; weight: string; visits: number; lastSeen: string; notes?: string };
  customer: { name: string; phone: string; email: string };
};

type DbBooking = {
  id: string;
  booking_reference: string;
  scheduled_at: string;
  status: string;
  total_amount: number;
  pet_name: string | null;
  pet_notes: string | null;
  customer_id: string;
  customers: { id: string; first_name: string; last_name: string; phone: string | null } | null;
  pets: { name: string; breed: string | null; weight_kg: number | null; medical_notes: string | null } | null;
  services: { name: string; category: string; duration_min: number } | null;
};

type TableRow = { type: "group"; label: string } | { type: "row"; booking: Booking };

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; dot: string }> = {
  "confirmed":   { label:"Confirmed",   color:"#16a34a", dot:"#16a34a" },
  "in-progress": { label:"In Progress", color:"#17A8FF", dot:"#17A8FF" },
  "completed":   { label:"Completed",   color:"#64748b", dot:"#94a3b8" },
  "cancelled":   { label:"Cancelled",   color:"#dc2626", dot:"#ef4444" },
  "pending":     { label:"Pending",     color:"#d97706", dot:"#f59e0b" },
};

const DATE_PRESETS = [
  { key:"today",     label:"Today"      },
  { key:"yesterday", label:"Yesterday"  },
  { key:"week",      label:"This Week"  },
  { key:"month",     label:"This Month" },
  { key:"all",       label:"All Time"   },
];

const STATUS_TABS = ["All", "Confirmed", "In Progress", "Completed", "Cancelled"] as const;

const AVATAR_COLORS = ["#22c55e","#17A8FF","#F5A623","#8b5cf6","#f43f5e","#0B93E8","#003459"];
const colorFor = (i: number) => AVATAR_COLORS[i % AVATAR_COLORS.length];

const CATEGORY_STYLES: Record<string, { color: string; bg: string }> = {
  "Grooming":  { color:"#16a34a", bg:"#dcfce7" },
  "Day Care":  { color:"#0369a1", bg:"#e0f2fe" },
  "Training":  { color:"#b45309", bg:"#fef3c7" },
  "Boarding":  { color:"#6d28d9", bg:"#ede9fe" },
  "Vet":       { color:"#0369a1", bg:"#e0f2fe" },
};
const catStyle = (cat: string) => CATEGORY_STYLES[cat] ?? { color:"#5a8fa8", bg:"#f0f8ff" };

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtTime12(iso: string) {
  const d = new Date(iso);
  const h = d.getHours(), m = d.getMinutes();
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2,"0")}${h >= 12 ? "pm" : "am"}`;
}

function fmtDur(min: number) {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function dbToUiStatus(s: string): BookingStatus {
  if (s === "in_progress") return "in-progress";
  if (s === "new") return "pending";
  return s as BookingStatus;
}

function uiToDbStatus(s: BookingStatus): string {
  if (s === "in-progress") return "in_progress";
  return s;
}

function getDateRange(preset: string) {
  const now  = new Date();
  const tod  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day  = now.getDay();
  const mon  = new Date(tod); mon.setDate(tod.getDate() - (day === 0 ? 6 : day - 1));
  const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const mEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  if (preset === "today")     return { from: tod, to: new Date(tod.getTime() + 86400000) };
  if (preset === "yesterday") return { from: new Date(tod.getTime() - 86400000), to: tod };
  if (preset === "week")      return { from: mon, to: new Date(mon.getTime() + 7 * 86400000) };
  if (preset === "month")     return { from: mStart, to: mEnd };
  return { from: new Date(0), to: new Date(9999, 0, 1) };
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function mapDbToBooking(b: DbBooking, idx: number, allBookings: DbBooking[]): Booking {
  const svcStatus = dbToUiStatus(b.status);
  const cs = catStyle(b.services?.category ?? "");
  const petNameVal = b.pets?.name ?? b.pet_name ?? "Pet";
  const ownerFull  = b.customers ? `${b.customers.first_name} ${b.customers.last_name}` : "Customer";
  const ownerShort = b.customers ? `${b.customers.first_name} ${b.customers.last_name[0]}.` : "Customer";

  // Compute visits + lastSeen for this customer from all loaded bookings
  const custBks = allBookings
    .filter(x => x.customer_id === b.customer_id)
    .sort((a, c) => new Date(c.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
  const visits  = custBks.length;
  const pastBks = custBks.filter(x => x.id !== b.id && new Date(x.scheduled_at) < new Date());
  const lastSeen = pastBks[0]
    ? new Date(pastBks[0].scheduled_at).toLocaleDateString("en-GB", { day:"numeric", month:"short" })
    : "—";

  return {
    id:              b.id,
    petName:         petNameVal,
    avatarBg:        colorFor(idx),
    owner:           ownerShort,
    breed:           b.pets?.breed ?? "—",
    hasHealth:       !!(b.pets?.medical_notes || b.pet_notes),
    service:         b.services?.name ?? "Service",
    serviceCategory: b.services?.category ?? "",
    serviceColor:    cs.color,
    serviceBg:       cs.bg,
    time:            fmtTime12(b.scheduled_at),
    dur:             fmtDur(b.services?.duration_min ?? 60),
    amount:          b.total_amount ?? 0,
    ref:             b.booking_reference,
    scheduledAt:     b.scheduled_at,
    status:          svcStatus,
    customerId:      b.customer_id,
    pet: {
      age:      "—",
      weight:   b.pets?.weight_kg ? `${b.pets.weight_kg} kg` : "—",
      visits,
      lastSeen,
      notes:    b.pets?.medical_notes ?? b.pet_notes ?? undefined,
    },
    customer: {
      name:  ownerFull,
      phone: b.customers?.phone ?? "—",
      email: "—",
    },
  };
}

// ── Booking Detail View ───────────────────────────────────────────────────────
function BookingDetailView({ booking, onBack, onStatusChange }: {
  booking: Booking;
  onBack: () => void;
  onStatusChange: (id: string, s: BookingStatus) => void;
}) {
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const sc = STATUS_CONFIG[status];
  const timeStr = `${booking.ref} · ${booking.time} · ${booking.dur}`;

  const update = async (s: BookingStatus) => {
    setStatus(s);
    onStatusChange(booking.id, s);
    await supabase.from("bookings").update({ status: uiToDbStatus(s) }).eq("id", booking.id);
  };

  return (
    <main className="vd-main" style={{ overflow:"hidden" }}>
      <div className="bkd-page">
        <button className="bkd-back" onClick={onBack}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style={{ marginRight:6 }}>
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Bookings
        </button>

        <div className="bkd-header-card">
          <div style={{ display:"flex", alignItems:"center", gap:16, flex:1, minWidth:0 }}>
            <div className="bkd-header-avatar" style={{ background: booking.avatarBg }}>{booking.petName[0]}</div>
            <div style={{ minWidth:0 }}>
              <div className="bkd-header-title">{booking.petName} — {booking.service}</div>
              <div className="bkd-header-meta">
                <span className="bkd-status-pill" style={{ color:sc.color, background:`${sc.color}18` }}>{sc.label}</span>
                <span className="bkd-meta-dot" />
                <span className="bkd-meta-text">{timeStr}</span>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
            <span className="bkd-category-tag">{booking.serviceCategory}</span>
            <div className="bkd-header-price">฿{booking.amount.toLocaleString()}</div>
          </div>
        </div>

        <div className="bkd-body">
          <div className="bkd-main">
            {/* Booking Details */}
            <div className="bkd-panel">
              <div className="bkd-panel-title">Booking Details</div>
              <div className="bkd-row">
                <div className="bkd-row-icon">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <rect x="1" y="2" width="14" height="12" rx="2" stroke="#17A8FF" strokeWidth="1.4"/>
                    <path d="M5 1v2M11 1v2M1 6h14" stroke="#17A8FF" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="bkd-row-label">Date &amp; Time</div>
                  <div className="bkd-row-value">
                    {new Date(booking.scheduledAt).toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short" })} · {booking.time} · {booking.dur}
                  </div>
                </div>
              </div>
              <div className="bkd-row">
                <div className="bkd-row-icon">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <path d="M2 4h12M2 8h8M2 12h10" stroke="#17A8FF" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="bkd-row-label">Service</div>
                  <div className="bkd-row-value" style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {booking.service}
                    <span className="bkd-service-tag">{booking.serviceCategory}</span>
                  </div>
                </div>
              </div>
              <div className="bkd-row" style={{ borderBottom:"none" }}>
                <div className="bkd-row-icon">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <circle cx="8" cy="8" r="6" stroke="#17A8FF" strokeWidth="1.4"/>
                    <path d="M8 5v3l2 2" stroke="#17A8FF" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="bkd-row-label">Amount</div>
                  <div className="bkd-row-value bkd-amount">฿{booking.amount.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Pet Profile */}
            <div className="bkd-panel">
              <div className="bkd-panel-title">Pet Profile</div>
              <div className="bkd-pet-card">
                <div className="bkd-pet-identity">
                  <div className="bkd-pet-avatar" style={{ background: hexToRgba(booking.avatarBg, 0.18), color: booking.avatarBg }}>{booking.petName[0]}</div>
                  <div>
                    <div className="bkd-pet-name">{booking.petName}</div>
                    <div className="bkd-pet-breed">{booking.breed}</div>
                  </div>
                </div>
                <div className="bkd-pet-stats">
                  {([
                    { label:"Age",       val: booking.pet.age },
                    { label:"Weight",    val: booking.pet.weight },
                    { label:"Visits",    val: String(booking.pet.visits) },
                    { label:"Last Seen", val: booking.pet.lastSeen },
                  ] as { label:string; val:string }[]).map(s => (
                    <div key={s.label} className="bkd-pet-stat">
                      <div className="bkd-pet-stat-label">{s.label}</div>
                      <div className="bkd-pet-stat-val">{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
              {booking.pet.notes && (
                <div className="bkd-pet-note">
                  <svg viewBox="0 0 16 16" fill="none" width="13" height="13" style={{ flexShrink:0, marginTop:1 }}>
                    <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 7v4M8 5.5v.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {booking.pet.notes}
                </div>
              )}
            </div>

            {/* Customer */}
            <div className="bkd-panel">
              <div className="bkd-panel-title">Customer</div>
              <div className="bkd-cust-list">
                <div className="bkd-cust-row">
                  <div className="bkd-cust-icon">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <circle cx="8" cy="5" r="3" stroke="#17A8FF" strokeWidth="1.4"/>
                      <path d="M2 13c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="#17A8FF" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div><div className="bkd-cust-label">Name</div><div className="bkd-cust-value">{booking.customer.name}</div></div>
                </div>
                <div className="bkd-cust-row" style={{ borderBottom:"none" }}>
                  <div className="bkd-cust-icon">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <path d="M3 2h3l1.5 3.5L6 7a9 9 0 003 3l1.5-1.5L14 10v3a1 1 0 01-1 1A11 11 0 013 3a1 1 0 011-1z" stroke="#17A8FF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div><div className="bkd-cust-label">Phone</div><div className="bkd-cust-value bkd-cust-phone">{booking.customer.phone}</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions sidebar */}
          <div className="bkd-aside">
            <div className="bkd-panel">
              <div className="bkd-panel-title">Actions</div>
              {status === "confirmed" && (
                <button className="bkd-action-primary" onClick={() => update("in-progress")}>
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style={{ flexShrink:0 }}>
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Check in
                </button>
              )}
              {status === "pending" && (
                <button className="bkd-action-primary" onClick={() => update("confirmed")}>
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style={{ flexShrink:0 }}>
                    <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Confirm booking
                </button>
              )}
              {status === "in-progress" && (
                <button className="bkd-action-primary" style={{ background:"#22c55e" }} onClick={() => update("completed")}>
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style={{ flexShrink:0 }}>
                    <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Mark complete
                </button>
              )}
              {status === "completed" && (
                <div className="bkd-action-done">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style={{ flexShrink:0 }}>
                    <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Completed
                </div>
              )}
              {status !== "cancelled" && status !== "completed" && (
                <button className="bkd-action-danger" onClick={() => update("cancelled")}>Cancel booking</button>
              )}
              {status === "cancelled" && (
                <div className="bkd-action-cancelled">Booking cancelled</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Action dropdown ───────────────────────────────────────────────────────────
function ActionDropdown({ booking, onStatusChange }: {
  booking: Booking;
  onStatusChange: (id: string, s: BookingStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  if (booking.status === "completed") return <span style={{ fontSize:11, color:"var(--muted)" }}>—</span>;
  if (booking.status === "cancelled") return <span style={{ fontSize:11, color:"#dc2626" }}>Cancelled</span>;

  return (
    <div className="bk-action-wrap" ref={ref}>
      <button className="bk-action-btn" onClick={() => setOpen(o => !o)}>
        Actions
        <svg viewBox="0 0 10 6" fill="none" width="9" height="9" style={{ transition:"transform 0.15s", transform: open ? "rotate(180deg)" : undefined }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className={`bk-action-dropdown${open ? " open" : ""}`}>
        {booking.status === "confirmed" && (
          <button className="bk-action-dropdown-item" onClick={() => { onStatusChange(booking.id, "in-progress"); setOpen(false); }}>
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13" style={{ color:"var(--blue)" }}>
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Check in
          </button>
        )}
        {booking.status === "in-progress" && (
          <button className="bk-action-dropdown-item" onClick={() => { onStatusChange(booking.id, "completed"); setOpen(false); }}>
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13" style={{ color:"#16a34a" }}>
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Mark complete
          </button>
        )}
        <div className="bk-action-dropdown-divider" />
        <button className="bk-action-dropdown-item danger" onClick={() => { onStatusChange(booking.id, "cancelled"); setOpen(false); }}>
          <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Cancel booking
        </button>
      </div>
    </div>
  );
}

// ── Demo mode ─────────────────────────────────────────────────────────────────
const DEMO_MODE = true;

const MOCK_DB_BOOKINGS: DbBooking[] = [
  { id:"mk01", booking_reference:"BK-202604-2341", scheduled_at:"2026-04-15T02:00:00Z", status:"completed",   total_amount:900, pet_name:null, pet_notes:null, customer_id:"c0000001-0000-4000-8000-000000000001", customers:{id:"c0000001-0000-4000-8000-000000000001", first_name:"Mintra",   last_name:"Saelim",    phone:"081-234-5678"}, pets:{name:"Butter", breed:"Poodle",           weight_kg:4.2, medical_notes:null}, services:{name:"Full Grooming Package", category:"Grooming", duration_min:120} },
  { id:"mk02", booking_reference:"BK-202604-2342", scheduled_at:"2026-04-15T03:30:00Z", status:"in_progress", total_amount:450, pet_name:null, pet_notes:null, customer_id:"c0000002-0000-4000-8000-000000000002", customers:{id:"c0000002-0000-4000-8000-000000000002", first_name:"Warat",    last_name:"Chaiwong",  phone:"082-345-6789"}, pets:{name:"Mochi",  breed:"Shih Tzu",         weight_kg:3.8, medical_notes:null}, services:{name:"Bath & Brush",          category:"Grooming", duration_min:60}  },
  { id:"mk03", booking_reference:"BK-202604-2343", scheduled_at:"2026-04-15T06:00:00Z", status:"confirmed",   total_amount:650, pet_name:null, pet_notes:null, customer_id:"c0000003-0000-4000-8000-000000000003", customers:{id:"c0000003-0000-4000-8000-000000000003", first_name:"Anchana",  last_name:"Pimjai",    phone:"083-456-7890"}, pets:{name:"Nala",   breed:"Persian",          weight_kg:3.2, medical_notes:null}, services:{name:"Cat Grooming",          category:"Grooming", duration_min:90}  },
  { id:"mk04", booking_reference:"BK-202604-2344", scheduled_at:"2026-04-15T07:30:00Z", status:"confirmed",   total_amount:900, pet_name:null, pet_notes:null, customer_id:"c0000004-0000-4000-8000-000000000004", customers:{id:"c0000004-0000-4000-8000-000000000004", first_name:"Prapai",   last_name:"Thaweesap", phone:"084-567-8901"}, pets:{name:"Max",    breed:"Golden Retriever", weight_kg:28,  medical_notes:null}, services:{name:"Full Grooming Package", category:"Grooming", duration_min:120} },
  { id:"mk05", booking_reference:"BK-202604-2345", scheduled_at:"2026-04-15T09:00:00Z", status:"confirmed",   total_amount:250, pet_name:null, pet_notes:null, customer_id:"c0000005-0000-4000-8000-000000000005", customers:{id:"c0000005-0000-4000-8000-000000000005", first_name:"Natthida", last_name:"Phongsri",  phone:"085-678-9012"}, pets:{name:"Coco",   breed:"French Bulldog",   weight_kg:9,   medical_notes:null}, services:{name:"Nail Trim & Ear Clean", category:"Grooming", duration_min:30}  },
  { id:"mk06", booking_reference:"BK-202604-2338", scheduled_at:"2026-04-14T02:00:00Z", status:"completed",   total_amount:900, pet_name:null, pet_notes:null, customer_id:"c0000002-0000-4000-8000-000000000002", customers:{id:"c0000002-0000-4000-8000-000000000002", first_name:"Warat",    last_name:"Chaiwong",  phone:"082-345-6789"}, pets:{name:"Mochi",  breed:"Shih Tzu",         weight_kg:3.8, medical_notes:null}, services:{name:"Full Grooming Package", category:"Grooming", duration_min:120} },
  { id:"mk07", booking_reference:"BK-202604-2339", scheduled_at:"2026-04-14T04:00:00Z", status:"completed",   total_amount:650, pet_name:null, pet_notes:null, customer_id:"c0000003-0000-4000-8000-000000000003", customers:{id:"c0000003-0000-4000-8000-000000000003", first_name:"Anchana",  last_name:"Pimjai",    phone:"083-456-7890"}, pets:{name:"Nala",   breed:"Persian",          weight_kg:3.2, medical_notes:null}, services:{name:"Cat Grooming",          category:"Grooming", duration_min:90}  },
  { id:"mk08", booking_reference:"BK-202604-2340", scheduled_at:"2026-04-14T07:00:00Z", status:"completed",   total_amount:650, pet_name:null, pet_notes:null, customer_id:"c0000006-0000-4000-8000-000000000006", customers:{id:"c0000006-0000-4000-8000-000000000006", first_name:"Suda",     last_name:"Chomchan",  phone:"086-789-0123"}, pets:{name:"Luna",   breed:"Ragdoll",          weight_kg:5.1, medical_notes:null}, services:{name:"Cat Grooming",          category:"Grooming", duration_min:90}  },
  { id:"mk09", booking_reference:"BK-202604-2335", scheduled_at:"2026-04-13T02:00:00Z", status:"completed",   total_amount:450, pet_name:null, pet_notes:null, customer_id:"c0000001-0000-4000-8000-000000000001", customers:{id:"c0000001-0000-4000-8000-000000000001", first_name:"Mintra",   last_name:"Saelim",    phone:"081-234-5678"}, pets:{name:"Butter", breed:"Poodle",           weight_kg:4.2, medical_notes:null}, services:{name:"Bath & Brush",          category:"Grooming", duration_min:60}  },
  { id:"mk10", booking_reference:"BK-202604-2336", scheduled_at:"2026-04-13T04:00:00Z", status:"completed",   total_amount:900, pet_name:null, pet_notes:null, customer_id:"c0000004-0000-4000-8000-000000000004", customers:{id:"c0000004-0000-4000-8000-000000000004", first_name:"Prapai",   last_name:"Thaweesap", phone:"084-567-8901"}, pets:{name:"Max",    breed:"Golden Retriever", weight_kg:28,  medical_notes:null}, services:{name:"Full Grooming Package", category:"Grooming", duration_min:120} },
  { id:"mk11", booking_reference:"BK-202604-2337", scheduled_at:"2026-04-13T07:00:00Z", status:"completed",   total_amount:450, pet_name:null, pet_notes:null, customer_id:"c0000005-0000-4000-8000-000000000005", customers:{id:"c0000005-0000-4000-8000-000000000005", first_name:"Natthida", last_name:"Phongsri",  phone:"085-678-9012"}, pets:{name:"Coco",   breed:"French Bulldog",   weight_kg:9,   medical_notes:null}, services:{name:"Bath & Brush",          category:"Grooming", duration_min:60}  },
  { id:"mk12", booking_reference:"BK-202604-2346", scheduled_at:"2026-04-16T04:00:00Z", status:"confirmed",   total_amount:450, pet_name:null, pet_notes:null, customer_id:"c0000001-0000-4000-8000-000000000001", customers:{id:"c0000001-0000-4000-8000-000000000001", first_name:"Mintra",   last_name:"Saelim",    phone:"081-234-5678"}, pets:{name:"Butter", breed:"Poodle",           weight_kg:4.2, medical_notes:null}, services:{name:"Bath & Brush",          category:"Grooming", duration_min:60}  },
  { id:"mk13", booking_reference:"BK-202604-2347", scheduled_at:"2026-04-16T09:30:00Z", status:"confirmed",   total_amount:250, pet_name:null, pet_notes:null, customer_id:"c0000003-0000-4000-8000-000000000003", customers:{id:"c0000003-0000-4000-8000-000000000003", first_name:"Anchana",  last_name:"Pimjai",    phone:"083-456-7890"}, pets:{name:"Nala",   breed:"Persian",          weight_kg:3.2, medical_notes:null}, services:{name:"Nail Trim & Ear Clean", category:"Grooming", duration_min:30}  },
  { id:"mk14", booking_reference:"BK-202604-2348", scheduled_at:"2026-04-17T02:00:00Z", status:"confirmed",   total_amount:900, pet_name:null, pet_notes:null, customer_id:"c0000002-0000-4000-8000-000000000002", customers:{id:"c0000002-0000-4000-8000-000000000002", first_name:"Warat",    last_name:"Chaiwong",  phone:"082-345-6789"}, pets:{name:"Mochi",  breed:"Shih Tzu",         weight_kg:3.8, medical_notes:null}, services:{name:"Full Grooming Package", category:"Grooming", duration_min:120} },
  { id:"mk15", booking_reference:"BK-202604-2349", scheduled_at:"2026-04-18T02:00:00Z", status:"confirmed",   total_amount:350, pet_name:null, pet_notes:null, customer_id:"c0000004-0000-4000-8000-000000000004", customers:{id:"c0000004-0000-4000-8000-000000000004", first_name:"Prapai",   last_name:"Thaweesap", phone:"084-567-8901"}, pets:{name:"Max",    breed:"Golden Retriever", weight_kg:28,  medical_notes:null}, services:{name:"Full Day Care",         category:"Day Care", duration_min:480} },
  { id:"mk16", booking_reference:"BK-202604-2350", scheduled_at:"2026-04-18T03:00:00Z", status:"confirmed",   total_amount:650, pet_name:null, pet_notes:null, customer_id:"c0000003-0000-4000-8000-000000000003", customers:{id:"c0000003-0000-4000-8000-000000000003", first_name:"Anchana",  last_name:"Pimjai",    phone:"083-456-7890"}, pets:{name:"Nala",   breed:"Persian",          weight_kg:3.2, medical_notes:null}, services:{name:"Cat Grooming",          category:"Grooming", duration_min:90}  },
  { id:"mk17", booking_reference:"BK-202604-2351", scheduled_at:"2026-04-18T06:00:00Z", status:"confirmed",   total_amount:900, pet_name:null, pet_notes:null, customer_id:"c0000001-0000-4000-8000-000000000001", customers:{id:"c0000001-0000-4000-8000-000000000001", first_name:"Mintra",   last_name:"Saelim",    phone:"081-234-5678"}, pets:{name:"Butter", breed:"Poodle",           weight_kg:4.2, medical_notes:null}, services:{name:"Full Grooming Package", category:"Grooming", duration_min:120} },
  { id:"mk18", booking_reference:"BK-202604-2320", scheduled_at:"2026-04-11T04:00:00Z", status:"cancelled",   total_amount:900, pet_name:null, pet_notes:null, customer_id:"c0000006-0000-4000-8000-000000000006", customers:{id:"c0000006-0000-4000-8000-000000000006", first_name:"Suda",     last_name:"Chomchan",  phone:"086-789-0123"}, pets:{name:"Luna",   breed:"Ragdoll",          weight_kg:5.1, medical_notes:null}, services:{name:"Full Grooming Package", category:"Grooming", duration_min:120} },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [statusTab,  setStatusTab]  = useState<string>("All");
  const [datePreset, setDatePreset] = useState("today");
  const [drOpen,     setDrOpen]     = useState(false);
  const [search,     setSearch]     = useState("");
  const [statuses,   setStatuses]   = useState<Record<string, BookingStatus>>({});
  const [selected,   setSelected]   = useState<Booking | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [rawBookings, setRawBookings] = useState<DbBooking[]>([]);
  const drRef = useRef<HTMLDivElement>(null);

  // ── Load from Supabase ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      if (DEMO_MODE) {
        setRawBookings(MOCK_DB_BOOKINGS); setLoading(false); return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: prov } = await supabase.from("providers").select("id").eq("user_id", user.id).single();
      if (!prov) { setLoading(false); return; }

      const { data: bks } = await supabase
        .from("bookings")
        .select(`
          id, booking_reference, scheduled_at, status, total_amount, pet_name, pet_notes, customer_id,
          customers(id, first_name, last_name, phone),
          pets(name, breed, weight_kg, medical_notes),
          services(name, category, duration_min)
        `)
        .eq("provider_id", prov.id)
        .order("scheduled_at", { ascending: false });

      if (bks) setRawBookings(bks as unknown as DbBooking[]);
      setLoading(false);
    })();
  }, []);

  const bookings: Booking[] = useMemo(
    () => rawBookings.map((b, i) => mapDbToBooking(b, i, rawBookings)),
    [rawBookings]
  );

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (drRef.current && !drRef.current.contains(e.target as Node)) setDrOpen(false);
    };
    if (drOpen) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [drOpen]);

  const getStatus = (b: Booking): BookingStatus => statuses[b.id] ?? b.status;

  const handleStatusChange = async (id: string, s: BookingStatus) => {
    setStatuses(prev => ({ ...prev, [id]: s }));
    await supabase.from("bookings").update({ status: uiToDbStatus(s) }).eq("id", id);
  };

  const dateFiltered = useMemo(() => {
    const { from, to } = getDateRange(datePreset);
    return bookings.filter(b => {
      const d = new Date(b.scheduledAt);
      return d >= from && d < to;
    });
  }, [bookings, datePreset]);

  const filtered = useMemo(() => {
    return dateFiltered.filter(b => {
      const status = getStatus(b);
      const matchStatus =
        statusTab === "All"         ? true :
        statusTab === "Confirmed"   ? status === "confirmed" :
        statusTab === "In Progress" ? status === "in-progress" :
        statusTab === "Completed"   ? status === "completed" :
        statusTab === "Cancelled"   ? status === "cancelled" : true;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        b.petName.toLowerCase().includes(q) ||
        b.owner.toLowerCase().includes(q) ||
        b.service.toLowerCase().includes(q) ||
        b.ref.toLowerCase().includes(q) ||
        b.breed.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFiltered, statusTab, search, statuses]);

  const counts = useMemo(() => ({
    "All":         dateFiltered.length,
    "Confirmed":   dateFiltered.filter(b => getStatus(b) === "confirmed").length,
    "In Progress": dateFiltered.filter(b => getStatus(b) === "in-progress").length,
    "Completed":   dateFiltered.filter(b => getStatus(b) === "completed").length,
    "Cancelled":   dateFiltered.filter(b => getStatus(b) === "cancelled").length,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [dateFiltered, statuses]);

  const tableRows = useMemo<TableRow[]>(() => {
    return filtered.map(b => ({ type:"row" as const, booking:b }));
  }, [filtered]);

  const dateLabel = DATE_PRESETS.find(p => p.key === datePreset)?.label ?? "Today";

  if (selected) {
    return (
      <BookingDetailView
        booking={{ ...selected, status: getStatus(selected) }}
        onBack={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    );
  }

  return (
    <main className="vd-main" style={{ overflow:"hidden" }}>
      <div className="vd-content">

        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:20, fontWeight:700, color:"var(--text)", letterSpacing:"-0.5px" }}>Bookings · {dateLabel}</div>
          <div style={{ fontSize:12, color:"var(--muted)", fontWeight:300, marginTop:2 }}>
            {loading ? "Loading…" : `${filtered.length} appointment${filtered.length !== 1 ? "s" : ""} in range`}
          </div>
        </div>

        {/* Tab row + date picker */}
        <div className="bk-tabrow">
          <div className="bk-tabs">
            {STATUS_TABS.map(tab => (
              <button key={tab} className={`bk-tab${statusTab === tab ? " active" : ""}`} onClick={() => setStatusTab(tab)}>
                {tab}
                <span className="bk-tab-count">{counts[tab]}</span>
              </button>
            ))}
          </div>
          <div className="bk-date-select-wrap" ref={drRef}>
            <button className={`bk-dr-trigger${drOpen ? " open" : ""}`} onClick={() => setDrOpen(o => !o)}>
              <svg viewBox="0 0 16 16" fill="none" width="13" height="13" style={{ color:"var(--blue)" }}>
                <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M5 1v2M11 1v2M1 6h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {dateLabel}
              <svg viewBox="0 0 10 6" fill="none" width="9" height="9" className="bk-dr-chevron">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={`bk-dr-popover${drOpen ? " open" : ""}`} style={{ minWidth:160 }}>
              <div className="bk-dr-presets" style={{ width:"100%", borderRight:"none" }}>
                {DATE_PRESETS.map(p => (
                  <button key={p.key} className={`bk-dr-preset${datePreset === p.key ? " active" : ""}`}
                    onClick={() => { setDatePreset(p.key); setDrOpen(false); }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bk-toolbar">
          <div className="bk-search-wrap">
            <svg className="bk-search-icon" viewBox="0 0 24 24" fill="none" stroke="#9ec9e0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" className="bk-search" placeholder="Search pet, owner or ref…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="bk-toolbar-right">
            <button className="bk-export-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bk-table-wrap">
          <table className="bk-table">
            <thead>
              <tr>
                <th>Pet</th><th>Owner</th><th>Breed</th><th>Health</th>
                <th>Service</th><th>Time</th><th>Amount</th><th>Ref</th><th>Status</th>
                <th style={{ textAlign:"center" }}>Action</th>
                <th style={{ textAlign:"center" }}>View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} style={{ textAlign:"center", padding:"48px 24px", color:"var(--muted)", fontSize:13 }}>Loading bookings…</td></tr>
              ) : tableRows.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign:"center", padding:"48px 24px", color:"var(--muted)", fontSize:13 }}>No bookings found.</td></tr>
              ) : tableRows.map((row) => {
                if (row.type === "group") return null;
                const b = row.booking;
                const status = getStatus(b);
                const sc = STATUS_CONFIG[status];
                return (
                  <tr key={b.id} className={status === "in-progress" ? "bk-in-progress" : ""}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div className="bk-avatar-sm" style={{ background:b.avatarBg, color:"#fff" }}>{b.petName[0]}</div>
                        <span className="bk-pet-name">{b.petName}</span>
                      </div>
                    </td>
                    <td className="bk-owner-name">{b.owner}</td>
                    <td style={{ fontSize:12, color:"var(--hint)", fontWeight:300 }}>{b.breed}</td>
                    <td>
                      {b.hasHealth && (
                        <span className="bk-health-badge">
                          <svg viewBox="0 0 16 16" fill="none" width="11" height="11">
                            <path d="M8 2L2 13h12L8 2z" stroke="#d97706" strokeWidth="1.4" strokeLinejoin="round"/>
                            <path d="M8 7v3M8 11.5v.5" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round"/>
                          </svg>
                          Health note
                        </span>
                      )}
                    </td>
                    <td><span className="bk-svc-tag" style={{ color:b.serviceColor, background:b.serviceBg }}>{b.service}</span></td>
                    <td>
                      <div className="bk-time-main">{b.time}</div>
                      <div className="bk-time-dur">{b.dur}</div>
                    </td>
                    <td className="bk-amount">฿{b.amount.toLocaleString()}</td>
                    <td className="bk-ref">{b.ref}</td>
                    <td>
                      <span className="bk-status-chip" style={{ color:sc.color, background:`${sc.color}18` }}>
                        <span className="bk-status-dot" style={{ background:sc.dot }} />
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ textAlign:"center" }}>
                      <ActionDropdown booking={{ ...b, status }} onStatusChange={handleStatusChange} />
                    </td>
                    <td style={{ textAlign:"center" }}>
                      <button className="bk-action-btn view" onClick={() => setSelected(b)}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
