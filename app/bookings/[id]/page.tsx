"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import CustomerNav from "@/components/CustomerNav";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LanguageContext";

const EN = {
  back: "← Back to My Bookings", verified: "Verified Partner",
  phone: "PHONE NUMBER", address: "ADDRESS", directions: "Get Directions",
  apptDate: "APPOINTMENT DATE", arrivalTime: "ARRIVAL TIME",
  weight: "Weight", temperament: "Temperament", vaccinated: "Vaccinated",
  paid: "PAID", paymentSummary: "Payment Summary",
  serviceFee: "SERVICE FEE", dealDiscount: "DEAL DISCOUNT", totalPaid: "Total Amount Paid",
  refundRequested: "Refund Requested", requestRefund: "Request Refund",
  refundTitle: "Request a Refund?",
  refundDesc: (amount: number, service: string) =>
    `You are requesting a full refund of ฿${amount.toLocaleString()} for ${service}.\n\nSince payment was made via PromptPay, our team will process the bank transfer manually within 3–5 business days. Your booking will be cancelled immediately.`,
  keepBooking: "Keep Booking", yesRefund: "Yes, Refund", processing: "Processing…",
  loading: "Loading booking…", notFound: "Booking not found.", backToBookings: "Back to My Bookings",
};
const TH = {
  back: "← กลับไปยังการจองของฉัน", verified: "พาร์ทเนอร์ที่ได้รับการยืนยัน",
  phone: "หมายเลขโทรศัพท์", address: "ที่อยู่", directions: "นำทาง",
  apptDate: "วันที่นัดหมาย", arrivalTime: "เวลามาถึง",
  weight: "น้ำหนัก", temperament: "นิสัย", vaccinated: "ฉีดวัคซีนแล้ว",
  paid: "ชำระแล้ว", paymentSummary: "สรุปการชำระเงิน",
  serviceFee: "ค่าบริการ", dealDiscount: "ส่วนลด", totalPaid: "ยอดชำระทั้งหมด",
  refundRequested: "ขอคืนเงินแล้ว", requestRefund: "ขอคืนเงิน",
  refundTitle: "ขอคืนเงิน?",
  refundDesc: (amount: number, service: string) =>
    `คุณกำลังขอคืนเงินเต็มจำนวน ฿${amount.toLocaleString()} สำหรับ ${service}\n\nเนื่องจากชำระผ่าน PromptPay ทีมงานของเราจะดำเนินการโอนเงินเข้าบัญชีธนาคารของคุณภายใน 3-5 วันทำการ การจองของคุณจะถูกยกเลิกทันที`,
  keepBooking: "เก็บการจองไว้", yesRefund: "ยืนยัน ขอคืนเงิน", processing: "กำลังดำเนินการ…",
  loading: "กำลังโหลดการจอง…", notFound: "ไม่พบการจอง", backToBookings: "กลับไปยังการจองของฉัน",
};

