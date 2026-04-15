"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
type DbReview = {
  id: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  replied_at: string | null;
  is_read: boolean;
  created_at: string;
  customers: { first_name: string; last_name: string } | null;
  bookings: {
    booking_reference: string;
    services: { name: string; category: string } | null;
  } | null;
};

const CAT_COLORS: Record<string, string> = {
  Grooming: "#17A8FF", "Day Care": "#22c55e", Training: "#F5A623", Boarding: "#8b5cf6",
};

const AVATAR_COLORS = ["#17A8FF","#22c55e","#F5A623","#8b5cf6","#f43f5e","#0B93E8"];
const colorFor = (i: number) => AVATAR_COLORS[i % AVATAR_COLORS.length];

function relDate(iso: string): string {
  const d = new Date(iso);
  const n = new Date();
  const diff = n.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days} days ago`;
  return d.toLocaleDateString("en-GB", { day:"numeric", month:"short" });
}

// ── Demo mode ─────────────────────────────────────────────────────────────────
const DEMO_MODE = true;

const MOCK_REVIEWS: DbReview[] = [
  {
    id:"rv01", rating:5, created_at:"2026-04-15T05:00:00Z", is_read:true,
    comment:"Butter always looks absolutely stunning after every visit! The team is so gentle and patient — she used to be nervous about grooming but now she walks in happily. Highly recommend to any dog parent in the area.",
    reply:"Thank you so much Khun Mintra! We love having Butter here — she's such a sweetheart 🐾 See you next time!", replied_at:"2026-04-15T06:00:00Z",
    customers:{first_name:"Mintra", last_name:"Saelim"},
    bookings:{booking_reference:"BK-202604-2341", services:{name:"Full Grooming Package", category:"Grooming"}},
  },
  {
    id:"rv02", rating:5, created_at:"2026-04-14T08:00:00Z", is_read:false,
    comment:"Mochi came back smelling amazing and looking fluffy as a cloud. The team takes great care and the shop is very clean. Will keep coming back every month!",
    reply:null, replied_at:null,
    customers:{first_name:"Warat", last_name:"Chaiwong"},
    bookings:{booking_reference:"BK-202604-2338", services:{name:"Bath & Brush", category:"Grooming"}},
  },
  {
    id:"rv03", rating:5, created_at:"2026-04-13T09:00:00Z", is_read:true,
    comment:"As a cat owner I was worried Nala would be stressed, but the staff really know how to handle cats. She was calm the whole time and came home looking beautiful. Thank you!",
    reply:"We love our feline clients! Nala is a gem — calm and gorgeous as always. Thank you for trusting us with her 🐱", replied_at:"2026-04-13T10:00:00Z",
    customers:{first_name:"Anchana", last_name:"Pimjai"},
    bookings:{booking_reference:"BK-202604-2339", services:{name:"Cat Grooming", category:"Grooming"}},
  },
  {
    id:"rv04", rating:4, created_at:"2026-04-10T08:00:00Z", is_read:false,
    comment:"Max (my Golden) had a great grooming session. He's a big boy and they handled him perfectly. The only thing is the waiting area was a bit busy but the service itself was top notch.",
    reply:null, replied_at:null,
    customers:{first_name:"Prapai", last_name:"Thaweesap"},
    bookings:{booking_reference:"BK-202604-2336", services:{name:"Full Grooming Package", category:"Grooming"}},
  },
  {
    id:"rv05", rating:5, created_at:"2026-04-08T07:00:00Z", is_read:true,
    comment:"Luna's first time here and it could not have gone better. She can be very picky but she let them groom her without any fuss! The coat looks incredible. Booking again next week.",
    reply:"Luna is such a beautiful Ragdoll! We're so glad her first visit went smoothly. Looking forward to seeing her again soon 💙", replied_at:"2026-04-08T08:00:00Z",
    customers:{first_name:"Suda", last_name:"Chomchan"},
    bookings:{booking_reference:"BK-202604-2340", services:{name:"Cat Grooming", category:"Grooming"}},
  },
  {
    id:"rv06", rating:5, created_at:"2026-04-03T06:00:00Z", is_read:true,
    comment:"Quick and efficient bath & brush session for Butter. Always consistent high quality. I've been coming here for over a year and never disappointed.",
    reply:"A whole year — thank you for your loyalty Khun Mintra! Butter is one of our favourite regulars 🐩", replied_at:"2026-04-03T07:00:00Z",
    customers:{first_name:"Mintra", last_name:"Saelim"},
    bookings:{booking_reference:"BK-202603-2301", services:{name:"Bath & Brush", category:"Grooming"}},
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const [loading,  setLoading]  = useState(true);
  const [reviews,  setReviews]  = useState<DbReview[]>([]);
  const [ratingAvg, setRatingAvg] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [replies,  setReplies]  = useState<Record<string, string>>({});   // reviewId → saved reply text
  const [drafts,   setDrafts]   = useState<Record<string, string>>({});   // reviewId → draft
  const [saving,   setSaving]   = useState<Record<string, boolean>>({});
  const [toast,    setToast]    = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (DEMO_MODE) {
        setRatingAvg(4.9); setReviewCount(47);
        setReviews(MOCK_REVIEWS);
        const existing: Record<string, string> = {};
        MOCK_REVIEWS.forEach(r => { if (r.reply) existing[r.id] = r.reply; });
        setReplies(existing);
        setLoading(false); return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: prov } = await supabase
        .from("providers")
        .select("id, rating, review_count")
        .eq("user_id", user.id)
        .single();
      if (!prov) { setLoading(false); return; }

      setRatingAvg(prov.rating ?? 0);
      setReviewCount(prov.review_count ?? 0);

      const { data: rvs } = await supabase
        .from("reviews")
        .select(`
          id, rating, comment, reply, replied_at, is_read, created_at,
          customers(first_name, last_name),
          bookings(booking_reference, services(name, category))
        `)
        .eq("provider_id", prov.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (rvs) {
        const typedRvs = rvs as unknown as DbReview[];
        setReviews(typedRvs);
        // Seed existing replies into state
        const existing: Record<string, string> = {};
        typedRvs.forEach((r) => { if (r.reply) existing[r.id] = r.reply; });
        setReplies(existing);
        // Mark unread reviews as read
        const unreadIds = typedRvs.filter((r) => !r.is_read).map((r) => r.id);
        if (unreadIds.length > 0) {
          await supabase.from("reviews").update({ is_read: true }).in("id", unreadIds);
        }
      }
      setLoading(false);
    })();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const submitReply = async (reviewId: string, firstName: string) => {
    const text = (drafts[reviewId] ?? "").trim();
    if (!text) return;

    setSaving(prev => ({ ...prev, [reviewId]: true }));
    const { error } = await supabase
      .from("reviews")
      .update({ reply: text, replied_at: new Date().toISOString() })
      .eq("id", reviewId);

    setSaving(prev => ({ ...prev, [reviewId]: false }));
    if (!error) {
      setReplies(prev => ({ ...prev, [reviewId]: text }));
      setDrafts(prev => ({ ...prev, [reviewId]: "" }));
      showToast(`Reply sent to ${firstName}!`);
    }
  };

  const stars = (n: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < n ? "#F5A623" : "#e2e8f0" }}>★</span>
    ));

  // ── Rating summary ─────────────────────────────────────────────────────────
  const ratingDist = useMemo(() => {
    const dist = [0, 0, 0, 0, 0]; // index 0 = 5★, index 4 = 1★
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[5 - r.rating]++; });
    return dist;
  }, [reviews]);

  const totalReviews = reviews.length;
  const displayAvg   = ratingAvg > 0
    ? ratingAvg.toFixed(1)
    : totalReviews > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
      : "—";

  // ── By service ─────────────────────────────────────────────────────────────
  const byService = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    reviews.forEach(r => {
      const cat = r.bookings?.services?.category ?? "Other";
      if (!map[cat]) map[cat] = { total: 0, count: 0 };
      map[cat].total += r.rating;
      map[cat].count++;
    });
    return Object.entries(map).map(([name, { total, count }]) => ({
      name,
      color: CAT_COLORS[name] ?? "#9ec9e0",
      rating: count > 0 ? (total / count).toFixed(1) : "—",
    }));
  }, [reviews]);

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
              {loading ? (
                <div style={{ padding:"24px 0", textAlign:"center", fontSize:13, color:"#9ec9e0" }}>Loading reviews…</div>
              ) : reviews.length === 0 ? (
                <div style={{ padding:"24px 0", textAlign:"center", fontSize:13, color:"#9ec9e0" }}>No reviews yet.</div>
              ) : reviews.map((r, i) => {
                const firstName = r.customers?.first_name ?? "Customer";
                const fullName  = r.customers ? `${r.customers.first_name} ${r.customers.last_name}` : "Customer";
                const svcName   = r.bookings?.services?.name ?? "";
                const svcCat    = r.bookings?.services?.category ?? "";
                const svcColor  = CAT_COLORS[svcCat] ?? "#9ec9e0";
                const isNew     = !r.is_read;
                const savedReply = replies[r.id];

                return (
                  <div key={r.id} className="review-item">
                    <div className="review-top">
                      <div className="review-av" style={{ background: colorFor(i) }}>{fullName[0]}</div>
                      <div className="review-meta">
                        <div className="review-name-row">
                          <span className="review-name">{fullName}</span>
                          {svcName && (
                            <span className="review-svc-tag" style={{ background:`${svcColor}18`, color:svcColor }}>
                              {svcName}
                            </span>
                          )}
                          {isNew && <span className="review-new-badge">New review</span>}
                        </div>
                        <div className="review-stars-row">
                          <span className="review-stars">{stars(r.rating)}</span>
                          <span className="review-date">{relDate(r.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {r.comment && <p className="review-text">&ldquo;{r.comment}&rdquo;</p>}

                    <div className="review-reply-thread">
                      {savedReply ? (
                        <div className="review-reply-existing">
                          <div className="review-reply-existing-label">Your reply</div>
                          <div className="review-reply-existing-text">{savedReply}</div>
                        </div>
                      ) : (
                        <div className="review-reply-input-wrap">
                          <textarea
                            className="review-reply-input"
                            rows={1}
                            placeholder={`Reply to ${firstName}…`}
                            value={drafts[r.id] ?? ""}
                            onChange={e => setDrafts(prev => ({ ...prev, [r.id]: e.target.value }))}
                            onInput={e => {
                              const el = e.currentTarget;
                              el.style.height = "auto";
                              el.style.height = el.scrollHeight + "px";
                            }}
                          />
                          <button
                            className="review-reply-btn"
                            disabled={saving[r.id]}
                            onClick={() => submitReply(r.id, firstName)}>
                            {saving[r.id] ? "…" : "Send"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: summary + by service ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Rating summary */}
            <div className="panel">
              <div className="panel-header"><div className="panel-title">Rating summary</div></div>
              <div className="panel-body" style={{ textAlign:"center" }}>
                <div className="rating-big">{displayAvg}</div>
                <div className="rating-stars-big">★★★★★</div>
                <div className="rating-count">Based on {reviewCount || totalReviews} review{(reviewCount || totalReviews) !== 1 ? "s" : ""}</div>
                <div className="rating-bars">
                  {[5, 4, 3, 2, 1].map(s => (
                    <div key={s} className="rating-bar-row">
                      <span className="rating-bar-label">{s}</span>
                      <div className="rating-bar-track">
                        <div className="rating-bar-fill"
                          style={{ width: totalReviews > 0 ? `${Math.round((ratingDist[5 - s] / totalReviews) * 100)}%` : "0%" }} />
                      </div>
                      <span className="rating-bar-count">{ratingDist[5 - s]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* By service */}
            <div className="panel">
              <div className="panel-header"><div className="panel-title">By service</div></div>
              <div className="panel-body">
                {byService.length === 0 ? (
                  <div style={{ fontSize:12, color:"#9ec9e0", padding:"8px 0" }}>No data yet.</div>
                ) : byService.map(s => (
                  <div key={s.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #f4f8fc" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:s.color, display:"inline-block", flexShrink:0 }} />
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

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)",
          background:"#16a34a", color:"#fff", fontSize:13, fontWeight:500,
          padding:"12px 24px", borderRadius:100, zIndex:999,
          display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap",
        }}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <circle cx="8" cy="8" r="7" stroke="#fff" strokeWidth="1.5"/>
            <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {toast}
        </div>
      )}
    </main>
  );
}
