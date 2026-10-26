import React from "react";
import Icon from "./Icon";
import { fmtInt } from "../utils/format";

export function SectionTitle({ eyebrow, title }) {
  return (
    <div className="section-title">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
    </div>
  );
}

export function Card({ title, aside, children }) {
  return (
    <div className="card">
      <div className="card-head">
        <h3>{title}</h3>
        {aside}
      </div>
      {children}
    </div>
  );
}

export const LiveBadge = () => <span className="badge live">ข้อมูลสด</span>;

export function Kpi({ icon, tone, label, value, unit, hint, loading, delay = 0 }) {
  return (
    <div className={`card kpi ${tone}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="kpi-top">
        <div className="kpi-label">{label}</div>
        <div className="kpi-icon"><Icon name={icon} /></div>
      </div>
      <div className="kpi-value">
        {loading ? "—" : value}
        {unit && <span className="kpi-unit">{unit}</span>}
      </div>
      {hint && !loading && <div className="kpi-hint">{hint}</div>}
    </div>
  );
}

// value: undefined = loading, null = unavailable
export function Task({ icon, tone, label, desc, value, unit, delay = 0 }) {
  return (
    <div className={`card task ${tone} ${value === 0 ? "zero" : ""}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="task-icon"><Icon name={icon} size={22} /></div>
      <div className="task-main">
        <div className="task-label">{label}</div>
        <div className="task-desc">{desc}</div>
      </div>
      <div className="task-num" title={value === null ? "ไม่พบข้อมูลต้นทาง" : undefined}>
        {value === undefined ? <span className="skeleton num-sk" /> : fmtInt(value)}
        <span>{unit}</span>
      </div>
    </div>
  );
}

export const Skeleton = () => <div className="skeleton block" />;
