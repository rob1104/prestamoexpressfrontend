<template>
  <q-page class="q-pa-md bg-slate-50">
    <div class="row items-center q-mb-md justify-between">
      <div class="col-auto">
        <div class="text-h5 text-weight-bolder text-primary uppercase tracking-tighter">
          <q-icon name="ReceiptLong" class="q-mr-sm" /> Préstamo Tradicional
        </div>
      </div>
      <div class="col-auto q-gutter-sm">
        <q-btn unelevated color="primary" icon="save" label="F6 Confirmar" @click="saveBoleta" class="shadow-3" />
        <q-btn outline color="secondary" icon="refresh" label="F7 Limpiar" @click="resetForm" />
        <q-btn outline color="grey-8" icon="logout" label="F9 Salir" to="/" />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-9 q-gutter-y-md">

        <BoletaClienteHeader
          v-model="form"
          @cliente-cambiado="onClienteUpdate"
        >
          <template v-slot:plan-info>
            <div class="column q-pa-md">
              <div class="text-caption text-weight-bold text-primary text-center">PLAZO Y VENCIMIENTO</div>
              <q-select
                v-model="form.plazo_dias"
                :options="[
                  { label:'30 DIAS', value:30 },
                  { label:'15 DIAS', value:15 },
                  { label:'07 DIAS', value:7 },
                  { label:'1 DIA', value:1 },
                ]"
                outlined dense map-options emit-value
                bg-color="white"
                @update:model-value="calcularVencimiento"
              />
              <q-input
                v-model="form.fecha_vencimiento"
                label="Vence el:"
                outlined dense readonly
                bg-color="yellow-1"
                input-class="text-center text-weight-bold"
              />
            </div>
          </template>
        </BoletaClienteHeader>

        <BoletaValuacionGrid
          :precios="cotizacionesActuales"
          @update="onValuacionUpdate"
        />
      </div>

      <div class="col-12 col-md-3">
        <BoletaResumenFinanciero
          :resumen="form"
          @confirmar="saveBoleta"
          class="sticky-resumen"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { date, useQuasar } from 'quasar'
  import { api } from 'boot/axios'
  import BoletaClienteHeader from 'components/Boletas/ComponenteBoletaCliente.vue'
  import BoletaValuacionGrid from 'components/Boletas/ComponenteValuacionGrid.vue'
  import BoletaResumenFinanciero from 'components/Boletas/ComponenteResumen.vue'


  const $q = useQuasar()

  // 1. ESTADO INICIAL DEL FORMULARIO
  const form = ref({
    cliente_id: null,
    no_bolsa: '',
    categoria_id: 1,
    tipo_prestamo: 'tradicional',
    fecha_boleta: date.formatDate(Date.now(), 'YYYY-MM-DD'),
    fecha_vencimiento: '',
    plazo_dias: 30,
    p_interes: 20.00, // Porcentaje de comisión base
    prestamo: 0,
    valor_comercial: 0,
    comision: 0,
    iva_comision: 0,
    total_pagar: 0,
    partidas: [] // Detalle de prendas
  })

  // Cotizaciones de oro según el tipo de cliente
  const cotizacionesActuales = ref({
    '8K': 130, '10K': 150, '14K': 250, '18K': 360, '21K': 430, 'ORO_FINO': 0, 'MEDALLA': 0,
    'M2': 768, 'M25': 912, 'M5': 1776, 'M10': 3600, 'M20': 7200, 'M50': 18000
  })

  // 2. LÓGICA DE CÁLCULO
  const calcularVencimiento = () => {
    const fe = new Date(form.value.fecha_boleta)
    const fv = date.addToDate(fe, { days: form.value.plazo_dias + 1 })

    // Formateamos a 'DD-MMM-YYYY' y forzamos minúsculas
    const fechaFormateada = date.formatDate(fv, 'DD-MMM-YYYY', {
      monthsShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    })

    form.value.fecha_vencimiento = fechaFormateada.toLowerCase() // Resultado: 25-mar-2026
  }

  const onValuacionUpdate = (data) => {
    form.value.partidas = data.partidas //
    form.value.prestamo = data.totalPrestamo //

    // Regla de negocio: Valor comercial es ~25% mayor al préstamo
    form.value.valor_comercial = form.value.prestamo / 0.8

    // Comisiones e IVA
    form.value.comision = form.value.prestamo * (form.value.p_interes / 100)
    form.value.iva_comision = form.value.comision * 0.16
    form.value.total_pagar = form.value.prestamo + form.value.comision //+ form.value.iva_comision
  }

  const onClienteUpdate = (cliente) => {
    if (cliente) {
      // Aquí podrías ajustar el p_interes o cotizaciones según el perfil del cliente
      console.log("Cliente seleccionado:", cliente.nombre_completo)
    }
  }

  // 3. PERSISTENCIA (GUARDADO F6)
  const saveBoleta = async () => {
    if (!form.value.cliente_id || form.value.prestamo <= 0) {
      $q.notify({ type: 'warning', message: 'Seleccione un cliente y valúe al menos una prenda.' })
      return
    }

    $q.loading.show({ message: 'Procesando boleta...' })
    try {
      await api.post('/api/boletas', form.value)
      $q.notify({ type: 'positive', message: 'BOLETA REGISTRADA EXITOSAMENTE', position: 'top' })
      resetForm()
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error: ' + e.response.data.message })
    } finally {
      $q.loading.hide()
    }
  }

  const resetForm = () => {
    window.location.reload() // Forma rápida de limpiar todo el estado
  }

  // Atajos de teclado
  const handleKeys = (e) => {
    if (e.key === 'F6') { e.preventDefault(); saveBoleta(); }
    if (e.key === 'F7') { e.preventDefault(); resetForm(); }
  }

  const formatMoney = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 2 })

  onMounted(() => {
    calcularVencimiento()
    window.addEventListener('keydown', handleKeys)
  })
  onUnmounted(() => window.removeEventListener('keydown', handleKeys))

</script>

<style lang="scss" scoped>
  .financial-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    &.secondary { opacity: 0.8; font-size: 0.9rem; }
    .label { font-weight: 500; }
    .value { font-weight: 900; }
  }

  .sticky-resumen { position: sticky; top: 20px; }
  .bg-yellow-1 { background-color: #fefce8; }
  .tracking-tighter { letter-spacing: -0.04em; }
</style>
