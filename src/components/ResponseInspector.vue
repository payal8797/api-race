<script setup lang="ts">
import { computed, ref } from "vue";
import { useRaceStore } from "../stores/race";

const store = useRaceStore();
const selectedEndpoint = ref(store.endpoints[0]?.id);
const selectedLap = ref(1);
const tab = ref<"overview"|"body"|"headers">("overview");

const result = computed(() =>
  store.results.find(r => r.endpointId === selectedEndpoint.value && r.lap === selectedLap.value)
);
</script>

<template>
  <div class="inspector">
    <div class="inspector-controls">
      <select v-model="selectedEndpoint">
        <option v-for="e in store.endpoints" :key="e.id" :value="e.id">{{ e.name }}</option>
      </select>
      <select v-model="selectedLap">
        <option v-for="n in store.laps" :key="n" :value="n">Lap {{ n }}</option>
      </select>
    </div>
    <div class="tabs">
      <button v-for="t in ['overview','body','headers']" :key="t" :class="{active:tab===t}" @click="tab=t as any">{{ t }}</button>
    </div>
    <div v-if="result" class="inspector-content">
      <div v-if="tab==='overview'" class="overview-cards">
        <div><span>STATUS</span><strong>{{ result.status || "—" }}</strong></div>
        <div><span>TIME</span><strong>{{ result.duration }} ms</strong></div>
        <div><span>SIZE</span><strong>{{ (result.responseSize / 1024).toFixed(1) }} KB</strong></div>
        <div><span>TYPE</span><strong>{{ result.contentType?.split(";")[0] || "—" }}</strong></div>
      </div>
      <pre v-else-if="tab==='body'">{{ result.responsePreview || "No response preview." }}</pre>
      <pre v-else>{{ JSON.stringify(result.headers || {}, null, 2) }}</pre>
    </div>
  </div>
</template>
