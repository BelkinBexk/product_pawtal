"use client";

import { useState } from "react";

const CIRC = 2 * Math.PI * 38;

const MONTH_DATA = [
  { label:"Nov", val:18200 },
  { label:"Dec", val:22100 },
  { label:"Jan", val:19800 },
  { label:"Feb", val:23400 },
  { label:"Mar", val:26700 },
  { label:"Apr", val:28400 },
];

const WEEK_DATA = [
  { label:"Mon", val:1800 },
  { label:"Tue", val:2200 },
  { label:"Wed", val:900 },
  { label:"Thu", val:0 },
  { label:"Fri", val:0 },
  { label:"Sat", val:0 },
  { label:"Sun", val:0 },
];

const SVC_BREAKDOWN = [
  { name:"Grooming",  color:"#17A8FF", pct:"78%", pctNum:0.78 },
  { name:"Day Care",  color:"#22c55e", pct:"14%", pctNum:0.14 },
  { name:"Add-ons",   color:"#F5A623", pct:"8%",  pctNum:0.08 },
];

const donutSegs = (() => {
  let acc = 0;
  return SVC_BREAKDOWN.map(s => {
    const len = s.pctNum * CIRC;
    const result = { color:s.color, dasharray:`${len.toFixed(2)} ${CIRC.toFixed(2)}`, dashoffset:-acc };
    acc += len;
    return result;
  });
})();

const STAT_CARDS = [
  { label:"This Month",       value:"฿28,400", change:"↑ +6.4% vs last month",       dir:"up"      as const },
  { label:"This Week",        value:"฿4,900",  change:"↑ Mon–Wed so far",             dir:"up"      as const },
  { label:"Avg. per Booking", value:"฿662",    change:"Based on completed bookings",  dir:"up"      as const },
  { label:"Pending Payout",   value:"฿21,360", change:"Transfer in 2 business days",  dir:"neutral" as const },
];

const RECENT_TX = [
  { ref:"BK-202604-2341", customer:"Mintra Saelim",    service:"Full Grooming Package",  date:"15 Apr 2026", amount:900, status:"completed",  ci:0 },
  { ref:"BK-202604-2338", customer:"Warat Chaiwong",   service:"Full Grooming Package",  date:"14 Apr 2026", amount:900, status:"completed",  ci:1 },
  { ref:"BK-202604-2339", customer:"Anchana Pimjai",   service:"Cat Grooming",           date:"14 Apr 2026", amount:650, status:"completed",  ci:2 },
  { ref:"BK-202604-2340", customer:"Suda Chomchan",    service:"Cat Grooming",           date:"14 Apr 2026", amount:650, status:"completed",  ci:5 },
  { ref:"BK-202604-2335", customer:"Mintra Saelim",    service:"Bath & Brush",           date:"13 Apr 2026", amount:450, status:"completed",  ci:0 },
  { ref:"BK-202604-2336", customer:"Prapai Thaweesap", service:"Full Grooming Package",  date:"13 Apr 2026", amount:900, status:"completed",  ci:3 },
  { ref:"BK-202604-2337", customer:"Natthida Phongsri",service:"Bath & Brush",           date:"13 Apr 2026", amount:450, status:"completed",  ci:4 },
  { ref:"BK-202604-2330", customer:"Warat Chaiwong",   service:"Full Grooming Package",  date:"10 Apr 2026", amount:900, status:"completed",  ci:1 },
  { ref:"BK-202604-2342", customer:"Warat Chaiwong",   service:"Bath & Brush",           date:"15 Apr 2026", amount:450, status:"in_progress",ci:1 },
  { ref:"BK-202604-2343", customer:"Anchana Pimjai",   service:"Cat Grooming",           date:"15 Apr 2026", amount:650, status:"confirmed",  ci:2 },
];

const AVATAR_COLORS = ["#17A8FF","#22c55e","#F5A623","#8b5cf6","#f43f5e","#0B93E8","#003459"];
const colorFor = (i: number) => AVATAR_COLORS[i % AVATAR_COLORS.length];

