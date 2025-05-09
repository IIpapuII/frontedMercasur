import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Empleado from '../views/empleado.vue'
import empresas from '../views/empresas.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/colaboradores',
      name: 'colaborador',
      component: Empleado
    },
    {
      path: '/empresas',
      name: 'empresas',
      component: empresas
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound
    },
  ],
})

export default router
