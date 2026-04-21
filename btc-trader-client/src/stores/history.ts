import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order } from '../types'

const API_URL = 'http://localhost:3000/api/trade'

export const useHistoryStore = defineStore('history', () => {
  const orders = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchHistory() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_URL}/history`)
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      orders.value = await res.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  return { orders, loading, error, fetchHistory }
})
