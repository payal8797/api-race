import Papa from "papaparse";
import type { EndpointConfig, EndpointStats, LapResult } from "../types/race";

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJson(endpoints: EndpointConfig[], results: LapResult[], stats: EndpointStats[]) {
  download("api-race-results.json", JSON.stringify({ exportedAt: new Date().toISOString(), endpoints, results, stats }, null, 2), "application/json");
}

export function exportCsv(endpoints: EndpointConfig[], results: LapResult[]) {
  const rows = results.map((r) => ({
    endpoint: endpoints.find((e) => e.id === r.endpointId)?.name ?? r.endpointId,
    lap: r.lap,
    duration_ms: r.duration,
    status: r.status ?? "",
    success: r.success,
    response_size_bytes: r.responseSize,
    error: r.error ?? ""
  }));
  download("api-race-results.csv", Papa.unparse(rows), "text/csv;charset=utf-8");
}
