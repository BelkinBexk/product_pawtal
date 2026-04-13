"use client";

import { useState, useEffect } from "react";
import CustomerNav from "@/components/CustomerNav";
import { supabase } from "@/lib/supabase";

const LOCATIONS = ["Sukhumvit", "Thonglor", "Asok", "Phrom Phong", "Ekkamai", "On Nut"];

interface ProfileForm {
  firstName: string;
  lastName:  string;
  phone:     string;
  area:      string;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 72 }: { name: string; size?: number }) {
  const initials = name.trim()
    ? name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #17A8FF 0%, #0b7fcf 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * 0.35, flexShrink: 0,
      boxShadow: "0 4px 16px rgba(23,168,255,0.35)",
    }}>
      {initials}
    </div>
  );
}

// ── Inline toast ──────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500,
      background: type === "success" ? "#d1fae5" : "#fee2e2",
      color:      type === "success" ? "#065f46"  : "#991b1b",
      border: `1px solid ${type === "success" ? "#a7f3d0" : "#fca5a5"}`,
    }}>
      {type === "success" ? "✓" : "✕"} {msg}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [loading,      setLoading]      = useState(true);
  const [email,        setEmail]        = useState("");
  const [memberSince,  setMemberSince]  = useState("");
  const [customerId,   setCustomerId]   = useState<string | null>(null);

  const [form,    setForm]    = useState<ProfileForm>({ firstName: "", lastName: "", phone: "", area: "" });
  const [saving,  setSaving]  = useState(false);
  const [profMsg, setProfMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [dirty, setDirty] = useState(false);

  // ── Load user + customer row ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      setEmail(user.email ?? "");
      setMemberSince(new Date(user.created_at).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      }));

      const { data: customer } = await supabase
        .from("customers")
        .select("id, first_name, last_name, phone, area")
        .eq("user_id", user.id)
        .single();

      if (customer) {
        setCustomerId(customer.id);
        setForm({
          firstName: customer.first_name ?? user.user_metadata?.first_name ?? "",
          lastName:  customer.last_name  ?? user.user_metadata?.last_name  ?? "",
          phone:     customer.phone      ?? "",
          area:      customer.area       ?? "",
        });
      } else {
        // Fallback to auth metadata
        setForm(f => ({
          ...f,
          firstName: user.user_metadata?.first_name ?? "",
          lastName:  user.user_metadata?.last_name  ?? "",
        }));
      }
      setLoading(false);
    })();
  }, []);

  const set = (k: keyof ProfileForm, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setDirty(true);
    setProfMsg(null);
  };

  // ── Save profile ────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setProfMsg({ text: "First name and last name are required.", type: "error" });
      return;
    }
    setSaving(true);
    setProfMsg(null);

    const [authRes, dbRes] = await Promise.all([
      supabase.auth.updateUser({
        data: { first_name: form.firstName.trim(), last_name: form.lastName.trim() },
      }),
      customerId
        ? supabase.from("customers").update({
            first_name: form.firstName.trim(),
            last_name:  form.lastName.trim(),
            phone:      form.phone.trim() || null,
            area:       form.area || null,
          }).eq("id", customerId)
        : Promise.resolve({ error: null }),
    ]);

    setSaving(false);
    if (authRes.error || (dbRes as { error: unknown }).error) {
      setProfMsg({ text: "Failed to save changes. Please try again.", type: "error" });
    } else {
      setProfMsg({ text: "Profile updated successfully.", type: "success" });
      setDirty(false);
    }
  };

  const fullName = `${form.firstName} ${form.lastName}`.trim();

  if (loading) return (
    <div className="profile-page">
      <CustomerNav />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#9ec9e0" }}>
        Loading…
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      <CustomerNav />

      <div className="profile-container">

        {/* ── Page header ── */}
        <div className="profile-page-header">
          <Avatar name={fullName} size={72} />
          <div>
            <h1 className="profile-page-title">{fullName || "Your Profile"}</h1>
            <p className="profile-page-sub">{email}</p>
          </div>
        </div>

        <div className="profile-body">

          {/* ── Left column ── */}
          <div className="profile-main">

            {/* Personal Information */}
            <div className="profile-section">
              <div className="profile-section-head">
                <div className="profile-section-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </div>
                <div className="profile-section-title">Personal information</div>
              </div>

              <div className="profile-field-row">
                <div className="profile-field">
                  <label className="profile-label">First name</label>
                  <input className="profile-input" placeholder="Somchai"
                    value={form.firstName} onChange={e => set("firstName", e.target.value)} />
                </div>
                <div className="profile-field">
                  <label className="profile-label">Last name</label>
                  <input className="profile-input" placeholder="Jaidee"
                    value={form.lastName} onChange={e => set("lastName", e.target.value)} />
                </div>
              </div>

              <div className="profile-field">
                <label className="profile-label">Phone number <span className="profile-optional">optional</span></label>
                <input className="profile-input" placeholder="+66 8X XXX XXXX" type="tel"
                  value={form.phone} onChange={e => set("phone", e.target.value)} />
              </div>

              <div className="profile-field">
                <label className="profile-label">Location / Area</label>
                <select className="profile-input profile-select"
                  value={form.area} onChange={e => set("area", e.target.value)}>
                  <option value="">Select area…</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {profMsg && <Toast msg={profMsg.text} type={profMsg.type} />}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="pets-btn-primary"
                  onClick={handleSaveProfile}
                  disabled={saving || !dirty}
                  style={{ opacity: !dirty ? 0.45 : 1 }}
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>

          </div>

          {/* ── Right sidebar ── */}
          <div className="profile-sidebar">

            {/* Account info */}
            <div className="profile-section">
              <div className="profile-section-head">
                <div className="profile-section-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div className="profile-section-title">Account info</div>
              </div>

              <div className="profile-info-row">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-val">{email || "—"}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Member since</span>
                <span className="profile-info-val">{memberSince || "—"}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Account type</span>
                <span className="profile-info-val profile-badge-customer">Pet Owner</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
