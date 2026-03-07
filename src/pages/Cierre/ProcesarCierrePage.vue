<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card style="width: 450px; max-width: 90vw;" class="shadow-10">
      <q-card-section :class="resumenCierre.pendiente ? 'bg-red-9' : 'bg-primary'" class="text-white q-pa-md">
        <div class="text-h6 text-weight-bolder">ESTADO DEL CIERRE DIARIO</div>
      </q-card-section>

      <q-card-section class="q-pa-lg text-center">
        <div v-if="loadingStatus" class="q-gutter-md">
          <q-spinner-dots color="red-9" size="40px" />
          <p>Consultando días pendientes...</p>
        </div>

        <div v-else-if="!resumenCierre.pendiente">
          <q-icon name="check_circle" color="positive" size="80px" />
          <div class="text-h5 q-mt-md text-positive">SISTEMA AL DÍA</div>
          <p class="text-grey-7">Último cierre: {{ formatFechaSicae(resumenCierre.ultima_fecha) }}</p>

          <q-separator class="q-my-md" />

          <div v-if="resumenCierre.sugerir_cierre_hoy" class="bg-blue-1 q-pa-sm rounded-borders">
            <q-icon name="info" color="blue" /> Ya pasó la hora de cierre ({{ resumenCierre.hora_configurada }}).
            <div class="text-weight-bold">¿Desea realizar el corte de hoy?</div>
          </div>

          <q-btn
            outline color="primary"
            icon="history_query"
            label="REALIZAR CIERRE DE HOY"
            class="full-width q-mt-md"
            @click="validarCierreAnticipado"
          />
        </div>
        <div v-else>
          <q-icon name="warning" color="orange-9" size="80px" />
          <div class="text-h5 q-mt-md text-orange-9">{{ resumenCierre.dias_faltantes }} DÍAS PENDIENTES</div>
          <p>Se procesarán cierres desde: <strong>{{ resumenCierre.proxima_fecha_a_cerrar }}</strong></p>

          <q-btn
            color="red-9"
            label="EJECUTAR CIERRES AHORA"
            class="full-width q-mt-md"
            :loading="ejecutando"
            @click="lanzarCierre"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { api } from 'boot/axios'
  import { useQuasar, date } from 'quasar'

  const $q = useQuasar()
  const loadingStatus = ref(true)
  const ejecutando = ref(false)
  const resumenCierre = ref({ pendiente: false, dias_faltantes: 0 })

  const consultarStatus = async () => {
    loadingStatus.value = true
    try {
      const { data } = await api.get('/api/cierre-diario/status')
      resumenCierre.value = data
    } finally {
      loadingStatus.value = false
    }
  }

  const validarCierreAnticipado = () => {
    const ahoraStr = new Date().toLocaleTimeString('en-GB'); // HH:mm:ss
    const esAnticipado = ahoraStr < resumenCierre.value.hora_configurada;

    // 1. Definimos el mensaje según la hora
    const titulo = esAnticipado
      ? '<div class="text-orange-10 text-weight-bolder">¿EJECUTAR CIERRE ANTICIPADO?</div>'
      : '<div class="text-primary text-weight-bolder">CONFIRMAR CIERRE DIARIO</div>';

    const mensaje = esAnticipado
      ? `Aún no es la hora de cierre configurada (<strong>${resumenCierre.value.hora_configurada}</strong>). <br><br>Al cerrar ahora, el sistema quedará bloqueado para nuevas boletas por el resto del día. ¿Desea continuar?`
      : `Está a punto de realizar el corte de caja de hoy. <br><br><strong>Aviso:</strong> Una vez realizado el cierre, no podrá registrar más préstamos ni pagos hasta el día de mañana. ¿Está seguro?`;

    // 2. Lanzamos el diálogo de Quasar
    $q.dialog({
      title: titulo,
      message: mensaje,
      html: true,
      cancel: { label: 'Cancelar', flat: true, color: 'grey-9' },
      ok: { label: 'Sí, Ejecutar Cierre', color: esAnticipado ? 'orange-9' : 'primary' },
      persistent: true
    }).onOk(() => {
      lanzarCierre();
    });
  }

  const lanzarCierre = async () => {
    ejecutando.value = true
    try {
      const { data } = await api.post('/api/cierre-diario/procesar')
      $q.notify({
        type: 'positive',
        message: `Cierre exitoso: Se procesaron ${data.dias_cerrados.length} días.`,
        icon: 'done_all'
      })
      consultarStatus() // Actualiza la vista
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Fallo al procesar el cierre: ' + e.response?.data?.message })
    } finally {
      ejecutando.value = false
    }
  }

  const formatFechaSicae = (fechaStr) => {
    if (!fechaStr || fechaStr === 'NUNCA') return fechaStr;

    const [anio, mes, dia] = fechaStr.split('-');
    const fechaObj = new Date(anio, mes - 1, dia);

    return date.formatDate(fechaObj, 'DD-MMMM-YYYY', {
      months: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ]
    });
  }


  onMounted(consultarStatus)
</script>
