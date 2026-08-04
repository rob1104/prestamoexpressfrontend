<template>
  <q-page class="q-pa-md bg-blue-grey-1">
    <q-card flat bordered class="q-mb-md shadow-2">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="text-h6 text-primary q-mr-md text-weight-bolder">MOVIMIENTOS (PAGOS ALMACENAJE)</div>

        <div class="col-12 col-sm-auto">
          <q-input autofocus v-model="form.fecha_inicial" outlined dense type="date" label="Fecha Inicial" bg-color="white" />
        </div>

        <div class="col-12 col-sm-auto">
          <q-input v-model="form.fecha_final" outlined dense type="date" label="Fecha Final" bg-color="white" />
        </div>

        <q-btn color="primary" icon="search" label="Consultar" @click="consultarReporte" :loading="loading" class="q-ml-sm" />
        <q-space />
        <q-btn color="grey-8" icon="print" label="PDF" @click="exportarPDF" :disable="!reporteData.length" flat class="q-ml-xs" />
      </q-card-section>
    </q-card>

    <q-card flat bordered class="bg-white shadow-5">
      <q-table
        :rows="reporteData"
        :columns="columns"
        row-key="folio_str"
        :loading="loading"
        flat
        bordered
        :pagination="initialPagination"
        class="reporte-table"
        no-data-label="No hay datos para imprimir"
      >
        <template v-slot:body-cell-capital="props">
          <q-td :props="props" class="text-right">
            {{ formatMoney(props.row.capital) }}
          </q-td>
        </template>
        <template v-slot:body-cell-almacenaje="props">
          <q-td :props="props" class="text-right">
            {{ formatMoney(props.row.almacenaje) }}
          </q-td>
        </template>
        <template v-slot:body-cell-interes="props">
          <q-td :props="props" class="text-right">
            {{ formatMoney(props.row.interes) }}
          </q-td>
        </template>
        <template v-slot:body-cell-iva="props">
          <q-td :props="props" class="text-right">
            {{ formatMoney(props.row.iva) }}
          </q-td>
        </template>
        <template v-slot:body-cell-pago="props">
          <q-td :props="props" class="text-right text-weight-bold">
            {{ formatMoney(props.row.pago) }}
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { date, useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const reporteData = ref([])

const initialPagination = {
  sortBy: 'fecha_pago',
  descending: false,
  rowsPerPage: 50
}

const form = ref({
  fecha_inicial: date.formatDate(new Date(), 'YYYY-MM-DD'),
  fecha_final: date.formatDate(new Date(), 'YYYY-MM-DD')
})

const columns = [
  { name: 'fecha_pago', align: 'center', label: 'FECHA', field: 'fecha_pago', sortable: true },
  { name: 'folio_str', align: 'center', label: 'FOLIO', field: 'folio_str', sortable: true },
  { name: 'cliente', align: 'left', label: 'CLIENTE', field: 'cliente', sortable: true },
  { name: 'categoria', align: 'center', label: 'CATEGORIA', field: 'categoria', sortable: true },
  { name: 'capital', align: 'right', label: 'CAPITAL', field: 'capital', sortable: true },
  { name: 'almacenaje', align: 'right', label: 'ALMACENAJE', field: 'almacenaje', sortable: true },
  { name: 'interes', align: 'right', label: 'INTERES', field: 'interes', sortable: true },
  { name: 'iva', align: 'right', label: 'IVA INTERES', field: 'iva', sortable: true },
  { name: 'pago', align: 'right', label: 'PAGO', field: 'pago', sortable: true }
]

const formatMoney = (val) => {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const consultarReporte = async () => {
  if (!form.value.fecha_inicial || !form.value.fecha_final) {
    $q.notify({ type: 'warning', message: 'Seleccione un rango de fechas' })
    return
  }

  loading.value = true
  try {
    const res = await api.get('/api/reportes/pagos-almacenaje', { params: form.value })
    reporteData.value = res.data || []
    
    if (reporteData.value.length === 0) {
      $q.notify({ type: 'info', message: 'No hay datos para imprimir' })
    }
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al obtener reporte' })
  } finally {
    loading.value = false
  }
}

const exportarPDF = async () => {
  try {
    const res = await api.get('/api/reportes/pagos-almacenaje/url-firmada-pdf', { params: form.value })
    window.open(res.data.url, '_blank')
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error al generar PDF' })
  }
}
</script>

<style scoped>
.reporte-table {
  font-family: 'Courier New', Courier, monospace;
}
.reporte-table th {
  font-weight: bold;
  font-size: 13px;
  background-color: #f5f5f5;
}
</style>