// ── Mock detail data (keyed by booking ID) ────────────────────────────────────
const MOCK_DETAIL: Record<string, {
  shop: { name: string; description: string; phone: string; address: string; verified: boolean; };
  service: { name: string; description: string; icon: string; status: string; date: string; time: string; duration: string; serviceTimestamp: number; };
  pet: { name: string; breed: string; age: string; weight: string; temperament: string; vaccinated: boolean; initials: string; bg: string; };
  payment: { serviceFee: number; tax: number; total: number; paid: boolean; chargeId: string | null; };
}> = {
  "BK-202604-0001": {
    shop: {
      name: "Nong's Pet Spa",
      description: "Premium pet grooming and spa services in the heart of Sukhumvit. Our certified groomers specialise in dogs and cats of all breeds.",
      phone: "+66 81 234 5678",
      address: "42/1 Sukhumvit Soi 23, Watthana, Bangkok 10110",
      verified: true,
    },
    service: {
      name: "Full Grooming Package",
      description: "Full wash, haircut, nail trimming, and ear cleaning service for all breeds.",
      icon: "scissors",
      status: "confirmed",
      date: "April 7, 2026",
      time: "10:30 AM",
      duration: "Approx. 2h",
      serviceTimestamp: new Date("2026-04-07T10:30:00").getTime(),
    },
    pet: {
      name: "Mochi",
      breed: "Shih Tzu",
      age: "3 YEARS OLD",
      weight: "5.2 kg",
      temperament: "Playful / Friendly",
      vaccinated: true,
      initials: "M",
      bg: "#17A8FF",
    },
    payment: { serviceFee: 900, tax: 0, total: 630, paid: true, chargeId: null },
  },
  "BK-202603-0042": {
    shop: {
      name: "Happy Paws Clinic",
      description: "Professional veterinary clinic offering dental, wellness, and preventive care for dogs and cats in Bangkok.",
      phone: "+66 2 123 4567",
      address: "15 Thong Lo Soi 5, Watthana, Bangkok 10110",
      verified: true,
    },
    service: {
      name: "Dental Cleaning",
      description: "Professional dental scaling and polishing to keep your pet's teeth clean and healthy.",
      icon: "tooth",
      status: "pending",
      date: "April 12, 2026",
      time: "02:00 PM",
      duration: "Approx. 1.5h",
      serviceTimestamp: new Date("2026-04-12T14:00:00").getTime(),
    },
    pet: {
      name: "Luna",
      breed: "Persian Cat",
      age: "2 YEARS OLD",
      weight: "3.8 kg",
      temperament: "Calm / Gentle",
      vaccinated: true,
      initials: "L",
      bg: "#f59e0b",
    },
    payment: { serviceFee: 1200, tax: 0, total: 1200, paid: true, chargeId: null },
  },
  "BK-202602-0018": {
    shop: {
      name: "PawWalker BKK",
      description: "Trusted dog walking and pet sitting service covering Sukhumvit, Silom, and Ari areas in Bangkok.",
      phone: "+66 89 876 5432",
      address: "On-demand service · Sukhumvit area",
      verified: false,
    },
    service: {
      name: "Hourly Dog Walking",
      description: "1-hour guided walk with a certified pet handler in your neighbourhood.",
      icon: "walk",
      status: "confirmed",
      date: "March 15, 2026",
      time: "08:00 AM",
      duration: "1 hour",
      serviceTimestamp: new Date("2026-03-15T08:00:00").getTime(),
    },
    pet: {
      name: "Mochi",
      breed: "Shih Tzu",
      age: "3 YEARS OLD",
      weight: "5.2 kg",
      temperament: "Playful / Friendly",
      vaccinated: true,
      initials: "M",
      bg: "#17A8FF",
    },
    payment: { serviceFee: 250, tax: 0, total: 250, paid: true, chargeId: null },
  },
  "BK-202601-0009": {
    shop: {
      name: "Nong's Pet Spa",
      description: "Premium pet grooming and spa services in the heart of Sukhumvit. Our certified groomers specialise in dogs and cats of all breeds.",
      phone: "+66 81 234 5678",
      address: "42/1 Sukhumvit Soi 23, Watthana, Bangkok 10110",
      verified: true,
    },
    service: {
      name: "Bath & Blow Dry",
      description: "Full bath, conditioning treatment, and professional blow dry for a clean and fluffy finish.",
      icon: "scissors",
      status: "confirmed",
      date: "January 22, 2026",
      time: "11:00 AM",
      duration: "Approx. 1.5h",
      serviceTimestamp: new Date("2026-01-22T11:00:00").getTime(),
    },
    pet: {
      name: "Luna",
      breed: "Persian Cat",
      age: "2 YEARS OLD",
      weight: "3.8 kg",
      temperament: "Calm / Gentle",
      vaccinated: true,
      initials: "L",
      bg: "#f59e0b",
    },
    payment: { serviceFee: 450, tax: 0, total: 450, paid: true, chargeId: null },
  },
};

function ServiceSvg({ icon }: { icon: string }) {
  if (icon === "scissors") return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22863a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/>
      <line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
  );
  if (icon === "tooth") return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22863a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8 2 4 5 4 9c0 2 .5 4 1 6l1 7h2l1-4 1 4h2l1-4 1 4h2l1-7c.5-2 1-4 1-6 0-4-4-7-8-7z"/>
    </svg>
  );
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22863a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V4z"/>
      <path d="M7 20l2-8m4 8l-2-8m-5-4h12"/>
    </svg>
  );
}

type DetailShape = typeof MOCK_DETAIL[keyof typeof MOCK_DETAIL];

