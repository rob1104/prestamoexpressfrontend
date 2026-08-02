<template>
  <q-page class="q-pa-md bg-blue-grey-1">
    <q-card flat bordered class="q-mb-md shadow-2">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="text-h6 text-primary q-mr-md text-weight-bolder">REPORTE DE COMPRAS DETALLADO</div>

        <div class="col-12 col-sm-auto">
          <q-input autofocus v-model="form.fecha_inicio" outlined dense type="date" label="Fecha Inicio" bg-color="white" />
        </div>
        
        <div class="col-12 col-sm-auto">
          <q-input v-model="form.fecha_fin" outlined dense type="date" label="Fecha Fin" bg-color="white" />
        </div>

        <div class="col-12 col-sm-auto">
          <q-select v-model="form.categoria" :options="opcionesCategoria" outlined dense label="Categoría" bg-color="white" style="width: 150px" />
        </div>

        <q-btn color="primary" icon="search" label="Consultar" @click="consultarReporte" :loading="loading" class="q-ml-sm" />
        <q-space />
        <q-btn color="grey-8" icon="print" label="PDF" @click="exportarPDF" :disable="!reporteData.compras?.length" flat class="q-ml-xs" />
        <q-btn color="green-8" icon="table_view" label="Excel" @click="exportarExcel" :disable="!reporteData.compras?.length" flat class="q-ml-xs" />
      </q-card-section>
    </q-card>

    <div v-if="reporteData.compras?.length">
      <!-- Tarjetas de Totales -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-4">
          <q-card flat bordered class="bg-primary text-white shadow-3">
            <q-card-section>
              <div class="text-subtitle2 text-uppercase">Monto Total Compras</div>
              <div class="text-h4 text-weight-bolder">$ {{ formatMoney(reporteData.totales?.monto_total) }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card flat bordered class="bg-green-7 text-white shadow-3">
            <q-card-section>
              <div class="text-subtitle2 text-uppercase">Artículos Comprados</div>
              <div class="text-h4 text-weight-bolder">{{ reporteData.totales?.cantidad_articulos || 0 }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Tabla Detallada -->
      <q-card flat bordered class="shadow-2">
        <q-table
          :rows="reporteData.compras"
          :columns="columnas"
          row-key="id"
          :pagination="{ rowsPerPage: 20 }"
          flat
        >
          <template v-slot:body-cell-fecha="props">
            <q-td :props="props">{{ formatDate(props.row.fecha) }}</q-td>
          </template>
          <template v-slot:body-cell-precio_compra="props">
            <q-td :props="props" class="text-weight-bold text-primary">
              $ {{ formatMoney(props.row.precio_compra) }}
            </q-td>
          </template>
          <template v-slot:body-cell-categoria="props">
            <q-td :props="props">
              <q-chip :color="props.row.categoria === 'Joyería' ? 'orange-2' : 'blue-2'" dense class="text-weight-medium">
                {{ props.row.categoria }}
              </q-chip>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Empty State -->
    <div v-else-if="hasSearched && !loading" class="q-pa-xl text-center">
      <q-icon name="shopping_basket" size="4rem" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-sm">No se encontraron compras en este periodo.</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const hasSearched = ref(false)

const form = reactive({
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: new Date().toISOString().split('T')[0],
  categoria: 'Todas'
})

const opcionesCategoria = ['Todas', 'Joyería', 'Electrónicos']

const reporteData = reactive({
  compras: [],
  totales: {}
})

const columnas = [
  { name: 'folio', label: 'FOLIO COMPRA', field: 'folio', align: 'left', sortable: true },
  { name: 'fecha', label: 'FECHA', field: 'fecha', align: 'left', sortable: true },
  { name: 'cliente', label: 'CLIENTE', field: 'cliente', align: 'left', sortable: true },
  { name: 'categoria_detalle', label: 'TIPO / KILATAJE', field: 'categoria_detalle', align: 'left', sortable: true },
  { name: 'articulo', label: 'ARTÍCULO', field: 'articulo', align: 'left' },
  { name: 'categoria', label: 'CATEGORÍA', field: 'categoria', align: 'left' },
  { name: 'precio_compra', label: 'PRECIO COMPRA', field: 'precio_compra', align: 'right', sortable: true },
]

const formatMoney = (val) => Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const consultarReporte = async () => {
  loading.value = true
  hasSearched.value = true
  try {
    const res = await api.get('/api/reportes/compras-detallado', { params: form })
    reporteData.compras = res.data.compras
    reporteData.totales = res.data.totales
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al obtener el reporte' })
  } finally {
    loading.value = false
  }
}

const exportarPDF = async () => {
  try {
    const res = await api.get('/api/reportes/compras-detallado/url-firmada-pdf', { params: form })
    window.open(res.data.url, '_blank')
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error al generar PDF' })
  }
}

const exportarExcel = async () => {
  try {
    const res = await api.get('/api/reportes/compras-detallado/url-firmada-excel', { params: form })
    window.open(res.data.url, '_blank')
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error al generar Excel' })
  }
}
</script>

<style scoped>
</style>
