"use client";

import { useState } from "react";
import Link from "next/link";

// ── Heatmap data ──────────────────────────────────────────────────────────────
const HM_HOUR_LABELS = ["8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm"];
const HM_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const HM_DATA: Record<string, number[][]> = {
  "-1": [[1,2,4,3,1,2,2,2,1,0,0],[0,2,5,4,2,3,3,2,1,1,0],[0,1,3,3,1,1,2,2,0,0,0],[0,1,3,4,2,2,3,2,1,0,0],[1,2,4,5,3,3,4,3,2,1,1],[2,4,7,8,5,6,7,6,4,3,2],[1,2,5,6,3,4,5,4,3,2,1]],
   "0": [[1,2,5,4,2,3,3,2,2,1,0],[1,2,6,5,3,4,5,3,2,1,1],[1,2,4,4,2,2,3,2,2,1,0],[0,2,4,5,2,3,4,3,2,1,0],[1,3,5,6,3,4,5,4,3,2,1],[2,5,8,9,6,7,8,7,5,3,2],[1,3,6,7,4,5,6,5,4,2,1]],
   "1": [[1,2,4,3,1,2,3,2,1,1,0],[0,1,5,4,2,2,4,3,1,1,0],[1,2,3,3,1,2,2,2,1,0,0],[0,1,4,4,2,2,3,2,2,1,0],[1,2,4,5,3,3,4,3,2,1,1],[2,4,7,8,5,5,7,6,4,2,1],[1,2,5,6,3,4,5,4,3,2,1]],
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

function computeHmInsights(data: number[][]) {
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

const AVATAR_COLORS = ["#22c55e","#17A8FF","#F5A623","#8b5cf6","#f43f5e","#0B93E8"];
const colorFor = (i: number) => AVATAR_COLORS[i % AVATAR_COLORS.length];

// ── Today's schedule ──────────────────────────────────────────────────────────
const TODAY_SCHEDULE = [
  { id: "t1", time: "9:00am",  pet: "Butter",  owner: "Mintra",   service: "Full Grooming Package",  amount: 900, status: "completed",  color: "#22c55e" },
  { id: "t2", time: "10:30am", pet: "Mochi",   owner: "Warat",    service: "Bath & Brush",           amount: 450, status: "in_progress", color: "#17A8FF" },
  { id: "t3", time: "1:00pm",  pet: "Nala",    owner: "Anchana",  service: "Cat Grooming",           amount: 650, status: "confirmed",  color: "#F5A623" },
  { id: "t4", time: "2:30pm",  pet: "Max",     owner: "Prapai",   service: "Full Grooming Package",  amount: 900, status: "confirmed",  color: "#8b5cf6" },
  { id: "t5", time: "4:00pm",  pet: "Coco",    owner: "Natthida", service: "Nail Trim & Ear Clean",  amount: 250, status: "confirmed",  color: "#f43f5e" },
];

const UPCOMING = [
  { id: "u1", pet: "Butter",  owner: "Mintra Saelim",    service: "Bath & Brush",          amount: 450, time: "11:00am", day: "Thu 16/4", color: "#22c55e" },
  { id: "u2", pet: "Mochi",   owner: "Warat Chaiwong",   service: "Full Grooming Package", amount: 900, time: "9:00am",  day: "Fri 17/4", color: "#17A8FF" },
  { id: "u3", pet: "Max",     owner: "Prapai Thaweesap", service: "Full Day Care",         amount: 350, time: "9:00am",  day: "Sat 18/4", color: "#8b5cf6" },
  { id: "u4", pet: "Nala",    owner: "Anchana Pimjai",   service: "Cat Grooming",          amount: 650, time: "10:00am", day: "Sat 18/4", color: "#F5A623" },
];

const WEEK_BARS = [
  { label: "Mon", val: 1800 },
  { label: "Tue", val: 2200 },
  { label: "Wed", val: 900 },
  { label: "Thu", val: 0 },
  { label: "Fri", val: 0 },
  { label: "Sat", val: 0 },
  { label: "Sun", val: 0 },
];
const maxBar = Math.max(...WEEK_BARS.map(b => b.val), 1);

// Completion ring: 94% (16/17)
const R = 21, CIRC = +(2 * Math.PI * R).toFixed(2);
const OFFSET = +(CIRC * (1 - 94 / 100)).toFixed(2);

export default function DemoDashboard() {
  const [hmOffset, setHmOffset] = useState(0);

  const hmData = HM_DATA[String(hmOffset)] ?? HM_DATA["0"];
  const hmMax  = Math.max(...hmData.flat());
  const { peakDay, peakHour, peakVal, topOff } = computeHmInsights(hmData);
  const hmWeekLabel = hmOffset === 0 ? "This week" : hmOffset === -1 ? "Last week" : "Next week";

  const statusLabel = (s: string) =>
    s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1);
  const statusColor = (s: string) =>
    s === "completed" ? "#16a34a" : s === "in_progress" ? "#0B7AC8" : "#5a8fa8";
  const statusBg = (s: string) =>
    s === "completed" ? "rgba(34,197,94,0.12)" : s === "in_progress" ? "rgba(23,168,255,0.12)" : "rgba(90,143,168,0.10)";

  return (
    <main className="ovw-main">
      <div className="ovw-content">

        {/* ── 4 Stat cards ── */}
        <div className="stats-row">
          {/* Revenue */}
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
            <div className="rev-card-main">฿900</div>
            <div className="rev-card-change" style={{ color: "#22c55e" }}>↑ ฿900 earned so far</div>
            <div className="rev-card-divider" />
            <div className="rev-card-row">
              <div className="rev-card-sub-label">This week</div>
              <div className="rev-card-sub-val">฿4,900</div>
            </div>
            <div className="rev-card-row">
              <div className="rev-card-sub-label">This month</div>
              <div className="rev-card-sub-val">฿28,400</div>
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
            <div className="stat-card-num">5</div>
            <div className="stat-card-change change-up">↑ 5 confirmed today</div>
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
                  <circle className="completion-ring-bg" cx="26" cy="26" r={R}/>
                  <circle className="completion-ring-fill" cx="26" cy="26" r={R}
                    strokeDasharray={CIRC} strokeDashoffset={OFFSET}/>
                </svg>
                <div className="completion-ring-pct">94%</div>
              </div>
              <div>
                <div className="completion-num">94%</div>
                <div className="completion-change change-neutral">16 of 17 completed</div>
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
            <div className="stat-card-change change-neutral">★ 47 total reviews</div>
          </div>
        </div>

        {/* ── Today at a glance ── */}
        <div className="today-glance">
          <div className="today-glance-header">
            <div className="today-glance-title">Today at a glance · 5 appointments</div>
            <Link href="/vendor/demo/calendar" className="panel-action">Open in Calendar →</Link>
          </div>
          <div className="today-glance-body">
            {TODAY_SCHEDULE.map(b => (
              <div key={b.id} className="glance-slot" style={{ borderLeftColor: b.color }}>
                <div className="glance-time">{b.time}</div>
                <div>
                  <div className="glance-pet">{b.pet} · {b.owner}</div>
                  <div className="glance-service">{b.service} · ฿{b.amount.toLocaleString()}</div>
                </div>
                <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:100,
                  background: statusBg(b.status), color: statusColor(b.status), whiteSpace:"nowrap" }}>
                  {statusLabel(b.status)}
                </span>
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
              <span style={{ fontSize:11, color:"#7eb5d6" }}>Low</span>
              {[0.15,0.35,0.55,0.75,1].map((p,i) => (
                <div key={i} className="hm-legend-swatch" style={{ width:16+p*12, background:hmCellColor(Math.round(p*hmMax),hmMax) }} />
              ))}
              <span style={{ fontSize:11, color:"#7eb5d6" }}>High</span>
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
                        const val = hmData[di]?.[hi] ?? 0;
                        const isPeak = di === peakDay && hi === peakHour;
                        return (
                          <div key={di} className="hm-cell" style={{
                            background: hmCellColor(val, hmMax),
                            outline: isPeak ? "2px solid #17A8FF" : undefined,
                            outlineOffset: isPeak ? 2 : undefined,
                          }}>
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
            <span style={{ fontSize:11, color:"#5a8fa8", fontWeight:300 }}>
              Try offering off-peak deals on {[...new Set(topOff.map(s => HM_HOUR_LABELS[s.hi]))].slice(0,2).join(" & ")} to fill quiet slots
            </span>
          </div>
        </div>

        {/* ── Bottom grid ── */}
        <div className="grid-3-1">
          {/* Upcoming this week */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Upcoming this week</div>
              <Link href="/vendor/demo/bookings" className="panel-action">View all</Link>
            </div>
            <div className="panel-body">
              {UPCOMING.map((b, i) => (
                <div key={b.id} className="booking-row">
                  <div className="bk-avatar" style={{ background: colorFor(i) }}>{b.owner[0]}</div>
                  <div>
                    <div className="bk-name">{b.pet} · {b.owner}</div>
                    <div className="bk-service">{b.service} · ฿{b.amount.toLocaleString()}</div>
                  </div>
                  <div className="bk-time">
                    <div className="bk-time-main">{b.time}</div>
                    <div style={{ marginTop:3, fontSize:11, color:"#9ec9e0" }}>{b.day}</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:100, background:"rgba(23,168,255,0.10)", color:"#0B7AC8", whiteSpace:"nowrap" }}>Confirmed</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly revenue mini chart */}
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Monthly revenue</div></div>
            <div className="panel-body">
              <div style={{ textAlign:"center", paddingBottom:16 }}>
                <div style={{ fontSize:11, color:"#5a8fa8", marginBottom:4 }}>April 2026</div>
                <div style={{ fontSize:32, fontWeight:700, color:"#00171F", letterSpacing:-1.5, lineHeight:1 }}>฿28,400</div>
                <div style={{ fontSize:12, color:"#22c55e", fontWeight:500, marginTop:4 }}>↑ +6.4% vs last month</div>
              </div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:80 }}>
                {WEEK_BARS.map((b, i) => (
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", height:"100%", justifyContent:"flex-end" }}>
                    <div style={{
                      borderRadius:"5px 5px 0 0",
                      height:`${Math.round((b.val/maxBar)*100)}%`,
                      minHeight:b.val > 0 ? 4 : 0,
                      background: i === 2 ? "#17A8FF" : i < 2 ? "rgba(23,168,255,0.35)" : "rgba(23,168,255,0.10)",
                    }} />
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:6, marginTop:4 }}>
                {WEEK_BARS.map((b, i) => (
                  <div key={i} style={{ flex:1, textAlign:"center", fontSize:9, color:"#7eb5d6" }}>{b.label}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
