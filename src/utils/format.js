const pad = (n) => String(n).padStart(2, "0");

export const fmtInt = (n) => (n === null || n === undefined ? "—" : Math.round(n).toLocaleString("th-TH"));

export const fmtBaht = (n) => n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtMillion = (n) => (n / 1e6).toFixed(2);

export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

const fmtDay = (d) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;

export const fmtTime = (d) => `${fmtDay(d)} ${pad(d.getHours())}:${pad(d.getMinutes())} น.`;

// Accepts "2026-10-27" / "2026-10-27 10:00"; falls back to the raw text.
export function fmtDate(raw) {
  if (!raw) return "—";
  const d = new Date(String(raw).replace(/-/g, "/"));
  return isNaN(d) ? String(raw) : fmtDay(d);
}
