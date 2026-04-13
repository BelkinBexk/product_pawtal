"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
type FurType = "Short fur" | "Long fur" | "Special / Double coat";
type SizeKey = "XXS" | "XS" | "S" | "M" | "L" | "XL" | "2XL";
type PriceMatrix = Partial<Record<FurType, Partial<Record<SizeKey, string>>>>;

interface Service {
  id:           string;   // UUID from Supabase, or "new" for unsaved
  name:         string;
  category:     string;
  duration:     number;
  bufferTime:   number;
  price:        string;   // display string: "฿420" or "By size"
  basePrice:    number;   // raw numeric
  variesBySize: boolean;
  matrix:       PriceMatrix;
  description:  string;
  active:       boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ["Grooming", "Bath & Trim", "Day Care", "Training", "Boarding"];
const CAT_COLORS: Record<string, string> = {
  "Grooming":    "#17A8FF",
  "Bath & Trim": "#0B93E8",
  "Day Care":    "#22c55e",
  "Training":    "#F5A623",
  "Boarding":    "#8b5cf6",
};
const SIZES: SizeKey[]      = ["XXS", "XS", "S", "M", "L", "XL", "2XL"];
const SIZE_WEIGHTS: string[] = ["<2 kg","2–5 kg","5–10 kg","10–15 kg","15–20 kg","20–30 kg","30+ kg"];
const FUR_TYPES: FurType[]  = ["Short fur", "Long fur", "Special / Double coat"];
const DURATIONS             = [15,30,45,60,90,120,150,180,240,360,480];
const BUFFERS               = [0,5,10,15,20,30,45,60];

// Fur type ↔ DB enum
const FUR_TO_DB: Record<FurType, string> = {
  "Short fur":               "short",
  "Long fur":                "long",
  "Special / Double coat":   "special",
};
const DB_TO_FUR: Record<string, FurType> = {
  "short":   "Short fur",
  "long":    "Long fur",
  "special": "Special / Double coat",
};

function fmtDuration(min: number) {
  if (min < 60) return `${min} min`;
  if (min % 60 === 0) return `${min / 60}h`;
  return `${Math.floor(min / 60)}h ${min % 60}min`;
}

function fmtPrice(svc: Service): string {
  if (svc.variesBySize) return "By size";
  return svc.basePrice ? `฿${svc.basePrice.toLocaleString()}` : "—";
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, success }: { msg: string; success: boolean }) {
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      background: success ? "#16a34a" : "#00171F", color: "#fff",
      fontSize: 13, fontWeight: 500, padding: "12px 24px", borderRadius: 100,
      zIndex: 999, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    }}>
      {msg}
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,23,31,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500 }}
      onClick={onCancel}>
      <div style={{ background:"#fff", borderRadius:20, padding:"32px 28px", maxWidth:360, width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:36, marginBottom:12 }}>🗑️</div>
        <div style={{ fontSize:16, fontWeight:700, color:"#00171F", marginBottom:6 }}>Delete &ldquo;{name}&rdquo;?</div>
        <div style={{ fontSize:13, color:"#5a8fa8", fontWeight:300, marginBottom:24, lineHeight:1.6 }}>
          This will permanently remove this service from your catalogue. Existing bookings will not be affected.
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="svc-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="svc-modal-delete" onClick={onConfirm}>Yes, delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit / Add page ───────────────────────────────────────────────────────────
function EditPage({ svc, isNew, saving, onSave, onBack, onDelete }: {
  svc: Service; isNew: boolean; saving: boolean;
  onSave: (s: Service) => void;
  onBack: () => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<Service>({ ...svc });
  const [error, setError] = useState("");

  const set = (k: keyof Service, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleMatrixChange = (fur: FurType, size: SizeKey, val: string) => {
    setForm(f => {
      const matrix = { ...f.matrix };
      if (!matrix[fur]) matrix[fur] = {};
      if (val) (matrix[fur] as Record<string, string>)[size] = val;
      else delete (matrix[fur] as Record<string, string>)[size];
      return { ...f, matrix };
    });
  };

  const handleSave = () => {
    if (!form.name.trim()) { setError("Service name is required."); return; }
    onSave(form);
  };

  return (
    <div className="svc-edit-page">

      {/* Back */}
      <div className="svc-edit-topbar">
        <button className="svc-edit-back" onClick={onBack} disabled={saving}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Services
        </button>
      </div>

      <div className="svc-edit-title">{isNew ? "Add New Service" : `Edit ${svc.name}`}</div>
      <div className="svc-edit-sub">
        {isNew ? "Fill in the details below to add a new service to your catalogue." : "Update the service details below."}
      </div>

      {/* Name & Category */}
      <div className="svc-edit-panel">
        <div className="svc-edit-section-title">Service Name &amp; Category</div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" style={{ color: "#17A8FF" }}>Service Name <span style={{ color:"#ef4444" }}>*</span></label>
            <input className="form-input" value={form.name} placeholder="e.g. Bath Standard"
              onChange={e => { set("name", e.target.value); setError(""); }} />
            {error && <div style={{ fontSize:12, color:"#ef4444", marginTop:4 }}>{error}</div>}
          </div>
          <div className="form-group">
            <label className="form-label" style={{ color: "#17A8FF" }}>Category <span style={{ color:"#ef4444" }}>*</span></label>
            <select className="form-select" value={form.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Duration & Pricing */}
      <div className="svc-edit-panel">
        <div className="svc-edit-section-title">Duration &amp; Pricing</div>
        <div className="svc-dur-row">
          <div className="svc-dur-group">
            <label>Duration <span style={{ color:"#ef4444" }}>*</span></label>
            <select className="form-select" value={form.duration} style={{ minWidth:140 }}
              onChange={e => set("duration", Number(e.target.value))}>
              {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
          <div className="svc-dur-group">
            <label>Buffer Time</label>
            <select className="form-select" value={form.bufferTime} style={{ minWidth:120 }}
              onChange={e => set("bufferTime", Number(e.target.value))}>
              {BUFFERS.map(b => <option key={b} value={b}>{b === 0 ? "None" : `${b} min`}</option>)}
            </select>
          </div>
          <label className="svc-vary-check">
            <input type="checkbox" checked={form.variesBySize}
              onChange={e => set("variesBySize", e.target.checked)} />
            Price varies by fur type &amp; size
          </label>
        </div>

        <div style={{ marginTop:20 }}>
          {form.variesBySize ? (
            <>
              <div className="svc-edit-section-title" style={{ marginTop:4 }}>Pricing Matrix (฿)</div>
              <div className="svc-matrix-wrap">
                <table className="svc-matrix">
                  <thead>
                    <tr>
                      <th style={{ textAlign:"left", paddingLeft:14, color:"#7eb5d6", fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px" }}>Fur Type</th>
                      {SIZES.map((sz, i) => (
                        <th key={sz} className="size-label">
                          {sz}<span className="size-sub">{SIZE_WEIGHTS[i]}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FUR_TYPES.map(fur => (
                      <tr key={fur}>
                        <td className="fur-label">{fur}</td>
                        {SIZES.map(sz => (
                          <td key={sz}>
                            <input className="svc-matrix-input" placeholder="—"
                              value={form.matrix[fur]?.[sz] ?? ""}
                              onChange={e => handleMatrixChange(fur, sz, e.target.value)} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="svc-matrix-hint">Leave cells blank for sizes not offered. Commission (20%) deducted per booking.</div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label" style={{ color:"#17A8FF" }}>Base Price (฿) <span style={{ color:"#ef4444" }}>*</span></label>
              <div className="svc-base-price-wrap">
                <div className="svc-base-currency">฿</div>
                <input className="svc-base-input" type="number" min="0" step="50"
                  value={form.basePrice || ""}
                  placeholder="0"
                  onChange={e => set("basePrice", Number(e.target.value) || 0)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="svc-edit-panel">
        <div className="svc-edit-section-title">Description</div>
        <div className="form-group" style={{ marginBottom:0 }}>
          <textarea className="form-input" rows={4} style={{ resize:"vertical" }}
            placeholder="Additional details about this service…"
            value={form.description}
            onChange={e => set("description", e.target.value)} />
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ display:"flex", gap:10, justifyContent:"space-between", alignItems:"center", paddingBottom:32 }}>
        <button className="svc-edit-back" style={{ color:"#ef4444" }} onClick={onDelete} disabled={saving}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {isNew ? "Discard" : "Delete service"}
        </button>
        <div style={{ display:"flex", gap:10 }}>
          <button className="prof-discard-btn" onClick={onBack} disabled={saving}>Cancel</button>
          <button className="prof-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isNew ? "Add Service" : "Save Changes"}
          </button>
        </div>
      </div>

    </div>
  );
}

// ── List page ─────────────────────────────────────────────────────────────────
function ServiceList({ services, loading, onAdd, onEdit, onToggle, onDelete }: {
  services: Service[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const activeCount = services.filter(s => s.active).length;

  return (
    <>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
        <button className="prof-save-btn" onClick={onAdd}
          style={{ display:"flex", alignItems:"center", gap:7 }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add service
        </button>
      </div>

      <div className="svc-page">
        <div className="svc-page-header">
          <div className="svc-page-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h10M3 15h12" stroke="#17A8FF" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="17" cy="15" r="2.5" stroke="#17A8FF" strokeWidth="1.4"/>
            </svg>
          </div>
          <div>
            <div className="svc-page-title">Services Offered</div>
            <div className="svc-page-sub">Manage your service catalogue, pricing and duration</div>
          </div>
          <div style={{ marginLeft:"auto" }}>
            <span style={{ fontSize:12, color:"#5a8fa8", fontWeight:300 }}>
              {loading ? "Loading…" : `${activeCount} active · ${services.length} total`}
            </span>
          </div>
        </div>

        <div className="svc-table-wrap">
          <table className="svc-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign:"center", padding:"48px 0", color:"#7eb5d6", fontSize:13 }}>
                    Loading services…
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign:"center", padding:"48px 0", color:"#7eb5d6", fontSize:13 }}>
                    No services yet. Click &ldquo;Add service&rdquo; to get started.
                  </td>
                </tr>
              ) : services.map(s => (
                <ServiceRow key={s.id} svc={s}
                  onEdit={() => onEdit(s.id)}
                  onToggle={() => onToggle(s.id)}
                  onDelete={() => onDelete(s.id)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ServiceRow({ svc, onEdit, onToggle, onDelete }: {
  svc: Service; onEdit: () => void; onToggle: () => void; onDelete: () => void;
}) {
  const cc = CAT_COLORS[svc.category] ?? "#17A8FF";
  return (
    <tr className="svc-row" onClick={onEdit} style={{ cursor:"pointer" }}>
      <td className="svc-name">{svc.name}</td>
      <td><span className="svc-cat-tag" style={{ color: cc }}>{svc.category}</span></td>
      <td className="svc-dur">{fmtDuration(svc.duration)}</td>
      <td className="svc-price">{fmtPrice(svc)}</td>
      <td>
        <button className={`svc-status-btn${svc.active ? " active" : " inactive"}`}
          onClick={e => { e.stopPropagation(); onToggle(); }}>
          {svc.active ? "Active" : "Inactive"}
        </button>
      </td>
      <td className="svc-actions" onClick={e => e.stopPropagation()}>
        <button className="svc-icon-btn edit" title="Edit" onClick={onEdit}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M11 2l3 3-9 9H2v-3l9-9z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="svc-icon-btn delete" title="Delete" onClick={onDelete}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const [providerId, setProviderId] = useState<string | null>(null);
  const [services,   setServices]   = useState<Service[]>([]);
  const [view,       setView]       = useState<"list" | "edit">("list");
  const [editId,     setEditId]     = useState<string | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [toast,      setToast]      = useState<{ msg: string; success: boolean } | null>(null);

  const showToast = (msg: string, success = false) => {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 2800);
  };

  // ── Load services from Supabase ──────────────────────────────────────────────
  const loadServices = useCallback(async (pid: string) => {
    const { data: rows } = await supabase
      .from("services")
      .select("*, service_pricing(*)")
      .eq("provider_id", pid)
      .order("sort_order", { ascending: true });

    if (!rows) return;

    const mapped: Service[] = rows.map(row => {
      // Build pricing matrix from service_pricing rows
      const matrix: PriceMatrix = {};
      if (row.service_pricing) {
        for (const p of row.service_pricing) {
          const fur = DB_TO_FUR[p.fur_type];
          if (fur) {
            if (!matrix[fur]) matrix[fur] = {};
            (matrix[fur] as Record<string, string>)[p.size_key as SizeKey] = String(p.price);
          }
        }
      }
      return {
        id:           row.id,
        name:         row.name,
        category:     row.category,
        duration:     row.duration_min,
        bufferTime:   row.buffer_min ?? 0,
        basePrice:    row.base_price ?? 0,
        price:        row.varies_by_size ? "By size" : (row.base_price ? `฿${Number(row.base_price).toLocaleString()}` : "—"),
        variesBySize: row.varies_by_size,
        matrix,
        description:  row.description ?? "",
        active:       row.is_active,
      };
    });

    setServices(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: provider } = await supabase
        .from("providers").select("id").eq("user_id", user.id).single();
      if (!provider) return;
      setProviderId(provider.id);
      await loadServices(provider.id);
    }
    init();
  }, [loadServices]);

  // ── Open edit view ────────────────────────────────────────────────────────────
  const openEdit = (id: string) => { setEditId(id); setView("edit"); };

  const handleAdd = () => {
    const tempId = `new-${Date.now()}`;
    const blank: Service = {
      id: tempId, name: "", category: "Grooming", duration: 60, bufferTime: 15,
      basePrice: 0, price: "", variesBySize: false, matrix: {}, description: "", active: true,
    };
    setServices(prev => [...prev, blank]);
    openEdit(tempId);
  };

  // ── Save service to Supabase ──────────────────────────────────────────────────
  const handleSave = async (updated: Service) => {
    if (!providerId) return;
    setSaving(true);

    const isNew = updated.id.startsWith("new-");

    const serviceRow = {
      provider_id:   providerId,
      name:          updated.name.trim(),
      category:      updated.category,
      duration_min:  updated.duration,
      buffer_min:    updated.bufferTime,
      base_price:    updated.variesBySize ? null : (updated.basePrice || null),
      varies_by_size: updated.variesBySize,
      description:   updated.description.trim() || null,
      is_active:     updated.active,
      sort_order:    isNew ? services.filter(s => !s.id.startsWith("new-")).length : undefined,
    };

    let serviceId = updated.id;

    if (isNew) {
      const { data: inserted, error } = await supabase
        .from("services")
        .insert({ ...serviceRow })
        .select("id")
        .single();

      if (error || !inserted) {
        setSaving(false);
        showToast("Failed to add service. Please try again.");
        return;
      }
      serviceId = inserted.id;
    } else {
      const { error } = await supabase
        .from("services")
        .update(serviceRow)
        .eq("id", serviceId);

      if (error) {
        setSaving(false);
        showToast("Failed to save service. Please try again.");
        return;
      }
    }

    // Handle pricing matrix
    if (updated.variesBySize) {
      // Delete existing pricing, then insert fresh
      await supabase.from("service_pricing").delete().eq("service_id", serviceId);

      const pricingRows: { service_id: string; fur_type: string; size_key: string; price: number }[] = [];
      for (const fur of FUR_TYPES) {
        const dbFur = FUR_TO_DB[fur];
        for (const size of SIZES) {
          const val = updated.matrix[fur]?.[size];
          if (val && !isNaN(Number(val))) {
            pricingRows.push({ service_id: serviceId, fur_type: dbFur, size_key: size, price: Number(val) });
          }
        }
      }

      if (pricingRows.length > 0) {
        await supabase.from("service_pricing").insert(pricingRows);
      }
    } else {
      // Remove any stale pricing rows if switched from matrix to flat
      await supabase.from("service_pricing").delete().eq("service_id", serviceId);
    }

    // Reload services to get fresh state
    await loadServices(providerId);
    setSaving(false);
    setView("list");
    showToast(`${updated.name} saved!`, true);
  };

  // ── Toggle active status ──────────────────────────────────────────────────────
  const handleToggle = async (id: string) => {
    const svc = services.find(s => s.id === id);
    if (!svc) return;
    const newActive = !svc.active;

    // Optimistic update
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: newActive } : s));

    const { error } = await supabase
      .from("services")
      .update({ is_active: newActive })
      .eq("id", id);

    if (error) {
      // Revert
      setServices(prev => prev.map(s => s.id === id ? { ...s, active: svc.active } : s));
      showToast("Failed to update status.");
    } else {
      showToast(`${svc.name} set to ${newActive ? "Active" : "Inactive"}`, newActive);
    }
  };

  // ── Delete service ────────────────────────────────────────────────────────────
  const handleDelete = (id: string) => setDeleteId(id);

  const confirmDelete = async () => {
    const svc = services.find(s => s.id === deleteId);
    if (!svc) { setDeleteId(null); return; }

    if (!svc.id.startsWith("new-")) {
      // service_pricing rows cascade-delete with the service
      const { error } = await supabase.from("services").delete().eq("id", svc.id);
      if (error) {
        setDeleteId(null);
        showToast("Failed to delete service.");
        return;
      }
    }

    setServices(prev => prev.filter(s => s.id !== deleteId));
    setDeleteId(null);
    if (view === "edit") setView("list");
    if (svc) showToast(`${svc.name} removed`);
  };

  const editSvc = services.find(s => s.id === editId);

  return (
    <main className="ovw-main">

      {/* Content */}
      <div className="ovw-content">
        {view === "list" ? (
          <ServiceList
            services={services}
            loading={loading}
            onAdd={handleAdd}
            onEdit={openEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ) : editSvc ? (
          <EditPage
            svc={editSvc}
            isNew={editSvc.id.startsWith("new-")}
            saving={saving}
            onSave={handleSave}
            onBack={() => {
              if (editSvc.id.startsWith("new-")) setServices(prev => prev.filter(s => s.id !== editSvc.id));
              setView("list");
            }}
            onDelete={() => handleDelete(editSvc.id)}
          />
        ) : null}
      </div>

      {/* Delete modal */}
      {deleteId && (
        <DeleteModal
          name={services.find(s => s.id === deleteId)?.name ?? ""}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} success={toast.success} />}
    </main>
  );
}
