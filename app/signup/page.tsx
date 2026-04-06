"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

  // Page 2 — pet details (all optional)
  const [petName, setPetName]   = useState("");
  const [petType, setPetType]   = useState("");
  const [breed, setBreed]       = useState("");
  const [gender, setGender]     = useState("");
  const [weight, setWeight]     = useState("");
  const [notes, setNotes]       = useState("");

  const [userId, setUserId]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // ── Step 1 submit — create Supabase account ─────────────────────────────
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!area) {
      setError("Please select your location.");
      return;
    }
    if (!pdpa) {
      setError("You must agree to the PDPA consent to continue.");
      return;
    }

    setLoading(true);

    // signUp — trigger auto-creates customers row when role='customer'
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "customer",
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    // Update the customers row with area (trigger doesn't write area for customers)
    if (data.user) {
      setUserId(data.user.id);
      await supabase
        .from("customers")
        .update({ area })
        .eq("user_id", data.user.id);
    }

    setLoading(false);
    setStep(2);
  };

  // ── Step 2 submit — save pet details ────────────────────────────────────
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // If all pet fields are empty, just skip to deals
    const hasPetData = petName.trim() || petType;
    if (!hasPetData) {
      router.push("/deals");
      return;
    }

    if (!petName.trim()) {
      setError("Please enter your pet's name.");
      return;
    }
    if (!petType) {
      setError("Please select your pet type.");
      return;
    }

    setLoading(true);

    // Get the customer ID using the userId stored from step 1
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", userId!)
      .single();

    if (customer) {
      await supabase.from("pets").insert({
        customer_id: customer.id,
        name: petName.trim(),
        species: petType.toLowerCase(),
        breed: breed.trim() || null,
        gender: gender.toLowerCase() || "unknown",
        weight_kg: weight ? parseFloat(weight) : null,
        medical_notes: notes.trim() || null,
      });
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

          {error && <div className="login-error">{error}</div>}

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
                    <input id="su-fname" type="text" className="login-input" placeholder="Somchai"
                      value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div className="login-field">
                    <label htmlFor="su-lname">Last Name</label>
                    <input id="su-lname" type="text" className="login-input" placeholder="Jaidee"
                      value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                </div>

                {/* Email */}
                <div className="login-field">
                  <label htmlFor="su-email">Email</label>
                  <input id="su-email" type="email" className="login-input" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>

                {/* Password */}
                <div className="login-field">
                  <label htmlFor="su-pw">Password</label>
                  <div className="login-input-wrap">
                    <input id="su-pw" type={showPw ? "text" : "password"} className="login-input"
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

                {/* Location */}
                <div className="login-field">
                  <label htmlFor="su-area">Location / Area</label>
                  <select id="su-area" className="login-input su-select"
                    value={area} onChange={e => setArea(e.target.value)} required>
                    <option value="">Select your area…</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* PDPA */}
                <div className="su-pdpa">
                  <input id="su-pdpa" type="checkbox" className="su-checkbox"
                    checked={pdpa} onChange={e => setPdpa(e.target.checked)} />
                  <label htmlFor="su-pdpa" className="su-pdpa-label">
                    I agree to Pawtal&apos;s{" "}
                    <a href="#" className="su-pdpa-link">Privacy Policy</a> and consent to the collection and use of my personal data in accordance with the{" "}
                    <a href="#" className="su-pdpa-link">PDPA</a>.
                  </label>
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Creating account…" : "Create Account →"}
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
              <p className="login-card-sub">Optional — you can always add this later from your profile.</p>

              <form onSubmit={handleStep2}>
                {/* Pet Name + Type */}
                <div className="su-row">
                  <div className="login-field">
                    <label htmlFor="su-petname">Pet Name</label>
                    <input id="su-petname" type="text" className="login-input" placeholder="Mochi"
                      value={petName} onChange={e => setPetName(e.target.value)} />
                  </div>
                  <div className="login-field">
                    <label htmlFor="su-pettype">Pet Type</label>
                    <select id="su-pettype" className="login-input su-select"
                      value={petType} onChange={e => setPetType(e.target.value)}>
                      <option value="">Select…</option>
                      {PET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Breed + Gender */}
                <div className="su-row">
                  <div className="login-field">
                    <label htmlFor="su-breed">Breed</label>
                    <input id="su-breed" type="text" className="login-input" placeholder="Shiba Inu"
                      value={breed} onChange={e => setBreed(e.target.value)} />
                  </div>
                  <div className="login-field">
                    <label htmlFor="su-gender">Gender</label>
                    <select id="su-gender" className="login-input su-select"
                      value={gender} onChange={e => setGender(e.target.value)}>
                      <option value="">Select…</option>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                {/* Weight */}
                <div className="login-field">
                  <label htmlFor="su-weight">Weight (kg)</label>
                  <input id="su-weight" type="number" min="0" step="0.1" className="login-input"
                    placeholder="e.g. 8.5"
                    value={weight} onChange={e => setWeight(e.target.value)} />
                </div>

                {/* Notes */}
                <div className="login-field">
                  <label htmlFor="su-notes">Optional Notes</label>
                  <textarea id="su-notes" className="login-input su-textarea"
                    placeholder="Allergies, special needs, temperament…"
                    value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Saving…" : "Finish & Go to Pawtal 🐾"}
                </button>

                <button type="button" className="login-create-btn" style={{ marginTop: 10 }}
                  onClick={() => router.push("/deals")}>
                  Skip for now
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
