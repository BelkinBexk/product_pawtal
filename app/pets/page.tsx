"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CustomerNav from "@/components/CustomerNav";
import { getPets, deletePet, PET_EMOJI, AVATAR_COLORS, type Pet } from "@/services/petStore";

export default function PetsPage() {
  const [pets,     setPets]     = useState<Pet[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { setPets(getPets()); }, []);

  const handleDelete = () => {
    if (!deleteId) return;
    deletePet(deleteId);
    setPets(getPets());
    setDeleteId(null);
  };

  const petToDelete = pets.find(p => p.id === deleteId);

  return (
    <div className="pets-page">
      <CustomerNav />

      <div className="pets-container-wide">

        {/* ── Header ── */}
        <div className="pets-header">
          <div>
            <h1 className="pets-h1">My Pets</h1>
            <p className="pets-sub">{pets.length} {pets.length === 1 ? "pet" : "pets"} registered</p>
          </div>
          <Link href="/pets/new" className="pets-btn-primary" style={{ textDecoration: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add pet
          </Link>
        </div>

        {/* ── List ── */}
        {pets.length === 0 ? (
          <div className="pets-empty">
            <div className="pets-empty-icon">🐾</div>
            <p className="pets-empty-title">No pets yet</p>
            <p className="pets-empty-sub">Add your first pet to get started with bookings.</p>
            <Link href="/pets/new" className="pets-btn-primary" style={{ textDecoration: "none" }}>Add my first pet</Link>
          </div>
        ) : (
          <div className="pets-list-wide">
            {/* Table header */}
            <div className="pets-table-head">
              <span style={{ flex: "0 0 56px" }} />
              <span style={{ flex: 2 }}>Pet</span>
              <span style={{ flex: 1 }}>Breed</span>
              <span style={{ flex: "0 0 72px" }}>Age</span>
              <span style={{ flex: "0 0 72px" }}>Weight</span>
              <span style={{ flex: "0 0 120px", textAlign: "center" }}>Consents</span>
              <span style={{ flex: 1 }}>Notes</span>
              <span style={{ flex: "0 0 96px" }} />
            </div>

            {pets.map(pet => (
              <div key={pet.id} className="pets-row">
                {/* Avatar */}
                <div style={{ flex: "0 0 56px" }}>
                  <div className="pets-row-avatar" style={{ background: AVATAR_COLORS[pet.type].bg }}>
                    {PET_EMOJI[pet.type]}
                  </div>
                </div>

                {/* Name + type */}
                <div style={{ flex: 2, minWidth: 0 }}>
                  <div className="pets-row-name">{pet.name}</div>
                  <span className="pets-card-type-badge" style={{ background: AVATAR_COLORS[pet.type].bg, color: AVATAR_COLORS[pet.type].text }}>
                    {pet.type}
                  </span>
                </div>

                {/* Breed */}
                <div style={{ flex: 1 }} className="pets-row-detail">{pet.breed || "—"}</div>

                {/* Age */}
                <div style={{ flex: "0 0 72px" }} className="pets-row-detail">
                  {pet.age ? `${pet.age} yr${pet.age !== "1" ? "s" : ""}` : "—"}
                </div>

                {/* Weight */}
                <div style={{ flex: "0 0 72px" }} className="pets-row-detail">
                  {pet.weight ? `${pet.weight} kg` : "—"}
                </div>

                {/* Consents */}
                <div style={{ flex: "0 0 120px", display: "flex", gap: 8, justifyContent: "center" }}>
                  <div className={`pets-consent-dot${pet.vaccinationConsent ? " yes" : " no"}`} title="Vaccination consent">
                    💉 {pet.vaccinationConsent ? "✓" : "✗"}
                  </div>
                  <div className={`pets-consent-dot${pet.serviceConsent ? " yes" : " no"}`} title="Service consent">
                    🐾 {pet.serviceConsent ? "✓" : "✗"}
                  </div>
                </div>

                {/* Notes */}
                <div style={{ flex: 1, minWidth: 0 }} className="pets-row-notes">{pet.notes || <span style={{ color: "#c8d8e4" }}>—</span>}</div>

                {/* Actions */}
                <div style={{ flex: "0 0 96px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <Link href={`/pets/${pet.id}/edit`} className="pets-action-btn edit" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </Link>
                  <button className="pets-action-btn delete" title="Delete" onClick={() => setDeleteId(pet.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation overlay */}
      {deleteId && (
        <div className="pets-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="pets-confirm" onClick={e => e.stopPropagation()}>
            <div className="pets-confirm-icon">🗑️</div>
            <p className="pets-confirm-title">Remove {petToDelete?.name}?</p>
            <p className="pets-confirm-sub">This will permanently remove this pet from your profile.</p>
            <div className="pets-confirm-actions">
              <button className="pets-btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="pets-btn-danger" onClick={handleDelete}>Yes, remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
