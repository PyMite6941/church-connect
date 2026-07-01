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

  // Per-user accessibility preferences, applied as classes on <html>.
  useEffect(() => {
    const cl = document.documentElement.classList;
    cl.toggle("cc-dyslexic", !!user?.dyslexiaFont);
    cl.toggle("cc-text-large", user?.textScale === "large");
    cl.toggle("cc-text-larger", user?.textScale === "larger");
    cl.toggle("cc-dark", user?.display === "dark");
    cl.toggle("cc-contrast", user?.display === "contrast");
    cl.toggle("cc-roomy", !!user?.roomyText);
    cl.toggle("cc-reduce-motion", !!user?.reduceMotion);
  }, [user?.dyslexiaFont, user?.textScale, user?.display, user?.roomyText, user?.reduceMotion]);

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
