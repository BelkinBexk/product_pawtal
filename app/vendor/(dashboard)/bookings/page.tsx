"use client";

import { useState, useMemo, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type BookingStatus = "confirmed" | "in-progress" | "completed" | "cancelled" | "pending";

type Booking = {
  id: string; petName: string; avatarBg: string;
  owner: string; breed: string; hasHealth: boolean;
  service: string; serviceCategory: string; serviceColor: string; serviceBg: string;
  time: string; dur: string; amount: number; ref: string;
  status: BookingStatus; dayGroup: string; dayLabel: string;
  pet: { age: string; weight: string; visits: number; lastSeen: string; notes?: string };
  customer: { name: string; phone: string; email: string };
};

type TableRow = { type: "group"; label: string } | { type: "row"; booking: Booking };

// ── Mock data ─────────────────────────────────────────────────────────────────
const BOOKINGS: Booking[] = [
  { id:"BK001", petName:"Mochi",  avatarBg:"#22c55e", owner:"Natthida P.", breed:"Shiba Inu",        hasHealth:true,  service:"Full Grooming",   serviceCategory:"Grooming",  serviceColor:"#16a34a", serviceBg:"#dcfce7", time:"10:00am", dur:"1h 30m",  amount:630,  ref:"BK001", status:"in-progress", dayGroup:"today", dayLabel:"TUE 24 DEC — TODAY", pet:{ age:"3 yrs", weight:"8 kg",  visits:8, lastSeen:"Dec 10", notes:"No known allergies. Slightly anxious with dryers — use low heat." }, customer:{ name:"Natthida P.", phone:"+66 81 234 5678", email:"natthida.p@gmail.com" } },
  { id:"BK004", petName:"Nala",   avatarBg:"#17A8FF", owner:"Suda C.",     breed:"Scottish Fold",    hasHealth:true,  service:"Cat Grooming",    serviceCategory:"Grooming",  serviceColor:"#0369a1", serviceBg:"#e0f2fe", time:"9:30am",  dur:"1h",      amount:525,  ref:"BK004", status:"confirmed",   dayGroup:"today", dayLabel:"TUE 24 DEC — TODAY", pet:{ age:"4 yrs", weight:"4 kg",  visits:6, lastSeen:"Dec 16", notes:"Dislikes strangers. Handle slowly. No clipping near ears." }, customer:{ name:"Suda C.", phone:"+66 81 999 0000", email:"suda.c@gmail.com" } },
  { id:"BK005", petName:"Max",    avatarBg:"#22c55e", owner:"Tong V.",     breed:"Golden Retriever", hasHealth:false, service:"Full Grooming",   serviceCategory:"Grooming",  serviceColor:"#16a34a", serviceBg:"#dcfce7", time:"11:00am", dur:"1h",      amount:630,  ref:"BK005", status:"confirmed",   dayGroup:"today", dayLabel:"TUE 24 DEC — TODAY", pet:{ age:"3 yrs", weight:"28 kg", visits:6, lastSeen:"Dec 10" },                                                                             customer:{ name:"Tong V.", phone:"+66 85 333 4444", email:"tong.v@gmail.com" } },
  { id:"BK002", petName:"Luna",   avatarBg:"#17A8FF", owner:"Krit W.",     breed:"Border Collie",    hasHealth:false, service:"Day Care (Full)", serviceCategory:"Day Care",  serviceColor:"#0369a1", serviceBg:"#e0f2fe", time:"2:30pm",  dur:"2h",      amount:800,  ref:"BK002", status:"confirmed",   dayGroup:"today", dayLabel:"TUE 24 DEC — TODAY", pet:{ age:"2 yrs", weight:"18 kg", visits:5, lastSeen:"Dec 5",  notes:"Very energetic. Good with other dogs. No health issues." },          customer:{ name:"Krit W.", phone:"+66 89 876 5432", email:"krit.w@hotmail.com" } },
  { id:"BK003", petName:"Buddy",  avatarBg:"#f59e0b", owner:"Pim R.",      breed:"French Bulldog",   hasHealth:false, service:"Training",        serviceCategory:"Training",  serviceColor:"#b45309", serviceBg:"#fef3c7", time:"4:00pm",  dur:"1h",      amount:680,  ref:"BK003", status:"pending",     dayGroup:"today", dayLabel:"TUE 24 DEC — TODAY", pet:{ age:"1 yr",  weight:"10 kg", visits:5, lastSeen:"Dec 19", notes:"Responds well to treats. Keep sessions short." },                     customer:{ name:"Pim R.", phone:"+66 92 111 2222", email:"pim.r@outlook.com" } },
  { id:"BK007", petName:"Bella",  avatarBg:"#17A8FF", owner:"Arm K.",      breed:"Labrador",         hasHealth:true,  service:"Day Care (Full)", serviceCategory:"Day Care",  serviceColor:"#0369a1", serviceBg:"#e0f2fe", time:"8:00am",  dur:"All day", amount:800,  ref:"BK007", status:"confirmed",   dayGroup:"wed",   dayLabel:"WED 25 DEC",         pet:{ age:"1 yr",  weight:"18 kg", visits:2, lastSeen:"Dec 01", notes:"First few visits. Needs gentle handling." },                          customer:{ name:"Arm K.", phone:"+66 88 777 8888", email:"arm.k@gmail.com" } },
  { id:"BK006", petName:"Coco",   avatarBg:"#8b5cf6", owner:"May L.",      breed:"Toy Poodle",       hasHealth:true,  service:"Boarding",        serviceCategory:"Boarding",  serviceColor:"#6d28d9", serviceBg:"#ede9fe", time:"All day", dur:"2 nights",amount:1800, ref:"BK006", status:"confirmed",   dayGroup:"wed",   dayLabel:"WED 25 DEC",         pet:{ age:"2 yrs", weight:"3 kg",  visits:2, lastSeen:"Dec 08", notes:"Takes anxiety medication (provided by owner). Needs 2 meals/day." }, customer:{ name:"May L.", phone:"+66 93 444 5566", email:"may.lucky@gmail.com" } },
  { id:"BK008", petName:"Mochi",  avatarBg:"#22c55e", owner:"Natthida P.", breed:"Shiba Inu",        hasHealth:true,  service:"Nail Trim",       serviceCategory:"Grooming",  serviceColor:"#16a34a", serviceBg:"#dcfce7", time:"10:00am", dur:"30m",     amount:220,  ref:"BK008", status:"confirmed",   dayGroup:"sat",   dayLabel:"SAT 28 DEC",         pet:{ age:"3 yrs", weight:"8 kg",  visits:9, lastSeen:"Dec 10", notes:"No known allergies. Slightly anxious with dryers — use low heat." }, customer:{ name:"Natthida P.", phone:"+66 81 234 5678", email:"natthida.p@gmail.com" } },
  { id:"BK009", petName:"Luna",   avatarBg:"#f59e0b", owner:"Krit W.",     breed:"Border Collie",    hasHealth:false, service:"Bath & Blowdry",  serviceCategory:"Grooming",  serviceColor:"#b45309", serviceBg:"#fef3c7", time:"11:00am", dur:"1h",      amount:550,  ref:"BK009", status:"completed",   dayGroup:"sat",   dayLabel:"SAT 28 DEC",         pet:{ age:"2 yrs", weight:"18 kg", visits:4, lastSeen:"Dec 18" },                                                                             customer:{ name:"Krit W.", phone:"+66 89 876 5432", email:"krit.w@hotmail.com" } },
];

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

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
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

  const update = (s: BookingStatus) => { setStatus(s); onStatusChange(booking.id, s); };

  return (
    <main className="vd-main" style={{ overflow:"hidden" }}>
      <div className="bkd-page">

        {/* Back */}
        <button className="bkd-back" onClick={onBack}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style={{ marginRight:6 }}>
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Bookings
        </button>

        {/* Header card */}
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
                  <div className="bkd-row-value">{booking.time} · {booking.dur}</div>
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
                  <div>
                    <div className="bkd-cust-label">Name</div>
                    <div className="bkd-cust-value">{booking.customer.name}</div>
                  </div>
                </div>
                <div className="bkd-cust-row">
                  <div className="bkd-cust-icon">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <path d="M3 2h3l1.5 3.5L6 7a9 9 0 003 3l1.5-1.5L14 10v3a1 1 0 01-1 1A11 11 0 013 3a1 1 0 011-1z" stroke="#17A8FF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="bkd-cust-label">Phone</div>
                    <div className="bkd-cust-value bkd-cust-phone">{booking.customer.phone}</div>
                  </div>
                </div>
                <div className="bkd-cust-row" style={{ borderBottom:"none" }}>
                  <div className="bkd-cust-icon">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <rect x="1" y="3" width="14" height="10" rx="2" stroke="#17A8FF" strokeWidth="1.4"/>
                      <path d="M1 6l7 4 7-4" stroke="#17A8FF" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="bkd-cust-label">Email</div>
                    <div className="bkd-cust-value">{booking.customer.email}</div>
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
                <button className="bkd-action-danger" onClick={() => update("cancelled")}>
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [statusTab,  setStatusTab]  = useState<string>("All");
  const [datePreset, setDatePreset] = useState("today");
  const [drOpen,     setDrOpen]     = useState(false);
  const [search,     setSearch]     = useState("");
  const [statuses,   setStatuses]   = useState<Record<string, BookingStatus>>({});
  const [selected,   setSelected]   = useState<Booking | null>(null);
  const drRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (drRef.current && !drRef.current.contains(e.target as Node)) setDrOpen(false);
    };
    if (drOpen) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [drOpen]);

  const getStatus = (b: Booking): BookingStatus => statuses[b.id] ?? b.status;

  const handleStatusChange = (id: string, s: BookingStatus) =>
    setStatuses(prev => ({ ...prev, [id]: s }));

  const dateFiltered = useMemo(() => {
    if (datePreset === "today")     return BOOKINGS.filter(b => b.dayGroup === "today");
    if (datePreset === "yesterday") return [];
    return BOOKINGS;
  }, [datePreset]);

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
  }, [dateFiltered, statusTab, search, statuses]);

  const counts = useMemo(() => ({
    "All":         dateFiltered.length,
    "Confirmed":   dateFiltered.filter(b => getStatus(b) === "confirmed").length,
    "In Progress": dateFiltered.filter(b => getStatus(b) === "in-progress").length,
    "Completed":   dateFiltered.filter(b => getStatus(b) === "completed").length,
    "Cancelled":   dateFiltered.filter(b => getStatus(b) === "cancelled").length,
  }), [dateFiltered, statuses]);

  const tableRows = useMemo<TableRow[]>(() => {
    const rows: TableRow[] = [];
    for (const b of filtered) rows.push({ type:"row", booking:b });
    return rows;
  }, [filtered]);

  const dateLabel = DATE_PRESETS.find(p => p.key === datePreset)?.label ?? "Today";

  // Show detail view — must be after all hooks
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

        {/* Page title */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:20, fontWeight:700, color:"var(--text)", letterSpacing:"-0.5px" }}>Bookings · {dateLabel}</div>
          <div style={{ fontSize:12, color:"var(--muted)", fontWeight:300, marginTop:2 }}>
            {filtered.length} appointment{filtered.length !== 1 ? "s" : ""} in range
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
              {tableRows.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign:"center", padding:"48px 24px", color:"var(--muted)", fontSize:13 }}>No bookings found.</td></tr>
              ) : tableRows.map((row, i) => {
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
