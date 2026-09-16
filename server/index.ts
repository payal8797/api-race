import express from "express";
import cors from "cors";
import dns from "node:dns/promises";
import net from "node:net";

const app = express();
app.use(cors());
app.use(express.json({ limit: "64kb" }));

const PORT = Number(process.env.PORT || 8787);
const MAX_RESPONSE_BYTES = 512 * 1024;

function isPrivateIp(ip: string) {
  if (net.isIPv4(ip)) {
    const [a,b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 ||
      (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  const normalized = ip.toLowerCase();
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") ||
    normalized.startsWith("fd") || normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb");
}

async function assertSafeUrl(raw: string) {
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error("Invalid URL"); }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP(S) URLs are allowed");
  if (["localhost", "0.0.0.0"].includes(url.hostname.toLowerCase())) throw new Error("Local addresses are blocked");

  const addresses = await dns.lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) {
    throw new Error("Private or internal network targets are blocked");
  }
  return url;
}

app.post("/api/race", async (req, res) => {
  const { endpoint, timeout = 8000 } = req.body ?? {};
  const started = performance.now();

  try {
    if (!endpoint?.url || !endpoint?.method) throw new Error("Missing endpoint configuration");
    let currentUrl = await assertSafeUrl(endpoint.url);
    const headers: Record<string,string> = {};
    for (const h of endpoint.headers ?? []) if (h.key?.trim()) headers[h.key.trim()] = String(h.value ?? "");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(Math.max(Number(timeout), 1000), 10000));

    let response: Response | undefined;
    try {
      for (let redirect = 0; redirect <= 3; redirect++) {
        response = await fetch(currentUrl, {
          method: endpoint.method,
          headers,
          body: ["GET","HEAD"].includes(endpoint.method) ? undefined : (endpoint.body || undefined),
          redirect: "manual",
          signal: controller.signal
        });

        if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
          if (redirect === 3) throw new Error("Too many redirects");
          currentUrl = await assertSafeUrl(new URL(response.headers.get("location")!, currentUrl).toString());
          continue;
        }
        break;
      }
    } finally {
      clearTimeout(timer);
    }

    if (!response) throw new Error("No response received");
    const reader = response.body?.getReader();
    let total = 0;
    const chunks: Uint8Array[] = [];
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          total += value.byteLength;
          if (total > MAX_RESPONSE_BYTES) {
            await reader.cancel();
            throw new Error("Response exceeded 512 KB safety limit");
          }
          chunks.push(value);
        }
      }
    }

    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const contentType = response.headers.get("content-type") || "";
    let preview = "";
    if (/json|text|xml|javascript|html/i.test(contentType)) {
      preview = new TextDecoder().decode(bytes).slice(0, 12000);
      if (/json/i.test(contentType)) {
        try { preview = JSON.stringify(JSON.parse(preview), null, 2); } catch {}
      }
    }

    const duration = Math.round((performance.now() - started) * 10) / 10;
    res.json({
      duration,
      status: response.status,
      responseSize: total,
      success: response.ok,
      error: response.ok ? undefined : `HTTP ${response.status}`,
      responsePreview: preview,
      contentType,
      headers: Object.fromEntries(response.headers.entries())
    });
  } catch (error: any) {
    const duration = Math.round((performance.now() - started) * 10) / 10;
    res.json({
      duration,
      status: null,
      responseSize: 0,
      success: false,
      error: error?.name === "AbortError" ? "Timeout" : (error?.message || "Request failed")
    });
  }
});

app.listen(PORT, () => console.log(`🏁 API Race server running on http://localhost:${PORT}`));
