<template>
  <q-dialog v-model="visible" persistent @show="onShow">
    <q-card style="width: 650px; max-width: 95vw;" class="shadow-24 border-orange">
      <q-card-section class="bg-orange-8 text-white row items-center q-pb-sm">
        <div class="text-h6 text-weight-bold uppercase">
          <q-icon name="payments" size="sm" class="q-mr-sm" />
          Captura de Billetes y Monedas (Salida)
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md bg-orange-1">
        <div class="text-center text-subtitle2 text-orange-10 text-weight-bold q-mb-md">
          Capture los billetes y monedas que se entregarán al cliente
        </div>

        <div class="row justify-between items-center bg-white q-pa-sm border-orange rounded-borders q-mb-md shadow-1">
          <div class="text-subtitle1 text-weight-bold text-grey-8">MONTO REQUERIDO:</div>
          <div class="text-h6 text-weight-bolder text-orange-9">{{ formatMoney(montoObjetivo) }}</div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-6 column q-gutter-y-sm">
            <div v-for="(billete, index) in listaBilletes" :key="billete" class="row items-center justify-between">
              <span class="text-weight-bold text-grey-8" style="width: 50px">$ {{ billete }}</span>
              <div style="width: 100px" class="column items-center">
                <q-input :ref="el => { if(index === 0) inputPrimerBillete = el }" v-model.number="conteo.billetes[billete]" type="number" outlined dense bg-color="white" style="width: 80px" input-class="text-center text-weight-bold" @focus="$event.target.select()" :error="inventario && (conteo.billetes[billete] || 0) > (inventario.billetes[billete] || 0)" hide-bottom-space />
                <span class="text-caption text-grey-6 text-weight-bold">Disp: {{ inventario ? (inventario.billetes[billete] || 0) : '...' }}</span>
              </div>
              <span class="text-weight-bolder text-orange-9" style="width: 80px; text-align: right">{{ formatMoney((conteo.billetes[billete] || 0) * billete) }}</span>
            </div>
          </div>

          <div class="col-6 column q-gutter-y-sm">
            <div v-for="moneda in listaMonedas" :key="moneda.valor" class="row items-center justify-between">
              <span class="text-weight-bold text-grey-8" style="width: 50px">$ {{ moneda.etiqueta }}</span>
              <div style="width: 100px" class="column items-center">
                <q-input v-model.number="conteo.monedas[moneda.key]" type="number" outlined dense bg-color="white" style="width: 80px" input-class="text-center text-weight-bold" @focus="$event.target.select()" :error="inventario && (conteo.monedas[moneda.key] || 0) > (inventario.monedas[moneda.invKey] || 0)" hide-bottom-space />
                <span class="text-caption text-grey-6 text-weight-bold">Disp: {{ inventario ? (inventario.monedas[moneda.invKey] || 0) : '...' }}</span>
              </div>
              <span class="text-weight-bolder text-orange-9" style="width: 80px; text-align: right">{{ formatMoney((conteo.monedas[moneda.key] || 0) * moneda.valor) }}</span>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" color="orange-3" />

        <div class="row justify-between items-center bg-white q-pa-sm border-orange rounded-borders" :class="{'bg-red-1': diferencia !== 0, 'bg-green-1 border-green': diferencia === 0}">
          <div class="text-subtitle1 text-weight-bold text-grey-8">TOTAL CONTADO:</div>
          <div class="text-h6 text-weight-bolder text-orange-9">{{ formatMoney(totalDinero) }}</div>
        </div>
        <div v-if="diferencia !== 0" class="text-center text-caption text-negative q-mt-xs text-weight-bold">
          Faltan/Sobran: {{ formatMoney(diferencia) }} para coincidir con el monto requerido.
        </div>
        <div v-if="tieneExceso" class="text-center text-caption text-negative q-mt-xs text-weight-bold">
          Fondos insuficientes en la caja para cubrir este desglose.
        </div>
      </q-card-section>

      <q-card-actions class="row justify-between border-top q-pa-md bg-white">
        <q-btn flat color="grey-8" label="Cancelar" v-close-popup class="text-weight-bold" />
        <div>
          <q-btn v-if="tieneExceso" outline color="negative" class="text-weight-bold q-mr-md" icon="add_card" label="Ingresar Dinero" @click="abrirEntradaCaja" />
          <q-btn
            label="CONFIRMAR ENTREGA"
            color="orange-9"
            class="text-weight-bold q-px-md"
            unelevated
            icon="check_circle"
            :disable="diferencia !== 0 || tieneExceso"
            @click="confirmarEnvio"
          />
        </div>
      </q-card-actions>
    </q-card>

    <!-- Dialogo para ingresar dinero -->
    <DialogoEntradaCaja v-model="dialogoEntradaAbierto" @entrada-registrada="cargarInventario" />
  </q-dialog>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue'
  import { api } from 'boot/axios'
  import DialogoEntradaCaja from 'src/components/Caja/DialogoEntradaCaja.vue'

  const props = defineProps({
    montoObjetivo: { type: Number, default: 0 }
  })

  const emit = defineEmits(['confirmado'])

  const visible = ref(false)
  const inputPrimerBillete = ref(null)

  // Estructura de denominaciones
  const listaBilletes = [1000, 500, 200, 100, 50, 20]
  const listaMonedas = [
    {valor: 10, etiqueta: '10', key: '10', invKey: '10'},
    {valor: 5, etiqueta: '5', key: '5', invKey: '5'},
    {valor: 2, etiqueta: '2', key: '2', invKey: '2'},
    {valor: 1, etiqueta: '1', key: '1', invKey: '1'},
    {valor: 0.50, etiqueta: '0.50', key: '0.5', invKey: '0.5'},
    {valor: 0.20, etiqueta: '0.20', key: '0.2', invKey: '0.2'},
    {valor: 0.10, etiqueta: '0.10', key: '0.1', invKey: '0.1'},
    {valor: 0.01, etiqueta: '0.01', key: '0.01', invKey: '0.01'}
  ]

  const conteo = reactive({
    billetes: { 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0 },
    monedas: { '10': 0, '5': 0, '2': 0, '1': 0, '0.5': 0, '0.2': 0, '0.1': 0, '0.01': 0 }
  })

  // Cálculos Reactivos
  const totalPiezas = computed(() => {
    const b = Object.values(conteo.billetes).reduce((a, b) => a + (Number(b) || 0), 0)
    const m = Object.values(conteo.monedas).reduce((a, b) => a + (Number(b) || 0), 0)
    return b + m
  })

  const totalDinero = computed(() => {
    let suma = 0
    Object.entries(conteo.billetes).forEach(([val, cant]) => suma += Number(val) * (Number(cant) || 0))
    Object.entries(conteo.monedas).forEach(([val, cant]) => suma += Number(val) * (Number(cant) || 0))
    return parseFloat(suma.toFixed(2))
  })

  const diferencia = computed(() => {
    return parseFloat((props.montoObjetivo - totalDinero.value).toFixed(2))
  })

  const inventario = ref(null)
  const dialogoEntradaAbierto = ref(false)

  const abrirEntradaCaja = () => {
    dialogoEntradaAbierto.value = true
  }

  const cargarInventario = async () => {
    try {
      const res = await api.get('/api/caja/inventario')
      inventario.value = res.data
    } catch (e) {
      console.error('Error cargando inventario de caja', e)
    }
  }

  const tieneExceso = computed(() => {
    if (!inventario.value) return false
    for (const b of listaBilletes) {
      if ((conteo.billetes[b] || 0) > (inventario.value.billetes[b] || 0)) return true
    }
    for (const m of listaMonedas) {
      if ((conteo.monedas[m.key] || 0) > (inventario.value.monedas[m.invKey] || 0)) return true
    }
    return false
  })

  // Acciones
  const onShow = () => {
    // Reiniciar conteo al abrir
    Object.keys(conteo.billetes).forEach(k => conteo.billetes[k] = 0)
    Object.keys(conteo.monedas).forEach(k => conteo.monedas[k] = 0)
    cargarInventario()
    setTimeout(() => {
      if (inputPrimerBillete.value) {
        inputPrimerBillete.value.focus()
      }
    }, 300)
  }

  const confirmarEnvio = () => {
    emit('confirmado', {
      desglose: { ...conteo },
      total_efectivo: totalDinero.value,
      piezas: totalPiezas.value
    })
    visible.value = false
  }

  const formatMoney = (v) => {
    return Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Exponer métodos al padre (TradicionalPage)
  defineExpose({
    show: () => { visible.value = true },
    hide: () => { visible.value = false }
  })
</script>

<style scoped>
  .border-orange { border: 2px solid #fb8c00; }
  .border-green { border: 2px solid #2e7d32; }
  .border-top { border-top: 1px solid #e0e0e0; }
</style>
