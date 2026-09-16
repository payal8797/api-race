<script setup lang="ts">
import { Gauge, Flag } from "lucide-vue-next";
import SetupView from "./components/SetupView.vue";
import RaceView from "./components/RaceView.vue";
import ResultsView from "./components/ResultsView.vue";
import { useRaceStore } from "./stores/race";

const store = useRaceStore();
</script>

<template>
  <div class="app-shell">
    <header>
      <button class="brand" @click="store.reset">
        <span class="brand-mark"><Flag :size="22" fill="currentColor" /></span>
        <span>API <b>RACE</b></span>
      </button>
      <div class="header-center"><Gauge :size="16" /> REAL REQUESTS. REAL RESULTS.</div>
    </header>

    <main>
      <SetupView v-if="store.status === 'idle'" />
      <RaceView v-else-if="store.status === 'countdown' || store.status === 'racing'" />
      <ResultsView v-else />
    </main>

    <footer>
      <span>API RACE</span>
      <p>Built for developers who think milliseconds deserve a finish line.</p>
      <span>🏁 2026</span>
    </footer>
  </div>
</template>
