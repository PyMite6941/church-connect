// Giving is intentionally a thin, configurable placeholder: most churches route
// to an external processor (Tithe.ly, Stripe, PayPal). Wire the tenant's link
// here, or replace with an embedded checkout.
import { useTenant } from "../context/TenantContext";
import SectionWatchers from "../components/SectionWatchers";

export default function Giving() {
  const tenant = useTenant();
  const givingUrl = tenant.givingUrl; // add `givingUrl` to a tenant config to enable

  return (
    <section>
      <h2>Giving</h2>
      <SectionWatchers featureKey="giving" />
      <p className="cc-muted">Support the ministry of {tenant.name}.</p>
      {givingUrl ? (
        <a className="cc-btn" href={givingUrl} target="_blank" rel="noreferrer">
          Give online
        </a>
      ) : (
        <p className="cc-muted">
          No giving link configured yet. Add <code>givingUrl</code> to this tenant's
          config to enable online giving.
        </p>
      )}
    </section>
  );
}
