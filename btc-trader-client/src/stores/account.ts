import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_URL = 'http://localhost:3000/api/trade'

export const useAccountStore = defineStore('account', () => {
  const balance = ref<{ BTC: string; USDT: string } | null>(null)

  async function fetchBalance() {
    try {
      const res  = await fetch(`${API_URL}/account`)
      const data = await res.json()
      const btc  = data.balances.find((b: { asset: string }) => b.asset === 'BTC')
      const usdt = data.balances.find((b: { asset: string }) => b.asset === 'USDT')
      balance.value = {
        BTC:  parseFloat(btc?.free  ?? '0').toFixed(6),
        USDT: parseFloat(usdt?.free ?? '0').toFixed(2),
      }
    } catch (e) {
      console.error('Unknown error in fetchBalance():', e);
    }
  }

  return { balance, fetchBalance }
})
