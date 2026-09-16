export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HeaderPair {
  key: string;
  value: string;
}

export interface EndpointConfig {
  id: string;
  name: string;
  url: string;
  method: HttpMethod;
  headers: HeaderPair[];
  body: string;
  color: string;
}

export type ResultKind = "success" | "http_error" | "timeout" | "network_error" | "blocked" | "cancelled";

export interface LapResult {
  endpointId: string;
  lap: number;
  duration: number;
  status: number | null;
  responseSize: number;
  success: boolean;
  completed: boolean;
  kind: ResultKind;
  error?: string;
  responsePreview?: string;
  contentType?: string;
  headers?: Record<string, string>;
}

export interface EndpointStats {
  endpointId: string;
  average: number;
  median: number;
  p95: number;
  best: number;
  worst: number;
  standardDeviation: number;
  coefficientVariation: number;
  successRate: number;
  completionRate: number;
  consistency: string;
  averageSize: number;
}

export type RaceStatus = "idle" | "countdown" | "racing" | "finished" | "error";
