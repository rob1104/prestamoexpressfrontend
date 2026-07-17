<template>
  <q-page class="q-pa-md bg-blue-grey-1">
    <q-card flat bordered class="q-mb-md shadow-2">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="text-h6 text-primary q-mr-md text-weight-bolder">REPORTE DE VENTAS DETALLADO</div>

        <div class="col-12 col-sm-auto">
          <q-input v-model="form.fecha_inicio" outlined dense type="date" label="Fecha Inicio" bg-color="white" />
        </div>
        
        <div class="col-12 col-sm-auto">
          <q-input v-model="form.fecha_fin" outlined dense type="date" label="Fecha Fin" bg-color="white" />
        </div>

        <div class="col-12 col-sm-auto">
          <q-select v-model="form.categoria" :options="opcionesCategoria" outlined dense label="Categoría" bg-color="white" style="width: 150px" />
        </div>

        <q-btn color="primary" icon="search" label="Consultar" @click="consultarReporte" :loading="loading" class="q-ml-sm" />
        <q-space />
        <q-btn color="grey-8" icon="print" label="PDF" @click="exportarPDF" :disable="!reporteData.ventas?.length" flat class="q-ml-xs" />
        <q-btn color="green-8" icon="table_view" label="Excel" @click="exportarExcel" :disable="!reporteData.ventas?.length" flat class="q-ml-xs" />
      </q-card-section>
    </q-card>

    <div v-if="reporteData.ventas?.length">
      <!-- Tarjetas de Totales -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-4">
          <q-card flat bordered class="bg-primary text-white shadow-3">
            <q-card-section>
              <div class="text-subtitle2 text-uppercase">Total Vendido</div>
              <div class="text-h4 text-weight-bolder">$ {{ formatMoney(reporteData.totales?.monto_total) }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card flat bordered class="bg-green-7 text-white shadow-3">
            <q-card-section>
              <div class="text-subtitle2 text-uppercase">Utilidad Total</div>
              <div class="text-h4 text-weight-bolder">$ {{ formatMoney(reporteData.totales?.utilidad_total) }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card flat bordered class="bg-grey-3 text-grey-9 shadow-3">
            <q-card-section>
              <div class="text-subtitle2 text-uppercase">Artículos Vendidos</div>
              <div class="text-h4 text-weight-bolder">{{ reporteData.totales?.cantidad_articulos || 0 }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card flat bordered class="bg-white shadow-5">
        <q-table
          :rows="reporteData.ventas"
          :columns="columns"
          row-key="folio"
          :loading="loading"
          flat
          bordered
          :pagination="initialPagination"
          class="reporte-table"
        >
          <template v-slot:body-cell-costo="props">
            <q-td :props="props" class="text-right">
              $ {{ formatMoney(props.row.costo) }}
            </q-td>
          </template>
          <template v-slot:body-cell-precio_venta="props">
            <q-td :props="props" class="text-right text-weight-bold">
              $ {{ formatMoney(props.row.precio_venta) }}
            </q-td>
          </template>
          <template v-slot:body-cell-utilidad="props">
            <q-td :props="props" class="text-right text-weight-bold text-green-9">
              $ {{ formatMoney(props.row.utilidad) }}
            </q-td>
          </template>
          <template v-slot:body-cell-categoria="props">
            <q-td :props="props" class="text-center">
              <q-badge :color="props.row.categoria === 'Joyería' ? 'amber-9' : 'blue-8'">
                {{ props.row.categoria }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { date, useQuasar, exportFile } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const reporteData = ref({ ventas: [], totales: {} })

const form = ref({
  fecha_inicio: date.formatDate(new Date(), 'YYYY-MM-DD'),
  fecha_fin: date.formatDate(new Date(), 'YYYY-MM-DD'),
  categoria: 'Todas'
})

const opcionesCategoria = ['Todas', 'Joyería', 'Electrónicos']

const initialPagination = {
  sortBy: 'fecha',
  descending: true,
  page: 1,
  rowsPerPage: 20
}

const columns = [
  { name: 'folio', align: 'left', label: 'FOLIO VENTA', field: 'folio', sortable: true },
  { name: 'fecha', align: 'center', label: 'FECHA', field: 'fecha', sortable: true },
  { name: 'cliente', align: 'left', label: 'CLIENTE', field: 'cliente', sortable: true },
  { name: 'articulo', align: 'left', label: 'ARTÍCULO', field: 'articulo' },
  { name: 'categoria', align: 'center', label: 'CATEGORÍA', field: 'categoria', sortable: true },
  { name: 'costo', align: 'right', label: 'COSTO', field: 'costo', sortable: true },
  { name: 'precio_venta', align: 'right', label: 'PRECIO VENTA', field: 'precio_venta', sortable: true },
  { name: 'utilidad', align: 'right', label: 'UTILIDAD', field: 'utilidad', sortable: true }
]

const formatMoney = (val) => {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const consultarReporte = async () => {
  loading.value = true
  try {
    const res = await api.get('/api/reportes/ventas-detallado', { params: form.value })
    reporteData.value = res.data || { ventas: [], totales: {} }
    
    // Fallback if backend returns an array instead of an object with 'ventas' and 'totales'
    if (Array.isArray(res.data)) {
      let monto_total = 0;
      let utilidad_total = 0;
      res.data.forEach(item => {
        monto_total += Number(item.precio_venta || 0);
        utilidad_total += Number(item.utilidad || 0);
      });
      reporteData.value = {
        ventas: res.data,
        totales: { monto_total, utilidad_total, cantidad_articulos: res.data.length }
      }
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
    const res = await api.get('/api/reportes/ventas-detallado/url-firmada-pdf', { params: form.value })
    window.open(res.data.url, '_blank')
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error al generar PDF' })
  }
}

const exportarExcel = () => {
  const content = [columns.map(col => wrapCsvValue(col.label))].concat(
    reporteData.value.ventas.map(row => columns.map(col => wrapCsvValue(
      typeof col.field === 'function'
        ? col.field(row)
        : row[ col.field === void 0 ? col.name : col.field ],
      col.format,
      row
    )).join(','))
  ).join('\r\n')

  const status = exportFile(
    'ventas_detallado.csv',
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
