"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LanguageContext";

const EN = {
  loading: "Loading deal…", notFound: "Deal not found or no longer available.", backToDeals: "← Back to deals",
  offPeak: "OFF PEAK", reviews: "reviews", verified: "Verified",
  aboutShop: "About the shop", callUs: "Call us", address: "Address", getDirections: "Get Directions",
  selectPet: "Select Your Pet", addNewPet: "+ Add New Pet", newPet: "New Pet",
  pickDateTime: "Pick a Date & Time", availableSlots: "Available slots —", loadingSlots: "Loading slots…",
  selectDate: "Select a date to see slots", noSlots: "No available slots on this date.", booked: "Booked",
  bookingSummary: "Booking Summary", at: "at", dateTime: "DATE & TIME", notSelected: "Not selected",
  pet: "PET", standardRate: "Standard rate", dealApplied: "Deal applied", total: "Total",
  proceeding: "Reserving slot…", proceed: "Proceed to Payment", secureNote: "Secure booking powered by Pawtal",
  needHelp: "Need help?", helpDesc: "Contact our support team directly at", helpPhone: "+66 2 XXX XXXX",
  networkError: "Network error — please try again",
  errSlotFull: "This slot was just taken. Please choose another time.",
  errSlotPast: "This date is no longer bookable. Please choose a future date.",
  errSlotNotFound: "Slot not found. Please go back and try again.",
  errClaimFailed: "Could not reserve slot. Please try again.",
  noSlotsAvailable: "No upcoming slots available for this deal.",
};
const TH = {
  loading: "กำลังโหลดดีล…", notFound: "ไม่พบดีลหรือหมดอายุแล้ว", backToDeals: "← กลับสู่ดีล",
  offPeak: "ออฟพีค", reviews: "รีวิว", verified: "ยืนยันแล้ว",
  aboutShop: "เกี่ยวกับร้าน", callUs: "โทรหาเรา", address: "ที่อยู่", getDirections: "นำทาง",
  selectPet: "เลือกสัตว์เลี้ยงของคุณ", addNewPet: "+ เพิ่มสัตว์เลี้ยงใหม่", newPet: "สัตว์เลี้ยงใหม่",
  pickDateTime: "เลือกวันและเวลา", availableSlots: "สล็อตที่ว่าง —", loadingSlots: "กำลังโหลดสล็อต…",
  selectDate: "เลือกวันที่เพื่อดูสล็อต", noSlots: "ไม่มีสล็อตในวันนี้", booked: "จองแล้ว",
  bookingSummary: "สรุปการจอง", at: "ที่", dateTime: "วันและเวลา", notSelected: "ยังไม่ได้เลือก",
  pet: "สัตว์เลี้ยง", standardRate: "ราคาปกติ", dealApplied: "ส่วนลดดีล", total: "รวม",
  proceeding: "กำลังจองสล็อต…", proceed: "ดำเนินการชำระเงิน", secureNote: "การจองที่ปลอดภัยโดย Pawtal",
  needHelp: "ต้องการความช่วยเหลือ?", helpDesc: "ติดต่อทีมสนับสนุนของเราได้โดยตรงที่", helpPhone: "+66 2 XXX XXXX",
  networkError: "เกิดข้อผิดพลาดของเครือข่าย — กรุณาลองใหม่",
  errSlotFull: "สล็อตนี้ถูกจองแล้ว กรุณาเลือกเวลาอื่น",
  errSlotPast: "วันที่นี้ไม่สามารถจองได้แล้ว กรุณาเลือกวันอื่น",
  errSlotNotFound: "ไม่พบสล็อต กรุณากลับและลองใหม่",
  errClaimFailed: "ไม่สามารถจองสล็อตได้ กรุณาลองใหม่",
  noSlotsAvailable: "ไม่มีสล็อตว่างสำหรับดีลนี้",
};

// ── Static mock pets ──────────────────────────────────────────────────────────
const MOCK_PETS = [
  { id: 1, name: "Mochi", breed: "Shih Tzu",    initials: "M", bg: "#17A8FF" },
  { id: 2, name: "Luna",  breed: "Persian Cat",  initials: "L", bg: "#f59e0b" },
];

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_HEADERS = ["M","T","W","T","F","S","S"];

