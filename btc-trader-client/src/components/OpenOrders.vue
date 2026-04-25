<template>
  <div class="open-orders">
    <div class="header">
      <span class="title">Open Orders</span>
      <button class="refresh-btn" :disabled="store.loading" @click="store.fetchOpenOrders()">
        Refresh
      </button>
    </div>

    <p v-if="store.loading" class="hint">Loading…</p>
    <p v-else-if="store.error" class="hint error">{{ store.error }}</p>
    <p v-else-if="!store.orders.length" class="hint">No open orders.</p>
    <OpenOrdersTable v-else :orders="store.orders" :cancelling="cancelling" @cancel="cancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOpenOrdersStore } from '../stores/openOrders'
import OpenOrdersTable from './OpenOrdersTable.vue'

const store = useOpenOrdersStore()
const cancelling = ref<number | null>(null)

async function cancel(orderId: number) {
  cancelling.value = orderId
  await store.cancel(orderId)
  cancelling.value = null
}

onMounted(() => store.fetchOpenOrders())
</script>

<style scoped>
.open-orders {
  padding: 0 16px 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.title {
  font-size: 12px;
  color: #666;
}

.refresh-btn {
  background: none;
  border: none;
  color: #555;
  font-size: 15px;
  cursor: pointer;
  line-height: 1;
}

.refresh-btn:hover:not(:disabled) {
  color: #aaa;
}
.refresh-btn:disabled {
  opacity: 0.4;
}

.hint {
  font-size: 12px;
  color: #555;
  padding: 8px 0;
}

.hint.error {
  color: #ef5350;
}
</style>
