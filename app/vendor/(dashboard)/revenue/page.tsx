"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
type RevBooking = {
  id: string;
  booking_reference: string;
  scheduled_at: string;
  status: string;
  total_amount: number;
  customer_id: string;
  customers: { first_name: string; last_name: string } | null;
  services: { name: string; category: string } | null;
};

type Payout = {
  id: string;
  net_amount: number;
  status: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getMonday(d = new Date()) {
  const n = new Date(d); n.setHours(0,0,0,0);
  const day = n.getDay();
  n.setDate(n.getDate() - (day === 0 ? 6 : day - 1));
  return n;
}

const AVATAR_COLORS = ["#17A8FF","#22c55e","#F5A623","#8b5cf6","#f43f5e","#0B93E8","#003459"];
const colorFor = (i: number) => AVATAR_COLORS[i % AVATAR_COLORS.length];

const CIRC = 2 * Math.PI * 38;

// ── Demo mode ─────────────────────────────────────────────────────────────────
const DEMO_MODE = true;

const MOCK_REV_BOOKINGS: RevBooking[] = [
  // Apr 15 (today)
  { id:"mk01", booking_reference:"BK-202604-2341", scheduled_at:"2026-04-15T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000001", customers:{first_name:"Mintra",   last_name:"Saelim"},    services:{name:"Full Grooming Package", category:"Grooming"} },
  { id:"mk02", booking_reference:"BK-202604-2342", scheduled_at:"2026-04-15T03:30:00Z", status:"in_progress", total_amount:450, customer_id:"c0000002", customers:{first_name:"Warat",    last_name:"Chaiwong"},  services:{name:"Bath & Brush",          category:"Grooming"} },
  // Apr 14
  { id:"mk06", booking_reference:"BK-202604-2338", scheduled_at:"2026-04-14T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000002", customers:{first_name:"Warat",    last_name:"Chaiwong"},  services:{name:"Full Grooming Package", category:"Grooming"} },
  { id:"mk07", booking_reference:"BK-202604-2339", scheduled_at:"2026-04-14T04:00:00Z", status:"completed",   total_amount:650, customer_id:"c0000003", customers:{first_name:"Anchana",  last_name:"Pimjai"},    services:{name:"Cat Grooming",          category:"Grooming"} },
  { id:"mk08", booking_reference:"BK-202604-2340", scheduled_at:"2026-04-14T07:00:00Z", status:"completed",   total_amount:650, customer_id:"c0000006", customers:{first_name:"Suda",     last_name:"Chomchan"},  services:{name:"Cat Grooming",          category:"Grooming"} },
  // Apr 13
  { id:"mk09", booking_reference:"BK-202604-2335", scheduled_at:"2026-04-13T02:00:00Z", status:"completed",   total_amount:450, customer_id:"c0000001", customers:{first_name:"Mintra",   last_name:"Saelim"},    services:{name:"Bath & Brush",          category:"Grooming"} },
  { id:"mk10", booking_reference:"BK-202604-2336", scheduled_at:"2026-04-13T04:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000004", customers:{first_name:"Prapai",   last_name:"Thaweesap"}, services:{name:"Full Grooming Package", category:"Grooming"} },
  { id:"mk11", booking_reference:"BK-202604-2337", scheduled_at:"2026-04-13T07:00:00Z", status:"completed",   total_amount:450, customer_id:"c0000005", customers:{first_name:"Natthida", last_name:"Phongsri"},  services:{name:"Bath & Brush",          category:"Grooming"} },
  // Apr 10
  { id:"mk19", booking_reference:"BK-202604-2330", scheduled_at:"2026-04-10T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000002", customers:{first_name:"Warat",    last_name:"Chaiwong"},  services:{name:"Full Grooming Package", category:"Grooming"} },
  // Mar (6 bookings ~฿4,400)
  { id:"mk20", booking_reference:"BK-202603-2301", scheduled_at:"2026-03-28T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000001", customers:{first_name:"Mintra",   last_name:"Saelim"},    services:{name:"Full Grooming Package", category:"Grooming"} },
  { id:"mk21", booking_reference:"BK-202603-2302", scheduled_at:"2026-03-25T04:00:00Z", status:"completed",   total_amount:650, customer_id:"c0000003", customers:{first_name:"Anchana",  last_name:"Pimjai"},    services:{name:"Cat Grooming",          category:"Grooming"} },
  { id:"mk22", booking_reference:"BK-202603-2303", scheduled_at:"2026-03-21T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000004", customers:{first_name:"Prapai",   last_name:"Thaweesap"}, services:{name:"Full Grooming Package", category:"Grooming"} },
  { id:"mk23", booking_reference:"BK-202603-2304", scheduled_at:"2026-03-18T03:00:00Z", status:"completed",   total_amount:450, customer_id:"c0000002", customers:{first_name:"Warat",    last_name:"Chaiwong"},  services:{name:"Bath & Brush",          category:"Grooming"} },
  { id:"mk24", booking_reference:"BK-202603-2305", scheduled_at:"2026-03-14T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000001", customers:{first_name:"Mintra",   last_name:"Saelim"},    services:{name:"Full Grooming Package", category:"Grooming"} },
  { id:"mk25", booking_reference:"BK-202603-2306", scheduled_at:"2026-03-07T04:00:00Z", status:"completed",   total_amount:350, customer_id:"c0000004", customers:{first_name:"Prapai",   last_name:"Thaweesap"}, services:{name:"Full Day Care",         category:"Day Care"} },
  // Feb
  { id:"mk30", booking_reference:"BK-202602-2201", scheduled_at:"2026-02-26T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000001", customers:{first_name:"Mintra",   last_name:"Saelim"},    services:{name:"Full Grooming Package", category:"Grooming"} },
  { id:"mk31", booking_reference:"BK-202602-2202", scheduled_at:"2026-02-21T04:00:00Z", status:"completed",   total_amount:650, customer_id:"c0000003", customers:{first_name:"Anchana",  last_name:"Pimjai"},    services:{name:"Cat Grooming",          category:"Grooming"} },
  { id:"mk32", booking_reference:"BK-202602-2203", scheduled_at:"2026-02-18T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000002", customers:{first_name:"Warat",    last_name:"Chaiwong"},  services:{name:"Full Grooming Package", category:"Grooming"} },
  { id:"mk33", booking_reference:"BK-202602-2204", scheduled_at:"2026-02-14T03:00:00Z", status:"completed",   total_amount:450, customer_id:"c0000005", customers:{first_name:"Natthida", last_name:"Phongsri"},  services:{name:"Bath & Brush",          category:"Grooming"} },
  { id:"mk34", booking_reference:"BK-202602-2205", scheduled_at:"2026-02-07T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000004", customers:{first_name:"Prapai",   last_name:"Thaweesap"}, services:{name:"Full Grooming Package", category:"Grooming"} },
  // Jan
  { id:"mk40", booking_reference:"BK-202601-2101", scheduled_at:"2026-01-25T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000001", customers:{first_name:"Mintra",   last_name:"Saelim"},    services:{name:"Full Grooming Package", category:"Grooming"} },
  { id:"mk41", booking_reference:"BK-202601-2102", scheduled_at:"2026-01-18T04:00:00Z", status:"completed",   total_amount:650, customer_id:"c0000003", customers:{first_name:"Anchana",  last_name:"Pimjai"},    services:{name:"Cat Grooming",          category:"Grooming"} },
  { id:"mk42", booking_reference:"BK-202601-2103", scheduled_at:"2026-01-11T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000002", customers:{first_name:"Warat",    last_name:"Chaiwong"},  services:{name:"Full Grooming Package", category:"Grooming"} },
  { id:"mk43", booking_reference:"BK-202601-2104", scheduled_at:"2026-01-04T03:00:00Z", status:"completed",   total_amount:450, customer_id:"c0000005", customers:{first_name:"Natthida", last_name:"Phongsri"},  services:{name:"Bath & Brush",          category:"Grooming"} },
  // Dec 2025
  { id:"mk50", booking_reference:"BK-202512-2001", scheduled_at:"2025-12-27T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000001", customers:{first_name:"Mintra",   last_name:"Saelim"},    services:{name:"Full Grooming Package", category:"Grooming"} },
  { id:"mk51", booking_reference:"BK-202512-2002", scheduled_at:"2025-12-20T04:00:00Z", status:"completed",   total_amount:650, customer_id:"c0000006", customers:{first_name:"Suda",     last_name:"Chomchan"},  services:{name:"Cat Grooming",          category:"Grooming"} },
  { id:"mk52", booking_reference:"BK-202512-2003", scheduled_at:"2025-12-13T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000004", customers:{first_name:"Prapai",   last_name:"Thaweesap"}, services:{name:"Full Grooming Package", category:"Grooming"} },
  { id:"mk53", booking_reference:"BK-202512-2004", scheduled_at:"2025-12-06T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000002", customers:{first_name:"Warat",    last_name:"Chaiwong"},  services:{name:"Full Grooming Package", category:"Grooming"} },
  // Nov 2025
  { id:"mk60", booking_reference:"BK-202511-1901", scheduled_at:"2025-11-29T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000001", customers:{first_name:"Mintra",   last_name:"Saelim"},    services:{name:"Full Grooming Package", category:"Grooming"} },
  { id:"mk61", booking_reference:"BK-202511-1902", scheduled_at:"2025-11-15T04:00:00Z", status:"completed",   total_amount:650, customer_id:"c0000003", customers:{first_name:"Anchana",  last_name:"Pimjai"},    services:{name:"Cat Grooming",          category:"Grooming"} },
  { id:"mk62", booking_reference:"BK-202511-1903", scheduled_at:"2025-11-08T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000002", customers:{first_name:"Warat",    last_name:"Chaiwong"},  services:{name:"Full Grooming Package", category:"Grooming"} },
];
const MOCK_PAYOUTS: Payout[] = [
  { id:"py01", net_amount:21240, status:"pending"   },
  { id:"py02", net_amount:22140, status:"paid"      },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RevenuePage() {
  const [chartMode, setChartMode] = useState<"week" | "month">("week");
  const [loading,   setLoading]   = useState(true);
  const [bookings,  setBookings]  = useState<RevBooking[]>([]);
  const [payouts,   setPayouts]   = useState<Payout[]>([]);

  useEffect(() => {
    (async () => {
      if (DEMO_MODE) {
        setBookings(MOCK_REV_BOOKINGS); setPayouts(MOCK_PAYOUTS); setLoading(false); return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: prov } = await supabase.from("providers").select("id").eq("user_id", user.id).single();
      if (!prov) { setLoading(false); return; }

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [bkRes, pyRes] = await Promise.all([
        supabase.from("bookings")
          .select(`
            id, booking_reference, scheduled_at, status, total_amount, customer_id,
            customers(first_name, last_name),
            services(name, category)
          `)
          .eq("provider_id", prov.id)
          .gte("scheduled_at", sixMonthsAgo.toISOString())
          .order("scheduled_at", { ascending: false }),
        supabase.from("provider_payouts")
          .select("id, net_amount, status")
          .eq("provider_id", prov.id),
      ]);

      if (bkRes.data) setBookings(bkRes.data as unknown as RevBooking[]);
      if (pyRes.data) setPayouts(pyRes.data as Payout[]);
      setLoading(false);
    })();
  }, []);

  // ── Computed stats ─────────────────────────────────────────────────────────
  const now       = new Date();
  const weekStart = getMonday();
  const weekEnd   = new Date(weekStart.getTime() + 7 * 86400000);
  const mStart    = new Date(now.getFullYear(), now.getMonth(), 1);
  const mEnd      = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const completed = bookings.filter(b => b.status === "completed");

  const revenueMonth = completed
    .filter(b => { const d = new Date(b.scheduled_at); return d >= mStart && d < mEnd; })
    .reduce((s, b) => s + (b.total_amount ?? 0), 0);

  const revenueWeek = completed
    .filter(b => { const d = new Date(b.scheduled_at); return d >= weekStart && d < weekEnd; })
    .reduce((s, b) => s + (b.total_amount ?? 0), 0);

  const avgPerBooking = completed.length > 0
    ? Math.round(completed.reduce((s, b) => s + (b.total_amount ?? 0), 0) / completed.length)
    : 0;

  const pendingPayout = payouts
    .filter(p => p.status === "pending")
    .reduce((s, p) => s + (p.net_amount ?? 0), 0);

  // ── Chart data ─────────────────────────────────────────────────────────────
  const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const MONTH_LABELS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const weekChartData = DAY_LABELS.map((label, i) => {
    const ds = new Date(weekStart); ds.setDate(weekStart.getDate() + i);
    const de = new Date(ds.getTime() + 86400000);
    const val = completed
      .filter(b => { const d = new Date(b.scheduled_at); return d >= ds && d < de; })
      .reduce((s, b) => s + (b.total_amount ?? 0), 0);
    return { label, val };
  });

  const monthChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const de = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const val = completed
      .filter(b => { const bd = new Date(b.scheduled_at); return bd >= d && bd < de; })
      .reduce((s, b) => s + (b.total_amount ?? 0), 0);
    return { label: MONTH_LABELS_SHORT[d.getMonth()], val };
  });

  const chartData  = chartMode === "week" ? weekChartData : monthChartData;
  const maxVal     = Math.max(...chartData.map(d => d.val), 1);
  const chartTotal = chartData.reduce((s, d) => s + d.val, 0).toLocaleString();
  const chartLabel = chartMode === "week" ? `This week · Total ฿${chartTotal}` : `6 months · Total ฿${chartTotal}`;

  // ── Service breakdown donut ────────────────────────────────────────────────
  const catTotals = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach(b => {
      const cat = b.services?.category ?? "Other";
      map[cat] = (map[cat] ?? 0) + (b.total_amount ?? 0);
    });
    return map;
  }, [completed]);

  const totalRevAll = Object.values(catTotals).reduce((s, v) => s + v, 0);

  const CAT_COLORS: Record<string, string> = {
    Grooming: "#17A8FF", "Day Care": "#22c55e", Training: "#F5A623", Boarding: "#8b5cf6",
  };

  const svcBreakdown = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, val]) => ({
      name,
      color: CAT_COLORS[name] ?? "#9ec9e0",
      pct: totalRevAll > 0 ? `${Math.round((val / totalRevAll) * 100)}%` : "0%",
      pctNum: totalRevAll > 0 ? val / totalRevAll : 0,
    }));

  const donutSegs = (() => {
    let acc = 0;
    return svcBreakdown.map(s => {
      const len    = s.pctNum * CIRC;
      const result = { color: s.color, dasharray: `${len.toFixed(2)} ${CIRC.toFixed(2)}`, dashoffset: -acc };
      acc += len;
      return result;
    });
  })();

  // Recent transactions (top 10 non-cancelled)
  const recentTx = bookings.filter(b => b.status !== "cancelled").slice(0, 10);

  const statCards = [
    { label:"This Month",       value:`฿${revenueMonth.toLocaleString()}`, change: revenueMonth > 0 ? "Month to date" : "No revenue yet",      dir:"up"      as const },
    { label:"This Week",        value:`฿${revenueWeek.toLocaleString()}`,  change: revenueWeek  > 0 ? "Week to date"  : "No revenue this week", dir:"up"      as const },
    { label:"Avg. per Booking", value: avgPerBooking > 0 ? `฿${avgPerBooking.toLocaleString()}` : "—", change:"Based on completed bookings",    dir:"up"      as const },
    { label:"Pending Payout",   value: pendingPayout > 0 ? `฿${pendingPayout.toLocaleString()}` : "฿0", change:"From provider_payouts table",  dir:"neutral" as const },
  ];

  const badgeClass = (s: string) =>
    s === "completed" ? "badge-completed" :
    s === "confirmed" ? "badge-confirmed" :
    s === "cancelled" ? "badge-cancelled" : "badge-pending";

  return (
    <main className="ovw-main">
      <div className="ovw-content">

        {/* ── Stat cards ── */}
        <div className="stats-row">
          {statCards.map((c, ci) => (
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
              <div className="stat-card-num">{loading ? "…" : c.value}</div>
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
              <div className="chart-total-label">{loading ? "Loading…" : chartLabel}</div>
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

          {/* By service */}
          <div className="panel">
            <div className="panel-header"><div className="panel-title">By service</div></div>
            <div style={{ padding:"16px 22px 20px" }}>
              {svcBreakdown.length > 0 ? (
                <>
                  <svg width="140" height="140" viewBox="0 0 120 120" style={{ display:"block", margin:"0 auto 16px" }}>
                    <g transform="rotate(-90 60 60)">
                      {donutSegs.map((s, i) => (
                        <circle key={i} cx="60" cy="60" r="38" fill="none"
                          stroke={s.color} strokeWidth="20"
                          strokeDasharray={s.dasharray} strokeDashoffset={s.dashoffset} />
                      ))}
                    </g>
                    <circle cx="60" cy="60" r="27" fill="#fff" />
                    <text x="60" y="57" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#00171F" fontFamily="'Lexend Deca',sans-serif">
                      ฿{totalRevAll > 999 ? `${(totalRevAll/1000).toFixed(1)}k` : totalRevAll.toLocaleString()}
                    </text>
                    <text x="60" y="68" textAnchor="middle" fontSize="8" fill="#7eb5d6" fontFamily="'Lexend Deca',sans-serif">total</text>
                  </svg>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {svcBreakdown.map(s => (
                      <div key={s.name} style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }} />
                        <div style={{ fontSize:12, color:"#5a8fa8", flex:1 }}>{s.name}</div>
                        <div style={{ fontSize:12, fontWeight:600, color:"#00171F" }}>{s.pct}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign:"center", color:"#9ec9e0", fontSize:13, padding:"20px 0" }}>
                  {loading ? "Loading…" : "No completed bookings yet."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Recent transactions ── */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Recent transactions</div>
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
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign:"center", padding:"32px", color:"#7eb5d6" }}>Loading…</td></tr>
                ) : recentTx.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign:"center", padding:"32px", color:"#7eb5d6" }}>No transactions yet.</td></tr>
                ) : recentTx.map((b, i) => (
                  <tr key={b.id}>
                    <td style={{ color:"#17A8FF", fontWeight:500 }}>{b.booking_reference}</td>
                    <td>
                      <span className="td-avatar" style={{ background: colorFor(i) }}>
                        {(b.customers?.first_name?.[0] ?? "?").toUpperCase()}
                      </span>
                      {b.customers ? `${b.customers.first_name} ${b.customers.last_name}` : "Customer"}
                    </td>
                    <td>{b.services?.name ?? "—"}</td>
                    <td>{new Date(b.scheduled_at).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}</td>
                    <td style={{ fontWeight:600 }}>฿{(b.total_amount ?? 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${badgeClass(b.status)}`}>{b.status}</span>
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
