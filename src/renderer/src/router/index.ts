import { createRouter, createWebHashHistory } from 'vue-router'
const routes: any[] = [
  {
    path: '/single',
    name: 'single',
    component: () => import('@renderer/page/single.vue')
  },
  {
    path: '/',
    name: 'config',
    component: () => import('@renderer/page/config.vue')
  },
  {
    path: '/multiple',
    name: 'multiple',
    component: () => import('@renderer/page/multiple.vue')
  }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})
export default router
