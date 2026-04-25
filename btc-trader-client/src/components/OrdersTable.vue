<template>
  <table>
    <thead>
      <tr>
        <th>Time</th>
        <th>Side</th>
        <th>Type</th>
        <th>Qty</th>
        <th>Filled</th>
        <th>Price</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="order in [...orders].reverse()" :key="order.orderId">
        <td class="mono">{{ formatTime(order.time) }}</td>
        <td :class="['side', order.side.toLowerCase()]">{{ order.side }}</td>
        <td>{{ order.type }}</td>
        <td class="mono">{{ order.origQty }}</td>
        <td class="mono">{{ order.executedQty }}</td>
        <td class="mono">{{ order.type === 'MARKET' ? '—' : order.price }}</td>
        <td :class="['status-badge', order.status.toLowerCase()]">{{ order.status }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import type { Order } from '../types'

defineProps<{ orders: Order[] }>()

function formatTime(ms: number): string {
  return new Date(ms).toLocaleString()
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th {
  text-align: left;
  padding: 10px 14px;
  color: #888;
  font-weight: 500;
  border-bottom: 1px solid #2a2a2a;
  white-space: nowrap;
}

td {
  padding: 10px 14px;
  border-bottom: 1px solid #1e1e1e;
  color: #ddd;
}

tr:last-child td {
  border-bottom: none;
}

.mono {
  font-family: monospace;
}

.side.buy {
  color: #26a69a;
  font-weight: 600;
}
.side.sell {
  color: #ef5350;
  font-weight: 600;
}

.status-badge {
  font-size: 12px;
  text-transform: capitalize;
}
.status-badge.filled {
  color: #26a69a;
}
.status-badge.canceled {
  color: #888;
}
.status-badge.new {
  color: #f0b90b;
}
.status-badge.partially_filled {
  color: #fb8c00;
}
</style>
