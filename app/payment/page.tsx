"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import { useLang } from "@/contexts/LanguageContext";

const EN = {
  back: "Back to booking detail",
  omiseBadge: "OMISE SECURE PAYMENT",
  title: "Complete Your Payment",
  subtitle: "Scan this QR code with your mobile banking app to pay",
  safeLabel: "Safe to scan · Powered by Omise",
  saveQR: "Save QR",
  expired: "QR code has expired — please generate a new one",
  expiresIn: "Expires in",
  tryAgain: "Try again",
  generatingQR: "Generating QR code…",
  noSession: "No payment session found. Please go back and try again.",
  invalidSession: "Invalid payment session. Please go back and try again.",
  bookingSummary: "Booking Summary",
  service: "SERVICE",
  dateTime: "DATE & TIME",
  at: "at",
  standardRate: "Standard rate",
  dealApplied: "Deal applied",
  total: "Total",
  ref: "Ref:",
  chargeRef: "Charge ref:",
  pciLabel: "PCI DSS Compliant",
  sslLabel: "SSL Secure",
  fraudLabel: "Fraud Protection",
};
const TH = {
  back: "← กลับไปยังรายละเอียดการจอง",
  omiseBadge: "ชำระเงินผ่าน OMISE อย่างปลอดภัย",
  title: "ชำระเงินให้เสร็จสมบูรณ์",
  subtitle: "สแกน QR code นี้ด้วยแอปธนาคารของคุณเพื่อชำระ",
  safeLabel: "ปลอดภัยในการสแกน · ขับเคลื่อนโดย Omise",
  saveQR: "บันทึก QR",
  expired: "QR code หมดอายุแล้ว — กรุณาสร้างใหม่",
  expiresIn: "หมดอายุใน",
  tryAgain: "ลองอีกครั้ง",
  generatingQR: "กำลังสร้าง QR code…",
  noSession: "ไม่พบเซสชันการชำระเงิน กรุณากลับและลองใหม่",
  invalidSession: "เซสชันการชำระเงินไม่ถูกต้อง กรุณากลับและลองใหม่",
  bookingSummary: "สรุปการจอง",
  service: "บริการ",
  dateTime: "วันและเวลา",
  at: "ที่",
  standardRate: "ราคาปกติ",
  dealApplied: "ส่วนลดดีล",
  total: "รวม",
  ref: "อ้างอิง:",
  chargeRef: "อ้างอิงการชำระ:",
  pciLabel: "มาตรฐาน PCI DSS",
  sslLabel: "SSL ปลอดภัย",
  fraudLabel: "ป้องกันการฉ้อโกง",
};

// ── Booking summary (mock — real app passes via URL params / context) ─────────
const SUMMARY = {
  petName:       "Mochi",
  petBreed:      "Shih Tzu",
  petInitials:   "M",
  petBg:         "#17A8FF",
  service:       "Full Grooming Package",
  shop:          "Nong's Pet Spa",
  dateLabel:     "Monday, 7 Apr 2026",
  timeLabel:     "10:30 AM",
  originalPrice: 900,
  dealPrice:     630,
  bookingRef:    "BK-202604-0001",
};

const EXPIRE_SECONDS = 5 * 60;

// ── Page ──────────────────────────────────────────────────────────────────────
type ChargeState = "idle" | "loading" | "ready" | "error";

