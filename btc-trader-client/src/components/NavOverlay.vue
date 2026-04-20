<template>
  <nav class="nav-overlay">
    <RouterLink to="/trade" class="nav-tab" active-class="nav-tab--active">Trade</RouterLink>
    <RouterLink to="/history" class="nav-tab" active-class="nav-tab--active">History</RouterLink>
  </nav>
</template>

<style scoped>
.nav-overlay {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.nav-tab {
  padding: 6px 20px;
  border-radius: 6px;
  text-decoration: none;
  color: #aaa;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s, background 0.2s;
}

.nav-tab:hover {
  color: #fff;
  background: #2a2a2a;
}

.nav-tab--active {
  color: #f0b90b;
  background: #2a2a2a;
}
</style>
