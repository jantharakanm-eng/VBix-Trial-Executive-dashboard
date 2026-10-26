import { useCallback, useEffect, useRef, useState } from "react";
import { config, md_emitter } from "mdye";
import {
  loadAssets, loadCountRounds, loadPendingRequests, loadPendingSap, resetSources, sources
} from "../data/loaders";

// Side metrics: undefined = loading, null = unavailable, otherwise the value.
const SIDE_LOADERS = {
  requests: loadPendingRequests,
  sapPending: loadPendingSap,
  rounds: loadCountRounds
};
const EMPTY_SIDE = { requests: undefined, sapPending: undefined, rounds: undefined };

export default function useDashboard() {
  const { appId, worksheetId, viewId } = config;
  // { worksheetId, sheetName, viewName, controls, rows } of the asset register
  const [assets, setAssets] = useState({ controls: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [side, setSide] = useState(EMPTY_SIDE);
  const [sourceReport, setSourceReport] = useState({});
  // Ignore results from an older load when a newer one has started (e.g. rapid filter changes).
  const loadSeq = useRef(0);

  const reload = useCallback(async () => {
    const seq = ++loadSeq.current;
    const isCurrent = () => seq === loadSeq.current;
    setLoading(true);
    setError(null);
    setSide(EMPTY_SIDE);
    resetSources();
    // Deep-ish copy so React sees each update to the shared load report.
    const publishReport = () =>
      isCurrent() && setSourceReport(JSON.parse(JSON.stringify(sources)));

    const sidePromises = Object.entries(SIDE_LOADERS).map(([key, loader]) =>
      loader(appId)
        .catch((e) => {
          console.warn(`[dashboard] ${key}:`, e);
          return null;
        })
        .then((value) => isCurrent() && setSide((s) => ({ ...s, [key]: value })))
    );

    const assetPromise = loadAssets(appId, { worksheetId, viewId, controls: config.controls || [] })
      .then((data) => {
        if (!isCurrent()) return;
        setAssets(data);
        setUpdatedAt(new Date());
      })
      .catch((e) => {
        console.error("[dashboard] assets:", e);
        if (isCurrent()) setError(`โหลดข้อมูลทะเบียนไม่สำเร็จ: ${(e && e.message) || e}`);
      })
      .finally(() => isCurrent() && setLoading(false));

    // Keep the on-screen load report live until every source has settled.
    publishReport();
    const ticker = setInterval(publishReport, 1000);
    await Promise.allSettled([assetPromise, ...sidePromises]);
    clearInterval(ticker);
    publishReport();
  }, [appId, worksheetId, viewId]);

  useEffect(() => {
    reload();
    md_emitter.addListener("filters-update", reload);
    md_emitter.addListener("new-record", reload);
    return () => {
      loadSeq.current++; // drop in-flight results after unmount
      md_emitter.removeListener("filters-update", reload);
      md_emitter.removeListener("new-record", reload);
    };
  }, [reload]);

  return { assets, loading, error, updatedAt, ...side, sourceReport, reload };
}
