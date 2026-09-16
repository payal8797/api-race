<script setup lang="ts">
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from "chart.js";
import { useRaceStore } from "../stores/race";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
const store = useRaceStore();

const data = computed(() => ({
  labels: Array.from({ length: store.laps }, (_, i) => `Lap ${i + 1}`),
  datasets: store.endpoints.map((e) => ({
    label: e.name,
    data: Array.from({ length: store.laps }, (_, i) =>
      store.results.find(r => r.endpointId === e.id && r.lap === i + 1 && r.success)?.duration ?? null
    ),
    borderColor: e.color,
    backgroundColor: e.color,
    tension: .3,
    borderWidth: 3,
    pointRadius: 4
  }))
}));

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: "#1e1e24", font: { weight: 700 as const } } } },
  scales: {
    x: { grid: { color: "#ece8d8" }, ticks: { color: "#69665d" } },
    y: { grid: { color: "#ece8d8" }, ticks: { color: "#69665d", callback: (v: string | number) => `${v}ms` } }
  }
};
</script>

<template><div class="chart-box"><Line :data="data" :options="options" /></div></template>
