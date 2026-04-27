"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ── Heatmap helpers ───────────────────────────────────────────────────────────
const HM_HOUR_LABELS = ["8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm"];
const HM_DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// Build a 7-day × 11-hour count matrix from real bookings for a given week offset
function buildHeatmap(bookings: DashBooking[], weekOffset: number): number[][] {
  const ws = getMonday();
  ws.setDate(ws.getDate() + weekOffset * 7);
  const we = new Date(ws.getTime() + 7 * 86400000);
  const data: number[][] = Array.from({ length: 7 }, () => new Array(11).fill(0));
  bookings.forEach(b => {
    if (b.status === "cancelled") return;
    const d = new Date(b.scheduled_at);
    if (d < ws || d >= we) return;
    const dayIdx  = (d.getDay() + 6) % 7;   // Mon=0 … Sun=6
    const hourIdx = d.getHours() - 8;        // 8am=0 … 6pm=10
    if (hourIdx < 0 || hourIdx > 10) return;
    data[dayIdx][hourIdx]++;
  });
  return data;
}

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

// ── Helpers ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#22c55e","#17A8FF","#F5A623","#8b5cf6","#f43f5e","#0B93E8"];
const colorFor = (i: number) => AVATAR_COLORS[i % AVATAR_COLORS.length];

function fmtTime12(iso: string) {
  const d = new Date(iso);
  const h = d.getHours(), m = d.getMinutes();
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2, "0")}${h >= 12 ? "pm" : "am"}`;
}

function getMonday(d = new Date()) {
  const n = new Date(d); n.setHours(0,0,0,0);
  const day = n.getDay();
  n.setDate(n.getDate() - (day === 0 ? 6 : day - 1));
  return n;
}

type DashBooking = {
  id: string;
  booking_reference: string;
  scheduled_at: string;
  status: string;
  total_amount: number;
  customers: { first_name: string; last_name: string } | null;
  pets: { name: string } | null;
  services: { name: string; duration_min: number } | null;
};


// ── Page ──────────────────────────────────────────────────────────────────────
export default function VendorDashboard() {
  const [hmOffset, setHmOffset] = useState(0);
  const [loading, setLoading]   = useState(true);
  const [bookings, setBookings] = useState<DashBooking[]>([]);
  const [ratingAvg,  setRatingAvg]  = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: prov } = await supabase
        .from("providers")
        .select("id, rating_avg, review_count")
        .eq("user_id", user.id)
        .single();
      if (!prov) { setLoading(false); return; }

      setRatingAvg(prov.rating_avg ?? 0);
      setReviewCount(prov.review_count ?? 0);

      // Load from start of current month (for monthly revenue chart) while
      // still covering last/next week for the heatmap nav.
      const rangeStart = new Date();
      rangeStart.setDate(1);
      rangeStart.setHours(0, 0, 0, 0);

      const rangeEnd = new Date();
      rangeEnd.setDate(rangeEnd.getDate() + 14);
      rangeEnd.setHours(23, 59, 59, 999);

      const { data: bks } = await supabase
        .from("bookings")
        .select(`
          id, booking_reference, scheduled_at, status, total_amount,
          customers(first_name, last_name),
          pets(name),
          services(name, duration_min)
        `)
        .eq("provider_id", prov.id)
        .gte("scheduled_at", rangeStart.toISOString())
        .lte("scheduled_at", rangeEnd.toISOString())
        .order("scheduled_at");

      if (bks) setBookings(bks as unknown as DashBooking[]);
      setLoading(false);
    })();
  }, []);

  // ── Computed values ──────────────────────────────────────────────────────────
  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd   = new Date(todayStart.getTime() + 86400000);
  const weekStart  = getMonday();

  const todayBks = bookings.filter(b => {
    const d = new Date(b.scheduled_at);
    return d >= todayStart && d < todayEnd && b.status !== "cancelled";
  });

  const upcomingBks = bookings.filter(b => {
    const d = new Date(b.scheduled_at);
    return d >= todayEnd && b.status !== "cancelled";
  }).slice(0, 4);

  const sum = (filter: (b: DashBooking) => boolean) =>
    bookings.filter(filter).reduce((s, b) => s + (b.total_amount ?? 0), 0);

  const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1);
  const revenueToday = sum(b => { const d = new Date(b.scheduled_at); return d >= todayStart && d < todayEnd && b.status === "completed"; });
  const revenueWeek  = sum(b => new Date(b.scheduled_at) >= weekStart && b.status === "completed");
  const revenueMonth = sum(b => { const d = new Date(b.scheduled_at); return d >= monthStart && b.status === "completed"; });

  // 4 weekly bars for the current month (W1 = days 1-7, W2 = 8-14, W3 = 15-21, W4 = 22-end)
  const revenueMonthBars = [0, 1, 2, 3].map(wi => {
    const ds = new Date(monthStart); ds.setDate(1 + wi * 7);
    const de = new Date(monthStart); de.setDate(1 + (wi + 1) * 7);
    const val = sum(b => { const d = new Date(b.scheduled_at); return d >= ds && d < de && b.status === "completed"; });
    return { label: `W${wi + 1}`, val };
  });
  const maxBar = Math.max(...revenueMonthBars.map(b => b.val), 1);
  // Index of the current week within this month (0-3)
  const currentWeekIdx = Math.min(Math.floor((now.getDate() - 1) / 7), 3);

  const doneCount  = bookings.filter(b => b.status === "completed").length;
  const totalCount = bookings.filter(b => !["pending","new","cancelled"].includes(b.status)).length;
  const pct    = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const r      = 21;
  const circ   = +(2 * Math.PI * r).toFixed(2);
  const offset = +(circ * (1 - pct / 100)).toFixed(2);

  const heatmapData = buildHeatmap(bookings, Math.max(-1, Math.min(1, hmOffset)));
  const hmMax = Math.max(...heatmapData.flat());
  const { peakDay, peakHour, peakVal, topOff } = computeHeatmapInsights(heatmapData);
  const hmWeekLabel = hmOffset === 0 ? "This week" : hmOffset === -1 ? "Last week" : "Next week";

  function petName(b: DashBooking) {
    return b.pets?.name ?? "Pet";
  }
  function ownerFirst(b: DashBooking) {
    return b.customers?.first_name ?? "Customer";
  }
  function svcName(b: DashBooking) {
    return b.services?.name ?? "Service";
  }

  if (loading) {
    return (
      <main className="ovw-main">
        <div className="ovw-content" style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300 }}>
          <div style={{ color:"#7eb5d6", fontSize:13 }}>Loading dashboard…</div>
        </div>
      </main>
    );
  }

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
            <div className="rev-card-main">฿{revenueToday.toLocaleString()}</div>
            <div className="rev-card-change" style={{ color: revenueToday > 0 ? "#22c55e" : "#9ec9e0" }}>
              {revenueToday > 0 ? `↑ ฿${revenueToday.toLocaleString()} earned` : "No completed bookings yet"}
            </div>
            <div className="rev-card-divider" />
            <div className="rev-card-row">
              <div className="rev-card-sub-label">This week</div>
              <div className="rev-card-sub-val">฿{revenueWeek.toLocaleString()}</div>
            </div>
            <div className="rev-card-row">
              <div className="rev-card-sub-label">This month</div>
              <div className="rev-card-sub-val">฿{revenueMonth.toLocaleString()}</div>
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
            <div className="stat-card-num">{todayBks.length}</div>
            <div className={`stat-card-change ${todayBks.length > 0 ? "change-up" : "change-neutral"}`}>
              {todayBks.length > 0 ? `↑ ${todayBks.length} confirmed today` : "No bookings today"}
            </div>
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
                <div className="completion-change change-neutral">
                  {totalCount > 0 ? `${doneCount} of ${totalCount} completed` : "No bookings yet"}
                </div>
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
            <div className="stat-card-num">{ratingAvg > 0 ? ratingAvg.toFixed(1) : "—"}</div>
            <div className="stat-card-change change-neutral">★ {reviewCount} total review{reviewCount !== 1 ? "s" : ""}</div>
          </div>
        </div>

        {/* ── Today at a glance ── */}
        <div className="today-glance">
          <div className="today-glance-header">
            <div className="today-glance-title">Today at a glance · {todayBks.length} appointment{todayBks.length !== 1 ? "s" : ""}</div>
            <Link href="/vendor/calendar" className="panel-action">Open in Calendar →</Link>
          </div>
          <div className="today-glance-body">
            {todayBks.length === 0 ? (
              <div className="glance-slot-empty" style={{ color:"#9ec9e0" }}>No bookings scheduled for today.</div>
            ) : todayBks.map(b => {
                const sc =
                  b.status === "confirmed"   ? { bg:"rgba(23,168,255,0.12)", fg:"#17A8FF", border:"#17A8FF" } :
                  b.status === "in_progress" ? { bg:"rgba(0,52,89,0.10)",    fg:"#003459", border:"#003459" } :
                  b.status === "completed"   ? { bg:"rgba(16,185,129,0.12)", fg:"#10B981", border:"#10B981" } :
                  b.status === "cancelled"   ? { bg:"rgba(239,68,68,0.10)",  fg:"#ef4444", border:"#ef4444" } :
                                               { bg:"rgba(245,158,11,0.12)", fg:"#d97706", border:"#d97706" };
                const label =
                  b.status === "in_progress" ? "Checked-in" :
                  b.status.charAt(0).toUpperCase() + b.status.slice(1);
                return (
                  <div key={b.id} className="glance-slot" style={{ borderLeftColor: sc.border }}>
                    <div className="glance-time">{fmtTime12(b.scheduled_at)}</div>
                    <div>
                      <div className="glance-pet">{petName(b)} · {ownerFirst(b)}</div>
                      <div className="glance-service">{svcName(b)} · ฿{(b.total_amount ?? 0).toLocaleString()}</div>
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:100, background:sc.bg, color:sc.fg, whiteSpace:"nowrap" }}>
                      {label}
                    </span>
                  </div>
                );
              })}
            <div className="glance-slot-empty">+ Add slot</div>
          </div>
        </div>

        {/* ── Heatmap (static visualisation) ── */}
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
              {upcomingBks.length === 0 ? (
                <div style={{ padding:"16px 0", fontSize:12, color:"#9ec9e0", textAlign:"center" }}>No upcoming bookings this week.</div>
              ) : upcomingBks.map((b, i) => {
                const d = new Date(b.scheduled_at);
                const dayLabel = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
                const sc =
                  b.status === "confirmed"   ? { bg:"rgba(23,168,255,0.12)", fg:"#17A8FF" } :
                  b.status === "in_progress" ? { bg:"rgba(0,52,89,0.10)",    fg:"#003459" } :
                  b.status === "completed"   ? { bg:"rgba(16,185,129,0.12)", fg:"#10B981" } :
                  b.status === "cancelled"   ? { bg:"rgba(239,68,68,0.10)",  fg:"#ef4444" } :
                                               { bg:"rgba(245,158,11,0.12)", fg:"#d97706" };
                const label =
                  b.status === "in_progress" ? "Checked-in" :
                  b.status.charAt(0).toUpperCase() + b.status.slice(1);
                return (
                  <div key={b.id} className="booking-row">
                    <div className="bk-avatar" style={{ background: colorFor(i) }}>
                      {(b.customers?.first_name?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div>
                      <div className="bk-name">{petName(b)} · {b.customers ? `${b.customers.first_name} ${b.customers.last_name}` : "Customer"}</div>
                      <div className="bk-service">{svcName(b)} · ฿{(b.total_amount ?? 0).toLocaleString()}</div>
                    </div>
                    <div className="bk-time">
                      <div className="bk-time-main">{fmtTime12(b.scheduled_at)}</div>
                      <div style={{ marginTop: 3, fontSize: 11, color: "#9ec9e0" }}>{dayLabel} {d.getDate()}/{d.getMonth()+1}</div>
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:100, background:sc.bg, color:sc.fg, whiteSpace:"nowrap" }}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly revenue */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Monthly revenue</div>
            </div>
            <div className="panel-body">
              <div style={{ textAlign: "center", paddingBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#5a8fa8", marginBottom: 4 }}>
                  {now.toLocaleString("en-US", { month: "long", year: "numeric" })}
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#00171F", letterSpacing: -1.5, lineHeight: 1 }}>
                  ฿{revenueMonth.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: "#9ec9e0", fontWeight: 500, marginTop: 4 }}>
                  {revenueMonth > 0 ? "Month to date" : "No revenue yet this month"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                {revenueMonthBars.map((bar, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", justifyContent: "flex-end" }}>
                    <div style={{
                      borderRadius: "5px 5px 0 0",
                      height: `${Math.round((bar.val / maxBar) * 100)}%`,
                      minHeight: bar.val > 0 ? 4 : 0,
                      background: i === currentWeekIdx ? "#17A8FF" : "rgba(23,168,255,0.18)",
                    }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                {revenueMonthBars.map((bar, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 9, color: i === currentWeekIdx ? "#17A8FF" : "#7eb5d6", fontWeight: i === currentWeekIdx ? 600 : 400 }}>{bar.label}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
