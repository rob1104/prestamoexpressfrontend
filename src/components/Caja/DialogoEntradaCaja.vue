<template>
  <q-dialog v-model="mostrar" persistent>
    <q-card style="width: 550px; max-width: 95vw;" class="shadow-24 border-orange">

      <q-card-section class="bg-positive text-white row items-center q-pb-sm">
        <div class="text-h6 text-weight-bold uppercase">
          <q-icon name="add_circle" size="sm" class="q-mr-sm" />
          Ingresar Efectivo a Caja (Entrada)
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md bg-orange-1">
        <div class="text-center text-subtitle2 text-orange-10 text-weight-bold q-mb-md">
          Capture los billetes y monedas que ingresarán al cajón
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-6 column q-gutter-y-sm">
            <div v-for="billete in listaBilletes" :key="billete" class="row items-center justify-between">
              <span class="text-weight-bold text-grey-8" style="width: 50px">$ {{ billete }}</span>
              <q-input v-model.number="conteo.billetes[billete]" type="number" outlined dense bg-color="white" style="width: 80px" input-class="text-center text-weight-bold" @focus="$event.target.select()" />
              <span class="text-weight-bolder text-positive" style="width: 80px; text-align: right">{{ formatMoney((conteo.billetes[billete] || 0) * billete) }}</span>
            </div>
          </div>

          <div class="col-6 column q-gutter-y-sm">
            <div v-for="moneda in listaMonedas" :key="moneda.valor" class="row items-center justify-between">
              <span class="text-weight-bold text-grey-8" style="width: 50px">$ {{ moneda.etiqueta }}</span>
              <q-input v-model.number="conteo.monedas[moneda.key]" type="number" outlined dense bg-color="white" style="width: 80px" input-class="text-center text-weight-bold" @focus="$event.target.select()" />
              <span class="text-weight-bolder text-positive" style="width: 80px; text-align: right">{{ formatMoney((conteo.monedas[moneda.key] || 0) * moneda.valor) }}</span>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" color="orange-3" />

        <div class="row justify-between items-center bg-white q-pa-sm border-orange rounded-borders">
          <div class="text-h6 text-weight-bold text-grey-8">TOTAL INGRESADO:</div>
          <div class="text-h5 text-weight-bolder text-positive">{{ formatMoney(totalIngresado) }}</div>
        </div>
      </q-card-section>

      <q-card-actions align="between" class="bg-grey-2 q-pa-md border-top">
        <q-btn flat label="Cancelar" color="grey-8" class="text-weight-bold" v-close-popup />
        <q-btn unelevated label="Registrar Entrada" color="positive" icon="save" class="q-px-xl text-weight-bold shadow-2" @click="registrarEntrada" :disable="totalIngresado <= 0" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()
const props = defineProps({ modelValue: { type: Boolean, required: true } })
const emit = defineEmits(['update:modelValue', 'entrada-registrada'])

const mostrar = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const listaBilletes = ['1000', '500', '200', '100', '50', '20']

// --- AQUÍ AGREGAMOS LA MONEDA 0.01 ---
const listaMonedas = [
  {valor: 10, etiqueta: '10', key: 'm10'},
  {valor: 5, etiqueta: '5', key: 'm5'},
  {valor: 2, etiqueta: '2', key: 'm2'},
  {valor: 1, etiqueta: '1', key: 'm1'},
  {valor: 0.50, etiqueta: '0.50', key: 'm050'},
  {valor: 0.01, etiqueta: '0.01', key: 'm001'}
]

const conteo = reactive({
  billetes: { '1000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0 },
  monedas: { 'm10': 0, 'm5': 0, 'm2': 0, 'm1': 0, 'm050': 0, 'm001': 0 }
})

const formatMoney = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(val || 0))

const totalIngresado = computed(() => {
  let total = 0
  Object.entries(conteo.billetes).forEach(([val, cant]) => total += (Number(cant) || 0) * Number(val))
  listaMonedas.forEach(m => total += (Number(conteo.monedas[m.key]) || 0) * m.valor)
  return total
})

watch(mostrar, (val) => {
  if (val) {
    Object.keys(conteo.billetes).forEach(k => conteo.billetes[k] = null)
    Object.keys(conteo.monedas).forEach(k => conteo.monedas[k] = null)
  }
})

const registrarEntrada = async () => {
  $q.loading.show({ message: 'Registrando entrada...' })
  try {
    await api.post('/api/caja/entrada-manual', {
      monto: totalIngresado.value,
      denominaciones: JSON.stringify({ ...conteo.billetes, ...conteo.monedas }),
      observaciones: 'Entrada manual de efectivo'
    })
    $q.notify({ type: 'positive', message: 'Entrada registrada', icon: 'check_circle' })
    emit('entrada-registrada', totalIngresado.value)
    mostrar.value = false
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al registrar' })
  } finally {
    $q.loading.hide()
  }
}
</script>
