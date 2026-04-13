"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const SERVICE_TYPES = ["Grooming", "Day Care", "Training", "Boarding", "Vet Checkup", "Dog Walking", "Pet Taxi", "Other"];
const LOCATIONS     = ["Sukhumvit", "Thonglor", "Asok", "Phrom Phong", "Ekkamai", "On Nut", "Other"];

export default function VendorSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 — personal
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);

  // Step 2 — business
  const [shopName,     setShopName]     = useState("");
  const [serviceType,  setServiceType]  = useState("");
  const [area,         setArea]         = useState("");
  const [address,      setAddress]      = useState("");

  // Step 3 — submit
  const [pdpa,    setPdpa]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // ── Step 1 validation ──────────────────────────────────────────────────────
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setStep(2);
  };

  // ── Step 2 validation ──────────────────────────────────────────────────────
  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!serviceType) { setError("Please select a service type."); return; }
    if (!area)        { setError("Please select your area."); return; }
    setStep(3);
  };

  // ── Step 3 submit — create account ────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!pdpa) { setError("You must agree to the PDPA consent to continue."); return; }

    setLoading(true);

    // 1. Create auth account — pass all data so the trigger creates a complete row
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role:         "provider",
          first_name:   firstName,
          last_name:    lastName,
          owner_name:   `${firstName} ${lastName}`,
          phone,
          shop_name:    shopName,
          service_type: serviceType.toLowerCase(),
          area,
          address,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    // 2. Update providers row in case trigger ran before metadata was available
    if (data.user) {
      await supabase
        .from("providers")
        .update({
          shop_name:    shopName,
          owner_name:   `${firstName} ${lastName}`,
          service_type: serviceType.toLowerCase(),
          area,
          address,
          phone,
        })
        .eq("user_id", data.user.id);
    }

    setLoading(false);
    router.push("/vendor/dashboard");
  };

  // ── Left panel ────────────────────────────────────────────────────────────
  const LeftPanel = () => (
    <div className="login-left">
      <div className="login-left-logo">Pawtal</div>
      <div className="login-left-badge">
        <div className="login-left-badge-dot" />
        For Vendors
      </div>
      <h1 className="login-left-h1">Start reaching thousands of pet owners today.</h1>
      <p className="login-left-sub">
        Free to list. No upfront fees. Set up in under 30 minutes and start receiving bookings from verified pet owners across Bangkok.
      </p>
      <div className="login-deal-list">
        {[
          { icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`, label: "Free to list — no upfront cost" },
          { icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`, label: "Payout to your bank in 3 days" },
          { icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`, label: "Manage everything from one dashboard" },
          { icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`, label: "Join 1,200+ vendors across Bangkok" },
        ].map((item) => (
          <div key={item.label} className="login-deal-card">
            <div className="vl-stat-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
            <div className="login-deal-info">
              <div className="login-deal-name" style={{ fontSize: 13 }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="login-left-footer">© 2026 Pawtal · Bangkok, Thailand</div>
    </div>
  );

  return (
    <div className="login-layout">
      <LeftPanel />

      <div className="login-right">
        <div className="login-card" style={{ maxWidth: 540 }}>

          {/* ── Step indicator ── */}
          <div className="su-steps" style={{ marginBottom: 28 }}>
            {[
              { n: 1, label: "Your Info" },
              { n: 2, label: "Business" },
              { n: 3, label: "Review" },
            ].map(({ n, label }, i) => (
              <div key={n} style={{ display: "contents" }}>
                <div className={`su-step${step >= n ? " active" : ""}`}>
                  <div className="su-step-num">{step > n ? "✓" : n}</div>
                  <div className="su-step-label">{label}</div>
                </div>
                {i < 2 && <div className="su-step-line" />}
              </div>
            ))}
          </div>

          {error && <div className="login-error">{error}</div>}

          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <>
              <h1 className="login-card-title" style={{ marginBottom: 6 }}>Your Information</h1>
              <p className="login-card-sub">Tell us about yourself — the person behind the business.</p>

              <form onSubmit={handleStep1}>
                <div className="su-row">
                  <div className="login-field">
                    <label htmlFor="vs-fname">First Name</label>
                    <input id="vs-fname" type="text" className="login-input" placeholder="Somchai"
                      value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div className="login-field">
                    <label htmlFor="vs-lname">Last Name</label>
                    <input id="vs-lname" type="text" className="login-input" placeholder="Jaidee"
                      value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="vs-phone">Phone Number</label>
                  <input id="vs-phone" type="tel" className="login-input" placeholder="08X-XXX-XXXX"
                    value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>

                <div className="login-field">
                  <label htmlFor="vs-email">Email</label>
                  <input id="vs-email" type="email" className="login-input" placeholder="you@yourbusiness.com"
                    value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>

                <div className="login-field">
                  <label htmlFor="vs-pw">Password</label>
                  <div className="login-input-wrap">
                    <input id="vs-pw" type={showPw ? "text" : "password"} className="login-input"
                      placeholder="Min. 8 characters"
                      value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" className="login-eye" onClick={() => setShowPw(v => !v)}>
                      {showPw
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>

                <button type="submit" className="login-btn">Continue →</button>
              </form>

              <div className="su-login-hint">
                Already have an account?{" "}
                <Link href="/vendor/login" className="su-login-link">Sign in</Link>
              </div>
            </>
          )}

          {/* ── Step 2: Business Info ── */}
          {step === 2 && (
            <>
              <h1 className="login-card-title" style={{ marginBottom: 6 }}>Your Business</h1>
              <p className="login-card-sub">Tell us about your shop so customers can find you.</p>

              <form onSubmit={handleStep2}>
                <div className="login-field">
                  <label htmlFor="vs-shop">Business / Shop Name</label>
                  <input id="vs-shop" type="text" className="login-input" placeholder="Happy Paws Grooming"
                    value={shopName} onChange={e => setShopName(e.target.value)} required />
                </div>

                <div className="login-field">
                  <label htmlFor="vs-stype">Service Type</label>
                  <select id="vs-stype" className="login-input su-select"
                    value={serviceType} onChange={e => setServiceType(e.target.value)}>
                    <option value="">Select your main service…</option>
                    {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="su-row">
                  <div className="login-field">
                    <label htmlFor="vs-area">Area / Location</label>
                    <select id="vs-area" className="login-input su-select"
                      value={area} onChange={e => setArea(e.target.value)}>
                      <option value="">Select area…</option>
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="vs-addr">Address</label>
                  <textarea id="vs-addr" className="login-input su-textarea"
                    placeholder="e.g. 123/45 Sukhumvit Soi 39, Khlong Toei Nuea, Watthana, Bangkok 10110"
                    value={address} onChange={e => setAddress(e.target.value)} rows={3} required />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" className="login-create-btn" style={{ marginTop: 0 }}
                    onClick={() => { setError(""); setStep(1); }}>
                    ← Back
                  </button>
                  <button type="submit" className="login-btn" style={{ marginTop: 0 }}>
                    Review →
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <>
              <h1 className="login-card-title" style={{ marginBottom: 6 }}>Review & Submit</h1>
              <p className="login-card-sub">Please confirm your details before creating your account.</p>

              <form onSubmit={handleSubmit}>
                {/* Personal details */}
                <div className="vsu-review-card">
                  <div className="vsu-review-header">
                    <span className="vsu-review-title">Personal Information</span>
                    <button type="button" className="vsu-review-edit" onClick={() => { setError(""); setStep(1); }}>Edit</button>
                  </div>
                  <div className="vsu-review-grid">
                    <div className="vsu-review-item">
                      <div className="vsu-review-lbl">Full Name</div>
                      <div className="vsu-review-val">{firstName} {lastName}</div>
                    </div>
                    <div className="vsu-review-item">
                      <div className="vsu-review-lbl">Phone</div>
                      <div className="vsu-review-val">{phone}</div>
                    </div>
                    <div className="vsu-review-item" style={{ gridColumn: "1 / -1" }}>
                      <div className="vsu-review-lbl">Email</div>
                      <div className="vsu-review-val">{email}</div>
                    </div>
                  </div>
                </div>

                {/* Business details */}
                <div className="vsu-review-card">
                  <div className="vsu-review-header">
                    <span className="vsu-review-title">Business Information</span>
                    <button type="button" className="vsu-review-edit" onClick={() => { setError(""); setStep(2); }}>Edit</button>
                  </div>
                  <div className="vsu-review-grid">
                    <div className="vsu-review-item" style={{ gridColumn: "1 / -1" }}>
                      <div className="vsu-review-lbl">Shop Name</div>
                      <div className="vsu-review-val">{shopName}</div>
                    </div>
                    <div className="vsu-review-item">
                      <div className="vsu-review-lbl">Service Type</div>
                      <div className="vsu-review-val">{serviceType}</div>
                    </div>
                    <div className="vsu-review-item">
                      <div className="vsu-review-lbl">Area</div>
                      <div className="vsu-review-val">{area}</div>
                    </div>
                    <div className="vsu-review-item" style={{ gridColumn: "1 / -1" }}>
                      <div className="vsu-review-lbl">Address</div>
                      <div className="vsu-review-val">{address}</div>
                    </div>
                  </div>
                </div>

                {/* PDPA */}
                <div className="su-pdpa">
                  <input id="vs-pdpa" type="checkbox" className="su-checkbox"
                    checked={pdpa} onChange={e => setPdpa(e.target.checked)} />
                  <label htmlFor="vs-pdpa" className="su-pdpa-label">
                    I agree to Pawtal&apos;s{" "}
                    <a href="#" className="su-pdpa-link">Privacy Policy</a>,{" "}
                    <a href="#" className="su-pdpa-link">Vendor Terms</a>, and consent to the collection and use of my business data in accordance with the{" "}
                    <a href="#" className="su-pdpa-link">PDPA</a>.
                  </label>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" className="login-create-btn" style={{ marginTop: 0 }}
                    onClick={() => { setError(""); setStep(2); }}>
                    ← Back
                  </button>
                  <button type="submit" className="login-btn" style={{ marginTop: 0 }} disabled={loading}>
                    {loading ? "Creating account…" : "Create Vendor Account"}
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
