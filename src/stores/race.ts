import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { EndpointConfig, EndpointStats, LapResult, RaceStatus } from "../types/race";
import { calculateStats } from "../lib/statistics";

const colors = ["#ff3b30", "#00c2ff", "#ffcc00", "#7c3aed", "#10b981", "#ff5da2"];

function id() {
  return crypto.randomUUID();
}

export const useRaceStore = defineStore("race", () => {
  const endpoints = ref<EndpointConfig[]>([
    { id: id(), name: "JSONPlaceholder", url: "https://jsonplaceholder.typicode.com/todos/1", method: "GET", headers: [], body: "", color: colors[0] },
    { id: id(), name: "GitHub", url: "https://api.github.com", method: "GET", headers: [], body: "", color: colors[1] }
  ]);
  const laps = ref(5);
  const timeout = ref(8000);
  const status = ref<RaceStatus>("idle");
  const countdown = ref(3);
  const currentLap = ref(0);
  const results = ref<LapResult[]>([]);
  const replaying = ref(false);
  const replayKey = ref(0);

  const stats = computed<EndpointStats[]>(() =>
    endpoints.value.map((e) => calculateStats(e.id, results.value))
  );

  const ranking = computed(() =>
    [...stats.value].sort((a, b) => {
      if (!a.successRate && b.successRate) return 1;
      if (a.successRate && !b.successRate) return -1;
      return a.average - b.average;
    })
  );

  function addEndpoint() {
    if (endpoints.value.length >= 6) return;
    const n = endpoints.value.length;
    endpoints.value.push({
      id: id(), name: `API ${n + 1}`, url: "", method: "GET",
      headers: [], body: "", color: colors[n % colors.length]
    });
  }

  function removeEndpoint(endpointId: string) {
    if (endpoints.value.length <= 2) return;
    endpoints.value = endpoints.value.filter((e) => e.id !== endpointId);
  }

  function reset() {
    status.value = "idle";
    currentLap.value = 0;
    results.value = [];
  }

  async function runRace() {
    if (endpoints.value.length < 2 || endpoints.value.some((e) => !e.url.trim())) return;
    results.value = [];
    status.value = "countdown";
    countdown.value = 3;

    for (let n = 3; n >= 1; n--) {
      countdown.value = n;
      await new Promise((r) => setTimeout(r, 650));
    }
    status.value = "racing";

    for (let lap = 1; lap <= laps.value; lap++) {
      currentLap.value = lap;
      const settled = await Promise.all(
        endpoints.value.map(async (endpoint) => {
          const response = await fetch("/api/race", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ endpoint, timeout: timeout.value })
          });
          const data = await response.json();
          return { ...data, endpointId: endpoint.id, lap } as LapResult;
        })
      );
      results.value.push(...settled);
      if (lap < laps.value) await new Promise((r) => setTimeout(r, 250));
    }
    status.value = "finished";
  }

  function replay() {
    replayKey.value++;
    replaying.value = true;
    setTimeout(() => replaying.value = false, Math.max(...stats.value.map(s => s.worst), 1000) + 1200);
  }

  return { endpoints, laps, timeout, status, countdown, currentLap, results, stats, ranking, replaying, replayKey, addEndpoint, removeEndpoint, reset, runRace, replay };
});
