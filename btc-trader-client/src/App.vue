<template>
  <NavOverlay />
  <RouterView />
</template>

<script setup lang="ts">
import NavOverlay from './components/NavOverlay.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0d0d0d;
  color: #fff;
  font-family: sans-serif;
}

.page {
  padding: 24px;
}
</style>
