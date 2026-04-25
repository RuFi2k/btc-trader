import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order } from '../types'
import { useAccountStore } from './account'

const API_URL = 'http://localhost:3000/api/trade'

export const useOpenOrdersStore = defineStore('openOrders', () => {
  const orders  = ref<Order[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function fetchOpenOrders() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_URL}/open-orders`)
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      orders.value = await res.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  async function cancel(orderId: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/order/${orderId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.msg ?? data.error ?? 'Cancel failed')
      }
      await Promise.all([fetchOpenOrders(), useAccountStore().fetchBalance()])
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      return false
    }
  }

  return { orders, loading, error, fetchOpenOrders, cancel }
})