function shopBgColor(name: string) {
  const colors = ["#17A8FF","#f59e0b","#8b5cf6","#10b981","#ef4444","#f97316"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function durationLabel(minutes: number | null) {
  if (!minutes) return "Approx. 1h";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `Approx. ${h}h`;
  return `Approx. ${h}h ${m}min`;
}

function categoryToIcon(category: string | null) {
  if (!category) return "scissors";
  const c = category.toLowerCase();
  if (c.includes("groom") || c.includes("bath") || c.includes("trim")) return "scissors";
  if (c.includes("vet") || c.includes("dental") || c.includes("health")) return "tooth";
  return "walk";
}

function formatDatetime(raw: string | null, date: string | null, time: string | null) {
  // prefer scheduled_at, fall back to date + start_time
  const src = raw ?? (date && time ? `${date}T${time}` : null);
  if (!src) return { date: "—", time: "—", serviceTimestamp: 0 };
  const d = new Date(src);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dateStr = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  let h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const timeStr = `${h}:${String(m).padStart(2,"0")} ${ampm}`;
  return { date: dateStr, time: timeStr, serviceTimestamp: d.getTime() };
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [lang] = useLang();
  const T = lang === "en" ? EN : TH;
  const [detail,          setDetail]          = useState<DetailShape | null>(MOCK_DETAIL[id] ?? null);
  const [loadingDb,       setLoadingDb]       = useState(!MOCK_DETAIL[id]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refunding,       setRefunding]       = useState(false);
  const [refundDone,      setRefundDone]       = useState(false);
  const [refundError,     setRefundError]      = useState<string | null>(null);

  // Fetch from Supabase if not found in mock data
  useEffect(() => {
    if (MOCK_DETAIL[id]) return;
    (async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id, booking_reference, status, payment_status, total_amount,
          scheduled_at, pet_name, notes, customer_notes,
          providers ( business_name, phone, address, bio ),
          off_peak_slots ( service_name, original_price, discount_pct )
        `)
        .eq("booking_reference", id)
        .maybeSingle();

      if (!error && data) {
        const b = data as any;
        const providerName = b.providers?.business_name ?? "Unknown Shop";
        const { date: dateStr, time: timeStr, serviceTimestamp } = formatDatetime(
          b.scheduled_at, null, null
        );
        const petName = b.pet_name ?? "Pet";
        const serviceName = b.off_peak_slots?.service_name ?? "Service";
        const total = Number(b.total_amount ?? 0);
        const originalPrice = Number(b.off_peak_slots?.original_price ?? total);

        const mapped: DetailShape = {
          shop: {
            name:        providerName,
            description: b.providers?.bio ?? "",
            phone:       b.providers?.phone ?? "—",
            address:     b.providers?.address ?? "Bangkok, Thailand",
            verified:    true,
          },
          service: {
            name:             serviceName,
            description:      "",
            icon:             "scissors",
            status:           b.status ?? "pending",
            date:             dateStr,
            time:             timeStr,
            duration:         "—",
            serviceTimestamp,
          },
          pet: {
            name:        petName,
            breed:       "—",
            age:         "—",
            weight:      "—",
            temperament: "—",
            vaccinated:  false,
            initials:    petName.charAt(0).toUpperCase(),
            bg:          shopBgColor(petName),
          },
          payment: {
            serviceFee: originalPrice,
            tax:        0,
            total,
            paid:       b.payment_status === "paid",
            chargeId:   null,
          },
        };
        setDetail(mapped);
      }
      setLoadingDb(false);
    })();
  }, [id]);

  if (loadingDb) {
    return (
      <div className="bkd-page">
        <CustomerNav />
        <div style={{ padding: "80px 24px", textAlign: "center", color: "#64748b" }}>
          {T.loading}
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="bkd-page">
        <CustomerNav />
        <div style={{ padding: "80px 24px", textAlign: "center", color: "#64748b" }}>
          {T.notFound} <Link href="/bookings" style={{ color: "#17A8FF" }}>{T.backToBookings}</Link>
        </div>
      </div>
    );
  }

  const { shop, service, pet, payment } = detail;
  const isHistory = payment.paid;
  const canRefund = payment.paid && Date.now() < service.serviceTimestamp;

  const handleRefund = async () => {
    setRefunding(true);
    setRefundError(null);
    try {
      const res = await fetch("/api/payment/refund", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingReference: id,
          amount:           payment.total,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setRefundError(data.error ?? "Request failed"); setRefunding(false); return; }
      setRefundDone(true);
      setShowRefundModal(false);
    } catch {
      setRefundError("Network error — please try again");
    }
    setRefunding(false);
  };

  return (
    <div className="bkd-page">
      <CustomerNav />

      <div className="bkd-container">

        {/* Back link */}
        <Link href="/bookings" className="bkd-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          {T.back}
        </Link>

        {/* Top 3-col grid */}
        <div className="bkd-grid">

          {/* ── Shop card ── */}
          <div className="bkd-card">
            <div className="bkd-shop-cover">
              <div className="bkd-shop-cover-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              {shop.verified && (
                <div className="bkd-verified-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22863a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  {T.verified}
                </div>
              )}
            </div>
            <div className="bkd-card-body">
              <h2 className="bkd-shop-name">{shop.name}</h2>
              <p className="bkd-shop-desc">{shop.description}</p>
              <div className="bkd-contact-row">
                <div className="bkd-contact-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#17A8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <div className="bkd-contact-label">{T.phone}</div>
                  <div className="bkd-contact-val">{shop.phone}</div>
                </div>
              </div>
              <div className="bkd-contact-row">
                <div className="bkd-contact-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#17A8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <div className="bkd-contact-label">{T.address}</div>
                  <div className="bkd-contact-val">{shop.address}</div>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bkd-directions-btn"
              >
                {T.directions}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </a>
            </div>
          </div>

          {/* ── Service card ── */}
          <div className="bkd-card">
            <div className="bkd-card-body">
              <div className="bkd-svc-header">
                <div className="bkd-svc-icon-wrap">
                  <ServiceSvg icon={service.icon} />
                </div>
                <span className={`bkd-status-badge bkd-status-${service.status}`}>
                  {service.status.toUpperCase()}
                </span>
              </div>
              <h2 className="bkd-svc-name">{service.name}</h2>
              <p className="bkd-svc-desc">{service.description}</p>
              <div className="bkd-appt-row">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <div>
                  <div className="bkd-appt-label">{T.apptDate}</div>
                  <div className="bkd-appt-val">{service.date}</div>
                </div>
              </div>
              <div className="bkd-appt-row">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <div>
                  <div className="bkd-appt-label">{T.arrivalTime}</div>
                  <div className="bkd-appt-val">{service.time} ({service.duration})</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Pet card ── */}
          <div className="bkd-card">
            <div className="bkd-card-body bkd-pet-body">
              <div className="bkd-pet-avatar" style={{ background: pet.bg }}>{pet.initials}</div>
              <h2 className="bkd-pet-name">{pet.name}</h2>
              <div className="bkd-pet-breed">{pet.breed}</div>
              <div className="bkd-pet-age-badge">{pet.age}</div>
              <div className="bkd-pet-stats">
                <div className="bkd-pet-stat-row">
                  <span className="bkd-pet-stat-label">{T.weight}</span>
                  <span className="bkd-pet-stat-val">{pet.weight}</span>
                </div>
                <div className="bkd-pet-stat-row">
                  <span className="bkd-pet-stat-label">{T.temperament}</span>
                  <span className="bkd-pet-stat-val">{pet.temperament}</span>
                </div>
                <div className="bkd-pet-stat-row">
                  <span className="bkd-pet-stat-label">{T.vaccinated}</span>
                  <span className="bkd-pet-stat-val">
                    {pet.vaccinated ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22863a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    ) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Payment Summary ── */}
        <div className="bkd-payment-section">
          <div className="bkd-payment-header">
            <div className="bkd-payment-title-row">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#17A8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              <h2 className="bkd-payment-title">{T.paymentSummary}</h2>
            </div>
            {isHistory && (
              <div className="bkd-paid-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22863a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                {T.paid}
              </div>
            )}
          </div>
          <div className="bkd-payment-boxes">
            <div className="bkd-payment-box">
              <div className="bkd-payment-box-label">{T.serviceFee}</div>
              <div className="bkd-payment-box-val">฿{payment.serviceFee.toLocaleString()}</div>
            </div>
            <div className="bkd-payment-box">
              <div className="bkd-payment-box-label">{T.dealDiscount}</div>
              <div className="bkd-payment-box-val" style={{ color: "#22863a" }}>−฿{(payment.serviceFee - payment.total).toLocaleString()}</div>
            </div>
          </div>
          <div className="bkd-payment-total-row">
            <div className="bkd-payment-total-box">
              <span className="bkd-payment-total-label">{T.totalPaid}</span>
              <span className="bkd-payment-total-amount">฿{payment.total.toLocaleString()}</span>
            </div>
            {refundDone ? (
              <div className="bkd-refund-done">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22863a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                {T.refundRequested}
              </div>
            ) : canRefund ? (
              <button className="bkd-refund-btn" onClick={() => setShowRefundModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                {T.requestRefund}
              </button>
            ) : null}
          </div>
        </div>

      </div>

      {/* ── Refund Confirmation Modal ── */}
      {showRefundModal && (
        <div className="bkd-modal-overlay" onClick={() => !refunding && setShowRefundModal(false)}>
          <div className="bkd-modal" onClick={e => e.stopPropagation()}>
            <div className="bkd-modal-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </div>
            <h3 className="bkd-modal-title">{T.refundTitle}</h3>
            <p className="bkd-modal-desc" style={{ whiteSpace: "pre-line" }}>
              {T.refundDesc(payment.total, service.name)}
            </p>
            {refundError && (
              <div className="bkd-modal-error">{refundError}</div>
            )}
            <div className="bkd-modal-actions">
              <button
                className="bkd-modal-cancel"
                onClick={() => setShowRefundModal(false)}
                disabled={refunding}
              >
                {T.keepBooking}
              </button>
              <button
                className="bkd-modal-confirm"
                onClick={handleRefund}
                disabled={refunding}
              >
                {refunding ? T.processing : T.yesRefund}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
