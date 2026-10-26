import { env } from "mdye";
import { OPTION_TYPES, UNKNOWN } from "../constants";

// View parameter value; field-picker params arrive as arrays.
export function envValue(key) {
  const v = env && env[key];
  return Array.isArray(v) ? v[0] : v || null;
}

// First control whose name contains one of `keywords` (in priority order).
export function findControl(controls, keywords, types, exclude) {
  for (const kw of keywords) {
    const needle = kw.toLowerCase();
    const hit = controls.find((c) => {
      const name = c.controlName || "";
      return (
        (!types || types.includes(c.type)) &&
        name.toLowerCase().includes(needle) &&
        !(exclude && exclude.test(name))
      );
    });
    if (hit) return hit;
  }
  return null;
}

const isFilled = (raw) => raw !== undefined && raw !== null && raw !== "" && raw !== "[]";

// Like findControl, but when several controls match the same keyword it uses the data to
// choose: the most-filled one wins. Keyword priority always comes first, so a fuller but
// looser match (e.g. "มูลค่าค่าเสื่อมสะสม" for "มูลค่า") never beats "มูลค่าสุทธิ...".
export function pickControl(controls, rows, keywords, types, exclude) {
  const filled = (c) => rows.reduce((n, r) => (isFilled(r[c.controlId]) ? n + 1 : n), 0);
  for (const kw of keywords) {
    const needle = kw.toLowerCase();
    const candidates = controls.filter((c) => {
      const name = c.controlName || "";
      return (
        (!types || types.includes(c.type)) &&
        name.toLowerCase().includes(needle) &&
        !(exclude && exclude.test(name))
      );
    });
    if (candidates.length === 1 || (candidates.length && !rows.length)) return candidates[0];
    if (candidates.length) {
      return candidates
        .map((c, rank) => ({ c, rank, n: filled(c) }))
        .sort((a, b) => b.n - a.n || a.rank - b.rank)[0].c;
    }
  }
  return null;
}

export const titleControl = (controls) => controls.find((c) => c.attribute === 1) || null;

function parseJSON(raw) {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return raw;
  }
}

// Display text for any label-like cell (option, relation, member, department, text).
export function toLabel(raw, control) {
  if (raw === undefined || raw === null || raw === "" || raw === "[]") return UNKNOWN;
  const v = parseJSON(raw);
  if (control && OPTION_TYPES.includes(control.type)) {
    const first = Array.isArray(v) ? v[0] : v;
    if (first && typeof first === "object") return first.value || first.name || UNKNOWN; // [{ key, value }] form
    const opt = (control.options || []).find((o) => o.key === first);
    return opt ? opt.value : String(first);
  }
  if (Array.isArray(v)) {
    const first = v[0];
    if (first && typeof first === "object") {
      return first.name || first.fullname || first.departmentName || first.organizeName || UNKNOWN;
    }
    return first !== undefined ? String(first) : UNKNOWN;
  }
  return String(v);
}

// Number or null when the cell is empty / not numeric.
export function toNumber(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  const n = parseFloat(String(raw).replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

export const cellLabel = (row, control) => (control ? toLabel(row[control.controlId], control) : UNKNOWN);
export const cellNumber = (row, control) => (control ? toNumber(row[control.controlId]) : null);
