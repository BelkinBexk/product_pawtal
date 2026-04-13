"use client";

import Link from "next/link";
import CustomerNav from "@/components/CustomerNav";
import { useLang } from "@/contexts/LanguageContext";

const EN = {
  title: "Payment Successful",
  desc: "Thank you for choosing Pawtal for your pet's care. We've sent a confirmation email to your registered address with all the appointment details.",
  viewBookings: "View My Bookings",
  downloadReceipt: "Download Receipt",
};
const TH = {
  title: "ชำระเงินสำเร็จ",
  desc: "ขอบคุณที่เลือก Pawtal สำหรับการดูแลสัตว์เลี้ยงของคุณ เราได้ส่งอีเมลยืนยันไปยังที่อยู่ที่ลงทะเบียนของคุณพร้อมรายละเอียดการนัดหมายทั้งหมด",
  viewBookings: "ดูการจองของฉัน",
  downloadReceipt: "ดาวน์โหลดใบเสร็จ",
};

export default function PaymentSuccessPage() {
  const [lang] = useLang();
  const T = lang === "en" ? EN : TH;
  return (
    <div className="psr-page">
      <CustomerNav />
      <div className="psr-body">
        <div className="psr-icon-wrap psr-icon-success">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#22863a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h1 className="psr-title">{T.title}</h1>
        <p className="psr-desc">{T.desc}</p>
        <div className="psr-actions">
          <Link href="/bookings" className="psr-btn-primary">{T.viewBookings}</Link>
          <button className="psr-btn-secondary">{T.downloadReceipt}</button>
        </div>
      </div>
    </div>
  );
}
