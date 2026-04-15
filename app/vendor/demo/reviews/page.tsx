"use client";

import { useState } from "react";

const REVIEWS = [
  {
    id:"r1", customer:"Mintra Saelim",  rating:5, date:"Today",
    service:"Full Grooming Package", category:"Grooming",
    comment:"Butter always looks absolutely stunning after every visit! The team is so gentle and patient — she used to be nervous about grooming but now she walks in happily. Highly recommend to any dog parent in the area.",
    reply:"Thank you so much Khun Mintra! We love having Butter here — she's such a sweetheart 🐾 See you next time!", replied:true,
    isNew: false, color:"#17A8FF",
  },
  {
    id:"r2", customer:"Warat Chaiwong", rating:5, date:"Yesterday",
    service:"Bath & Brush", category:"Grooming",
    comment:"Mochi came back smelling amazing and looking fluffy as a cloud. The team takes great care and the shop is very clean. Will keep coming back every month!",
    reply: null, replied: false, isNew: true, color:"#22c55e",
  },
  {
    id:"r3", customer:"Anchana Pimjai", rating:5, date:"2 days ago",
    service:"Cat Grooming", category:"Grooming",
    comment:"As a cat owner I was worried Nala would be stressed, but the staff really know how to handle cats. She was calm the whole time and came home looking beautiful. Thank you!",
    reply:"We love our feline clients! Nala is a gem — calm and gorgeous as always. Thank you for trusting us with her 🐱", replied:true,
    isNew: false, color:"#F5A623",
  },
  {
    id:"r4", customer:"Prapai Thaweesap", rating:4, date:"5 days ago",
    service:"Full Grooming Package", category:"Grooming",
    comment:"Max (my Golden) had a great grooming session. He's a big boy and they handled him perfectly. The only thing is the waiting area was a bit busy but the service itself was top notch.",
    reply: null, replied: false, isNew: true, color:"#8b5cf6",
  },
  {
    id:"r5", customer:"Suda Chomchan",   rating:5, date:"7 days ago",
    service:"Cat Grooming", category:"Grooming",
    comment:"Luna's first time here and it could not have gone better. She can be very picky but she let them groom her without any fuss! The coat looks incredible. Booking again next week.",
    reply:"Luna is such a beautiful Ragdoll! We're so glad her first visit went smoothly. Looking forward to seeing her again soon 💙", replied:true,
    isNew: false, color:"#0B93E8",
  },
  {
    id:"r6", customer:"Mintra Saelim",  rating:5, date:"12 days ago",
    service:"Bath & Brush", category:"Grooming",
    comment:"Quick and efficient bath & brush session for Butter. Always consistent high quality. I've been coming here for over a year and never disappointed.",
    reply:"A whole year — thank you for your loyalty Khun Mintra! Butter is one of our favourite regulars 🐩", replied:true,
    isNew: false, color:"#17A8FF",
  },
];

const CAT_COLORS: Record<string,string> = {
  Grooming:"#17A8FF", "Day Care":"#22c55e", Training:"#F5A623", Boarding:"#8b5cf6",
};
const AVATAR_COLORS = ["#17A8FF","#22c55e","#F5A623","#8b5cf6","#f43f5e","#0B93E8"];
const colorFor = (i: number) => AVATAR_COLORS[i % AVATAR_COLORS.length];

const RATING_DIST = [5, 1, 0, 0, 0]; // 5★:5, 4★:1, 3★:0...
const TOTAL = REVIEWS.length;
const AVG = (REVIEWS.reduce((s,r) => s + r.rating, 0) / TOTAL).toFixed(1);

const BY_SERVICE = [
  { name:"Grooming", color:"#17A8FF", rating:"4.9" },
];

function stars(n: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < n ? "#F5A623" : "#e2e8f0" }}>★</span>
  ));
}

