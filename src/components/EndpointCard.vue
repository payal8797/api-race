<script setup lang="ts">
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-vue-next";
import { ref } from "vue";
import type { EndpointConfig, HttpMethod } from "../types/race";

defineProps<{ endpoint: EndpointConfig; index: number; canRemove: boolean }>();
const emit = defineEmits<{ remove: [id: string] }>();
const expanded = ref(false);
const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function addHeader(endpoint: EndpointConfig) {
  endpoint.headers.push({ key: "", value: "" });
}
</script>

<template>
  <article class="endpoint-card" :style="{ '--car': endpoint.color }">
    <div class="endpoint-number">{{ index + 1 }}</div>
    <div class="endpoint-main">
      <div class="endpoint-top">
        <input v-model="endpoint.name" class="name-input" aria-label="Endpoint name" />
        <button v-if="canRemove" class="icon-btn danger" @click="emit('remove', endpoint.id)" title="Remove endpoint">
          <Trash2 :size="17" />
        </button>
      </div>
      <div class="request-row">
        <select v-model="endpoint.method" class="method-select">
          <option v-for="m in methods" :key="m">{{ m }}</option>
        </select>
        <input v-model="endpoint.url" class="url-input" placeholder="https://api.example.com/users" />
        <button class="icon-btn" @click="expanded = !expanded" :title="expanded ? 'Hide options' : 'Request options'">
          <ChevronUp v-if="expanded" :size="18" /><ChevronDown v-else :size="18" />
        </button>
      </div>
      <div v-if="expanded" class="advanced">
        <div class="advanced-title">REQUEST HEADERS</div>
        <div v-for="(header, i) in endpoint.headers" :key="i" class="header-row">
          <input v-model="header.key" placeholder="Header name" />
          <input v-model="header.value" placeholder="Value" />
          <button class="tiny-btn" @click="endpoint.headers.splice(i, 1)">×</button>
        </div>
        <button class="text-btn" @click="addHeader(endpoint)"><Plus :size="14" /> Add header</button>
        <template v-if="['POST','PUT','PATCH'].includes(endpoint.method)">
          <div class="advanced-title body-title">JSON BODY</div>
          <textarea v-model="endpoint.body" rows="4" placeholder='{"hello":"world"}'></textarea>
        </template>
      </div>
    </div>
  </article>
</template>
