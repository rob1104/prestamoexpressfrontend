<template>
  <q-dialog v-model="bloqueoVisible" persistent>
    <q-card class="bg-red-1 text-red-10 q-pa-lg text-center">
      <q-icon name="lock" size="xl" />
      <div class="text-h5 text-weight-bolder q-mt-md">SISTEMA BLOQUEADO</div>
      <p>No se ha detectado el cierrre del dia anterior o hay dias acumulados.</p>
      <q-btn
        color="red-10"
        label="Confirmar cierres pendientes"
        :loading="loading"
        @click="ejecutarCierre" />
    </q-card>
  </q-dialog>

</template>

<script setup>
  import { ref } from 'vue'

  const bloqueoVisible = ref(true)
  const loading = ref(false)

  const ejecutarCierre = async() => {
    loading.value = true
    try {
      await api.post('/api/cierre-diario/procesar')
      bloqueoVisible.value = false
      $q.notify({ type: 'positive', message: 'Cierres procesados. Sistema habilitado.' })
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al procesar el cierre.' })
    } finally {
      loading.value = false
    }
  }

</script>

<style scoped>

</style>
