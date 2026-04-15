"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type CalEvent = {
  id: string; ref: string; pet: string; owner: string; service: string;
  dayIdx: number; // 0=Mon…6=Sun
  startHour: number; startMin: number; durationMin: number;
  color: string; statusColor: string; statusLabel: string;
  amount: number; breed: string; phone: string;
};

// ── Week events (April 13–19, 2026) ───────────────────────────────────────────
const WEEK_EVENTS: CalEvent[] = [
  // Monday Apr 13
  { id:"e1",  ref:"BK-202604-2335", pet:"Butter", owner:"Mintra Saelim",    service:"Bath & Brush",           dayIdx:0, startHour:9,  startMin:0,  durationMin:60,  color:"#17A8FF", statusColor:"#22c55e", statusLabel:"Completed", amount:450, breed:"Poodle",           phone:"081-234-5678" },
  { id:"e2",  ref:"BK-202604-2336", pet:"Max",    owner:"Prapai Thaweesap", service:"Full Grooming Package",  dayIdx:0, startHour:11, startMin:0,  durationMin:120, color:"#8b5cf6", statusColor:"#22c55e", statusLabel:"Completed", amount:900, breed:"Golden Retriever", phone:"084-567-8901" },
  { id:"e3",  ref:"BK-202604-2337", pet:"Coco",   owner:"Natthida Phongsri",service:"Bath & Brush",           dayIdx:0, startHour:14, startMin:0,  durationMin:60,  color:"#f43f5e", statusColor:"#22c55e", statusLabel:"Completed", amount:450, breed:"French Bulldog",  phone:"085-678-9012" },
  // Tuesday Apr 14
  { id:"e4",  ref:"BK-202604-2338", pet:"Mochi",  owner:"Warat Chaiwong",   service:"Full Grooming Package",  dayIdx:1, startHour:9,  startMin:0,  durationMin:120, color:"#22c55e", statusColor:"#22c55e", statusLabel:"Completed", amount:900, breed:"Shih Tzu",         phone:"082-345-6789" },
  { id:"e5",  ref:"BK-202604-2339", pet:"Nala",   owner:"Anchana Pimjai",   service:"Cat Grooming",           dayIdx:1, startHour:11, startMin:0,  durationMin:90,  color:"#F5A623", statusColor:"#22c55e", statusLabel:"Completed", amount:650, breed:"Persian",          phone:"083-456-7890" },
  { id:"e6",  ref:"BK-202604-2340", pet:"Luna",   owner:"Suda Chomchan",    service:"Cat Grooming",           dayIdx:1, startHour:14, startMin:0,  durationMin:90,  color:"#0B93E8", statusColor:"#22c55e", statusLabel:"Completed", amount:650, breed:"Ragdoll",          phone:"086-789-0123" },
  // Wednesday Apr 15 (TODAY)
  { id:"e7",  ref:"BK-202604-2341", pet:"Butter", owner:"Mintra Saelim",    service:"Full Grooming Package",  dayIdx:2, startHour:9,  startMin:0,  durationMin:120, color:"#17A8FF", statusColor:"#22c55e", statusLabel:"Completed", amount:900, breed:"Poodle",           phone:"081-234-5678" },
  { id:"e8",  ref:"BK-202604-2342", pet:"Mochi",  owner:"Warat Chaiwong",   service:"Bath & Brush",           dayIdx:2, startHour:10, startMin:30, durationMin:60,  color:"#22c55e", statusColor:"#0B7AC8", statusLabel:"In Progress",amount:450, breed:"Shih Tzu",         phone:"082-345-6789" },
  { id:"e9",  ref:"BK-202604-2343", pet:"Nala",   owner:"Anchana Pimjai",   service:"Cat Grooming",           dayIdx:2, startHour:13, startMin:0,  durationMin:90,  color:"#F5A623", statusColor:"#5a8fa8", statusLabel:"Confirmed",  amount:650, breed:"Persian",          phone:"083-456-7890" },
  { id:"e10", ref:"BK-202604-2344", pet:"Max",    owner:"Prapai Thaweesap", service:"Full Grooming Package",  dayIdx:2, startHour:14, startMin:30, durationMin:120, color:"#8b5cf6", statusColor:"#5a8fa8", statusLabel:"Confirmed",  amount:900, breed:"Golden Retriever", phone:"084-567-8901" },
  { id:"e11", ref:"BK-202604-2345", pet:"Coco",   owner:"Natthida Phongsri",service:"Nail Trim & Ear Clean",  dayIdx:2, startHour:16, startMin:0,  durationMin:30,  color:"#f43f5e", statusColor:"#5a8fa8", statusLabel:"Confirmed",  amount:250, breed:"French Bulldog",  phone:"085-678-9012" },
  // Thursday Apr 16
  { id:"e12", ref:"BK-202604-2346", pet:"Butter", owner:"Mintra Saelim",    service:"Bath & Brush",           dayIdx:3, startHour:11, startMin:0,  durationMin:60,  color:"#17A8FF", statusColor:"#5a8fa8", statusLabel:"Confirmed",  amount:450, breed:"Poodle",           phone:"081-234-5678" },
  { id:"e13", ref:"BK-202604-2347", pet:"Nala",   owner:"Anchana Pimjai",   service:"Nail Trim & Ear Clean",  dayIdx:3, startHour:16, startMin:30, durationMin:30,  color:"#F5A623", statusColor:"#5a8fa8", statusLabel:"Confirmed",  amount:250, breed:"Persian",          phone:"083-456-7890" },
  // Friday Apr 17
  { id:"e14", ref:"BK-202604-2348", pet:"Mochi",  owner:"Warat Chaiwong",   service:"Full Grooming Package",  dayIdx:4, startHour:9,  startMin:0,  durationMin:120, color:"#22c55e", statusColor:"#5a8fa8", statusLabel:"Confirmed",  amount:900, breed:"Shih Tzu",         phone:"082-345-6789" },
  { id:"e15", ref:"BK-202604-2352", pet:"Coco",   owner:"Natthida Phongsri",service:"Bath & Brush",           dayIdx:4, startHour:14, startMin:0,  durationMin:60,  color:"#f43f5e", statusColor:"#5a8fa8", statusLabel:"Confirmed",  amount:450, breed:"French Bulldog",  phone:"085-678-9012" },
  // Saturday Apr 18
  { id:"e16", ref:"BK-202604-2349", pet:"Max",    owner:"Prapai Thaweesap", service:"Full Day Care",          dayIdx:5, startHour:9,  startMin:0,  durationMin:480, color:"#8b5cf6", statusColor:"#5a8fa8", statusLabel:"Confirmed",  amount:350, breed:"Golden Retriever", phone:"084-567-8901" },
  { id:"e17", ref:"BK-202604-2351", pet:"Butter", owner:"Mintra Saelim",    service:"Full Grooming Package",  dayIdx:5, startHour:9,  startMin:0,  durationMin:120, color:"#17A8FF", statusColor:"#5a8fa8", statusLabel:"Confirmed",  amount:900, breed:"Poodle",           phone:"081-234-5678" },
  { id:"e18", ref:"BK-202604-2350", pet:"Nala",   owner:"Anchana Pimjai",   service:"Cat Grooming",           dayIdx:5, startHour:11, startMin:30, durationMin:90,  color:"#F5A623", statusColor:"#5a8fa8", statusLabel:"Confirmed",  amount:650, breed:"Persian",          phone:"083-456-7890" },
  { id:"e19", ref:"BK-202604-2353", pet:"Luna",   owner:"Suda Chomchan",    service:"Bath & Brush",           dayIdx:5, startHour:14, startMin:0,  durationMin:60,  color:"#0B93E8", statusColor:"#5a8fa8", statusLabel:"Confirmed",  amount:450, breed:"Ragdoll",          phone:"086-789-0123" },
  { id:"e20", ref:"BK-202604-2354", pet:"Mochi",  owner:"Warat Chaiwong",   service:"Bath & Brush",           dayIdx:5, startHour:15, startMin:30, durationMin:60,  color:"#22c55e", statusColor:"#5a8fa8", statusLabel:"Confirmed",  amount:450, breed:"Shih Tzu",         phone:"082-345-6789" },
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_DATES  = ["13", "14", "15", "16", "17", "18", "19"];
const TODAY_IDX  = 2; // Wednesday Apr 15

const HOUR_HEIGHT = 68; // px per hour
const GRID_START  = 8;  // 8am
const HOURS       = Array.from({ length: 11 }, (_, i) => GRID_START + i); // 8–18

function fmtHour(h: number) {
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

export default function DemoCalendar() {
  const [selected, setSelected] = useState<CalEvent | null>(null);

  const gridH = HOURS.length * HOUR_HEIGHT;

  const eventTop    = (e: CalEvent) => (e.startHour + e.startMin / 60 - GRID_START) * HOUR_HEIGHT;
  const eventHeight = (e: CalEvent) => Math.max((e.durationMin / 60) * HOUR_HEIGHT - 4, 24);

  return (
    <main className="vd-main" style={{ overflow:"hidden" }}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", gap:0 }}>

        {/* ── Header row ── */}
        <div style={{
          display:"grid", gridTemplateColumns:`56px repeat(7, 1fr)`,
          borderBottom:"1.5px solid #e8f2f8", flexShrink:0,
          background:"#fff",
        }}>
          <div />
          {DAY_LABELS.map((d, i) => (
            <div key={d} style={{
              padding:"12px 4px", textAlign:"center",
              borderLeft:"1px solid #f0f7ff",
            }}>
              <div style={{ fontSize:11, color:"#9ec9e0", fontWeight:500, textTransform:"uppercase", letterSpacing:0.5 }}>{d}</div>
              <div style={{
                fontSize:16, fontWeight:700, marginTop:2,
                width:28, height:28, borderRadius:"50%", display:"inline-flex",
                alignItems:"center", justifyContent:"center",
                background: i === TODAY_IDX ? "#17A8FF" : "transparent",
                color: i === TODAY_IDX ? "#fff" : "#00171F",
              }}>{DAY_DATES[i]}</div>
            </div>
          ))}
        </div>

        {/* ── Scrollable grid ── */}
        <div style={{ flex:1, overflow:"auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:`56px repeat(7, 1fr)`, minWidth:700 }}>

            {/* Time column */}
            <div style={{ position:"relative", height:gridH }}>
              {HOURS.map(h => (
                <div key={h} style={{
                  position:"absolute", top: (h - GRID_START) * HOUR_HEIGHT - 8,
                  right:8, fontSize:10, color:"#b8d4e0", fontWeight:500, textAlign:"right",
                }}>{fmtHour(h)}</div>
              ))}
            </div>

            {/* Day columns */}
            {DAY_LABELS.map((_, di) => (
              <div key={di} style={{
                position:"relative", height:gridH,
                borderLeft:"1px solid #f0f7ff",
                background: di === TODAY_IDX ? "rgba(23,168,255,0.02)" : "transparent",
              }}>
                {/* Hour grid lines */}
                {HOURS.map(h => (
                  <div key={h} style={{
                    position:"absolute", top:(h - GRID_START) * HOUR_HEIGHT,
                    left:0, right:0, borderTop:"1px solid #f4f8fc",
                  }} />
                ))}

                {/* Events */}
                {WEEK_EVENTS.filter(e => e.dayIdx === di).map(e => (
                  <div key={e.id}
                    onClick={() => setSelected(e === selected ? null : e)}
                    style={{
                      position:"absolute",
                      top: eventTop(e) + 2,
                      left:4, right:4,
                      height: eventHeight(e),
                      borderRadius:6,
                      background:`${e.color}18`,
                      borderLeft:`3px solid ${e.color}`,
                      padding:"4px 6px",
                      cursor:"pointer",
                      overflow:"hidden",
                      transition:"all 0.12s",
                      outline: selected?.id === e.id ? `2px solid ${e.color}` : "none",
                      outlineOffset:1,
                      zIndex:1,
                    }}>
                    <div style={{ fontSize:11, fontWeight:700, color:e.color, lineHeight:1.2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                      {e.pet}
                    </div>
                    {eventHeight(e) > 36 && (
                      <div style={{ fontSize:10, color:"#5a8fa8", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", marginTop:1 }}>
                        {e.service}
                      </div>
                    )}
                    {eventHeight(e) > 52 && (
                      <div style={{ fontSize:9, color:"#9ec9e0", marginTop:2 }}>
                        {e.startHour}:{String(e.startMin).padStart(2,"0")} · {e.durationMin}min
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Event detail panel ── */}
      {selected && (
        <div style={{
          position:"fixed", right:24, top:"50%", transform:"translateY(-50%)",
          width:280, background:"#fff", borderRadius:16,
          boxShadow:"0 8px 40px rgba(0,23,31,0.14)",
          border:"1px solid #e8f2f8", zIndex:100,
          overflow:"hidden",
        }}>
          <div style={{
            background:`${selected.color}12`,
            borderBottom:`2px solid ${selected.color}30`,
            padding:"16px 20px",
            display:"flex", alignItems:"flex-start", justifyContent:"space-between",
          }}>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:"#00171F" }}>{selected.pet}</div>
              <div style={{ fontSize:12, color:"#5a8fa8", marginTop:2 }}>{selected.owner}</div>
              <span style={{
                display:"inline-block", marginTop:8, padding:"2px 10px", borderRadius:100,
                fontSize:10, fontWeight:600,
                background:`${selected.statusColor}18`, color:selected.statusColor,
              }}>{selected.statusLabel}</span>
            </div>
            <button onClick={() => setSelected(null)} style={{
              background:`${selected.color}18`, border:"none", borderRadius:"50%",
              width:28, height:28, cursor:"pointer", fontSize:14, color:"#5a8fa8",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>×</button>
          </div>
          <div style={{ padding:"16px 20px", fontSize:12 }}>
            {[
              ["Reference",  selected.ref],
              ["Breed",      selected.breed],
              ["Service",    selected.service],
              ["Duration",   `${selected.durationMin} minutes`],
              ["Start time", `${selected.startHour}:${String(selected.startMin).padStart(2,"0")} ${selected.startHour < 12 ? "am" : "pm"}`],
              ["Amount",     `฿${selected.amount.toLocaleString()}`],
              ["Phone",      selected.phone],
            ].map(([l, v]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #f4f8fc" }}>
                <span style={{ color:"#9ec9e0" }}>{l}</span>
                <span style={{ fontWeight:500, color:"#00171F" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
