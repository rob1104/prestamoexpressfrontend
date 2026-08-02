<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-primary text-weight-bolder">Detalles de Movimientos</div>
      <q-space />
      <q-btn
        v-if="reporteGenerado"
        color="primary"
        icon="picture_as_pdf"
        label="Exportar PDF"
        @click="exportarPDF"
        :loading="loadingPdf"
      />
    </div>

    <!-- Filtros Superiores -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-3">
            <q-input autofocus v-model="filtros.fecha_inicio" label="Fecha Inicial" type="date" dense outlined />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filtros.fecha_fin" label="Fecha Final" type="date" dense outlined />
          </div>
          <div class="col-12 col-md-3">
            <q-select 
              v-model="filtros.caja" 
              :options="cajasOptions" 
              label="Caja" 
              dense outlined 
              emit-value 
              map-options 
            />
          </div>
          <div class="col-12 col-md-3">
            <q-btn color="primary" label="Generar Reporte" @click="fetchData" class="full-width" :loading="loading" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Opciones de Detalles de Movimientos -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3" v-for="(grupo, index) in opcionesGrupos" :key="index">
        <q-card flat bordered class="h-100 column">
          <q-card-section class="bg-grey-2 q-pa-sm">
            <div class="row items-center justify-between">
              <div class="text-caption text-weight-bold uppercase">{{ grupo.titulo }}</div>
              <q-btn flat round dense icon="check_box" size="sm" @click="marcarTodos(grupo)">
                <q-tooltip>Marcar / Desmarcar Todos</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>
          <q-card-section class="col q-pt-sm" style="max-height: 400px; overflow-y: auto;">
            <q-checkbox 
              v-for="(opcion, opIndex) in grupo.opciones" 
              :key="opIndex" 
              v-model="opcion.seleccionado" 
              :label="opcion.label" 
              dense 
              class="full-width q-mb-xs" 
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla de Previsualización (opcional) -->
    <q-card flat bordered v-if="reporteGenerado">
      <q-card-section class="bg-grey-2">
        <div class="text-subtitle1 text-weight-bold">Previsualización de Movimientos</div>
      </q-card-section>
      <q-table
        :rows="movimientos"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :pagination="{ rowsPerPage: 50 }"
      >
        <template v-slot:body-cell-monto="props">
          <q-td :props="props" class="text-right">{{ formatMoney(props.row.monto) }}</q-td>
        </template>
      </q-table>
    </q-card>
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
  fecha_fin: hoy,
  caja: 'Todas'
})

const cajasOptions = ref([
  { label: 'Todas las Cajas', value: 'Todas' },
  { label: 'Caja 1', value: '1' }
])

const opcionesGrupos = ref([
  {
    titulo: 'TRADICIONAL Y PAGOS',
    opciones: [
      { label: 'Préstamos Nuevos', id: 'prestamos_nuevos', seleccionado: true },
      { label: 'Refrendos', id: 'refrendos', seleccionado: true },
      { label: 'Pagos (Liquidaciones)', id: 'pagos', seleccionado: true },
      { label: 'Abonos', id: 'abonos', seleccionado: true },
      { label: 'Recuperación de Saldo a Favor', id: 'recuperacion_saldo', seleccionado: false },
      { label: 'Adjudicación de Intereses', id: 'adjudicacion_intereses', seleccionado: false },
      { label: 'Capital Recuperado en Adjudicación', id: 'capital_adjudicacion', seleccionado: false },
      { label: 'Gastos Generales', id: 'gastos_generales', seleccionado: false },
      { label: 'Pagos Varios', id: 'pagos_varios', seleccionado: false }
    ]
  },
  {
    titulo: 'COMPRAS',
    opciones: [
      { label: 'Compras de Oro (Plata/Peso)', id: 'compras_oro', seleccionado: true },
      { label: 'Compras de Artículos', id: 'compras_articulos', seleccionado: true },
      { label: 'Compras de Divisas', id: 'compras_divisas', seleccionado: false },
      { label: 'Compras de Auto', id: 'compras_auto', seleccionado: false },
      { label: 'Refrendo de Auto', id: 'refrendo_auto', seleccionado: false },
      { label: 'Compras Varios', id: 'compras_varios', seleccionado: false }
    ]
  },
  {
    titulo: 'FLUJO DE CAJA',
    opciones: [
      { label: 'Abono Especial', id: 'abono_especial', seleccionado: false },
      { label: 'Entradas a Caja', id: 'entradas_caja', seleccionado: true },
      { label: 'Salidas de Caja', id: 'salidas_caja', seleccionado: true },
      { label: 'Entradas de Ventas (Efectivo)', id: 'entradas_ventas_efectivo', seleccionado: true },
      { label: 'Entradas de Ventas (Tarjeta)', id: 'entradas_ventas_tarjeta', seleccionado: true }
    ]
  },
  {
    titulo: 'CANCELACIONES',
    opciones: [
      { label: 'Cancelaciones de Empeños', id: 'cancelaciones_empenos', seleccionado: false },
      { label: 'Cancelaciones de Refrendos', id: 'cancelaciones_refrendos', seleccionado: false },
      { label: 'Cancelaciones de Abonos', id: 'cancelaciones_abonos', seleccionado: false },
      { label: 'Cancelaciones de Compras', id: 'cancelaciones_compras', seleccionado: false },
      { label: 'Cancelaciones de Ventas', id: 'cancelaciones_ventas', seleccionado: false }
    ]
  }
])

const marcarTodos = (grupo) => {
  const allSelected = grupo.opciones.every(o => o.seleccionado)
  grupo.opciones.forEach(o => o.seleccionado = !allSelected)
}

const movimientos = ref([])
const reporteGenerado = ref(false)
const loading = ref(false)
const loadingPdf = ref(false)

const columns = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'concepto', label: 'Concepto', field: 'concepto', align: 'left' },
  { name: 'recibo', label: 'Recibo', field: 'recibo', align: 'left' },
  { name: 'tipo', label: 'E/S', field: 'tipo', align: 'center' },
  { name: 'monto', label: 'Importe', field: 'monto', align: 'right' }
]

const formatMoney = (val) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0)
}

const getConceptosSeleccionados = () => {
  let seleccionados = []
  opcionesGrupos.value.forEach(grupo => {
    grupo.opciones.forEach(opcion => {
      if (opcion.seleccionado) seleccionados.push(opcion.id)
    })
  })
  return seleccionados
}

const fetchData = async () => {
  const conceptos = getConceptosSeleccionados()
  if (conceptos.length === 0) {
    $q.notify({ type: 'warning', message: 'Debe seleccionar al menos un concepto.' })
    return
  }

  loading.value = true
  try {
    const { data } = await api.post('/api/reportes/detalles-movimientos/preview', { 
      filtros: filtros.value,
      conceptos: conceptos
    })
    movimientos.value = data.movimientos || []
    reporteGenerado.value = true
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al obtener los datos del reporte.' })
  } finally {
    loading.value = false
  }
}

const exportarPDF = async () => {
  loadingPdf.value = true
  try {
    const conceptos = getConceptosSeleccionados()
    const { data } = await api.post('/api/reportes/detalles-movimientos/url-firmada-pdf', { 
      filtros: filtros.value,
      conceptos: conceptos
    })
    if (data.url) {
      window.open(data.url, '_blank')
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al generar la URL del PDF.' })
  } finally {
    loadingPdf.value = false
  }
}
</script>

<style scoped>
.h-100 {
  height: 100%;
}
.uppercase {
  text-transform: uppercase;
}
</style>
