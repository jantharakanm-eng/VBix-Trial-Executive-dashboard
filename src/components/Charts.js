import React from "react";
import { C } from "../constants";
import { fmtBaht, fmtInt, pct } from "../utils/format";

const R = 70;
const CIRC = 2 * Math.PI * R;
const GAP = 1.5; // px gap between slices

function Donut({ items, total }) {
  let offset = 0;
  return (
    <svg viewBox="0 0 180 180" className="donut" role="img" aria-label={`ทั้งหมด ${fmtInt(total)} รายการ`}>
      <circle cx="90" cy="90" r={R} fill="none" stroke={C.line} strokeWidth="22" />
      {items.map((i) => {
        const len = total ? (i.count / total) * CIRC : 0;
        const slice = (
          <circle key={i.label} cx="90" cy="90" r={R} fill="none" stroke={i.color} strokeWidth="22"
            strokeDasharray={`${Math.max(len - GAP, 1)} ${CIRC}`} strokeDashoffset={-offset}
            transform="rotate(-90 90 90)">
            <title>{`${i.label}: ${fmtInt(i.count)}`}</title>
          </circle>
        );
        offset += len;
        return slice;
      })}
      <text x="90" y="88" textAnchor="middle" className="donut-num">{fmtInt(total)}</text>
      <text x="90" y="108" textAnchor="middle" className="donut-cap">รายการ</text>
    </svg>
  );
}

export function StatusBreakdown({ statuses, total }) {
  if (!total) return <div className="empty">ไม่มีข้อมูล</div>;
  return (
    <div className="status-wrap">
      <Donut items={statuses} total={total} />
      <div className="legend">
        {statuses.map((s) => (
          <div className="legend-row" key={s.label}>
            <span className="dot" style={{ background: s.color }} />
            <span className="legend-label">{s.label}</span>
            <span className="legend-num">{fmtInt(s.count)}</span>
            <span className="legend-pct">{pct(s.count, total)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// columns=2 flows the list top-to-bottom, then into the second column (ranking stays readable).
export function BarList({ items, total, color, columns = 1 }) {
  if (!items.length) return <div className="empty">ไม่มีข้อมูล</div>;
  const max = Math.max(...items.map((i) => i.value), 1);
  const rows = Math.ceil(items.length / columns);
  return (
    <div className={`barlist ${columns > 1 ? "multi" : ""}`} style={{ "--rows": rows }}>
      {items.map((it, idx) => (
        <div className="bar-row" key={it.label}>
          <div className="bar-name" title={it.label}>
            <span className="bar-label">{it.label}</span>
            <span className="bar-count">{fmtInt(it.count)} รายการ</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{
              width: `${Math.max((it.value / max) * 100, 0)}%`,
              background: it.rest ? "#c9d1cd" : color,
              animationDelay: `${idx * 50}ms`
            }} />
          </div>
          <div className="bar-val">
            {fmtBaht(it.value)}
            <span>{pct(it.value, total)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
