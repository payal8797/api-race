import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { EndpointConfig, EndpointStats, LapResult, RaceStatus } from "../types/race";
import { calculateStats } from "../lib/statistics";

const colors = ["#ff3b30", "#00c2ff", "#ffcc00", "#7c3aed", "#10b981", "#ff5da2"];
const id = () => crypto.randomUUID();

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
  const validationErrors = ref<Record<string, string>>({});
  const globalError = ref("");
  const replaying = ref(false);
  const replayKey = ref(0);
  let raceController: AbortController | null = null;
  let raceToken = 0;

  const isBusy = computed(() => status.value === "countdown" || status.value === "racing");
  const stats = computed<EndpointStats[]>(() => endpoints.value.map((e) => calculateStats(e.id, results.value)));
  const ranking = computed(() => [...stats.value].sort((a, b) => {
    if (!a.completionRate && b.completionRate) return 1;
    if (a.completionRate && !b.completionRate) return -1;
    return a.average - b.average;
  }));

  function addEndpoint() {
    if (endpoints.value.length >= 6 || isBusy.value) return;
    const n = endpoints.value.length;
    endpoints.value.push({ id: id(), name: `API ${n + 1}`, url: "", method: "GET", headers: [], body: "", color: colors[n % colors.length] });
  }

  function removeEndpoint(endpointId: string) {
    if (endpoints.value.length <= 2 || isBusy.value) return;
    endpoints.value = endpoints.value.filter((e) => e.id !== endpointId);
  }

  function loadDemo() {
    if (isBusy.value) return;
    endpoints.value = [
      { id:id(), name:"JSONPlaceholder", url:"https://jsonplaceholder.typicode.com/todos/1", method:"GET", headers:[], body:"", color:colors[0] },
      { id:id(), name:"GitHub", url:"https://api.github.com", method:"GET", headers:[], body:"", color:colors[1] },
      { id:id(), name:"HTTPBin", url:"https://httpbin.org/get", method:"GET", headers:[], body:"", color:colors[2] },
      { id:id(), name:"HTTP 404", url:"https://httpbin.org/status/404", method:"GET", headers:[], body:"", color:colors[3] }
    ];
    laps.value = 5;
    timeout.value = 8000;
    validationErrors.value = {};
  }

  function validate() {
    const errors: Record<string,string> = {};
    endpoints.value.forEach(e => {
      try {
        const u = new URL(e.url);
        if (!["http:","https:"].includes(u.protocol)) throw new Error();
      } catch { errors[e.id] = "Enter a valid HTTP(S) URL."; }
      if (["POST","PUT","PATCH"].includes(e.method) && e.body.trim()) {
        try { JSON.parse(e.body); } catch { errors[e.id] = "JSON body is not valid JSON."; }
      }
    });
    validationErrors.value = errors;
    return Object.keys(errors).length === 0;
  }

  function reset() {
    cancelRace(false);
    status.value = "idle";
    currentLap.value = 0;
    results.value = [];
    globalError.value = "";
    validationErrors.value = {};
  }

  function cancelRace(showMessage = true) {
    raceToken++;
    raceController?.abort();
    raceController = null;
    if (showMessage && isBusy.value) globalError.value = "Race cancelled. Completed results were kept.";
    if (isBusy.value) status.value = results.value.length ? "finished" : "idle";
  }

  async function runOne(endpoint: EndpointConfig, lap: number, token: number) {
    try {
      const response = await fetch("/api/race", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint, timeout: timeout.value }),
        signal: raceController?.signal
      });
      if (!response.ok) throw new Error(`API Race server returned ${response.status}`);
      const data = await response.json();
      if (token !== raceToken) return;
      results.value.push({ ...data, endpointId: endpoint.id, lap } as LapResult);
    } catch (err: any) {
      if (token !== raceToken || err?.name === "AbortError") return;
      results.value.push({
        endpointId:endpoint.id, lap, duration:0, status:null, responseSize:0,
        success:false, completed:false, kind:"network_error",
        error:"API Race backend unavailable or returned an invalid response."
      });
    }
  }

  async function runRace() {
    if (isBusy.value || !validate()) return;
    const token = ++raceToken;
    raceController = new AbortController();
    results.value = [];
    globalError.value = "";
    status.value = "countdown";
    countdown.value = 3;

    try {
      for (let n = 3; n >= 1; n--) {
        if (token !== raceToken) return;
        countdown.value = n;
        await new Promise(r => setTimeout(r, 650));
      }
      if (token !== raceToken) return;
      status.value = "racing";

      for (let lap = 1; lap <= laps.value; lap++) {
        if (token !== raceToken) return;
        currentLap.value = lap;
        // Each racer writes its result immediately when it finishes.
        await Promise.all(endpoints.value.map(e => runOne(e, lap, token)));
        if (lap < laps.value) await new Promise(r => setTimeout(r, 180));
      }
      if (token === raceToken) status.value = "finished";
    } catch {
      if (token === raceToken) {
        globalError.value = "The race could not be completed. You can safely start a new race.";
        status.value = results.value.length ? "finished" : "error";
      }
    } finally {
      if (token === raceToken) raceController = null;
    }
  }

  function replay() {
    if (!results.value.length) return;
    replayKey.value++;
    replaying.value = true;
    setTimeout(() => replaying.value = false, Math.max(...stats.value.map(s => s.worst), 1000) + 1200);
  }

  return {
    endpoints,laps,timeout,status,countdown,currentLap,results,validationErrors,globalError,
    stats,ranking,replaying,replayKey,isBusy,addEndpoint,removeEndpoint,loadDemo,reset,cancelRace,runRace,replay
  };
});