// ── Types ─────────────────────────────────────────────────────────────────────
interface SlotData {
  serviceName:   string;
  shopName:      string;
  category:      string;
  rating:        number;
  reviews:       number;
  area:          string;
  phone:         string;
  address:       string;
  bio:           string;
  isVerified:    boolean;
  originalPrice: number;
  dealPrice:     number;
  discount:      number;
  providerId:    string;
  serviceId:     string;
}

interface TimeSlot {
  id:          string;
  startsAt:    string;  // UTC ISO
  booked:      boolean;
}

// ── Date helpers (Bangkok UTC+7) ──────────────────────────────────────────────
const toBKKDateStr = (utc: string): string =>
  new Date(utc).toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }); // YYYY-MM-DD

const formatBKKTime = (utc: string): string =>
  new Date(utc).toLocaleTimeString("en-US", {
    timeZone: "Asia/Bangkok", hour: "numeric", minute: "2-digit", hour12: true,
  });

const todayBKK = (): string =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

// ── Mini Calendar ─────────────────────────────────────────────────────────────
function Calendar({
  year, month, selectedDate, availableDates, onSelectDate, onPrev, onNext,
}: {
  year: number; month: number; selectedDate: string | null;
  availableDates: Set<string>;
  onSelectDate: (date: string) => void; onPrev: () => void; onNext: () => void;
}) {
  const today        = todayBKK();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstDow     = new Date(year, month, 1).getDay();
  const startOffset  = (firstDow + 6) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="book-cal">
      <div className="book-cal-header">
        <span className="book-cal-month">{MONTH_NAMES[month]} {year}</span>
        <div className="book-cal-nav">
          <button className="book-cal-arrow" onClick={onPrev}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="book-cal-arrow" onClick={onNext}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      <div className="book-cal-grid">
        {DAY_HEADERS.map((d, i) => <div key={i} className="book-cal-dow">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="book-cal-cell empty" />;
          const fullDate      = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isPastOrToday = fullDate <= today;
          const isAvail       = availableDates.has(fullDate) && !isPastOrToday;
          const isToday       = fullDate === today;
          const isSelected    = fullDate === selectedDate;
          return (
            <button
              key={i}
              disabled={!isAvail}
              className={[
                "book-cal-cell",
                isAvail    ? "avail"    : "",
                isToday    ? "today"    : "",
                isSelected ? "selected" : "",
                isPastOrToday && !isToday ? "past" : "",
              ].join(" ").trim()}
              onClick={() => isAvail && onSelectDate(fullDate)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Inner page ────────────────────────────────────────────────────────────────
function BookInner() {
  const router       = useRouter();
  const [lang]       = useLang();
  const T            = lang === "en" ? EN : TH;
  const searchParams = useSearchParams();
  const slotId       = searchParams.get("slotId");

  // Deal info
  const [slot,        setSlot]       = useState<SlotData | null>(null);
  const [loadingSlot, setLoadingSlot] = useState(true);
  const [slotError,   setSlotError]  = useState(false);

  // Time slots from DB
  const [timeSlots,     setTimeSlots]     = useState<TimeSlot[]>([]);
  const [loadingSlots,  setLoadingSlots]  = useState(false);

  // Selections
  const [selectedPet,    setSelectedPet]    = useState<number>(1);
  const [calYear,        setCalYear]        = useState(2026);
  const [calMonth,       setCalMonth]       = useState(3); // April
  const [selectedDate,   setSelectedDate]   = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Payment
  const [paying,    setPaying]   = useState(false);
  const [payError,  setPayError] = useState<string | null>(null);

  // ── Fetch deal info ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!slotId) { setSlotError(true); setLoadingSlot(false); return; }
    supabase
      .from("off_peak_slots")
      .select(`
        service_name, original_price, discount_pct, deal_price,
        provider_id, service_id,
        providers ( business_name, area, phone, address, bio, rating, review_count, is_verified )
      `)
      .eq("id", slotId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setSlotError(true); setLoadingSlot(false); return; }
        const p = (data.providers as unknown) as {
          business_name: string; area: string; phone: string; address: string;
          bio: string; rating: number; review_count: number; is_verified: boolean;
        };
        setSlot({
          serviceName:   data.service_name,
          shopName:      p.business_name,
          category:      data.service_name,
          rating:        Number(p.rating),
          reviews:       p.review_count,
          area:          p.area,
          phone:         p.phone ?? "—",
          address:       p.address ?? "—",
          bio:           p.bio ?? "",
          isVerified:    p.is_verified,
          originalPrice: Number(data.original_price),
          dealPrice:     Number(data.deal_price),
          discount:      data.discount_pct,
          providerId:    data.provider_id,
          serviceId:     data.service_id,
        });
        setLoadingSlot(false);
      });
  }, [slotId]);

  // ── Fetch available time slots (all future slots for same provider+service) ──
  useEffect(() => {
    if (!slot) return;
    setLoadingSlots(true);
    // Only slots from tomorrow onwards (Bangkok midnight UTC)
    const tomorrowBKK = new Date();
    tomorrowBKK.setDate(tomorrowBKK.getDate() + 1);
    const tomorrowStr = tomorrowBKK.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
    const tomorrowUTC = new Date(`${tomorrowStr}T00:00:00+07:00`).toISOString();

    supabase
      .from("off_peak_slots")
      .select("id, starts_at, booked_count, max_bookings")
      .eq("provider_id", slot.providerId)
      .eq("service_id",  slot.serviceId)
      .eq("is_active",   true)
      .gte("starts_at",  tomorrowUTC)
      .order("starts_at")
      .then(({ data }) => {
        setTimeSlots((data ?? []).map(s => ({
          id:       s.id,
          startsAt: s.starts_at,
          booked:   s.booked_count >= s.max_bookings,
        })));
        setLoadingSlots(false);
      });
  }, [slot]);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const availableDates = useMemo(() => {
    const s = new Set<string>();
    timeSlots.forEach(ts => { if (!ts.booked) s.add(toBKKDateStr(ts.startsAt)); });
    return s;
  }, [timeSlots]);

  const daySlots = useMemo(() => {
    if (!selectedDate) return [];
    return timeSlots.filter(ts => toBKKDateStr(ts.startsAt) === selectedDate);
  }, [timeSlots, selectedDate]);

  const selectedTimeSlot = timeSlots.find(ts => ts.id === selectedSlotId);
  const pet              = MOCK_PETS.find(p => p.id === selectedPet);
  const save             = slot ? slot.originalPrice - slot.dealPrice : 0;

  const dateLabel = selectedTimeSlot
    ? new Date(selectedTimeSlot.startsAt).toLocaleDateString("en-GB", {
        timeZone: "Asia/Bangkok", weekday: "short", day: "numeric", month: "short", year: "numeric",
      }) + " · " + formatBKKTime(selectedTimeSlot.startsAt)
    : "—";

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  // Clear slot selection when date changes
  useEffect(() => { setSelectedSlotId(null); }, [selectedDate]);

  // ── Claim slot + proceed to payment ─────────────────────────────────────────
  const handleProceedToPayment = async () => {
    if (!selectedSlotId || !selectedTimeSlot || !slot || paying) return;
    setPaying(true);
    setPayError(null);

    // 1. Atomically claim the slot via RPC
    const { data: claimResult, error: claimError } = await supabase
      .rpc("claim_off_peak_slot", { p_slot_id: selectedSlotId });

    if (claimError || !claimResult?.success) {
      const code = claimResult?.error ?? "claim_failed";
      const msgMap: Record<string, string> = {
        slot_full:         T.errSlotFull,
        slot_today_or_past: T.errSlotPast,
        slot_not_found:    T.errSlotNotFound,
        slot_inactive:     T.errSlotNotFound,
      };
      setPayError(msgMap[code] ?? T.errClaimFailed);
      // Mark slot as booked in local state so UI updates immediately
      setTimeSlots(prev =>
        prev.map(ts => ts.id === selectedSlotId ? { ...ts, booked: true } : ts)
      );
      setSelectedSlotId(null);
      setPaying(false);
      return;
    }

    // 2. Create payment charge
    try {
      const res = await fetch("/api/payment/create-charge", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:      slot.dealPrice,
          currency:    "THB",
          description: `${slot.serviceName} · ${slot.shopName}`,
          slotId:      selectedSlotId,
          scheduledAt: selectedTimeSlot.startsAt,
          petName:     pet?.name ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setPayError(data.error ?? "Payment setup failed"); setPaying(false); return; }
      sessionStorage.setItem("pawtal_charge", JSON.stringify({
        chargeId:         data.chargeId,
        qrImageUrl:       data.qrImageUrl,
        amount:           data.amount,
        expiresAt:        data.expiresAt,
        bookingId:        data.bookingId ?? null,
        bookingReference: data.bookingReference ?? null,
      }));
      router.push("/payment");
    } catch {
      setPayError(T.networkError);
      setPaying(false);
    }
  };

  // ── Loading / Error states ────────────────────────────────────────────────────
  if (loadingSlot) return (
    <div className="book-page">
      <CustomerNav />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#9ec9e0", fontSize: 15 }}>
        {T.loading}
      </div>
    </div>
  );

  if (slotError || !slot) return (
    <div className="book-page">
      <CustomerNav />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "60vh", gap: 12 }}>
        <div style={{ color: "#dc2626", fontWeight: 600 }}>{T.notFound}</div>
        <Link href="/deals" style={{ color: "#17A8FF", fontSize: 14 }}>{T.backToDeals}</Link>
      </div>
    </div>
  );

  return (
    <div className="book-page">
      <CustomerNav />

      <div className="book-back-bar">
        <Link href="/deals" className="book-back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to deals
        </Link>
      </div>

      <div className="book-layout">

        {/* ── LEFT ── */}
        <div className="book-main">

          {/* 1 — Shop cover */}
          <div className="book-cover">
            <div className="book-cover-bg" />
            <div className="book-cover-discount">-{slot.discount}%<span> {T.offPeak}</span></div>
            <div className="book-cover-info">
              <h1 className="book-cover-name">{slot.shopName}</h1>
              <div className="book-cover-meta">
                <span className="book-cover-stars">★ {slot.rating.toFixed(1)}</span>
                <span className="book-cover-reviews">({slot.reviews} {T.reviews})</span>
                <span className="book-cover-sep">·</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{slot.area}</span>
                {slot.isVerified && (
                  <span className="book-cover-verified">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
                    </svg>
                    {T.verified}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2 — About */}
          <div className="book-card">
            <h2 className="book-section-title">{T.aboutShop}</h2>
            <p className="book-about-desc">{slot.bio || `${slot.shopName} offers premium services in ${slot.area}, Bangkok.`}</p>
            <div className="book-contact-list">
              <div className="book-contact-row">
                <div className="book-contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <div className="book-contact-label">{T.callUs}</div>
                  <div className="book-contact-val">{slot.phone}</div>
                </div>
              </div>
              <div className="book-contact-row">
                <div className="book-contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <div className="book-contact-label">{T.address}</div>
                  <div className="book-contact-val">{slot.address}</div>
                </div>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(slot.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="book-directions-btn"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              {T.getDirections}
            </a>
          </div>

          {/* 3 — Select Pet */}
          <div className="book-card">
            <div className="book-section-row">
              <h2 className="book-section-title">{T.selectPet}</h2>
              <button className="book-add-pet-btn">{T.addNewPet}</button>
            </div>
            <div className="book-pet-grid">
              {MOCK_PETS.map(p => (
                <button
                  key={p.id}
                  className={`book-pet-card${selectedPet === p.id ? " selected" : ""}`}
                  onClick={() => setSelectedPet(p.id)}
                >
                  <div className="book-pet-avatar" style={{ background: p.bg }}>{p.initials}</div>
                  <div className="book-pet-name">{p.name}</div>
                  <div className="book-pet-breed">{p.breed}</div>
                  {selectedPet === p.id && (
                    <div className="book-pet-check">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
              <button className="book-pet-card new">
                <div className="book-pet-new-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                </div>
                <div className="book-pet-name" style={{ color: "#9ec9e0" }}>{T.newPet}</div>
              </button>
            </div>
          </div>

          {/* 4 — Date & Slots */}
          <div className="book-card">
            <h2 className="book-section-title">{T.pickDateTime}</h2>
            {!loadingSlots && timeSlots.length === 0 ? (
              <div className="book-slots-empty" style={{ padding: "24px 0" }}>{T.noSlotsAvailable}</div>
            ) : (
              <div className="book-dateslot-wrap">
                <Calendar
                  year={calYear} month={calMonth}
                  selectedDate={selectedDate}
                  availableDates={availableDates}
                  onSelectDate={d => setSelectedDate(d)}
                  onPrev={prevMonth} onNext={nextMonth}
                />
                <div className="book-slots-wrap">
                  {loadingSlots ? (
                    <div className="book-slots-title">{T.loadingSlots}</div>
                  ) : (
                    <>
                      <div className="book-slots-title">
                        {selectedDate
                          ? `${T.availableSlots} ${new Date(selectedDate + "T00:00:00+07:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                          : T.selectDate}
                      </div>
                      {selectedDate && daySlots.length === 0 && (
                        <div className="book-slots-empty">{T.noSlots}</div>
                      )}
                      <div className="book-slots-grid">
                        {daySlots.map(ts => (
                          <button
                            key={ts.id}
                            disabled={ts.booked}
                            className={[
                              "book-slot",
                              ts.booked ? "booked" : "",
                              selectedSlotId === ts.id && !ts.booked ? "selected" : "",
                            ].join(" ").trim()}
                            onClick={() => !ts.booked && setSelectedSlotId(ts.id)}
                          >
                            {ts.booked ? T.booked : formatBKKTime(ts.startsAt)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="book-sidebar">

          <div className="book-summary-card">
            <div className="book-summary-title">{T.bookingSummary}</div>
            <div className="book-summary-service">{slot.serviceName}</div>
            <div className="book-summary-shop">{T.at} {slot.shopName}</div>

            <div className="book-summary-rows">
              <div className="book-summary-row">
                <div className="book-summary-row-icon" style={{ background: "#e6f4fc" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#17A8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div>
                  <div className="book-summary-row-label">{T.dateTime}</div>
                  <div className="book-summary-row-val">
                    {selectedTimeSlot
                      ? dateLabel
                      : <span style={{ color: "#c0d8e8" }}>{T.notSelected}</span>}
                  </div>
                </div>
              </div>
              <div className="book-summary-row">
                <div className="book-summary-row-icon" style={{ background: "#e6f4fc" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#17A8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <div>
                  <div className="book-summary-row-label">{T.pet}</div>
                  <div className="book-summary-row-val">
                    {pet ? `${pet.name} (${pet.breed})` : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="book-summary-pricing">
              <div className="book-pricing-row">
                <span>{T.standardRate}</span>
                <span>฿{slot.originalPrice.toLocaleString()}</span>
              </div>
              <div className="book-pricing-row deal">
                <span>{T.dealApplied}</span>
                <span>−฿{save.toLocaleString()}</span>
              </div>
              <div className="book-pricing-divider" />
              <div className="book-pricing-total">
                <span>{T.total}</span>
                <span className="book-pricing-total-amount">฿{slot.dealPrice.toLocaleString()}</span>
              </div>
            </div>

            <button
              className={`book-proceed-btn${selectedDate && selectedSlotId ? " ready" : ""}`}
              onClick={handleProceedToPayment}
              disabled={!selectedDate || !selectedSlotId || paying}
            >
              {paying ? T.proceeding : T.proceed}
              {!paying && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
            </button>
            {payError && (
              <div style={{ color: "#dc2626", fontSize: "13px", marginTop: "8px", textAlign: "center", lineHeight: 1.4 }}>
                {payError}
              </div>
            )}

            <div className="book-secure-note">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {T.secureNote}
            </div>
          </div>

          <div className="book-help-card">
            <div className="book-help-header">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#17A8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              {T.needHelp}
            </div>
            <p className="book-help-body">
              {T.helpDesc}{" "}
              <a href={`tel:${T.helpPhone.replace(/\s/g, "")}`} className="book-help-phone">{T.helpPhone}</a>
            </p>
          </div>

        </aside>

      </div>
    </div>
  );
}

// ── Page export (Suspense for useSearchParams) ────────────────────────────────
export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="book-page">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#9ec9e0", fontSize: 15 }}>
          Loading…
        </div>
      </div>
    }>
      <BookInner />
    </Suspense>
  );
}
