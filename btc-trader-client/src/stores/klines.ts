import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { KlineCandle } from '../types'

const WS_URL = 'ws://localhost:3000/klines'
const MAX_CANDLES = 500

export const useKlinesStore = defineStore('klines', () => {
  const candles = ref<KlineCandle[]>([])
  const symbol = ref('BTCUSDT')
  const interval = ref('1m')
  const connected = ref(false)

  let ws: WebSocket | null = null

  function sendInterval(newInterval: string) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'SET_INTERVAL', interval: newInterval }))
    }
  }

  function connect() {
    if (ws) ws.close()

    ws = new WebSocket(`${WS_URL}?symbol=${symbol.value}`)

    ws.onopen = () => {
      connected.value = true
      sendInterval(interval.value)
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      const k = msg.k as {
        t: number
        T: number
        o: string
        h: string
        l: string
        c: string
        v: string
        x: boolean
      }

      const candle: KlineCandle = {
        openTime: k.t,
        open: k.o,
        high: k.h,
        low: k.l,
        close: k.c,
        volume: k.v,
        closeTime: k.T,
        isClosed: k.x,
      }

      const last = candles.value.at(-1)
      if (last && last.openTime === candle.openTime) {
        candles.value[candles.value.length - 1] = candle
      } else {
        candles.value.push(candle)
        if (candles.value.length > MAX_CANDLES) {
          candles.value.shift()
        }
      }
    }

    ws.onclose = () => {
      connected.value = false
    }
    ws.onerror = () => {
      connected.value = false
    }
  }

  function disconnect() {
    ws?.close()
    ws = null
  }

  function setInterval(newInterval: string) {
    interval.value = newInterval
    candles.value = []
    sendInterval(newInterval)
  }

  return { candles, symbol, interval, connected, connect, disconnect, setInterval }
})
