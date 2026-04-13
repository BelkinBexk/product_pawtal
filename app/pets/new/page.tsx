"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import { upsertPet, PET_TYPES, PET_EMOJI, AVATAR_COLORS, type PetType } from "@/services/petStore";

const EMPTY = {
  name: "", type: "Dog" as PetType, breed: "", age: "", weight: "",
  notes: "", vaccinationConsent: false, serviceConsent: false,
};

export default function NewPetPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    setSaving(true);
    upsertPet({ ...form, id: `pet-${Date.now()}` });
    router.push("/pets");
  };

  const avatarBg = AVATAR_COLORS[form.type].bg;

  return (
    <div className="petform-page">
      <CustomerNav />

      <div className="petform-container">
        {/* Back */}
        <Link href="/pets" className="book-back-btn" style={{ marginBottom: 28, display: "inline-flex" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to My Pets
        </Link>

        {/* Page header */}
        <div className="petform-header">
          <div className="petform-avatar-preview" style={{ background: avatarBg }}>
            {PET_EMOJI[form.type]}
          </div>
          <div>
            <h1 className="petform-title">Add a new pet</h1>
            <p className="petform-subtitle">Fill in your pet's details to use across all bookings.</p>
          </div>
        </div>

        <div className="petform-body">

          {/* ── Section: Basic Info ── */}
          <div className="petform-section">
            <div className="petform-section-title">Basic information</div>

            <div className="pets-field-group">
              <label className="pets-label">Pet name</label>
              <input className="pets-input petform-input" placeholder="e.g. Mochi"
                value={form.name} onChange={e => set("name", e.target.value)} />
            </div>

            <div className="pets-field-group">
              <label className="pets-label">Type</label>
              <div className="pets-type-pills">
                {PET_TYPES.map(t => (
                  <button key={t} className={`pets-type-pill${form.type === t ? " active" : ""}`}
                    onClick={() => set("type", t)}>
                    {PET_EMOJI[t]} {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="petform-row">
              <div className="pets-field-group">
                <label className="pets-label">Breed</label>
                <input className="pets-input petform-input" placeholder="e.g. Shih Tzu"
                  value={form.breed} onChange={e => set("breed", e.target.value)} />
              </div>
              <div className="pets-field-group" style={{ flex: "0 0 140px" }}>
                <label className="pets-label">Age (years)</label>
                <input className="pets-input petform-input" type="number" min="0" placeholder="e.g. 3"
                  value={form.age} onChange={e => set("age", e.target.value)} />
              </div>
              <div className="pets-field-group" style={{ flex: "0 0 140px" }}>
                <label className="pets-label">Weight (kg)</label>
                <input className="pets-input petform-input" type="number" min="0" step="0.1" placeholder="e.g. 4.2"
                  value={form.weight} onChange={e => set("weight", e.target.value)} />
              </div>
            </div>

            <div className="pets-field-group">
              <label className="pets-label">Notes <span style={{ color: "#9aabb8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
              <textarea className="pets-input petform-input pets-textarea"
                placeholder="Allergies, special needs, vet info, preferred products…"
                rows={3} value={form.notes} onChange={e => set("notes", e.target.value)} />
            </div>
          </div>

          {/* ── Section: Consents ── */}
          <div className="petform-section">
            <div className="petform-section-title">Consent & authorisation</div>
            <p className="petform-section-sub">These consents allow Pawtal partner shops to care for your pet safely and professionally.</p>

            <div className="petform-consent-card">
              <div className="petform-consent-icon">💉</div>
              <div className="petform-consent-body">
                <div className="petform-consent-title">Vaccination consent</div>
                <div className="petform-consent-desc">I confirm that this pet's core vaccinations are up to date and agree to provide vaccination records upon request by the service provider.</div>
              </div>
              <label className="petform-toggle">
                <input type="checkbox" checked={form.vaccinationConsent}
                  onChange={e => set("vaccinationConsent", e.target.checked)} />
                <span className="petform-toggle-track" />
              </label>
            </div>

            <div className="petform-consent-card">
              <div className="petform-consent-icon">🐾</div>
              <div className="petform-consent-body">
                <div className="petform-consent-title">Pet service consent</div>
                <div className="petform-consent-desc">I consent to my pet receiving grooming, veterinary, training, boarding, and other services through Pawtal-verified partner shops, and acknowledge that the provider is responsible for the service quality.</div>
              </div>
              <label className="petform-toggle">
                <input type="checkbox" checked={form.serviceConsent}
                  onChange={e => set("serviceConsent", e.target.checked)} />
                <span className="petform-toggle-track" />
              </label>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="petform-footer">
          <Link href="/pets" className="pets-btn-ghost" style={{ textDecoration: "none" }}>Cancel</Link>
          <button className="pets-btn-primary" onClick={handleSave} disabled={!form.name.trim() || saving}>
            {saving ? "Saving…" : "Save pet"}
          </button>
        </div>

      </div>
    </div>
  );
}
