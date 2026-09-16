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

function safeEndpoints(endpoints: EndpointConfig[]) {
  return endpoints.map(({ headers, body, ...e }) => ({
    ...e,
    headers: headers.map(h => ({ key: h.key, value: h.key ? "[REDACTED]" : "" })),
    body: body ? "[REDACTED]" : ""
  }));
}

export function exportJson(endpoints: EndpointConfig[], results: LapResult[], stats: EndpointStats[], laps: number, timeout: number) {
  download("api-race-results.json", JSON.stringify({
    exportedAt: new Date().toISOString(),
    configuration: { laps, timeoutMs: timeout, endpointCount: endpoints.length },
    endpoints: safeEndpoints(endpoints),
    results,
    stats
  }, null, 2), "application/json");
}

export function exportCsv(endpoints: EndpointConfig[], results: LapResult[]) {
  const rows = results.map((r) => ({
    endpoint: endpoints.find((e) => e.id === r.endpointId)?.name ?? r.endpointId,
    lap: r.lap,
    duration_ms: r.duration,
    status: r.status ?? "",
    result_kind: r.kind,
    completed: r.completed,
    success_2xx: r.success,
    response_size_bytes: r.responseSize,
    error: r.error ?? ""
  }));
  download("api-race-results.csv", Papa.unparse(rows), "text/csv;charset=utf-8");
}
