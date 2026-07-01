import { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { translations, RTL_LANGS } from "../i18n/translations";

// Language comes from the signed-in user's own setting (account.lang), editable
// on My Account. Falls back to the browser language, then English.
const LanguageContext = createContext(null);

function detectLang() {
  const nav = (navigator.language || "en").slice(0, 2);
  return translations[nav] ? nav : "en";
}

export function LanguageProvider({ children }) {
  const { user, updateProfile } = useAuth();
  const lang = user?.lang && translations[user.lang] ? user.lang : detectLang();

  // Reflect language + text direction on the document (RTL for Arabic/Hebrew).
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  }, [lang]);

  // Dyslexia-friendly font — per-user accessibility preference.
  useEffect(() => {
    document.documentElement.classList.toggle("cc-dyslexic", !!user?.dyslexiaFont);
  }, [user?.dyslexiaFont]);

  // Persist the choice on the user's account.
  const setLang = (code) => updateProfile({ lang: code });

  // Translate a key; falls back to English, then the key itself.
  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
