"use client";

import { useState } from "react";

type Booking = {
  id: string; ref: string; customer: string; pet: string; breed: string;
  service: string; date: string; time: string; amount: number;
  status: "completed" | "in_progress" | "confirmed" | "cancelled" | "pending";
  color: string; duration: number; phone: string;
};

const ALL_BOOKINGS: Booking[] = [
  // Today Apr 15
  { id:"b1",  ref:"BK-202604-2341", customer:"Mintra Saelim",    pet:"Butter", breed:"Poodle",           service:"Full Grooming Package",  date:"Wed, 15 Apr 2026", time:"9:00am",  amount:900, status:"completed",  color:"#17A8FF", duration:120, phone:"081-234-5678" },
  { id:"b2",  ref:"BK-202604-2342", customer:"Warat Chaiwong",   pet:"Mochi",  breed:"Shih Tzu",         service:"Bath & Brush",           date:"Wed, 15 Apr 2026", time:"10:30am", amount:450, status:"in_progress",color:"#22c55e", duration:60,  phone:"082-345-6789" },
  { id:"b3",  ref:"BK-202604-2343", customer:"Anchana Pimjai",   pet:"Nala",   breed:"Persian",          service:"Cat Grooming",           date:"Wed, 15 Apr 2026", time:"1:00pm",  amount:650, status:"confirmed",  color:"#F5A623", duration:90,  phone:"083-456-7890" },
  { id:"b4",  ref:"BK-202604-2344", customer:"Prapai Thaweesap", pet:"Max",    breed:"Golden Retriever", service:"Full Grooming Package",  date:"Wed, 15 Apr 2026", time:"2:30pm",  amount:900, status:"confirmed",  color:"#8b5cf6", duration:120, phone:"084-567-8901" },
  { id:"b5",  ref:"BK-202604-2345", customer:"Natthida Phongsri",pet:"Coco",   breed:"French Bulldog",   service:"Nail Trim & Ear Clean",  date:"Wed, 15 Apr 2026", time:"4:00pm",  amount:250, status:"confirmed",  color:"#f43f5e", duration:30,  phone:"085-678-9012" },
  // Tue Apr 14
  { id:"b6",  ref:"BK-202604-2338", customer:"Warat Chaiwong",   pet:"Mochi",  breed:"Shih Tzu",         service:"Full Grooming Package",  date:"Tue, 14 Apr 2026", time:"9:00am",  amount:900, status:"completed",  color:"#22c55e", duration:120, phone:"082-345-6789" },
  { id:"b7",  ref:"BK-202604-2339", customer:"Anchana Pimjai",   pet:"Nala",   breed:"Persian",          service:"Cat Grooming",           date:"Tue, 14 Apr 2026", time:"11:00am", amount:650, status:"completed",  color:"#F5A623", duration:90,  phone:"083-456-7890" },
  { id:"b8",  ref:"BK-202604-2340", customer:"Suda Chomchan",    pet:"Luna",   breed:"Ragdoll",          service:"Cat Grooming",           date:"Tue, 14 Apr 2026", time:"2:00pm",  amount:650, status:"completed",  color:"#0B93E8", duration:90,  phone:"086-789-0123" },
  // Mon Apr 13
  { id:"b9",  ref:"BK-202604-2335", customer:"Mintra Saelim",    pet:"Butter", breed:"Poodle",           service:"Bath & Brush",           date:"Mon, 13 Apr 2026", time:"9:00am",  amount:450, status:"completed",  color:"#17A8FF", duration:60,  phone:"081-234-5678" },
  { id:"b10", ref:"BK-202604-2336", customer:"Prapai Thaweesap", pet:"Max",    breed:"Golden Retriever", service:"Full Grooming Package",  date:"Mon, 13 Apr 2026", time:"11:00am", amount:900, status:"completed",  color:"#8b5cf6", duration:120, phone:"084-567-8901" },
  { id:"b11", ref:"BK-202604-2337", customer:"Natthida Phongsri",pet:"Coco",   breed:"French Bulldog",   service:"Bath & Brush",           date:"Mon, 13 Apr 2026", time:"2:00pm",  amount:450, status:"completed",  color:"#f43f5e", duration:60,  phone:"085-678-9012" },
  // Upcoming this week
  { id:"b12", ref:"BK-202604-2346", customer:"Mintra Saelim",    pet:"Butter", breed:"Poodle",           service:"Bath & Brush",           date:"Thu, 16 Apr 2026", time:"11:00am", amount:450, status:"confirmed",  color:"#17A8FF", duration:60,  phone:"081-234-5678" },
  { id:"b13", ref:"BK-202604-2347", customer:"Anchana Pimjai",   pet:"Nala",   breed:"Persian",          service:"Nail Trim & Ear Clean",  date:"Thu, 16 Apr 2026", time:"4:30pm",  amount:250, status:"confirmed",  color:"#F5A623", duration:30,  phone:"083-456-7890" },
  { id:"b14", ref:"BK-202604-2348", customer:"Warat Chaiwong",   pet:"Mochi",  breed:"Shih Tzu",         service:"Full Grooming Package",  date:"Fri, 17 Apr 2026", time:"9:00am",  amount:900, status:"confirmed",  color:"#22c55e", duration:120, phone:"082-345-6789" },
  { id:"b15", ref:"BK-202604-2349", customer:"Prapai Thaweesap", pet:"Max",    breed:"Golden Retriever", service:"Full Day Care",          date:"Sat, 18 Apr 2026", time:"9:00am",  amount:350, status:"confirmed",  color:"#8b5cf6", duration:480, phone:"084-567-8901" },
  { id:"b16", ref:"BK-202604-2350", customer:"Anchana Pimjai",   pet:"Nala",   breed:"Persian",          service:"Cat Grooming",           date:"Sat, 18 Apr 2026", time:"10:00am", amount:650, status:"confirmed",  color:"#F5A623", duration:90,  phone:"083-456-7890" },
  { id:"b17", ref:"BK-202604-2351", customer:"Mintra Saelim",    pet:"Butter", breed:"Poodle",           service:"Full Grooming Package",  date:"Sat, 18 Apr 2026", time:"1:00pm",  amount:900, status:"confirmed",  color:"#17A8FF", duration:120, phone:"081-234-5678" },
  { id:"b18", ref:"BK-202604-2320", customer:"Suda Chomchan",    pet:"Luna",   breed:"Ragdoll",          service:"Full Grooming Package",  date:"Sat, 11 Apr 2026", time:"11:00am", amount:900, status:"cancelled",  color:"#94a3b8", duration:120, phone:"086-789-0123" },
];

