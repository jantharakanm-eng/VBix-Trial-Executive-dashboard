// Brand palette (ThaiBev green + gold)
export const C = {
  green: "#0f6b3f",
  greenSoft: "#e7f2ec",
  gold: "#b8892b",
  goldSoft: "#f8f0de",
  red: "#c4552d",
  redSoft: "#fbe9e3",
  teal: "#2f7f8f",
  tealSoft: "#e3f1f3",
  ink: "#1d2a24",
  sub: "#5f6f67",
  line: "#e6ebe8",
  bg: "#f4f6f5",
  card: "#ffffff"
};

// Control types (HAP): number-like and label-like fields
export const NUMERIC_TYPES = [6, 8, 31, 37, 30];
export const LABEL_TYPES = [2, 9, 10, 11, 26, 27, 29, 30, 32];
export const OPTION_TYPES = [9, 10, 11];
export const DATE_TYPES = [15, 16, 38];
export const CHECKBOX_TYPE = 36;

// Status label -> color + role. First match wins, so "ประกาศขาย" must precede "ขาย".
const STATUS_RULES = [
  { match: /ประกาศขาย/, color: "#6b4fa0", role: "listing" },
  { match: /ใช้งาน|in use/i, color: "#0f6b3f", role: "use" },
  { match: /ยืม/, color: "#3d8f6a", role: "use" },
  { match: /ว่าง|คลัง|idle/i, color: "#d9a43a", role: "idle" },
  { match: /ซ่อม|repair/i, color: "#c4552d", role: "repair" },
  { match: /ตรวจสอบ/, color: "#2f7f8f", role: "review" },
  { match: /ขาย/, color: "#8c7b55", role: "out" },
  { match: /ตัดจำหน่าย/, color: "#9aa5a0", role: "out" },
  { match: /สูญหาย/, color: "#5b6560", role: "out" }
];
const FALLBACK_STATUS = { color: "#c9d1cd", role: "other" };

export const statusRule = (label) => STATUS_RULES.find((r) => r.match.test(label)) || FALLBACK_STATUS;

// Patterns used to count "waiting" records in sibling worksheets
export const PENDING_REQUEST = /รออนุมัติ|รอพิจารณา|ระหว่างอนุมัติ|pending/i;
export const PENDING_SAP = /^รอ|pending/i;

export const UNKNOWN = "ไม่ระบุ";
