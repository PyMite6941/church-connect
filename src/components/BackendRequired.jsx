// Shown when the backend is required (default) but not configured. Church Connect
// stores real church data, so a hosted database is mandatory before use.
export default function BackendRequired() {
  return (
    <div className="cc-backend-gate">
      <div className="cc-card cc-backend-card">
        <h2>⚙️ Connect your storage</h2>
        <p className="cc-muted">
          Church Connect needs a database before it can run, so your church's data
          is safely hosted and shared across everyone — not stuck in one browser.
        </p>
        <p className="cc-muted">Set these environment variables (free Supabase tier works great):</p>
        <pre className="cc-backend-pre">{`VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY`}</pre>
        <p className="cc-muted">
          Full step-by-step (table SQL + security) is in <strong>BACKEND.md</strong>.
        </p>
        <p className="cc-muted cc-hint">
          Just exploring? Set <code>VITE_ALLOW_LOCAL=true</code> to run on local
          browser storage instead.
        </p>
      </div>
    </div>
  );
}
