"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
type TabKey  = "info" | "hours" | "photos";
type DayHour = { day: string; open: boolean; from: string; to: string };

// ── Constants ─────────────────────────────────────────────────────────────────
const AREAS = ["Sukhumvit", "Silom", "Siam", "Ari", "Thonglor", "Ekkamai", "On Nut", "Lat Phrao", "Chatuchak"];
const SERVICE_TYPES = ["Grooming", "Day Care", "Training", "Boarding", "Veterinary"];

const TIMES: string[] = [];
for (let h = 7; h <= 22; h++) {
  TIMES.push(`${String(h).padStart(2, "0")}:00`);
  TIMES.push(`${String(h).padStart(2, "0")}:30`);
}

const DEFAULT_HOURS: DayHour[] = [
  { day: "Monday",    open: true,  from: "09:00", to: "18:00" },
  { day: "Tuesday",   open: true,  from: "09:00", to: "18:00" },
  { day: "Wednesday", open: true,  from: "09:00", to: "18:00" },
  { day: "Thursday",  open: true,  from: "09:00", to: "18:00" },
  { day: "Friday",    open: true,  from: "09:00", to: "18:00" },
  { day: "Saturday",  open: true,  from: "10:00", to: "17:00" },
  { day: "Sunday",    open: false, from: "10:00", to: "17:00" },
];

const STORAGE_BUCKET = "provider-images";

