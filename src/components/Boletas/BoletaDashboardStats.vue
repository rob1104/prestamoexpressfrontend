<template>
  <q-card flat bordered class="stats-card bg-white shadow-1">
    <q-tabs v-model="tab" dense class="bg-grey-2 text-grey-7" active-color="primary" indicator-color="primary" align="justify">
      <q-tab name="tradicional" label="Tradicional" class="text-caption text-weight-bold" />
      <q-tab name="pagos" label="Pagos" class="text-caption text-weight-bold" />
      <q-tab name="bonificaciones" label="Bonificaciones" class="text-caption text-weight-bold" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="tradicional" class="q-pa-none">
        <q-markup-table dense flat class="stats-table-compact">
          <thead>
            <tr class="text-caption text-weight-bolder">
              <th class="text-left">PRÉSTAMOS TRADICIONAL</th>
              <th class="text-center">FOLIOS</th>
              <th class="text-right">IMPORTE</th>
            </tr>
          </thead>
          <tbody class="text-caption">
            <tr><td>Préstamos Terminados</td><td class="text-center">{{ data.terminados_count || 0 }}</td><td class="text-right">$ {{ formatMoney(data.terminados_sum) }}</td></tr>
            <tr><td>Liquidaciones</td><td class="text-center">{{ data.liquidaciones_count || 0 }}</td><td class="text-right">$ {{ formatMoney(data.liquidaciones_sum) }}</td></tr>
            <tr class="text-grey-5"><td>Liquidaciones Ab. Cap.</td><td class="text-center">0</td><td class="text-right">$ 0.00</td></tr>

            <q-separator />

            <tr class="text-weight-bold"><td>Préstamos en Proceso</td><td class="text-center">{{ data.proceso_count || 0 }}</td><td class="text-right">$ {{ formatMoney(data.proceso_sum) }}</td></tr>
            <tr class="q-pl-md"><td> • Vigentes</td><td class="text-center">{{ data.vigentes_count || 0 }}</td><td class="text-right">$ {{ formatMoney(data.vigentes_sum) }}</td></tr>
            <tr class="q-pl-md"><td> • Vencidos</td><td class="text-center">{{ data.vencidos_count || 0 }}</td><td class="text-right">$ {{ formatMoney(data.vencidos_sum) }}</td></tr>
          </tbody>
        </q-markup-table>

        <div v-if="!clienteSeleccionado" class="absolute-full flex flex-center bg-white-transparent">
          <div class="text-grey-6 text-caption italic">--- Seleccione un cliente para ver historial ---</div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script setup>
  import { ref } from 'vue'
  const props = defineProps({
    data: { type: Object, default: () => ({}) },
    clienteSeleccionado: { type: Boolean, default: false }
  })
  const tab = ref('tradicional')
  const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })
</script>

<style scoped>
  .stats-table-compact td { height: 25px !important; padding: 2px 8px !important; border-bottom: none !important; }
  .bg-white-transparent { background: rgba(255,255,255,0.8); z-index: 10; }
</style>
