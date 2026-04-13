"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LanguageContext";

const EN = {
  badge: "For Pet Owners", headline: "Today's off-peak deals near you",
  sub: "Premium grooming & care at up to 40% off — only during quiet hours. Book in seconds, pay upfront, love your pet more.",
  footer: "© 2026 Pawtal · Sukhumvit, Bangkok",
  title: "Log In", subtitle: "Welcome back, pet lover 🐾",
  email: "Email", password: "Password",
  showPw: "Show password", hidePw: "Hide password",
  forgot: "Forgot password?", loggingIn: "Logging in…", logIn: "Log In",
  createAccount: "Create a Pet Owner Account", backToHome: "← Back to home",
  errRequired: "Please enter Email and Password.", errIncorrect: "Incorrect Email or Password.",
};
const TH = {
  badge: "สำหรับเจ้าของสัตว์เลี้ยง", headline: "ดีลออฟพีคใกล้คุณวันนี้",
  sub: "บริการกรูมมิ่งและดูแลสัตว์เลี้ยงลดสูงสุด 40% — เฉพาะช่วงเวลาว่างเท่านั้น จองได้ในไม่กี่วินาที ชำระล่วงหน้า รักสัตว์เลี้ยงของคุณมากขึ้น",
  footer: "© 2026 Pawtal · สุขุมวิท, กรุงเทพฯ",
  title: "เข้าสู่ระบบ", subtitle: "ยินดีต้อนรับกลับ เพื่อนรักสัตว์เลี้ยง 🐾",
  email: "อีเมล", password: "รหัสผ่าน",
  showPw: "แสดงรหัสผ่าน", hidePw: "ซ่อนรหัสผ่าน",
  forgot: "ลืมรหัสผ่าน?", loggingIn: "กำลังเข้าสู่ระบบ…", logIn: "เข้าสู่ระบบ",
  createAccount: "สมัครบัญชีเจ้าของสัตว์เลี้ยง", backToHome: "← กลับสู่หน้าหลัก",
  errRequired: "กรุณากรอกอีเมลและรหัสผ่าน", errIncorrect: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
};

// ── Deal previews ─────────────────────────────────────────────────────────────
const PREVIEW_DEALS = [
  {
    name: "Happy Paws Grooming",
    meta: "Bath & Full Groom · Sukhumvit 39",
    old: "฿650",
    price: "฿390",
    discount: "-40%",
    svg: `<svg viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="10" fill="#d7f0e4"/><circle cx="22" cy="22" r="14" fill="#b2e8cd"/><path d="M16 26c0-3 1.5-4.5 4-6s3.5-2 3.5-3.5c0-1.5-1-3-2.5-3s-1.5 1-1.5 3" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/><circle cx="30" cy="17" r="3" fill="#1a7a4a"/><path d="M18 26c.5-1.5 2-3 3-3s2.5 1.5 3 3" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/></svg>`,
  },
  {
    name: "Paw & Relax Spa",
    meta: "Aromatherapy Bath · Thonglor",
    old: "฿800",
    price: "฿560",
    discount: "-30%",
    svg: `<svg viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="10" fill="#f0e8ff"/><circle cx="22" cy="22" r="14" fill="#ddd0ff"/><ellipse cx="22" cy="24" rx="7" ry="6" fill="#6a3fbf"/><ellipse cx="16" cy="17" rx="3" ry="4" fill="#6a3fbf"/><ellipse cx="28" cy="17" rx="3" ry="4" fill="#6a3fbf"/><circle cx="19" cy="23" r="1.5" fill="#fff"/><circle cx="25" cy="23" r="1.5" fill="#fff"/><path d="M19 27 Q22 29 25 27" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>`,
  },
  {
    name: "Furever Friends",
    meta: "Day Boarding · Phrom Phong",
    old: "฿500",
    price: "฿350",
    discount: "-30%",
    svg: `<svg viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="10" fill="#fff3cd"/><circle cx="22" cy="22" r="14" fill="#ffe8a0"/><ellipse cx="16" cy="21" rx="4.5" ry="5" fill="#c48a00"/><ellipse cx="28" cy="21" rx="4.5" ry="5" fill="#c48a00"/><rect x="14" y="23" width="16" height="8" rx="3" fill="#c48a00"/><circle cx="18" cy="20" r="2" fill="#fff3cd"/><circle cx="26" cy="20" r="2" fill="#fff3cd"/><circle cx="18.5" cy="20.5" r="1" fill="#333"/><circle cx="26.5" cy="20.5" r="1" fill="#333"/></svg>`,
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/deals";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang] = useLang();
  const T = lang === "en" ? EN : TH;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError(T.errRequired);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(T.errIncorrect);
      return;
    }

    router.push(nextPath);
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

      {/* ── Right Panel ── */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-title">{T.title}</div>
          <div className="login-card-sub">{T.subtitle}</div>

          <form onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="email">{T.email}</label>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">{T.password}</label>
              <div className="login-input-wrap">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  className="login-input"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? T.hidePw : T.showPw}
                >
                  {showPw ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <Link href="/forgot-password" className="login-forgot">{T.forgot}</Link>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? T.loggingIn : T.logIn}
            </button>
          </form>

          <button type="button" className="login-create-btn" onClick={() => router.push("/signup")}>
            {T.createAccount}
          </button>

          <Link href="/" className="login-back">{T.backToHome}</Link>
        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
