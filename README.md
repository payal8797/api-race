# API Race 🏁

A bright, race-themed API benchmarking playground built with Vue 3 + TypeScript.

## Included

- 2–6 endpoint racers
- GET / POST / PUT / PATCH / DELETE
- Headers and JSON body
- 1 / 5 / 10 / 20-lap benchmarks
- Countdown + live race UI
- Average, median, P95, best, worst
- Standard-deviation-based consistency rating
- HTTP errors + timeout DNF
- Payload size
- Head-to-head mode for two endpoints
- Response body/header inspector
- Race replay
- CSV + JSON export
- SSRF-aware Node proxy with private-address blocking, redirect checks, timeout and response-size limit
- Responsive bright racing UI

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

The Express API server runs at http://localhost:8787 and Vite proxies `/api` to it.

## Important security note

The included server blocks common private/internal IP ranges, localhost, non-HTTP(S) URLs, checks redirects, caps responses at 512 KB and limits timeout to 10 seconds. This is a strong portfolio starting point, but an internet-facing arbitrary-URL proxy should additionally use infrastructure-level egress controls, DNS-rebinding defenses, authentication/rate limiting and abuse monitoring.

## Timing note

API Race reports measurements it can actually observe: total server-side request duration, status, payload size, content type and returned headers. It intentionally does not fabricate DNS/TCP/TTFB timing values.

## Production deployment

The frontend and Express server must both be deployed. Configure your host/reverse proxy so `/api/*` reaches the Express service. For a public deployment, add production-grade proxy hardening and rate limiting before allowing unrestricted arbitrary URLs.
