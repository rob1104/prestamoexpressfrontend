<template>
  <q-page class="q-pa-md bg-blue-grey-1 column no-wrap">

    <q-card flat class="bg-primary text-white shadow-4 q-mb-md border-radius-lg">
      <q-card-section class="row items-center justify-between q-col-gutter-md q-pa-md">

        <div class="col-12 col-md-auto row items-center">
          <div class="icon-box q-mr-sm flex flex-center">
            <q-icon name="folder_special" size="sm" color="white" />
          </div>
          <div>
            <div class="text-h6 text-weight-bolder tracking-tight" style="line-height: 1.2;">Gestión de Boletas</div>
            <div class="text-caption text-white" style="opacity: 0.85;">Administración e historial de préstamos</div>
          </div>
        </div>

        <div class="col-12 col-md row items-center justify-end q-gutter-x-md q-gutter-y-sm">

          <q-btn
            color="blue-5"
            text-color="white"
            unelevated
            class="shadow-1 text-weight-bold"
            label="Folio"
            @click="abrirBuscadorFolio"
          >
            <q-tooltip>Buscar boleta por número exacto</q-tooltip>
          </q-btn>

          <div class="bg-white rounded-borders q-pa-xs shadow-1 text-primary">
            <q-option-group
              v-model="filtros.tipos"
              :options="opcionesTipo"
              type="checkbox"
              inline
              color="primary"
              class="text-weight-bold text-caption"
            />
          </div>

          <q-input
            v-model="textoRangoFechas"
            outlined dense readonly
            bg-color="white"
            placeholder="Filtrar por fecha..."
            style="min-width: 230px;"
          >
            <template v-slot:prepend>
              <q-icon name="calendar_month" color="primary" class="cursor-pointer">
                <q-popup-proxy ref="popupFechaRef" cover transition-show="jump-down" transition-hide="jump-up">
                  <q-date
                    v-model="filtros.rangoFechas"
                    range
                    mask="YYYY-MM-DD"
                    color="primary"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
            <template v-slot:append v-if="filtros.rangoFechas">
              <q-icon name="cancel" size="xs" class="cursor-pointer text-grey-5 hover-text-primary" @click="filtros.rangoFechas = null" />
            </template>
          </q-input>

          <q-input
            v-model="filtros.search"
            outlined dense
            bg-color="white"
            placeholder="Buscar folio o cliente..."
            style="min-width: 250px;"
            @update:model-value="onSearchInput"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>

        </div>
      </q-card-section>
    </q-card>

    <div v-if="folioActivo" class="q-mb-sm row items-center animate__animated animate__fadeIn">
      <q-chip
        removable
        @remove="limpiarFolio"
        color="orange-9"
        text-color="white"
        icon="saved_search"
        class="text-weight-bold shadow-2"
      >
        Mostrando únicamente el folio: {{ folioActivo }}
      </q-chip>
    </div>

    <q-card flat class="col shadow-4 card-table border-radius-lg bg-white column no-wrap">
      <q-table
        :rows="boletas"
        :columns="columnas"
        row-key="id"
        :loading="cargando"
        v-model:pagination="paginacion"
        @request="onRequest"
        flat
        dense
        class="tabla-boletas col custom-scroll"
        table-header-class="bg-grey-1 text-grey-8 text-weight-bolder uppercase"
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary" label="Cargando boletas..." label-class="text-weight-bold" />
        </template>

        <template v-slot:body-cell-id="props">
          <q-td :props="props">
            <span class="text-weight-bolder text-h6 text-blue-grey-9 font-mono">{{ props.row.id }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-fecha="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-icon name="event" size="xs" color="grey-5" class="q-mr-xs" />
              <span class="text-weight-medium text-blue-grey-8">{{ props.value }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-cliente="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="sm" color="blue-grey-1" text-color="blue-grey-7" class="q-mr-sm text-weight-bold border-avatar">
                {{ props.row.cliente?.id?.toString() || '??' }}
              </q-avatar>
              <div class="text-weight-bold text-blue-grey-9 text-body2">
                {{ props.row.cliente ? `${props.row.cliente.nombre}` : 'Desconocido' }}
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-chip
              :color="props.row.tipo_prestamo === 'tradicional' ? 'indigo-1' : 'teal-1'"
              :text-color="props.row.tipo_prestamo === 'tradicional' ? 'indigo-9' : 'teal-9'"
              size="sm" class="text-weight-bold uppercase"
              :icon="props.row.tipo_prestamo === 'tradicional' ? 'account_balance' : 'date_range'"
            >
              {{ props.row.tipo_prestamo }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-prestamo="props">
          <q-td :props="props" class="text-right">
            <div class="text-h6 text-weight-bolder text-green-9 font-mono">
              <span class="text-caption text-grey-5 q-mr-xs">$</span>{{ formatMoney(props.row.prestamo) }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-estatus="props">
          <q-td :props="props">
            <q-badge
              outline
              :color="configEstatus(props.row.estatus).color"
              class="q-pa-xs q-px-sm text-weight-bold"
            >
              <q-icon :name="configEstatus(props.row.estatus).icon" size="xs" class="q-mr-xs" />
              {{ configEstatus(props.row.estatus).label }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="q-gutter-x-sm text-center">
            <q-btn
              flat round dense
              color="blue-7"
              icon="visibility"
              class="btn-accion bg-blue-1"
              @click="verDetalles(props.row.id)"
            >
              <q-tooltip class="bg-blue-9 text-weight-bold">Ver Detalles</q-tooltip>
            </q-btn>
            <q-btn
              flat round dense
              color="red-7"
              icon="picture_as_pdf"
              class="btn-accion bg-red-1"
              @click="descargarPDF(props.row.id)"
            >
              <q-tooltip class="bg-red-9 text-weight-bold">Descargar PDF</q-tooltip>
            </q-btn>
            </q-td>
        </template>

      </q-table>
    </q-card>
    <q-dialog v-model="dialogDetalles" transition-show="scale" transition-hide="scale">
      <ComponenteBoletaDetalles :boletaId="boletaSeleccionadaId" v-if="boletaSeleccionadaId" />
    </q-dialog>
    <q-dialog v-model="dialogoFolio" position="top">
      <q-card style="width: 350px; margin-top: 100px;" class="border-radius-lg shadow-10">
        <q-card-section class="bg-primary text-white row items-center q-pb-md">

          <div class="text-h6 text-weight-bold">Buscar Folio</div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-input
            v-model="inputFolio"
            type="number"
            autofocus
            outlined
            label="Número de Boleta"
            color="primary"
            class="text-h6 text-center"
            @keyup.enter="ejecutarBusquedaFolio"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup class="text-weight-bold" />
          <q-btn unelevated label="Buscar" color="primary" @click="ejecutarBusquedaFolio" class="text-weight-bold q-px-md" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
  import { ref, onMounted, watch, computed } from 'vue'
  import { api } from 'boot/axios'
  import { useQuasar, date } from 'quasar'

  import ComponenteBoletaDetalles from 'components/Boletas/ComponenteBoletaDetalles.vue'

  const $q = useQuasar()

  const cargando = ref(false)
  const boletas = ref([])
  const timeoutBusqueda = ref(null)
  const popupFechaRef = ref(null)

  const dialogDetalles = ref(false)
  const boletaSeleccionadaId = ref(null)

  const dialogoFolio = ref(false)
  const inputFolio = ref('')
  const folioActivo = ref(null)

  const abrirBuscadorFolio = () => {
    inputFolio.value = ''
    dialogoFolio.value = true
  }

  const ejecutarBusquedaFolio = () => {
    if (!inputFolio.value) return
    folioActivo.value = inputFolio.value
    paginacion.value.page = 1
    dialogoFolio.value = false
    cargarBoletas()
  }

  const limpiarFolio = () => {
    folioActivo.value = null
    paginacion.value.page = 1
    cargarBoletas()
  }

  const verDetalles = (id) => {
    boletaSeleccionadaId.value = id
    dialogDetalles.value = true
  }

  const filtros = ref({
    search: '',
    tipos: ['tradicional', 'pagos'],
    rangoFechas: null
  })

  const opcionesTipo = [
    { label: 'Tradicional', value: 'tradicional' },
    { label: 'En Pagos', value: 'pagos' }
  ]

  const paginacion = ref({
    sortBy: 'id',
    descending: true,
    page: 1,
    rowsPerPage: 50,
    rowsNumber: 0
  })

  const textoRangoFechas = computed(() => {
    if (!filtros.value.rangoFechas) return ''
    if (typeof filtros.value.rangoFechas === 'string') return filtros.value.rangoFechas
    return `${filtros.value.rangoFechas.from} a ${filtros.value.rangoFechas.to}`
  })

  let tiposAnteriores = ['tradicional', 'pagos']

  watch(() => filtros.value.tipos, (nuevosTipos) => {
    if (nuevosTipos.length === 0) {
      $q.notify({ type: 'warning', message: 'Debe mostrar al menos un tipo de boleta.', timeout: 2000 })
      filtros.value.tipos = [...tiposAnteriores]
      return;
    }
    tiposAnteriores = [...nuevosTipos]
    paginacion.value.page = 1
    cargarBoletas()
  })

  watch(() => filtros.value.rangoFechas, (nuevoRango) => {
    paginacion.value.page = 1
    cargarBoletas()
    if (nuevoRango && typeof nuevoRango === 'object' && nuevoRango.from && nuevoRango.to) {
      if (popupFechaRef.value) popupFechaRef.value.hide()
    }
  })

  // --- COLUMNAS DE LA TABLA ---
  const columnas = [
    { name: 'id', label: 'FOLIO', field: 'id', align: 'left', sortable: true },
    { name: 'fecha', label: 'FECHA', field: row => formatDate(row.fecha_boleta), align: 'left' },
    { name: 'cliente', label: 'CLIENTE', field: 'cliente', align: 'left' },
    { name: 'tipo', label: 'MODALIDAD', field: 'tipo_prestamo', align: 'center' },
    { name: 'prestamo', label: 'IMPORTE', field: 'prestamo', align: 'right' },
    { name: 'estatus', label: 'ESTATUS', field: 'estatus', align: 'center' },
    { name: 'acciones', label: 'ACCIONES', align: 'center' }
  ]

  // --- UTILIDADES Y CONFIGURACIÓN VISUAL ---
  const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const formatDate = (fecha) => date.formatDate(fecha, 'DD MMM YYYY').toUpperCase()

  // Mapeo profesional de estatus basado en el Enum de tu BD
  const configEstatus = (estatus) => {
    const config = {
      'PE': { label: 'PENDIENTE', color: 'orange-8', icon: 'schedule' },
      'LI': { label: 'LIQUIDADA', color: 'green-7', icon: 'check_circle' },
      'RE': { label: 'REFRENDADA', color: 'blue-7', icon: 'autorenew' },
      'CA': { label: 'CANCELADA', color: 'red-7', icon: 'cancel' },
      'EN': { label: 'ENAjenADA', color: 'purple-7', icon: 'gavel' },
      'CF': { label: 'CONFISCADA', color: 'brown-7', icon: 'warning' },
      'AC': { label: 'ACTIVA', color: 'cyan-7', icon: 'play_circle' },
      'CV': { label: 'VENCIDA', color: 'deep-orange-7', icon: 'event_busy' }
    }
    return config[estatus] || { label: estatus, color: 'grey-7', icon: 'label' }
  }

  // --- LÓGICA DE DATOS ---
  const cargarBoletas = async (props = null) => {
    cargando.value = true

    if (props && props.pagination) paginacion.value = props.pagination

    let fecha_inicio = null;
    let fecha_fin = null;

    if (filtros.value.rangoFechas) {
      if (typeof filtros.value.rangoFechas === 'string') {
        fecha_inicio = filtros.value.rangoFechas;
        fecha_fin = filtros.value.rangoFechas;
      } else {
        fecha_inicio = filtros.value.rangoFechas.from;
        fecha_fin = filtros.value.rangoFechas.to;
      }
    }

    try {
      const res = await api.get('/api/boletas', {
        params: {
          page: paginacion.value.page,
          rowsPerPage: paginacion.value.rowsPerPage,
          sortBy: paginacion.value.sortBy,
          descending: paginacion.value.descending,
          search: filtros.value.search,
          tipos: filtros.value.tipos,
          fecha_inicio: fecha_inicio,
          fecha_fin: fecha_fin,
          folio_exacto: folioActivo.value
        }
      })
      boletas.value = res.data.data
      paginacion.value.rowsNumber = res.data.total
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al cargar las boletas' })
    } finally {
      cargando.value = false
    }
  }

  const onRequest = (props) => cargarBoletas(props)

  const onSearchInput = () => {
    clearTimeout(timeoutBusqueda.value)
    timeoutBusqueda.value = setTimeout(() => {
      paginacion.value.page = 1
      cargarBoletas()
    }, 500)
  }

  const descargarPDF = async (id) => {
    $q.loading.show({ message: 'Generando PDF...' })
    try {
      const res = await api.get(`/api/boletas/${id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Boleta_XisPOS_${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      $q.notify({ type: 'positive', message: 'Descarga finalizada', icon: 'download_done' })
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al generar el PDF' })
    } finally {
      $q.loading.hide()
    }
  }

  onMounted(() => cargarBoletas())
</script>

<style lang="scss" scoped>

  .border-radius-lg {
    border-radius: 12px;
  }

  .icon-box {
    background: rgba(255, 255, 255, 0.15);
    padding: 10px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .tracking-tight { letter-spacing: -0.5px; }
  .hover-text-primary:hover { color: var(--q-primary) !important; }

  /* --- TABLA LIMPIA Y CLARA --- */
  .card-table {
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    overflow: hidden;
  }

  .tabla-boletas {
    /* Diseño de filas de tabla */
    :deep(tbody tr) {
      transition: background-color 0.2s ease;
      &:hover { background-color: #f4f6f8 !important; }
    }
    :deep(th) { font-size: 0.8rem; letter-spacing: 0.5px; }
    :deep(td) { padding: 10px 16px; border-bottom: 1px solid #f0f0f0; }
  }

  .font-mono {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    letter-spacing: -0.5px;
  }

  .border-avatar { border: 1px solid #cfd8dc; }

  .btn-accion {
    transition: transform 0.2s ease;
    &:hover { transform: scale(1.1); }
  }

  .uppercase { text-transform: uppercase; }

  /* Scrollbar sutil para la tabla */
  .custom-scroll {
    &::-webkit-scrollbar { width: 8px; height: 8px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: #b0bec5; border-radius: 4px; }
    &::-webkit-scrollbar-thumb:hover { background: #90a4ae; }
  }
</style>
