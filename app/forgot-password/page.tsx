"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LanguageContext";

const PREVIEW_DEALS = [
  { name: "Happy Paws Grooming", meta: "Bath & Full Groom · Sukhumvit 39", old: "฿650", price: "฿390", discount: "-40%", svg: `<svg viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="10" fill="#d7f0e4"/><circle cx="22" cy="22" r="14" fill="#b2e8cd"/><path d="M16 26c0-3 1.5-4.5 4-6s3.5-2 3.5-3.5c0-1.5-1-3-2.5-3s-1.5 1-1.5 3" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/><circle cx="30" cy="17" r="3" fill="#1a7a4a"/><path d="M18 26c.5-1.5 2-3 3-3s2.5 1.5 3 3" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/></svg>` },
  { name: "Paw & Relax Spa", meta: "Aromatherapy Bath · Thonglor", old: "฿800", price: "฿560", discount: "-30%", svg: `<svg viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="10" fill="#f0e8ff"/><circle cx="22" cy="22" r="14" fill="#ddd0ff"/><ellipse cx="22" cy="24" rx="7" ry="6" fill="#6a3fbf"/><ellipse cx="16" cy="17" rx="3" ry="4" fill="#6a3fbf"/><ellipse cx="28" cy="17" rx="3" ry="4" fill="#6a3fbf"/><circle cx="19" cy="23" r="1.5" fill="#fff"/><circle cx="25" cy="23" r="1.5" fill="#fff"/><path d="M19 27 Q22 29 25 27" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>` },
  { name: "Furever Friends", meta: "Day Boarding · Phrom Phong", old: "฿500", price: "฿350", discount: "-30%", svg: `<svg viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="10" fill="#fff3cd"/><circle cx="22" cy="22" r="14" fill="#ffe8a0"/><ellipse cx="16" cy="21" rx="4.5" ry="5" fill="#c48a00"/><ellipse cx="28" cy="21" rx="4.5" ry="5" fill="#c48a00"/><rect x="14" y="23" width="16" height="8" rx="3" fill="#c48a00"/><circle cx="18" cy="20" r="2" fill="#fff3cd"/><circle cx="26" cy="20" r="2" fill="#fff3cd"/><circle cx="18.5" cy="20.5" r="1" fill="#333"/><circle cx="26.5" cy="20.5" r="1" fill="#333"/></svg>` },
];

const EN = {
  badge: "For Pet Owners", headline: "Today's off-peak deals near you",
  sub: "Premium grooming & care at up to 40% off — only during quiet hours. Book in seconds, pay upfront, love your pet more.",
  footer: "© 2026 Pawtal · Sukhumvit, Bangkok",
  back: "← Back", title: "Forgot Password?",
  formSub: "Enter your registered email and we'll send you a reset link right away.",
  email: "Email", sending: "Sending…", sendLink: "Send Reset Link",
  backToHome: "← Back to home",
  checkInbox: "Check your inbox",
  sentDesc: (e: string) => `We've sent a password reset link to ${e}. It may take a minute to arrive. Check your spam folder if you don't see it.`,
  backToLogin: "Back to Log In",
};
const TH = {
  badge: "สำหรับเจ้าของสัตว์เลี้ยง", headline: "ดีลออฟพีคใกล้คุณวันนี้",
  sub: "บริการกรูมมิ่งและดูแลสัตว์เลี้ยงลดสูงสุด 40% — เฉพาะช่วงเวลาว่างเท่านั้น จองได้ในไม่กี่วินาที ชำระล่วงหน้า รักสัตว์เลี้ยงของคุณมากขึ้น",
  footer: "© 2026 Pawtal · สุขุมวิท, กรุงเทพฯ",
  back: "← กลับ", title: "ลืมรหัสผ่าน?",
  formSub: "กรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์รีเซ็ตให้คุณทันที",
  email: "อีเมล", sending: "กำลังส่ง…", sendLink: "ส่งลิงก์รีเซ็ต",
  backToHome: "← กลับสู่หน้าหลัก",
  checkInbox: "ตรวจสอบกล่องจดหมาย",
  sentDesc: (e: string) => `เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง ${e} อาจใช้เวลาสักครู่ ตรวจสอบโฟลเดอร์สแปมหากไม่เห็น`,
  backToLogin: "กลับสู่หน้าเข้าสู่ระบบ",
};

export default function ForgotPasswordPage() {
  const [lang] = useLang();
  const T = lang === "en" ? EN : TH;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  };

  return (
    <div className="login-layout">
      <div className="login-left">
        <div className="login-left-logo">Pawtal</div>
        <div className="login-left-badge">
          <div className="login-left-badge-dot" />
          {T.badge}
        </div>
        <h1 className="login-left-h1">{T.headline}</h1>
        <p className="login-left-sub">{T.sub}</p>
        <div className="login-deal-list">
          {PREVIEW_DEALS.map((deal) => (
            <div key={deal.name} className="login-deal-card">
              <div className="login-deal-icon" dangerouslySetInnerHTML={{ __html: deal.svg }} />
              <div className="login-deal-info">
                <div className="login-deal-name">{deal.name}</div>
                <div className="login-deal-meta">{deal.meta}</div>
              </div>
              <div className="login-deal-price">
                <div className="login-deal-old">{deal.old}</div>
                <div className="login-deal-row">
                  <div className="login-deal-new">{deal.price}</div>
                  <div className="login-deal-badge">{deal.discount}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="login-left-footer">{T.footer}</div>
      </div>

      <div className="login-right">
        <div className="login-card">
          {!sent ? (
            <>
              <Link href="/login" className="fp-back">{T.back}</Link>
              <h1 className="fp-title">{T.title}</h1>
              <p className="fp-sub">{T.formSub}</p>
              {error && <div className="login-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="fp-field">
                  <label htmlFor="fp-email" className="fp-label">{T.email}</label>
                  <input id="fp-email" type="email" className="login-input" placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <button type="submit" className="login-btn" style={{ marginTop: 24 }} disabled={loading}>
                  {loading ? T.sending : T.sendLink}
                </button>
              </form>
              <Link href="/" className="login-back" style={{ marginTop: 20 }}>{T.backToHome}</Link>
            </>
          ) : (
            <>
              <div className="fp-success-icon">✉️</div>
              <h1 className="fp-title">{T.checkInbox}</h1>
              <p className="fp-sub">{T.sentDesc(email)}</p>
              <Link href="/login" className="login-btn" style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: 24 }}>
                {T.backToLogin}
              </Link>
              <Link href="/" className="login-back" style={{ marginTop: 20 }}>{T.backToHome}</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
