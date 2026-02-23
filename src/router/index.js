import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'boot/axios'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach(async (to, from) => {
    const authStore = useAuthStore()
    const isAuthenticated = !!authStore.token

    // 1. Verificación básica de autenticación
    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
      return '/login'
    }

    if (to.matched.some(record => record.meta.guestOnly) && isAuthenticated) {
      return '/'
    }

    // 2. Sincronización y Validación de Permisos
    if (isAuthenticated) {
      try {
        const response = await api.get('/api/user')

        if (response.data) {
          authStore.user = response.data

          // Seguridad: Usuario inactivo fuera
          if (!response.data.active) {
            authStore.logout()
            return '/login'
          }

          // --- VALIDACIÓN DE PERMISOS ---
          // Buscamos si la ruta exige un permiso (meta: { permission: '...' })
          const requiredPermission = to.meta.permission;

          if (requiredPermission && !authStore.can(requiredPermission)) {
            console.warn(`Intento de acceso no autorizado a ${to.path}`);
            return '/403';
          }

        } else {
          authStore.logout()
          return '/login'
        }
      } catch (error) {
        console.log('Error al validar sesión:', error)
        authStore.logout()
        return '/login'
      }
    }

    return true
  })


  return Router
})
