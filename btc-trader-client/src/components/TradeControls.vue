<template>
  <div class="trade-controls">
    <div v-if="accountStore.balance" class="balance">
      <span class="balance-item"
        ><span class="asset">BTC</span> {{ accountStore.balance.BTC }}</span
      >
      <span class="balance-item"
        ><span class="asset">USDT</span> {{ accountStore.balance.USDT }}</span
      >
    </div>

    <div class="row">
      <div class="type-toggle">
        <button
          :class="['toggle-btn', { active: orderType === 'MARKET' }]"
          @click="orderType = 'MARKET'"
        >
          Market
        </button>
        <button
          :class="['toggle-btn', { active: orderType === 'LIMIT' }]"
          @click="orderType = 'LIMIT'"
        >
          Limit
        </button>
      </div>
    </div>

    <div class="row">
      <label class="field">
        <span>Quantity (BTC)</span>
        <input v-model="quantity" type="number" min="0" step="0.0001" placeholder="0.0000" />
      </label>

      <label v-if="orderType === 'LIMIT'" class="field">
        <span>Price (USDT)</span>
        <input v-model="price" type="number" min="0" step="0.01" placeholder="0.00" />
      </label>
    </div>

    <div v-if="feedback" :class="['feedback', feedback.type]">{{ feedback.message }}</div>

    <div class="row">
      <button class="action-btn buy" :disabled="Boolean(loading)" @click="submit('BUY')">
        {{ loading === 'BUY' ? '…' : 'Buy' }}
      </button>
      <button class="action-btn sell" :disabled="Boolean(loading)" @click="submit('SELL')">
        {{ loading === 'SELL' ? '…' : 'Sell' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOpenOrdersStore } from '../stores/openOrders'
import { useAccountStore } from '../stores/account'

const API_URL = 'http://localhost:3000/api/trade'
const openOrdersStore = useOpenOrdersStore()
const accountStore = useAccountStore()

const orderType = ref<'MARKET' | 'LIMIT'>('MARKET')
const quantity = ref<string>('')
const price = ref<string>('')
const loading = ref<'BUY' | 'SELL' | null>(null)
const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)

onMounted(accountStore.fetchBalance)

async function submit(side: 'BUY' | 'SELL') {
  if (!quantity.value) return

  feedback.value = null
  loading.value = side

  try {
    const body: Record<string, unknown> = {
      type: orderType.value,
      quantity: parseFloat(quantity.value),
    }
    if (orderType.value === 'LIMIT') {
      if (!price.value) {
        feedback.value = { type: 'error', message: 'Price is required for limit orders.' }
        loading.value = null
        return
      }
      body.price = parseFloat(price.value)
    }

    const res = await fetch(`${API_URL}/${side.toLowerCase()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      feedback.value = { type: 'error', message: data.msg ?? data.error ?? 'Order failed.' }
    } else {
      feedback.value = { type: 'success', message: `${side} order placed — ID ${data.orderId}` }
      quantity.value = ''
      price.value = ''
      accountStore.fetchBalance()
      openOrdersStore.fetchOpenOrders()
    }
  } catch (e) {
    feedback.value = { type: 'error', message: 'Could not reach server.' }
  } finally {
    loading.value = null
  }
}
</script>

<style scoped>
.trade-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.type-toggle {
  display: flex;
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
}

.toggle-btn {
  padding: 6px 16px;
  background: none;
  border: none;
  color: #888;
  font-size: 13px;
  cursor: pointer;
}

.toggle-btn:hover {
  color: #ccc;
}
.toggle-btn.active {
  background: #2a2a2a;
  color: #fff;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.field span {
  font-size: 11px;
  color: #666;
}

.field input {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 7px 10px;
  color: #fff;
  font-size: 13px;
  width: 100%;
}

.field input:focus {
  outline: none;
  border-color: #555;
}

.field input::placeholder {
  color: #444;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.buy {
  background: #26a69a;
  color: #000;
}
.action-btn.sell {
  background: #ef5350;
  color: #000;
}

.feedback {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 5px;
}

.feedback.success {
  background: #1a2e2c;
  color: #26a69a;
}
.feedback.error {
  background: #2e1a1a;
  color: #ef5350;
}

.balance {
  display: flex;
  gap: 16px;
  font-size: 13px;
  font-family: monospace;
  color: #aaa;
}

.balance-item .asset {
  color: #555;
  font-size: 11px;
  margin-right: 4px;
}
</style>
