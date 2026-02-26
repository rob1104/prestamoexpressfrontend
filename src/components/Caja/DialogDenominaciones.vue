<template>
  <q-dialog v-model="visible" persistent @show="onShow">
    <q-card style="width: 750px; max-width: 95vw; border-radius: 12px;">
      <q-card-section class="text-center q-pb-none">
        <div class="text-h3 text-orange-9 text-weight-bolder" style="text-decoration: underline;">
          CAJA NUMERO: 1
        </div>
        <div class="text-h5 text-purple-7 text-weight-bold q-mt-sm uppercase">
          PRESTAMOS TRADICIONAL <br> [ SALIDA ]
        </div>
        <div class="text-h2 text-weight-bolder text-grey-8 q-my-md">
          $ {{ formatMoney(montoObjetivo) }}
        </div>
      </q-card-section>

      <q-card-section class="bg-orange-1 q-mx-md q-mb-md rounded-borders border-orange">
        <div class="text-subtitle1 text-orange-9 text-weight-bold text-center q-mb-md">
          Captura de Denominación de BILLETES y MONEDAS
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-6 q-gutter-y-xs">
            <div v-for="b in listaBilletes" :key="'b'+b" class="row items-center no-wrap">
              <div class="col-4 text-weight-bold text-grey-8">Billete ${{ b }}:</div>
              <div class="col-4">
                <q-input
                  v-model.number="conteo.billetes[b]"
                  type="number"
                  dense
                  outlined
                  bg-color="white"
                  input-class="text-center text-weight-bold"
                  @focus="$event.target.select()"
                />
              </div>
              <div class="col-4 text-right text-primary text-weight-bold">
                $ {{ formatMoney(conteo.billetes[b] * b) }}
              </div>
            </div>
          </div>

          <div class="col-12 col-md-6 q-gutter-y-xs">
            <div v-for="m in listaMonedas" :key="'m'+m" class="row items-center no-wrap">
              <div class="col-4 text-weight-bold text-grey-8">Moneda ${{ m }}:</div>
              <div class="col-4">
                <q-input
                  v-model.number="conteo.monedas[m]"
                  type="number"
                  dense
                  min="0"
                  outlined
                  bg-color="white"
                  input-class="text-center text-weight-bold"
                  @focus="$event.target.select()"
                  @update:model-value="val => denominacion.cantidad = Math.max(0, val)"
                />
              </div>
              <div class="col-4 text-right text-brown text-weight-bold">
                $ {{ formatMoney(conteo.monedas[m] * m) }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <div class="total-box">
              <div class="text-h3 text-weight-bolder text-center">{{ totalPiezas }}</div>
              <div class="text-caption text-center uppercase text-weight-bold">Piezas Totales</div>
            </div>
          </div>
          <div class="col-6">
            <div
              class="total-box"
              :class="diferencia === 0 ? 'bg-green-1 border-green' : 'bg-red-1 border-red'"
            >
              <div class="text-h3 text-weight-bolder text-center">$ {{ formatMoney(totalDinero) }}</div>
              <div class="text-caption text-center uppercase text-weight-bold">
                {{ diferencia === 0 ? 'Efectivo Cuadrado' : `Faltan: $${formatMoney(diferencia)}` }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-lg">
        <q-btn
          label="ACEPTAR"
          color="grey-4"
          text-color="black"
          class="q-px-xl text-weight-bold"
          size="lg"
          unelevated
          :disable="diferencia !== 0"
          @click="confirmarEnvio"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue'

  const props = defineProps({
    montoObjetivo: { type: Number, default: 0 }
  })

  const emit = defineEmits(['confirmado'])

  const visible = ref(false)

  // Estructura de denominaciones
  const listaBilletes = [1000, 500, 200, 100, 50, 20]
  const listaMonedas = [10, 5, 2, 1, 0.50, 0.20, 0.10, 0.01]

  const conteo = reactive({
    billetes: { 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0 },
    monedas: { 10: 0, 5: 0, 2: 0, 1: 0, 0.50: 0, 0.20: 0, 0.10: 0, 0.01: 0 }
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

  // Acciones
  const onShow = () => {
    // Reiniciar conteo al abrir
    Object.keys(conteo.billetes).forEach(k => conteo.billetes[k] = 0)
    Object.keys(conteo.monedas).forEach(k => conteo.monedas[k] = 0)
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
  .border-red { border: 2px solid #c62828; }
  .total-box {
    border: 2px solid #bdbdbd;
    padding: 12px;
    border-radius: 8px;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
