<template>
  <q-dialog v-model="mostrar" persistent>
    <q-card style="width: 450px; max-width: 95vw;" class="shadow-24 bg-grey-2">
      <q-card-section class="bg-primary text-white row items-center q-pb-sm">
        <div class="text-h6 text-weight-bold">
          <q-icon name="point_of_sale" size="sm" class="q-mr-sm" />
          Aceptar Pago de Venta de Joyería
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md column q-gutter-y-md">

        <div class="text-center text-h5 text-weight-bolder text-orange-9 uppercase tracking-tighter">
          VENTA {{ tituloModo }}
        </div>

        <div v-if="tipoVenta === 'SEPARADO'" class="bg-orange-1 q-pa-sm rounded-borders border-orange">
          <div class="row justify-between items-center q-mb-sm">
            <div class="text-caption text-weight-bold text-orange-10">Mínimo a Pagar (20%):</div>
            <div class="text-subtitle1 text-weight-bolder text-orange-10">$ {{ formatMoney(minimoSeparado) }}</div>
          </div>
          <div class="row items-center justify-between no-wrap">
            <div class="text-subtitle1 text-weight-bold text-blue-grey-9">Importe Separado:</div>
            <q-input
              v-model.number="form.importe_separado"
              type="number" outlined dense bg-color="white" prefix="$"
              input-class="text-right text-weight-bolder text-h6 text-primary"
              style="width: 150px"
              @focus="$event.target.select()"
            />
          </div>
        </div>

        <div class="column q-gutter-y-xs">

          <div class="row items-center justify-between no-wrap q-py-xs">
            <div class="text-h6 text-weight-bold text-grey-9">Total a Pagar:</div>
            <div class="text-h5 text-weight-bolder text-orange-9">$ {{ formatMoney(totalPagar) }}</div>
          </div>

          <div class="row items-center justify-between no-wrap q-py-xs">
            <div class="text-h6 text-weight-bold text-grey-9">Importe Efectivo:</div>
            <q-input
              v-model.number="form.efectivo"
              type="number" outlined dense bg-color="white" prefix="$"
              input-class="text-right text-weight-bolder text-h6 text-blue-9"
              style="width: 160px"
              :readonly="modo === 'VOUCHER' || modo === 'DEBITO'"
              @focus="$event.target.select()"
              autofocus
            />
          </div>

          <div class="row items-center justify-between no-wrap q-py-xs">
            <div class="text-h6 text-weight-bold text-grey-9">Importe Voucher:</div>
            <q-input
              v-model.number="form.credito"
              type="number" outlined dense bg-color="white" prefix="$"
              input-class="text-right text-weight-bolder text-h6"
              style="width: 160px"
              :readonly="modo === 'CONTADO' || modo === 'DEBITO'"
              @focus="$event.target.select()"
            />
          </div>

          <div class="row items-center justify-between no-wrap q-py-xs">
            <div class="text-h6 text-weight-bold text-grey-9">Importe Débito:</div>
            <q-input
              v-model.number="form.debito"
              type="number" outlined dense bg-color="white" prefix="$"
              input-class="text-right text-weight-bolder text-h6"
              style="width: 160px"
              :readonly="modo === 'CONTADO' || modo === 'VOUCHER'"
              @focus="$event.target.select()"
            />
          </div>

          <q-separator class="q-my-sm" />

          <div class="row items-center justify-between no-wrap q-py-xs">
            <div class="text-h6 text-weight-bold text-grey-9">Total Pagado:</div>
            <div class="text-h5 text-weight-bolder text-orange-9">$ {{ formatMoney(totalRecibido) }}</div>
          </div>

          <div class="row items-center justify-between no-wrap q-py-xs">
            <div class="text-h6 text-weight-bold text-grey-9">Cambio:</div>
            <div class="text-h5 text-weight-bolder text-orange-9">$ {{ formatMoney(cambio) }}</div>
          </div>

        </div>

      </q-card-section>

      <q-card-actions align="between" class="bg-blue-grey-1 q-pa-md border-top">
        <q-btn flat label="Cancelar" color="grey-8" class="text-weight-bold" v-close-popup />
        <q-btn unelevated label="Aceptar" color="positive" class="q-px-xl text-weight-bold shadow-2" @click="confirmarCobro" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  totalPagar: { type: Number, required: true },
  tipoVenta: { type: String, required: true }, // TOTAL, SEPARADO
  modo: { type: String, required: true }       // CONTADO, VOUCHER, DEBITO, MIXTO
})

const emit = defineEmits(['update:modelValue', 'procesar-pago'])

const mostrar = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const form = ref({
  efectivo: 0,
  credito: 0,
  debito: 0,
  importe_separado: 0
})

