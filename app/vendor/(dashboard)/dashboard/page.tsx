"use client";

import { useState } from "react";
import Link from "next/link";

// ── Mock data ─────────────────────────────────────────────────────────────────
const bookings = [
  { id: "BK001", pet: "Mochi", owner: "Natthida P.", service: "Full Grooming",    date: "Today",    time: "10:00",   status: "confirmed", amount: "฿630",   color: "#17A8FF", initials: "N" },
  { id: "BK002", pet: "Luna",  owner: "Krit W.",     service: "Day Care (Full)",  date: "Today",    time: "14:30",   status: "confirmed", amount: "฿800",   color: "#F5A623", initials: "K" },
  { id: "BK003", pet: "Buddy", owner: "Pim R.",      service: "Training Session", date: "Today",    time: "16:00",   status: "confirmed", amount: "฿680",   color: "#003459", initials: "P" },
  { id: "BK004", pet: "Nala",  owner: "Suda C.",     service: "Cat Grooming",     date: "Tomorrow", time: "09:30",   status: "confirmed", amount: "฿525",   color: "#0B93E8", initials: "S" },
  { id: "BK005", pet: "Max",   owner: "Tong V.",     service: "Full Grooming",    date: "Tomorrow", time: "11:00",   status: "confirmed", amount: "฿630",   color: "#22c55e", initials: "T" },
  { id: "BK006", pet: "Coco",  owner: "May L.",      service: "Boarding (2n)",    date: "Dec 22",   time: "All day", status: "confirmed", amount: "฿1,800", color: "#8b5cf6", initials: "M" },
  { id: "BK007", pet: "Bella", owner: "Arm K.",      service: "Day Care",         date: "Dec 23",   time: "08:00",   status: "confirmed", amount: "฿800",   color: "#f43f5e", initials: "A" },
];

const revenueWeeks = [
  { label: "Mon", val: 4200 }, { label: "Tue", val: 6800 }, { label: "Wed", val: 5100 },
  { label: "Thu", val: 9200 }, { label: "Fri", val: 7600 }, { label: "Sat", val: 12400 }, { label: "Sun", val: 8900 },
];

// Heatmap — 8am–6pm (11 hours) × Mon–Sun (7 days)
// Data indexed as [day][hour], same as HTML prototype
const HM_HOUR_LABELS = ["8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm"];
const HM_DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// Per-week data: key "0" = this week, "-1" = last week, "+1" = next week
// Each entry: 7 arrays (one per day), each with 11 values (one per hour)
const HM_DATA_STORE: Record<string, number[][]> = {
  "-1": [[1,1,3,2,1,1,2,2,1,0,0],[0,1,4,3,1,2,3,2,1,1,0],[0,1,2,2,1,1,2,1,0,0,0],[0,1,2,3,1,2,2,2,1,0,0],[1,1,3,4,2,2,3,3,1,1,1],[1,3,6,7,4,5,6,5,4,2,1],[1,2,4,5,2,3,4,3,2,2,0]],
   "0": [[1,2,4,3,1,2,3,2,1,1,0],[0,1,5,4,2,3,4,3,2,1,1],[1,2,3,3,1,2,2,2,1,0,0],[0,1,3,4,2,2,3,2,1,1,0],[1,2,4,5,2,3,4,3,2,2,1],[2,4,7,8,5,6,7,6,5,3,2],[1,2,5,6,3,4,5,4,3,2,1]],
   "1": [[1,2,3,3,1,2,2,2,1,1,0],[0,1,4,4,2,2,3,2,1,1,0],[1,1,3,3,1,2,2,2,1,0,0],[0,1,3,3,2,2,3,2,1,1,0],[1,2,4,4,2,3,3,3,2,1,1],[2,3,6,7,4,5,6,5,4,2,1],[1,2,4,5,3,3,5,4,3,2,1]],
};

function hmCellColor(v: number, maxVal: number) {
  if (v === 0) return "#f4f8fc";
  const p = v / maxVal;
  if (p < 0.2) return "#dbeeff";
  if (p < 0.4) return "#93cffe";
  if (p < 0.6) return "#4db5ff";
  if (p < 0.8) return "#17A8FF";
  return "#0B7AC8";
}

function computeHeatmapInsights(data: number[][]) {
  let peakDay = 0, peakHour = 0, peakVal = 0;
  const offSlots: { v: number; di: number; hi: number }[] = [];
  data.forEach((dayArr, di) => dayArr.forEach((v, hi) => {
    if (v > peakVal) { peakVal = v; peakDay = di; peakHour = hi; }
    if (hi >= 1 && hi <= 9) offSlots.push({ v, di, hi });
  }));
  offSlots.sort((a, b) => a.v - b.v);
  const seen = new Set<number>();
  const topOff = offSlots.filter(s => { if (seen.has(s.hi)) return false; seen.add(s.hi); return true; }).slice(0, 3);
  return { peakDay, peakHour, peakVal, topOff };
}

