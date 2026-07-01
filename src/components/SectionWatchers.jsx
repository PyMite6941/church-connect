import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

// Shows the people an admin assigned to watch/steward a section (max 4). Renders
// nothing if no one is assigned. Placed at the top of each feature page.
export default function SectionWatchers({ featureKey }) {
  const { accounts } = useAuth();
  const { getFeatureOwners } = useSettings();
  const owners = getFeatureOwners(featureKey)
    .map((id) => accounts.find((a) => a.id === id))
    .filter(Boolean);

  if (owners.length === 0) return null;

  return (
    <p className="cc-watchers cc-muted">
      👁 Watched by {owners.map((o) => o.name).join(", ")}
    </p>
  );
}
