import { defineStore } from '#q-app/wrappers'
import { createPinia } from 'pinia'
import piniaPlginPersistedstate from 'pinia-plugin-persistedstate'

export default defineStore((/* { ssrContext } */) => {
  const pinia = createPinia()
  pinia.use(piniaPlginPersistedstate)
  return pinia
})
