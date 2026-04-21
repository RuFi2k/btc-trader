<template>
  <pre>{{ state }}</pre>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useHistoryStore } from '../stores/history'

const store = useHistoryStore()

const state = computed(() => JSON.stringify({
  loading: store.loading,
  error: store.error,
  orderCount: store.orders.length,
  orders: store.orders,
}, null, 2))

onMounted(() => store.fetchHistory())
</script>
