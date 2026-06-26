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
            <div v-for="billete in billetes" :key="billete.valor" class="row items-center justify-between">
              <span class="text-weight-bold text-grey-8" style="width: 50px">$ {{ billete.valor }}</span>
              <q-input v-model.number="denominaciones['b'+billete.valor]" type="number" outlined dense bg-color="white" style="width: 80px" input-class="text-center text-weight-bold" @focus="$event.target.select()" />
              <span class="text-weight-bolder text-positive" style="width: 80px; text-align: right">{{ formatMoney(denominaciones['b'+billete.valor] * billete.valor) }}</span>
            </div>
          </div>

          <div class="col-6 column q-gutter-y-sm">
            <div v-for="moneda in monedas" :key="moneda.valor" class="row items-center justify-between">
              <span class="text-weight-bold text-grey-8" style="width: 50px">$ {{ moneda.etiqueta }}</span>
              <q-input v-model.number="denominaciones['m'+moneda.etiqueta.replace('.','')]" type="number" outlined dense bg-color="white" style="width: 80px" input-class="text-center text-weight-bold" @focus="$event.target.select()" />
              <span class="text-weight-bolder text-positive" style="width: 80px; text-align: right">{{ formatMoney(denominaciones['m'+moneda.etiqueta.replace('.','')] * moneda.valor) }}</span>
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
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()
const props = defineProps({ modelValue: { type: Boolean, required: true } })
const emit = defineEmits(['update:modelValue', 'entrada-registrada'])

const mostrar = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const billetes = [{valor: 1000}, {valor: 500}, {valor: 200}, {valor: 100}, {valor: 50}, {valor: 20}]
const monedas = [
  {valor: 10, etiqueta: '10'}, {valor: 5, etiqueta: '5'},
  {valor: 2, etiqueta: '2'}, {valor: 1, etiqueta: '1'}, {valor: 0.50, etiqueta: '0.50'}
]

const denominaciones = ref({
  b1000: 0, b500: 0, b200: 0, b100: 0, b50: 0, b20: 0,
  m10: 0, m5: 0, m2: 0, m1: 0, m050: 0
})

const formatMoney = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(val || 0))

const totalIngresado = computed(() => {
  let total = 0
  billetes.forEach(b => total += (Number(denominaciones.value['b'+b.valor]) || 0) * b.valor)
  monedas.forEach(m => total += (Number(denominaciones.value['m'+m.etiqueta.replace('.','')]) || 0) * m.valor)
  return total
})

// Limpiar modal al abrir
watch(mostrar, (val) => {
  if (val) {
    Object.keys(denominaciones.value).forEach(k => denominaciones.value[k] = 0)
  }
})

const registrarEntrada = async () => {
  $q.loading.show({ message: 'Registrando entrada en caja...' })
  try {
    const payload = {
      monto: totalIngresado.value,
      denominaciones: JSON.stringify(denominaciones.value),
      observaciones: 'Entrada manual de efectivo (Cambio/Fondo)'
    }

    // Llamada a Laravel
    await api.post('/api/caja/entrada-manual', payload)

    $q.notify({ type: 'positive', message: 'Efectivo ingresado a caja correctamente', icon: 'check_circle' })
    emit('entrada-registrada', totalIngresado.value)
    mostrar.value = false
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al registrar entrada: ' + (error.response?.data?.message || '') })
  } finally {
    $q.loading.hide()
  }
}
</script>

<style scoped>
.border-orange { border: 1px solid #fdba74; }
.border-top { border-top: 1px solid #cbd5e1; }
</style>
