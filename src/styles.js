import styled, { keyframes } from "styled-components";
import { C } from "./constants";

const rise = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; }`;
const grow = keyframes`from { transform: scaleX(0); } to { transform: scaleX(1); }`;
const shimmer = keyframes`0% { background-position: -400px 0; } 100% { background-position: 400px 0; }`;
const rotate = keyframes`to { transform: rotate(360deg); }`;
const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.35; }`;

export const Page = styled.div`
  min-height: 100vh;
  background: ${C.bg};
  color: ${C.ink};
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  h1, h2, h3, p { margin: 0; }
  b { font-weight: 700; }

  /* ---------- shared ---------- */
  .card {
    background: ${C.card};
    border: 1px solid ${C.line};
    border-radius: 16px;
    padding: 20px 22px;
    box-shadow: 0 1px 2px rgba(16, 40, 28, 0.04), 0 4px 16px rgba(16, 40, 28, 0.04);
    animation: ${rise} 0.4s ease both;
  }
  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
    h3 { font-size: 17px; font-weight: 700; line-height: 1.4; }
  }
  .eyebrow {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: ${C.gold};
  }
  .section-title {
    margin: 8px 2px -2px;
    h2 { font-size: 20px; font-weight: 700; line-height: 1.35; }
  }
  .grid {
    display: grid;
    gap: 14px;
    &.cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    &.cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    &.cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }
  .unit-note { font-size: 12px; color: ${C.sub}; white-space: nowrap; }
  .badge.live {
    font-size: 11.5px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 999px;
    white-space: nowrap;
    background: ${C.greenSoft};
    color: ${C.green};
    &::before {
      content: "";
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 6px;
      border-radius: 50%;
      background: ${C.green};
      vertical-align: middle;
      animation: ${pulse} 1.6s ease infinite;
    }
  }
  .alert {
    padding: 10px 14px;
    border-radius: 10px;
    background: #fdecea;
    color: #9b2c1c;
    font-size: 13px;
    &.soft { background: ${C.goldSoft}; color: #7a5a17; }
  }
  .empty { padding: 36px 0; text-align: center; color: ${C.sub}; font-size: 14px; }
  .skeleton {
    display: inline-block;
    border-radius: 10px;
    background: linear-gradient(90deg, #eef2f0 0, #f7f9f8 50%, #eef2f0 100%);
    background-size: 800px 100%;
    animation: ${shimmer} 1.2s linear infinite;
    &.block { display: block; height: 200px; }
  }

  /* ---------- data source report ---------- */
  .sources {
    padding: 14px 18px;
    font-size: 13px;
    summary { cursor: pointer; font-weight: 600; color: ${C.sub}; }
    .src-warn { margin-left: 8px; color: ${C.red}; font-weight: 500; }
    .src-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
    .src-row { padding: 10px 12px; border-radius: 10px; background: ${C.bg}; }
    .src-head { display: flex; justify-content: space-between; gap: 8px; }
    .src-status {
      font-size: 12px;
      font-weight: 600;
      &.ok { color: ${C.green}; }
      &.error { color: ${C.red}; }
      &.loading { color: ${C.gold}; }
    }
    .src-meta { margin-top: 4px; color: ${C.sub}; line-height: 1.6; }
    code { font-size: 11.5px; padding: 1px 5px; border-radius: 4px; background: #e6ebe8; }
    .src-attempt { margin-top: 2px; font-size: 12px; color: ${C.sub}; }
    .src-error { margin-top: 4px; color: ${C.red}; }
    .src-fields {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed ${C.line};
      display: flex;
      flex-direction: column;
      gap: 3px;
      font-size: 12.5px;
      .src-error { margin: 0; }
    }
  }

  /* ---------- hero ---------- */
  .hero {
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 26px 28px;
    border-radius: 18px;
    background: linear-gradient(120deg, #0b5331 0%, #0f6b3f 55%, #1d7d4f 100%);
    color: #fff;
    &::after {
      content: "";
      position: absolute;
      right: -80px;
      top: -140px;
      width: 360px;
      height: 360px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(217, 164, 58, 0.38), transparent 70%);
      pointer-events: none;
    }
    .eyebrow { color: #f1d290; margin-bottom: 4px; }
    h1 { font-size: 30px; font-weight: 700; line-height: 1.3; }
    .lead { margin-top: 10px; font-size: 16px; line-height: 1.75; color: rgba(255, 255, 255, 0.92); max-width: 960px; }
    b { color: #f6dc9d; }
    .meta { margin-top: 10px; font-size: 12.5px; color: rgba(255, 255, 255, 0.7); }
    .skeleton { display: block; margin-top: 14px; width: 70%; height: 18px; opacity: 0.3; }
  }
  .refresh {
    position: relative;
    z-index: 1;
    flex: none;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background 0.2s;
    &:hover { background: rgba(255, 255, 255, 0.2); }
    &:disabled { cursor: default; }
    &.spin svg { animation: ${rotate} 0.9s linear infinite; }
  }

  /* ---------- KPI cards ---------- */
  .kpi {
    position: relative;
    overflow: hidden;
    .kpi-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .kpi-label { font-size: 14px; color: ${C.sub}; font-weight: 500; padding-top: 4px; }
    .kpi-icon {
      width: 38px;
      height: 38px;
      flex: none;
      border-radius: 11px;
      display: grid;
      place-items: center;
    }
    .kpi-value {
      margin-top: 8px;
      font-size: 32px;
      font-weight: 700;
      line-height: 1.15;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .kpi-unit { margin-left: 6px; font-size: 13px; font-weight: 500; color: ${C.sub}; }
    .kpi-hint { margin-top: 6px; font-size: 12.5px; color: ${C.sub}; }
    &::before {
      content: "";
      position: absolute;
      inset: 0 0 auto 0;
      height: 3px;
    }
    &.green { .kpi-icon { background: ${C.greenSoft}; color: ${C.green}; } .kpi-value { color: ${C.green}; } &::before { background: ${C.green}; } }
    &.gold { .kpi-icon { background: ${C.goldSoft}; color: ${C.gold}; } .kpi-value { color: ${C.gold}; } &::before { background: ${C.gold}; } }
  }

  /* ---------- task cards ---------- */
  .task {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 20px;
    .task-icon {
      width: 46px;
      height: 46px;
      flex: none;
      border-radius: 13px;
      display: grid;
      place-items: center;
    }
    .task-main { flex: 1; min-width: 0; }
    .task-label { font-size: 15.5px; font-weight: 700; }
    .task-desc { margin-top: 2px; font-size: 12.5px; color: ${C.sub}; line-height: 1.5; }
    .task-num {
      flex: none;
      text-align: right;
      font-size: 34px;
      font-weight: 700;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      span { display: block; margin-top: 4px; font-size: 12px; font-weight: 500; color: ${C.sub}; }
      .num-sk { width: 36px; height: 30px; }
    }
    &.gold { .task-icon { background: ${C.goldSoft}; color: ${C.gold}; } .task-num { color: ${C.gold}; } }
    &.teal { .task-icon { background: ${C.tealSoft}; color: ${C.teal}; } .task-num { color: ${C.teal}; } }
    &.red { .task-icon { background: ${C.redSoft}; color: ${C.red}; } .task-num { color: ${C.red}; } }
    &.zero .task-num { color: #b5c0bb; }
  }

  /* ---------- status donut ---------- */
  .status-wrap { display: flex; align-items: center; gap: 28px; }
  .donut { width: 180px; flex: none; }
  .donut-num { font-size: 28px; font-weight: 700; fill: ${C.ink}; }
  .donut-cap { font-size: 12px; fill: ${C.sub}; }
  .legend { flex: 1; min-width: 0; }
  .legend-row {
    display: grid;
    grid-template-columns: 12px 1fr auto 44px;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    font-size: 14px;
    & + & { border-top: 1px dashed ${C.line}; }
  }
  .dot { width: 10px; height: 10px; border-radius: 3px; }
  .legend-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .legend-num { font-weight: 700; font-variant-numeric: tabular-nums; }
  .legend-pct { text-align: right; color: ${C.sub}; font-size: 12.5px; }

  /* ---------- count rounds ---------- */
  .rounds { font-size: 14px; }
  .round-head, .round-row {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1.1fr) 64px 64px 64px;
    align-items: center;
    gap: 10px;
    .num { text-align: right; font-variant-numeric: tabular-nums; }
  }
  .round-head {
    padding: 0 10px 8px;
    font-size: 12px;
    font-weight: 600;
    color: ${C.sub};
    border-bottom: 1px solid ${C.line};
  }
  .round-row {
    padding: 12px 10px;
    margin-top: 4px;
    border-radius: 10px;
    cursor: pointer;
    outline: none;
    transition: background 0.15s;
    &:hover, &:focus-visible { background: #f6f9f7; }
    &:focus-visible { box-shadow: inset 0 0 0 2px ${C.greenSoft}; }
    &:has(.round-bar) { padding-bottom: 22px; }
    .round-no { font-weight: 600; display: flex; flex-direction: column; }
    .round-no em { font-style: normal; font-size: 11.5px; font-weight: 500; color: ${C.gold}; }
    .found { color: ${C.green}; font-weight: 700; }
    .miss { color: ${C.red}; font-weight: 700; }
  }
  .round-bar {
    grid-column: 1 / -1;
    position: relative;
    height: 6px;
    border-radius: 6px;
    background: #eef2f0;
    margin-top: 2px;
    > div {
      height: 100%;
      border-radius: 6px;
      background: linear-gradient(90deg, ${C.green}, #3d8f6a);
      transform-origin: left;
      animation: ${grow} 0.7s ease both;
    }
    label { position: absolute; right: 0; top: 8px; font-size: 11px; color: ${C.sub}; }
  }

  /* ---------- bar lists ---------- */
  .barlist {
    display: flex;
    flex-direction: column;
    gap: 12px;
    &.multi {
      display: grid;
      grid-auto-flow: column;
      grid-template-rows: repeat(var(--rows), auto);
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 40px;
    }
  }
  .bar-row {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1.5fr) 128px;
    align-items: center;
    gap: 14px;
  }
  .bar-name { display: flex; flex-direction: column; min-width: 0; }
  .bar-label { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bar-count { font-size: 11.5px; color: ${C.sub}; }
  .bar-track { height: 10px; border-radius: 10px; background: #eef2f0; overflow: hidden; }
  .bar-fill {
    height: 100%;
    border-radius: 10px;
    transform-origin: left;
    animation: ${grow} 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }
  .bar-val {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    span { font-weight: 500; font-size: 11.5px; color: ${C.sub}; }
  }

  /* ---------- responsive ---------- */
  @media (max-width: 1200px) {
    .grid.cols-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid.cols-3, .grid.cols-2 { grid-template-columns: 1fr; }
    .barlist.multi { display: flex; }
  }
  @media (max-width: 560px) {
    padding: 12px;
    .grid.cols-4 { grid-template-columns: 1fr; }
    .hero h1 { font-size: 24px; }
    .status-wrap { flex-direction: column; align-items: stretch; }
    .donut { margin: 0 auto; }
    .bar-row { grid-template-columns: 1fr auto; }
    .bar-track { grid-column: 1 / -1; grid-row: 2; }
    .round-head, .round-row { grid-template-columns: minmax(0, 1fr) 52px 52px 52px; }
    .round-head > span:nth-child(2), .round-row > span:nth-child(2) { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before { animation: none !important; transition: none !important; }
  }
`;
