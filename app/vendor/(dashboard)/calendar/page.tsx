"use client";

import { useState, useRef, useEffect } from "react";

// ── Constants ──────────────────────────────────────────────────────────────────
const HOUR_H = 64; // px per hour
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8–19
const DAY_NAMES  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// "Today" = Tuesday 24 Dec 2024
const TODAY = new Date(2024, 11, 24);

type CalEvent = {
  id: string; pet: string; owner: string; service: string;
  dayOff: number; // 0=Mon … 6=Sun within the current week
  hour: number; min: number; dur: number; // dur in minutes
  color: string; status: "confirmed" | "in-progress" | "completed" | "cancelled";
};

const CAL_EVENTS: CalEvent[] = [
  { id:"e1", pet:"Mochi",  owner:"Natthida P.", service:"Full Grooming",    dayOff:1, hour:10, min:0,  dur:90,  color:"#22c55e",  status:"in-progress" },
  { id:"e2", pet:"Luna",   owner:"Krit W.",     service:"Day Care (Full)",  dayOff:1, hour:14, min:30, dur:120, color:"#17A8FF",  status:"confirmed"   },
  { id:"e3", pet:"Buddy",  owner:"Pim R.",      service:"Training Session", dayOff:1, hour:16, min:0,  dur:60,  color:"#F5A623",  status:"confirmed"   },
  { id:"e4", pet:"Nala",   owner:"Suda C.",     service:"Cat Grooming",    dayOff:2, hour:9,  min:30, dur:75,  color:"#17A8FF",  status:"confirmed"   },
  { id:"e5", pet:"Max",    owner:"Tong V.",     service:"Full Grooming",    dayOff:2, hour:11, min:0,  dur:90,  color:"#22c55e",  status:"confirmed"   },
  { id:"e6", pet:"Coco",   owner:"May L.",      service:"Boarding",        dayOff:3, hour:8,  min:0,  dur:60,  color:"#8b5cf6",  status:"confirmed"   },
  { id:"e7", pet:"Bella",  owner:"Arm K.",      service:"Day Care",        dayOff:4, hour:8,  min:0,  dur:480, color:"#17A8FF",  status:"confirmed"   },
  { id:"e8", pet:"Mochi",  owner:"Natthida P.", service:"Nail Trim",       dayOff:5, hour:10, min:0,  dur:30,  color:"#22c55e",  status:"confirmed"   },
  { id:"e9", pet:"Luna",   owner:"Krit W.",     service:"Bath & Blowdry",  dayOff:0, hour:11, min:0,  dur:60,  color:"#F5A623",  status:"completed"   },
];

// ── Booking detail mock data ───────────────────────────────────────────────────
type BkDetail = {
  bookingId: string; amount: number; category: string;
  pet: { breed: string; age: string; weight: string; visits: number; lastSeen: string; notes?: string };
  customer: { name: string; phone: string; email: string; line?: string };
};

