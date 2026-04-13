"use client";
import { createContext, useContext, useState, useEffect } from "react";
export type Lang = "en" | "th";
const LanguageContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const stored = localStorage.getItem("pawtal_lang") as Lang | null;
    if (stored === "en" || stored === "th") setLangState(stored);
    const handler = (e: Event) => setLangState((e as CustomEvent<Lang>).detail);
    window.addEventListener("pawtal:lang", handler);
    return () => window.removeEventListener("pawtal:lang", handler);
  }, []);
  const setLang = (l: Lang) => {
    localStorage.setItem("pawtal_lang", l);
    window.dispatchEvent(new CustomEvent<Lang>("pawtal:lang", { detail: l }));
    setLangState(l);
  };
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}
export function useLang(): [Lang, (l: Lang) => void] {
  const ctx = useContext(LanguageContext);
  return [ctx.lang, ctx.setLang];
}
