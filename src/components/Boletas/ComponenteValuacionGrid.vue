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
              <td class="text-weight-bold text-blue-10 text-caption">{{ k.label }}</td>
              <td>
                <q-input
                  v-if="valores[k.subtipo]"
                  v-model.number="valores[k.subtipo].cantidad"
                  type="number" dense borderless
                  min="0"
                  input-class="text-center text-weight-bolder"
                  class="input-premium-compact"
                  @update:model-value="val => {
                        valores[k.subtipo].cantidad = Math.max(0, val);
                        emitirCambios();
                      }"
                />
              </td>
              <td>
                <q-input
                  v-if="valores[k.subtipo]"
                  v-model.number="valores[k.subtipo].precio_unitario"
                  type="number" dense borderless
                  prefix="$"
                  min="0"
                  input-class="text-center text-weight-bold text-primary"
                  class="input-premium-compact"
                  @update:model-value="val => {
                    valores[k.subtipo].precio_unitario = Math.max(0, val);
                    emitirCambios();
                  }"
                />
              </td>
              <td>
                <q-input
                  v-if="valores[k.subtipo]"
                  v-model="valores[k.subtipo].descripcion"
                  dense outlined
                  hide-bottom-space
                  :rules="[ val => (valores[k.subtipo].cantidad > 0 && !val) ? 'Requerido' : true ]"
                  class="input-desc-compact italic-placeholder"
                  @update:model-value="emitirCambios"
                />
              </td>
              <td class="text-right">
                <div class="prestamo-box">
                  $ {{ formatMoney(calcularRenglon(k.subtipo)) }}
                </div>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="valuacion-card q-mt-sm shadow-1">
      <q-card-section class="bg-blue-grey-1 text-blue-grey-10 q-py-xs border-bottom">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="toll" class="q-mr-sm text-primary" size="xs" />
            <div class="text-caption text-weight-bolder uppercase">Valuación de Monedas de Oro</div>
          </div>
          <q-badge color="primary" text-color="white" class="text-weight-bolder q-px-md">
            SUBTOTAL MONEDAS: $ {{ formatMoney(totalMonedas) }}
          </q-badge>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-markup-table flat dense class="valuacion-table-premium">
          <thead>
            <tr>
              <th class="text-left" style="width: 15%">DENOMINACIÓN</th>
              <th class="text-center" style="width: 10%">PIEZAS</th>
              <th class="text-center" style="width: 15%">COSTO x PZA</th>
              <th class="text-left">DESCRIPCIÓN</th>
              <th class="text-right" style="width: 15%">PRÉSTAMO</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in monedas" :key="m.subtipo" class="valuacion-row">
              <td class="text-weight-bold text-blue-10 text-caption">{{ m.label }}</td>
              <td>
                <q-input
                  v-if="valores[m.subtipo]"
                  v-model.number="valores[m.subtipo].cantidad"
                  type="number" dense borderless
                  input-class="text-center text-weight-bolder"
                  class="input-premium-compact"
                  @update:model-value="emitirCambios"
                />
              </td>
              <td>
                <q-input
                  v-if="valores[m.subtipo]"
                  v-model.number="valores[m.subtipo].precio_unitario"
                  type="number" dense borderless
                  prefix="$"
                  input-class="text-center text-weight-bold text-primary"
                  class="input-premium-compact"
                  @update:model-value="emitirCambios"
                />
              </td>
              <td>
                <q-input
                  v-if="valores[m.subtipo]"
                  v-model="valores[m.subtipo].descripcion"
                  dense outlined
                  hide-bottom-space
                  :rules="[ val => (valores[m.subtipo].cantidad > 0 && !val) ? 'Requerido' : true ]"
                  class="input-desc-compact italic-placeholder"
                  @update:model-value="emitirCambios"
                />
              </td>
              <td class="text-right">
                <div class="prestamo-box">
                  $ {{ formatMoney(calcularRenglon(m.subtipo)) }}
                </div>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
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
    let esValido = true
    Object.keys(valores).forEach(subtipo => {
      const cant = valores[subtipo].cantidad || 0
      const desc = valores[subtipo].descripcion || ''

      if (cant > 0) {
        if (desc.trim() === '') esValido = false
        partidas.push({
          tipo: valores[subtipo].tipo,
          subtipo: subtipo,
          gramos_cantidad: cant,
          costo_unitario: valores[subtipo].precio_unitario,
          valor: calcularRenglon(subtipo),
          descripcion: desc
        })
      }
    })
    emit('update', {
      partidas,
      totalPrestamo: totalGramos.value + totalMonedas.value,
      esValido: esValido
    })
  }

  const formatMoney = (val) => Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<style lang="scss" scoped>
  .valuacion-card {
    border-radius: 4px; // Bordes más rectos para look profesional
    border: 1px solid #cbd5e1;
  }

  .valuacion-table-premium {
    thead th {
      background: #f1f5f9;
      color: #334155;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 4px 8px !important; // Espacio mínimo en cabecera
      border: 1px solid #e2e8f0;
    }

    .valuacion-row td {
      padding: 2px 4px !important; // REDUCCIÓN CRÍTICA DE ESPACIO
      border: 1px solid #f1f5f9;
      height: 32px; // Altura fija de fila para consistencia
    }
  }

  // Estilo de Input similar al Resumen
  .input-premium-compact {
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    height: 28px;
    width: 85px;
    margin: 0 auto;
    font-size: 0.85rem;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);

    &:focus-within {
      border-color: #3b82f6;
      background: #f8fafc;
    }

    :deep(.q-field__control), :deep(.q-field__native) {
      min-height: 28px !important;
      height: 28px !important;
      padding: 0 4px !important;
    }
    :deep(.q-field__prefix) { font-size: 0.75rem; color: #94a3b8; }
  }

  // Input de descripción más bajo
  .input-desc-compact {
    :deep(.q-field__control) {
      height: 28px !important;
      min-height: 28px !important;
      background: white;
      font-size: 0.85rem;
    }
    :deep(.q-field__native) { padding: 0 8px !important; }
  }

  // Celda de Préstamo estilizada como recuadro de salida
  .prestamo-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 3px;
    padding: 2px 8px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 800;
    font-size: 0.9rem;
    color: #0f172a;
    display: inline-block;
    min-width: 100px;
  }

  .moneda-box {
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    background: white;
    font-size: 0.8rem;

    &.has-value {
      border-color: #3b82f6;
      background: #eff6ff;
    }
  }

  .italic-placeholder :deep(input::placeholder) { font-style: italic; font-size: 0.75rem; }
  .border-bottom { border-bottom: 1px solid #e2e8f0; }

  .valuacion-table-premium {
    background: white;

    thead th {
      background: #f1f5f9;
      color: #334155;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 4px 8px !important;
      border: 1px solid #e2e8f0;
      text-transform: uppercase;
    }

    .valuacion-row td {
      padding: 2px 4px !important;
      border: 1px solid #f1f5f9;
      height: 32px;

      /* Ajuste para que el texto de la moneda/kilataje sea legible pero pequeño */
      &:first-child {
        font-size: 0.75rem;
        letter-spacing: -0.02em;
        background: #fafafa;
      }
    }
  }

  /* Estilo unificado para los recuadros de préstamo */
  .prestamo-box {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    padding: 2px 8px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 800;
    font-size: 0.85rem;
    color: #0f172a;
    display: inline-block;
    min-width: 90px;
    text-align: right;
  }
</style>