const BK_DETAILS: Record<string, BkDetail> = {
  e1: { bookingId:"BK001", amount:630,   category:"Grooming",  pet:{breed:"Shiba Inu",       age:"3 yrs", weight:"8 kg",  visits:8,  lastSeen:"Dec 10", notes:"No known allergies. Slightly anxious with dryers — use low heat."},  customer:{name:"Natthida P.", phone:"+66 81 234 5678", email:"natthida.p@gmail.com",  line:"@natthida"} },
  e2: { bookingId:"BK002", amount:800,   category:"Day Care",  pet:{breed:"Border Collie",    age:"2 yrs", weight:"18 kg", visits:5,  lastSeen:"Dec 5",  notes:"Very energetic. Good with other dogs. No health issues."},                    customer:{name:"Krit W.",     phone:"+66 89 876 5432", email:"krit.w@hotmail.com",    line:"@kritw"}    },
  e3: { bookingId:"BK003", amount:680,   category:"Training",  pet:{breed:"French Bulldog",   age:"1 yr",  weight:"10 kg", visits:5,  lastSeen:"Dec 19", notes:"Responds well to treats. Keep sessions short."},                    customer:{name:"Pim R.",      phone:"+66 92 111 2222", email:"pim.r@outlook.com"}                          },
  e4: { bookingId:"BK004", amount:525,   category:"Grooming",  pet:{breed:"Persian Cat",      age:"4 yrs", weight:"4 kg",  visits:12, lastSeen:"Dec 15", notes:"Indoor only. Very calm."},                                          customer:{name:"Suda C.",     phone:"+66 81 999 0000", email:"suda.c@gmail.com"}                            },
  e5: { bookingId:"BK005", amount:630,   category:"Grooming",  pet:{breed:"Siberian Husky",   age:"3 yrs", weight:"28 kg", visits:6,  lastSeen:"Dec 10"},                                                                             customer:{name:"Tong V.",     phone:"+66 85 333 4444", email:"tong.v@gmail.com"}                            },
  e6: { bookingId:"BK006", amount:1800,  category:"Boarding",  pet:{breed:"Toy Poodle",       age:"2 yrs", weight:"3 kg",  visits:2,  lastSeen:"Dec 08", notes:"Takes anxiety medication (provided by owner). Needs 2 meals/day."}, customer:{name:"May L.",      phone:"+66 93 444 5566", email:"may.lucky@gmail.com"}                         },
  e7: { bookingId:"BK007", amount:800,   category:"Day Care",  pet:{breed:"Labrador",         age:"1 yr",  weight:"18 kg", visits:2,  lastSeen:"Dec 01", notes:"First few visits. Needs gentle handling."},                         customer:{name:"Arm K.",      phone:"+66 88 777 8888", email:"arm.k@gmail.com"}                             },
  e8: { bookingId:"BK008", amount:220,   category:"Grooming",  pet:{breed:"Shiba Inu",        age:"3 yrs", weight:"8 kg",  visits:9,  lastSeen:"Dec 10", notes:"No known allergies. Slightly anxious with dryers — use low heat."},  customer:{name:"Natthida P.", phone:"+66 81 234 5678", email:"natthida.p@gmail.com",  line:"@natthida"} },
  e9: { bookingId:"BK009", amount:550,   category:"Grooming",  pet:{breed:"Golden Retriever", age:"2 yrs", weight:"22 kg", visits:4,  lastSeen:"Dec 18"},                                                                             customer:{name:"Krit W.",     phone:"+66 89 876 5432", email:"krit.w@gmail.com",       line:"@kritw"}    },
};

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
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const ws = new Date(d);
  ws.setDate(d.getDate() + diff);
  return ws;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function CalHeading({ view, base }: { view: string; base: Date }) {
  if (view === "week") {
    const ws = getWeekStart(base);
    const we = new Date(ws); we.setDate(ws.getDate() + 6);
    const sameMonth = ws.getMonth() === we.getMonth();
    const label = sameMonth
      ? `${ws.getDate()} – ${we.getDate()} ${MONTH_NAMES[we.getMonth()]} ${we.getFullYear()}`
      : `${ws.getDate()} ${MONTH_NAMES[ws.getMonth()].slice(0,3)} – ${we.getDate()} ${MONTH_NAMES[we.getMonth()].slice(0,3)} ${we.getFullYear()}`;
    const count = CAL_EVENTS.filter(e => e.status !== "cancelled").length;
    return (
      <>
        <div className="cal-heading">{label}</div>
        <div className="cal-heading-sub">{count} bookings this week</div>
      </>
    );
  }
  if (view === "month") {
    return (
      <>
        <div className="cal-heading">{MONTH_NAMES[base.getMonth()]} {base.getFullYear()}</div>
        <div className="cal-heading-sub">{CAL_EVENTS.filter(e=>e.status!=="cancelled").length} bookings this month</div>
      </>
    );
  }
  // day
  const dayIdx = (base.getDay() + 6) % 7;
  const todayEvs = (() => {
    const ws = getWeekStart(base);
    const offset = Math.round((base.getTime() - ws.getTime()) / 86400000);
    return CAL_EVENTS.filter(e => e.dayOff === offset && e.status !== "cancelled");
  })();
  return (
    <>
      <div className="cal-heading">{DAY_NAMES[dayIdx]}, {base.getDate()} {MONTH_NAMES[base.getMonth()]}</div>
      <div className="cal-heading-sub">{todayEvs.length} appointment{todayEvs.length !== 1 ? "s" : ""} today</div>
    </>
  );
}

