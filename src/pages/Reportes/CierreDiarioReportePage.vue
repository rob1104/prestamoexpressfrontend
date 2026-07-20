<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-primary text-weight-bolder">Reporte de Cierres Diarios</div>
      <q-space />
      <q-btn
        v-if="cierres.length > 0"
        color="primary"
        icon="picture_as_pdf"
        label="Exportar PDF"
        @click="exportarPDF"
        :loading="loadingPdf"
      />
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-3">
            <q-input v-model="filtros.fecha_inicio" label="Fecha Inicio" type="date" dense outlined />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filtros.fecha_fin" label="Fecha Fin" type="date" dense outlined />
          </div>
          <div class="col-12 col-md-3">
            <q-btn color="primary" label="Buscar" @click="fetchData" class="full-width" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resumen Totales -->
    <q-card class="q-mb-md" flat bordered v-if="totales && cierres.length > 0">
      <q-card-section class="bg-grey-2">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">Resumen del Periodo</div>
        <div class="row q-col-gutter-sm">
          <div class="col-6 col-md-3"><strong>Préstamos Nuevos:</strong> {{ formatMoney(totales.prestamos_nuevos) }}</div>
          <div class="col-6 col-md-3"><strong>Cap. Recuperado:</strong> {{ formatMoney(totales.capital_recuperado) }}</div>
          <div class="col-6 col-md-3"><strong>Int. Recuperado:</strong> {{ formatMoney(totales.interes_recuperado) }}</div>
          <div class="col-6 col-md-3"><strong>Recargos:</strong> {{ formatMoney(totales.recargos_cobrados) }}</div>
          <div class="col-6 col-md-3"><strong>Ventas Joyería:</strong> {{ formatMoney(totales.ventas_joyeria) }}</div>
          <div class="col-6 col-md-3"><strong>Ventas Electrónicos:</strong> {{ formatMoney(totales.ventas_electronicos) }}</div>
          <div class="col-6 col-md-3"><strong>Otras Entradas:</strong> {{ formatMoney(totales.entradas_otros) }}</div>
          <div class="col-6 col-md-3"><strong>Otras Salidas:</strong> {{ formatMoney(totales.salidas_otros) }}</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de Resultados -->
    <q-table
      :rows="cierres"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
      :pagination="{ rowsPerPage: 50 }"
    >
      <template v-slot:body-cell-prestamos_nuevos="props">
        <q-td :props="props" class="text-right">{{ formatMoney(props.row.prestamos_nuevos) }}</q-td>
      </template>
      <template v-slot:body-cell-capital_recuperado="props">
        <q-td :props="props" class="text-right">{{ formatMoney(props.row.capital_recuperado) }}</q-td>
      </template>
      <template v-slot:body-cell-interes_recuperado="props">
        <q-td :props="props" class="text-right">{{ formatMoney(props.row.interes_recuperado) }}</q-td>
      </template>
      <template v-slot:body-cell-recargos_cobrados="props">
        <q-td :props="props" class="text-right">{{ formatMoney(props.row.recargos_cobrados) }}</q-td>
      </template>
      <template v-slot:body-cell-ventas_joyeria="props">
        <q-td :props="props" class="text-right">{{ formatMoney(props.row.ventas_joyeria) }}</q-td>
      </template>
      <template v-slot:body-cell-ventas_electronicos="props">
        <q-td :props="props" class="text-right">{{ formatMoney(props.row.ventas_electronicos) }}</q-td>
      </template>
      <template v-slot:body-cell-entradas_otros="props">
        <q-td :props="props" class="text-right">{{ formatMoney(props.row.entradas_otros) }}</q-td>
      </template>
      <template v-slot:body-cell-salidas_otros="props">
        <q-td :props="props" class="text-right">{{ formatMoney(props.row.salidas_otros) }}</q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const hoy = new Date().toISOString().split('T')[0]

const filtros = ref({
  fecha_inicio: hoy,
  fecha_fin: hoy
})

const cierres = ref([])
const totales = ref(null)
const loading = ref(false)
const loadingPdf = ref(false)

const columns = [
  { name: 'fecha_cierre', label: 'Fecha Cierre', field: 'fecha_cierre', align: 'left', sortable: true },
  { name: 'prestamos_nuevos', label: 'Préstamos Nuevos', field: 'prestamos_nuevos', align: 'right' },
  { name: 'capital_recuperado', label: 'Capital Recup.', field: 'capital_recuperado', align: 'right' },
  { name: 'interes_recuperado', label: 'Interés Recup.', field: 'interes_recuperado', align: 'right' },
  { name: 'recargos_cobrados', label: 'Recargos', field: 'recargos_cobrados', align: 'right' },
  { name: 'ventas_joyeria', label: 'Ventas Joyería', field: 'ventas_joyeria', align: 'right' },
  { name: 'ventas_electronicos', label: 'Ventas Electrónicos', field: 'ventas_electronicos', align: 'right' },
  { name: 'entradas_otros', label: 'Otras Entradas', field: 'entradas_otros', align: 'right' },
  { name: 'salidas_otros', label: 'Otras Salidas', field: 'salidas_otros', align: 'right' }
]

const formatMoney = (val) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0)
}

const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/api/reportes/cierre-diario', { params: filtros.value })
    cierres.value = data.cierres
    totales.value = data.totales
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al obtener los datos.' })
  } finally {
    loading.value = false
  }
}

const exportarPDF = async () => {
  loadingPdf.value = true
  try {
    const { data } = await api.get('/api/reportes/cierre-diario/url-firmada-pdf', { params: filtros.value })
    if (data.url) {
      window.open(data.url, '_blank')
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al generar la URL del PDF.' })
  } finally {
    loadingPdf.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
