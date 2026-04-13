"use client";

import { useState } from "react";

// ── Mock data ─────────────────────────────────────────────────────────────────
const bookings = [
  { id: "BK001", owner: "Natthida P.", service: "Full Grooming",    date: "Today",    amount: "฿630",   color: "#17A8FF", initials: "N", status: "confirmed" },
  { id: "BK002", owner: "Krit W.",     service: "Day Care (Full)",  date: "Today",    amount: "฿800",   color: "#F5A623", initials: "K", status: "confirmed" },
  { id: "BK003", owner: "Pim R.",      service: "Training Session", date: "Today",    amount: "฿680",   color: "#003459", initials: "P", status: "confirmed" },
  { id: "BK004", owner: "Suda C.",     service: "Cat Grooming",     date: "Tomorrow", amount: "฿525",   color: "#0B93E8", initials: "S", status: "confirmed" },
  { id: "BK005", owner: "Tong V.",     service: "Full Grooming",    date: "Tomorrow", amount: "฿630",   color: "#22c55e", initials: "T", status: "confirmed" },
  { id: "BK006", owner: "May L.",      service: "Boarding (2n)",    date: "Dec 22",   amount: "฿1,800", color: "#8b5cf6", initials: "M", status: "confirmed" },
];

const revenueWeeks = [
  { label: "Mon", val: 4200 }, { label: "Tue", val: 6800 }, { label: "Wed", val: 5100 },
  { label: "Thu", val: 9200 }, { label: "Fri", val: 7600 }, { label: "Sat", val: 12400 }, { label: "Sun", val: 8900 },
];
const revenueMonths = [
  { label: "Jul", val: 28000 }, { label: "Aug", val: 31000 }, { label: "Sep", val: 29500 },
  { label: "Oct", val: 35000 }, { label: "Nov", val: 38500 }, { label: "Dec", val: 42800 },
];

const SVC_BREAKDOWN = [
  { name: "Grooming", color: "#17A8FF", pct: "52%" },
  { name: "Day Care",  color: "#22c55e", pct: "24%" },
  { name: "Training",  color: "#F5A623", pct: "14%" },
  { name: "Boarding",  color: "#8b5cf6", pct: "10%" },
];

