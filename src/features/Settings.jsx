import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useI18n } from "../context/LanguageContext";
import { FEATURES, ALL_FEATURE_KEYS, featureLabel } from "./registry";
import { useTenant } from "../context/TenantContext";

// Admin-only control panel: features on/off, customize each, rename + add
// channels, assign watchers, and church-wide sign-in / privacy.
export default function Settings() {
  const { isAdmin, accounts } = useAuth();
  const tenant = useTenant();
  const { t } = useI18n();
  const s = useSettings();
  const [newChannel, setNewChannel] = useState({ label: "", icon: "" });

  if (!isAdmin) return <p className="cc-muted">Admins only.</p>;

  const enabledCount = ALL_FEATURE_KEYS.filter(s.isEnabled).length;

  const Toggle = ({ checked, onChange }) => (
    <label className="cc-switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="cc-slider" />
      <span className="cc-switch-label">{checked ? "On" : "Off"}</span>
    </label>
  );

  const Watchers = ({ featureKey }) => {
    const owners = s.getFeatureOwners(featureKey);
    return (
      <div className="cc-owners">
        <div className="cc-muted">Who watches this section? ({owners.length}/{s.maxOwners})</div>
        <div className="cc-owner-chips">
          {accounts.map((a) => {
            const checked = owners.includes(a.id);
            const atCap = owners.length >= s.maxOwners;
            return (
              <label key={a.id} className={`cc-chip ${checked ? "cc-chip-on" : ""} ${!checked && atCap ? "cc-chip-disabled" : ""}`}>
                <input type="checkbox" checked={checked} disabled={!checked && atCap} onChange={() => s.toggleFeatureOwner(featureKey, a.id)} />
                {a.name}
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section>
      <h2>{t("settings")}</h2>
      <p className="cc-muted">
        Turn features on or off, rename or add channels, choose who looks after
        each, and set church-wide sign-in. New to these? See the <Link to="/help">Help guide</Link>.
      </p>

      {/* Church-wide */}
      <h3>Church-wide</h3>
      <div className="cc-card cc-setting">
        <div className="cc-setting-head">
          <div className="cc-grow">
            <strong>🔐 Require a password to sign in</strong>
            <div className="cc-muted">Off = a name is enough for members. Admins always need their password.</div>
          </div>
          <Toggle checked={s.requirePassword} onChange={s.setRequirePassword} />
        </div>
      </div>
      <div className="cc-card cc-setting">
        <div className="cc-setting-head">
          <div className="cc-grow">
            <strong>🕶️ Allow posting without your name</strong>
            <div className="cc-muted">Lets people submit prayer requests and meal sign-ups anonymously.</div>
          </div>
          <Toggle checked={s.allowAnonymous} onChange={s.setAllowAnonymous} />
        </div>
      </div>

      {/* Built-in features */}
      <h3>Features <span className="cc-muted">({enabledCount} of {ALL_FEATURE_KEYS.length} on)</span></h3>
      <ul className="cc-list">
        {ALL_FEATURE_KEYS.map((key) => {
          const feat = FEATURES[key];
          const on = s.isEnabled(key);
          return (
            <li key={key} className="cc-card cc-setting">
              <div className="cc-setting-head">
                <div className="cc-grow"><strong>{feat.icon} {s.channelLabel(key, featureLabel(key, tenant))}</strong></div>
                <Toggle checked={on} onChange={(v) => s.toggleFeature(key, v)} />
              </div>

              {on && (
                <div className="cc-setting-opts">
                  <label className="cc-opt-row">
                    <span className="cc-muted">Name shown in the menu</span>
                    <input
                      className="cc-rename"
                      value={s.channelLabel(key, featureLabel(key, tenant))}
                      onChange={(e) => s.setChannelLabel(key, e.target.value)}
                    />
                  </label>
                  {feat.options.map((opt) => {
                    const current = s.getFeatureOption(key, opt.key) ?? opt.default;
                    return (
                      <label key={opt.key} className="cc-opt-row">
                        <span className="cc-muted">{opt.label}</span>
                        <select value={current} onChange={(e) => s.setFeatureOption(key, opt.key, e.target.value)}>
                          {opt.choices.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                        </select>
                      </label>
                    );
                  })}
                  <Watchers featureKey={key} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Custom channels */}
      <h3>Your own channels</h3>
      <p className="cc-muted">Add extra sections unique to your church — a youth board, a missions page, anything.</p>
      <ul className="cc-list">
        {s.customChannels.map((c) => (
          <li key={c.key} className="cc-card cc-setting">
            <div className="cc-setting-head">
              <div className="cc-grow"><strong>{c.icon} {c.label}</strong></div>
              <button className="cc-btn-ghost" onClick={() => s.removeCustomChannel(c.key)}>Delete</button>
            </div>
            <div className="cc-setting-opts">
              <label className="cc-opt-row">
                <span className="cc-muted">Channel name</span>
                <input className="cc-rename" value={c.label} onChange={(e) => s.setChannelLabel(c.key, e.target.value)} />
              </label>
              <Watchers featureKey={c.key} />
            </div>
          </li>
        ))}
        {s.customChannels.length === 0 && <li className="cc-muted">No custom channels yet.</li>}
      </ul>
      <form
        className="cc-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!newChannel.label.trim()) return;
          s.addCustomChannel(newChannel.label.trim(), newChannel.icon.trim());
          setNewChannel({ label: "", icon: "" });
        }}
      >
        <h3>Add a channel</h3>
        <input placeholder="Channel name (e.g. Youth)" value={newChannel.label} onChange={(e) => setNewChannel({ ...newChannel, label: e.target.value })} />
        <input placeholder="Emoji icon (optional, e.g. 🔥)" value={newChannel.icon} onChange={(e) => setNewChannel({ ...newChannel, icon: e.target.value })} />
        <button className="cc-btn" type="submit">Add channel</button>
      </form>
    </section>
  );
}
