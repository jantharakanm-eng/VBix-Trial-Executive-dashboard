// Fake Nocoly host for previewing dist/bundle.js outside Nocoly (README screenshot).
// All data here is made up — it is NOT ThaiBev data.
(function () {
  // deterministic pseudo-random so the screenshot is stable
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const pick = (list, weights) => {
    let r = rand() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < list.length; i++) if ((r -= weights[i]) < 0) return list[i];
    return list[list.length - 1];
  };
  const opts = (names) => names.map((value, i) => ({ key: `k${i}`, value }));
  const keyOf = (options, value) => JSON.stringify([options.find((o) => o.value === value).key]);
  const rel = (name) => JSON.stringify([{ sid: name, name }]);

  // ---------- asset register ----------
  const STATUS = opts(["ใช้งาน", "ยืมอยู่", "ว่าง (ในคลัง)", "ส่งซ่อม", "รอตรวจสอบ", "ประกาศขาย", "ตัดจำหน่ายแล้ว", "ขายแล้ว"]);
  const CATS = ["คอมพิวเตอร์และอุปกรณ์ไอที", "เฟอร์นิเจอร์-อุปกรณ์สำนักงาน", "เครื่องใช้ไฟฟ้า", "โปรแกรมและลิขสิทธิ์"];
  const DEPTS = Array.from({ length: 14 }, (_, i) => `DEPT-${String(101 + i * 7)}`);
  const assetControls = [
    { controlId: "name", controlName: "ชื่อทรัพย์สิน", type: 2, attribute: 1 },
    { controlId: "nbv", controlName: "มูลค่าสุทธิตามบัญชี", type: 8 },
    { controlId: "status", controlName: "สถานะทรัพย์สิน", type: 11, options: STATUS },
    { controlId: "cat", controlName: "หมวดทรัพย์สิน", type: 29 },
    { controlId: "dept", controlName: "หน่วยงานผู้ครอบครอง", type: 29 }
  ];
  const assets = Array.from({ length: 412 }, (_, i) => {
    const cat = pick(CATS, [40, 45, 10, 5]);
    const base = { "คอมพิวเตอร์และอุปกรณ์ไอที": 9000, "เฟอร์นิเจอร์-อุปกรณ์สำนักงาน": 2200, "เครื่องใช้ไฟฟ้า": 5000, "โปรแกรมและลิขสิทธิ์": 2500 }[cat];
    return {
      rowid: `a${i}`,
      name: `ทรัพย์สินตัวอย่าง ${i + 1}`,
      nbv: (base * (0.2 + rand() * 1.6)).toFixed(2),
      status: keyOf(STATUS, pick(STATUS.map((o) => o.value), [380, 6, 12, 3, 2, 5, 3, 1])),
      cat: rel(cat),
      dept: rel(pick(DEPTS, DEPTS.map((_, j) => 14 - j + (j < 3 ? 10 : 0))))
    };
  });

  // ---------- sibling sheets ----------
  const REQ = opts(["รออนุมัติ", "อนุมัติแล้ว", "ไม่อนุมัติ"]);
  const SAP = opts(["รอบันทึก SAP", "บันทึก SAP แล้ว"]);
  const ROUND = opts(["กำลังตรวจนับ", "ปิดรอบแล้ว"]);
  const sheets = {
    asset: { name: "ทะเบียนทรัพย์สิน", controls: assetControls, rows: assets },
    req: {
      name: "ใบคำขอ",
      controls: [{ controlId: "st", controlName: "สถานะ", type: 11, options: REQ }],
      rows: Array.from({ length: 18 }, (_, i) => ({ rowid: `r${i}`, st: keyOf(REQ, i < 3 ? "รออนุมัติ" : "อนุมัติแล้ว") }))
    },
    sap: {
      name: "รายการปรับปรุง SAP",
      controls: [{ controlId: "st", controlName: "สถานะ", type: 11, options: SAP }],
      rows: Array.from({ length: 9 }, (_, i) => ({ rowid: `s${i}`, st: keyOf(SAP, i < 4 ? "รอบันทึก SAP" : "บันทึก SAP แล้ว") }))
    },
    count: {
      name: "รอบตรวจนับ",
      controls: [
        { controlId: "no", controlName: "เลขที่รอบ", type: 2, attribute: 1 },
        { controlId: "date", controlName: "วันที่ตรวจนับ", type: 15 },
        { controlId: "exp", controlName: "ควรพบ", type: 6 },
        { controlId: "fnd", controlName: "พบ", type: 6 },
        { controlId: "st", controlName: "สถานะ", type: 11, options: ROUND }
      ],
      rows: [
        { rowid: "c3", no: "CNT-2026-0011", date: "2026-10-27", exp: 48, fnd: 31, st: keyOf(ROUND, "กำลังตรวจนับ") },
        { rowid: "c2", no: "CNT-2026-0009", date: "2026-10-20", exp: 36, fnd: 36, st: keyOf(ROUND, "ปิดรอบแล้ว") },
        { rowid: "c1", no: "CNT-2026-0007", date: "2026-10-12", exp: 52, fnd: 49, st: keyOf(ROUND, "ปิดรอบแล้ว") }
      ]
    }
  };

  const delay = (v) => new Promise((r) => setTimeout(() => r(v), 30));
  window.env = {};
  window.config = { appId: "app", worksheetId: "dash", viewId: "v-dash", controls: [] };
  window.utils = { openRecordInfo: () => delay({ action: "close" }) };
  window.api = {
    getFilterRows: ({ worksheetId, pageSize, pageIndex }) => {
      const rows = (sheets[worksheetId] || { rows: [] }).rows;
      return delay({ data: rows.slice((pageIndex - 1) * pageSize, pageIndex * pageSize) });
    },
    call: (module, method, data) => {
      if (method === "getWorksheetsByAppId") {
        return delay(Object.entries(sheets).map(([id, s]) => ({ workSheetId: id, workSheetName: s.name })));
      }
      if (method === "getWorksheetInfo") {
        const s = sheets[data.worksheetId];
        return delay({ name: s.name, template: { controls: s.controls }, views: [{ viewId: "all", name: "ทั้งหมด", viewType: 0 }] });
      }
      return delay(null);
    }
  };
})();
