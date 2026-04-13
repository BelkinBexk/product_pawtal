"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import CustomerNav from "@/components/CustomerNav";
import { getPetById, upsertPet, PET_TYPES, PET_EMOJI, AVATAR_COLORS, type Pet, type PetType } from "@/services/petStore";

export default function EditPetPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form,   setForm]   = useState<Pet | null>(null);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const pet = getPetById(id);
    if (!pet) { setNotFound(true); return; }
    setForm(pet);
  }, [id]);

  const set = (k: string, v: unknown) => setForm(f => f ? { ...f, [k]: v } : f);

  const handleSave = () => {
    if (!form || !form.name.trim()) return;
    setSaving(true);
    upsertPet(form);
    router.push("/pets");
  };

  if (notFound) return (
    <div className="petform-page">
      <CustomerNav />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12 }}>
        <div style={{ fontSize: 48 }}>🐾</div>
        <div style={{ fontWeight: 600, color: "#dc2626" }}>Pet not found</div>
        <Link href="/pets" style={{ color: "#17A8FF", fontSize: 14 }}>Back to My Pets</Link>
      </div>
    </div>
  );

  if (!form) return null;

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
            <h1 className="petform-title">Edit {form.name}</h1>
            <p className="petform-subtitle">Update your pet's profile details.</p>
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
                    onClick={() => set("type", t as PetType)}>
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
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>

      </div>
    </div>
  );
}
