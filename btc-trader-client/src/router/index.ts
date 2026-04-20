import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import TradePage from '../pages/TradePage.vue'
import HistoryPage from '../pages/HistoryPage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/trade' },
  { path: '/trade', component: TradePage },
  { path: '/history', component: HistoryPage },
  { path: '/:pathMatch(.*)*', redirect: '/trade' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
