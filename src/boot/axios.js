import axios from "axios"
import { useAuthStore } from 'src/stores/auth'
import { Notify } from 'quasar'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  withXSRFToken: true
})

api.interceptors.request.use(
  config => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  error => Promise.reject(error)
)

api.interceptors.response.use(
  response => response,
  error => {
    // Extraemos el mensaje del backend o usamos uno por defecto
    const message = error.response?.data?.message || 'Ocurrió un error inesperado'

    // Si el error es 403 (Seguridad) o 422 (Validación), mostramos el mensaje premium
    if (error.response?.status === 403 || error.response?.status === 422) {
      Notify.create({
        type: 'negative',
        message: message,
        position: 'bottom',
        icon: 'security', // Icono de seguridad para estos casos
        actions: [{ icon: 'close', color: 'white' }]
      });
    }

    // Manejo de sesión expirada (401)
    if (error.response?.status === 401) {
       Notify.create({ type: 'warning', message: 'Sesión expirada' })
       // Aquí podrías redirigir al login
    }

    return Promise.reject(error)
  }
)

export { api }
