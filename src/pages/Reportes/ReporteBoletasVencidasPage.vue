<template>
  <q-page class="q-pa-md bg-blue-grey-1">
    <q-card flat bordered class="q-mb-md shadow-2">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="text-h6 text-primary q-mr-md text-weight-bolder">BOLETAS VENCIDAS / POR VENCER</div>

        <div class="col-12 col-sm-auto">
          <q-input v-model="form.fecha_corte" outlined dense type="date" label="Fecha de Corte" bg-color="white" />
        </div>

        <div class="col-12 col-sm-auto">
          <q-input v-model.number="form.dias_tolerancia" type="number" outlined dense label="Días Tolerancia" bg-color="white" style="width: 130px" />
        </div>

        <div class="col-12 col-sm-auto">
          <q-select v-model="form.estatus" :options="opcionesEstatus" outlined dense label="Estatus" bg-color="white" style="width: 150px" />
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
        row-key="folio"
        :loading="loading"
        flat
        bordered
        :pagination="initialPagination"
        class="reporte-table"
        no-data-label="No se encontraron boletas con los filtros seleccionados"
      >
        <template v-slot:body-cell-monto="props">
          <q-td :props="props" class="text-right text-weight-bold">
            $ {{ formatMoney(props.row.monto) }}
          </q-td>
        </template>
        <template v-slot:body-cell-estatus="props">
          <q-td :props="props" class="text-center">
            <q-badge :color="props.row.dias_vencido > 0 ? 'red' : 'orange'">
              {{ props.row.dias_vencido > 0 ? 'VENCIDA' : 'POR VENCER' }}
            </q-badge>
          </q-td>
        </template>
        <template v-slot:body-cell-dias="props">
          <q-td :props="props" class="text-center" :class="props.row.dias_vencido > 0 ? 'text-red text-weight-bold' : ''">
            {{ Math.abs(props.row.dias_vencido) }} {{ props.row.dias_vencido > 0 ? 'días' : 'días faltan' }}
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
  sortBy: 'dias_vencido',
  descending: false,
  rowsPerPage: 20
}

const form = ref({
  fecha_corte: date.formatDate(new Date(), 'YYYY-MM-DD'),
  dias_tolerancia: 0,
  estatus: 'Todos'
})

const opcionesEstatus = ['Todos', 'Vencidas', 'Por Vencer']

const columns = [
  { name: 'folio', align: 'left', label: 'FOLIO', field: 'folio', sortable: true },
  { name: 'cliente', align: 'left', label: 'CLIENTE', field: 'cliente', sortable: true },
  { name: 'articulo', align: 'left', label: 'ARTÍCULO(S)', field: 'articulo' },
  { name: 'fecha_prestamo', align: 'center', label: 'FECHA PRÉSTAMO', field: 'fecha_prestamo', sortable: true },
  { name: 'fecha_vencimiento', align: 'center', label: 'VENCIMIENTO', field: 'fecha_vencimiento', sortable: true },
  { name: 'dias', align: 'center', label: 'DÍAS VENCIDO', field: 'dias_vencido', sortable: true },
  { name: 'monto', align: 'right', label: 'MONTO PRÉSTAMO', field: 'monto', sortable: true },
  { name: 'estatus', align: 'center', label: 'ESTATUS', field: 'estatus' }
]

const formatMoney = (val) => {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const consultarReporte = async () => {
  loading.value = true
  try {
    const res = await api.get('/api/reportes/boletas-vencidas', { params: form.value })
    reporteData.value = res.data || []
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al obtener reporte' })
  } finally {
    loading.value = false
  }
}

const exportarPDF = async () => {
  try {
    const res = await api.get('/api/reportes/boletas-vencidas/url-firmada-pdf', { params: form.value })
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
    'boletas_vencidas.csv',
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
