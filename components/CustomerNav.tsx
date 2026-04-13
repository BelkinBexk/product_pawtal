"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LanguageContext";

export default function CustomerNav() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState<string>("");
  const [lang, setLang] = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.first_name as string | undefined;
      if (name) setFirstName(name);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const navLinks = [
    { label: lang === "en" ? "Home"       : "หน้าหลัก", href: "/" },
    { label: lang === "en" ? "Deals"      : "ดีล",      href: "/deals" },
    { label: lang === "en" ? "Explore"    : "สำรวจ",    href: "/explore" },
    { label: lang === "en" ? "My Booking" : "การจอง",   href: "/bookings" },
  ];

  return (
    <nav className="cust-nav">
      <div className="cust-nav-inner">
        {/* Logo */}
        <Link href="/" className="cust-nav-logo">Pawtal</Link>

        {/* Centre links */}
        <div className="cust-nav-links">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`cust-nav-link${pathname === l.href || pathname.startsWith(l.href + "/") ? " active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side: language toggle + account */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

        {/* Language toggle */}
        <div className="cust-nav-lang-toggle">
          <button
            className={`cust-nav-lang-btn${lang === "en" ? " active" : ""}`}
            onClick={() => setLang("en")}
          >EN</button>
          <button
            className={`cust-nav-lang-btn${lang === "th" ? " active" : ""}`}
            onClick={() => setLang("th")}
          >TH</button>
        </div>

        {/* My Account */}
        <div className="cust-nav-account-wrap" ref={ref}>
          <button
            className={`deals-nav-account${open ? " open" : ""}`}
            onClick={() => setOpen(v => !v)}
          >
            <div className="deals-nav-avatar" style={ firstName ? { background: "#17A8FF", color: "#fff", fontWeight: 700, fontSize: 15 } : {}}>
              {firstName
                ? firstName.charAt(0).toUpperCase()
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
              }
            </div>
            {firstName || (lang === "en" ? "My Account" : "บัญชีของฉัน")}
            <svg className="deals-nav-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {open && (
            <div className="deals-nav-dropdown">
              <Link href="/profile" className="deals-nav-dropdown-item" onClick={() => setOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                {lang === "en" ? "Profile Settings" : "ตั้งค่าโปรไฟล์"}
              </Link>
              <Link href="/pets" className="deals-nav-dropdown-item" onClick={() => setOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/>
                  <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5"/>
                  <path d="M8 14v.5A3.5 3.5 0 0 0 11.5 18h1a3.5 3.5 0 0 0 3.5-3.5V14a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2z"/>
                  <path d="M6.5 17.5c-.8 1-1.5 1.5-2 2.5"/>
                  <path d="M17.5 17.5c.8 1 1.5 1.5 2 2.5"/>
                </svg>
                {lang === "en" ? "Pet Profiles" : "โปรไฟล์สัตว์เลี้ยง"}
              </Link>
              <div className="deals-nav-dropdown-divider" />
              <button className="deals-nav-dropdown-item deals-nav-signout" onClick={handleSignOut}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {lang === "en" ? "Sign Out" : "ออกจากระบบ"}
              </button>
            </div>
          )}
        </div>
        </div>{/* end right-side wrapper */}
      </div>
    </nav>
  );
}
