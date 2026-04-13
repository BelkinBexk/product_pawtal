"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type FurType = "Short fur" | "Long fur" | "Special / Double coat";
type SizeKey = "XXS" | "XS" | "S" | "M" | "L" | "XL" | "2XL";
type PriceMatrix = Partial<Record<FurType, Partial<Record<SizeKey, string>>>>;

interface Service {
  id:           string;
  name:         string;
  category:     string;
  duration:     number;
  bufferTime:   number;
  price:        string;
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

const DEFAULT_SERVICES: Service[] = [
  { id:"s1", name:"Full Grooming",     category:"Grooming",    duration:90,   bufferTime:15, price:"By size",  variesBySize:true,  matrix:{}, description:"", active:true  },
  { id:"s2", name:"Bath & Blowdry",    category:"Bath & Trim", duration:60,   bufferTime:15, price:"฿420",     variesBySize:false, matrix:{}, description:"", active:true  },
  { id:"s3", name:"Nail Trim",         category:"Grooming",    duration:15,   bufferTime:5,  price:"฿150",     variesBySize:false, matrix:{}, description:"", active:true  },
  { id:"s4", name:"Cat Grooming",      category:"Grooming",    duration:60,   bufferTime:15, price:"฿525",     variesBySize:false, matrix:{}, description:"", active:true  },
  { id:"s5", name:"Day Care (Full)",   category:"Day Care",    duration:480,  bufferTime:0,  price:"฿800",     variesBySize:false, matrix:{}, description:"", active:true  },
  { id:"s6", name:"Training Session",  category:"Training",    duration:60,   bufferTime:15, price:"฿680",     variesBySize:false, matrix:{}, description:"", active:false },
  { id:"s7", name:"Boarding (1 night)",category:"Boarding",    duration:1440, bufferTime:0,  price:"฿950",     variesBySize:false, matrix:{}, description:"", active:true  },
];

function fmtDuration(min: number) {
  if (min < 60) return `${min} min`;
  if (min % 60 === 0) return `${min / 60}h`;
  return `${Math.floor(min / 60)}h ${min % 60}min`;
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
function EditPage({ svc, isNew, onSave, onBack, onDelete }: {
  svc: Service; isNew: boolean;
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
        <button className="svc-edit-back" onClick={onBack}>
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
                  value={form.price.replace(/[฿,]/g, "") || "0"}
                  placeholder="0"
                  onChange={e => set("price", e.target.value)} />
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
        <button className="svc-edit-back" style={{ color:"#ef4444" }} onClick={onDelete}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {isNew ? "Discard" : "Delete service"}
        </button>
        <div style={{ display:"flex", gap:10 }}>
          <button className="prof-discard-btn" onClick={onBack}>Cancel</button>
          <button className="prof-save-btn" onClick={handleSave}>
            {isNew ? "Add Service" : "Save Changes"}
          </button>
        </div>
      </div>

    </div>
  );
}

// ── List page ─────────────────────────────────────────────────────────────────
function ServiceList({ services, onAdd, onEdit, onToggle, onDelete }: {
  services: Service[];
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
              {activeCount} active · {services.length} total
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
              {services.map(s => (
                <ServiceRow key={s.id} svc={s}
                  onEdit={() => onEdit(s.id)}
                  onToggle={() => onToggle(s.id)}
                  onDelete={() => onDelete(s.id)} />
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign:"center", padding:"48px 0", color:"#7eb5d6", fontSize:13 }}>
                    No services yet. Click &ldquo;Add service&rdquo; to get started.
                  </td>
                </tr>
              )}
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
      <td className="svc-price">{svc.price}</td>
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
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [view,     setView]     = useState<"list" | "edit">("list");
  const [editId,   setEditId]   = useState<string | null>(null);
  const [toast,    setToast]    = useState<{ msg: string; success: boolean } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const showToast = (msg: string, success = false) => {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 2800);
  };

  const openEdit = (id: string) => { setEditId(id); setView("edit"); };

  const handleAdd = () => {
    const id = `s-${Date.now()}`;
    const blank: Service = {
      id, name: "", category: "Grooming", duration: 60, bufferTime: 15,
      price: "", variesBySize: false, matrix: {}, description: "", active: true,
    };
    setServices(prev => [...prev, blank]);
    openEdit(id);
  };

  const handleSave = (updated: Service) => {
    const price = updated.variesBySize
      ? "By size"
      : `฿${parseInt(updated.price.replace(/[฿,]/g, "") || "0").toLocaleString()}`;
    const final = { ...updated, price };
    setServices(prev => prev.map(s => s.id === final.id ? final : s));
    setView("list");
    showToast(`${final.name} saved!`, true);
  };

  const handleToggle = (id: string) => {
    setServices(prev => prev.map(s => {
      if (s.id !== id) return s;
      const next = { ...s, active: !s.active };
      showToast(`${s.name} set to ${next.active ? "Active" : "Inactive"}`, next.active);
      return next;
    }));
  };

  const handleDelete = (id: string) => setDeleteId(id);

  const confirmDelete = () => {
    const svc = services.find(s => s.id === deleteId);
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
            onAdd={handleAdd}
            onEdit={openEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ) : editSvc ? (
          <EditPage
            svc={editSvc}
            isNew={!editSvc.name}
            onSave={handleSave}
            onBack={() => {
              // discard blank if cancelling a new unsaved service
              if (!editSvc.name) setServices(prev => prev.filter(s => s.id !== editSvc.id));
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
