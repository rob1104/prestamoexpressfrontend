<template>
  <q-page class="page-container q-pa-md">
    
    <!-- HEADER BAR -->
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-x-md">
        <div class="title-main text-primary text-h5 font-weight-bold">
          <q-icon name="history" size="md" class="q-mr-sm" />
          Historial del Cliente
        </div>
      </div>
      <div class="row items-center q-gutter-x-sm">
        <q-btn color="negative" icon="delete_sweep" label="Limpiar Datos" @click="limpiarDatos" outline />
        <q-btn color="secondary" icon="exit_to_app" label="F6 Salir" @click="$router.push('/')" outline />
      </div>
    </div>

    <!-- SEARCH BAR -->
    <q-card class="q-mb-md shadow-2" style="border-radius: 12px;">
      <q-card-section class="row items-center q-gutter-md">
        <div class="text-subtitle2 text-weight-bold">Tipo Consulta:</div>
        <q-select
          v-model="searchType"
          :options="['1. FOLIO', '2. FECHA BOLETA', '3. DESCRIPCION', '4. CLIENTE', '5. PRESTAMO', '6. NUMERO BOLSA']"
          outlined
          dense
          style="width: 200px"
          class="bg-white"
        />
        <div class="text-subtitle2 text-weight-bold">Buscar:</div>
        <q-input
          v-model="searchQuery"
          outlined
          dense
          autofocus
          placeholder="Escriba y presione Enter..."
          @keyup.enter="buscar"
          style="flex-grow: 1; max-width: 400px;"
          class="bg-white"
        >
          <template v-slot:append>
            <q-icon name="search" class="cursor-pointer" @click="buscar" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      
      <!-- LEFT SIDE: LIST OF FOLIOS -->
      <div class="col-12 col-md-3">
        <q-card class="shadow-2" style="border-radius: 12px; height: 100%;">
          <q-card-section class="bg-primary text-white q-py-sm">
            <div class="text-subtitle2 font-weight-bold">Folios Encontrados</div>
          </q-card-section>
          
          <q-card-section class="q-pa-none">
            <q-scroll-area style="height: 600px;">
              <q-list separator>
                <q-item
                  v-for="boleta in folios"
                  :key="boleta.id"
                  clickable
                  v-ripple
                  :active="selectedFolio === boleta.id"
                  active-class="bg-blue-1 text-primary text-weight-bold"
                  @click="seleccionarFolio(boleta.id)"
                >
                  <q-item-section avatar>
                    <q-icon name="receipt_long" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Folio: {{ boleta.id }}</q-item-label>
                    <q-item-label caption lines="1">{{ boleta.cliente?.nombre }} {{ boleta.cliente?.apellido_paterno }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :color="boleta.tipo_prestamo === 'pagos' ? 'green' : 'blue'">
                      {{ boleta.tipo_prestamo === 'pagos' ? 'PAGOS' : 'TRAD' }}
                    </q-badge>
                  </q-item-section>
                </q-item>
                
                <q-item v-if="folios.length === 0" class="text-center text-grey-6 q-py-xl">
                  <q-item-section>
                    <q-icon name="inbox" size="xl" class="q-mx-auto q-mb-sm" />
                    Sin resultados
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </div>

      <!-- RIGHT SIDE: TABS -->
      <div class="col-12 col-md-9">
        <q-card class="shadow-2 full-height" style="border-radius: 12px;" v-if="boletaActual">
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="datos" label="Datos Generales" />
            <q-tab name="historia" label="Historia General del Cliente" />
            <q-tab name="desglose" label="Desglose de Pagos" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            
            <!-- TAB: DATOS GENERALES -->
            <q-tab-panel name="datos" class="q-pa-md">
              <div class="row justify-between q-mb-md">
                <div class="text-subtitle1">
                  Cliente: <span class="text-weight-bold text-primary">{{ boletaActual.cliente?.nombre }} {{ boletaActual.cliente?.apellido_paterno }} {{ boletaActual.cliente?.apellido_materno }}</span>
                  <br>
                  Estatus: <q-badge color="orange" class="q-ml-sm">{{ boletaActual.estatus }}</q-badge>
                </div>
                <div class="text-h6 text-right text-primary font-weight-bold">
                  PRÉSTAMO {{ (boletaActual.tipo_prestamo || '').toUpperCase() }}
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-sm-6">
                  <q-card flat bordered class="q-pa-sm bg-grey-1">
                    <div class="row justify-between"><span class="text-grey-8">Folio:</span> <span class="text-weight-bold">{{ boletaActual.id }}</span></div>
                    <div class="row justify-between"><span class="text-grey-8">Clave:</span> <span class="text-weight-bold">{{ boletaActual.cliente_id }}</span></div>
                    <div class="row justify-between"><span class="text-grey-8">No. Bolsa:</span> <span class="text-weight-bold">{{ boletaActual.no_bolsa || 'N/A' }}</span></div>
                    <div class="row justify-between"><span class="text-grey-8">Identificación:</span> <span class="text-weight-bold">{{ boletaActual.cliente?.identificacion || 'NO PROPORCIONA' }}</span></div>
                    <div class="row justify-between"><span class="text-grey-8">Moneda:</span> <span class="text-weight-bold">MXN</span></div>
                    <div class="row justify-between"><span class="text-grey-8">Préstamo:</span> <span class="text-weight-bold text-green-8">{{ formatMoney(boletaActual.prestamo) }}</span></div>
                    <div class="row justify-between"><span class="text-grey-8">Abono a Capital:</span> <span class="text-weight-bold text-green-8">{{ formatMoney(boletaActual.pagos?.reduce((sum, p) => sum + (Number(p.prestamo) || 0), 0)) }}</span></div>
                  </q-card>
                </div>
                <div class="col-12 col-sm-6">
                  <q-card flat bordered class="q-pa-sm bg-grey-1">
                    <div class="row justify-between"><span class="text-grey-8">Plazo:</span> <span class="text-weight-bold">{{ boletaActual.tipo_prestamo === 'pagos' ? boletaActual.meses + ' MESES' : '30 DÍAS' }}</span></div>
                    <div class="row justify-between"><span class="text-grey-8">Tipo de Pago:</span> <span class="text-weight-bold">{{ (boletaActual.periodo || 'MENSUAL').toUpperCase() }}</span></div>
                    <div class="row justify-between"><span class="text-grey-8">Comisión:</span> <span class="text-weight-bold">{{ formatMoney(boletaActual.comision) }}</span></div>
                    <div class="row justify-between"><span class="text-grey-8">Categoría:</span> <span class="text-weight-bold">{{ boletaActual.categoria?.nombre || 'ORO' }}</span></div>
                    <div class="row justify-between"><span class="text-grey-8">Valuador:</span> <span class="text-weight-bold">{{ boletaActual.user?.name }}</span></div>
                    <div class="row justify-between"><span class="text-grey-8">Total a Pagar:</span> <span class="text-weight-bold text-primary">{{ formatMoney(boletaActual.total_pagar) }}</span></div>
                    <div class="row justify-between"><span class="text-grey-8">Vence:</span> <span class="text-weight-bold text-red">{{ formatDate(boletaActual.fecha_vencimiento) }}</span></div>
                  </q-card>
                </div>
              </div>

              <div class="q-mb-md">
                <div class="text-weight-bold text-subtitle2 q-mb-xs">Descripción:</div>
                <q-card flat bordered class="q-pa-sm bg-blue-grey-1">
                  <div v-for="p in boletaActual.partidas" :key="p.id">
                    {{ p.gramos_cantidad }}{{ p.tipo === 'moneda' ? ' pzs' : ' gr' }} {{ p.subtipo }} {{ p.descripcion }}
                  </div>
                </q-card>
              </div>

            </q-tab-panel>

            <!-- TAB: HISTORIA GENERAL DEL CLIENTE -->
            <q-tab-panel name="historia" class="q-pa-md">
              <div v-if="loadingStats" class="flex flex-center q-pa-xl">
                <q-spinner-dots color="primary" size="40px" />
              </div>
              <div v-else class="row q-col-gutter-lg">
                <!-- COLUMNA TRADICIONAL -->
                <div class="col-12 col-md-6">
                  <div class="text-h6 text-center text-primary q-mb-md">HISTORIA DE TRADICIONAL</div>
                  <q-list separator bordered class="bg-white" style="border-radius: 8px;">
                    <q-item>
                      <q-item-section>Prestamos Tradicionales</q-item-section>
                      <q-item-section side>{{ stats.tradicional?.prestamos }}</q-item-section>
                      <q-item-section side class="text-weight-bold">{{ formatMoney(stats.tradicional?.importe) }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Boletas Refrendadas</q-item-section>
                      <q-item-section side>{{ stats.tradicional?.refrendadas }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Boletas Desempeñadas</q-item-section>
                      <q-item-section side>{{ stats.tradicional?.desempenadas }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Adjudicaciones Reales</q-item-section>
                      <q-item-section side>{{ stats.tradicional?.adjudicaciones }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Adjudicaciones Físicas</q-item-section>
                      <q-item-section side>0</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>En Comercialización</q-item-section>
                      <q-item-section side>{{ stats.tradicional?.en_comercializacion }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Boletas Recuperadas</q-item-section>
                      <q-item-section side>0</q-item-section>
                    </q-item>
                    <q-item class="bg-blue-grey-1 text-weight-bold">
                      <q-item-section>Total de Préstamos Vigentes</q-item-section>
                      <q-item-section side>{{ stats.tradicional?.vigentes }}</q-item-section>
                    </q-item>
                    <q-item class="bg-grey-2">
                      <q-item-section class="text-weight-bold text-center">Historial de Pagos</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Total Pagado</q-item-section>
                      <q-item-section side class="text-green-8 text-weight-bold">{{ formatMoney(stats.tradicional?.total_pagado) }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Recargos</q-item-section>
                      <q-item-section side class="text-orange-8 text-weight-bold">{{ formatMoney(stats.tradicional?.recargos) }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Extemporáneos</q-item-section>
                      <q-item-section side class="text-red-8 text-weight-bold">{{ formatMoney(0) }}</q-item-section>
                    </q-item>
                  </q-list>
                </div>
                
                <!-- COLUMNA PAGOS -->
                <div class="col-12 col-md-6">
                  <div class="text-h6 text-center text-primary q-mb-md">HISTORIA DE PAGOS</div>
                  <q-list separator bordered class="bg-white" style="border-radius: 8px;">
                    <q-item>
                      <q-item-section>Prestamos en Pagos</q-item-section>
                      <q-item-section side>{{ stats.pagos?.prestamos }}</q-item-section>
                      <q-item-section side class="text-weight-bold">{{ formatMoney(stats.pagos?.importe) }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Préstamos Terminados</q-item-section>
                      <q-item-section side>{{ stats.pagos?.terminados }}</q-item-section>
                    </q-item>
                    <q-item class="bg-blue-grey-1 text-weight-bold">
                      <q-item-section>Pagos Vigentes</q-item-section>
                      <q-item-section side>{{ stats.pagos?.vigentes }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Adjudicaciones</q-item-section>
                      <q-item-section side>0</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>En Comercialización</q-item-section>
                      <q-item-section side>0</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Boletas Recuperadas</q-item-section>
                      <q-item-section side>0</q-item-section>
                    </q-item>
                    <q-item class="bg-grey-2">
                      <q-item-section class="text-weight-bold text-center">Historial de Pagos</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Total Pagado</q-item-section>
                      <q-item-section side class="text-green-8 text-weight-bold">{{ formatMoney(stats.pagos?.total_pagado) }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Recargos</q-item-section>
                      <q-item-section side class="text-orange-8 text-weight-bold">{{ formatMoney(stats.pagos?.recargos) }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Extemporáneos</q-item-section>
                      <q-item-section side class="text-red-8 text-weight-bold">{{ formatMoney(0) }}</q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </q-tab-panel>

            <!-- TAB: DESGLOSE DE PAGOS -->
            <q-tab-panel name="desglose" class="q-pa-md">
              <div class="row justify-between items-center q-mb-md">
                <div class="text-subtitle1 font-weight-bold">PAGOS REALIZADOS EN LA BOLETA</div>
                <q-btn 
                  color="primary" 
                  icon="print" 
                  label="Imprimir Desglose de Pagos" 
                  @click="imprimirReporte" 
                  unelevated 
                  class="shadow-1" 
                  style="border-radius: 8px;"
                />
              </div>

              <q-table
                :rows="boletaActual.pagos"
                :columns="columnsPagos"
                row-key="id"
                flat
                bordered
                dense
                :pagination="{ rowsPerPage: 10 }"
                class="bg-white"
              >
                <template v-slot:body-cell-fecha_pago="props">
                  <q-td :props="props">
                    {{ formatDate(props.row.fecha) }}
                  </q-td>
                </template>
                <template v-slot:body-cell-created_at="props">
                  <q-td :props="props">
                    {{ formatDate(props.row.created_at) }}
                  </q-td>
                </template>
                <template v-slot:body-cell-importe="props">
                  <q-td :props="props" class="text-weight-bold text-green-8">
                    {{ formatMoney(props.row.totalPagado) }}
                  </q-td>
                </template>
                <template v-slot:body-cell-recargos="props">
                  <q-td :props="props" class="text-orange-8">
                    {{ formatMoney(props.row.recargosNormal) }}
                  </q-td>
                </template>
                <template v-slot:body-cell-estatus="props">
                  <q-td :props="props">
                    <q-badge color="primary">{{ (props.row.tipo_movimiento || 'PAGO').substring(0, 2).toUpperCase() }}</q-badge>
                  </q-td>
                </template>
                <template v-slot:no-data>
                  <div class="full-width row flex-center text-grey q-pa-lg">
                    <q-icon size="2em" name="sentiment_dissatisfied" class="q-mr-sm" />
                    <span>NO HAY PAGOS REALIZADOS</span>
                  </div>
                </template>
              </q-table>
            </q-tab-panel>

          </q-tab-panels>
        </q-card>
        
        <!-- Vista vacía cuando no hay boleta seleccionada -->
        <q-card class="shadow-2 full-height flex flex-center bg-grey-2" style="border-radius: 12px; min-height: 400px;" v-else>
          <div class="text-center text-grey-6">
            <q-icon name="person_search" size="100px" />
            <div class="text-h6 q-mt-md">Seleccione un folio o busque un cliente</div>
          </div>
        </q-card>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date } from 'quasar'

const $q = useQuasar()
const searchType = ref('1. FOLIO')
const searchQuery = ref('')
const folios = ref([])
const selectedFolio = ref(null)
const boletaActual = ref(null)
const tab = ref('datos')
const stats = ref({})
const loadingStats = ref(false)

const columnsPagos = [
  { name: 'no_pago', label: 'NO. PAGO', align: 'left', field: (row, index) => (index + 1).toString().padStart(2, '0') },
  { name: 'fecha_pago', label: 'FECHA VENCE', align: 'left', field: 'fecha' },
  { name: 'importe', label: 'PAGO A REALIZAR / PAGO REALIZADO', align: 'right', field: 'totalPagado' },
  { name: 'created_at', label: 'FECHA PAGO', align: 'left', field: 'created_at' },
  { name: 'estatus', label: 'ESTATUS', align: 'center', field: 'tipo_movimiento' },
  { name: 'recargos', label: 'RECARGOS', align: 'right', field: 'recargosNormal' },
  { name: 'usuario', label: 'USUARIO', align: 'left', field: row => row.user?.name?.toUpperCase() || 'SISTEMA' },
]

const formatMoney = (val) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return date.formatDate(dateString, 'DD-MMM-YYYY').toUpperCase()
}

const limpiarDatos = () => {
  searchQuery.value = ''
  folios.value = []
  selectedFolio.value = null
  boletaActual.value = null
  tab.value = 'datos'
}

const buscar = async () => {
  if (!searchQuery.value.trim()) return

  $q.loading.show({ message: 'Buscando...' })
  try {
    const res = await api.get('/api/historial-cliente/buscar', {
      params: { tipo: searchType.value, query: searchQuery.value }
    })
    
    folios.value = res.data
    
    if (folios.value.length === 0) {
      $q.notify({ type: 'warning', message: 'No se encontraron elementos con los filtros seleccionados' })
      selectedFolio.value = null
      boletaActual.value = null
    } else if (folios.value.length === 1 && (searchType.value === '1. FOLIO' || searchType.value === '6. NUMERO BOLSA')) {
      // Auto seleccionar si es un solo folio
      seleccionarFolio(folios.value[0].id)
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al buscar' })
  } finally {
    $q.loading.hide()
  }
}

const seleccionarFolio = async (id) => {
  selectedFolio.value = id
  tab.value = 'datos' // Reset tab
  $q.loading.show({ message: 'Cargando detalles...' })
  try {
    const res = await api.get(`/api/historial-cliente/boleta/${id}`)
    boletaActual.value = res.data
    
    // Si tenemos la boleta, cargamos las estadísticas del cliente
    cargarEstadisticas(boletaActual.value.cliente_id)
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al obtener la boleta' })
  } finally {
    $q.loading.hide()
  }
}

const cargarEstadisticas = async (clienteId) => {
  loadingStats.value = true
  try {
    const res = await api.get(`/api/historial-cliente/estadisticas/${clienteId}`)
    stats.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loadingStats.value = false
  }
}

const imprimirReporte = async () => {
  if (!boletaActual.value) return
  try {
    $q.loading.show({ message: 'Generando PDF...' })
    const res = await api.get(`/api/historial-cliente/boleta/${boletaActual.value.id}/pdf-url`)
    if (res.data.url) {
      // Abrimos el PDF en una nueva pestaña (Stream)
      window.open(res.data.url, '_blank')
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al generar el PDF' })
  } finally {
    $q.loading.hide()
  }
}

</script>

<style scoped>
.title-main {
  font-size: 1.5rem;
  letter-spacing: -0.5px;
}
</style>
