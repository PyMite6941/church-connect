import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import CreateChurch from "./features/CreateChurch";
import { resolveTenantId } from "./config/tenants";
import "./styles/index.css";

const rootEl = document.getElementById("root");

// React Router basename (so routes work whether the app is hosted at "/" in dev
// or under "/demo/" in production).
const basename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

// Public "create a church" page — shown at /create or ?create, before any tenant
// is resolved or sign-in is required.
const params = new URLSearchParams(window.location.search);
const wantsCreate = window.location.pathname.replace(/\/$/, "").endsWith("/create") || params.has("create");

// Allow a host page to pin a tenant via #root[data-tenant]; otherwise resolve
// from subdomain / query / default.
const tenantId = resolveTenantId(rootEl.dataset.tenant || undefined);

createRoot(rootEl).render(
  <StrictMode>
    {wantsCreate ? (
      <CreateChurch />
    ) : (
      <BrowserRouter basename={basename}>
        <App tenantId={tenantId} />
      </BrowserRouter>
    )}
  </StrictMode>
);
