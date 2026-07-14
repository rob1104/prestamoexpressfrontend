<template>
  <q-dialog v-model="mostrar" persistent>
    <q-card style="width: 550px; max-width: 95vw;" class="shadow-24 border-primary">

      <!-- ENCABEZADO -->
      <q-card-section class="bg-primary text-white row items-center q-pb-sm">
        <div class="text-h6 text-weight-bold uppercase">
          <q-icon name="wb_sunny" size="sm" class="q-mr-sm" />
          Apertura de Caja (Inicio de Turno)
        </div>
      </q-card-section>

      <!-- CUERPO -->
      <q-card-section class="q-pa-md bg-blue-1">
        <div class="text-center text-subtitle1 text-primary text-weight-bold q-mb-md">
          Por favor, capture el fondo de caja con el que inicia el día.
        </div>

        <div class="row q-col-gutter-md">
          <!-- Billetes -->
          <div class="col-6 column q-gutter-y-sm">
            <div v-for="billete in listaBilletes" :key="billete" class="row items-center justify-between">
              <span class="text-weight-bold text-grey-8" style="width: 50px">$ {{ billete }}</span>
              <q-input v-model.number="conteo.billetes[billete]" type="number" outlined dense bg-color="white" style="width: 80px" input-class="text-center text-weight-bold" @focus="$event.target.select()" />
              <span class="text-weight-bolder text-primary" style="width: 80px; text-align: right">{{ formatMoney((conteo.billetes[billete] || 0) * billete) }}</span>
            </div>
          </div>

          <!-- Monedas -->
          <div class="col-6 column q-gutter-y-sm">
            <div v-for="moneda in listaMonedas" :key="moneda.valor" class="row items-center justify-between">
              <span class="text-weight-bold text-grey-8" style="width: 50px">$ {{ moneda.etiqueta }}</span>
              <q-input v-model.number="conteo.monedas[moneda.key]" type="number" outlined dense bg-color="white" style="width: 80px" input-class="text-center text-weight-bold" @focus="$event.target.select()" />
              <span class="text-weight-bolder text-primary" style="width: 80px; text-align: right">{{ formatMoney((conteo.monedas[moneda.key] || 0) * moneda.valor) }}</span>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" color="blue-3" />

        <div class="row justify-between items-center bg-white q-pa-sm border-primary rounded-borders">
          <div class="text-h6 text-weight-bold text-grey-8">FONDO INICIAL:</div>
          <div class="text-h4 text-weight-bolder text-primary">{{ formatMoney(totalIngresado) }}</div>
        </div>
      </q-card-section>

      <!-- BOTONERA -->
      <q-card-actions align="center" class="bg-grey-2 q-pa-md border-top">
        <q-btn unelevated label="Registrar Apertura y Comenzar Turno" color="primary" icon="play_circle_filled" class="q-px-xl text-weight-bold shadow-2 full-width" @click="registrarApertura" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, reactive, computed, watch } from 'vue'
  import { useQuasar } from 'quasar'
  import { api } from 'boot/axios'

  const $q = useQuasar()
  const props = defineProps({ modelValue: { type: Boolean, required: true } })
  const emit = defineEmits(['update:modelValue', 'apertura-registrada'])

  const mostrar = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const listaBilletes = ['1000', '500', '200', '100', '50', '20']
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

  const registrarApertura = async () => {
    $q.loading.show({ message: 'Registrando apertura de turno...' })
    try {
      await api.post('/api/caja/apertura', {
        monto: totalIngresado.value,
        denominaciones: JSON.stringify({ ...conteo.billetes, ...conteo.monedas })
      })

      $q.notify({ type: 'positive', message: 'Apertura de turno registrada con éxito', icon: 'check_circle' })
      emit('apertura-registrada', totalIngresado.value)
      mostrar.value = false
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al registrar la apertura' })
    } finally {
      $q.loading.hide()
    }
  }
</script>

<style scoped>
  .border-primary { border: 1px solid #1976D2; }
  .border-top { border-top: 1px solid #cbd5e1; }
</style>
