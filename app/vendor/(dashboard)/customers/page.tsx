"use client";

import { useState } from "react";

// ── Mock data ──────────────────────────────────────────────────────────────────

const CUSTOMERS = [
  { name: "Natthida P.", pet: "Mochi (Shih Tzu)", visits: 8,  spent: "฿5,040", last: "24 Dec 2024", status: "VIP",     color: "#17A8FF" },
  { name: "Krit W.",     pet: "Luna (Persian)",   visits: 5,  spent: "฿4,000", last: "23 Dec 2024", status: "Regular", color: "#F5A623" },
  { name: "Pim R.",      pet: "Buddy (Labrador)", visits: 6,  spent: "฿4,080", last: "22 Dec 2024", status: "Regular", color: "#003459" },
  { name: "Suda C.",     pet: "Nala (Siamese)",   visits: 3,  spent: "฿1,575", last: "20 Dec 2024", status: "Regular", color: "#0B93E8" },
  { name: "May L.",      pet: "Coco (Poodle)",    visits: 2,  spent: "฿2,600", last: "18 Dec 2024", status: "New",     color: "#8b5cf6" },
  { name: "Arm K.",      pet: "Bella (Corgi)",    visits: 1,  spent: "฿800",   last: "15 Dec 2024", status: "New",     color: "#f43f5e" },
  { name: "Tong V.",     pet: "Max (Golden)",     visits: 4,  spent: "฿2,520", last: "12 Dec 2024", status: "Regular", color: "#22c55e" },
];

const STAT_CARDS = [
  {
    label: "Total Customers",
    value: "7",
    change: "2 VIPs",
    up: false,
    icon: `<circle cx="6" cy="5" r="3" stroke="#17A8FF" stroke-width="1.4"/><path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#17A8FF" stroke-width="1.4" stroke-linecap="round"/>`,
  },
  {
    label: "New This Month",
    value: "+2",
    change: "↑ 1 vs last month",
    up: true,
    icon: `<path d="M8 2v12M4 6l4-4 4 4" stroke="#17A8FF" stroke-width="1.4" stroke-linecap="round"/>`,
  },
  {
    label: "Avg. Lifetime Value",
    value: "฿3,634",
    change: "Based on all customers",
    up: false,
    icon: `<circle cx="8" cy="8" r="6" stroke="#17A8FF" stroke-width="1.4"/><path d="M8 5v3l2 2" stroke="#17A8FF" stroke-width="1.4" stroke-linecap="round"/>`,
  },
];

function statusBadge(s: string) {
  if (s === "VIP")     return "badge badge-new";
  if (s === "New")     return "badge badge-pending";
  return "badge badge-completed";
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [search, setSearch] = useState("");

  const filtered = CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.pet.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="vd-main">
      <div className="vd-content">

        {/* ── Stat cards ── */}
        <div className="cust-stat-row">
          {STAT_CARDS.map((c) => (
            <div key={c.label} className="rev-stat-card">
              <div className="rev-stat-header">
                <span className="rev-stat-label">{c.label}</span>
                <div className="rev-stat-icon">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14"
                    dangerouslySetInnerHTML={{ __html: c.icon }} />
                </div>
              </div>
              <div className="rev-stat-value">{c.value}</div>
              <div className={`rev-stat-sub ${c.up ? "up" : "neutral"}`}>{c.change}</div>
            </div>
          ))}
        </div>

        {/* ── Customers table ── */}
        <div className="rev-panel">
          <div className="rev-panel-header">
            <span className="rev-panel-title">All customers</span>
            <input
              className="cust-search"
              placeholder="Search customer or pet…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="rev-table-wrap">
            <table className="rev-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Pet</th>
                  <th>Visits</th>
                  <th>Total Spent</th>
                  <th>Last Visit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#7eb5d6", fontWeight: 300 }}>
                      No customers found.
                    </td>
                  </tr>
                ) : filtered.map((c) => (
                  <tr key={c.name}>
                    <td>
                      <div className="rev-tx-customer">
                        <div className="rev-tx-avatar" style={{ background: c.color }}>{c.name[0]}</div>
                        <span style={{ fontWeight: 500 }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "#5a8fa8" }}>{c.pet}</td>
                    <td style={{ fontWeight: 600 }}>{c.visits}</td>
                    <td className="rev-tx-id">{c.spent}</td>
                    <td style={{ color: "#5a8fa8" }}>{c.last}</td>
                    <td><span className={statusBadge(c.status)}>{c.status}</span></td>
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
