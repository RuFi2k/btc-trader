<template>
  <div class="page">
    <h1>Transaction History</h1>

    <p v-if="store.loading" class="status">Loading…</p>
    <p v-else-if="store.error" class="status error">{{ store.error }}</p>
    <p v-else-if="!store.orders.length" class="status">No orders found.</p>
    <OrdersTable v-else :orders="store.orders" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useHistoryStore } from '../stores/history'
import OrdersTable from '../components/OrdersTable.vue'

const store = useHistoryStore()

onMounted(() => store.fetchHistory())
</script>

<style scoped>
.status {
  padding: 24px 0;
  color: #888;
  font-size: 14px;
}

.status.error {
  color: #ef5350;
}
</style>
