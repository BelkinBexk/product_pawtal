"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LanguageContext";

const EN = {
  badge: "For Vendors",
  headline: "Manage your pet business from one dashboard.",
  sub: "Bookings, revenue, customer chat, and off-peak deals — all in one place. Join 1,200+ vendors already growing with Pawtal.",
  footer: "© 2026 Pawtal · Bangkok, Thailand",
  title: "Vendor Login", subtitle: "Welcome back — your dashboard is waiting.",
  email: "Email", password: "Password", forgot: "Forgot password?",
  signingIn: "Signing in…", signIn: "Sign In",
  createAccount: "Create a Vendor Account", back: "← Back to For Business",
  errNotVendor: "This account is not registered as a vendor. Please use the pet owner login instead.",
};
const TH = {
  badge: "สำหรับร้านค้า",
  headline: "จัดการธุรกิจสัตว์เลี้ยงของคุณจากแดชบอร์ดเดียว",
  sub: "การจอง รายได้ แชทลูกค้า และดีลออฟพีค — ทุกอย่างอยู่ในที่เดียว เข้าร่วมกับร้านค้ากว่า 1,200 แห่งที่เติบโตไปพร้อมกับ Pawtal",
  footer: "© 2026 Pawtal · กรุงเทพฯ, ประเทศไทย",
  title: "เข้าสู่ระบบร้านค้า", subtitle: "ยินดีต้อนรับกลับ — แดชบอร์ดของคุณรอคุณอยู่",
  email: "อีเมล", password: "รหัสผ่าน", forgot: "ลืมรหัสผ่าน?",
  signingIn: "กำลังเข้าสู่ระบบ…", signIn: "เข้าสู่ระบบแดชบอร์ด",
  createAccount: "สร้างบัญชีร้านค้า", back: "← กลับสู่หน้าธุรกิจ",
  errNotVendor: "บัญชีนี้ไม่ได้ลงทะเบียนเป็นร้านค้า กรุณาใช้หน้าเข้าสู่ระบบสำหรับเจ้าของสัตว์เลี้ยง",
};

const VENDOR_STATS = [
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    label: "Today's bookings",
    value: "3 confirmed · 1 pending",
  },
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    label: "Revenue this month",
    value: "฿18,400 earned",
  },
  {
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    label: "Your rating",
    value: "4.9 · 128 reviews",
  },
];

export default function VendorLoginPage() {
  const router = useRouter();
  const [lang] = useLang();
  const T = lang === "en" ? EN : TH;
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    // Role check — only providers can access the vendor dashboard
    const role = data.user?.user_metadata?.role;
    if (role !== "provider") {
      await supabase.auth.signOut();
      setLoading(false);
      setError(T.errNotVendor);
      return;
    }

    setLoading(false);
    router.push("/vendor/dashboard");
  };

  return (
    <div className="login-layout">

      {/* ── Left Panel ── */}
      <div className="login-left">
        <div className="login-left-logo">Pawtal</div>

        <div className="login-left-badge">
          <div className="login-left-badge-dot" />
          {T.badge}
        </div>

        <h1 className="login-left-h1">{T.headline}</h1>
        <p className="login-left-sub">{T.sub}</p>

        <div className="login-deal-list">
          {VENDOR_STATS.map((s) => (
            <div key={s.label} className="login-deal-card">
              <div className="vl-stat-icon" dangerouslySetInnerHTML={{ __html: s.icon }} />
              <div className="login-deal-info">
                <div className="login-deal-name">{s.value}</div>
                <div className="login-deal-meta">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="login-left-footer">{T.footer}</div>
      </div>

      {/* ── Right Panel ── */}
      <div className="login-right">
        <div className="login-card">
          <h1 className="login-card-title">{T.title}</h1>
          <p className="login-card-sub">{T.subtitle}</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="vl-email">{T.email}</label>
              <input
                id="vl-email"
                type="email"
                className="login-input"
                placeholder="you@yourbusiness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label htmlFor="vl-pw">{T.password}</label>
              <div className="login-input-wrap">
                <input
                  id="vl-pw"
                  type={showPw ? "text" : "password"}
                  className="login-input"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="login-eye" onClick={() => setShowPw((v) => !v)}>
                  {showPw ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <Link href="/forgot-password" className="login-forgot">{T.forgot}</Link>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? T.signingIn : T.signIn}
            </button>
          </form>

          <button
            type="button"
            className="login-create-btn"
            style={{ marginTop: 0 }}
            onClick={() => router.push("/vendor/signup")}
          >
            {T.createAccount}
          </button>

          <Link href="/for-business" className="login-back">{T.back}</Link>
        </div>
      </div>

    </div>
  );
}
