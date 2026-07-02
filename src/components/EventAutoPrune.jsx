import { useEffect } from "react";
import { useCollection } from "../context/DataContext";
import { useFeatureOption } from "../context/SettingsContext";

// When "Auto-delete past events" is on, removes events dated before today. Mounted
// in the app shell, so it runs whenever ANYONE is signed in — not only when the
// Events page is open. Today's events are kept. Renders nothing.
export default function EventAutoPrune() {
  const { items, loading, replaceAll } = useCollection("events");
  const pastEvents = useFeatureOption("events", "pastEvents", "keep");

  useEffect(() => {
    if (pastEvents !== "delete" || loading) return;
    const today = new Date().toISOString().slice(0, 10);
    const kept = items.filter((ev) => !(ev.date && ev.date < today));
    if (kept.length !== items.length) replaceAll(kept);
  }, [pastEvents, loading, items, replaceAll]);

  return null;
}
