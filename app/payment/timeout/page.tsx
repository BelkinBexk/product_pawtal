"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import { useLang } from "@/contexts/LanguageContext";

const EN = {
  title: "Payment", highlight: "Timed Out",
  desc1: "For your security, payment sessions expire after",
  desc2: "5 minutes",
  desc3: ". Your booking details have been saved.",
  restart: "Restart Payment", backToBookings: "Back to Bookings",
  needHelp: "Need help?", contactSupport: "Contact Support",
};
const TH = {
  title: "การชำระเงิน", highlight: "หมดเวลา",
  desc1: "เพื่อความปลอดภัยของคุณ เซสชันการชำระเงินจะหมดอายุหลังจาก",
  desc2: "5 นาที",
  desc3: " รายละเอียดการจองของคุณถูกบันทึกแล้ว",
  restart: "เริ่มชำระเงินใหม่", backToBookings: "กลับสู่การจอง",
  needHelp: "ต้องการความช่วยเหลือ?", contactSupport: "ติดต่อฝ่ายสนับสนุน",
};

export default function PaymentTimeoutPage() {
  const router = useRouter();
  const [lang] = useLang();
  const T = lang === "en" ? EN : TH;
  return (
    <div className="psr-page">
      <CustomerNav />
      <div className="psr-body">
        <div className="psr-icon-wrap psr-icon-timeout">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/><polyline points="12 7 12 12 15 14"/>
          </svg>
        </div>
        <h1 className="psr-title">
          {T.title} <span className="psr-highlight-blue">{T.highlight}</span>
        </h1>
        <p className="psr-desc">
          {T.desc1}{" "}<strong>{T.desc2}</strong>{T.desc3}
        </p>
        <div className="psr-actions">
          <button className="psr-btn-primary psr-btn-arrow" onClick={() => router.push("/payment")}>
            {T.restart}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <Link href="/bookings" className="psr-btn-secondary psr-btn-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {T.backToBookings}
          </Link>
        </div>
        <p className="psr-help">
          {T.needHelp}{" "}
          <a href="mailto:support@pawtal.co" className="psr-help-link">{T.contactSupport}</a>
        </p>
      </div>
    </div>
  );
}
