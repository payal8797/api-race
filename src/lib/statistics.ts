import type { EndpointStats, LapResult } from "../types/race";

const round = (n: number) => Math.round(n * 10) / 10;

function percentile(sorted: number[], p: number) {
  if (!sorted.length) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

export function calculateStats(endpointId: string, results: LapResult[]): EndpointStats {
  const all = results.filter((r) => r.endpointId === endpointId);
  // HTTP 4xx/5xx still completed and therefore have valid latency.
  const completed = all.filter((r) => r.completed);
  const successful = all.filter((r) => r.success);
  const times = completed.map((r) => r.duration).sort((a, b) => a - b);

  if (!times.length) {
    return {
      endpointId, average: 0, median: 0, p95: 0, best: 0, worst: 0,
      standardDeviation: 0, coefficientVariation: 0, successRate: 0,
      completionRate: 0, consistency: "DNF", averageSize: 0
    };
  }

  const average = times.reduce((a, b) => a + b, 0) / times.length;
  const mid = Math.floor(times.length / 2);
  const median = times.length % 2 ? times[mid] : (times[mid - 1] + times[mid]) / 2;
  const variance = times.reduce((sum, t) => sum + Math.pow(t - average, 2), 0) / times.length;
  const sd = Math.sqrt(variance);
  const cv = average ? (sd / average) * 100 : 0;
  const consistency = cv <= 5 ? "Rock solid" : cv <= 12 ? "Very stable" : cv <= 25 ? "Stable" : cv <= 40 ? "Variable" : "Wild";
  const averageSize = completed.reduce((s, r) => s + r.responseSize, 0) / completed.length;

  return {
    endpointId,
    average: round(average),
    median: round(median),
    p95: round(percentile(times, 95)),
    best: round(times[0]),
    worst: round(times[times.length - 1]),
    standardDeviation: round(sd),
    coefficientVariation: round(cv),
    successRate: round((successful.length / Math.max(1, all.length)) * 100),
    completionRate: round((completed.length / Math.max(1, all.length)) * 100),
    consistency,
    averageSize: Math.round(averageSize)
  };
}