// Convert "HH:MM:SS" (Postgres time) → "HH:MM"
function pgTimeToHHMM(t: string | null | undefined): string {
  if (!t) return "09:00";
  return t.slice(0, 5);
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, success }: { msg: string; success: boolean }) {
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      background: success ? "#16a34a" : "#00171F", color: "#fff",
      fontSize: 13, fontWeight: 500, padding: "12px 24px",
      borderRadius: 100, zIndex: 999, whiteSpace: "nowrap",
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)", fontFamily: "'Lexend Deca', sans-serif",
    }}>
      {msg}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [tab, setTab] = useState<TabKey>("info");

  // Business info
  const [providerId,   setProviderId]   = useState<string | null>(null);
  const [userId,       setUserId]       = useState<string | null>(null);
  const [name,         setName]         = useState("");
  const [desc,         setDesc]         = useState("");
  const [serviceType,  setServiceType]  = useState("Grooming");
  const [address,      setAddress]      = useState("");
  const [phone,        setPhone]        = useState("");
  const [email,        setEmail]        = useState("");
  const [lineId,       setLineId]       = useState("");
  const [website,      setWebsite]      = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  // Hours
  const [hours, setHours] = useState<DayHour[]>(DEFAULT_HOURS);

  // Photos — real URLs stored in providers table
  const [logoUrl,        setLogoUrl]        = useState<string | null>(null);
  const [coverUrl,       setCoverUrl]       = useState<string | null>(null);
  const [logoUploading,  setLogoUploading]  = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  // UI state
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState<{ msg: string; success: boolean } | null>(null);

  const showToast = (msg: string, success = false) => {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 2800);
  };

  // ── Load profile from Supabase ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      // Load provider row
      const { data: provider } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (provider) {
        setProviderId(provider.id);
        setName(provider.shop_name  ?? "");
        setDesc(provider.description ?? "");
        setServiceType(provider.service_type
          ? provider.service_type.charAt(0).toUpperCase() + provider.service_type.slice(1)
          : "Grooming");
        setAddress(provider.address  ?? "");
        setPhone(provider.phone      ?? "");
        setEmail(provider.email      ?? "");
        setLineId(provider.line_id   ?? "");
        setWebsite(provider.website  ?? "");
        setLogoUrl(provider.logo_url   ?? null);
        setCoverUrl(provider.cover_url ?? null);
        // area is stored comma-separated
        if (provider.area) {
          setSelectedAreas(provider.area.split(",").map((a: string) => a.trim()).filter(Boolean));
        }
      }

      // Load opening hours
      if (provider?.id) {
        const { data: dbHours } = await supabase
          .from("provider_hours")
          .select("*")
          .eq("provider_id", provider.id);

        if (dbHours && dbHours.length > 0) {
          setHours(prev => prev.map(h => {
            const row = dbHours.find(r => r.day_of_week === h.day);
            if (!row) return h;
            return {
              day:  h.day,
              open: row.is_open,
              from: pgTimeToHHMM(row.open_time),
              to:   pgTimeToHHMM(row.close_time),
            };
          }));
        }
      }

      setLoading(false);
    }

    load();
  }, []);

  // ── Save profile to Supabase ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!providerId) return;
    setSaving(true);

    // 1. Update provider row
    const { error: provErr } = await supabase
      .from("providers")
      .update({
        shop_name:    name.trim(),
        description:  desc.trim(),
        service_type: serviceType.toLowerCase(),
        address:      address.trim(),
        phone:        phone.trim(),
        email:        email.trim(),
        line_id:      lineId.trim() || null,
        website:      website.trim() || null,
        area:         selectedAreas.join(", ") || null,
        logo_url:     logoUrl  || null,
        cover_url:    coverUrl || null,
      })
      .eq("id", providerId);

    if (provErr) {
      setSaving(false);
      showToast("Failed to save profile. Please try again.");
      return;
    }

    // 2. Upsert opening hours
    const hoursRows = hours.map(h => ({
      provider_id: providerId,
      day_of_week: h.day,
      is_open:     h.open,
      open_time:   h.open ? h.from + ":00" : null,
      close_time:  h.open ? h.to   + ":00" : null,
    }));

    const { error: hoursErr } = await supabase
      .from("provider_hours")
      .upsert(hoursRows, { onConflict: "provider_id,day_of_week" });

    setSaving(false);

    if (hoursErr) {
      showToast("Profile saved but hours failed. Please try again.");
      return;
    }

    showToast("Profile saved successfully!", true);
  };

  const handleDiscard = async () => {
    // Reload from DB
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: provider } = await supabase
      .from("providers").select("*").eq("user_id", user.id).single();

    if (provider) {
      setName(provider.shop_name  ?? "");
      setDesc(provider.description ?? "");
      setServiceType(provider.service_type
        ? provider.service_type.charAt(0).toUpperCase() + provider.service_type.slice(1)
        : "Grooming");
      setAddress(provider.address ?? "");
      setPhone(provider.phone     ?? "");
      setEmail(provider.email     ?? "");
      setLineId(provider.line_id  ?? "");
      setWebsite(provider.website ?? "");
      setLogoUrl(provider.logo_url   ?? null);
      setCoverUrl(provider.cover_url ?? null);
      if (provider.area) {
        setSelectedAreas(provider.area.split(",").map((a: string) => a.trim()).filter(Boolean));
      } else {
        setSelectedAreas([]);
      }

      const { data: dbHours } = await supabase
        .from("provider_hours").select("*").eq("provider_id", provider.id);

      if (dbHours && dbHours.length > 0) {
        setHours(prev => prev.map(h => {
          const row = dbHours.find(r => r.day_of_week === h.day);
          if (!row) return h;
          return { day: h.day, open: row.is_open, from: pgTimeToHHMM(row.open_time), to: pgTimeToHHMM(row.close_time) };
        }));
      }
    }

    setLoading(false);
    showToast("Changes discarded.");
  };

  // ── Progress ───────────────────────────────────────────────────────────────
  const infoComplete   = !!(name && desc && address);
  const hoursComplete  = hours.some(h => h.open);
  const photosComplete = !!(logoUrl || coverUrl);
  const progress = (infoComplete ? 40 : 0) + (hoursComplete ? 30 : 0) + (photosComplete ? 30 : 0);

  // Live preview helpers
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const isOpenToday = hours.some(h => h.day === today && h.open);
  const todayHours  = hours.find(h => h.day === today && h.open);

  const toggleArea = (area: string) =>
    setSelectedAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);

  const toggleDay = (i: number) =>
    setHours(prev => prev.map((h, idx) => idx === i ? { ...h, open: !h.open } : h));

  const setHourTime = (i: number, field: "from" | "to", val: string) =>
    setHours(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: val } : h));

  // ── Image upload helpers ───────────────────────────────────────────────────
  const uploadImage = async (
    file: File,
    slot: "logo" | "cover",
    setUploading: (v: boolean) => void,
    setUrl: (v: string | null) => void,
    maxBytes: number,
  ) => {
    if (!providerId || !userId) return;
    if (file.size > maxBytes) {
      showToast(`File too large. Max ${Math.round(maxBytes / 1024 / 1024)} MB allowed.`);
      return;
    }
    setUploading(true);
    // Use auth user ID as folder so storage UPDATE/DELETE policies (auth.uid() check) pass
    const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${userId}/${slot}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      console.error("[storage upload]", upErr);
      setUploading(false);
      showToast(`Upload failed: ${upErr.message}`);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);

    const col = slot === "logo" ? "logo_url" : "cover_url";
    const { error: dbErr } = await supabase
      .from("providers")
      .update({ [col]: publicUrl })
      .eq("id", providerId);

    setUploading(false);
    if (dbErr) {
      showToast("Upload saved but DB update failed.");
      return;
    }

    setUrl(publicUrl);
    showToast(slot === "logo" ? "Logo updated!" : "Cover photo updated!", true);
  };

  const deleteImage = async (
    slot: "logo" | "cover",
    currentUrl: string | null,
    setUrl: (v: string | null) => void,
  ) => {
    if (!providerId || !userId || !currentUrl) return;

    // Best-effort Storage delete — path uses userId (matches auth.uid() in policy)
    const ext = currentUrl.split(".").pop()?.split("?")[0];
    if (ext) {
      await supabase.storage.from(STORAGE_BUCKET).remove([`${userId}/${slot}.${ext}`]);
    }

    const col = slot === "logo" ? "logo_url" : "cover_url";
    await supabase.from("providers").update({ [col]: null }).eq("id", providerId);
    setUrl(null);
    showToast(slot === "logo" ? "Logo removed." : "Cover photo removed.", true);
  };

  const TAB_CONFIG: { key: TabKey; label: string; emoji: string; done: boolean }[] = [
    { key: "info",   label: "Business Info",   emoji: "📋", done: infoComplete   },
    { key: "hours",  label: "Opening Hours",   emoji: "🕐", done: hoursComplete  },
    { key: "photos", label: "Photos",          emoji: "🖼", done: photosComplete },
  ];

  if (loading) {
    return (
      <main className="ovw-main">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#5a8fa8", fontSize: 14 }}>
          Loading profile…
        </div>
      </main>
    );
  }

  return (
    <main className="ovw-main">
      <div className="ovw-content">

        {/* ── Header ── */}
        <div className="prof-header">
          <div>
            <div className="prof-title">Shop Profile</div>
            <div className="prof-sub">Configure your business information visible to customers</div>
          </div>
          <div className="prof-complete">
            <div className="prof-complete-pct">{progress}%</div>
            <div className="prof-complete-label">Complete</div>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="prof-progress-wrap">
          <div className="prof-progress-label">
            <div className="prof-progress-title">Setup Progress</div>
            <div className="prof-progress-pct">{progress}%</div>
          </div>
          <div className="prof-progress-track">
            <div className="prof-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="prof-progress-steps">
            {[
              { label: "Business Info (40%)",  done: infoComplete,   key: "info"   },
              { label: "Opening Hours (30%)",  done: hoursComplete,  key: "hours"  },
              { label: "Photos (30%)",         done: photosComplete, key: "photos" },
            ].map(s => (
              <div key={s.key} className={`prof-step ${s.done ? "done" : tab === s.key ? "active" : ""}`}>
                <div className="prof-step-dot" />
                {s.done ? `✓ ${s.label}` : s.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="prof-tabs">
          {TAB_CONFIG.map(t => (
            <button key={t.key} className={`prof-tab${tab === t.key ? " active" : ""}${t.done ? " done" : ""}`} onClick={() => setTab(t.key)}>
              <span className="prof-tab-check">{t.done ? "✓" : t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Two-column body ── */}
        <div className="prof-body">

          {/* Left — form column */}
          <div className="prof-form-col">

            {/* ── Business Info tab ── */}
            {tab === "info" && (
              <div className="prof-panel">
                <div className="prof-panel-body">

                  <div className="form-group">
                    <label className="form-label">Shop Name <span className="prof-req">*</span></label>
                    <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your shop name" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shop Description <span className="prof-req">*</span></label>
                    <textarea
                      className="form-input"
                      rows={4}
                      maxLength={300}
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                      placeholder="Introduce your shop, e.g. Professional grooming with 5 years experience..."
                      style={{ resize: "vertical" }}
                    />
                    <div className="form-char-count">{desc.length} / 300</div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Primary Service Type <span className="prof-req">*</span></label>
                      <select className="form-select" value={serviceType} onChange={e => setServiceType(e.target.value)}>
                        {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address <span className="prof-req">*</span></label>
                      <input className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, district, area" />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Phone Number <span className="prof-req">*</span></label>
                      <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0812345678" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email <span className="prof-req">*</span></label>
                      <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">LINE ID</label>
                      <input className="form-input" value={lineId} onChange={e => setLineId(e.target.value)} placeholder="@yourshop" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Website</label>
                      <input className="form-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourshop.com" />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Service Areas <span className="prof-req">*</span></label>
                    <div className="area-chips">
                      {AREAS.map(a => (
                        <button key={a} className={`area-chip${selectedAreas.includes(a) ? " selected" : ""}`} onClick={() => toggleArea(a)}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ── Opening Hours tab ── */}
            {tab === "hours" && (
              <div className="prof-panel">
                <div className="prof-panel-body">
                  <p className="prof-hint">Select the days and hours your shop is open</p>
                  {hours.map((h, i) => (
                    <div key={h.day} className={`oh-row${h.open ? " open" : ""}`}>
                      <label className="oh-toggle">
                        <input type="checkbox" checked={h.open} onChange={() => toggleDay(i)} />
                        <span className="oh-slider" />
                      </label>
                      <div className="oh-day">{h.day}</div>
                      {h.open ? (
                        <div className="oh-times">
                          <select className="oh-select" value={h.from} onChange={e => setHourTime(i, "from", e.target.value)}>
                            {TIMES.map(t => <option key={t}>{t}</option>)}
                          </select>
                          <span className="oh-dash">–</span>
                          <select className="oh-select" value={h.to} onChange={e => setHourTime(i, "to", e.target.value)}>
                            {TIMES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div className="oh-closed">Closed</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Photos tab ── */}
            {tab === "photos" && (
              <div className="prof-panel">
                <div className="prof-panel-body">

                  {/* Profile Photo (logo) */}
                  <div className="form-group">
                    <label className="form-label">
                      Profile Photo
                      <span className="prof-label-hint"> · 800×800 px recommended (1:1) · min 400×400 px · max 2 MB</span>
                    </label>
                    <p className="prof-hint">Square crop, displayed as a circle — JPG or PNG only</p>

                    <div className="photo-upload-slot">
                      {logoUrl ? (
                        <div className="photo-upload-preview">
                          <img src={logoUrl} alt="Profile photo" className="photo-upload-img logo-img" />
                          <div className="photo-upload-actions">
                            <label className="photo-upload-replace-btn">
                              {logoUploading ? "Uploading…" : "Replace"}
                              <input
                                type="file"
                                accept="image/jpeg,image/png"
                                style={{ display: "none" }}
                                disabled={logoUploading}
                                onChange={e => {
                                  const f = e.target.files?.[0];
                                  if (f) uploadImage(f, "logo", setLogoUploading, setLogoUrl, 2 * 1024 * 1024);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            <button
                              className="photo-upload-delete-btn"
                              onClick={() => deleteImage("logo", logoUrl, setLogoUrl)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className={`photo-upload-empty${logoUploading ? " uploading" : ""}`}>
                          <div className="photo-upload-empty-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                              <polyline points="17 8 12 3 7 8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="12" y1="3" x2="12" y2="15" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="photo-upload-empty-label">
                            {logoUploading ? "Uploading…" : "Click to upload profile photo"}
                          </div>
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            style={{ display: "none" }}
                            disabled={logoUploading}
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) uploadImage(f, "logo", setLogoUploading, setLogoUrl, 2 * 1024 * 1024);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Cover Photo */}
                  <div className="form-group" style={{ marginTop: 20, marginBottom: 0 }}>
                    <label className="form-label">
                      Cover Photo
                      <span className="prof-label-hint"> · 1920×640 px recommended (3:1) · min 960×320 px · max 5 MB</span>
                    </label>
                    <p className="prof-hint">Wide banner image — JPG or PNG only</p>

                    <div className="photo-upload-slot cover-slot">
                      {coverUrl ? (
                        <div className="photo-upload-preview">
                          <img src={coverUrl} alt="Cover photo" className="photo-upload-img cover-img" />
                          <div className="photo-upload-actions">
                            <label className="photo-upload-replace-btn">
                              {coverUploading ? "Uploading…" : "Replace"}
                              <input
                                type="file"
                                accept="image/jpeg,image/png"
                                style={{ display: "none" }}
                                disabled={coverUploading}
                                onChange={e => {
                                  const f = e.target.files?.[0];
                                  if (f) uploadImage(f, "cover", setCoverUploading, setCoverUrl, 5 * 1024 * 1024);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            <button
                              className="photo-upload-delete-btn"
                              onClick={() => deleteImage("cover", coverUrl, setCoverUrl)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className={`photo-upload-empty cover-empty${coverUploading ? " uploading" : ""}`}>
                          <div className="photo-upload-empty-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                              <polyline points="17 8 12 3 7 8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="12" y1="3" x2="12" y2="15" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="photo-upload-empty-label">
                            {coverUploading ? "Uploading…" : "Click to upload cover photo"}
                          </div>
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            style={{ display: "none" }}
                            disabled={coverUploading}
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) uploadImage(f, "cover", setCoverUploading, setCoverUrl, 5 * 1024 * 1024);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ── Save bar ── */}
            <div className="prof-save-bar">
              <button className="prof-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button className="prof-discard-btn" onClick={handleDiscard} disabled={saving}>
                Discard
              </button>
            </div>

          </div>

          {/* Right — live preview (sticky) */}
          <div className="preview-col">
            <div className="preview-panel">

              {/* Header */}
              <div className="preview-header">
                <div className="preview-header-dot" style={{ background: isOpenToday ? "#22c55e" : "#e2e8f0" }} />
                <div className="preview-header-title">Customer Preview</div>
                <div className="preview-header-sub">Live · updates as you type</div>
              </div>

              {/* Shop card */}
              <div className="preview-card">

                {/* Cover + logo */}
                <div
                  className="preview-cover"
                  style={coverUrl
                    ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : { background: "linear-gradient(135deg, #e8f4ff, #c7e8ff)" }
                  }
                >
                  <div className="preview-logo-wrap">
                    <div className="preview-logo" style={logoUrl ? { background: "transparent", padding: 0 } : {}}>
                      {logoUrl
                        ? <img src={logoUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : (name[0] || "?")}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="preview-info">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div className="preview-shop-name">{name || "Shop name"}</div>
                    <span style={{ fontSize: 11, color: isOpenToday ? "#22c55e" : "#94a3b8", fontWeight: 500 }}>
                      {isOpenToday ? "Open now" : "Closed"}
                    </span>
                  </div>
                  <div className="preview-shop-desc">
                    {desc ? (desc.length > 75 ? desc.slice(0, 72) + "…" : desc) : "No description added yet."}
                  </div>
                  <div className="preview-tags">
                    <span className="preview-tag">{serviceType}</span>
                    {selectedAreas.slice(0, 2).map(a => (
                      <span key={a} className="preview-area-tag">{a}</span>
                    ))}
                  </div>
                  <div className="preview-meta">
                    <div className="preview-meta-item">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="#94a3b8" strokeWidth="1.3"/>
                        <path d="M8 5v3l2 2" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      {todayHours ? `${todayHours.from} – ${todayHours.to}` : "Hours not set"}
                    </div>
                    <div className="preview-meta-item">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2C5.24 2 3 4.24 3 7c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" stroke="#94a3b8" strokeWidth="1.3"/>
                      </svg>
                      {selectedAreas[0] || "Bangkok"}
                    </div>
                    <div className="preview-meta-item">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4 4.3 12.3l.7-4.1L2 5.3l4.2-.7z" stroke="#F5A623" strokeWidth="1.3"/>
                      </svg>
                      4.9 (128 reviews)
                    </div>
                  </div>
                </div>

              </div>

              {/* CTA buttons */}
              <div style={{ padding: "12px 16px", borderTop: "1px solid #e8f1f8", display: "flex", gap: 8 }}>
                <button style={{
                  flex: 1, padding: 9, background: "#17A8FF", color: "#fff",
                  border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  fontFamily: "'Lexend Deca', sans-serif", cursor: "default",
                }}>
                  Book Now
                </button>
                <button style={{
                  padding: "9px 14px", background: "#f4f8fc", color: "#94a3b8",
                  border: "1.5px solid #e8f1f8", borderRadius: 10, fontSize: 12,
                  fontFamily: "'Lexend Deca', sans-serif", cursor: "default",
                  display: "flex", alignItems: "center",
                }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="8" cy="5" r="3" stroke="#94a3b8" strokeWidth="1.3"/>
                  </svg>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} success={toast.success} />}

    </main>
  );
}
