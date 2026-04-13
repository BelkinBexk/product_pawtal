"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type TabKey  = "info" | "hours" | "photos";
type DayHour = { day: string; open: boolean; from: string; to: string };

// ── Constants ─────────────────────────────────────────────────────────────────
const AREAS = ["Sukhumvit", "Silom", "Siam", "Ari", "Thonglor", "Ekkamai", "On Nut", "Lat Phrao", "Chatuchak"];
const SERVICE_TYPES = ["Grooming", "Day Care", "Training", "Boarding", "Veterinary"];

const TIMES: string[] = [];
for (let h = 7; h <= 22; h++) {
  TIMES.push(`${String(h).padStart(2, "0")}:00`);
  TIMES.push(`${String(h).padStart(2, "0")}:30`);
}

const INIT_HOURS: DayHour[] = [
  { day: "Monday",    open: true,  from: "09:00", to: "18:00" },
  { day: "Tuesday",   open: true,  from: "09:00", to: "18:00" },
  { day: "Wednesday", open: true,  from: "09:00", to: "18:00" },
  { day: "Thursday",  open: true,  from: "09:00", to: "18:00" },
  { day: "Friday",    open: true,  from: "09:00", to: "18:00" },
  { day: "Saturday",  open: true,  from: "10:00", to: "17:00" },
  { day: "Sunday",    open: false, from: "10:00", to: "17:00" },
];

const MOCK_LOGOS = [
  { id: "logo1", label: "Paw",      bg: "#17A8FF", emoji: "🐾" },
  { id: "logo2", label: "Star",     bg: "#F5A623", emoji: "⭐" },
  { id: "logo3", label: "Heart",    bg: "#f43f5e", emoji: "♥" },
  { id: "logo4", label: "Leaf",     bg: "#22c55e", emoji: "🍃" },
  { id: "logo5", label: "Crown",    bg: "#8b5cf6", emoji: "👑" },
  { id: "logo6", label: "Scissors", bg: "#0B93E8", emoji: "✂️" },
];

