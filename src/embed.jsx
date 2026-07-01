import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { resolveTenantId } from "./config/tenants";
import styles from "./styles/index.css?inline";

// Embeddable entry. Lets any external site mount Church Connect into a div.
// Uses MemoryRouter (no URL takeover) so it coexists with the host's routing,
// and injects styles inline so it needs no separate CSS file.
//
//   import { mount } from "church-connect";
//   mount(document.querySelector("#cc"), { tenant: "grace-community" });
//
// Or, via the IIFE build (build:embed), auto-mounts onto #church-connect using
// the script tag's data-tenant attribute.
export function mount(target, options = {}) {
  if (!target) throw new Error("church-connect: mount target not found");

  // Scope styles to the widget.
  const styleTag = document.createElement("style");
  styleTag.textContent = styles;
  target.appendChild(styleTag);

  const tenantId = resolveTenantId(options.tenant);
  const root = createRoot(target);
  root.render(
    <StrictMode>
      <MemoryRouter>
        <App tenantId={tenantId} />
      </MemoryRouter>
    </StrictMode>
  );
  return () => root.unmount();
}

// Auto-mount for the <script> use case.
if (typeof document !== "undefined") {
  const el = document.getElementById("church-connect");
  if (el && !el.dataset.ccMounted) {
    el.dataset.ccMounted = "1";
    const script = document.currentScript;
    mount(el, { tenant: script?.dataset.tenant || el.dataset.tenant });
  }
}
