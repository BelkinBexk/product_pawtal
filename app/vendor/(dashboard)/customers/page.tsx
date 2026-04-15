"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
type DbBooking = {
  id: string;
  scheduled_at: string;
  status: string;
  total_amount: number;
  customer_id: string;
  customers: { id: string; first_name: string; last_name: string; phone: string | null } | null;
  pets: { name: string; breed: string | null } | null;
};

type CustomerRow = {
  id: string;
  name: string;
  pet: string;
  visits: number;
  spent: number;
  last: string;
  status: "VIP" | "Regular" | "New";
  color: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#17A8FF","#22c55e","#F5A623","#8b5cf6","#f43f5e","#0B93E8","#003459"];
const colorFor = (i: number) => AVATAR_COLORS[i % AVATAR_COLORS.length];

function customerStatus(visits: number): "VIP" | "Regular" | "New" {
  if (visits >= 5) return "VIP";
  if (visits >= 3) return "Regular";
  return "New";
}

function statusBadge(s: string) {
  if (s === "VIP")     return "badge badge-new";
  if (s === "New")     return "badge badge-pending";
  return "badge badge-completed";
}

// ── Demo mode ─────────────────────────────────────────────────────────────────
const DEMO_MODE = true;

const MOCK_CUST_BOOKINGS: DbBooking[] = [
  // Mintra — 8 visits
  { id:"mk01", scheduled_at:"2026-04-15T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000001-0000-4000-8000-000000000001", customers:{id:"c0000001-0000-4000-8000-000000000001", first_name:"Mintra",   last_name:"Saelim",    phone:"081-234-5678"}, pets:{name:"Butter", breed:"Poodle"} },
  { id:"mk09", scheduled_at:"2026-04-13T02:00:00Z", status:"completed",   total_amount:450, customer_id:"c0000001-0000-4000-8000-000000000001", customers:{id:"c0000001-0000-4000-8000-000000000001", first_name:"Mintra",   last_name:"Saelim",    phone:"081-234-5678"}, pets:{name:"Butter", breed:"Poodle"} },
  { id:"mk12", scheduled_at:"2026-04-16T04:00:00Z", status:"confirmed",   total_amount:450, customer_id:"c0000001-0000-4000-8000-000000000001", customers:{id:"c0000001-0000-4000-8000-000000000001", first_name:"Mintra",   last_name:"Saelim",    phone:"081-234-5678"}, pets:{name:"Butter", breed:"Poodle"} },
  { id:"mk17", scheduled_at:"2026-04-18T06:00:00Z", status:"confirmed",   total_amount:900, customer_id:"c0000001-0000-4000-8000-000000000001", customers:{id:"c0000001-0000-4000-8000-000000000001", first_name:"Mintra",   last_name:"Saelim",    phone:"081-234-5678"}, pets:{name:"Butter", breed:"Poodle"} },
  { id:"mr20", scheduled_at:"2026-03-28T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000001-0000-4000-8000-000000000001", customers:{id:"c0000001-0000-4000-8000-000000000001", first_name:"Mintra",   last_name:"Saelim",    phone:"081-234-5678"}, pets:{name:"Butter", breed:"Poodle"} },
  { id:"mr21", scheduled_at:"2026-03-14T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000001-0000-4000-8000-000000000001", customers:{id:"c0000001-0000-4000-8000-000000000001", first_name:"Mintra",   last_name:"Saelim",    phone:"081-234-5678"}, pets:{name:"Butter", breed:"Poodle"} },
  { id:"mr22", scheduled_at:"2026-02-26T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000001-0000-4000-8000-000000000001", customers:{id:"c0000001-0000-4000-8000-000000000001", first_name:"Mintra",   last_name:"Saelim",    phone:"081-234-5678"}, pets:{name:"Butter", breed:"Poodle"} },
  { id:"mr23", scheduled_at:"2026-01-25T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000001-0000-4000-8000-000000000001", customers:{id:"c0000001-0000-4000-8000-000000000001", first_name:"Mintra",   last_name:"Saelim",    phone:"081-234-5678"}, pets:{name:"Butter", breed:"Poodle"} },
  // Warat — 6 visits
  { id:"mk02", scheduled_at:"2026-04-15T03:30:00Z", status:"in_progress", total_amount:450, customer_id:"c0000002-0000-4000-8000-000000000002", customers:{id:"c0000002-0000-4000-8000-000000000002", first_name:"Warat",    last_name:"Chaiwong",  phone:"082-345-6789"}, pets:{name:"Mochi",  breed:"Shih Tzu"} },
  { id:"mk06", scheduled_at:"2026-04-14T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000002-0000-4000-8000-000000000002", customers:{id:"c0000002-0000-4000-8000-000000000002", first_name:"Warat",    last_name:"Chaiwong",  phone:"082-345-6789"}, pets:{name:"Mochi",  breed:"Shih Tzu"} },
  { id:"mk14", scheduled_at:"2026-04-17T02:00:00Z", status:"confirmed",   total_amount:900, customer_id:"c0000002-0000-4000-8000-000000000002", customers:{id:"c0000002-0000-4000-8000-000000000002", first_name:"Warat",    last_name:"Chaiwong",  phone:"082-345-6789"}, pets:{name:"Mochi",  breed:"Shih Tzu"} },
  { id:"mr30", scheduled_at:"2026-03-25T04:00:00Z", status:"completed",   total_amount:450, customer_id:"c0000002-0000-4000-8000-000000000002", customers:{id:"c0000002-0000-4000-8000-000000000002", first_name:"Warat",    last_name:"Chaiwong",  phone:"082-345-6789"}, pets:{name:"Mochi",  breed:"Shih Tzu"} },
  { id:"mr31", scheduled_at:"2026-02-18T02:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000002-0000-4000-8000-000000000002", customers:{id:"c0000002-0000-4000-8000-000000000002", first_name:"Warat",    last_name:"Chaiwong",  phone:"082-345-6789"}, pets:{name:"Mochi",  breed:"Shih Tzu"} },
  { id:"mr32", scheduled_at:"2026-01-18T04:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000002-0000-4000-8000-000000000002", customers:{id:"c0000002-0000-4000-8000-000000000002", first_name:"Warat",    last_name:"Chaiwong",  phone:"082-345-6789"}, pets:{name:"Mochi",  breed:"Shih Tzu"} },
  // Anchana — 4 visits
  { id:"mk03", scheduled_at:"2026-04-15T06:00:00Z", status:"confirmed",   total_amount:650, customer_id:"c0000003-0000-4000-8000-000000000003", customers:{id:"c0000003-0000-4000-8000-000000000003", first_name:"Anchana",  last_name:"Pimjai",    phone:"083-456-7890"}, pets:{name:"Nala",   breed:"Persian"} },
  { id:"mk07", scheduled_at:"2026-04-14T04:00:00Z", status:"completed",   total_amount:650, customer_id:"c0000003-0000-4000-8000-000000000003", customers:{id:"c0000003-0000-4000-8000-000000000003", first_name:"Anchana",  last_name:"Pimjai",    phone:"083-456-7890"}, pets:{name:"Nala",   breed:"Persian"} },
  { id:"mk16", scheduled_at:"2026-04-18T03:00:00Z", status:"confirmed",   total_amount:650, customer_id:"c0000003-0000-4000-8000-000000000003", customers:{id:"c0000003-0000-4000-8000-000000000003", first_name:"Anchana",  last_name:"Pimjai",    phone:"083-456-7890"}, pets:{name:"Nala",   breed:"Persian"} },
  { id:"mr40", scheduled_at:"2026-03-21T02:00:00Z", status:"completed",   total_amount:650, customer_id:"c0000003-0000-4000-8000-000000000003", customers:{id:"c0000003-0000-4000-8000-000000000003", first_name:"Anchana",  last_name:"Pimjai",    phone:"083-456-7890"}, pets:{name:"Nala",   breed:"Persian"} },
  // Prapai — 3 visits
  { id:"mk04", scheduled_at:"2026-04-15T07:30:00Z", status:"confirmed",   total_amount:900, customer_id:"c0000004-0000-4000-8000-000000000004", customers:{id:"c0000004-0000-4000-8000-000000000004", first_name:"Prapai",   last_name:"Thaweesap", phone:"084-567-8901"}, pets:{name:"Max",    breed:"Golden Retriever"} },
  { id:"mk10", scheduled_at:"2026-04-13T04:00:00Z", status:"completed",   total_amount:900, customer_id:"c0000004-0000-4000-8000-000000000004", customers:{id:"c0000004-0000-4000-8000-000000000004", first_name:"Prapai",   last_name:"Thaweesap", phone:"084-567-8901"}, pets:{name:"Max",    breed:"Golden Retriever"} },
  { id:"mk15", scheduled_at:"2026-04-18T02:00:00Z", status:"confirmed",   total_amount:350, customer_id:"c0000004-0000-4000-8000-000000000004", customers:{id:"c0000004-0000-4000-8000-000000000004", first_name:"Prapai",   last_name:"Thaweesap", phone:"084-567-8901"}, pets:{name:"Max",    breed:"Golden Retriever"} },
  // Suda — 2 visits
  { id:"mk08", scheduled_at:"2026-04-14T07:00:00Z", status:"completed",   total_amount:650, customer_id:"c0000006-0000-4000-8000-000000000006", customers:{id:"c0000006-0000-4000-8000-000000000006", first_name:"Suda",     last_name:"Chomchan",  phone:"086-789-0123"}, pets:{name:"Luna",   breed:"Ragdoll"} },
  { id:"mk18", scheduled_at:"2026-04-18T07:00:00Z", status:"confirmed",   total_amount:450, customer_id:"c0000006-0000-4000-8000-000000000006", customers:{id:"c0000006-0000-4000-8000-000000000006", first_name:"Suda",     last_name:"Chomchan",  phone:"086-789-0123"}, pets:{name:"Luna",   breed:"Ragdoll"} },
  // Natthida — 1 visit
  { id:"mk11", scheduled_at:"2026-04-13T07:00:00Z", status:"completed",   total_amount:450, customer_id:"c0000005-0000-4000-8000-000000000005", customers:{id:"c0000005-0000-4000-8000-000000000005", first_name:"Natthida", last_name:"Phongsri",  phone:"085-678-9012"}, pets:{name:"Coco",   breed:"French Bulldog"} },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [loading,    setLoading]    = useState(true);
  const [rawBookings, setRawBookings] = useState<DbBooking[]>([]);
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    (async () => {
      if (DEMO_MODE) {
        setRawBookings(MOCK_CUST_BOOKINGS); setLoading(false); return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: prov } = await supabase.from("providers").select("id").eq("user_id", user.id).single();
      if (!prov) { setLoading(false); return; }

      const { data: bks } = await supabase
        .from("bookings")
        .select(`
          id, scheduled_at, status, total_amount, customer_id,
          customers(id, first_name, last_name, phone),
          pets(name, breed)
        `)
        .eq("provider_id", prov.id)
        .order("scheduled_at", { ascending: false });

      if (bks) setRawBookings(bks as unknown as DbBooking[]);
      setLoading(false);
    })();
  }, []);

  // ── Aggregate into customer rows ──────────────────────────────────────────
  const customers: CustomerRow[] = useMemo(() => {
    const map = new Map<string, {
      customer: DbBooking["customers"];
      pet: DbBooking["pets"];
      bookings: DbBooking[];
    }>();

    rawBookings.forEach(b => {
      if (!b.customers) return;
      const cid = b.customer_id;
      if (!map.has(cid)) {
        map.set(cid, { customer: b.customers, pet: b.pets ?? null, bookings: [] });
      }
      map.get(cid)!.bookings.push(b);
      // Keep the most recent pet
      if (b.pets && map.get(cid)!.pet === null) {
        map.get(cid)!.pet = b.pets;
      }
    });

    return Array.from(map.entries()).map(([, { customer, pet, bookings }], i) => {
      const completedBks = bookings.filter(b => b.status === "completed");
      const visits       = completedBks.length;
      const spent        = completedBks.reduce((s, b) => s + (b.total_amount ?? 0), 0);
      const lastBk       = bookings[0]; // sorted desc
      const lastDate     = lastBk
        ? new Date(lastBk.scheduled_at).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })
        : "—";
      const petLabel = pet ? `${pet.name}${pet.breed ? ` (${pet.breed})` : ""}` : "—";

      return {
        id:     customer!.id,
        name:   `${customer!.first_name} ${customer!.last_name}`,
        pet:    petLabel,
        visits,
        spent,
        last:   lastDate,
        status: customerStatus(visits),
        color:  colorFor(i),
      };
    }).sort((a, b) => b.visits - a.visits || b.spent - a.spent);
  }, [rawBookings]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalCustomers = customers.length;
  const vipCount       = customers.filter(c => c.status === "VIP").length;

  const now       = new Date();
  const mStart    = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = useMemo(() => {
    const firstSeen = new Map<string, string>();
    [...rawBookings].reverse().forEach(b => {
      if (!firstSeen.has(b.customer_id)) firstSeen.set(b.customer_id, b.scheduled_at);
    });
    return [...firstSeen.values()].filter(d => new Date(d) >= mStart).length;
  }, [rawBookings, mStart]);

  const avgLTV = customers.length > 0
    ? Math.round(customers.reduce((s, c) => s + c.spent, 0) / customers.length)
    : 0;

  const statCards = [
    {
      label: "Total Customers", value: String(totalCustomers),
      change: `${vipCount} VIP${vipCount !== 1 ? "s" : ""}`, up: false,
      icon: `<circle cx="6" cy="5" r="3" stroke="#17A8FF" stroke-width="1.4"/><path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#17A8FF" stroke-width="1.4" stroke-linecap="round"/>`,
    },
    {
      label: "New This Month", value: `+${newThisMonth}`,
      change: "First booking this month", up: true,
      icon: `<path d="M8 2v12M4 6l4-4 4 4" stroke="#17A8FF" stroke-width="1.4" stroke-linecap="round"/>`,
    },
    {
      label: "Avg. Lifetime Value", value: avgLTV > 0 ? `฿${avgLTV.toLocaleString()}` : "—",
      change: "Based on completed bookings", up: false,
      icon: `<circle cx="8" cy="8" r="6" stroke="#17A8FF" stroke-width="1.4"/><path d="M8 5v3l2 2" stroke="#17A8FF" stroke-width="1.4" stroke-linecap="round"/>`,
    },
  ];

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.pet.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="vd-main">
      <div className="vd-content">

        {/* ── Stat cards ── */}
        <div className="cust-stat-row">
          {statCards.map(c => (
            <div key={c.label} className="rev-stat-card">
              <div className="rev-stat-header">
                <span className="rev-stat-label">{c.label}</span>
                <div className="rev-stat-icon">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14"
                    dangerouslySetInnerHTML={{ __html: c.icon }} />
                </div>
              </div>
              <div className="rev-stat-value">{loading ? "…" : c.value}</div>
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
              onChange={e => setSearch(e.target.value)}
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
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign:"center", padding:"32px", color:"#7eb5d6" }}>Loading customers…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign:"center", padding:"32px", color:"#7eb5d6" }}>
                    {search ? "No customers found." : "No customers yet."}
                  </td></tr>
                ) : filtered.map(c => (
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
