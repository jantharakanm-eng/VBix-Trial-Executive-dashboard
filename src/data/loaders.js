import { api, apis } from "mdye";
import { CHECKBOX_TYPE, DATE_TYPES, LABEL_TYPES, NUMERIC_TYPES, PENDING_REQUEST, PENDING_SAP } from "../constants";
import { cellLabel, cellNumber, envValue, findControl, titleControl } from "../utils/fields";

const PAGE_SIZE = 500;
const MAX_PAGES = 40; // 20,000 rows safety cap
const TIMEOUT_MS = 15000;

// Calls go to the host page via postMessage; if the host never answers the promise never settles.
function withTimeout(promise, what) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`ไม่ตอบกลับภายใน ${TIMEOUT_MS / 1000} วินาที (${what})`)), TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function errorText(e) {
  if (!e) return "ไม่ทราบสาเหตุ";
  const msg = e.message || e.errorMsg || e.msg;
  if (msg) return msg;
  try {
    return JSON.stringify(e).slice(0, 200); // host errors arrive as plain objects
  } catch (_) {
    return String(e);
  }
}

// ---------- load report (shown in the on-screen "แหล่งข้อมูล" panel) ----------
// sources[key] = { status: "loading" | "ok" | "error", sheetName, worksheetId, attempts: [{ view, result }], error }
export const sources = {};

export function resetSources() {
  Object.keys(sources).forEach((k) => delete sources[k]);
}

async function tracked(key, fn) {
  const report = { status: "loading", attempts: [] };
  sources[key] = report;
  try {
    const result = await fn(report);
    report.status = "ok";
    return result;
  } catch (e) {
    report.status = "error";
    report.error = errorText(e);
    throw e;
  }
}

// ---------- rows ----------
export async function loadAllRows(worksheetId, viewId) {
  let all = [];
  for (let pageIndex = 1; pageIndex <= MAX_PAGES; pageIndex++) {
    const res = await withTimeout(
      api.getFilterRows({ worksheetId, viewId, pageSize: PAGE_SIZE, pageIndex }),
      `getFilterRows หน้า ${pageIndex}`
    );
    if (!res || !Array.isArray(res.data)) throw new Error("ข้อมูลที่ได้ไม่ใช่รายการแถว");
    all = all.concat(res.data);
    if (res.data.length < PAGE_SIZE) break;
  }
  // Grouped views can return group headers instead of records; real records always have a rowid.
  return all.filter((r) => r && r.rowid);
}

// Rank views for executive totals: no filter first, then plain table, then ungrouped, then named "ทั้งหมด".
function viewScore(v) {
  const adv = v.advancedSetting || {};
  const grouped = !!adv.groupsetting && adv.groupsetting !== "[]";
  const filtered = (v.filters || []).length > 0 || (v.navGroup || []).length > 0;
  return (filtered ? 0 : 8) + (v.viewType === 0 ? 4 : 0) + (grouped ? 0 : 2) + (/ทั้งหมด|all/i.test(v.name || "") ? 1 : 0);
}
const plainViewsFirst = (views) => [...views].sort((a, b) => viewScore(b) - viewScore(a));

// Try each candidate view in order; record every attempt. First one that yields rows wins.
async function loadFirstWorking(worksheetId, candidates, report) {
  let lastError = null;
  for (const c of candidates) {
    try {
      const rows = await loadAllRows(worksheetId, c.viewId);
      report.attempts.push({ view: c.name, result: `${rows.length} แถว` });
      if (rows.length) return { rows, viewName: c.name };
    } catch (e) {
      lastError = e;
      report.attempts.push({ view: c.name, result: `ผิดพลาด: ${errorText(e)}` });
    }
  }
  if (lastError) throw lastError;
  return { rows: [], viewName: candidates.length ? candidates[0].name : "" };
}

// ---------- worksheets ----------
// Worksheet list rarely changes; cache the promise so parallel loaders share one request.
let sheetListPromise = null;
function listAppSheets(appId) {
  if (!sheetListPromise) {
    sheetListPromise = withTimeout(apis.homeApp.getWorksheetsByAppId({ appId, type: 0 }), "รายชื่อตาราง")
      .then((res) => {
        const list = Array.isArray(res) ? res : (res && (res.data || res.worksheets)) || [];
        return list.map((s) => ({
          id: s.workSheetId || s.worksheetId || s.id,
          name: (s.workSheetName || s.worksheetName || s.name || "").trim()
        }));
      })
      .catch((e) => {
        sheetListPromise = null; // allow retry on next refresh
        throw e;
      });
  }
  return sheetListPromise;
}

// Worksheet id: view param `<key>Sheet` first, then the first name pattern that matches.
async function resolveSheetId(appId, key, namePatterns) {
  const fromEnv = envValue(`${key}Sheet`);
  if (fromEnv) return fromEnv;
  const sheets = await listAppSheets(appId);
  const pattern = namePatterns.find((p) => sheets.some((s) => p.test(s.name)));
  if (!pattern) throw new Error(`ไม่พบตารางชื่อ ${namePatterns[0].source.replace(/[\^$]/g, "")} ในแอป`);
  return sheets.find((s) => pattern.test(s.name)).id;
}