function badgeClass(s: string) {
  if (s === "completed")   return "badge-completed";
  if (s === "confirmed")   return "badge-confirmed";
  if (s === "in_progress") return "badge badge-new";
  return "badge-pending";
}

export default function DemoRevenue() {
  const [chartMode, setChartMode] = useState<"week"|"month">("week");

  const chartData = chartMode === "week" ? WEEK_DATA : MONTH_DATA;
  const maxVal    = Math.max(...chartData.map(d => d.val), 1);
  const chartTotal = chartData.reduce((s, d) => s + d.val, 0).toLocaleString();
  const chartLabel = chartMode === "week"
    ? `This week · Total ฿${chartTotal}`
    : `6 months · Total ฿${chartTotal}`;

  return (
    <main className="ovw-main">
      <div className="ovw-content">

        {/* ── Stat cards ── */}
        <div className="stats-row">
          {STAT_CARDS.map(c => (
            <div key={c.label} className="stat-card">
              <div className="stat-card-label">
                {c.label}
                <div className="stat-card-icon">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <path d="M2 12l3.5-4 3 2.5L12 5l2 2" stroke="#17A8FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 14h12" stroke="#17A8FF" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div className="stat-card-num">{c.value}</div>
              <div className={`stat-card-change ${c.dir === "up" ? "change-up" : "change-neutral"}`}>{c.change}</div>
            </div>
          ))}
        </div>

        {/* ── Chart + donut ── */}
        <div className="grid-3-1">
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
              <div className="chart-bars-row" style={{ height:160 }}>
                {chartData.map((d, i) => (
                  <div key={i} className="chart-bar-group">
                    <div className={`chart-bar${i === chartData.length - 1 ? " active" : ""}`}
                      style={{ height:`${Math.round((d.val / maxVal) * 100)}%` }}>
                      <div className="chart-bar-tooltip">฿{d.val.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                {chartData.map((d, i) => (
                  <div key={i} className="chart-label" style={{ flex:1 }}>{d.label}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><div className="panel-title">By service</div></div>
            <div style={{ padding:"16px 22px 20px" }}>
              <svg width="140" height="140" viewBox="0 0 120 120" style={{ display:"block", margin:"0 auto 16px" }}>
                <g transform="rotate(-90 60 60)">
                  {donutSegs.map((s, i) => (
                    <circle key={i} cx="60" cy="60" r="38" fill="none"
                      stroke={s.color} strokeWidth="20"
                      strokeDasharray={s.dasharray} strokeDashoffset={s.dashoffset} />
                  ))}
                </g>
                <circle cx="60" cy="60" r="27" fill="#fff" />
                <text x="60" y="57" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#00171F" fontFamily="'Lexend Deca',sans-serif">฿138.2k</text>
                <text x="60" y="68" textAnchor="middle" fontSize="8" fill="#7eb5d6" fontFamily="'Lexend Deca',sans-serif">6-month total</text>
              </svg>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {SVC_BREAKDOWN.map(s => (
                  <div key={s.name} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }} />
                    <div style={{ fontSize:12, color:"#5a8fa8", flex:1 }}>{s.name}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:"#00171F" }}>{s.pct}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent transactions ── */}
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Recent transactions</div></div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Booking</th><th>Customer</th><th>Service</th><th>Date</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {RECENT_TX.map(b => (
                  <tr key={b.ref}>
                    <td style={{ color:"#17A8FF", fontWeight:500 }}>{b.ref}</td>
                    <td>
                      <span className="td-avatar" style={{ background: colorFor(b.ci) }}>{b.customer[0]}</span>
                      {b.customer}
                    </td>
                    <td>{b.service}</td>
                    <td>{b.date}</td>
                    <td style={{ fontWeight:600 }}>฿{b.amount.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${badgeClass(b.status)}`}>
                        {b.status === "in_progress" ? "In Progress" : b.status.charAt(0).toUpperCase() + b.status.slice(1)}
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
