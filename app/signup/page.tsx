"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LanguageContext";

const EN = {
  badge: "For Pet Owners", headline: "Today's off-peak deals near you",
  sub: "Premium grooming & care at up to 40% off — only during quiet hours. Book in seconds, pay upfront, love your pet more.",
  footer: "© 2026 Pawtal · Sukhumvit, Bangkok",
  step1Label: "Your Account", step2Label: "Your Pet",
  title1: "Create Account", sub1: "Join Pawtal and start discovering off-peak deals near you.",
  firstName: "First Name", lastName: "Last Name", email: "Email", password: "Password",
  area: "Location / Area", selectArea: "Select your area…",
  pdpa: "I agree to Pawtal's Privacy Policy and consent to the collection and use of my personal data in accordance with the PDPA.",
  next: "Next →", alreadyAccount: "Already have an account?", logIn: "Log in",
  title2: "Tell us about your pet",
  sub2: "Pet information is required to ensure safe and appropriate care during every service.",
  petName: "Pet Name", petType: "Pet Type", selectPetType: "Select…",
  breed: "Breed", gender: "Gender", weight: "Weight (kg)", notes: "Notes",
  optional: "(optional)", notesPlaceholder: "Allergies, special needs, temperament…",
  vaccinationConsent: "I confirm that my pet is up-to-date on vaccinations required for grooming and pet care services.",
  petConsent: "I consent to Pawtal sharing my pet's information with service providers for the purpose of delivering booked services",
  petConsentLink: "Pet Service Consent",
  creating: "Creating account…", createAccount: "Create Account →", back: "← Back",
  errFirstName: "Please enter First Name.", errLastName: "Please enter Last Name.",
  errEmail: "Please enter Email.", errEmailFormat: "Please enter Email correctly.",
  errPassword: "Please enter Password.", errPasswordMin: "Please enter Password correctly (min. 8 characters).",
  errArea: "Please select Location / Area.", errPdpa: "Please agree to the Privacy Policy and PDPA consent.",
  errPetName: "Please enter Pet Name.", errPetType: "Please select Pet Type.",
  errBreed: "Please enter Breed.", errGender: "Please select Gender.",
  errWeight: "Please enter Weight.", errVaccinated: "Please confirm your pet's vaccination status.",
  errPetConsent: "Please agree to the Pet Service Consent.",
  errEmailTaken: "This email is already registered.", errGeneral: "Please enter field correctly.",
};
const TH = {
  badge: "สำหรับเจ้าของสัตว์เลี้ยง", headline: "ดีลออฟพีคใกล้คุณวันนี้",
  sub: "บริการกรูมมิ่งและดูแลสัตว์เลี้ยงลดสูงสุด 40% — เฉพาะช่วงเวลาว่างเท่านั้น จองได้ในไม่กี่วินาที ชำระล่วงหน้า รักสัตว์เลี้ยงของคุณมากขึ้น",
  footer: "© 2026 Pawtal · สุขุมวิท, กรุงเทพฯ",
  step1Label: "บัญชีของคุณ", step2Label: "สัตว์เลี้ยงของคุณ",
  title1: "สร้างบัญชี", sub1: "สมัครสมาชิก Pawtal เพื่อค้นหาดีลออฟพีคใกล้คุณ",
  firstName: "ชื่อ", lastName: "นามสกุล", email: "อีเมล", password: "รหัสผ่าน",
  area: "พื้นที่ / บริเวณ", selectArea: "เลือกพื้นที่…",
  pdpa: "ฉันยอมรับนโยบายความเป็นส่วนตัวของ Pawtal และยินยอมให้เก็บรวบรวมและใช้ข้อมูลส่วนบุคคลของฉันตาม PDPA",
  next: "ถัดไป →", alreadyAccount: "มีบัญชีแล้ว?", logIn: "เข้าสู่ระบบ",
  title2: "บอกเราเกี่ยวกับสัตว์เลี้ยงของคุณ",
  sub2: "ข้อมูลสัตว์เลี้ยงเป็นสิ่งจำเป็นเพื่อให้การดูแลที่ปลอดภัยและเหมาะสมในทุกบริการ",
  petName: "ชื่อสัตว์เลี้ยง", petType: "ประเภทสัตว์เลี้ยง", selectPetType: "เลือก…",
  breed: "สายพันธุ์", gender: "เพศ", weight: "น้ำหนัก (กก.)", notes: "หมายเหตุ",
  optional: "(ไม่บังคับ)", notesPlaceholder: "อาการแพ้ ความต้องการพิเศษ นิสัย…",
  vaccinationConsent: "ฉันยืนยันว่าสัตว์เลี้ยงของฉันได้รับวัคซีนที่จำเป็นสำหรับบริการกรูมมิ่งและดูแลสัตว์เลี้ยงครบถ้วน",
  petConsent: "ฉันยินยอมให้ Pawtal แชร์ข้อมูลสัตว์เลี้ยงของฉันกับผู้ให้บริการเพื่อการให้บริการที่จองไว้",
  petConsentLink: "ความยินยอมบริการสัตว์เลี้ยง",
  creating: "กำลังสร้างบัญชี…", createAccount: "สร้างบัญชี →", back: "← กลับ",
  errFirstName: "กรุณากรอกชื่อ", errLastName: "กรุณากรอกนามสกุล",
  errEmail: "กรุณากรอกอีเมล", errEmailFormat: "กรุณากรอกอีเมลให้ถูกต้อง",
  errPassword: "กรุณากรอกรหัสผ่าน", errPasswordMin: "กรุณากรอกรหัสผ่านให้ถูกต้อง (อย่างน้อย 8 ตัวอักษร)",
  errArea: "กรุณาเลือกพื้นที่", errPdpa: "กรุณายอมรับนโยบายความเป็นส่วนตัวและ PDPA",
  errPetName: "กรุณากรอกชื่อสัตว์เลี้ยง", errPetType: "กรุณาเลือกประเภทสัตว์เลี้ยง",
  errBreed: "กรุณากรอกสายพันธุ์", errGender: "กรุณาเลือกเพศ",
  errWeight: "กรุณากรอกน้ำหนัก", errVaccinated: "กรุณายืนยันสถานะการฉีดวัคซีนของสัตว์เลี้ยง",
  errPetConsent: "กรุณายอมรับความยินยอมบริการสัตว์เลี้ยง",
  errEmailTaken: "อีเมลนี้ถูกลงทะเบียนแล้ว", errGeneral: "กรุณากรอกข้อมูลให้ถูกต้อง",
};

