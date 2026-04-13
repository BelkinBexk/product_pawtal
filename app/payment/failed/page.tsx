"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import { useLang } from "@/contexts/LanguageContext";

const EN = {
  title: "Payment", highlight: "Failed",
  desc: "Something went wrong while processing your booking. Please try again or check your payment details.",
  tryAgain: "Try Again", backToBooking: "Back to Booking",
  needHelp: "Need help?", chatSupport: "Chat with support",
};
const TH = {
  title: "การชำระเงิน", highlight: "ล้มเหลว",
  desc: "เกิดข้อผิดพลาดในขณะดำเนินการจอง กรุณาลองใหม่หรือตรวจสอบรายละเอียดการชำระเงินของคุณ",
  tryAgain: "ลองอีกครั้ง", backToBooking: "กลับสู่การจอง",
  needHelp: "ต้องการความช่วยเหลือ?", chatSupport: "แชทกับฝ่ายสนับสนุน",
};

export default function PaymentFailedPage() {
  const router = useRouter();
  const [lang] = useLang();
  const T = lang === "en" ? EN : TH;
  return (
    <div className="psr-page">
      <CustomerNav />
      <div className="psr-body">
        <div className="psr-icon-wrap psr-icon-failed">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 className="psr-title">
          {T.title} <span className="psr-highlight-red">{T.highlight}</span>
        </h1>
        <p className="psr-desc">{T.desc}</p>
        <div className="psr-actions psr-actions-col">
          <button className="psr-btn-primary" onClick={() => router.push("/payment")}>{T.tryAgain}</button>
          <Link href="/book" className="psr-btn-secondary">{T.backToBooking}</Link>
        </div>
        <p className="psr-help">
          {T.needHelp}{" "}
          <a href="mailto:support@pawtal.co" className="psr-help-link">{T.chatSupport}</a>
        </p>
      </div>
    </div>
  );
}
