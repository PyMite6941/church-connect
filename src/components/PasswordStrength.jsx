// Lightweight password-strength meter shown under any password field.
// scorePassword returns 0–4; callers can also use it to enforce a minimum.
export function scorePassword(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

const LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"];

export default function PasswordStrength({ value }) {
  if (!value) return null;
  const score = scorePassword(value);
  return (
    <div className="cc-strength">
      <div className="cc-strength-bar">
        <div className={`cc-strength-fill s${score}`} style={{ width: `${(score / 4) * 100}%` }} />
      </div>
      <span className="cc-muted cc-strength-label">{LABELS[score]}</span>
    </div>
  );
}
