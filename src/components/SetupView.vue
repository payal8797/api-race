<script setup lang="ts">
import { Plus, Flag, ShieldCheck, Zap, Swords } from "lucide-vue-next";
import EndpointCard from "./EndpointCard.vue";
import { useRaceStore } from "../stores/race";

const store = useRaceStore();
</script>

<template>
  <section class="setup">
    <div class="hero">
      <div class="eyebrow"><Zap :size="15" fill="currentColor" /> API BENCHMARKING, BUT FUN</div>
      <h1>Ready. Set. <span>Request.</span></h1>
      <p>Put your endpoints on the grid and find out which API actually wins.</p>
    </div>

    <div class="setup-grid">
      <div>
        <div class="section-heading">
          <div>
            <span class="step">01</span>
            <h2>Add your endpoints</h2>
          </div>
          <span class="counter">{{ store.endpoints.length }}/6 racers</span>
        </div>

        <div class="endpoint-list">
          <EndpointCard
            v-for="(endpoint, index) in store.endpoints"
            :key="endpoint.id"
            :endpoint="endpoint"
            :index="index"
            :can-remove="store.endpoints.length > 2"
            :error="store.validationErrors[endpoint.id]"
            @remove="store.removeEndpoint"
          />
        </div>

        <button class="demo-btn" @click="store.loadDemo">⚡ Load demo race</button>
        <button class="add-endpoint" :disabled="store.endpoints.length >= 6" @click="store.addEndpoint">
          <Plus :size="18" /> Add another racer
        </button>
      </div>

      <aside class="race-control">
        <div class="control-checker"></div>
        <div class="control-inner">
          <div class="step">02</div>
          <h2>Race settings</h2>

          <label class="field-label">LAPS</label>
          <div class="lap-options">
            <button v-for="n in [1,5,10,20]" :key="n" :class="{ active: store.laps === n }" @click="store.laps = n">
              <strong>{{ n }}</strong><small>{{ n === 1 ? "SPRINT" : "LAPS" }}</small>
            </button>
          </div>

          <label class="field-label">TIMEOUT</label>
          <select v-model="store.timeout" class="timeout-select">
            <option :value="3000">3 seconds</option>
            <option :value="5000">5 seconds</option>
            <option :value="8000">8 seconds</option>
            <option :value="10000">10 seconds</option>
          </select>

          <div class="race-note">
            <Swords :size="20" />
            <div><strong>Head-to-head ready</strong><span>Use 2 racers for a direct comparison.</span></div>
          </div>

          <button class="start-race" :disabled="store.isBusy" @click="store.runRace">
            <Flag :size="22" fill="currentColor" /> START RACE
          </button>

          <div class="privacy"><ShieldCheck :size="15" /> Results stay in this session</div>
        </div>
      </aside>
    </div>
  </section>
</template>