// Donut segments — rotate(-90) shifts start to 12 o'clock, negative offset advances each segment
const CIRC = 2 * Math.PI * 38;
function buildDonut() {
  const slices = [
    { color:"#17A8FF", pct:0.52 },
    { color:"#22c55e", pct:0.24 },
    { color:"#F5A623", pct:0.14 },
    { color:"#8b5cf6", pct:0.10 },
  ];
  let acc = 0;
  return slices.map(s => {
    const len    = s.pct * CIRC;
    const offset = -acc;          // negative = advance start point clockwise past previous segments
    acc += len;
    return { color: s.color, dasharray: `${len.toFixed(2)} ${CIRC.toFixed(2)}`, dashoffset: offset };
  });
}
const DONUT_SEGS = buildDonut();

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RevenuePage() {
  const [chartMode, setChartMode] = useState<"week" | "month">("week");

  const chartData   = chartMode === "week" ? revenueWeeks : revenueMonths;
  const maxVal      = Math.max(...chartData.map(d => d.val));
  const chartTotal  = chartData.reduce((s, d) => s + d.val, 0).toLocaleString();
  const chartLabel  = chartMode === "week" ? `This week · Total ฿${chartTotal}` : `6 months · Total ฿${chartTotal}`;

  return (
    <main className="ovw-main">
      <div className="ovw-content">

        {/* ── Stat cards ── */}
        <div className="stats-row">
          {[
            { label: "This Month",      value: "฿42,800", change: "↑ 18% vs last month",  dir: "up",      icon: `<path d="M2 12l3.5-4 3 2.5L12 5l2 2" stroke="#17A8FF" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>` },
            { label: "This Week",       value: "฿12,400", change: "↑ 8% vs last week",     dir: "up",      icon: `<rect x="1" y="2" width="14" height="12" rx="2" stroke="#17A8FF" stroke-width="1.4"/><path d="M5 1v2M11 1v2M1 6h14" stroke="#17A8FF" stroke-width="1.4" stroke-linecap="round"/>` },
            { label: "Avg. per Booking",value: "฿693",    change: "Up from ฿641",           dir: "up",      icon: `<circle cx="8" cy="8" r="6" stroke="#17A8FF" stroke-width="1.4"/><path d="M8 5v3l2 2" stroke="#17A8FF" stroke-width="1.4" stroke-linecap="round"/>` },
            { label: "Pending Payout",  value: "฿8,960",  change: "Transfers in 2 days",    dir: "neutral", icon: `<path d="M8 2v12M4 6l4-4 4 4" stroke="#17A8FF" stroke-width="1.4" stroke-linecap="round"/>` },
          ].map(c => (
            <div key={c.label} className="stat-card">
              <div className="stat-card-label">
                {c.label}
                <div className="stat-card-icon">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14" dangerouslySetInnerHTML={{ __html: c.icon }} />
                </div>
              </div>
              <div className="stat-card-num">{c.value}</div>
              <div className={`stat-card-change ${c.dir === "up" ? "change-up" : "change-neutral"}`}>{c.change}</div>
            </div>
          ))}
        </div>

        {/* ── Chart + donut ── */}
        <div className="grid-3-1">
          {/* Revenue trend */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Revenue trend</div>
              <div style={{ display:"flex", gap:6 }}>
                {(["week","month"] as const).map(m => (
                  <button key={m} onClick={() => setChartMode(m)} style={{
                    padding:"5px 14px", borderRadius:100, fontSize:11, fontWeight:500,
                    fontFamily:"'Lexend Deca',sans-serif", cursor:"pointer", transition:"all 0.15s",
                    border: chartMode === m ? "1.5px solid #00171F" : "1.5px solid #d4e6f0",
                    background: chartMode === m ? "#fff" : "transparent",
                    color: chartMode === m ? "#00171F" : "#7eb5d6",
                  }}>
                    {m === "week" ? "Week" : "6 months"}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-wrap">
              <div className="chart-total-label">{chartLabel}</div>
              <div className="chart-bars-row" style={{ height: 160 }}>
                {chartData.map((d, i) => (
                  <div key={i} className="chart-bar-group">
                    <div
                      className={`chart-bar${i === chartData.length - 1 ? " active" : ""}`}
                      style={{ height: `${Math.round((d.val / maxVal) * 100)}%` }}>
                      <div className="chart-bar-tooltip">฿{d.val.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {chartData.map((d, i) => (
                  <div key={i} className="chart-label" style={{ flex: 1 }}>{d.label}</div>
                ))}
              </div>
            </div>
          </div>

          {/* By service */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">By service</div>
            </div>
            <div style={{ padding: "16px 22px 20px" }}>
              <svg width="140" height="140" viewBox="0 0 120 120" style={{ display:"block", margin:"0 auto 16px" }}>
                {/* rotate(-90 60 60) moves the circle's start from 3 o'clock to 12 o'clock */}
                <g transform="rotate(-90 60 60)">
                  {DONUT_SEGS.map((s, i) => (
                    <circle key={i} cx="60" cy="60" r="38"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="20"
                      strokeDasharray={s.dasharray}
                      strokeDashoffset={s.dashoffset}
                    />
                  ))}
                </g>
                {/* Center hole + label (not rotated) */}
                <circle cx="60" cy="60" r="27" fill="#fff" />
                <text x="60" y="57" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#00171F" fontFamily="'Lexend Deca',sans-serif">฿42.8k</text>
                <text x="60" y="68" textAnchor="middle" fontSize="8" fill="#7eb5d6" fontFamily="'Lexend Deca',sans-serif">total</text>
              </svg>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {SVC_BREAKDOWN.map(s => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: "#5a8fa8", flex: 1 }}>{s.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#00171F" }}>{s.pct}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent transactions ── */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Recent transactions</div>
            <div className="panel-action">Export</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ color: "#17A8FF", fontWeight: 500 }}>{b.id}</td>
                    <td>
                      <span className="td-avatar" style={{ background: b.color }}>{b.initials}</span>
                      {b.owner}
                    </td>
                    <td>{b.service}</td>
                    <td>{b.date}</td>
                    <td style={{ fontWeight: 600 }}>{b.amount}</td>
                    <td>
                      <span className={`badge ${b.status === "confirmed" ? "badge-confirmed" : b.status === "cancelled" ? "badge-cancelled" : "badge-completed"}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
