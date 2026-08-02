<template>
  <q-page class="q-pa-md bg-blue-grey-1">
    <q-card flat bordered class="q-mb-md shadow-2">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="text-h6 text-primary q-mr-md text-weight-bolder">RELACIÓN DE BOLETAS DIARIAS PARA DEPOSITO</div>

        <div class="col-12 col-sm-auto">
          <q-input autofocus v-model="form.fecha_inicial" outlined dense type="date" label="Fecha Inicial" bg-color="white" />
        </div>

        <div class="col-12 col-sm-auto">
          <q-input v-model="form.fecha_final" outlined dense type="date" label="Fecha Final" bg-color="white" />
        </div>

        <q-btn color="primary" icon="search" label="Consultar" @click="consultarReporte" :loading="loading" class="q-ml-sm" />
        <q-space />
        <q-btn color="grey-8" icon="print" label="PDF" @click="exportarPDF" :disable="!reporteData.length" flat class="q-ml-xs" />
        <q-btn color="green-8" icon="table_view" label="Excel" @click="exportarExcel" :disable="!reporteData.length" flat class="q-ml-xs" />
      </q-card-section>
    </q-card>

    <q-card flat bordered class="bg-white shadow-5">
      <q-table
        :rows="reporteData"
        :columns="columns"
        row-key="id"
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
        <template v-slot:body-cell-interes="props">
          <q-td :props="props" class="text-right">
            {{ formatMoney(props.row.interes) }}
          </q-td>
        </template>
        <template v-slot:body-cell-custodia="props">
          <q-td :props="props" class="text-right">
            {{ formatMoney(props.row.custodia) }}
          </q-td>
        </template>
        <template v-slot:body-cell-administracion="props">
          <q-td :props="props" class="text-right">
            {{ formatMoney(props.row.administracion) }}
          </q-td>
        </template>
        <template v-slot:body-cell-iva="props">
          <q-td :props="props" class="text-right">
            {{ formatMoney(props.row.iva) }}
          </q-td>
        </template>
        <template v-slot:body-cell-interes_iva="props">
          <q-td :props="props" class="text-right">
            {{ formatMoney(props.row.interes_iva) }}
          </q-td>
        </template>
        <template v-slot:body-cell-total="props">
          <q-td :props="props" class="text-right text-weight-bold">
            {{ formatMoney(props.row.total) }}
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { date, useQuasar, exportFile } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const reporteData = ref([])

const initialPagination = {
  sortBy: 'fecha',
  descending: false,
  rowsPerPage: 50
}

const form = ref({
  fecha_inicial: date.formatDate(new Date(), 'YYYY-MM-DD'),
  fecha_final: date.formatDate(new Date(), 'YYYY-MM-DD'),
  tipo_reporte: 'boletas'
})

const columns = [
  { name: 'folio', align: 'center', label: 'FOLIO', field: 'folio', sortable: true },
  { name: 'pag', align: 'center', label: 'PAG', field: 'pag', sortable: true },
  { name: 'no_cliente', align: 'center', label: 'NO. CLIENTE', field: 'no_cliente', sortable: true },
  { name: 'cliente', align: 'left', label: 'CLIENTE', field: 'cliente', sortable: true },
  { name: 'capital', align: 'right', label: 'CAPITAL', field: 'capital', sortable: true },
  { name: 'interes', align: 'right', label: 'INTERES', field: 'interes', sortable: true },
  { name: 'custodia', align: 'right', label: 'CUSTODIA', field: 'custodia', sortable: true },
  { name: 'administracion', align: 'right', label: 'ADMINISTRACION', field: 'administracion', sortable: true },
  { name: 'iva', align: 'right', label: 'IVA', field: 'iva', sortable: true },
  { name: 'interes_iva', align: 'right', label: 'INTERES + IVA', field: 'interes_iva', sortable: true },
  { name: 'total', align: 'right', label: 'TOTAL', field: 'total', sortable: true }
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
    const res = await api.get('/api/reportes/boletas-diarias', { params: form.value })
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
    const res = await api.get('/api/reportes/boletas-diarias/url-firmada-pdf', { params: form.value })
    window.open(res.data.url, '_blank')
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error al generar PDF' })
  }
}

const exportarExcel = () => {
  const content = [columns.map(col => wrapCsvValue(col.label))].concat(
    reporteData.value.map(row => columns.map(col => wrapCsvValue(
      typeof col.field === 'function'
        ? col.field(row)
        : row[ col.field === void 0 ? col.name : col.field ],
      col.format,
      row
    )).join(','))
  ).join('\r\n')

  const status = exportFile(
    'boletas_diarias.csv',
    content,
    'text/csv'
  )

  if (status !== true) {
    $q.notify({
      message: 'El navegador denegó la descarga del archivo...',
      color: 'negative',
      icon: 'warning'
    })
  }
}

function wrapCsvValue (val, formatFn, row) {
  let formatted = formatFn !== void 0
    ? formatFn(val, row)
    : val

  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)

  formatted = formatted.split('"').join('""')
  return `"${formatted}"`
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
