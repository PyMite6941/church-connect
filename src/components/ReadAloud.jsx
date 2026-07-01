import { useState, useEffect } from "react";
import { useI18n } from "../context/LanguageContext";

// Reads the current page's main content aloud using the browser's built-in
// speech synthesis (no external service). Helps blind, low-literacy, and
// dyslexic users. Speaks in the user's chosen language.
export default function ReadAloud() {
  const { t, lang } = useI18n();
  const [speaking, setSpeaking] = useState(false);

  // Stop speech if the component unmounts.
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  if (!supported) return null;

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const text = document.querySelector("main")?.innerText?.trim();
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  };

  return (
    <button
      className="cc-btn-ghost"
      onClick={toggle}
      aria-label={speaking ? t("stopReading") : t("readAloud")}
      title={speaking ? t("stopReading") : t("readAloud")}
    >
      {speaking ? "⏹" : "🔊"}
    </button>
  );
}