type Status = "all" | "confirmed" | "in_progress" | "completed" | "cancelled";

const STATUS_TABS: { key: Status; label: string }[] = [
  { key:"all",         label:"All" },
  { key:"confirmed",   label:"Confirmed" },
  { key:"in_progress", label:"In Progress" },
  { key:"completed",   label:"Completed" },
  { key:"cancelled",   label:"Cancelled" },
];

const AVATAR_COLORS = ["#17A8FF","#22c55e","#F5A623","#8b5cf6","#f43f5e","#0B93E8","#003459"];
const colorFor = (i: number) => AVATAR_COLORS[i % AVATAR_COLORS.length];

function badgeClass(s: string) {
  if (s === "completed")  return "badge badge-completed";
  if (s === "confirmed")  return "badge badge-confirmed";
  if (s === "cancelled")  return "badge badge-cancelled";
  if (s === "in_progress") return "badge badge-new";
  return "badge badge-pending";
}

function statusLabel(s: string) {
  if (s === "in_progress") return "In Progress";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function DemoBookings() {
  const [activeStatus, setActiveStatus] = useState<Status>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);

  const filtered = ALL_BOOKINGS.filter(b => {
    const matchStatus = activeStatus === "all" || b.status === activeStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || b.customer.toLowerCase().includes(q) || b.pet.toLowerCase().includes(q) || b.ref.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = STATUS_TABS.map(t => ({
    ...t,
    count: t.key === "all" ? ALL_BOOKINGS.length : ALL_BOOKINGS.filter(b => b.status === t.key).length,
  }));

  return (
    <main className="vd-main">
      <div className="vd-content" style={{ display:"flex", gap:20 }}>

        {/* ── Main panel ── */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* Status tabs */}
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            {counts.map(t => (
              <button key={t.key} onClick={() => setActiveStatus(t.key)} style={{
                padding:"6px 14px", borderRadius:100, fontSize:12, fontWeight:500,
                fontFamily:"'Lexend Deca',sans-serif", cursor:"pointer", transition:"all 0.15s",
                border: activeStatus === t.key ? "1.5px solid #00171F" : "1.5px solid #d4e6f0",
                background: activeStatus === t.key ? "#00171F" : "transparent",
                color: activeStatus === t.key ? "#fff" : "#7eb5d6",
              }}>
                {t.label}
                <span style={{
                  marginLeft:6, padding:"1px 6px", borderRadius:100, fontSize:10,
                  background: activeStatus === t.key ? "rgba(255,255,255,0.2)" : "#f0f7ff",
                  color: activeStatus === t.key ? "#fff" : "#5a8fa8",
                }}>{t.count}</span>
              </button>
            ))}
            <input
              style={{ marginLeft:"auto", padding:"6px 14px", borderRadius:100, fontSize:12,
                border:"1.5px solid #d4e6f0", outline:"none", fontFamily:"'Lexend Deca',sans-serif",
                color:"#00171F", background:"#fff", width:200 }}
              placeholder="Search booking, pet, customer…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="panel" style={{ overflow:"hidden" }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Reference</th><th>Customer & Pet</th><th>Service</th>
                    <th>Date & Time</th><th>Amount</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign:"center", padding:"32px", color:"#7eb5d6" }}>No bookings found.</td></tr>
                  ) : filtered.map((b, i) => (
                    <tr key={b.id} style={{ cursor:"pointer" }} onClick={() => setSelected(b === selected ? null : b)}>
                      <td style={{ color:"#17A8FF", fontWeight:500 }}>{b.ref}</td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span className="td-avatar" style={{ background: colorFor(i) }}>
                            {b.customer[0]}
                          </span>
                          <div>
                            <div style={{ fontWeight:500, fontSize:13 }}>{b.customer}</div>
                            <div style={{ fontSize:11, color:"#7eb5d6" }}>{b.pet} · {b.breed}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize:13 }}>{b.service}</td>
                      <td>
                        <div style={{ fontSize:13 }}>{b.date}</div>
                        <div style={{ fontSize:11, color:"#7eb5d6" }}>{b.time} · {b.duration}min</div>
                      </td>
                      <td style={{ fontWeight:600 }}>฿{b.amount.toLocaleString()}</td>
                      <td><span className={badgeClass(b.status)}>{statusLabel(b.status)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Booking detail panel ── */}
        {selected && (
          <div className="panel" style={{ width:280, flexShrink:0, alignSelf:"flex-start" }}>
            <div className="panel-header">
              <div className="panel-title">Booking details</div>
              <button onClick={() => setSelected(null)} style={{
                background:"none", border:"none", fontSize:18, color:"#9ec9e0",
                cursor:"pointer", lineHeight:1, padding:0,
              }}>×</button>
            </div>
            <div className="panel-body" style={{ fontSize:13 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:selected.color,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#fff", fontWeight:700, fontSize:15 }}>
                  {selected.customer[0]}
                </div>
                <div>
                  <div style={{ fontWeight:600, color:"#00171F" }}>{selected.customer}</div>
                  <div style={{ fontSize:11, color:"#7eb5d6" }}>{selected.phone}</div>
                </div>
              </div>
              {[
                ["Reference",  selected.ref],
                ["Pet",        `${selected.pet} (${selected.breed})`],
                ["Service",    selected.service],
                ["Duration",   `${selected.duration} minutes`],
                ["Date",       selected.date],
                ["Time",       selected.time],
                ["Amount",     `฿${selected.amount.toLocaleString()}`],
              ].map(([label, value]) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between",
                  padding:"8px 0", borderBottom:"1px solid #f4f8fc" }}>
                  <span style={{ color:"#7eb5d6" }}>{label}</span>
                  <span style={{ fontWeight:500, color:"#00171F" }}>{value}</span>
                </div>
              ))}
              <div style={{ marginTop:8 }}>
                <span className={badgeClass(selected.status)}>{statusLabel(selected.status)}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