async function getSheetInfo(worksheetId) {
  const info = (await withTimeout(
    apis.worksheet.getWorksheetInfo({ worksheetId, getTemplate: true, getViews: true }),
    "โครงสร้างตาราง"
  )) || {};
  return {
    name: info.name || "",
    controls: (info.template && info.template.controls) || [],
    views: info.views || []
  };
}

// Resolve a worksheet and load its controls + rows.
// Executive figures need every record: `<key>View` param if set, else the plainest views in turn.
// (viewId "" is not used: the host answers inconsistently — 0 rows on some sheets, a
// "Service exception" toast on others.)
async function loadSheet(appId, key, namePatterns, report) {
  const worksheetId = await resolveSheetId(appId, key, namePatterns);
  const { name, controls, views } = await getSheetInfo(worksheetId);
  Object.assign(report, { worksheetId, sheetName: name, fields: controls.length });

  const forced = envValue(`${key}View`);
  const candidates = forced
    ? [{ viewId: forced, name: (views.find((v) => v.viewId === forced) || {}).name || forced }]
    // at most 3 views, so a failing sheet can't stall the page for minutes
    : plainViewsFirst(views).slice(0, 3).map((v) => ({ viewId: v.viewId, name: v.name }));
  const { rows, viewName } = await loadFirstWorking(worksheetId, candidates, report);
  Object.assign(report, { viewName, rows: rows.length });
  return { worksheetId, sheetName: name, viewName, controls, rows };
}

// ---------- public loaders ----------
// The asset register. The plugin may be installed on another worksheet (e.g. a dashboard sheet),
// so look it up by name rather than trusting config.worksheetId; fall back to the current view.
export function loadAssets(appId, fallback) {
  return tracked("asset", async (report) => {
    try {
      return await loadSheet(appId, "asset", [/^ทะเบียนทรัพย์สิน$/, /ทะเบียนทรัพย์สิน/], report);
    } catch (e) {
      report.attempts.push({ view: "มุมมองที่ติดปลั๊กอิน", result: `ใช้แทนเพราะ: ${errorText(e)}` });
      const rows = await loadAllRows(fallback.worksheetId, fallback.viewId);
      Object.assign(report, { worksheetId: fallback.worksheetId, sheetName: "(ตารางที่ติดปลั๊กอิน)", rows: rows.length });
      return { ...fallback, sheetName: "", viewName: "", rows };
    }
  });
}

const findStatus = (controls) => findControl(controls, ["สถานะ", "status"], LABEL_TYPES);

// Requests waiting for approval (ใบ). null = status field not found.
export function loadPendingRequests(appId) {
  return tracked("request", async (report) => {
    const { controls, rows } = await loadSheet(appId, "request", [/^ใบคำขอ$/, /^ใบคำขอ/, /คำขอ/], report);
    const status = findStatus(controls);
    report.note = status ? `ช่องสถานะ: ${status.controlName}` : "ไม่พบช่องสถานะ";
    if (!status) return null;
    return rows.filter((r) => PENDING_REQUEST.test(cellLabel(r, status))).length;
  });
}

// SAP adjustments not yet posted. Uses status field, else a "posted" checkbox, else row count.
export function loadPendingSap(appId) {
  return tracked("sap", async (report) => {
    const { controls, rows } = await loadSheet(appId, "sap", [/ปรับปรุง\s*SAP/i, /SAP/i], report);
    const status = findStatus(controls);
    if (status) {
      report.note = `ช่องสถานะ: ${status.controlName}`;
      return rows.filter((r) => PENDING_SAP.test(cellLabel(r, status))).length;
    }
    const posted = findControl(controls, ["บันทึก SAP", "SAP แล้ว", "บันทึกแล้ว"], [CHECKBOX_TYPE]);
    if (posted) {
      report.note = `ช่องติ๊ก: ${posted.controlName}`;
      return rows.filter((r) => !["1", 1, true].includes(r[posted.controlId])).length;
    }
    report.note = "ไม่พบช่องสถานะ นับทุกแถว";
    return rows.length;
  });
}

// Latest stock-count rounds, newest first.
export function loadCountRounds(appId, limit = 5) {
  return tracked("count", async (report) => {
    const { worksheetId, controls, rows } = await loadSheet(appId, "count", [/^รอบตรวจนับ$/, /รอบตรวจนับ/], report);
    const f = {
      title: titleControl(controls),
      date: findControl(controls, ["วันที่ตรวจนับ", "วันที่"], DATE_TYPES),
      expected: findControl(controls, ["ควรพบ", "expected"], NUMERIC_TYPES),
      missing: findControl(controls, ["ไม่พบ", "missing"], NUMERIC_TYPES),
      found: findControl(controls, ["พบ", "found"], NUMERIC_TYPES, /ไม่พบ|ควรพบ/),
      status: findStatus(controls)
    };

    const list = rows.map((r) => {
      const expected = cellNumber(r, f.expected);
      const found = cellNumber(r, f.found);
      let missing = cellNumber(r, f.missing);
      if (missing === null && expected !== null && found !== null) missing = Math.max(expected - found, 0);
      return {
        rowid: r.rowid,
        no: f.title ? cellLabel(r, f.title) : r.rowid,
        date: (f.date && r[f.date.controlId]) || r.ctime || "",
        expected,
        found,
        missing,
        status: f.status ? cellLabel(r, f.status) : null
      };
    });
    list.sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.no).localeCompare(String(a.no)));
    return { worksheetId, list: list.slice(0, limit) };
  });
}