const LOCATIONS = ["Sukhumvit", "Thonglor", "Asok", "Phrom Phong", "Ekkamai", "On Nut"];
const PET_TYPES = ["Dog", "Cat", "Rabbit", "Bird", "Other"];
const GENDERS = ["Male", "Female", "Unknown"];

const PREVIEW_DEALS = [
  {
    name: "Happy Paws Grooming",
    meta: "Bath & Full Groom · Sukhumvit 39",
    old: "฿650", price: "฿390", discount: "-40%",
    svg: `<svg viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="10" fill="#d7f0e4"/><circle cx="22" cy="22" r="14" fill="#b2e8cd"/><path d="M16 26c0-3 1.5-4.5 4-6s3.5-2 3.5-3.5c0-1.5-1-3-2.5-3s-1.5 1-1.5 3" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/><circle cx="30" cy="17" r="3" fill="#1a7a4a"/><path d="M18 26c.5-1.5 2-3 3-3s2.5 1.5 3 3" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/></svg>`,
  },
  {
    name: "Paw & Relax Spa",
    meta: "Aromatherapy Bath · Thonglor",
    old: "฿800", price: "฿560", discount: "-30%",
    svg: `<svg viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="10" fill="#f0e8ff"/><circle cx="22" cy="22" r="14" fill="#ddd0ff"/><ellipse cx="22" cy="24" rx="7" ry="6" fill="#6a3fbf"/><ellipse cx="16" cy="17" rx="3" ry="4" fill="#6a3fbf"/><ellipse cx="28" cy="17" rx="3" ry="4" fill="#6a3fbf"/><circle cx="19" cy="23" r="1.5" fill="#fff"/><circle cx="25" cy="23" r="1.5" fill="#fff"/><path d="M19 27 Q22 29 25 27" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>`,
  },
  {
    name: "Furever Friends",
    meta: "Day Boarding · Phrom Phong",
    old: "฿500", price: "฿350", discount: "-30%",
    svg: `<svg viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="10" fill="#fff3cd"/><circle cx="22" cy="22" r="14" fill="#ffe8a0"/><ellipse cx="16" cy="21" rx="4.5" ry="5" fill="#c48a00"/><ellipse cx="28" cy="21" rx="4.5" ry="5" fill="#c48a00"/><rect x="14" y="23" width="16" height="8" rx="3" fill="#c48a00"/><circle cx="18" cy="20" r="2" fill="#fff3cd"/><circle cx="26" cy="20" r="2" fill="#fff3cd"/><circle cx="18.5" cy="20.5" r="1" fill="#333"/><circle cx="26.5" cy="20.5" r="1" fill="#333"/></svg>`,
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [lang] = useLang();
  const T = lang === "en" ? EN : TH;

  // Step tracking
  const [step, setStep] = useState<1 | 2>(1);

  // Page 1 — required fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [area, setArea]           = useState("");
  const [pdpa, setPdpa]           = useState(false);

  // Page 2 — pet details
  const [petName, setPetName]       = useState("");
  const [petType, setPetType]       = useState("");
  const [breed, setBreed]           = useState("");
  const [gender, setGender]         = useState("");
  const [weight, setWeight]         = useState("");
  const [notes, setNotes]           = useState("");
  const [vaccinated, setVaccinated] = useState(false);
  const [petConsent, setPetConsent] = useState(false);

  const [loading, setLoading] = useState(false);

  // Per-field errors
  const [errs, setErrs] = useState<Record<string, string>>({});
  const setFieldErr = (field: string, msg: string) =>
    setErrs(prev => ({ ...prev, [field]: msg }));
  const clearFieldErr = (field: string) =>
    setErrs(prev => { const n = { ...prev }; delete n[field]; return n; });

  // ── Step 1 — validate only, no account created yet ──────────────────────
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrs: Record<string, string> = {};

    if (!firstName.trim()) newErrs.firstName = T.errFirstName;
    if (!lastName.trim())  newErrs.lastName  = T.errLastName;
    if (!email.trim())     newErrs.email     = T.errEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrs.email = T.errEmailFormat;
    if (!password.trim())  newErrs.password  = T.errPassword;
    else if (password.length < 8) newErrs.password = T.errPasswordMin;
    if (!area)             newErrs.area      = T.errArea;
    if (!pdpa)             newErrs.pdpa      = T.errPdpa;

    if (Object.keys(newErrs).length > 0) { setErrs(newErrs); return; }
    setErrs({});
    setStep(2);
  };

  // ── Step 2 submit — create account + save pet details ───────────────────
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrs: Record<string, string> = {};
    if (!petName.trim()) newErrs.petName    = "Please enter Pet Name.";
    if (!petType)        newErrs.petType    = "Please select Pet Type.";
    if (!breed.trim())   newErrs.breed      = "Please enter Breed.";
    if (!gender)         newErrs.gender     = "Please select Gender.";
    if (!weight)         newErrs.weight     = "Please enter Weight.";
    if (!vaccinated)     newErrs.vaccinated = "Please confirm your pet's vaccination status.";
    if (!petConsent)     newErrs.petConsent = "Please agree to the Pet Service Consent.";
    if (Object.keys(newErrs).length > 0) { setErrs(newErrs); return; }

    setErrs({});
    setLoading(true);

    // Create the Supabase account now
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "customer", first_name: firstName, last_name: lastName },
      },
    });

    if (signUpError) {
      setLoading(false);
      if (signUpError.message.toLowerCase().includes("already")) {
        setStep(1);
        setErrs({ email: "This email is already registered." });
      } else {
        setStep(1);
        setErrs({ email: "Please enter field correctly." });
      }
      return;
    }

    if (data.user) {
      // Update area on customers row (trigger doesn't write area)
      await supabase.from("customers").update({ area }).eq("user_id", data.user.id);

      // Save pet details
      const { data: customer } = await supabase
        .from("customers").select("id").eq("user_id", data.user.id).single();

      if (customer) {
        await supabase.from("pets").insert({
          customer_id: customer.id,
          name: petName.trim(),
          species: petType.toLowerCase(),
          breed: breed.trim(),
          gender: gender.toLowerCase(),
          weight_kg: parseFloat(weight),
          medical_notes: notes.trim() || null,
        });
      }
    }

    setLoading(false);
    router.push("/deals");
  };

  const LeftPanel = () => (
    <div className="login-left">
      <div className="login-left-logo">Pawtal</div>
      <div className="login-left-badge">
        <div className="login-left-badge-dot" />
        For Pet Owners
      </div>
      <h1 className="login-left-h1">Today&apos;s off-peak deals near you</h1>
      <p className="login-left-sub">
        Premium grooming &amp; care at up to 40% off — only during quiet hours. Book in seconds, pay upfront, love your pet more.
      </p>
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
      <div className="login-left-footer">© 2026 Pawtal · Sukhumvit, Bangkok</div>
    </div>
  );

  return (
    <div className="login-layout">
      <LeftPanel />
      <div className="login-right">
        <div className="login-card" style={{ maxWidth: 520 }}>

          {/* Step indicator */}
          <div className="su-steps">
            <div className={`su-step ${step >= 1 ? "active" : ""}`}>
              <div className="su-step-num">1</div>
              <div className="su-step-label">Your Account</div>
            </div>
            <div className="su-step-line" />
            <div className={`su-step ${step >= 2 ? "active" : ""}`}>
              <div className="su-step-num">2</div>
              <div className="su-step-label">Your Pet</div>
            </div>
          </div>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <h1 className="login-card-title" style={{ marginBottom: 6 }}>Create Account</h1>
              <p className="login-card-sub">Join Pawtal and start discovering off-peak deals near you.</p>

              <form onSubmit={handleStep1}>
                {/* Name row */}
                <div className="su-row">
                  <div className="login-field">
                    <label htmlFor="su-fname">First Name</label>
                    <input id="su-fname" type="text" className={`login-input${errs.firstName ? " su-input-error" : ""}`} placeholder="Somchai"
                      value={firstName} onChange={e => { setFirstName(e.target.value); clearFieldErr("firstName"); }} />
                    {errs.firstName && <div className="su-field-error">{errs.firstName}</div>}
                  </div>
                  <div className="login-field">
                    <label htmlFor="su-lname">Last Name</label>
                    <input id="su-lname" type="text" className={`login-input${errs.lastName ? " su-input-error" : ""}`} placeholder="Jaidee"
                      value={lastName} onChange={e => { setLastName(e.target.value); clearFieldErr("lastName"); }} />
                    {errs.lastName && <div className="su-field-error">{errs.lastName}</div>}
                  </div>
                </div>

                {/* Email */}
                <div className="login-field">
                  <label htmlFor="su-email">Email</label>
                  <input id="su-email" type="text" className={`login-input${errs.email ? " su-input-error" : ""}`} placeholder="you@example.com"
                    value={email} onChange={e => { setEmail(e.target.value); clearFieldErr("email"); }} autoComplete="email" />
                  {errs.email && <div className="su-field-error">{errs.email}</div>}
                </div>

                {/* Password */}
                <div className="login-field">
                  <label htmlFor="su-pw">Password</label>
                  <div className="login-input-wrap">
                    <input id="su-pw" type={showPw ? "text" : "password"} className={`login-input${errs.password ? " su-input-error" : ""}`}
                      placeholder="Min. 8 characters"
                      value={password} onChange={e => { setPassword(e.target.value); clearFieldErr("password"); }} />
                    <button type="button" className="login-eye" onClick={() => setShowPw(v => !v)}>
                      {showPw
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {errs.password && <div className="su-field-error">{errs.password}</div>}
                </div>

                {/* Location */}
                <div className="login-field">
                  <label htmlFor="su-area">Location / Area</label>
                  <select id="su-area" className={`login-input su-select${errs.area ? " su-input-error" : ""}`}
                    value={area} onChange={e => { setArea(e.target.value); clearFieldErr("area"); }}>
                    <option value="">Select your area…</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {errs.area && <div className="su-field-error">{errs.area}</div>}
                </div>

                {/* PDPA */}
                <div className="su-pdpa">
                  <input id="su-pdpa" type="checkbox" className="su-checkbox"
                    checked={pdpa} onChange={e => { setPdpa(e.target.checked); clearFieldErr("pdpa"); }} />
                  <label htmlFor="su-pdpa" className="su-pdpa-label">
                    I agree to Pawtal&apos;s{" "}
                    <a href="#" className="su-pdpa-link">Privacy Policy</a> and consent to the collection and use of my personal data in accordance with the{" "}
                    <a href="#" className="su-pdpa-link">PDPA</a>.
                  </label>
                </div>
                {errs.pdpa && <div className="su-field-error" style={{ marginTop: -8, marginBottom: 12 }}>{errs.pdpa}</div>}

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Creating account…" : "Next →"}
                </button>
              </form>

              <div className="su-login-hint">
                Already have an account?{" "}
                <Link href="/login" className="su-login-link">Log in</Link>
              </div>
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              <h1 className="login-card-title" style={{ marginBottom: 6 }}>Tell us about your pet</h1>
              <p className="login-card-sub">Pet information is required to ensure safe and appropriate care during every service.</p>

              <form onSubmit={handleStep2}>
                {/* Pet Name + Type */}
                <div className="su-row">
                  <div className="login-field">
                    <label htmlFor="su-petname">Pet Name</label>
                    <input id="su-petname" type="text" className={`login-input${errs.petName ? " su-input-error" : ""}`} placeholder="Mochi"
                      value={petName} onChange={e => { setPetName(e.target.value); clearFieldErr("petName"); }} />
                    {errs.petName && <div className="su-field-error">{errs.petName}</div>}
                  </div>
                  <div className="login-field">
                    <label htmlFor="su-pettype">Pet Type</label>
                    <select id="su-pettype" className={`login-input su-select${errs.petType ? " su-input-error" : ""}`}
                      value={petType} onChange={e => { setPetType(e.target.value); clearFieldErr("petType"); }}>
                      <option value="">Select…</option>
                      {PET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errs.petType && <div className="su-field-error">{errs.petType}</div>}
                  </div>
                </div>

                {/* Breed + Gender */}
                <div className="su-row">
                  <div className="login-field">
                    <label htmlFor="su-breed">Breed</label>
                    <input id="su-breed" type="text" className={`login-input${errs.breed ? " su-input-error" : ""}`} placeholder="Shiba Inu"
                      value={breed} onChange={e => { setBreed(e.target.value); clearFieldErr("breed"); }} />
                    {errs.breed && <div className="su-field-error">{errs.breed}</div>}
                  </div>
                  <div className="login-field">
                    <label htmlFor="su-gender">Gender</label>
                    <select id="su-gender" className={`login-input su-select${errs.gender ? " su-input-error" : ""}`}
                      value={gender} onChange={e => { setGender(e.target.value); clearFieldErr("gender"); }}>
                      <option value="">Select…</option>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {errs.gender && <div className="su-field-error">{errs.gender}</div>}
                  </div>
                </div>

                {/* Weight */}
                <div className="login-field">
                  <label htmlFor="su-weight">Weight (kg)</label>
                  <input id="su-weight" type="number" min="0" step="0.1" className={`login-input${errs.weight ? " su-input-error" : ""}`}
                    placeholder="e.g. 8.5"
                    value={weight} onChange={e => { setWeight(e.target.value); clearFieldErr("weight"); }} />
                  {errs.weight && <div className="su-field-error">{errs.weight}</div>}
                </div>

                {/* Notes */}
                <div className="login-field">
                  <label htmlFor="su-notes">Notes <span style={{ fontWeight: 300, color: "#9ec9e0" }}>(optional)</span></label>
                  <textarea id="su-notes" className="login-input su-textarea"
                    placeholder="Allergies, special needs, temperament…"
                    value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                </div>

                {/* Vaccination + Consent */}
                <div className="su-consent-block">
                  <div className="su-pdpa">
                    <input id="su-vaccinated" type="checkbox" className="su-checkbox"
                      checked={vaccinated} onChange={e => { setVaccinated(e.target.checked); clearFieldErr("vaccinated"); }} />
                    <label htmlFor="su-vaccinated" className="su-pdpa-label">
                      I confirm that my pet is <strong>up-to-date on vaccinations</strong> required for grooming and pet care services.
                    </label>
                  </div>
                  {errs.vaccinated && <div className="su-field-error" style={{ marginTop: 4 }}>{errs.vaccinated}</div>}

                  <div className="su-pdpa" style={{ marginTop: 12 }}>
                    <input id="su-petconsent" type="checkbox" className="su-checkbox"
                      checked={petConsent} onChange={e => { setPetConsent(e.target.checked); clearFieldErr("petConsent"); }} />
                    <label htmlFor="su-petconsent" className="su-pdpa-label">
                      I consent to Pawtal sharing my pet&apos;s information with service providers for the purpose of delivering booked services (<a href="#" className="su-pdpa-link">Pet Service Consent</a>).
                    </label>
                  </div>
                  {errs.petConsent && <div className="su-field-error" style={{ marginTop: 4 }}>{errs.petConsent}</div>}
                </div>

                <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: 24 }}>
                  {loading ? "Creating account…" : "Create Account →"}
                </button>

                <button type="button" className="login-create-btn" style={{ marginTop: 10 }}
                  onClick={() => { setErrs({}); setStep(1); }}>
                  ← Back
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
