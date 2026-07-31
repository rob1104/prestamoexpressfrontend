<template>
  <q-page padding class="bg-grey-1">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-primary text-weight-bolder flex items-center">
          <q-icon name="history" size="md" class="q-mr-sm" />
          Historial de Caja
        </div>
        <div class="text-caption text-grey-7">Visualiza entradas y salidas de efectivo</div>
      </div>
      
      <div class="q-gutter-sm">
        <q-btn color="positive" icon="add" label="Entrada" @click="mostrarEntrada = true" unelevated class="text-weight-bold" />
        <q-btn color="negative" icon="remove" label="Salida / Gasto" @click="mostrarSalida = true" unelevated class="text-weight-bold" />
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section class="row q-col-gutter-md items-center bg-white">
        <div class="col-12 col-md-3">
          <q-input v-model="filtros.fecha_inicio" label="Fecha Inicial" type="date" dense outlined />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model="filtros.fecha_fin" label="Fecha Final" type="date" dense outlined />
        </div>
        <div class="col-12 col-md-3">
          <q-btn color="primary" icon="search" label="Filtrar" @click="fetchHistorial" :loading="loading" unelevated class="full-width" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla -->
    <q-card flat bordered class="bg-white">
      <q-table
        :rows="movimientos"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :loading="loading"
        :pagination="pagination"
        @request="onRequest"
      >
        <!-- Formato Tipo Movimiento -->
        <template v-slot:body-cell-tipo="props">
          <q-td :props="props" class="text-center">
            <q-chip 
              :color="props.row.tipo === 'ENTRADA' ? 'positive' : 'negative'" 
              text-color="white" 
              size="sm" 
              class="text-weight-bold"
              square
            >
              {{ props.row.tipo }}
            </q-chip>
          </q-td>
        </template>

        <!-- Formato Monto -->
        <template v-slot:body-cell-monto="props">
          <q-td :props="props" class="text-right text-weight-bold" :class="props.row.tipo === 'ENTRADA' ? 'text-positive' : 'text-negative'">
            {{ formatMoney(props.row.monto) }}
          </q-td>
        </template>

        <!-- Formato Fecha -->
        <template v-slot:body-cell-fecha="props">
          <q-td :props="props">
            {{ formatFechaHora(props.row.created_at) }}
          </q-td>
        </template>

        <!-- Botones de Acción -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-center">
            <q-btn flat round class="action-btn" color="primary" icon="print" size="sm" @click="reimprimirTicket(props.row)">
              <q-tooltip>Reimprimir Ticket</q-tooltip>
            </q-btn>
            <q-btn flat round class="action-btn" color="cyan-9" icon="visibility" size="sm" @click="verDetalles(props.row)">
              <q-tooltip>Ver Detalles</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialogos de Entrada y Salida -->
    <DialogoEntradaCaja v-model="mostrarEntrada" @entrada-registrada="fetchHistorial" />
    <DialogoSalidaCaja v-model="mostrarSalida" @salida-registrada="fetchHistorial" />

    <!-- Dialogo Detalles -->
    <q-dialog v-model="mostrarDetalles">
      <q-card style="width: 400px; max-width: 90vw;">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Detalles de {{ movimientoSeleccionado?.tipo }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md" v-if="movimientoSeleccionado">
          <q-list separator>
            <q-item>
              <q-item-section>
                <q-item-label caption>Concepto</q-item-label>
                <q-item-label class="text-weight-bold">{{ movimientoSeleccionado.concepto_flujo?.nombre || movimientoSeleccionado.concepto }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Folio</q-item-label>
                <q-item-label>{{ movimientoSeleccionado.id }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Monto</q-item-label>
                <q-item-label class="text-weight-bold text-h6">{{ formatMoney(movimientoSeleccionado.monto) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="movimientoSeleccionado.observaciones">
              <q-item-section>
                <q-item-label caption>Observaciones</q-item-label>
                <q-item-label>{{ movimientoSeleccionado.observaciones }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="movimientoSeleccionado.recibido_por">
              <q-item-section>
                <q-item-label caption>Recibido Por</q-item-label>
                <q-item-label>{{ movimientoSeleccionado.recibido_por }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="movimientoSeleccionado.entregado_por">
              <q-item-section>
                <q-item-label caption>Entregado Por</q-item-label>
                <q-item-label>{{ movimientoSeleccionado.entregado_por }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="movimientoSeleccionado.autorizado_por">
              <q-item-section>
                <q-item-label caption>Autorizado Por</q-item-label>
                <q-item-label>{{ movimientoSeleccionado.autorizado_por }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import axios from 'axios'
import { useQuasar, date } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import DialogoEntradaCaja from 'src/components/Caja/DialogoEntradaCaja.vue'
import DialogoSalidaCaja from 'src/components/Caja/DialogoSalidaCaja.vue'

const $q = useQuasar()
const authStore = useAuthStore()

const hoy = new Date().toISOString().split('T')[0]

const filtros = ref({
  fecha_inicio: hoy,
  fecha_fin: hoy
})

const loading = ref(false)
const movimientos = ref([])
const pagination = ref({
  page: 1,
  rowsPerPage: 50,
  rowsNumber: 0
})

const mostrarEntrada = ref(false)
const mostrarSalida = ref(false)

const mostrarDetalles = ref(false)
const movimientoSeleccionado = ref(null)

const columns = [
  { name: 'id', label: 'Folio', field: 'id', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'created_at', align: 'left' },
  { name: 'concepto', label: 'Concepto', field: row => row.concepto_flujo?.nombre || row.concepto, align: 'left' },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center' },
  { name: 'monto', label: 'Monto', field: 'monto', align: 'right' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

const formatMoney = (val) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0)
}

const formatFechaHora = (fechaString) => {
  if (!fechaString) return ''
  return date.formatDate(fechaString, 'DD/MM/YYYY HH:mm A')
}

const fetchHistorial = async (props = null) => {
  const { page, rowsPerPage } = props?.pagination || pagination.value
  
  loading.value = true
  try {
    const res = await api.get('/api/caja/movimientos', {
      params: {
        page,
        per_page: rowsPerPage,
        fecha_inicio: filtros.value.fecha_inicio,
        fecha_fin: filtros.value.fecha_fin
      }
    })
    
    movimientos.value = res.data.data.data
    pagination.value.page = res.data.data.current_page
    pagination.value.rowsPerPage = res.data.data.per_page
    pagination.value.rowsNumber = res.data.data.total
  } catch (error) {
    console.error('Error al cargar historial', error)
    $q.notify({ type: 'negative', message: 'Error al cargar el historial de movimientos' })
  } finally {
    loading.value = false
  }
}

const onRequest = (props) => {
  fetchHistorial(props)
}

const verDetalles = (row) => {
  movimientoSeleccionado.value = row
  mostrarDetalles.value = true
}

const reimprimirTicket = async (row) => {
  try {
    const payload = {
      empresa: { nombre: 'PRESTAMO EXPRESS', sucursal: 'MATRIZ' },
      folio: row.id,
      tipo_movimiento: row.tipo === 'ENTRADA' ? 'ENTRADA DE CAJA' : 'SALIDA DE CAJA',
      concepto: row.concepto_flujo?.nombre || row.concepto || '---',
      monto: row.monto,
      observaciones: row.observaciones || '',
      fecha: row.created_at,
      cajero: authStore.user ? authStore.user.name : 'CAJERO',
      recibido_por: row.recibido_por || '',
      entregado_por: row.entregado_por || '',
      autorizado_por: row.autorizado_por || ''
    }
    await axios.post('http://localhost:5000/print-flujo', payload)
    $q.notify({ type: 'positive', message: 'Ticket enviado a impresora térmica', icon: 'print' })
  } catch (e) {
    console.error('Error al reimprimir', e)
    $q.notify({ type: 'warning', message: 'No se pudo conectar con la impresora local (XisPOS Bridge)' })
  }
}

onMounted(() => {
  fetchHistorial()
})
</script>
