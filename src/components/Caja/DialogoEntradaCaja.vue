<template>
  <q-dialog v-model="mostrar" persistent>
    <q-card style="width: 600px; max-width: 95vw;" class="shadow-24 border-orange">
      <q-card-section class="bg-positive text-white row items-center q-pb-sm">
        <div class="text-h6 text-weight-bold uppercase">
          <q-icon name="add_circle" size="sm" class="q-mr-sm" />
          Ingresar Efectivo a Caja (Entrada)
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-stepper
        v-model="step"
        ref="stepper"
        color="positive"
        animated
        flat
        class="bg-orange-1"
      >
        <!-- PASO 1: DETALLES DE LA ENTRADA -->
        <q-step
          :name="1"
          title="Detalles"
          icon="description"
          :done="step > 1"
        >
          <div class="text-center text-subtitle2 text-orange-10 text-weight-bold q-mb-md">
            Ingrese los detalles del efectivo a recibir
          </div>

          <q-select autofocus
            v-model="conceptoSeleccionado"
            :options="opcionesConceptos"
            option-value="id"
            option-label="nombre"
            emit-value
            map-options
            outlined
            dense
            bg-color="white"
            label="Concepto de Entrada"
            class="q-mb-md"
            :rules="[val => !!val || 'El concepto es obligatorio']"
          />

          <q-input
            v-model.number="montoRequerido"
            type="number"
            outlined
            dense
            bg-color="white"
            label="Monto Exacto a Ingresar"
            class="q-mb-md text-weight-bold text-h6"
            prefix="$"
            input-class="text-weight-bold text-positive"
            :rules="[val => val > 0 || 'El monto debe ser mayor a 0']"
            @focus="$event.target.select()"
          />

          <q-input
            v-model="observaciones"
            type="textarea"
            outlined
            dense
            bg-color="white"
            label="Observaciones Adicionales (Opcional)"
            class="q-mb-md"
            rows="3"
          />

          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12 col-md-4">
              <q-input v-model="recibidoPor" label="Recibido Por" outlined dense bg-color="white" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="entregadoPor" label="Entregado Por" outlined dense bg-color="white" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="autorizadoPor" label="Autorizado Por" outlined dense bg-color="white" />
            </div>
          </div>

          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12 col-md-6">
              <q-input v-model="adicional1" label="Adicional 1" outlined dense bg-color="white" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="adicional2" label="Adicional 2" outlined dense bg-color="white" />
            </div>
          </div>

          <q-checkbox v-model="esPagoRelacionado" label="Pago de un Gasto General" color="positive" class="q-mb-md text-weight-bold" />
        </q-step>

        <!-- PASO 2: DESGLOSE DE DINERO -->
        <q-step
          :name="2"
          title="Dinero Físico"
          icon="payments"
        >
          <div class="text-center text-subtitle2 text-orange-10 text-weight-bold q-mb-md">
            Capture los billetes y monedas que ingresarán al cajón
          </div>

          <div class="row justify-between items-center bg-white q-pa-sm border-orange rounded-borders q-mb-md shadow-1">
            <div class="text-subtitle1 text-weight-bold text-grey-8">MONTO A RECIBIR:</div>
            <div class="text-h6 text-weight-bolder text-positive">{{ formatMoney(montoRequerido) }}</div>
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

          <div class="row justify-between items-center bg-white q-pa-sm border-orange rounded-borders" :class="{'bg-red-1': diferencia !== 0, 'bg-green-1 border-green': diferencia === 0}">
            <div class="text-subtitle1 text-weight-bold text-grey-8">TOTAL RECIBIDO:</div>
            <div class="text-h6 text-weight-bolder text-positive">{{ formatMoney(totalIngresado) }}</div>
          </div>
          <div v-if="diferencia !== 0" class="text-center text-caption text-negative q-mt-xs text-weight-bold">
            Faltan/Sobran: {{ formatMoney(diferencia) }} para coincidir con el monto requerido.
          </div>
        </q-step>

        <template v-slot:navigation>
          <q-stepper-navigation class="row justify-between border-top q-pt-md">
            <q-btn v-if="step > 1" flat color="grey-8" @click="$refs.stepper.previous()" label="Atrás" class="text-weight-bold" />
            <q-btn v-else flat color="grey-8" label="Cancelar" v-close-popup class="text-weight-bold" />
            
            <q-btn
              v-if="step === 1"
              @click="$refs.stepper.next()"
              color="positive"
              label="Siguiente"
              icon-right="arrow_forward"
              class="text-weight-bold shadow-2 q-px-md"
              :disable="!conceptoSeleccionado || montoRequerido <= 0"
            />
            <q-btn
              v-if="step === 2"
              @click="registrarEntrada"
              color="positive"
              label="Registrar Entrada"
              icon="save"
              class="text-weight-bold shadow-2 q-px-xl"
              :disable="diferencia !== 0 || montoRequerido <= 0"
            />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import axios from 'axios'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()

