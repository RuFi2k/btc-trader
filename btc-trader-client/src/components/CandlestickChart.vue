<template>
  <div class="chart-container">
    <div class="toolbar">
      <button
        v-for="iv in INTERVALS"
        :key="iv"
        :class="['interval-btn', { active: iv === interval }]"
        @click="$emit('update:interval', iv)"
      >{{ iv }}</button>
    </div>

    <div v-if="!candles.length" class="empty">Waiting for data…</div>

    <div v-else class="chart">
      <div class="price-axis">
        <span>{{ fmt(chartMax) }}</span>
        <span>{{ fmt((chartMax + chartMin) / 2) }}</span>
        <span>{{ fmt(chartMin) }}</span>
      </div>

      <div class="candles">
        <div class="candle-col" v-for="c in candles" :key="c.openTime">
          <div class="candle-limits" :style="candleLimitsStyle(c)" />
          <div class="body" :class="isBullish(c) ? 'bull' : 'bear'" :style="bodyStyle(c)" />
        </div>

        <div class="current-price-line" :style="{ top: `${currentPricePct}%` }">
          <div class="current-price-label" :class="isBullish(lastCandle!) ? 'bull' : 'bear'">
            {{ fmt(currentPrice) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KlineCandle } from '../types'

const INTERVALS = ['1m', '5m', '15m', '30m', '1h', '4h', '1d']

const props = defineProps<{
  candles: KlineCandle[]
  interval: string
}>()

defineEmits<{ (e: 'update:interval', val: string): void }>()

const minLow  = computed(() => Math.min(...props.candles.map(c => parseFloat(c.low))))
const maxHigh = computed(() => Math.max(...props.candles.map(c => parseFloat(c.high))))

const chartMin = computed(() => minLow.value)
const chartMax = computed(() => maxHigh.value)
const range = computed(() => chartMax.value - chartMin.value)

function pct(price: number): number {
  return ((chartMax.value - price) / range.value) * 100
}

function isBullish(c: KlineCandle): boolean {
  return parseFloat(c.close) >= parseFloat(c.open)
}

function candleLimitsStyle(c: KlineCandle) {
  const high = parseFloat(c.high)
  const low = parseFloat(c.low)
  return {
    top: `${pct(high)}%`,
    height: `${Math.max((high - low) / range.value * 100, 0.5)}%`,
  }
}

function bodyStyle(c: KlineCandle) {
  const open = parseFloat(c.open)
  const close = parseFloat(c.close)
  const top = Math.max(open, close)
  const bot = Math.min(open, close)
  return {
    top: `${pct(top)}%`,
    height: `${Math.max((top - bot) / range.value * 100, 0.5)}%`,
  }
}

const lastCandle = computed(() => props.candles.at(-1))
const currentPrice = computed(() => parseFloat(lastCandle.value?.close ?? '0'))
const currentPricePct = computed(() => pct(currentPrice.value))

function fmt(price: number): string {
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.chart-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #333333;
  border-radius: 8px;
}

.toolbar {
  display: flex;
  gap: 4px;
}

.interval-btn {
  padding: 4px 10px;
  background: none;
  border: 1px solid #333;
  border-radius: 4px;
  color: #888;
  font-size: 12px;
  cursor: pointer;
}

.interval-btn:hover  { border-color: #555; color: #ccc; }
.interval-btn.active { border-color: #f0b90b; color: #f0b90b; }

.empty {
  color: #555;
  font-size: 13px;
  height: 320px;
  display: flex;
}

.chart {
  display: flex;
  gap: 8px;
  height: 320px;
}

.price-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 11px;
  color: #555;
  font-family: monospace;
  min-width: 80px;
  padding-bottom: 2px;
}

.candles {
  flex: 1;
  display: flex;
  position: relative;
  padding-right: 60px;
}

.candle-col {
  flex: 1;
  position: relative;
}

.candle-limits {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  background: #555;
}

.body {
  position: absolute;
  left: 15%;
  right: 15%;
  min-height: 1px;
}

.body.bull { background: #26a69a; }
.body.bear { background: #ef5350; }

.current-price-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px dashed #444;
  pointer-events: none;
}

.current-price-label {
  position: absolute;
  right: 0;
  transform: translateY(-50%);
  font-size: 11px;
  font-family: monospace;
  padding: 2px 5px;
  border-radius: 3px;
  white-space: nowrap;
}

.current-price-label.bull { background: #26a69a; color: #000; }
.current-price-label.bear { background: #ef5350; color: #000; }
</style>
