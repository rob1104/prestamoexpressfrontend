import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    nombre_sucursal: '',
    telefono_1: ''
  }),
  actions: {
    setSucursalInfo(data) {
      this.nombre_sucursal = data.nombre_sucursal || ''
      this.telefono_1 = data.telefono_1 || ''
    }
  },
  persist: true
})
