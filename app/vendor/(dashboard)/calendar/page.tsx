"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

// ── Constants ──────────────────────────────────────────────────────────────────
const HOUR_H = 64;
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8–19
const DAY_NAMES   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ── Types ──────────────────────────────────────────────────────────────────────
type CalStatus = "confirmed" | "in-progress" | "completed" | "cancelled";

type CalEvent = {
  id: string;            // booking UUID
  bookingRef: string;
  pet: string;
  owner: string;
  service: string;
  date: Date;            // actual booking datetime
  hour: number;
  min: number;
  dur: number;           // minutes
  color: string;
  status: CalStatus;
  // detail fields
  amount: number;
  category: string;
  breed: string;
  weight: string;
  medicalNotes: string | null;
  phone: string;
  customerId: string;
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
  customers: { first_name: string; last_name: string; phone: string | null } | null;
  pets: { name: string; breed: string | null; weight_kg: number | null; medical_notes: string | null } | null;
  services: { name: string; category: string; duration_min: number } | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtDur(dur: number) {
  if (dur < 60) return `${dur}m`;
  const h = Math.floor(dur / 60), m = dur % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function fmtTime(h: number, m: number) {
  const period = h >= 12 ? "pm" : "am";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")}${period}`;
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function getWeekStart(d: Date) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const ws = new Date(d);
  ws.setDate(d.getDate() + diff);
  ws.setHours(0, 0, 0, 0);
  return ws;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function dbToCalStatus(s: string): CalStatus {
  if (s === "in_progress") return "in-progress";
  if (s === "new" || s === "pending") return "confirmed";
  return s as CalStatus;
}

function statusColor(s: CalStatus): string {
  if (s === "confirmed")   return "#17A8FF";
  if (s === "in-progress") return "#003459";
  if (s === "completed")   return "#10B981";
  if (s === "cancelled")   return "#ef4444";
  return "#17A8FF";
}

function mapToCalEvent(b: DbBooking): CalEvent {
  const d    = new Date(b.scheduled_at);
  const st   = dbToCalStatus(b.status);
  const col  = statusColor(st);
  return {
    id:          b.id,
    bookingRef:  b.booking_reference,
    pet:         b.pets?.name ?? b.pet_name ?? "Pet",
    owner:       b.customers ? `${b.customers.first_name} ${b.customers.last_name[0]}.` : "Customer",
    service:     b.services?.name ?? "Service",
    date:        d,
    hour:        d.getHours(),
    min:         d.getMinutes(),
    dur:         b.services?.duration_min ?? 60,
    color:       col,
    status:      st,
    amount:      b.total_amount ?? 0,
    category:    b.services?.category ?? "",
    breed:       b.pets?.breed ?? "—",
    weight:      b.pets?.weight_kg ? `${b.pets.weight_kg} kg` : "—",
    medicalNotes: b.pets?.medical_notes ?? b.pet_notes ?? null,
    phone:       b.customers?.phone ?? "—",
    customerId:  b.customer_id,
  };
}


// ── Sub-components ─────────────────────────────────────────────────────────────

function CalHeading({ view, base, calEvents }: {
  view: string; base: Date; calEvents: CalEvent[];
}) {
  if (view === "week") {
    const ws = getWeekStart(base);
    const we = new Date(ws); we.setDate(ws.getDate() + 6);
    const sameMonth = ws.getMonth() === we.getMonth();
    const label = sameMonth
      ? `${ws.getDate()} – ${we.getDate()} ${MONTH_NAMES[we.getMonth()]} ${we.getFullYear()}`
      : `${ws.getDate()} ${MONTH_NAMES[ws.getMonth()].slice(0,3)} – ${we.getDate()} ${MONTH_NAMES[we.getMonth()].slice(0,3)} ${we.getFullYear()}`;
    const count = calEvents.filter(e =>
      e.date >= ws && e.date < new Date(ws.getTime() + 7 * 86400000) && e.status !== "cancelled"
    ).length;
    return (
      <>
        <div className="cal-heading">{label}</div>
        <div className="cal-heading-sub">{count} bookings this week</div>
      </>
    );
  }
  if (view === "month") {
    const mStart = new Date(base.getFullYear(), base.getMonth(), 1);
    const mEnd   = new Date(base.getFullYear(), base.getMonth() + 1, 1);
    const count  = calEvents.filter(e => e.date >= mStart && e.date < mEnd && e.status !== "cancelled").length;
    return (
      <>
        <div className="cal-heading">{MONTH_NAMES[base.getMonth()]} {base.getFullYear()}</div>
        <div className="cal-heading-sub">{count} bookings this month</div>
      </>
    );
  }
  // day
  const dayIdx = (base.getDay() + 6) % 7;
  const count  = calEvents.filter(e => isSameDay(e.date, base) && e.status !== "cancelled").length;
  return (
    <>
      <div className="cal-heading">{DAY_NAMES[dayIdx]}, {base.getDate()} {MONTH_NAMES[base.getMonth()]}</div>
      <div className="cal-heading-sub">{count} appointment{count !== 1 ? "s" : ""} today</div>
    </>
  );
}

// ── Week view ──────────────────────────────────────────────────────────────────
function WeekView({ base, calEvents, today, onEventClick, onDrillDay }: {
  base: Date; calEvents: CalEvent[]; today: Date;
  onEventClick: (ev: CalEvent) => void;
  onDrillDay: (dayIdx: number) => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const ws = getWeekStart(base);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws); d.setDate(ws.getDate() + i); return d;
  });

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = (9 - HOURS[0]) * HOUR_H - 20;
  }, []);

  const nowTop = (() => {
    const n = new Date();
    return (n.getHours() + n.getMinutes() / 60 - HOURS[0]) * HOUR_H;
  })();

  return (
    <div className="cal-week">
      <div className="cal-week-header">
        <div className="cal-week-header-gutter" />
        {days.map((d, i) => {
          const isToday = isSameDay(d, today);
          return (
            <div key={i} className="cal-day-col-header" onClick={() => onDrillDay(i)}>
              <div className="cal-day-name">{DAY_NAMES[i]}</div>
              <div className={`cal-day-num${isToday ? " today" : ""}`}>{d.getDate()}</div>
              {isToday && <div className="cal-day-today-indicator">Today</div>}
            </div>
          );
        })}
      </div>
      <div className="cal-week-body" ref={bodyRef}>
        <div className="cal-time-col">
          {HOURS.map(h => (
            <div key={h} className="cal-time-slot">
              {h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`}
            </div>
          ))}
        </div>
        {days.map((d, dayIdx) => {
          const evs = calEvents.filter(e => isSameDay(e.date, d));
          const isToday = isSameDay(d, today);
          return (
            <div key={dayIdx} className="cal-day-col" style={{ position:"relative" }}>
              {HOURS.map(h => <div key={h} className="cal-hour-line"><div className="cal-hour-half" /></div>)}
              {evs.map(ev => {
                const top    = (ev.hour - HOURS[0]) * HOUR_H + (ev.min / 60) * HOUR_H;
                const height = Math.max(24, Math.min((ev.dur / 60) * HOUR_H, HOURS.length * HOUR_H - top));
                const bg     = hexToRgba(ev.color, 0.13);
                return (
                  <div key={ev.id} className="cal-event"
                    style={{ top, height, background: bg, borderLeftColor: ev.color, color: ev.color }}
                    onClick={e => { e.stopPropagation(); onEventClick(ev); }}>
                    <div className="cal-event-time">{fmtTime(ev.hour, ev.min)}</div>
                    {height > 40 && <div className="cal-event-name">{ev.pet} · {ev.owner.split(" ")[0]}</div>}
                    {height > 60 && <div className="cal-event-service">{ev.service}</div>}
                  </div>
                );
              })}
              {isToday && (
                <div className="cal-now-line" style={{ top: nowTop }}>
                  <div className="cal-now-dot" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Day view ───────────────────────────────────────────────────────────────────
function DayView({ base, calEvents, today, onEventClick }: {
  base: Date; calEvents: CalEvent[]; today: Date;
  onEventClick: (ev: CalEvent) => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const evs     = calEvents.filter(e => isSameDay(e.date, base));
  const isToday = isSameDay(base, today);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = (9 - HOURS[0]) * HOUR_H - 20;
  }, []);

  const nowTop = (() => {
    const n = new Date();
    return (n.getHours() + n.getMinutes() / 60 - HOURS[0]) * HOUR_H;
  })();

  return (
    <div className="cal-week">
      <div className="cal-week-header">
        <div className="cal-week-header-gutter" />
        <div className="cal-day-col-header" style={{ flex: 1 }}>
          <div className="cal-day-name">{DAY_NAMES[(base.getDay() + 6) % 7]}</div>
          <div className={`cal-day-num${isToday ? " today" : ""}`}>{base.getDate()}</div>
          {isToday && <div className="cal-day-today-indicator">Today</div>}
        </div>
      </div>
      <div className="cal-week-body" ref={bodyRef}>
        <div className="cal-time-col">
          {HOURS.map(h => (
            <div key={h} className="cal-time-slot">
              {h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`}
            </div>
          ))}
        </div>
        <div className="cal-day-col" style={{ flex: 1, position: "relative" }}>
          {HOURS.map(h => <div key={h} className="cal-hour-line"><div className="cal-hour-half" /></div>)}
          {evs.map(ev => {
            const top    = (ev.hour - HOURS[0]) * HOUR_H + (ev.min / 60) * HOUR_H;
            const height = Math.max(24, (ev.dur / 60) * HOUR_H);
            const bg     = hexToRgba(ev.color, 0.13);
            return (
              <div key={ev.id} className="cal-event"
                style={{ top, height, background: bg, borderLeftColor: ev.color, color: ev.color }}
                onClick={e => { e.stopPropagation(); onEventClick(ev); }}>
                <div className="cal-event-time">{fmtTime(ev.hour, ev.min)}</div>
                {height > 40 && <div className="cal-event-name">{ev.pet} · {ev.owner.split(" ")[0]}</div>}
                {height > 60 && <div className="cal-event-service">{ev.service}</div>}
              </div>
            );
          })}
          {isToday && (
            <div className="cal-now-line" style={{ top: nowTop }}>
              <div className="cal-now-dot" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Month view ─────────────────────────────────────────────────────────────────
function MonthView({ base, calEvents, today, onDrillDay }: {
  base: Date; calEvents: CalEvent[]; today: Date;
  onDrillDay: (date: Date) => void;
}) {
  const firstOfMonth = new Date(base.getFullYear(), base.getMonth(), 1);
  const startDay     = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth  = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(base.getFullYear(), base.getMonth(), i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="cal-month-wrap">
      <div className="cal-month-day-names">
        {DAY_NAMES.map(d => <div key={d} className="cal-month-day-name">{d}</div>)}
      </div>
      <div className="cal-month-grid">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="cal-month-cell empty" />;
          const isToday  = isSameDay(d, today);
          const isOther  = d.getMonth() !== base.getMonth();
          const evs      = calEvents.filter(e => isSameDay(e.date, d) && e.status !== "cancelled");
          return (
            <div key={i}
              className={`cal-month-cell${isToday ? " today" : ""}${isOther ? " other-month" : ""}`}
              onClick={() => onDrillDay(d)}>
              <div className={`cal-month-cell-num${isToday ? " today" : ""}`}>{d.getDate()}</div>
              <div className="cal-month-events">
                {evs.slice(0, 3).map(ev => (
                  <div key={ev.id} className="cal-month-event-chip"
                    style={{ background: hexToRgba(ev.color, 0.13), color: ev.color, borderLeft: `2px solid ${ev.color}` }}>
                    {fmtTime(ev.hour, ev.min)} {ev.pet}
                  </div>
                ))}
                {evs.length > 3 && <div className="cal-month-more">+{evs.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Mini month sidebar ─────────────────────────────────────────────────────────
function MiniMonth({ base, view, today, onDayClick }: {
  base: Date; view: string; today: Date; onDayClick: (d: Date) => void;
}) {
  const [mini, setMini] = useState(new Date(base.getFullYear(), base.getMonth(), 1));
  const firstOfMonth = new Date(mini.getFullYear(), mini.getMonth(), 1);
  const startDay     = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth  = new Date(mini.getFullYear(), mini.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(mini.getFullYear(), mini.getMonth(), i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const ws = getWeekStart(base);
  const we = new Date(ws); we.setDate(ws.getDate() + 6);

  return (
    <div className="mini-month">
      <div className="mini-month-header">
        <button className="mini-month-nav" onClick={() => setMini(new Date(mini.getFullYear(), mini.getMonth() - 1, 1))}>‹</button>
        <span className="mini-month-title">{MONTH_NAMES[mini.getMonth()].slice(0,3)} {mini.getFullYear()}</span>
        <button className="mini-month-nav" onClick={() => setMini(new Date(mini.getFullYear(), mini.getMonth() + 1, 1))}>›</button>
      </div>
      <div className="mini-month-day-names">
        {["M","T","W","T","F","S","S"].map((d, i) => <div key={i} className="mini-day-name">{d}</div>)}
      </div>
      <div className="mini-month-grid">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="mini-day empty" />;
          const isToday    = isSameDay(d, today);
          const inWeek     = view === "week" && d >= ws && d <= we;
          const isSelected = isSameDay(d, base);
          return (
            <div key={i} onClick={() => onDayClick(d)}
              className={`mini-day${isToday ? " today" : ""}${inWeek ? " in-week" : ""}${isSelected ? " selected" : ""}`}>
              {d.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Agenda ─────────────────────────────────────────────────────────────────────
function AgendaPanel({ calEvents, base, onEventClick }: {
  calEvents: CalEvent[]; base: Date; onEventClick: (ev: CalEvent) => void;
}) {
  const ws = getWeekStart(base);
  const we = new Date(ws.getTime() + 7 * 86400000);
  const sorted = calEvents
    .filter(e => e.status !== "cancelled" && e.date >= ws && e.date < we)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="agenda-panel">
      <div className="agenda-header">
        <span className="agenda-title">Agenda</span>
        <span className="agenda-date-label">This week</span>
      </div>
      <div className="agenda-list">
        {sorted.length === 0 ? (
          <div style={{ padding:"16px 20px", fontSize:12, color:"#9ec9e0" }}>No bookings this week.</div>
        ) : sorted.map(ev => (
          <div key={ev.id} className="agenda-item" onClick={() => onEventClick(ev)} style={{ cursor:"pointer" }}>
            <div className="agenda-item-dot" style={{ background: ev.color }} />
            <div className="agenda-item-info">
              <div className="agenda-item-pet">{ev.pet} · {ev.owner.split(" ")[0]}</div>
              <div className="agenda-item-svc">{ev.service}</div>
            </div>
            <div className="agenda-item-time">
              <div className="agenda-item-day">{DAY_NAMES[(ev.date.getDay() + 6) % 7]}</div>
              <div className="agenda-item-hour">{fmtTime(ev.hour, ev.min)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Booking detail full-page view ─────────────────────────────────────────────
function BookingDetailView({ ev, onBack, onStatusChange }: {
  ev: CalEvent;
  onBack: () => void;
  onStatusChange: (id: string, s: CalStatus) => void;
}) {
  const [status, setStatus] = useState<CalStatus>(ev.status);

  const dayLabel  = DAY_NAMES[(ev.date.getDay() + 6) % 7];
  const dateStr   = ev.date.toLocaleDateString("en-GB", { day:"numeric", month:"short" });
  const timeStr   = `${dayLabel} ${dateStr}, ${fmtTime(ev.hour, ev.min)} · ${fmtDur(ev.dur)}`;

  const statusColor2 =
    status === "confirmed"   ? "#17A8FF" :
    status === "in-progress" ? "#003459" :
    status === "completed"   ? "#10B981" : "#ef4444";
  const statusLabel =
    status === "in-progress" ? "Checked-in" :
    status.charAt(0).toUpperCase() + status.slice(1);

  const update = async (s: CalStatus) => {
    setStatus(s);
    onStatusChange(ev.id, s);
    const dbStatus = s === "in-progress" ? "in_progress" : s;
    await supabase.from("bookings").update({ status: dbStatus }).eq("id", ev.id);
  };

  return (
    <main className="vd-main" style={{ overflow: "hidden" }}>
      <div className="bkd-page">
        <button className="bkd-back" onClick={onBack}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style={{ marginRight: 6 }}>
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Calendar
        </button>

        <div className="bkd-header-card">
          <div style={{ display:"flex", alignItems:"center", gap:16, flex:1, minWidth:0 }}>
            <div className="bkd-header-avatar" style={{ background: ev.color }}>{ev.pet[0]}</div>
            <div style={{ minWidth:0 }}>
              <div className="bkd-header-title">{ev.pet} — {ev.service}</div>
              <div className="bkd-header-meta">
                <span className="bkd-status-pill" style={{ color: statusColor2, background: `${statusColor2}18` }}>{statusLabel}</span>
                <span className="bkd-meta-dot" />
                <span className="bkd-meta-text">{ev.bookingRef}</span>
                <span className="bkd-meta-dot" />
                <span className="bkd-meta-text">{timeStr}</span>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
            <span className="bkd-category-tag">{ev.category}</span>
            <div className="bkd-header-price">฿{ev.amount.toLocaleString()}</div>
          </div>
        </div>

        <div className="bkd-body">
          <div className="bkd-main">
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
                  <div className="bkd-row-value">{timeStr}</div>
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
                    {ev.service} <span className="bkd-service-tag">{ev.category}</span>
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
                  <div className="bkd-row-value bkd-amount">฿{ev.amount.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="bkd-panel">
              <div className="bkd-panel-title">Pet Profile</div>
              <div className="bkd-pet-card">
                <div className="bkd-pet-identity">
                  <div className="bkd-pet-avatar" style={{ background: hexToRgba(ev.color, 0.18), color: ev.color }}>{ev.pet[0]}</div>
                  <div>
                    <div className="bkd-pet-name">{ev.pet}</div>
                    <div className="bkd-pet-breed">{ev.breed}</div>
                  </div>
                </div>
                <div className="bkd-pet-stats">
                  {[
                    { label:"Weight", val: ev.weight },
                    { label:"Duration", val: fmtDur(ev.dur) },
                  ].map(s => (
                    <div key={s.label} className="bkd-pet-stat">
                      <div className="bkd-pet-stat-label">{s.label}</div>
                      <div className="bkd-pet-stat-val">{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
              {ev.medicalNotes && (
                <div className="bkd-pet-note">
                  <svg viewBox="0 0 16 16" fill="none" width="13" height="13" style={{ flexShrink:0, marginTop:1 }}>
                    <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 7v4M8 5.5v.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {ev.medicalNotes}
                </div>
              )}
            </div>

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
                  <div>
                    <div className="bkd-cust-label">Name</div>
                    <div className="bkd-cust-value">{ev.owner.replace(".", "")}</div>
                  </div>
                </div>
                <div className="bkd-cust-row" style={{ borderBottom:"none" }}>
                  <div className="bkd-cust-icon">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <path d="M3 2h3l1.5 3.5L6 7a9 9 0 003 3l1.5-1.5L14 10v3a1 1 0 01-1 1A11 11 0 013 3a1 1 0 011-1z" stroke="#17A8FF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="bkd-cust-label">Phone</div>
                    <div className="bkd-cust-value bkd-cust-phone">{ev.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
              {status === "cancelled" && <div className="bkd-action-cancelled">Booking cancelled</div>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const TODAY = useMemo(() => new Date(), []);
  const [view,        setView]        = useState<"week" | "day" | "month">("week");
  const [base,        setBase]        = useState(new Date());
  const [selected,    setSelected]    = useState<CalEvent | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [rawBookings, setRawBookings] = useState<DbBooking[]>([]);

  // ── Load from Supabase ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: prov } = await supabase.from("providers").select("id").eq("user_id", user.id).single();
      if (!prov) { setLoading(false); return; }

      const { data: bks } = await supabase
        .from("bookings")
        .select(`
          id, booking_reference, scheduled_at, status, total_amount, pet_name, pet_notes, customer_id,
          customers(first_name, last_name, phone),
          pets(name, breed, weight_kg, medical_notes),
          services(name, category, duration_min)
        `)
        .eq("provider_id", prov.id)
        .neq("status", "cancelled")
        .order("scheduled_at");

      if (bks) setRawBookings(bks as unknown as DbBooking[]);
      setLoading(false);
    })();
  }, []);

  const calEvents: CalEvent[] = useMemo(
    () => rawBookings.map(mapToCalEvent),
    [rawBookings]
  );

  const handleStatusChange = (id: string, s: CalStatus) => {
    setRawBookings(prev => prev.map(b => b.id === id ? { ...b, status: s === "in-progress" ? "in_progress" : s } : b));
  };

  if (selected) {
    return (
      <BookingDetailView
        ev={selected}
        onBack={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    );
  }

  const navigate = (dir: -1 | 1) => {
    const d = new Date(base);
    if (view === "week")  d.setDate(d.getDate() + dir * 7);
    if (view === "day")   d.setDate(d.getDate() + dir);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    setBase(d);
  };

  const drillDay = (dayOrIdx: Date | number) => {
    if (typeof dayOrIdx === "number") {
      const ws = getWeekStart(base);
      const d = new Date(ws); d.setDate(ws.getDate() + dayOrIdx);
      setBase(d);
    } else {
      setBase(dayOrIdx);
    }
    setView("day");
  };

  return (
    <main className="vd-main">
      <div className="cal-shell">
        <div className="cal-main">
          {/* Toolbar */}
          <div className="cal-toolbar">
            <div className="cal-toolbar-left">
              <div className="cal-nav-group">
                <button className="cal-nav-btn" onClick={() => navigate(-1)}>‹</button>
                <div className="cal-nav-divider" />
                <button className="cal-nav-btn" onClick={() => navigate(1)}>›</button>
              </div>
              <div>
                <CalHeading view={view} base={base} calEvents={calEvents} />
              </div>
            </div>
            <div className="cal-toolbar-right">
              <button className="cal-today-btn" onClick={() => setBase(new Date())}>Today</button>
              <div className="cal-view-group">
                {(["day", "week", "month"] as const).map(v => (
                  <button key={v} className={`cal-view-btn${view === v ? " active" : ""}`} onClick={() => setView(v)}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <div className="cal-legend">
                <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background:"#22c55e" }} />Confirmed</div>
                <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background:"#17A8FF" }} />In progress</div>
                <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background:"#64748b" }} />Completed</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, color:"#7eb5d6", fontSize:13 }}>
              Loading calendar…
            </div>
          ) : (
            <div className="cal-view-wrap">
              {view === "week"  && <WeekView  base={base} calEvents={calEvents} today={TODAY} onEventClick={setSelected} onDrillDay={drillDay} />}
              {view === "day"   && <DayView   base={base} calEvents={calEvents} today={TODAY} onEventClick={setSelected} />}
              {view === "month" && <MonthView base={base} calEvents={calEvents} today={TODAY} onDrillDay={drillDay} />}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="cal-sidebar-panel">
          <MiniMonth base={base} view={view} today={TODAY} onDayClick={d => { setBase(d); if (view !== "month") setView("day"); }} />
          <AgendaPanel calEvents={calEvents} base={base} onEventClick={setSelected} />
        </div>
      </div>
    </main>
  );
}
