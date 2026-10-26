import React from "react";

const LABELS = {
  asset: "ทะเบียนทรัพย์สิน",
  request: "ใบคำขอ",
  sap: "รายการปรับปรุง SAP",
  count: "รอบตรวจนับ"
};
const STATUS_TEXT = { loading: "กำลังโหลด…", ok: "สำเร็จ", error: "ผิดพลาด" };
const FIELD_LABELS = { value: "มูลค่า", status: "สถานะ", category: "หมวด", dept: "หน่วยงาน" };

// Which asset columns the dashboard picked, with one raw value each, so a wrong pick is visible.
function FieldsUsed({ fields, rows }) {
  return (
    <div className="src-fields">
      {Object.keys(FIELD_LABELS).map((k) => {
        const c = fields[k];
        const sample = c && rows.map((r) => r[c.controlId]).find((v) => v !== undefined && v !== null && v !== "");
        return (
          <div key={k}>
            {FIELD_LABELS[k]} → {c ? <b>{c.controlName}</b> : <span className="src-error">ไม่พบ</span>}
            {c && <span> (type {c.type})</span>}
            {c && <span> ตัวอย่างค่า: <code>{sample === undefined ? "ว่างทุกแถว" : String(sample).slice(0, 80)}</code></span>}
          </div>
        );
      })}
    </div>
  );
}

// Shows where each number came from and what failed; opens by itself when something is wrong.
export default function SourcePanel({ report, fields, rows }) {
  const entries = Object.keys(LABELS).filter((k) => report[k]).map((k) => [k, report[k]]);
  if (!entries.length) return null;
  const hasProblem = entries.some(([k, r]) => r.status === "error" || (k === "asset" && r.status === "ok" && !r.rows));

  return (
    <details className="card sources" open={hasProblem}>
      <summary>
        แหล่งข้อมูล {hasProblem && <span className="src-warn">มีปัญหา — แคปส่วนนี้ส่งให้ผู้พัฒนาได้</span>}
      </summary>
      <div className="src-list">
        {entries.map(([key, r]) => (
          <div className="src-row" key={key}>
            <div className="src-head">
              <b>{LABELS[key]}</b>
              <span className={`src-status ${r.status}`}>{STATUS_TEXT[r.status]}</span>
            </div>
            <div className="src-meta">
              ตาราง: {r.sheetName || "—"} {r.worksheetId && <code>{r.worksheetId}</code>}
              {r.fields !== undefined && ` · ${r.fields} ช่อง`}
              {r.rows !== undefined && ` · ได้ ${r.rows} แถว`}
              {r.viewName && ` · จาก ${r.viewName}`}
              {r.note && ` · ${r.note}`}
            </div>
            {r.attempts.map((a, i) => (
              <div className="src-attempt" key={i}>ลอง {a.view}: {a.result}</div>
            ))}
            {r.error && <div className="src-error">{r.error}</div>}
            {key === "asset" && fields && <FieldsUsed fields={fields} rows={rows || []} />}
          </div>
        ))}
      </div>
    </details>
  );
}