// --- TÍTULO DINÁMICO ---
const tituloModo = computed(() => {
  if (props.modo === 'CONTADO') return 'DE CONTADO'
  if (props.modo === 'VOUCHER') return 'CON VOUCHER'
  if (props.modo === 'DEBITO') return 'DE DÉBITO'
  return 'MIXTA'
})

// --- CÁLCULOS MATEMÁTICOS REACTIVOS ---
const minimoSeparado = computed(() => props.totalPagar * 0.20)
const totalRecibido = computed(() => (Number(form.value.efectivo) || 0) + (Number(form.value.credito) || 0) + (Number(form.value.debito) || 0))
const montoRequerido = computed(() => props.tipoVenta === 'SEPARADO' ? Number(form.value.importe_separado) : props.totalPagar)
const cambio = computed(() => Math.max(0, totalRecibido.value - montoRequerido.value))

const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Inicializar datos al abrir el modal (Auto-llenado inteligente)
watch(mostrar, (nuevoValor) => {
  if (nuevoValor) {
    const pagoInicial = props.tipoVenta === 'SEPARADO' ? minimoSeparado.value : props.totalPagar

    form.value = {
      efectivo: props.modo === 'CONTADO' ? pagoInicial : 0,
      credito: props.modo === 'VOUCHER' ? pagoInicial : 0,
      debito: props.modo === 'DEBITO' ? pagoInicial : 0,
      importe_separado: props.tipoVenta === 'SEPARADO' ? pagoInicial : 0
    }
  }
})

// --- VALIDACIONES EXTRAIDAS DE VB6 ---
const confirmarCobro = () => {
  if (totalRecibido.value <= 0) {
    $q.notify({ type: 'negative', message: 'NO se aceptan Pagos en CERO' })
    return
  }

  // Si es separado, valida contra el mínimo y contra el monto que indicó que va a separar
  if (props.tipoVenta === 'SEPARADO') {
    if (form.value.importe_separado < minimoSeparado.value) {
      $q.notify({ type: 'negative', message: `El Importe de Separado es MENOR del 20% del Total a Pagar` })
      return
    }
    if (totalRecibido.value < form.value.importe_separado) {
      $q.notify({ type: 'negative', message: 'El Importe de Separado es MAYOR al Total Recibido' })
      return
    }
  } else {
    // Venta TOTAL
    if (totalRecibido.value < props.totalPagar) {
      $q.notify({ type: 'negative', message: 'El Importe Recibido es MENOR al Total a Pagar' })
      return
    }
  }

  // Validaciones del Modo de Venta vs Entradas
  if (props.modo === 'CONTADO' && (form.value.credito > 0 || form.value.debito > 0)) {
    return $q.notify({ type: 'negative', message: 'El Importe Capturado NO concuerda con el Modo de Venta' })
  }
  if (props.modo === 'VOUCHER' && (form.value.efectivo > 0 || form.value.debito > 0)) {
    return $q.notify({ type: 'negative', message: 'El Importe Capturado NO concuerda con el Modo de Venta' })
  }
  if (props.modo === 'DEBITO' && (form.value.efectivo > 0 || form.value.credito > 0)) {
    return $q.notify({ type: 'negative', message: 'El Importe Capturado NO concuerda con el Modo de Venta' })
  }
  if (props.modo === 'MIXTO' && form.value.efectivo === 0 && form.value.credito === 0 && form.value.debito === 0) {
    return $q.notify({ type: 'negative', message: 'El Importe Capturado NO concuerda con el Modo de Venta' })
  }

  // Valida que no se dé "cambio" en pagos totales con tarjeta
  if (props.modo === 'VOUCHER' || props.modo === 'DEBITO') {
    if (totalRecibido.value > montoRequerido.value) {
      $q.notify({ type: 'negative', message: 'En transacciones de Tarjeta el Importe Recibido NO puede ser mayor a la Venta' })
      return
    }
  }

  // Emitimos los datos de regreso a la pantalla principal
  emit('procesar-pago', {
    efectivo: form.value.efectivo,
    credito: form.value.credito,
    debito: form.value.debito,
    recibido: totalRecibido.value,
    cambio: cambio.value,
    importe_separado: props.tipoVenta === 'SEPARADO' ? form.value.importe_separado : 0
  })

  mostrar.value = false
}
</script>

<style scoped>
  .border-orange { border: 1px solid #fdba74; }
  .border-top { border-top: 1px solid #cbd5e1; }
  .tracking-tighter { letter-spacing: -0.5px; }

  /* Hacemos que el input se vea resaltado similar al azul de VB6 cuando está activo */
  :deep(.q-field--focused .q-field__control) {
    background-color: #e0f2fe !important;
  }
</style>
