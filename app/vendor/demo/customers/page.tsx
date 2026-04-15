"use client";

import { useState } from "react";

const CUSTOMERS = [
  { id:"c1", name:"Mintra Saelim",      pet:"Butter (Poodle)",         visits:8,  spent:7200,  last:"15 Apr 2026", status:"VIP",     color:"#17A8FF" },
  { id:"c2", name:"Warat Chaiwong",     pet:"Mochi (Shih Tzu)",        visits:6,  spent:5400,  last:"14 Apr 2026", status:"VIP",     color:"#22c55e" },
  { id:"c3", name:"Anchana Pimjai",     pet:"Nala (Persian)",          visits:4,  spent:2600,  last:"15 Apr 2026", status:"Regular", color:"#F5A623" },
  { id:"c4", name:"Prapai Thaweesap",   pet:"Max (Golden Retriever)",  visits:3,  spent:2700,  last:"13 Apr 2026", status:"Regular", color:"#8b5cf6" },
  { id:"c5", name:"Suda Chomchan",      pet:"Luna (Ragdoll)",          visits:2,  spent:1300,  last:"14 Apr 2026", status:"New",     color:"#0B93E8" },
  { id:"c6", name:"Natthida Phongsri",  pet:"Coco (French Bulldog)",   visits:1,  spent:250,   last:"15 Apr 2026", status:"New",     color:"#f43f5e" },
];

const STAT_CARDS = [
  { label:"Total Customers", value:"6", change:"2 VIPs",                   icon:`<circle cx="6" cy="5" r="3" stroke="#17A8FF" stroke-width="1.4"/><path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#17A8FF" stroke-width="1.4" stroke-linecap="round"/>` },
  { label:"New This Month",  value:"+2", change:"First booking this month", icon:`<path d="M8 2v12M4 6l4-4 4 4" stroke="#17A8FF" stroke-width="1.4" stroke-linecap="round"/>` },
  { label:"Avg. Lifetime Value", value:"฿3,242", change:"Based on completed bookings", icon:`<circle cx="8" cy="8" r="6" stroke="#17A8FF" stroke-width="1.4"/><path d="M8 5v3l2 2" stroke="#17A8FF" stroke-width="1.4" stroke-linecap="round"/>` },
];

function statusBadge(s: string) {
  if (s === "VIP")     return "badge badge-new";
  if (s === "New")     return "badge badge-pending";
  return "badge badge-completed";
}

export default function DemoCustomers() {
  const [search, setSearch] = useState("");
  const filtered = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.pet.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="vd-main">
      <div className="vd-content">

        <div className="cust-stat-row">
          {STAT_CARDS.map(c => (
            <div key={c.label} className="rev-stat-card">
              <div className="rev-stat-header">
                <span className="rev-stat-label">{c.label}</span>
                <div className="rev-stat-icon">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14"
                    dangerouslySetInnerHTML={{ __html: c.icon }} />
                </div>
              </div>
              <div className="rev-stat-value">{c.value}</div>
              <div className="rev-stat-sub neutral">{c.change}</div>
            </div>
          ))}
        </div>

        <div className="rev-panel">
          <div className="rev-panel-header">
            <span className="rev-panel-title">All customers</span>
            <input className="cust-search" placeholder="Search customer or pet…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="rev-table-wrap">
            <table className="rev-table">
              <thead>
                <tr>
                  <th>Customer</th><th>Pet</th><th>Visits</th>
                  <th>Total Spent</th><th>Last Visit</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="rev-tx-customer">
                        <div className="rev-tx-avatar" style={{ background: c.color }}>{c.name[0]}</div>
                        <span style={{ fontWeight:500 }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ color:"#5a8fa8" }}>{c.pet}</td>
                    <td style={{ fontWeight:600 }}>{c.visits}</td>
                    <td className="rev-tx-id">฿{c.spent.toLocaleString()}</td>
                    <td style={{ color:"#5a8fa8" }}>{c.last}</td>
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
