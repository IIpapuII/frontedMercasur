import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Empleado from '../views/empleado.vue'
import empresas from '../views/empresas.vue'
import NotFound from '../views/NotFound.vue'
import Login from '../views/login.vue'
import concesion from '../views/ventaspollos.vue'

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
    {
      path: '/inicio-sesion',
      name: 'InicioSesion',
      component: Login
    },
    {
      path: '/concesion-pollos',
      name: 'ConcesionPollos',
      component: concesion,
      meta: {
        requiresAuth: true,
        roles: ['ventaspollos']
      }
    },
  ],
})
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const roles = JSON.parse(localStorage.getItem('user_roles') || '[]')

  if (to.meta.requiresAuth && !token) {
    // No autenticado → redirige al login
    return next({ name: 'InicioSesion' })
  }

  if (to.meta.roles && !to.meta.roles.some(role => roles.includes(role))) {
    // No tiene el rol adecuado → redirige a NotFound o vista de acceso denegado
    return next({ name: 'NotFound' })
  }

  // Todo ok
  next()
})

export default router