// ── Week view ──────────────────────────────────────────────────────────────────
function WeekView({ base, onEventClick, onDrillDay }: {
  base: Date;
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

  return (
    <div className="cal-week">
      {/* Header */}
      <div className="cal-week-header">
        <div className="cal-week-header-gutter" />
        {days.map((d, i) => {
          const isToday = isSameDay(d, TODAY);
          return (
            <div key={i} className="cal-day-col-header" onClick={() => onDrillDay(i)}>
              <div className="cal-day-name">{DAY_NAMES[i]}</div>
              <div className={`cal-day-num${isToday ? " today" : ""}`}>{d.getDate()}</div>
              {isToday && <div className="cal-day-today-indicator">Today</div>}
            </div>
          );
        })}
      </div>

      {/* Body: time grid */}
      <div className="cal-week-body" ref={bodyRef}>
        <div className="cal-time-col">
          {HOURS.map((h) => (
            <div key={h} className="cal-time-slot">
              {h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`}
            </div>
          ))}
        </div>

        {days.map((_, dayIdx) => {
          const evs = CAL_EVENTS.filter(e => e.dayOff === dayIdx);
          const isToday = isSameDay(days[dayIdx], TODAY);
          const nowTop = (11.25 - HOURS[0]) * HOUR_H;

          return (
            <div key={dayIdx} className="cal-day-col" style={{ position: "relative" }}>
              {HOURS.map((h) => (
                <div key={h} className="cal-hour-line">
                  <div className="cal-hour-half" />
                </div>
              ))}

              {/* Events */}
              {evs.map((ev) => {
                const top = (ev.hour - HOURS[0]) * HOUR_H + (ev.min / 60) * HOUR_H;
                const height = Math.max(24, Math.min((ev.dur / 60) * HOUR_H, HOURS.length * HOUR_H - top));
                const bg = hexToRgba(ev.color, 0.13);
                return (
                  <div
                    key={ev.id}
                    className="cal-event"
                    style={{ top, height, background: bg, borderLeftColor: ev.color, color: ev.color }}
                    onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                  >
                    <div className="cal-event-time">{fmtTime(ev.hour, ev.min)}</div>
                    {height > 40 && <div className="cal-event-name">{ev.pet} · {ev.owner.split(" ")[0]}</div>}
                    {height > 60 && <div className="cal-event-service">{ev.service}</div>}
                  </div>
                );
              })}

              {/* Now line */}
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
function DayView({ base, onEventClick }: { base: Date; onEventClick: (ev: CalEvent) => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const ws = getWeekStart(base);
  const offset = Math.round((base.getTime() - ws.getTime()) / 86400000);
  const evs = CAL_EVENTS.filter(e => e.dayOff === offset);
  const isToday = isSameDay(base, TODAY);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = (9 - HOURS[0]) * HOUR_H - 20;
  }, []);

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
            const top = (ev.hour - HOURS[0]) * HOUR_H + (ev.min / 60) * HOUR_H;
            const height = Math.max(24, (ev.dur / 60) * HOUR_H);
            const bg = hexToRgba(ev.color, 0.13);
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
            <div className="cal-now-line" style={{ top: (11.25 - HOURS[0]) * HOUR_H }}>
              <div className="cal-now-dot" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Month view ─────────────────────────────────────────────────────────────────
function MonthView({ base, onDrillDay }: { base: Date; onDrillDay: (date: Date) => void }) {
  const firstOfMonth = new Date(base.getFullYear(), base.getMonth(), 1);
  const startDay = (firstOfMonth.getDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(base.getFullYear(), base.getMonth(), i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const ws = getWeekStart(TODAY);

  return (
    <div className="cal-month-wrap">
      <div className="cal-month-day-names">
        {DAY_NAMES.map(d => <div key={d} className="cal-month-day-name">{d}</div>)}
      </div>
      <div className="cal-month-grid">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="cal-month-cell empty" />;
          const isToday = isSameDay(d, TODAY);
          const isOther = d.getMonth() !== base.getMonth();
          // find events: for month view map dayOff relative to TODAY's week
          const dOffset = Math.round((d.getTime() - ws.getTime()) / 86400000);
          const evs = CAL_EVENTS.filter(e => e.dayOff === dOffset % 7 && dOffset >= 0 && dOffset < 7);

          return (
            <div
              key={i}
              className={`cal-month-cell${isToday ? " today" : ""}${isOther ? " other-month" : ""}`}
              onClick={() => onDrillDay(d)}
            >
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
function MiniMonth({ base, view, onDayClick }: {
  base: Date; view: string; onDayClick: (d: Date) => void;
}) {
  const [mini, setMini] = useState(new Date(base.getFullYear(), base.getMonth(), 1));

  const firstOfMonth = new Date(mini.getFullYear(), mini.getMonth(), 1);
  const startDay = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(mini.getFullYear(), mini.getMonth() + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(mini.getFullYear(), mini.getMonth(), i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const ws = getWeekStart(base);
  const we = new Date(ws); we.setDate(ws.getDate() + 6);

  const prev = () => setMini(new Date(mini.getFullYear(), mini.getMonth() - 1, 1));
  const next = () => setMini(new Date(mini.getFullYear(), mini.getMonth() + 1, 1));

  return (
    <div className="mini-month">
      <div className="mini-month-header">
        <button className="mini-month-nav" onClick={prev}>‹</button>
        <span className="mini-month-title">{MONTH_NAMES[mini.getMonth()].slice(0,3)} {mini.getFullYear()}</span>
        <button className="mini-month-nav" onClick={next}>›</button>
      </div>
      <div className="mini-month-day-names">
        {["M","T","W","T","F","S","S"].map((d, i) => <div key={i} className="mini-day-name">{d}</div>)}
      </div>
      <div className="mini-month-grid">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="mini-day empty" />;
          const isToday = isSameDay(d, TODAY);
          const inWeek = view === "week" && d >= ws && d <= we;
          const isSelected = isSameDay(d, base);
          return (
            <div
              key={i}
              onClick={() => onDayClick(d)}
              className={`mini-day${isToday ? " today" : ""}${inWeek ? " in-week" : ""}${isSelected ? " selected" : ""}`}
            >{d.getDate()}</div>
          );
        })}
      </div>
    </div>
  );
}

// ── Agenda ─────────────────────────────────────────────────────────────────────
function AgendaPanel({ onEventClick }: { onEventClick: (ev: CalEvent) => void }) {
  const sorted = [...CAL_EVENTS]
    .filter(e => e.status !== "cancelled")
    .sort((a, b) => a.dayOff - b.dayOff || a.hour - b.hour || a.min - b.min);

  return (
    <div className="agenda-panel">
      <div className="agenda-header">
        <span className="agenda-title">Agenda</span>
        <span className="agenda-date-label">This week</span>
      </div>
      <div className="agenda-list">
        {sorted.map(ev => (
          <div key={ev.id} className="agenda-item" onClick={() => onEventClick(ev)} style={{ cursor: "pointer" }}>
            <div className="agenda-item-dot" style={{ background: ev.color }} />
            <div className="agenda-item-info">
              <div className="agenda-item-pet">{ev.pet} · {ev.owner.split(" ")[0]}</div>
              <div className="agenda-item-svc">{ev.service}</div>
            </div>
            <div className="agenda-item-time">
              <div className="agenda-item-day">{DAY_NAMES[ev.dayOff]}</div>
              <div className="agenda-item-hour">{fmtTime(ev.hour, ev.min)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Booking detail full-page view ─────────────────────────────────────────────
function BookingDetailView({ ev, onBack }: { ev: CalEvent; onBack: () => void }) {
  const detail = BK_DETAILS[ev.id] ?? {
    bookingId: "BK???", amount: 0, category: "Service",
    pet: { breed: "Unknown", age: "—", weight: "—", visits: 0, lastSeen: "—" },
    customer: { name: ev.owner, phone: "—", email: "—" },
  };
  const [status, setStatus] = useState<CalEvent["status"]>(ev.status);

  const dayLabel = DAY_NAMES[ev.dayOff] ?? "—";
  const timeStr  = `${dayLabel}, ${fmtTime(ev.hour, ev.min)} · ${fmtDur(ev.dur)}`;

  const statusColor =
    status === "confirmed"   ? "#22c55e" :
    status === "in-progress" ? "#17A8FF" :
    status === "completed"   ? "#64748b" : "#ef4444";
  const statusLabel =
    status === "in-progress" ? "In Progress" :
    status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <main className="vd-main" style={{ overflow: "hidden" }}>
      <div className="bkd-page">

        {/* Back */}
        <button className="bkd-back" onClick={onBack}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style={{ marginRight: 6 }}>
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Calendar
        </button>

        {/* Header card */}
        <div className="bkd-header-card">
          <div style={{ display:"flex", alignItems:"center", gap:16, flex:1, minWidth:0 }}>
            <div className="bkd-header-avatar" style={{ background: ev.color }}>{ev.pet[0]}</div>
            <div style={{ minWidth:0 }}>
              <div className="bkd-header-title">{ev.pet} — {ev.service}</div>
              <div className="bkd-header-meta">
                <span className="bkd-status-pill" style={{ color: statusColor, background: `${statusColor}18` }}>{statusLabel}</span>
                <span className="bkd-meta-dot" />
                <span className="bkd-meta-text">{detail.bookingId}</span>
                <span className="bkd-meta-dot" />
                <span className="bkd-meta-text">{timeStr}</span>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
            <span className="bkd-category-tag">{detail.category}</span>
            <div className="bkd-header-price">฿{detail.amount.toLocaleString()}</div>
          </div>
        </div>

        {/* Body */}
        <div className="bkd-body">

          {/* ── Left column ── */}
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
                  <div className="bkd-row-value">{timeStr}</div>
                </div>
              </div>
              <div className="bkd-row">
                <div className="bkd-row-icon">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <path d="M2 4h12M2 8h8M2 12h10" stroke="#17A8FF" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  <div>
                    <div className="bkd-row-label">Service</div>
                    <div className="bkd-row-value" style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {ev.service}
                      <span className="bkd-service-tag">{detail.category}</span>
                    </div>
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
                  <div className="bkd-row-value bkd-amount">฿{detail.amount.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Pet Profile */}
            <div className="bkd-panel">
              <div className="bkd-panel-title">Pet Profile</div>
              {/* Tinted card: identity + stats row */}
              <div className="bkd-pet-card">
                <div className="bkd-pet-identity">
                  <div className="bkd-pet-avatar" style={{ background: hexToRgba(ev.color, 0.18), color: ev.color }}>{ev.pet[0]}</div>
                  <div>
                    <div className="bkd-pet-name">{ev.pet}</div>
                    <div className="bkd-pet-breed">{detail.pet.breed}</div>
                  </div>
                </div>
                <div className="bkd-pet-stats">
                  {([
                    { label:"Age",       val: detail.pet.age },
                    { label:"Weight",    val: detail.pet.weight },
                    { label:"Visits",    val: String(detail.pet.visits) },
                    { label:"Last Seen", val: detail.pet.lastSeen },
                  ] as { label: string; val: string }[]).map(s => (
                    <div key={s.label} className="bkd-pet-stat">
                      <div className="bkd-pet-stat-label">{s.label}</div>
                      <div className="bkd-pet-stat-val">{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
              {detail.pet.notes && (
                <div className="bkd-pet-note">
                  <svg viewBox="0 0 16 16" fill="none" width="13" height="13" style={{ flexShrink:0, marginTop:1 }}>
                    <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 7v4M8 5.5v.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {detail.pet.notes}
                </div>
              )}
            </div>

            {/* Customer */}
            <div className="bkd-panel">
              <div className="bkd-panel-title">Customer</div>
              <div className="bkd-cust-list">
                {/* Name */}
                <div className="bkd-cust-row">
                  <div className="bkd-cust-icon">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <circle cx="8" cy="5" r="3" stroke="#17A8FF" strokeWidth="1.4"/>
                      <path d="M2 13c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="#17A8FF" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="bkd-cust-label">Name</div>
                    <div className="bkd-cust-value">{detail.customer.name}</div>
                  </div>
                </div>
                {/* Phone */}
                <div className="bkd-cust-row">
                  <div className="bkd-cust-icon">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <path d="M3 2h3l1.5 3.5L6 7a9 9 0 003 3l1.5-1.5L14 10v3a1 1 0 01-1 1A11 11 0 013 3a1 1 0 011-1z" stroke="#17A8FF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="bkd-cust-label">Phone</div>
                    <div className="bkd-cust-value bkd-cust-phone">{detail.customer.phone}</div>
                  </div>
                </div>
                {/* Email */}
                <div className="bkd-cust-row" style={{ borderBottom:"none" }}>
                  <div className="bkd-cust-icon">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <rect x="1" y="3" width="14" height="10" rx="2" stroke="#17A8FF" strokeWidth="1.4"/>
                      <path d="M1 6l7 4 7-4" stroke="#17A8FF" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="bkd-cust-label">Email</div>
                    <div className="bkd-cust-value">{detail.customer.email}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Actions sidebar ── */}
          <div className="bkd-aside">
            <div className="bkd-panel">
              <div className="bkd-panel-title">Actions</div>
              {status === "confirmed" && (
                <button className="bkd-action-primary" onClick={() => setStatus("in-progress")}>
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style={{ flexShrink:0 }}>
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Check in
                </button>
              )}
              {status === "in-progress" && (
                <button className="bkd-action-primary" style={{ background:"#22c55e" }} onClick={() => setStatus("completed")}>
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
                <button className="bkd-action-danger" onClick={() => setStatus("cancelled")}>
                  Cancel booking
                </button>
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

// ── Main page ──────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const [view,     setView]     = useState<"week" | "day" | "month">("week");
  const [base,     setBase]     = useState(new Date(TODAY));
  const [selected, setSelected] = useState<CalEvent | null>(null);

  // Show full-page booking detail when an event is selected
  if (selected) {
    return <BookingDetailView ev={selected} onBack={() => setSelected(null)} />;
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

        {/* ── Main calendar area ── */}
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
                <CalHeading view={view} base={base} />
              </div>
            </div>
            <div className="cal-toolbar-right">
              <button className="cal-today-btn" onClick={() => setBase(new Date(TODAY))}>Today</button>
              <div className="cal-view-group">
                {(["day", "week", "month"] as const).map(v => (
                  <button
                    key={v}
                    className={`cal-view-btn${view === v ? " active" : ""}`}
                    onClick={() => setView(v)}
                  >{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                ))}
              </div>
              <div className="cal-legend">
                <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background: "#22c55e" }} />Confirmed</div>
                <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background: "#17A8FF" }} />In progress</div>
                <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background: "#64748b" }} />Completed</div>
              </div>
            </div>
          </div>

          {/* View */}
          <div className="cal-view-wrap">
            {view === "week"  && <WeekView  base={base} onEventClick={setSelected} onDrillDay={drillDay} />}
            {view === "day"   && <DayView   base={base} onEventClick={setSelected} />}
            {view === "month" && <MonthView base={base} onDrillDay={drillDay} />}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="cal-sidebar-panel">
          <MiniMonth
            base={base}
            view={view}
            onDayClick={(d) => { setBase(d); if (view !== "month") setView("day"); }}
          />
          <AgendaPanel onEventClick={setSelected} />
        </div>

      </div>

    </main>
  );
}
