import { ref } from 'vue'
import { api } from 'boot/axios'
import { Dialog } from 'quasar'

export function useCierreGuard() {
  const bloqueado = ref(false)
  const dias = ref(0)

  const checkCierre = async () => {
    try {
      const { data } = await api.get('/api/cierre-diario/status')
      bloqueado.value = data.pendiente
      dias.value = data.dias_faltantes

      if (bloqueado.value) {
        Dialog.create({
          title: '<div class="text-red-9 text-weight-bolder">SISTEMA BLOQUEADO</div>',
          message: `Faltan <strong>${dias.value} días</strong> de cierre diario.`,
          html: true,
          persistent: true,
          ok: { label: 'CERRAR DÍAS PENDIENTES', color: 'red-9' }
        }).onOk(async () => {
          // Lógica para procesar los cierres en cadena
          await api.post('/api/cierre-diario/procesar')
          window.location.reload()
        })
      }
    } catch (e) {
      console.error("Error al validar cierre")
    }
  }

  return { bloqueado, dias, checkCierre }
}
