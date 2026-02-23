import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify } from 'quasar'


export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
  }),
  getters: {
    can: (state) => (permissionName) => {
      if (!state.user) return false;
      const isAdmin = state.user.roles?.includes('Administrador');
      if (isAdmin) return true;
      return state.user.permissions?.includes(permissionName) || false;
    },
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    async login(email, password) {
      try {
        await api.get('/sanctum/csrf-cookie');
        const response = await api.post('/login', { email, password });
        this.token = response.data.token;
        this.user = response.data.user;
        return true;
      } catch (error) {
        return false;
      }

    },
    async fetchUser() {
      try {
        const response = await api.get('/user')
        this.user = response.data
      } catch (error) {
        console.error("Error al obtener el usuario:", error)
      }
    },
    async logout() {
      try {
        await api.post('/logout')
      } catch (error) {
        console.error("Error al cerrar sesión:", error)
      } finally {
        this.user = null
        this.token = null
      }
    }
  },
  persist: {
    key: 'sicae_auth_session', // Nombre de la cookie/localstorage
    storage: localStorage,      // O sessionStorage si quieres que se borre al cerrar la pestaña
    pick: ['user', 'token'],    // Solo persistir estos campos
  }
})
