import React from "react";
import { fmtDate, fmtInt, pct } from "../utils/format";

function RoundRow({ round, onOpen }) {
  const rate = round.expected ? pct(round.found || 0, round.expected) : null;
  const open = () => onOpen(round.rowid);
  return (
    <div className="round-row" role="button" tabIndex={0} onClick={open}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && open()}>
      <span className="round-no">
        {round.no}
        {round.status && <em>{round.status}</em>}
      </span>
      <span>{fmtDate(round.date)}</span>
      <span className="num">{fmtInt(round.expected)}</span>
      <span className="num found">{fmtInt(round.found)}</span>
      <span className={`num ${round.missing ? "miss" : ""}`}>{fmtInt(round.missing)}</span>
      {rate !== null && (
        <div className="round-bar" title={`พบแล้ว ${rate}%`}>
          <div style={{ width: `${Math.min(rate, 100)}%` }} />
          <label>พบแล้ว {rate}%</label>
        </div>
      )}
    </div>
  );
}

export default function CountRounds({ list, onOpen }) {
  if (!list || !list.length) return <div className="empty">ยังไม่มีรอบการตรวจนับ</div>;
  return (
    <div className="rounds">
      <div className="round-head">
        <span>เลขที่รอบ</span>
        <span>วันที่ตรวจนับ</span>
        <span className="num">ควรพบ</span>
        <span className="num">พบ</span>
        <span className="num">ไม่พบ</span>
      </div>
      {list.map((r) => <RoundRow key={r.rowid} round={r} onOpen={onOpen} />)}
    </div>
  );
}
