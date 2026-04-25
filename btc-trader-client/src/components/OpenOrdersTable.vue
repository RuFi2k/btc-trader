<template>
  <table>
    <thead>
      <tr>
        <th>Side</th>
        <th>Qty</th>
        <th>Price</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="order in orders" :key="order.orderId">
        <td :class="['side', order.side.toLowerCase()]">{{ order.side }}</td>
        <td class="mono">{{ order.origQty }}</td>
        <td class="mono">{{ order.price }}</td>
        <td>
          <button
            class="cancel-btn"
            :disabled="cancelling === order.orderId"
            @click="$emit('cancel', order.orderId)"
          >
            {{ cancelling === order.orderId ? '…' : 'Cancel' }}
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import type { Order } from '../types'

defineProps<{
  orders: Order[]
  cancelling: number | null
}>()

defineEmits<{ (e: 'cancel', orderId: number): void }>()
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th {
  text-align: left;
  padding: 6px 8px;
  color: #555;
  font-weight: 400;
  border-bottom: 1px solid #222;
}

td {
  padding: 7px 8px;
  border-bottom: 1px solid #1a1a1a;
  color: #ccc;
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

.cancel-btn {
  padding: 3px 10px;
  background: none;
  border: 1px solid #444;
  border-radius: 4px;
  color: #888;
  font-size: 11px;
  cursor: pointer;
}

.cancel-btn:hover:not(:disabled) {
  border-color: #ef5350;
  color: #ef5350;
}
.cancel-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
