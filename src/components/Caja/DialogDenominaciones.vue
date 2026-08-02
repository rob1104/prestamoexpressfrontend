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
            <div v-for="(b, index) in listaBilletes" :key="'b'+b" class="row items-center no-wrap">
              <div class="col-4 text-weight-bold text-grey-8">Billete ${{ b }}:</div>
              <div style="width: 100px" class="column items-center">
                <q-input :ref="el => { if(index === 0) inputPrimerBillete = el }"
                  v-model.number="conteo.billetes[b]"
                  type="number"
                  dense
                  outlined
                  bg-color="white"
                  input-class="text-center text-weight-bold"
                  @focus="$event.target.select()"
                  :error="inventario && (conteo.billetes[b] || 0) > (inventario.billetes[b] || 0)"
                  hide-bottom-space
                />
                <span class="text-caption text-grey-6 text-weight-bold">Disp: {{ inventario ? (inventario.billetes[b] || 0) : '...' }}</span>
              </div>
              <div class="col-4 text-right text-primary text-weight-bold">
                $ {{ formatMoney(conteo.billetes[b] * b) }}
              </div>
            </div>
          </div>

          <div class="col-12 col-md-6 q-gutter-y-xs">
            <div v-for="m in listaMonedas" :key="'m'+m.valor" class="row items-center no-wrap">
              <div class="col-4 text-weight-bold text-grey-8">Moneda ${{ m.etiqueta }}:</div>
              <div style="width: 100px" class="column items-center">
                <q-input
                  v-model.number="conteo.monedas[m.key]"
                  type="number"
                  dense
                  min="0"
                  outlined
                  bg-color="white"
                  input-class="text-center text-weight-bold"
                  @focus="$event.target.select()"
                  :error="inventario && (conteo.monedas[m.key] || 0) > (inventario.monedas[m.invKey] || 0)"
                  hide-bottom-space
                />
                <span class="text-caption text-grey-6 text-weight-bold">Disp: {{ inventario ? (inventario.monedas[m.invKey] || 0) : '...' }}</span>
              </div>
              <div class="col-4 text-right text-brown text-weight-bold">
                $ {{ formatMoney(conteo.monedas[m.key] * m.valor) }}
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
          :disable="diferencia !== 0 || tieneExceso"
          @click="confirmarEnvio"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue'
  import { api } from 'boot/axios'

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
