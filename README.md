# API Race 🏁

A bright, race-themed API benchmarking playground built with Vue 3 + TypeScript. Race multiple API endpoints against each other, compare real response performance, inspect responses, and analyze latency across multiple benchmark runs.

## Features

- **2–6 API Racers** — Compare multiple endpoints in the same race.
- **Multiple HTTP Methods** — GET, POST, PUT, PATCH, and DELETE.
- **Custom Request Configuration** — Add headers and JSON request bodies.
- **Multi-Lap Benchmarking** — Run 1, 5, 10, or 20 laps for more reliable measurements.
- **Race Countdown** — Racing-style `3 → 2 → 1 → GO` experience.
- **Live API Race** — Watch endpoints compete while real requests are running.
- **Incremental Live Results** — Each API's result appears as soon as its request completes.
- **Podium & Ranking** — Automatically rank endpoints based on measured performance.
- **Latency Statistics** — Average, median, P95, best, and worst response times.
- **Consistency Analysis** — Standard-deviation-based stability rating with latency variation percentage.
- **Success & Completion Rates** — Distinguish successful 2xx responses from completed HTTP requests.
- **HTTP Error Detection** — Clearly identify 4xx and 5xx responses without treating them as network failures.
- **DNF Handling** — Separate timeouts, DNS/network failures, blocked requests, and other failures.
- **Configurable Timeouts** — Control how long each racer gets before being marked DNF.
- **Payload Size Comparison** — Compare response sizes alongside latency.
- **Head-to-Head Mode** — Use two racers for direct comparisons such as Production vs Staging.
- **Lap Performance Charts** — Visualize latency changes across multiple benchmark runs.
- **Response Inspector** — Inspect status, response body, headers, content type, size, and timing.
- **Race Replay** — Replay completed races using recorded benchmark results without sending requests again.
- **Cancel Race** — Stop long-running benchmarks without refreshing the application.
- **Duplicate-Start Prevention** — Prevent accidentally launching overlapping races.
- **Input Validation** — Validate URLs and JSON request bodies before starting.
- **Graceful Failure Recovery** — Recover when the API Race backend is unavailable or returns an unexpected response.
- **Demo Race** — Load ready-to-use sample endpoints to try the application immediately.
- **CSV Export** — Export individual benchmark results for further analysis.
- **JSON Export** — Export race configuration, statistics, and results.
- **Secret-Safe Exports** — Request headers and body values are redacted from exported reports.
- **SSRF-Aware API Proxy** — Blocks localhost, common private/internal networks, unsupported protocols, and unsafe redirects.
- **Server Safety Limits** — Response-size limits, timeout limits, basic rate limiting, and concurrency limiting.
- **Responsive Racing UI** — Bright race-themed interface designed for desktop and smaller screens.
- **Reduced-Motion Accessibility** — Respects the user's system preference for reduced animation.
- **Real Measurements Only** — Reports observable request duration, HTTP status, payload size, content type, and headers without fabricating unavailable DNS/TCP/TTFB metrics.

## Run Locally

```bash
npm install
npm run dev

## Netlify deployment

The production backend is implemented as a Netlify Function at `netlify/functions/race.mts`. `netlify.toml` rewrites `/api/race` to that function, so the Vue frontend can use the same relative URL in production.

For normal local development, `npm run dev` continues to run Vite + the local Express server. To test the Netlify deployment model locally, install/use the Netlify CLI and run `npx netlify dev`.
