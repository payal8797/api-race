<script setup lang="ts">
import { computed } from "vue";
import { useRaceStore } from "../stores/race";
import { Flag, X } from "lucide-vue-next";

const store = useRaceStore();

const latest = computed(() => {
  const map = new Map();
  store.results.filter(r => r.lap === store.currentLap).forEach(r => map.set(r.endpointId, r));
  return map;
});
</script>

<template>
  <section class="race-view">
    <div v-if="store.status === 'countdown'" class="countdown-wrap">
      <div class="lights">
        <span :class="{ on: store.countdown <= 3 }"></span>
        <span :class="{ yellow: store.countdown <= 2 }"></span>
        <span :class="{ green: store.countdown <= 1 }"></span>
      </div>
      <div class="countdown-number">{{ store.countdown }}</div>
      <div class="countdown-label">ENGINES READY</div>
    </div>

    <template v-else>
      <div class="race-header">
        <div>
          <div class="eyebrow">LIVE BENCHMARK</div>
          <h1>Lap {{ store.currentLap }} <span>/ {{ store.laps }}</span></h1>
        </div>
        <div class="race-header-actions"><button class="cancel-race" @click="store.cancelRace()"><X :size="15"/> CANCEL RACE</button><div class="live-pill"><i></i> RACING</div></div>
      </div>

      <div class="track">
        <div v-for="(endpoint, index) in store.endpoints" :key="endpoint.id" class="lane">
          <div class="lane-label"><b>{{ index + 1 }}</b><span>{{ endpoint.name }}</span></div>
          <div class="road">
            <div class="road-lines"></div>
            <div :class="['car', latest.get(endpoint.id) ? 'finished-car' : 'pending']" :style="{ '--car': endpoint.color, '--delay': `${index * 90}ms` }">
              <span class="car-body">🏎️</span>
            </div>
            <div class="finish"><Flag :size="20" /><span>FINISH</span></div>
          </div>
          <div class="lane-time">
            <template v-if="latest.get(endpoint.id)">
              <strong>{{ latest.get(endpoint.id).completed ? `${latest.get(endpoint.id).duration} ms` : "DNF" }}</strong>
              <small :class="{ error: !latest.get(endpoint.id).success }">
                {{ latest.get(endpoint.id).kind === "http_error" ? `HTTP ${latest.get(endpoint.id).status}` : (latest.get(endpoint.id).status || latest.get(endpoint.id).error) }}
              </small>
            </template>
            <template v-else><strong>•••</strong><small>REQUESTING</small></template>
          </div>
        </div>
      </div>

      <div class="race-progress">
        <span>Completing concurrent requests...</span>
        <div><i :style="{ width: `${(store.currentLap / store.laps) * 100}%` }"></i></div>
      </div>
    </template>
  </section>
</template>