export default function PaymentPage() {
  const router = useRouter();
  const [lang] = useLang();
  const T = lang === "en" ? EN : TH;
  const [seconds,   setSeconds]  = useState(EXPIRE_SECONDS);
  const [expired,   setExpired]  = useState(false);
  const [state,     setState]    = useState<ChargeState>("idle");
  const [qrUrl,     setQrUrl]    = useState<string | null>(null);
  const [chargeId,  setChargeId] = useState<string | null>(null);
  const [apiError,  setApiError] = useState<string | null>(null);

  const save = SUMMARY.originalPrice - SUMMARY.dealPrice;
  // ── Load charge from sessionStorage (created on /book page) ─────────────────
  useEffect(() => {
    const raw = sessionStorage.getItem("pawtal_charge");
    if (!raw) {
      setApiError(T.noSession);
      setState("error");
      return;
    }
    try {
      const charge = JSON.parse(raw);
      setQrUrl(charge.qrImageUrl);
      setChargeId(charge.chargeId);
      if (charge.bookingId)  setChargeId(prev => { (window as any).__pawtal_bookingId = charge.bookingId; return prev; });
      setState("ready");
      setSeconds(EXPIRE_SECONDS);
      setExpired(false);
    } catch {
      setApiError(T.invalidSession);
      setState("error");
    }
  }, []);

  // ── Countdown ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state !== "ready" || seconds <= 0) {
      if (seconds <= 0) { sessionStorage.removeItem("pawtal_charge"); router.push("/payment/timeout"); }
      return;
    }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, state, router]);

  // ── Poll charge status every 4 seconds ──────────────────────────────────────
  useEffect(() => {
    if (state !== "ready" || !chargeId) return;
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const bookingId = (window as any).__pawtal_bookingId ?? "";
        const qs = bookingId ? `chargeId=${chargeId}&bookingId=${bookingId}` : `chargeId=${chargeId}`;
        const res = await fetch(`/api/payment/check-status?${qs}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.status === "successful") { sessionStorage.removeItem("pawtal_charge"); router.push("/payment/success"); }
        if (data.status === "failed")     { sessionStorage.removeItem("pawtal_charge"); router.push("/payment/failed"); }
        if (data.status === "expired")    { sessionStorage.removeItem("pawtal_charge"); router.push("/payment/timeout"); }
      } catch {
        // silent — keep polling
      }
    }, 4000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [state, chargeId, router]);

  const mm  = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss  = String(seconds % 60).padStart(2, "0");
  const pct = (seconds / EXPIRE_SECONDS) * 100;

  const handleSaveQR = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `pawtal-qr-${SUMMARY.bookingRef}.png`;
    a.click();
  };

  // ── QR area content ─────────────────────────────────────────────────────────
  const renderQR = () => {
    if (state === "loading") return (
      <div className="pay-qr-state">
        <div className="pay-qr-spinner" />
        <div className="pay-qr-state-text">{T.generatingQR}</div>
      </div>
    );
    if (state === "error") return (
      <div className="pay-qr-state">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div className="pay-qr-state-text" style={{ color: "#dc2626" }}>{apiError}</div>
        <button className="pay-refresh-btn" onClick={() => router.push("/book")}>{T.tryAgain}</button>
      </div>
    );
    if (qrUrl) return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={qrUrl} alt="PromptPay QR code" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    );
    return null;
  };

  return (
    <div className="pay-page">
      <CustomerNav />

      <div className="pay-back-wrap">
        <Link href="/book" className="pay-back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          {T.back}
        </Link>
      </div>

      <div className="pay-layout">

        {/* ── LEFT: Payment panel ── */}
        <div className="pay-main">

          <div className="pay-omise-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#17A8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            {T.omiseBadge}
          </div>

          <h1 className="pay-title">{T.title}</h1>
          <p className="pay-subtitle">
            {T.subtitle}<br />
            <strong>฿{SUMMARY.dealPrice.toLocaleString()}</strong>
          </p>

          {/* QR card */}
          <div className="pay-qr-card">
            <div className="pay-qr-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
              PromptPay
            </div>
            <div className={`pay-qr-inner${expired || state === "error" ? " faded" : ""}`}>
              {renderQR()}
            </div>
            <div className="pay-safe-label">{T.safeLabel}</div>
          </div>

          {/* Save QR */}
          <button
            className="pay-save-btn"
            onClick={handleSaveQR}
            disabled={!qrUrl || expired || state !== "ready"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {T.saveQR}
          </button>

          {/* Timer — only show when QR is ready */}
          {state === "ready" && (
            <div className={`pay-timer${expired ? " expired" : seconds < 60 ? " urgent" : ""}`}>
              <div className="pay-timer-bar-wrap">
                <div className="pay-timer-bar" style={{
                  width: `${pct}%`,
                  background: expired ? "#dc2626" : seconds < 60 ? "#f59e0b" : "#17A8FF"
                }} />
              </div>
              <div className="pay-timer-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {expired
                  ? T.expired
                  : `${T.expiresIn} ${mm}:${ss}`}
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div className="pay-trust-row">
            {[
              { icon: <svg key="s1" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: T.pciLabel },
              { icon: <svg key="s2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, label: T.sslLabel },
              { icon: <svg key="s3" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>, label: T.fraudLabel },
            ].map(b => (
              <div key={b.label} className="pay-trust-item">{b.icon}{b.label}</div>
            ))}
          </div>

        </div>

        {/* ── RIGHT: Booking Summary ── */}
        <aside className="pay-sidebar">
          <div className="pay-summary-card">
            <div className="pay-summary-title">{T.bookingSummary}</div>
            <div className="pay-summary-shop">{SUMMARY.shop}</div>

            <div className="pay-summary-pet">
              <div className="pay-pet-avatar" style={{ background: SUMMARY.petBg }}>{SUMMARY.petInitials}</div>
              <div>
                <div className="pay-pet-name">{SUMMARY.petName}</div>
                <div className="pay-pet-breed">{SUMMARY.petBreed}</div>
              </div>
            </div>

            <div className="pay-summary-detail-row">
              <div className="pay-summary-detail-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#17A8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <div>
                <div className="pay-summary-detail-label">{T.service}</div>
                <div className="pay-summary-detail-val">{SUMMARY.service}</div>
                <div className="pay-summary-detail-sub">{T.at} {SUMMARY.shop}</div>
              </div>
            </div>

            <div className="pay-summary-detail-row">
              <div className="pay-summary-detail-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#17A8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <div className="pay-summary-detail-label">{T.dateTime}</div>
                <div className="pay-summary-detail-val">{SUMMARY.dateLabel}</div>
                <div className="pay-summary-detail-sub">{T.at} {SUMMARY.timeLabel}</div>
              </div>
            </div>

            <div className="pay-pricing">
              <div className="pay-pricing-row">
                <span>{T.standardRate}</span>
                <span>฿{SUMMARY.originalPrice.toLocaleString()}</span>
              </div>
              <div className="pay-pricing-row deal">
                <span>{T.dealApplied}</span>
                <span>−฿{save.toLocaleString()}</span>
              </div>
              <div className="pay-pricing-total-box">
                <span className="pay-pricing-total-label">{T.total}</span>
                <span className="pay-pricing-total-amount">฿{SUMMARY.dealPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="pay-booking-ref">{T.ref} {SUMMARY.bookingRef}</div>
            {chargeId && (
              <div className="pay-charge-ref">{T.chargeRef} {chargeId}</div>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
}
