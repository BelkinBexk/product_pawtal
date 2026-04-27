"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  "confirmed":   { label:"Confirmed",  color:"#17A8FF", dot:"#17A8FF" },
  "in-progress": { label:"Checked-in", color:"#003459", dot:"#003459" },
  "completed":   { label:"Completed",  color:"#10B981", dot:"#10B981" },
  "cancelled":   { label:"Cancelled",  color:"#ef4444", dot:"#ef4444" },
  "pending":     { label:"Pending",     color:"#d97706", dot:"#f59e0b" },
};

const STATUS_OPTIONS = ["All", "Confirmed", "Checked-in", "Completed", "Cancelled"] as const;

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS    = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function StatusSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
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

  return (
    <div className="ss-wrap" ref={ref}>
      <button
        className={`ss-trigger${open ? " open" : ""}`}
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <span className="ss-value">{value}</span>
        <svg viewBox="0 0 10 6" fill="none" width="9" height="9" style={{ flexShrink:0, transition:"transform 0.15s", transform: open ? "rotate(180deg)" : undefined }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="ss-popover">
          {options.map(o => (
            <button
              key={o}
              className={`ss-option${o === value ? " selected" : ""}`}
              onClick={() => { onChange(o); setOpen(false); }}
              type="button"
            >
              {o === value && (
                <svg viewBox="0 0 12 12" fill="none" width="11" height="11" style={{ flexShrink:0, color:"var(--blue)" }}>
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {o !== value && <span style={{ width:11, flexShrink:0 }} />}
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DatePickerField({ value, onChange, min, max }: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
}) {
  const [open, setOpen]           = useState(false);
  const ref                       = useRef<HTMLDivElement>(null);
  const selected                  = value ? new Date(value + "T00:00:00") : null;
  const [viewYear,  setViewYear]  = useState(() => selected ? selected.getFullYear()  : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selected ? selected.getMonth()     : new Date().getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const firstDow      = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth   = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev    = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { date: Date; outside: boolean }[] = [];
  for (let i = firstDow - 1; i >= 0; i--)
    cells.push({ date: new Date(viewYear, viewMonth - 1, daysInPrev - i), outside: true });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(viewYear, viewMonth, d), outside: false });
  let next = 1;
  while (cells.length % 7 !== 0)
    cells.push({ date: new Date(viewYear, viewMonth + 1, next++), outside: true });

  const prevMonth = () => viewMonth === 0  ? (setViewMonth(11), setViewYear(y => y-1)) : setViewMonth(m => m-1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y+1)) : setViewMonth(m => m+1);

  const disabled = (d: Date) => (min && toISO(d) < min) || (max && toISO(d) > max) || false;

  const displayVal = selected
    ? selected.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
    : "Select date";

  return (
    <div className="dp-wrap" ref={ref}>
      <div className={`bk-date-field dp-trigger${open ? " focused" : ""}`} onClick={() => setOpen(o => !o)}>
        <span className={selected ? "dp-value" : "dp-placeholder"}>{displayVal}</span>
        <svg viewBox="0 0 16 16" fill="none" width="13" height="13" style={{ color:"var(--blue)", flexShrink:0, marginLeft:6 }}>
          <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M5 1v2M11 1v2M1 6h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </div>

      {open && (
        <div className="dp-popover">
          <div className="dp-header">
            <button className="dp-nav-btn" onClick={prevMonth}>‹</button>
            <span className="dp-month-year">{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button className="dp-nav-btn" onClick={nextMonth}>›</button>
          </div>
          <div className="dp-weekdays">
            {WEEKDAYS.map(d => <span key={d} className="dp-weekday">{d}</span>)}
          </div>
          <div className="dp-grid">
            {cells.map((cell, i) => {
              const iso  = toISO(cell.date);
              const isSel   = iso === value;
              const isTod   = iso === todayISO();
              const isDisab = disabled(cell.date);
              return (
                <button
                  key={i}
                  className={[
                    "dp-day",
                    cell.outside ? "outside" : "",
                    isSel        ? "selected" : "",
                    isTod && !isSel ? "today" : "",
                    isDisab      ? "disabled" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => { if (!isDisab) { onChange(iso); setOpen(false); } }}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [pos,  setPos]  = useState({ top: 0, left: 0 });
  const dropRef         = useRef<HTMLDivElement>(null);
  const btnRef          = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        btnRef.current  && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.right - 160 });
    }
    setOpen(o => !o);
  };

  if (booking.status === "completed") return <span style={{ fontSize:11, color:"var(--muted)" }}>—</span>;
  if (booking.status === "cancelled") return <span style={{ fontSize:11, color:"#dc2626" }}>Cancelled</span>;

  return (
    <>
      <button ref={btnRef} className="bk-action-btn" onClick={handleOpen}>
        Actions
        <svg viewBox="0 0 10 6" fill="none" width="9" height="9" style={{ transition:"transform 0.15s", transform: open ? "rotate(180deg)" : undefined }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div ref={dropRef} className="bk-action-dropdown open"
          style={{ position:"fixed", top:pos.top, left:pos.left, zIndex:1000 }}>
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
      )}
    </>
  );
}

// ── New Booking Page ──────────────────────────────────────────────────────────

type BookingService = {
  id:             string;
  name:           string;
  category:       string;
  duration_min:   number;
  base_price:     number;
  varies_by_size: boolean;
};

const CAT_DOT_COLORS: Record<string, string> = {
  "Grooming":    "#17A8FF",
  "Bath & Trim": "#0B93E8",
  "Day Care":    "#22c55e",
  "Training":    "#F5A623",
  "Boarding":    "#8b5cf6",
};

const CAT_EMOJI: Record<string, string> = {
  "Grooming": "✂️", "Bath & Trim": "🛁", "Day Care": "🏡", "Training": "🐾", "Boarding": "🏨",
};

const TIME_SLOTS: { value: string; label: string }[] = (() => {
  const slots: { value: string; label: string }[] = [];
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 20 && m > 0) break;
      const value = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
      const h12   = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm  = h >= 12 ? "PM" : "AM";
      slots.push({ value, label: `${h12}:${String(m).padStart(2,"0")} ${ampm}` });
    }
  }
  return slots;
})();

function generateBookingRef(): string {
  const now = new Date();
  const y   = now.getFullYear();
  const mo  = String(now.getMonth() + 1).padStart(2, "0");
  const n   = String(Math.floor(2500 + Math.random() * 1000));
  return `BK-${y}${mo}-${n}`;
}

type NewBookingForm = {
  serviceId:     string;
  date:          string;
  time:          string;
  customerName:  string;
  customerPhone: string;
  petName:       string;
  breed:         string;
  notes:         string;
};

const EMPTY_FORM: NewBookingForm = {
  serviceId: "", date: todayISO(), time: "09:00",
  customerName: "", customerPhone: "", petName: "", breed: "", notes: "",
};

// ── Generic dropdown — same look as StatusSelect, full-width for form use ─────
function FormDropdown({ value, onChange, options, placeholder }: {
  value:       string;
  onChange:    (v: string) => void;
  options:     { value: string; label: string }[];
  placeholder?: string;
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

  const selected = options.find(o => o.value === value);

  return (
    <div className="add-bk-dd-wrap" ref={ref}>
      <button
        className={`add-bk-dd-trigger${open ? " open" : ""}${!value ? " placeholder" : ""}`}
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <span className="add-bk-dd-trigger-label">
          {selected?.label ?? placeholder ?? "Select…"}
        </span>
        <svg viewBox="0 0 10 6" fill="none" width="9" height="9"
          style={{ flexShrink:0, transition:"transform 0.15s", transform: open ? "rotate(180deg)" : undefined }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="add-bk-dd-popover">
          {options.map(o => (
            <button
              key={o.value}
              className={`add-bk-dd-option${o.value === value ? " selected" : ""}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
              type="button"
            >
              {o.value === value
                ? <svg viewBox="0 0 12 12" fill="none" width="11" height="11" style={{ flexShrink:0, color:"#17A8FF" }}>
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                : <span style={{ width:11, flexShrink:0, display:"inline-block" }} />
              }
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddBookingPage({ services, onBack, onCreated }: {
  services:  BookingService[];
  onBack:    () => void;
  onCreated: (b: DbBooking) => void;
}) {
  const [form, setForm] = useState<NewBookingForm>(EMPTY_FORM);

  const selectedSvc = services.find(s => s.id === form.serviceId);
  const formValid   = !!(form.serviceId && form.date && form.time && form.customerName.trim() && form.customerPhone.trim() && form.petName.trim() && form.breed.trim());
  const set = (k: keyof NewBookingForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const serviceOptions = services.map(svc => ({
    value: svc.id,
    label: `${svc.name}${svc.varies_by_size ? "" : ` — ฿${svc.base_price.toLocaleString()}`} (${fmtDur(svc.duration_min)})`,
  }));
  const timeOptions = TIME_SLOTS.map(t => ({ value: t.value, label: t.label }));

  const displayDate = form.date
    ? new Date(form.date + "T00:00:00").toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short", year:"numeric" })
    : "—";
  const displayTime = TIME_SLOTS.find(t => t.value === form.time)?.label ?? form.time;

  const handleCreate = () => {
    if (!selectedSvc || !formValid) return;
    const [fName, ...rest] = form.customerName.trim().split(" ");
    const lName = rest.join(" ") || "—";
    const uid   = `manual-${Date.now()}`;
    onCreated({
      id:                uid,
      booking_reference: generateBookingRef(),
      scheduled_at:      `${form.date}T${form.time}:00+07:00`,
      status:            "confirmed",
      total_amount:      selectedSvc.base_price,
      pet_name:          form.petName.trim(),
      pet_notes:         form.notes.trim() || null,
      customer_id:       uid,
      customers: { id: uid, first_name: fName, last_name: lName, phone: form.customerPhone.trim() || null },
      pets: { name: form.petName.trim(), breed: form.breed.trim() || null, weight_kg: null, medical_notes: form.notes.trim() || null },
      services: { name: selectedSvc.name, category: selectedSvc.category, duration_min: selectedSvc.duration_min },
    });
    onBack();
  };

  const summaryRows: { icon: React.ReactNode; label: string; val: string; muted: boolean }[] = [
    {
      icon: <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>,
      label: "Service",
      val:   selectedSvc ? selectedSvc.name : "Not selected",
      muted: !selectedSvc,
    },
    {
      icon: <><rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 1v2M11 1v2M1 6h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></>,
      label: "Date",
      val:   form.date ? displayDate : "Not set",
      muted: !form.date,
    },
    {
      icon: <><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></>,
      label: "Time",
      val:   selectedSvc ? `${displayTime} · ${fmtDur(selectedSvc.duration_min)}` : displayTime,
      muted: false,
    },
    {
      icon: <><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 13c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></>,
      label: "Customer",
      val:   form.customerName.trim() || "Not set",
      muted: !form.customerName.trim(),
    },
    {
      icon: <><circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></>,
      label: "Pet",
      val:   form.petName.trim()
               ? `${form.petName.trim()}${form.breed.trim() ? ` · ${form.breed.trim()}` : ""}`
               : "Not set",
      muted: !form.petName.trim(),
    },
  ];

  return (
    <main className="vd-main" style={{ overflowY:"auto" }}>
      <div className="vd-content">

        <button className="add-bk-back" onClick={onBack} type="button">
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Bookings
        </button>

        <div style={{ marginBottom:24 }}>
          <div className="add-bk-page-title">New Booking</div>
          <div className="add-bk-page-sub">Manual entry · confirmed on creation</div>
        </div>

        <div className="add-bk-form-layout">

          {/* ── Left: all form panels ── */}
          <div>

            {/* Service */}
            <div className="add-bk-panel">
              <div className="add-bk-section-title">Service <span style={{ color:"#ef4444", marginLeft:2 }}>*</span></div>
              <div className="add-bk-field">
                {services.length === 0 ? (
                  <div className="add-bk-svc-hint-empty">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13" style={{ flexShrink:0 }}>
                      <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 7v3M8 5.5v.5" stroke="#b0ccd8" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    No active services — add services in the Services page first.
                  </div>
                ) : (
                  <>
                    <FormDropdown
                      value={form.serviceId}
                      onChange={v => set("serviceId", v)}
                      options={serviceOptions}
                      placeholder="— Select a service —"
                    />
                    {selectedSvc ? (
                      <div className="add-bk-svc-hint">
                        <span className="add-bk-svc-hint-dot" style={{ background: CAT_DOT_COLORS[selectedSvc.category] ?? "#9ec9e0" }} />
                        <span>{selectedSvc.category}</span>
                        <span className="add-bk-svc-hint-sep">·</span>
                        <span>{fmtDur(selectedSvc.duration_min)}</span>
                        {!selectedSvc.varies_by_size && (
                          <>
                            <span className="add-bk-svc-hint-sep">·</span>
                            <span style={{ fontWeight:600, color:"#003459" }}>฿{selectedSvc.base_price.toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="add-bk-panel">
              <div className="add-bk-section-title">Schedule</div>
              <div className="add-bk-2col">
                <div className="add-bk-field">
                  <label className="add-bk-label">Date <span className="req">*</span></label>
                  <div className="add-bk-dp-wrap">
                    <DatePickerField value={form.date} onChange={v => set("date", v)} />
                  </div>
                </div>
                <div className="add-bk-field">
                  <label className="add-bk-label">Start Time <span className="req">*</span></label>
                  <FormDropdown
                    value={form.time}
                    onChange={v => set("time", v)}
                    options={timeOptions}
                  />
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="add-bk-panel">
              <div className="add-bk-section-title">Customer</div>
              <div className="add-bk-2col">
                <div className="add-bk-field">
                  <label className="add-bk-label">Full Name <span className="req">*</span></label>
                  <input
                    type="text"
                    className="add-bk-input"
                    placeholder="e.g. Mintra Saelim"
                    value={form.customerName}
                    onChange={e => set("customerName", e.target.value)}
                  />
                </div>
                <div className="add-bk-field">
                  <label className="add-bk-label">Phone <span className="req">*</span></label>
                  <input
                    type="text"
                    className="add-bk-input"
                    placeholder="e.g. 081-234-5678"
                    value={form.customerPhone}
                    onChange={e => set("customerPhone", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Pet */}
            <div className="add-bk-panel">
              <div className="add-bk-section-title">Pet</div>
              <div className="add-bk-2col">
                <div className="add-bk-field">
                  <label className="add-bk-label">Pet Name <span className="req">*</span></label>
                  <input
                    type="text"
                    className="add-bk-input"
                    placeholder="e.g. Butter"
                    value={form.petName}
                    onChange={e => set("petName", e.target.value)}
                  />
                </div>
                <div className="add-bk-field">
                  <label className="add-bk-label">Breed <span className="req">*</span></label>
                  <input
                    type="text"
                    className="add-bk-input"
                    placeholder="e.g. Poodle"
                    value={form.breed}
                    onChange={e => set("breed", e.target.value)}
                  />
                </div>
              </div>
              <div className="add-bk-field">
                <label className="add-bk-label">Health Notes</label>
                <textarea
                  className="add-bk-input add-bk-textarea"
                  placeholder="Any allergies, conditions, or special instructions…"
                  value={form.notes}
                  onChange={e => set("notes", e.target.value)}
                />
              </div>
            </div>

            {/* Action bar */}
            <div className="add-bk-action-bar">
              <button className="add-bk-btn-secondary" onClick={onBack} type="button">
                Cancel
              </button>
              <button
                className="add-bk-btn-primary"
                disabled={!formValid}
                onClick={handleCreate}
                type="button"
              >
                <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                  <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Create Booking
              </button>
            </div>

          </div>

          {/* ── Right: sticky summary ── */}
          <div className="add-bk-summary-col">
            <div className="add-bk-summary-card">
              <div className="add-bk-summary-head">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style={{ color:"#17A8FF", flexShrink:0 }}>
                  <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M5 1v2M11 1v2M1 6h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <div className="add-bk-summary-head-title">Booking Summary</div>
              </div>
              <div className="add-bk-summary-body">
                {summaryRows.map(row => (
                  <div key={row.label} className="add-bk-summary-row">
                    <div className="add-bk-summary-icon">
                      <svg viewBox="0 0 16 16" fill="none" width="13" height="13">{row.icon}</svg>
                    </div>
                    <div className="add-bk-summary-text">
                      <div className="add-bk-summary-label">{row.label}</div>
                      <div className={`add-bk-summary-val${row.muted ? " muted" : ""}`}>{row.val}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="add-bk-summary-foot">
                <div className="add-bk-summary-foot-label">Total</div>
                <div className="add-bk-summary-foot-amount">
                  {selectedSvc
                    ? (selectedSvc.varies_by_size ? "By size" : `฿${selectedSvc.base_price.toLocaleString()}`)
                    : "—"}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}


// ── Page ──────────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [statusTab,       setStatusTab]       = useState<string>("All");
  const [dateFrom,        setDateFrom]        = useState(todayISO());
  const [dateTo,          setDateTo]          = useState(todayISO());
  const [search,          setSearch]          = useState("");
  const [statuses,        setStatuses]        = useState<Record<string, BookingStatus>>({});
  const [selected,        setSelected]        = useState<Booking | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [rawBookings,     setRawBookings]     = useState<DbBooking[]>([]);
  const [bookingServices, setBookingServices] = useState<BookingService[]>([]);
  const [view,            setView]            = useState<"list" | "add-booking">("list");

  // ── Load from Supabase ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: prov } = await supabase
        .from("providers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!prov) { setLoading(false); return; }

      const [{ data: bks }, { data: svcs }] = await Promise.all([
        supabase
          .from("bookings")
          .select(`
            id, booking_reference, scheduled_at, status, total_amount, pet_name, pet_notes, customer_id,
            customers(id, first_name, last_name, phone),
            pets(name, breed, weight_kg, medical_notes),
            services(name, category, duration_min)
          `)
          .eq("provider_id", prov.id)
          .order("scheduled_at", { ascending: false }),
        supabase
          .from("services")
          .select("id, name, category, duration_min, base_price, varies_by_size")
          .eq("provider_id", prov.id)
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);

      if (bks)  setRawBookings(bks as unknown as DbBooking[]);
      if (svcs) setBookingServices(svcs as BookingService[]);
      setLoading(false);
    })();
  }, []);

  const bookings: Booking[] = useMemo(
    () => rawBookings.map((b, i) => mapDbToBooking(b, i, rawBookings)),
    [rawBookings]
  );

  const getStatus = (b: Booking): BookingStatus => statuses[b.id] ?? b.status;

  const handleStatusChange = async (id: string, s: BookingStatus) => {
    setStatuses(prev => ({ ...prev, [id]: s }));
    await supabase.from("bookings").update({ status: uiToDbStatus(s) }).eq("id", id);
  };

  const handleBookingCreated = (newBk: DbBooking) => {
    setRawBookings(prev => [newBk, ...prev]);
    setView("list");
  };

  const dateFiltered = useMemo(() => {
    return bookings.filter(b => {
      const d = new Date(b.scheduledAt);
      if (dateFrom) {
        const from = new Date(dateFrom + "T00:00:00");
        if (d < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo + "T23:59:59");
        if (d > to) return false;
      }
      return true;
    });
  }, [bookings, dateFrom, dateTo]);

  const filtered = useMemo(() => {
    return dateFiltered.filter(b => {
      const status = getStatus(b);
      const matchStatus =
        statusTab === "All"        ? true :
        statusTab === "Confirmed"  ? status === "confirmed"   :
        statusTab === "Checked-in" ? status === "in-progress" :
        statusTab === "Completed"  ? status === "completed"   :
        statusTab === "Cancelled"  ? status === "cancelled"   :
        statusTab === "Pending"    ? status === "pending"     : true;
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

  const tableRows = useMemo<TableRow[]>(() => {
    return filtered.map(b => ({ type:"row" as const, booking:b }));
  }, [filtered]);

  if (selected) {
    return (
      <BookingDetailView
        booking={{ ...selected, status: getStatus(selected) }}
        onBack={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    );
  }

  if (view === "add-booking") {
    return (
      <AddBookingPage
        services={bookingServices}
        onBack={() => setView("list")}
        onCreated={handleBookingCreated}
      />
    );
  }

  return (
    <main className="vd-main" style={{ overflow:"hidden" }}>
      <div className="vd-content">

        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:"var(--text)", letterSpacing:"-0.5px" }}>Bookings</div>
            <div style={{ fontSize:12, color:"var(--muted)", fontWeight:300, marginTop:2 }}>
              {loading ? "Loading…" : `${filtered.length} appointment${filtered.length !== 1 ? "s" : ""} in range`}
            </div>
          </div>
          <button
            className="vd-new-booking"
            onClick={() => setView("add-booking")}
            type="button"
          >
            <svg viewBox="0 0 12 12" fill="none" width="12" height="12" style={{ marginRight:6, flexShrink:0 }}>
              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Add Booking
          </button>
        </div>

        {/* Toolbar — search + status dropdown on left · date range + export on right */}
        <div className="bk-toolbar">

          {/* Left: search + status dropdown */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
            <div className="bk-search-wrap">
              <svg className="bk-search-icon" viewBox="0 0 24 24" fill="none" stroke="#9ec9e0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" className="bk-search" placeholder="Search pet, owner or ref…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <StatusSelect
              value={statusTab}
              onChange={setStatusTab}
              options={STATUS_OPTIONS}
            />
          </div>

          {/* Right: date range + export */}
          <div className="bk-toolbar-right">
            <DatePickerField value={dateFrom} onChange={setDateFrom} max={dateTo || undefined} />
            <span className="bk-daterange-sep">–</span>
            <DatePickerField value={dateTo} onChange={setDateTo} min={dateFrom || undefined} />
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
                    <td className="bk-time-main">{b.time}</td>
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
