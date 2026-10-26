import React, { useMemo } from "react";
import { config, utils } from "mdye";
import { C } from "./constants";
import { Page } from "./styles";
import useDashboard from "./hooks/useDashboard";
import { buildStats, detectFields } from "./data/stats";
import { fmtBaht, fmtInt, fmtMillion, fmtTime, pct } from "./utils/format";
import { envValue } from "./utils/fields";
import Icon from "./components/Icon";
import { Card, Kpi, LiveBadge, SectionTitle, Skeleton, Task } from "./components/Cards";
import { BarList, StatusBreakdown } from "./components/Charts";
import CountRounds from "./components/CountRounds";
import SourcePanel from "./components/SourcePanel";

const DEBUG = !!envValue("debug");
const FIELD_PARAMS ={ value: "valueField", status: "statusField", category: "categoryField", dept: "deptField" };

export default function App() {
  const { assets, loading, error, updatedAt, requests, sapPending, rounds, sourceReport, reload } = useDashboard();
  const fields = useMemo(() => detectFields(assets.controls, assets.rows), [assets.controls, assets.rows]);
  const s = useMemo(() => buildStats(assets.rows, fields), [assets.rows, fields]);

  const repair = loading ? undefined : s.repair;
  const pendingTotal = [requests, sapPending, repair].reduce((n, v) => (typeof v === "number" ? n + v : n), 0);
  const missingParams = Object.keys(FIELD_PARAMS).filter((k) => !fields[k]).map((k) => FIELD_PARAMS[k]);

  async function openRound(rowid) {
    try {
      const res = await utils.openRecordInfo({ appId: config.appId, worksheetId: rounds.worksheetId, recordId: rowid });
      if (res && (res.action === "update" || res.action === "delete")) reload();
    } catch (e) {
      console.error("[dashboard] open round:", e);
    }
  }

  return (
    <Page>
      <section className="hero">
        <div>
          <div className="eyebrow">ThaiBev Asset Management · แดชบอร์ดผู้บริหาร</div>
          <h1>ภาพรวมทะเบียนทรัพย์สิน</h1>
          {loading ? (
            <span className="skeleton" />
          ) : (
            <p className="lead">
              ทะเบียนมีทรัพย์สิน <b>{fmtInt(s.total)}</b> รายการ มูลค่าสุทธิตามบัญชีรวม{" "}
              <b>{fmtMillion(s.totalValue)} ล้านบาท</b> กำลังใช้งาน <b>{pct(s.inUse, s.total)}%</b>
              {pendingTotal > 0
                ? <> และมี <b>{fmtInt(pendingTotal)}</b> เรื่องที่รอการดำเนินการ</>
                : " และไม่มีเรื่องค้างรอดำเนินการ"}
            </p>
          )}
          <div className="meta">
            {updatedAt ? `ข้อมูล ณ ${fmtTime(updatedAt)}` : "กำลังโหลดข้อมูล…"}
            {DEBUG && updatedAt && assets.sheetName &&
              ` · จากตาราง "${assets.sheetName}"${assets.viewName ? ` มุมมอง "${assets.viewName}"` : ""}`}
          </div>
        </div>
        <button className={`refresh ${loading ? "spin" : ""}`} onClick={reload} disabled={loading}
          title="รีเฟรชข้อมูล" aria-label="รีเฟรชข้อมูล">
          <Icon name="refresh" />
        </button>
      </section>

      {error && <div className="alert">{error}</div>}
      {/* Developer diagnostics: enable with Env Param {"debug": true} */}
      {DEBUG && <SourcePanel report={sourceReport} fields={loading ? null : fields} rows={assets.rows} />}
      {!loading && missingParams.length > 0 && (
        <div className="alert soft">
          ไม่พบฟิลด์ที่ใช้คำนวณ — ระบุได้ในพารามิเตอร์ของมุมมอง: {missingParams.join(", ")}
        </div>
      )}

      <SectionTitle eyebrow="การใช้งาน" title="ทรัพย์สินในทะเบียน" />
      <section className="grid cols-4">
        <Kpi delay={0} icon="list" tone="green" label="ทรัพย์สินทั้งหมด" loading={loading}
          value={fmtInt(s.total)} unit="รายการ" hint="ทุกสถานะในทะเบียน" />
        <Kpi delay={50} icon="coins" tone="gold" label="มูลค่าสุทธิตามบัญชี" loading={loading}
          value={fmtBaht(s.totalValue)} unit="บาท" hint={`≈ ${fmtMillion(s.totalValue)} ล้านบาท`} />
        <Kpi delay={100} icon="check" tone="green" label="กำลังใช้งาน" loading={loading}
          value={fmtInt(s.inUse)} unit="รายการ" hint={`${pct(s.inUse, s.total)}% ของทรัพย์สินทั้งหมด`} />
        <Kpi delay={150} icon="box" tone="gold" label="ว่างในคลัง" loading={loading}
          value={fmtInt(s.idle)} unit="รายการ" hint="พร้อมให้ยืมหรือนำลงตลาดในเครือ" />
      </section>

      <SectionTitle eyebrow="ต้องดูแล" title="เรื่องที่รอการตัดสินใจ" />
      <section className="grid cols-3">
        <Task delay={0} icon="file" tone="gold" label="คำขอรออนุมัติ"
          desc="ยืม คืน โอนย้าย และขอจำหน่าย ที่รอผู้อนุมัติ" value={requests} unit="ใบ" />
        <Task delay={50} icon="sap" tone="teal" label="รอบันทึกใน SAP"
          desc="รายการปรับปรุงที่ฝ่ายบัญชียังไม่ได้บันทึก" value={sapPending} unit="รายการ" />
        <Task delay={100} icon="tool" tone="red" label="ทรัพย์สินที่ส่งซ่อม"
          desc="ติดตามผลซ่อม หรือพิจารณาจำหน่ายหากค่าซ่อมสูง" value={repair} unit="รายการ" />
      </section>

      <section className="grid cols-2">
        <Card title="ทรัพย์สินแยกตามสถานะ" aside={<LiveBadge />}>
          {loading ? <Skeleton /> : <StatusBreakdown statuses={s.statuses} total={s.total} />}
        </Card>
        <Card title="ผลการตรวจนับล่าสุด" aside={<LiveBadge />}>
          {rounds === undefined ? <Skeleton /> : <CountRounds list={rounds && rounds.list} onOpen={openRound} />}
        </Card>
      </section>

      {/* Full-width cards with two-column lists: the department list (~20 rows) is far longer than categories */}
      <Card title="มูลค่าสุทธิตามหมวดหมู่" aside={<span className="unit-note">บาท · % ของมูลค่ารวม</span>}>
        {loading ? <Skeleton /> : <BarList items={s.categories} total={s.totalValue} color={C.green} columns={2} />}
      </Card>
      <Card title={`มูลค่าสุทธิตามหน่วยงาน${loading ? "" : ` · ${s.depts.length} หน่วยงาน`}`}
        aside={<span className="unit-note">บาท · % ของมูลค่ารวม</span>}>
        {loading ? <Skeleton /> : <BarList items={s.depts} total={s.totalValue} color={C.gold} columns={2} />}
      </Card>
    </Page>
  );
}