const MOCK_COVERS = [
  { id: "cover1", label: "Ocean blue",    from: "#e8f4ff", to: "#c7e8ff" },
  { id: "cover2", label: "Mint teal",     from: "#e0fff8", to: "#b3ece1" },
  { id: "cover3", label: "Soft purple",   from: "#f3e8ff", to: "#ddc9ff" },
  { id: "cover4", label: "Fresh green",   from: "#dcfce7", to: "#bbf7d0" },
];

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, success }: { msg: string; success: boolean }) {
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      background: success ? "#16a34a" : "#00171F", color: "#fff",
      fontSize: 13, fontWeight: 500, padding: "12px 24px",
      borderRadius: 100, zIndex: 999, whiteSpace: "nowrap",
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)", fontFamily: "'Lexend Deca', sans-serif",
    }}>
      {msg}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  // Tab
  const [tab, setTab] = useState<TabKey>("info");

  // Business info
  const [name,        setName]        = useState("Nong's Pet Spa");
  const [desc,        setDesc]        = useState("Premium pet grooming and spa in Sukhumvit. Specialising in dogs and cats of all breeds with a gentle, stress-free approach.");
  const [serviceType, setServiceType] = useState("Grooming");
  const [address,     setAddress]     = useState("Sukhumvit Soi 23, Bangkok");
  const [phone,       setPhone]       = useState("+66 81 234 5678");
  const [email,       setEmail]       = useState("nong@petspasukhumvit.com");
  const [lineId,      setLineId]      = useState("@nongpetspa");
  const [website,     setWebsite]     = useState("https://nongpetspa.com");
  const [selectedAreas, setSelectedAreas] = useState<string[]>(["Sukhumvit", "Thonglor"]);

  // Hours
  const [hours, setHours] = useState<DayHour[]>(INIT_HOURS);

  // Photos
  const [selectedLogo,    setSelectedLogo]    = useState<string>("logo1");
  const [selectedCover,   setSelectedCover]   = useState<string>("cover1");

  // Toast
  const [toast, setToast] = useState<{ msg: string; success: boolean } | null>(null);
  const showToast = (msg: string, success = false) => {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 2800);
  };

  // Progress
  const infoComplete   = !!(name && desc && address);
  const hoursComplete  = hours.some(h => h.open);
  const photosComplete = !!(selectedLogo || selectedCover);
  const progress = (infoComplete ? 40 : 0) + (hoursComplete ? 30 : 0) + (photosComplete ? 30 : 0);

  // Live preview helpers
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const isOpenToday = hours.some(h => h.day === today && h.open);
  const todayHours  = hours.find(h => h.day === today && h.open);
  const logoObj  = MOCK_LOGOS.find(l => l.id === selectedLogo);
  const coverObj = MOCK_COVERS.find(c => c.id === selectedCover);

  const toggleArea = (area: string) =>
    setSelectedAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);

  const toggleDay = (i: number) =>
    setHours(prev => prev.map((h, idx) => idx === i ? { ...h, open: !h.open } : h));

  const setHourTime = (i: number, field: "from" | "to", val: string) =>
    setHours(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: val } : h));

  const TAB_CONFIG: { key: TabKey; label: string; emoji: string; done: boolean }[] = [
    { key: "info",   label: "Business Info",   emoji: "📋", done: infoComplete   },
    { key: "hours",  label: "Opening Hours",   emoji: "🕐", done: hoursComplete  },
    { key: "photos", label: "Photos",          emoji: "🖼", done: photosComplete },
  ];

  return (
    <main className="ovw-main">
      <div className="ovw-content">

        {/* ── Header ── */}
        <div className="prof-header">
          <div>
            <div className="prof-title">Shop Profile</div>
            <div className="prof-sub">Configure your business information visible to customers</div>
          </div>
          <div className="prof-complete">
            <div className="prof-complete-pct">{progress}%</div>
            <div className="prof-complete-label">Complete</div>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="prof-progress-wrap">
          <div className="prof-progress-label">
            <div className="prof-progress-title">Setup Progress</div>
            <div className="prof-progress-pct">{progress}%</div>
          </div>
          <div className="prof-progress-track">
            <div className="prof-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="prof-progress-steps">
            {[
              { label: "Business Info (40%)",  done: infoComplete,   key: "info"   },
              { label: "Opening Hours (30%)",  done: hoursComplete,  key: "hours"  },
              { label: "Photos (30%)",         done: photosComplete, key: "photos" },
            ].map(s => (
              <div key={s.key} className={`prof-step ${s.done ? "done" : tab === s.key ? "active" : ""}`}>
                <div className="prof-step-dot" />
                {s.done ? `✓ ${s.label}` : s.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="prof-tabs">
          {TAB_CONFIG.map(t => (
            <button key={t.key} className={`prof-tab${tab === t.key ? " active" : ""}${t.done ? " done" : ""}`} onClick={() => setTab(t.key)}>
              <span className="prof-tab-check">{t.done ? "✓" : t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Two-column body ── */}
        <div className="prof-body">

          {/* Left — form column */}
          <div className="prof-form-col">

            {/* ── Business Info tab ── */}
            {tab === "info" && (
              <div className="prof-panel">
                <div className="prof-panel-body">

                  <div className="form-group">
                    <label className="form-label">Shop Name <span className="prof-req">*</span></label>
                    <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your shop name" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shop Description <span className="prof-req">*</span></label>
                    <textarea
                      className="form-input"
                      rows={4}
                      maxLength={300}
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                      placeholder="Introduce your shop, e.g. Professional grooming with 5 years experience..."
                      style={{ resize: "vertical" }}
                    />
                    <div className="form-char-count">{desc.length} / 300</div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Primary Service Type <span className="prof-req">*</span></label>
                      <select className="form-select" value={serviceType} onChange={e => setServiceType(e.target.value)}>
                        {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address <span className="prof-req">*</span></label>
                      <input className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, district, area" />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Phone Number <span className="prof-req">*</span></label>
                      <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0812345678" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email <span className="prof-req">*</span></label>
                      <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">LINE ID</label>
                      <input className="form-input" value={lineId} onChange={e => setLineId(e.target.value)} placeholder="@yourshop" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Website</label>
                      <input className="form-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourshop.com" />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Service Areas <span className="prof-req">*</span></label>
                    <div className="area-chips">
                      {AREAS.map(a => (
                        <button key={a} className={`area-chip${selectedAreas.includes(a) ? " selected" : ""}`} onClick={() => toggleArea(a)}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ── Opening Hours tab ── */}
            {tab === "hours" && (
              <div className="prof-panel">
                <div className="prof-panel-body">
                  <p className="prof-hint">Select the days and hours your shop is open</p>
                  {hours.map((h, i) => (
                    <div key={h.day} className={`oh-row${h.open ? " open" : ""}`}>
                      <label className="oh-toggle">
                        <input type="checkbox" checked={h.open} onChange={() => toggleDay(i)} />
                        <span className="oh-slider" />
                      </label>
                      <div className="oh-day">{h.day}</div>
                      {h.open ? (
                        <div className="oh-times">
                          <select className="oh-select" value={h.from} onChange={e => setHourTime(i, "from", e.target.value)}>
                            {TIMES.map(t => <option key={t}>{t}</option>)}
                          </select>
                          <span className="oh-dash">–</span>
                          <select className="oh-select" value={h.to} onChange={e => setHourTime(i, "to", e.target.value)}>
                            {TIMES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div className="oh-closed">Closed</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Photos tab ── */}
            {tab === "photos" && (
              <div className="prof-panel">
                <div className="prof-panel-body">

                  <div className="form-group">
                    <label className="form-label">
                      Shop Logo
                      <span className="prof-label-hint"> · recommended 400×400px</span>
                    </label>
                    <p className="prof-hint">Choose a style for your shop logo</p>
                    <div className="photo-picker-grid logos">
                      {MOCK_LOGOS.map(l => (
                        <div key={l.id} className={`photo-picker-item${selectedLogo === l.id ? " selected" : ""}`} onClick={() => setSelectedLogo(l.id)}>
                          <div style={{ height: 68, background: l.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{l.emoji}</div>
                          <div className="photo-picker-label">{l.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: 20, marginBottom: 0 }}>
                    <label className="form-label">
                      Cover Photo
                      <span className="prof-label-hint"> · recommended 1280×720px</span>
                    </label>
                    <p className="prof-hint">Choose a cover style for your shop page</p>
                    <div className="photo-picker-grid">
                      {MOCK_COVERS.map(c => (
                        <div key={c.id} className={`photo-picker-item${selectedCover === c.id ? " selected" : ""}`} onClick={() => setSelectedCover(c.id)}>
                          <div style={{ height: 80, background: `linear-gradient(135deg, ${c.from}, ${c.to})` }} />
                          <div className="photo-picker-label">{c.label}</div>
                        </div>
                      ))}
                      <div className="photo-picker-add" onClick={() => showToast("Photo upload coming soon!")}>
                        <div className="photo-picker-add-icon">+</div>
                        <div className="photo-picker-add-label">Upload photo</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ── Save bar ── */}
            <div className="prof-save-bar">
              <button className="prof-save-btn" onClick={() => showToast("Profile saved successfully!", true)}>
                Save Changes
              </button>
              <button className="prof-discard-btn" onClick={() => showToast("Changes discarded.")}>
                Discard
              </button>
            </div>

          </div>

          {/* Right — live preview (sticky) */}
          <div className="preview-col">
            <div className="preview-panel">

              {/* Header */}
              <div className="preview-header">
                <div className="preview-header-dot" style={{ background: isOpenToday ? "#22c55e" : "#e2e8f0" }} />
                <div className="preview-header-title">Customer Preview</div>
                <div className="preview-header-sub">Live · updates as you type</div>
              </div>

              {/* Shop card */}
              <div className="preview-card">

                {/* Cover + logo */}
                <div className="preview-cover" style={coverObj ? { background: `linear-gradient(135deg, ${coverObj.from}, ${coverObj.to})` } : {}}>
                  <div className="preview-logo-wrap">
                    <div className="preview-logo" style={logoObj ? { background: logoObj.bg } : {}}>
                      {logoObj ? logoObj.emoji : name[0] || "?"}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="preview-info">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div className="preview-shop-name">{name || "Shop name"}</div>
                    <span style={{ fontSize: 11, color: isOpenToday ? "#22c55e" : "#94a3b8", fontWeight: 500 }}>
                      {isOpenToday ? "Open now" : "Closed"}
                    </span>
                  </div>
                  <div className="preview-shop-desc">
                    {desc ? (desc.length > 75 ? desc.slice(0, 72) + "…" : desc) : "No description added yet."}
                  </div>
                  <div className="preview-tags">
                    <span className="preview-tag">{serviceType}</span>
                    {selectedAreas.slice(0, 2).map(a => (
                      <span key={a} className="preview-area-tag">{a}</span>
                    ))}
                  </div>
                  <div className="preview-meta">
                    <div className="preview-meta-item">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="#94a3b8" strokeWidth="1.3"/>
                        <path d="M8 5v3l2 2" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      {todayHours ? `${todayHours.from} – ${todayHours.to}` : "Hours not set"}
                    </div>
                    <div className="preview-meta-item">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2C5.24 2 3 4.24 3 7c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" stroke="#94a3b8" strokeWidth="1.3"/>
                      </svg>
                      {selectedAreas[0] || "Bangkok"}
                    </div>
                    <div className="preview-meta-item">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4 4.3 12.3l.7-4.1L2 5.3l4.2-.7z" stroke="#F5A623" strokeWidth="1.3"/>
                      </svg>
                      4.9 (128 reviews)
                    </div>
                  </div>
                </div>

              </div>

              {/* CTA buttons */}
              <div style={{ padding: "12px 16px", borderTop: "1px solid #e8f1f8", display: "flex", gap: 8 }}>
                <button style={{
                  flex: 1, padding: 9, background: "#17A8FF", color: "#fff",
                  border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  fontFamily: "'Lexend Deca', sans-serif", cursor: "default",
                }}>
                  Book Now
                </button>
                <button style={{
                  padding: "9px 14px", background: "#f4f8fc", color: "#94a3b8",
                  border: "1.5px solid #e8f1f8", borderRadius: 10, fontSize: 12,
                  fontFamily: "'Lexend Deca', sans-serif", cursor: "default",
                  display: "flex", alignItems: "center",
                }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="8" cy="5" r="3" stroke="#94a3b8" strokeWidth="1.3"/>
                  </svg>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} success={toast.success} />}

    </main>
  );
}