const $q = useQuasar()
const props = defineProps({ modelValue: { type: Boolean, required: true } })
const emit = defineEmits(['update:modelValue', 'entrada-registrada'])

const step = ref(1)
const opcionesConceptos = ref([])
const conceptoSeleccionado = ref(null)
const observaciones = ref('')
const montoRequerido = ref(null)

const recibidoPor = ref('')
const entregadoPor = ref('')
const autorizadoPor = ref('')
const adicional1 = ref('')
const adicional2 = ref('')
const esPagoRelacionado = ref(false)

onMounted(() => {
  cargarConceptos()
})

const cargarConceptos = async () => {
  try {
    const res = await api.get('/api/caja/conceptos')
    opcionesConceptos.value = res.data.entradas
  } catch (e) {
    console.error('Error cargando conceptos', e)
  }
}

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

const diferencia = computed(() => {
  return Number((montoRequerido.value - totalIngresado.value).toFixed(2))
})

watch(mostrar, (val) => {
  if (val) {
    step.value = 1
    Object.keys(conteo.billetes).forEach(k => conteo.billetes[k] = null)
    Object.keys(conteo.monedas).forEach(k => conteo.monedas[k] = null)
    conceptoSeleccionado.value = null
    observaciones.value = ''
    montoRequerido.value = null
    recibidoPor.value = ''
    entregadoPor.value = ''
    autorizadoPor.value = ''
    adicional1.value = ''
    adicional2.value = ''
    esPagoRelacionado.value = false
  }
})

const registrarEntrada = async () => {
  if (!conceptoSeleccionado.value || diferencia.value !== 0) {
    return
  }

  $q.loading.show({ message: 'Registrando entrada...' })
  try {
    const response = await api.post('/api/caja/entrada-manual', {
      monto: montoRequerido.value,
      denominaciones: JSON.stringify({ ...conteo.billetes, ...conteo.monedas }),
      concepto_id: conceptoSeleccionado.value,
      observaciones: observaciones.value.trim(),
      recibido_por: recibidoPor.value.trim(),
      entregado_por: entregadoPor.value.trim(),
      autorizado_por: autorizadoPor.value.trim(),
      adicional_1: adicional1.value.trim(),
      adicional_2: adicional2.value.trim(),
      es_pago_relacionado: esPagoRelacionado.value
    })
    $q.notify({ type: 'positive', message: 'Entrada registrada', icon: 'check_circle' })
    emit('entrada-registrada', montoRequerido.value)

    // Imprimir ticket
    if (response.data && response.data.data && response.data.data.id) {
      imprimirTicket(response.data.data.id)
    }

    mostrar.value = false
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al registrar' })
  } finally {
    $q.loading.hide()
  }
}

const imprimirTicket = async (id) => {
  try {
    const concepto = opcionesConceptos.value.find(c => c.id === conceptoSeleccionado.value)
    const payload = {
      empresa: { nombre: 'PRESTAMO EXPRESS', sucursal: 'MATRIZ' },
      folio: id,
      tipo_movimiento: 'ENTRADA DE CAJA',
      concepto: concepto ? concepto.nombre : '---',
      monto: montoRequerido.value,
      observaciones: observaciones.value.trim(),
      fecha: new Date().toISOString(),
      cajero: authStore.user ? authStore.user.name : 'CAJERO',
      recibido_por: recibidoPor.value.trim(),
      entregado_por: entregadoPor.value.trim(),
      autorizado_por: autorizadoPor.value.trim()
    }
    await axios.post('http://localhost:5000/print-flujo', payload)
    $q.notify({ type: 'positive', message: 'Ticket enviado a impresora térmica', icon: 'print' })
  } catch (e) {
    console.error('Error al generar ticket', e)
    $q.notify({ type: 'warning', message: 'No se pudo conectar con la impresora local (XisPOS Bridge)' })
  }
}
</script>

<style scoped>
.border-orange {
  border: 1px solid #ffcc80;
}
.border-green {
  border: 1px solid #c8e6c9 !important;
}
.border-top {
  border-top: 1px solid #eeeeee;
}
</style>
