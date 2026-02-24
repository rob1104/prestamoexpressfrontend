<template>
  <div class="q-gutter-y-lg">
    <q-card flat bordered class="valuacion-card shadow-2">
      <q-card-section class="bg-slate-800 text-white q-py-sm">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="straighten" class="q-mr-sm" />
            <div class="text-subtitle2 text-weight-bold uppercase tracking-widest">Valuación de Metales</div>
          </div>
          <q-badge color="amber-8" text-color="black" class="text-weight-bolder q-px-md">
            SUBTOTAL ORO: $ {{ formatMoney(totalGramos) }}
          </q-badge>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-markup-table flat dense class="valuacion-table-premium">
          <thead>
            <tr>
              <th class="text-left" style="width: 10%">KILATAJE</th>
              <th class="text-center" style="width: 12%">GRAMOS</th>
              <th class="text-center" style="width: 12%">COSTO x GR</th>
              <th class="text-left">DESCRIPCIÓN DETALLADA DE LA PRENDA</th>
              <th class="text-right" style="width: 15%">PRÉSTAMO</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="k in kilatajes" :key="k.subtipo" class="valuacion-row">
              <td class="text-weight-bold text-primary">{{ k.label }}</td>
              <td>
                <q-input
                  v-if="valores[k.subtipo]"
                  v-model.number="valores[k.subtipo].cantidad"
                  type="number" dense borderless
                  input-class="text-center font-bold text-slate-800"
                  class="input-compact"
                  @update:model-value="emitirCambios"
                />
              </td>
              <td class="bg-slate-50">
                <q-input
                  v-if="valores[k.subtipo]"
                  v-model.number="valores[k.subtipo].precio_unitario"
                  type="number" dense borderless
                  prefix="$"
                  input-class="text-center text-primary text-weight-bold"
                  class="input-compact"
                  @update:model-value="emitirCambios"
                />
              </td>
              <td>
                <q-input
                  v-if="valores[k.subtipo]"
                  v-model="valores[k.subtipo].descripcion"
                  dense outlined
                  placeholder="..."
                  class="full-width italic-placeholder"
                  @update:model-value="emitirCambios"
                />
              </td>
              <td class="text-right text-weight-bolder text-slate-900 prestamo-cell">
                $ {{ formatMoney(calcularRenglon(k.subtipo)) }}
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="valuacion-card shadow-1">
      <q-card-section class="bg-slate-100 text-slate-800 q-py-xs border-bottom">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="toll" class="q-mr-sm text-primary" />
            <div class="text-caption text-weight-bolder uppercase">MONEDAS DE ORO</div>
          </div>
          <div class="text-weight-bold text-primary">Subtotal: $ {{ formatMoney(totalMonedas) }}</div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div v-for="m in monedas" :key="m.subtipo" class="col-12 col-sm-6 col-md-2">
            <div class="moneda-box" :class="{ 'has-value': valores[m.subtipo]?.cantidad > 0 }">
              <div class="text-overline text-center text-slate-500">{{ m.label }}</div>
              <q-input
                v-if="valores[m.subtipo]"
                v-model.number="valores[m.subtipo].cantidad"
                dense outlined label="Piezas"
                input-class="text-center text-weight-bold"
                @update:model-value="emitirCambios"
              />
              <div class="row justify-between q-mt-xs text-caption">
                <span class="opacity-70">Costo:</span>
                <q-input
                  v-model.number="valores[m.subtipo].precio_unitario"
                  dense borderless
                  input-class="text-right text-primary text-weight-bold no-padding"
                  style="width: 70px"
                  @update:model-value="emitirCambios"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
  import { reactive, computed, watch, onBeforeMount } from 'vue'

  const props = defineProps({
    precios: { type: Object, required: true }
  })

  const emit = defineEmits(['update'])

  const kilatajes = [
    { subtipo: '8K', label: '8 K' }, { subtipo: '10K', label: '10 K' },
    { subtipo: '14K', label: '14 K' }, { subtipo: '18K', label: '18 K' },
    { subtipo: '21K', label: '21 K' }, { subtipo: 'ORO_FINO', label: 'ORO FINO' },
    { subtipo: 'MEDALLA', label: 'MEDALLA' }
  ]

  const monedas = [
    { subtipo: 'M2', label: '2 Pesos' }, { subtipo: 'M25', label: '2.5 Pesos' },
    { subtipo: 'M5', label: '5 Pesos' }, { subtipo: 'M10', label: '10 Pesos' },
    { subtipo: 'M20', label: '20 Pesos' }, { subtipo: 'M50', label: '50 Pesos' }
  ]

  const valores = reactive({})

  onBeforeMount(() => {
    [...kilatajes, ...monedas].forEach(item => {
      valores[item.subtipo] = {
        cantidad: 0,
        precio_unitario: props.precios[item.subtipo] || 0, // Inicializa con catálogo
        descripcion: '',
        tipo: kilatajes.some(k => k.subtipo === item.subtipo) ? 'kilate' : 'moneda'
      }
    })
  })

  // Sincronizar precios si el catálogo padre cambia (ej. al cambiar tipo de cliente)
  watch(() => props.precios, (newPrecios) => {
    Object.keys(newPrecios).forEach(key => {
      if (valores[key] && valores[key].cantidad === 0) {
        valores[key].precio_unitario = newPrecios[key]
      }
    })
  }, { deep: true })

  const calcularRenglon = (subtipo) => {
    if (!valores[subtipo]) return 0
    return parseFloat(((valores[subtipo].cantidad || 0) * (valores[subtipo].precio_unitario || 0)).toFixed(2))
  }

  const totalGramos = computed(() => kilatajes.reduce((acc, k) => acc + calcularRenglon(k.subtipo), 0))
  const totalMonedas = computed(() => monedas.reduce((acc, m) => acc + calcularRenglon(m.subtipo), 0))

  const emitirCambios = () => {
    const partidas = []
    Object.keys(valores).forEach(subtipo => {
      if (valores[subtipo].cantidad > 0) {
        partidas.push({
          tipo: valores[subtipo].tipo,
          subtipo: subtipo,
          gramos_cantidad: valores[subtipo].cantidad,
          costo_unitario: valores[subtipo].precio_unitario, // Ahora usa el valor editado
          valor: calcularRenglon(subtipo),
          descripcion: valores[subtipo].descripcion || ''
        })
      }
    })
    emit('update', { partidas, totalPrestamo: totalGramos.value + totalMonedas.value })
  }

  const formatMoney = (val) => Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<style lang="scss" scoped>
  .valuacion-card {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }

  .valuacion-table-premium {
    thead th {
      background: #f8fafc;
      color: #64748b;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #e2e8f0;
    }
    .valuacion-row {
      transition: background 0.2s;
      &:hover { background: #f1f5f9; }
      td { padding: 8px 12px !important; border-bottom: 1px solid #f1f5f9; }
    }
  }

  .input-compact {
    max-width: 100px;
    margin: 0 auto;
    border-radius: 6px;
    background: rgb(255, 254, 220);
    padding: 0 8px;
    border: 1px solid transparent;
    &:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }
  }

  .prestamo-cell {
    font-family: 'JetBrains Mono', monospace;
    background: #fdfdfd;
  }

  .moneda-box {
    padding: 12px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: white;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    &.has-value {
      border-color: #3b82f6;
      background: #eff6ff;
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  }

  .italic-placeholder :deep(input::placeholder) { font-style: italic; opacity: 0.5; font-size: 0.85rem; }
  .tracking-widest { letter-spacing: 0.1em; }
  .border-bottom { border-bottom: 1px solid #e2e8f0; }
  .no-padding :deep(input) { padding: 0 !important; }
</style>
