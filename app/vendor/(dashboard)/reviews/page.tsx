"use client";

import { useState } from "react";

// ── Mock data ─────────────────────────────────────────────────────────────────
const reviews = [
  {
    name: "Natthida P.", service: "Full Grooming", svcColor: "#17A8FF", stars: 5,
    text: "\"Mochi came back looking absolutely beautiful. The team is so gentle and professional — she wasn't stressed at all. Best grooming place in Sukhumvit!\"",
    date: "Today", color: "#17A8FF", isNew: true, existingReply: null,
  },
  {
    name: "Tong V.", service: "Full Grooming", svcColor: "#17A8FF", stars: 5,
    text: "\"Max has been coming here for over a year. Consistent quality every single time. The pre-booking questionnaire is a great touch — shows they really care.\"",
    date: "Yesterday", color: "#8b5cf6", isNew: true, existingReply: null,
  },
  {
    name: "Suda C.", service: "Cat Grooming", svcColor: "#22c55e", stars: 5,
    text: "\"Nala hates being groomed anywhere else but she is always calm here. The team clearly knows how to handle cats. Highly recommend.\"",
    date: "Dec 18", color: "#22c55e", isNew: false, existingReply: null,
  },
  {
    name: "Pim R.", service: "Training", svcColor: "#F5A623", stars: 4,
    text: "\"Good training session. Buddy responded well. Would love slightly longer sessions — the 60 min felt a bit short for the warm-up. Will definitely come back.\"",
    date: "Dec 15", color: "#0B93E8", isNew: false,
    existingReply: "Thank you so much Pim! We're glad Buddy enjoyed the session. We'll look into extending our training slots — see you next time!",
  },
  {
    name: "Krit W.", service: "Day Care", svcColor: "#003459", stars: 5,
    text: "\"Luna always comes home happy and tired. The photo updates during the day are a brilliant idea — gives me so much peace of mind while I'm at work.\"",
    date: "Dec 12", color: "#003459", isNew: false, existingReply: null,
  },
];

const RATING_DIST = [15, 8, 4, 1, 0]; // 5★ → 1★
const TOTAL_REVIEWS = RATING_DIST.reduce((a, b) => a + b, 0);

const SVC_RATINGS = [
  { name: "Grooming",  color: "#17A8FF", rating: "4.9" },
  { name: "Day Care",  color: "#22c55e", rating: "5.0" },
  { name: "Training",  color: "#F5A623", rating: "4.7" },
  { name: "Boarding",  color: "#8b5cf6", rating: "5.0" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [drafts, setDrafts]   = useState<Record<number, string>>({});
  const [toast, setToast]     = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const submitReply = (idx: number, firstName: string) => {
    const text = (drafts[idx] ?? "").trim();
    if (!text) return;
    setReplies(prev => ({ ...prev, [idx]: text }));
    setDrafts(prev => ({ ...prev, [idx]: "" }));
    showToast(`Reply sent to ${firstName}!`);
  };

  const stars = (n: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < n ? "#F5A623" : "#e2e8f0" }}>★</span>
    ));

  return (
    <main className="ovw-main">
      <div className="ovw-content">
        <div className="grid-3-1" style={{ marginBottom: 0 }}>

          {/* ── Left: review list ── */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Customer reviews</div>
            </div>
            <div className="panel-body" style={{ padding: "0 22px" }}>
              {reviews.map((r, i) => (
                <div key={i} className="review-item">
                  <div className="review-top">
                    <div className="review-av" style={{ background: r.color }}>{r.name[0]}</div>
                    <div className="review-meta">
                      <div className="review-name-row">
                        <span className="review-name">{r.name}</span>
                        <span className="review-svc-tag" style={{ background: `${r.svcColor}18`, color: r.svcColor }}>
                          {r.service}
                        </span>
                        {r.isNew && <span className="review-new-badge">New review</span>}
                      </div>
                      <div className="review-stars-row">
                        <span className="review-stars">{stars(r.stars)}</span>
                        <span className="review-date">{r.date}</span>
                      </div>
                    </div>
                  </div>

                  <p className="review-text">{r.text}</p>

                  <div className="review-reply-thread">
                    {replies[i] ? (
                      <div className="review-reply-existing">
                        <div className="review-reply-existing-label">Your reply</div>
                        <div className="review-reply-existing-text">{replies[i]}</div>
                      </div>
                    ) : r.existingReply ? (
                      <div className="review-reply-existing">
                        <div className="review-reply-existing-label">Your reply</div>
                        <div className="review-reply-existing-text">{r.existingReply}</div>
                      </div>
                    ) : (
                      <div className="review-reply-input-wrap">
                        <textarea
                          className="review-reply-input"
                          rows={1}
                          placeholder={`Reply to ${r.name.split(" ")[0]}…`}
                          value={drafts[i] ?? ""}
                          onChange={e => setDrafts(prev => ({ ...prev, [i]: e.target.value }))}
                          onInput={e => {
                            const el = e.currentTarget;
                            el.style.height = "auto";
                            el.style.height = el.scrollHeight + "px";
                          }}
                        />
                        <button
                          className="review-reply-btn"
                          onClick={() => submitReply(i, r.name.split(" ")[0])}>
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: summary + by service ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Rating summary */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Rating summary</div>
              </div>
              <div className="panel-body" style={{ textAlign: "center" }}>
                <div className="rating-big">4.9</div>
                <div className="rating-stars-big">★★★★★</div>
                <div className="rating-count">Based on {TOTAL_REVIEWS} reviews</div>
                <div className="rating-bars">
                  {[5, 4, 3, 2, 1].map(s => (
                    <div key={s} className="rating-bar-row">
                      <span className="rating-bar-label">{s}</span>
                      <div className="rating-bar-track">
                        <div
                          className="rating-bar-fill"
                          style={{ width: `${Math.round((RATING_DIST[5 - s] / TOTAL_REVIEWS) * 100)}%` }}
                        />
                      </div>
                      <span className="rating-bar-count">{RATING_DIST[5 - s]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* By service */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">By service</div>
              </div>
              <div className="panel-body">
                {SVC_RATINGS.map(s => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f4f8fc" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "#00171F", fontWeight: 500 }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#F5A623" }}>★ {s.rating}</span>
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
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: "#16a34a", color: "#fff", fontSize: 13, fontWeight: 500,
          padding: "12px 24px", borderRadius: 100, zIndex: 999,
          display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
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