const todayBk = bookings.filter(b => b.date === "Today");
const upcoming = bookings.filter(b => b.date !== "Today" && b.status !== "cancelled").slice(0, 4);

// ── Overview Page ─────────────────────────────────────────────────────────────
export default function VendorDashboard() {
  const [hmOffset, setHmOffset] = useState(0); // 0=this week, -1=last, +1=next
  const heatmapData = HM_DATA_STORE[String(Math.max(-1, Math.min(1, hmOffset)))] ?? HM_DATA_STORE["0"];
  const hmMax = Math.max(...heatmapData.flat());
  const { peakDay, peakHour, peakVal, topOff } = computeHeatmapInsights(heatmapData);
  const hmWeekLabel = hmOffset === 0 ? "This week" : hmOffset === -1 ? "Last week" : "Next week";

  const pct = 95;
  const r = 21;
  const circ = +(2 * Math.PI * r).toFixed(2);
  const offset = +(circ * (1 - pct / 100)).toFixed(2);
  const maxBar = Math.max(...revenueWeeks.map(b => b.val));

  return (
    <main className="ovw-main">
      <div className="ovw-content">

        {/* ── 4 Stat cards ── */}
        <div className="stats-row">
          {/* Revenue card */}
          <div className="rev-card">
            <div className="rev-card-header">
              <div className="rev-card-label">Revenue</div>
              <div className="rev-card-icon">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <path d="M2 12l3.5-4 3 2.5L12 5l2 2" stroke="#17A8FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 14h12" stroke="#17A8FF" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <span className="rev-card-today-pill">Today</span>
            <div className="rev-card-main">฿2,110</div>
            <div className="rev-card-change">↑ +฿340 vs yesterday</div>
            <div className="rev-card-divider" />
            <div className="rev-card-row">
              <div className="rev-card-sub-label">This week</div>
              <div className="rev-card-sub-val">฿12,400</div>
            </div>
            <div className="rev-card-row">
              <div className="rev-card-sub-label">This month</div>
              <div className="rev-card-sub-val">฿42,800</div>
            </div>
          </div>

          {/* Bookings Today */}
          <div className="stat-card">
            <div className="stat-card-label">
              Bookings Today
              <div className="stat-card-icon">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <rect x="1" y="2" width="14" height="12" rx="2" stroke="#17A8FF" strokeWidth="1.4"/>
                  <path d="M5 1v2M11 1v2M1 6h14" stroke="#17A8FF" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div className="stat-card-num">3</div>
            <div className="stat-card-change change-up">↑ 3 confirmed today</div>
          </div>

          {/* Completion Rate */}
          <div className="completion-card">
            <div className="completion-card-header">
              <div className="completion-card-label">Completion Rate</div>
              <div className="stat-card-icon">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <path d="M13 3L6 11l-3-3" stroke="#17A8FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="completion-card-body">
              <div className="completion-ring-wrap">
                <svg viewBox="0 0 52 52">
                  <circle className="completion-ring-bg" cx="26" cy="26" r={r}/>
                  <circle className="completion-ring-fill" cx="26" cy="26" r={r}
                    strokeDasharray={circ} strokeDashoffset={offset}/>
                </svg>
                <div className="completion-ring-pct">{pct}%</div>
              </div>
              <div>
                <div className="completion-num">{pct}%</div>
                <div className="completion-change">↑ 2% vs last month</div>
              </div>
            </div>
          </div>

          {/* Avg Rating */}
          <div className="stat-card">
            <div className="stat-card-label">
              Avg. Rating
              <div className="stat-card-icon">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4 4.3 12.3l.7-4.1L2 5.3l4.2-.7z" stroke="#17A8FF" strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="stat-card-num">4.9</div>
            <div className="stat-card-change change-neutral">★ 128 total reviews</div>
          </div>
        </div>

        {/* ── Today at a glance ── */}
        <div className="today-glance">
          <div className="today-glance-header">
            <div className="today-glance-title">Today at a glance &middot; {todayBk.length} appointments</div>
            <Link href="/vendor/calendar" className="panel-action">Open in Calendar →</Link>
          </div>
          <div className="today-glance-body">
            {todayBk.map(b => (
              <div key={b.id} className="glance-slot" style={{ borderLeftColor: "#22c55e" }}>
                <div className="glance-time">{b.time}</div>
                <div>
                  <div className="glance-pet">{b.pet} · {b.owner.split(" ")[0]}</div>
                  <div className="glance-service">{b.service} · {b.amount}</div>
                </div>
                <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:100, background:"rgba(34,197,94,0.12)", color:"#16a34a", whiteSpace:"nowrap" }}>Confirmed</span>
              </div>
            ))}
            <div className="glance-slot-empty">+ Add slot</div>
          </div>
        </div>

        {/* ── Heatmap ── */}
        <div className="heatmap-panel">
          <div className="heatmap-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="heatmap-title">Bookings heatmap</div>
              <div className="hm-week-nav">
                <button className="hm-nav-btn" disabled={hmOffset <= -1} onClick={() => setHmOffset(o => Math.max(-1, o - 1))}>‹</button>
                <div className="hm-week-label">{hmWeekLabel}</div>
                <button className="hm-nav-btn" disabled={hmOffset >= 1} onClick={() => setHmOffset(o => Math.min(1, o + 1))}>›</button>
              </div>
            </div>
            <div className="heatmap-legend">
              <span style={{ fontSize: 11, color: "#7eb5d6" }}>Low</span>
              {[0.15, 0.35, 0.55, 0.75, 1].map((p, i) => (
                <div key={i} className="hm-legend-swatch" style={{ width: 16 + p * 12, background: hmCellColor(Math.round(p * hmMax), hmMax) }} />
              ))}
              <span style={{ fontSize: 11, color: "#7eb5d6" }}>High</span>
            </div>
          </div>
          <div className="heatmap-body">
            <div className="heatmap-grid-wrap">
              <div className="hm-hour-labels">
                {HM_HOUR_LABELS.map(h => <div key={h} className="hm-hour-label">{h}</div>)}
              </div>
              <div className="hm-days">
                <div className="hm-day-names">
                  {HM_DAYS.map(d => <div key={d} className="hm-day-name">{d}</div>)}
                </div>
                <div className="hm-rows">
                  {HM_HOUR_LABELS.map((_, hi) => (
                    <div key={hi} className="hm-row">
                      {HM_DAYS.map((_, di) => {
                        const val = heatmapData[di]?.[hi] ?? 0;
                        const isPeak = di === peakDay && hi === peakHour;
                        return (
                          <div
                            key={di}
                            className="hm-cell"
                            style={{
                              background: hmCellColor(val, hmMax),
                              outline: isPeak ? "2px solid #17A8FF" : undefined,
                              outlineOffset: isPeak ? 2 : undefined,
                            }}
                          >
                            <div className="hm-tooltip">{HM_DAYS[di]} {HM_HOUR_LABELS[hi]} · {val} booking{val !== 1 ? "s" : ""}</div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="hm-insights">
            <span className="hm-insights-label">Insights:</span>
            <span className="hm-peak-badge">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1l1 2.5H9L6.5 5l1 3L5 6.5 2.5 8l1-3L1 3.5h3z" fill="#17A8FF"/></svg>
              Peak — {HM_DAYS[peakDay]} {HM_HOUR_LABELS[peakHour]} ({peakVal} bookings)
            </span>
            <span className="hm-offpeak-badge">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="#94a3b8" strokeWidth="1.2"/></svg>
              Quiet slots — {topOff.map(s => `${HM_DAYS[s.di]} ${HM_HOUR_LABELS[s.hi]}`).join(", ")}
            </span>
            <span style={{ fontSize: 11, color: "#5a8fa8", fontWeight: 300 }}>
              Try promoting discounts on {[...new Set(topOff.map(s => HM_HOUR_LABELS[s.hi]))].slice(0, 2).join(" & ")} to fill quiet slots
            </span>
          </div>
        </div>

        {/* ── Bottom grid ── */}
        <div className="grid-3-1">
          {/* Upcoming this week */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Upcoming this week</div>
              <Link href="/vendor/bookings" className="panel-action">View all</Link>
            </div>
            <div className="panel-body">
              {upcoming.map(b => (
                <div key={b.id} className="booking-row">
                  <div className="bk-avatar" style={{ background: b.color }}>{b.initials}</div>
                  <div>
                    <div className="bk-name">{b.pet} · {b.owner}</div>
                    <div className="bk-service">{b.service} · {b.amount}</div>
                  </div>
                  <div className="bk-time">
                    <div className="bk-time-main">{b.time}</div>
                    <div style={{ marginTop: 3, fontSize: 11, color: "#9ec9e0" }}>{b.date}</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:100, background:"rgba(34,197,94,0.12)", color:"#16a34a", whiteSpace:"nowrap" }}>Confirmed</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly revenue */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Monthly revenue</div>
            </div>
            <div className="panel-body">
              <div style={{ textAlign: "center", paddingBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#5a8fa8", marginBottom: 4 }}>December 2024</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#00171F", letterSpacing: -1.5, lineHeight: 1 }}>฿42,800</div>
                <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 500, marginTop: 4 }}>↑ 18% vs last month</div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                {revenueWeeks.map((b, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", justifyContent: "flex-end" }}>
                    <div style={{
                      borderRadius: "5px 5px 0 0",
                      height: `${Math.round((b.val / maxBar) * 100)}%`,
                      background: i === 5 ? "#17A8FF" : "rgba(23,168,255,0.18)",
                    }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                {revenueWeeks.map((b, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 9, color: "#7eb5d6" }}>{b.label}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
