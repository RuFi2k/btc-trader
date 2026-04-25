<template>
  <div class="page">
    <div class="status" :class="{ connected: store.connected }">
      {{ store.connected ? 'Connected' : 'Disconnected' }} · {{ store.symbol }}
    </div>
    <CandlestickChart
      :candles="store.candles.slice(-15)"
      v-model:interval="interval"
    />
    <TradeControls />
    <OpenOrders />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useKlinesStore } from '../stores/klines'
import CandlestickChart from '../components/CandlestickChart.vue'
import TradeControls from '../components/TradeControls.vue'
import OpenOrders from '../components/OpenOrders.vue'

const store = useKlinesStore()

const interval = computed({
  get: () => store.interval,
  set: (val) => store.setInterval(val),
})

onMounted(() => store.connect())
onUnmounted(() => store.disconnect())
</script>

<style scoped>
.status {
  padding: 8px 16px;
  font-size: 12px;
  color: #555;
  font-family: monospace;
}

.status.connected { color: #26a69a; }
</style>