export default function DemoReviews() {
  const [drafts, setDrafts]   = useState<Record<string,string>>({});
  const [replies, setReplies] = useState<Record<string,string>>(
    Object.fromEntries(REVIEWS.filter(r => r.reply).map(r => [r.id, r.reply as string]))
  );
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const submitReply = (id: string, firstName: string) => {
    const text = (drafts[id] ?? "").trim();
    if (!text) return;
    setReplies(prev => ({ ...prev, [id]: text }));
    setDrafts(prev => ({ ...prev, [id]: "" }));
    showToast(`Reply sent to ${firstName}!`);
  };

  return (
    <main className="ovw-main">
      <div className="ovw-content">
        <div className="grid-3-1" style={{ marginBottom:0 }}>

          {/* ── Left: review list ── */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Customer reviews</div>
            </div>
            <div className="panel-body" style={{ padding:"0 22px" }}>
              {REVIEWS.map((r, i) => {
                const firstName = r.customer.split(" ")[0];
                const svcColor  = CAT_COLORS[r.category] ?? "#9ec9e0";
                const savedReply = replies[r.id];
                return (
                  <div key={r.id} className="review-item">
                    <div className="review-top">
                      <div className="review-av" style={{ background: colorFor(i) }}>{r.customer[0]}</div>
                      <div className="review-meta">
                        <div className="review-name-row">
                          <span className="review-name">{r.customer}</span>
                          <span className="review-svc-tag" style={{ background:`${svcColor}18`, color:svcColor }}>
                            {r.service}
                          </span>
                          {r.isNew && <span className="review-new-badge">New review</span>}
                        </div>
                        <div className="review-stars-row">
                          <span className="review-stars">{stars(r.rating)}</span>
                          <span className="review-date">{r.date}</span>
                        </div>
                      </div>
                    </div>

                    <p className="review-text">&ldquo;{r.comment}&rdquo;</p>

                    <div className="review-reply-thread">
                      {savedReply ? (
                        <div className="review-reply-existing">
                          <div className="review-reply-existing-label">Your reply</div>
                          <div className="review-reply-existing-text">{savedReply}</div>
                        </div>
                      ) : (
                        <div className="review-reply-input-wrap">
                          <textarea
                            className="review-reply-input" rows={1}
                            placeholder={`Reply to ${firstName}…`}
                            value={drafts[r.id] ?? ""}
                            onChange={e => setDrafts(prev => ({ ...prev, [r.id]: e.target.value }))}
                            onInput={e => {
                              const el = e.currentTarget;
                              el.style.height = "auto";
                              el.style.height = el.scrollHeight + "px";
                            }}
                          />
                          <button className="review-reply-btn" onClick={() => submitReply(r.id, firstName)}>
                            Send
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: summary ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div className="panel">
              <div className="panel-header"><div className="panel-title">Rating summary</div></div>
              <div className="panel-body" style={{ textAlign:"center" }}>
                <div className="rating-big">{AVG}</div>
                <div className="rating-stars-big">★★★★★</div>
                <div className="rating-count">Based on 47 reviews</div>
                <div className="rating-bars">
                  {[5,4,3,2,1].map((s,idx) => (
                    <div key={s} className="rating-bar-row">
                      <span className="rating-bar-label">{s}</span>
                      <div className="rating-bar-track">
                        <div className="rating-bar-fill" style={{
                          width: s === 5 ? "88%" : s === 4 ? "10%" : "2%",
                        }} />
                      </div>
                      <span className="rating-bar-count">
                        {s === 5 ? 41 : s === 4 ? 5 : s === 3 ? 1 : 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header"><div className="panel-title">By service</div></div>
              <div className="panel-body">
                {BY_SERVICE.map(s => (
                  <div key={s.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #f4f8fc" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:s.color, display:"inline-block" }} />
                      <span style={{ fontSize:13, color:"#00171F", fontWeight:500 }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize:13, fontWeight:600, color:"#F5A623" }}>★ {s.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {toast && (
        <div style={{
          position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)",
          background:"#16a34a", color:"#fff", fontSize:13, fontWeight:500,
          padding:"12px 24px", borderRadius:100, zIndex:999,
          display:"flex", alignItems:"center", gap:8,
        }}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <circle cx="8" cy="8" r="7" stroke="#fff" strokeWidth="1.5"/>
            <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {toast}
        </div>
      )}
    </main>
  );
}
