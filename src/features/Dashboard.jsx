import { useTenant } from "../context/TenantContext";
import { useCollection } from "../context/DataContext";

export default function Dashboard() {
  const tenant = useTenant();
  const events = useCollection("events");
  const announcements = useCollection("announcements");
  const prayer = useCollection("prayer");

  const nextEvent = events.items
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const pinned = announcements.items.find((a) => a.pinned);

  return (
    <section>
      <h2>Welcome to {tenant.name}</h2>
      <p className="cc-muted">{tenant.tagline}</p>

      <div className="cc-grid">
        <div className="cc-card cc-tile">
          <h3>Next event</h3>
          {nextEvent ? (
            <p>{nextEvent.title}<br /><span className="cc-muted">{nextEvent.date} {nextEvent.time}</span></p>
          ) : (
            <p className="cc-muted">Nothing scheduled.</p>
          )}
        </div>
        <div className="cc-card cc-tile">
          <h3>Announcement</h3>
          <p>{pinned ? pinned.title : <span className="cc-muted">No pinned announcement.</span>}</p>
        </div>
        <div className="cc-card cc-tile">
          <h3>Prayer requests</h3>
          <p>{prayer.items.length} active</p>
        </div>
      </div>
    </section>
  );
}
