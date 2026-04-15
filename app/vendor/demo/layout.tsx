"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ── Demo shop ─────────────────────────────────────────────────────────────────
const DEMO_SHOP = { name: "Fluffy & Fresh Studio", area: "Sukhumvit, Bangkok", initials: "FF" };

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV_MAIN = [
  {
    key: "overview", label: "Overview", href: "/vendor/demo/dashboard", badge: null,
    icon: `<svg viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.4"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.4"/></svg>`,
  },
  {
    key: "calendar", label: "Calendar", href: "/vendor/demo/calendar", badge: null,
    icon: `<svg viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M5 1v2M11 1v2M1 6h14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="5" cy="10" r="1" fill="currentColor"/><circle cx="8" cy="10" r="1" fill="currentColor"/><circle cx="11" cy="10" r="1" fill="currentColor"/></svg>`,
  },
  {
    key: "bookings", label: "Bookings", href: "/vendor/demo/bookings", badge: "3",
    icon: `<svg viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M5 1v2M11 1v2M1 6h14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  },
  {
    key: "revenue", label: "Revenue", href: "/vendor/demo/revenue", badge: null,
    icon: `<svg viewBox="0 0 16 16" fill="none"><path d="M2 12l3.5-4 3 2.5L12 5l2 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 14h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  },
  {
    key: "reviews", label: "Reviews", href: "/vendor/demo/reviews", badge: "2",
    icon: `<svg viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4 4.3 12.3l.7-4.1L2 5.3l4.2-.7z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
  },
  {
    key: "customers", label: "Customers", href: "/vendor/demo/customers", badge: null,
    icon: `<svg viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/><path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="12" cy="7" r="2" stroke="currentColor" stroke-width="1.3"/><path d="M14 13c0-1.66-.9-3-2-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
  },
];

const NAV_SETTINGS = [
  {
    key: "profile", label: "Profile & Settings", href: "/vendor/demo/dashboard", badge: null,
    icon: `<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/><path d="M2 13c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  },
  {
    key: "services", label: "Services", href: "/vendor/demo/dashboard", badge: null,
    icon: `<svg viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="13" cy="12" r="2" stroke="currentColor" stroke-width="1.3"/></svg>`,
  },
];

const PAGE_TITLES: Record<string, string> = {
  "/vendor/demo/dashboard": "Overview",
  "/vendor/demo/calendar":  "Calendar",
  "/vendor/demo/bookings":  "Bookings",
  "/vendor/demo/revenue":   "Revenue",
  "/vendor/demo/reviews":   "Reviews",
  "/vendor/demo/customers": "Customers",
};

function getPageTitle(pathname: string) {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || pathname.startsWith(path + "/")) return title;
  }
  return "Dashboard";
}

// ── Demo notifications ────────────────────────────────────────────────────────
const NOTIFS = [
  { id: "n1", text: "<strong>Butter · Mintra S.</strong> just booked Full Grooming — today 9:00am", time: "Just now", color: "#17A8FF", initials: "M", unread: true },
  { id: "n2", text: "<strong>Mochi · Warat C.</strong> Bath & Brush booking confirmed — today 10:30am", time: "5 min ago", color: "#22c55e", initials: "W", unread: true },
  { id: "n3", text: "<strong>Mintra S.</strong> left a ★★★★★ review for Butter's last session", time: "2 hrs ago", color: "#F5A623", initials: "M", unread: false },
  { id: "n4", text: "Payout of <strong>฿21,360</strong> will be transferred in 2 business days", time: "Yesterday", color: "#0B93E8", initials: "฿", unread: false },
  { id: "n5", text: "<strong>Nala · Anchana P.</strong> booked Cat Grooming — tomorrow 10:00am", time: "Yesterday", color: "#8b5cf6", initials: "A", unread: false },
];

// ── Topbar ────────────────────────────────────────────────────────────────────
function DemoTopbar() {
  const pathname = usePathname();
  const [date, setDate] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFS);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    if (notifOpen) document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [notifOpen]);

  const unreadCount = notifs.filter(n => n.unread).length;
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
  const readNotif = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));

  return (
    <div className="vd-shared-topbar">
      <div className="vd-shared-topbar-title">{getPageTitle(pathname)}</div>
      <div className="vd-shared-topbar-right">
        <span className="vd-shared-topbar-date">{date}</span>

        {/* Notification bell */}
        <div className="notif-wrap-v2" ref={notifRef}>
          <div className="notif-btn-v2" onClick={() => setNotifOpen(o => !o)}>
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
              <path d="M8 1a5 5 0 015 5v2.5l1 2H2l1-2V6a5 5 0 015-5z" stroke="#5a8fa8" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M6 13a2 2 0 004 0" stroke="#5a8fa8" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            {unreadCount > 0 && <div className="notif-count-v2">{unreadCount}</div>}
          </div>
          {notifOpen && (
            <div className="notif-popover-v2 open">
              <div className="notif-pop-header-v2">
                <div className="notif-pop-title-v2">Notifications</div>
                <div className="notif-pop-clear-v2" onClick={markAllRead}>Mark all read</div>
              </div>
              <div className="notif-pop-list-v2">
                {notifs.map(n => (
                  <div key={n.id} className={`notif-item-v2${n.unread ? " unread" : ""}`} onClick={() => readNotif(n.id)}>
                    <div className="notif-icon-v2" style={{ background: n.color }}>{n.initials}</div>
                    <div className="notif-content-v2">
                      <div className="notif-text-v2" dangerouslySetInnerHTML={{ __html: n.text }} />
                      <div className="notif-time-v2">{n.time}</div>
                    </div>
                    {n.unread && <div className="notif-unread-dot-v2" />}
                  </div>
                ))}
              </div>
              <div className="notif-pop-footer-v2">
                <Link href="/vendor/demo/bookings" onClick={() => setNotifOpen(false)}>View all bookings →</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function DemoSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="vd-sidebar">
      <div className="vd-sidebar-top">
        <div className="vd-sidebar-logo">PAWTAL</div>
        <div className="vd-sidebar-tag">Vendor Dashboard</div>
      </div>

      <div className="vd-sidebar-profile">
        <div className="vd-sidebar-avatar">{DEMO_SHOP.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="vd-sidebar-name">{DEMO_SHOP.name}</div>
          <div className="vd-sidebar-biz">{DEMO_SHOP.area}</div>
        </div>
        <div className="vd-sidebar-status"><div className="vd-status-dot" /></div>
      </div>

      <nav className="vd-sidebar-nav">
        <div className="vd-nav-section-label">Main</div>
        {NAV_MAIN.map(item => (
          <Link key={item.key} href={item.href}
            className={`vd-nav-item${isActive(item.href) ? " active" : ""}`}>
            <span className="vd-nav-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
            <span className="vd-nav-label">{item.label}</span>
            {item.badge && <span className="vd-nav-badge">{item.badge}</span>}
          </Link>
        ))}

        <div className="vd-nav-section-label" style={{ marginTop: 16 }}>Settings</div>
        {NAV_SETTINGS.map(item => (
          <Link key={item.key} href={item.href}
            className={`vd-nav-item${isActive(item.href) ? " active" : ""}`}>
            <span className="vd-nav-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
            <span className="vd-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="vd-sidebar-bottom">
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#7eb5d6",
          fontWeight: 500, padding: "10px 12px", borderRadius: 8, textDecoration: "none",
          transition: "background 0.15s",
        }}>
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to main site
        </Link>
      </div>
    </aside>
  );
}

// ── Demo banner ───────────────────────────────────────────────────────────────
function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div style={{
      background: "linear-gradient(90deg, #003459 0%, #0B7AC8 100%)",
      color: "#fff", fontSize: 12, fontWeight: 500,
      padding: "10px 20px", display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 12, flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          background: "rgba(255,255,255,0.2)", borderRadius: 100,
          padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
        }}>PREVIEW</span>
        <span>This is a sample demo with mock data — showing what your Pawtal dashboard looks like when fully set up.</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <Link href="/signup" style={{ color: "#fff", fontWeight: 700, textDecoration: "underline", fontSize: 12 }}>
          Create your free account →
        </Link>
        <button onClick={() => setDismissed(true)} style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.6)",
          cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0,
        }}>×</button>
      </div>
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="vd-layout">
      <DemoSidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <DemoBanner />
        <DemoTopbar />
        {children}
      </div>
    </div>
  );
}
