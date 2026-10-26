import { LABEL_TYPES, NUMERIC_TYPES, statusRule } from "../constants";
import { cellLabel, cellNumber, envValue, pickControl } from "../utils/fields";

// Locate the asset-register fields: view param first, then by name (most specific first),
// using the rows to break ties between look-alike fields.
export function detectFields(controls, rows) {
  const byId = (key) => controls.find((c) => c.controlId === envValue(key)) || null;
  const pick = (keywords, types) => pickControl(controls, rows, keywords, types);
  return {
    value: byId("valueField") || pick(["มูลค่าสุทธิ", "สุทธิ", "net book", "nbv", "มูลค่า"], NUMERIC_TYPES),
    status: byId("statusField") || pick(["สถานะทรัพย์สิน", "สถานะ", "status"], LABEL_TYPES),
    category: byId("categoryField") || pick(["หมวดทรัพย์สิน", "หมวด", "ประเภท", "category"], LABEL_TYPES),
    dept: byId("deptField") || pick(["หน่วยงานผู้ครอบครอง", "หน่วยงาน", "cost center", "ศูนย์ต้นทุน", "แผนก"], LABEL_TYPES)
  };
}

// Group rows by label, summing value; optionally fold the tail into one "rest" row.
function groupBy(rows, labelOf, valueOf, top, restLabel) {
  const map = new Map();
  rows.forEach((r) => {
    const label = labelOf(r);
    const g = map.get(label) || { label, count: 0, value: 0 };
    g.count += 1;
    g.value += valueOf(r);
    map.set(label, g);
  });
  const list = [...map.values()].sort((a, b) => b.value - a.value || b.count - a.count);
  if (!top || list.length <= top) return list;
  const rest = list.slice(top);
  return [
    ...list.slice(0, top),
    {
      label: restLabel(rest.length),
      count: rest.reduce((n, x) => n + x.count, 0),
      value: rest.reduce((n, x) => n + x.value, 0),
      rest: true
    }
  ];
}

export function buildStats(rows, f) {
  const valueOf = (r) => cellNumber(r, f.value) || 0;

  const statusMap = new Map();
  rows.forEach((r) => {
    const label = cellLabel(r, f.status);
    const s = statusMap.get(label) || { label, count: 0, ...statusRule(label) };
    s.count += 1;
    statusMap.set(label, s);
  });
  const statuses = [...statusMap.values()].sort((a, b) => b.count - a.count);
  const countRole = (role) => statuses.reduce((n, s) => (s.role === role ? n + s.count : n), 0);

  return {
    total: rows.length,
    totalValue: rows.reduce((n, r) => n + valueOf(r), 0),
    statuses,
    inUse: countRole("use"),
    idle: countRole("idle"),
    repair: countRole("repair"),
    categories: groupBy(rows, (r) => cellLabel(r, f.category), valueOf),
    depts: groupBy(rows, (r) => cellLabel(r, f.dept), valueOf)
  };
}
