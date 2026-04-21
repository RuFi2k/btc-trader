<template>
  <pre>{{ state }}</pre>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useKlinesStore } from '../stores/klines'

const store = useKlinesStore()

const state = computed(() => JSON.stringify({
  connected: store.connected,
  symbol: store.symbol,
  interval: store.interval,
  candleCount: store.candles.length,
  candles: store.candles.slice(-15),
}, null, 2))

onMounted(() => store.connect())
onUnmounted(() => store.disconnect())
</script>
