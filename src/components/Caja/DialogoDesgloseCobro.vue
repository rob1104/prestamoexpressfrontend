<template>
  <q-dialog v-model="internalValue" persistent @show="onShow">
    <q-card style="width: 750px; max-width: 95vw; border-radius: 12px;">

      <q-card-section class="text-center q-pb-none">
        <div class="text-h3 text-orange-9 text-weight-bolder" style="text-decoration: underline;">
          CAJA NUMERO: 1
        </div>
        <div class="text-h5 text-purple-7 text-weight-bold q-mt-sm uppercase">
          COBRO {{ tipoOperacion }} <br> [ ENTRADA ]
        </div>
        <div class="text-h2 text-weight-bolder text-grey-8 q-my-md">
          $ {{ formatMoney(montoRecibido) }}
        </div>
        <div class="text-subtitle2 text-grey-6 q-mb-sm">
          Capture las denominaciones exactas del efectivo recibido
        </div>
      </q-card-section>

      <q-card-section class="bg-orange-1 q-mx-md q-mb-md rounded-borders border-orange">
        <div class="text-subtitle1 text-orange-9 text-weight-bold text-center q-mb-md">
          Captura de Denominación de BILLETES y MONEDAS
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-6 q-gutter-y-xs">
            <div v-for="b in listaBilletes" :key="'b'+b" class="row items-center no-wrap">
              <div class="col-4 text-weight-bold text-grey-8 text-right q-pr-sm" style="font-size: 16px;">
                $ {{ b }}
              </div>
              <div class="col-4">
                <q-input
                  v-model.number="conteo.billetes[b]"
                  type="number"
                  dense outlined bg-color="white"
                  oninput="if(this.value < 0) this.value = 0;"
                  input-class="text-center text-weight-bold"
                  @focus="$event.target.select()"
                />
              </div>
              <div class="col-4 text-right text-weight-bold text-grey-9" style="font-size: 15px;">
                $ {{ formatMoney(Number(b) * (conteo.billetes[b] || 0)) }}
              </div>
            </div>
          </div>

          <div class="col-12 col-md-6 q-gutter-y-xs">
            <div v-for="m in listaMonedas" :key="'m'+m" class="row items-center no-wrap">
              <div class="col-4 text-weight-bold text-grey-8 text-right q-pr-sm" style="font-size: 16px;">
                $ {{ m }}
              </div>
              <div class="col-4">
                <q-input
                  v-model.number="conteo.monedas[m]"
                  type="number"
                  dense outlined bg-color="white"
                  oninput="if(this.value < 0) this.value = 0;"
                  input-class="text-center text-weight-bold"
                  @focus="$event.target.select()"
                />
              </div>
              <div class="col-4 text-right text-weight-bold text-grey-9" style="font-size: 15px;">
                $ {{ formatMoney(Number(m) * (conteo.monedas[m] || 0)) }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="text-center q-pt-none q-pb-lg">
        <div class="row justify-center q-gutter-x-xl q-mb-md">
          <div class="text-center">
            <div class="text-overline text-grey-6">TOTAL CONTADO</div>
            <div class="text-h4 text-weight-bolder" :class="diferencia === 0 ? 'text-green-8' : 'text-red-8'">
              $ {{ formatMoney(totalDinero) }}
            </div>
          </div>
          <div class="text-center">
            <div class="text-overline text-grey-6">DIFERENCIA</div>
            <div class="text-h4 text-weight-bolder" :class="diferencia === 0 ? 'text-green-8' : 'text-red-8'">
              $ {{ formatMoney(diferencia) }}
            </div>
          </div>
        </div>

        <div v-if="diferencia !== 0" class="text-caption text-red-6 text-weight-bold q-mb-md">
          La diferencia debe ser $0.00 para poder continuar.
        </div>

        <q-btn
          label="CANCELAR"
          color="grey-6" flat
          class="q-mr-sm text-weight-bold"
          @click="cerrar"
        />
        <q-btn
          label="ACEPTAR (ENTER)"
          color="orange-9" unelevated
          class="q-px-xl text-weight-bold"
          :disable="diferencia !== 0"
          @click="confirmarEnvio"
        />
      </q-card-section>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  montoRecibido: { type: Number, required: true },
  totalPagar: { type: Number, required: true },
  tipoOperacion: { type: String, default: 'OPERACIÓN' }
})

const emit = defineEmits(['update:modelValue', 'confirmar'])

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Variables exactas a tu referencia
const listaBilletes = ['1000', '500', '200', '100', '50', '20']
const listaMonedas = ['10', '5', '2', '1', '0.50']

const conteo = reactive({
  billetes: { '1000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0 },
  monedas: { '10': 0, '5': 0, '2': 0, '1': 0, '0.50': 0 }
})

const formatMoney = (v) => {
  return Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const totalDinero = computed(() => {
  let suma = 0
  Object.entries(conteo.billetes).forEach(([val, cant]) => suma += Number(val) * (Number(cant) || 0))
  Object.entries(conteo.monedas).forEach(([val, cant]) => suma += Number(val) * (Number(cant) || 0))
  return parseFloat(suma.toFixed(2))
})

const diferencia = computed(() => {
  return parseFloat((props.montoRecibido - totalDinero.value).toFixed(2))
})

const onShow = () => {
  // Reiniciar conteo al abrir
  Object.keys(conteo.billetes).forEach(k => conteo.billetes[k] = null)
  Object.keys(conteo.monedas).forEach(k => conteo.monedas[k] = null)

  setTimeout(() => {
      const firstInput = document.querySelector('.q-dialog input')
      if(firstInput) firstInput.focus()
  }, 100)
}

const cerrar = () => {
  internalValue.value = false
}

const confirmarEnvio = () => {
  if (diferencia.value !== 0) return

  let desgloseLimpio = []

  // Mapeamos los billetes al formato que Laravel espera
  Object.entries(conteo.billetes).forEach(([val, cant]) => {
    if(cant > 0) {
      desgloseLimpio.push({
        label: `Billete $${val}`,
        valor: Number(val),
        cantidad: Number(cant),
        subtotal: Number(val) * Number(cant)
      })
    }
  })

  // Mapeamos las monedas al formato que Laravel espera
  Object.entries(conteo.monedas).forEach(([val, cant]) => {
    if(cant > 0) {
      desgloseLimpio.push({
        label: val == 0.50 ? `Moneda 50 Centavos` : `Moneda $${val}`,
        valor: Number(val),
        cantidad: Number(cant),
        subtotal: Number(val) * Number(cant)
      })
    }
  })

  emit('confirmar', desgloseLimpio)
}

// Atajos de teclado
const handleKeydown = (e) => {
    if(!internalValue.value) return
    if(e.key === 'Escape') cerrar()
    if(e.key === 'Enter' && diferencia.value === 0 && e.target.tagName !== 'BUTTON') {
        confirmarEnvio()
    }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
  .border-orange {
    border: 1px solid #ff9800;
  }
</style>
