<script setup lang="ts">
import { computed } from "vue";
import { Download, RotateCcw, Play, Trophy, Gauge, Activity, Package } from "lucide-vue-next";
import { useRaceStore } from "../stores/race";
import { exportCsv, exportJson } from "../lib/export";
import LatencyChart from "./LatencyChart.vue";
import ResponseInspector from "./ResponseInspector.vue";

const store = useRaceStore();
const medals = ["🥇", "🥈", "🥉"];
const name = (id: string) => store.endpoints.find(e => e.id === id)?.name ?? id;
const endpoint = (id: string) => store.endpoints.find(e => e.id === id);
const winner = computed(() => store.ranking[0]);

function diffText() {
  if (store.endpoints.length !== 2) return "";
  const [a,b] = store.stats;
  if (!a.average || !b.average) return "One racer did not finish.";
  const faster = a.average < b.average ? a : b;
  const slower = faster === a ? b : a;
  const pct = ((slower.average - faster.average) / faster.average * 100).toFixed(1);
  return `${name(faster.endpointId)} is ${pct}% faster on average.`;
}
</script>

<template>
  <section class="results-view">
    <div class="results-hero">
      <div>
        <div class="eyebrow"><Trophy :size="15" /> RACE COMPLETE</div>
        <h1>We have a <span>winner.</span></h1>
        <p>{{ store.laps }} {{ store.laps === 1 ? "lap" : "laps" }} completed across {{ store.endpoints.length }} endpoints.</p>
        <p v-if="store.globalError" class="global-error">{{ store.globalError }}</p>
      </div>
      <div class="results-actions">
        <button @click="store.replay"><Play :size="17" /> Replay</button>
        <button @click="exportCsv(store.endpoints, store.results)"><Download :size="17" /> CSV</button>
        <button @click="exportJson(store.endpoints, store.results, store.stats, store.laps, store.timeout)"><Download :size="17" /> JSON</button>
        <button class="primary" @click="store.reset"><RotateCcw :size="17" /> New race</button>
      </div>
    </div>

    <div class="podium">
      <div v-for="(r, i) in store.ranking.slice(0,3)" :key="r.endpointId" class="podium-card" :class="`place-${i+1}`" :style="{ '--car': endpoint(r.endpointId)?.color }">
        <div class="medal">{{ medals[i] }}</div>
        <div class="podium-car">🏎️</div>
        <h3>{{ name(r.endpointId) }}</h3>
        <strong>{{ r.average ? `${r.average} ms` : "DNF" }}</strong>
        <span>{{ r.completionRate }}% completed · {{ r.successRate }}% 2xx</span>
      </div>
    </div>

    <div v-if="store.endpoints.length===2" class="head-to-head">
      <span>⚔️ HEAD-TO-HEAD VERDICT</span><strong>{{ diffText() }}</strong>
    </div>

    <div class="metric-strip" v-if="winner">
      <div><Gauge /><span>WINNING AVG</span><strong>{{ winner.average }} ms</strong></div>
      <div><Activity /><span>CONSISTENCY</span><strong>{{ winner.consistency }}</strong></div>
      <div><Package /><span>AVG PAYLOAD</span><strong>{{ (winner.averageSize/1024).toFixed(1) }} KB</strong></div>
    </div>

    <div class="results-section">
      <div class="section-heading"><div><span class="step">03</span><h2>Full telemetry</h2></div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>RACER</th><th>AVG</th><th>MEDIAN</th><th>P95</th><th>BEST</th><th>WORST</th><th>CONSISTENCY</th><th>SUCCESS</th><th>PAYLOAD</th></tr></thead>
          <tbody>
            <tr v-for="s in store.ranking" :key="s.endpointId">
              <td><i :style="{background:endpoint(s.endpointId)?.color}"></i><b>{{ name(s.endpointId) }}</b></td>
              <td>{{ s.average || "—" }}<small v-if="s.average"> ms</small></td>
              <td>{{ s.median || "—" }}<small v-if="s.median"> ms</small></td>
              <td>{{ s.p95 || "—" }}<small v-if="s.p95"> ms</small></td>
              <td>{{ s.best || "—" }}<small v-if="s.best"> ms</small></td>
              <td>{{ s.worst || "—" }}<small v-if="s.worst"> ms</small></td>
              <td><span class="consistency">{{ s.consistency }}</span><small class="cv">{{ s.coefficientVariation }}% variation</small></td>
              <td>{{ s.successRate }}% <small>2xx</small><br><small>{{ s.completionRate }}% completed</small></td>
              <td>{{ (s.averageSize/1024).toFixed(1) }} KB</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="two-column">
      <div class="panel"><div class="panel-title"><span>📈</span><div><h3>Lap performance</h3><p>Latency across every run</p></div></div><LatencyChart /></div>
      <div class="panel"><div class="panel-title"><span>🔎</span><div><h3>Response inspector</h3><p>Inspect the actual result</p></div></div><ResponseInspector /></div>
    </div>

    <div v-if="store.replaying" :key="store.replayKey" class="replay-overlay">
      <div class="replay-box">
        <div class="eyebrow">RACE REPLAY</div>
        <h2>Watch those timings fly.</h2>
        <div v-for="s in store.ranking" :key="s.endpointId" class="replay-lane">
          <span>{{ name(s.endpointId) }}</span>
          <div><i :style="{ '--duration': `${Math.max(s.average,300)}ms`, '--car': endpoint(s.endpointId)?.color }">🏎️</i></div>
          <b>{{ s.average || "DNF" }} ms</b>
        </div>
      </div>
    </div>
  </section>
</template>
