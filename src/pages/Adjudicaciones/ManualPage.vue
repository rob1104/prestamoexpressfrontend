<template>
  <q-page class="q-pa-sm bg-blue-grey-1">
    <div class="row items-center justify-between q-mb-sm">
      <div class="text-h5 text-weight-bolder text-primary flex items-center">
        <q-icon name="gavel" size="md" class="q-mr-sm" />
        Historial de Adjudicaciones
      </div>
      <q-btn
        color="positive"
        icon="add"
        label="Adjudicación Manual"
        @click="abrirModal(false)"
        class="shadow-2 font-bold"
      />
    </div>

    <!-- TABLA DE ADJUDICACIONES -->
    <q-card flat bordered class="bg-white">
      <q-table
        :rows="adjudicaciones"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :loading="loading"
        :filter="filter"
        separator="cell"
      >
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Buscar">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        
        <template v-slot:body-cell-monto_adjudicado="props">
          <q-td :props="props" class="text-weight-bold text-primary">
            $ {{ formatMoney(props.row.monto_adjudicado) }}
          </q-td>
        </template>
        
        <template v-slot:body-cell-fecha_adjudicacion="props">
          <q-td :props="props">
            {{ formatFecha(props.row.fecha_adjudicacion) }}
          </q-td>
        </template>
        
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-center">
            <q-btn
              flat round dense color="primary" icon="visibility"
              @click="verDetallesBoleta(props.row.folio_boleta)"
            >
              <q-tooltip>Ver Detalles Boleta</q-tooltip>
            </q-btn>
            <q-btn
              flat round dense color="negative" icon="undo"
              @click="revertirAdjudicacion(props.row)"
            >
              <q-tooltip>Revertir Adjudicación</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- MODAL DE NUEVA ADJUDICACION MANUAL -->
    <q-dialog v-model="modalOpen" persistent transition-show="scale" transition-hide="scale">
      <q-card class="bg-grey-2 column" style="width: 850px; max-width: 95vw; max-height: 90vh;">
        
        <!-- HEADER / TOOLBAR AL ESTILO SICAE -->
        <div class="row q-col-gutter-xs bg-primary border-bottom q-pa-xs items-center shadow-1 text-white">
          <div class="col-auto row q-gutter-xs">
            <q-btn v-if="!modoVistaDetalle" flat dense color="white" icon="save" label="F6 Confirmar" @click="confirmarAdjudicacion" :disable="!boletaSeleccionada" class="btn-sicae" stack />
            <q-btn v-if="!modoVistaDetalle" flat dense color="white" icon="refresh" label="F7 Limpiar Datos" @click="resetFormulario" class="btn-sicae" stack />
            <q-btn flat dense color="white" icon="logout" label="F9 Salir" v-close-popup class="btn-sicae" stack />
          </div>
          <q-space />
          <div class="text-h6 text-weight-bolder text-italic q-mr-md tracking-tighter uppercase">
            {{ modoVistaDetalle ? 'Detalles de la Boleta' : 'Adjudicación Manual' }}
          </div>
        </div>

        <q-card-section class="col q-pa-sm scroll">
          
          <!-- BÚSQUEDA Y FECHA -->
          <q-card flat bordered class="q-mb-sm bg-white">
            <q-card-section class="q-pa-sm row items-center">
              <div class="col-12 col-md-4 row items-center no-wrap">
                <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right" style="width: 80px;">Folio Boleta:</div>
                <q-input
                  autofocus
                  v-model="busquedaFolio"
                  outlined dense
                  :readonly="modoVistaDetalle"
                  placeholder="Ingrese el folio y presione Enter..."
                  class="col input-premium-compact"
                  input-class="text-weight-bolder text-primary text-right"
                  @keyup.enter="buscarBoleta"
                  mask="#########"
                  unmasked-value
                />
              </div>
              <div class="col-12 col-md-8 row items-center no-wrap q-pl-md">
                <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right" style="width: 140px;">Fecha de Adjudicación:</div>
                <q-input
                  v-model="fechaActualVisual"
                  outlined dense readonly
                  class="col input-premium-compact bg-grey-2 text-weight-bold"
                  input-class="text-weight-bolder"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- ADVERTENCIAS -->
          <div v-if="advertencias.length > 0 && !modoVistaDetalle" class="q-mb-sm bg-orange-1 q-pa-sm border-left-orange shadow-1">
            <div class="text-orange-9 text-weight-bold flex items-center q-mb-xs">
              <q-icon name="warning" size="sm" class="q-mr-sm" />
              ATENCIÓN: La boleta no cumple las condiciones ideales
            </div>
            <ul class="q-pl-md q-my-none text-caption text-orange-10 text-weight-bold">
              <li v-for="(adv, i) in advertencias" :key="i">{{ adv }}</li>
            </ul>
          </div>

          <!-- INFO PRINCIPAL -->
          <q-card flat bordered class="q-mb-sm bg-white">
            <q-card-section class="q-pa-sm">
              <!-- Cliente -->
              <div class="row items-center q-mb-xs">
                <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right">Cliente:</div>
                <q-input
                  v-model="datos.cliente"
                  outlined dense readonly
                  class="col input-premium-compact bg-grey-1"
                  input-class="text-weight-bolder text-uppercase"
                />
                <q-input
                  v-model="datos.cliente_id"
                  outlined dense readonly
                  class="input-premium-compact bg-grey-1 q-ml-sm"
                  style="width: 80px;"
                  input-class="text-weight-bolder text-center"
                />
              </div>

              <!-- Identificación -->
              <div class="row items-center q-mb-xs">
                <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right">Identificación:</div>
                <q-input
                  v-model="datos.identificacion"
                  outlined dense readonly
                  class="col input-premium-compact bg-grey-1"
                  input-class="text-weight-bolder text-uppercase"
                />
              </div>

              <!-- Fila 3: No. Bolsa, Préstamo, Número de Pagos, Tipo de Pago -->
              <div class="row items-center q-mb-xs q-col-gutter-xs">
                <div class="col row items-center no-wrap">
                  <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right">No. Bolsa:</div>
                  <q-input v-model="datos.bolsa" outlined dense readonly class="col input-premium-compact bg-grey-1" input-class="text-weight-bolder text-uppercase" />
                </div>
                <div class="col row items-center no-wrap">
                  <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right" style="width: 60px;">Préstamo:</div>
                  <q-input v-model="datos.prestamo_txt" outlined dense readonly class="col input-premium-compact bg-grey-1" input-class="text-weight-bolder text-right" />
                </div>
                <div class="col row items-center no-wrap">
                  <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right" style="width: 110px;">Número de Pagos:</div>
                  <q-input v-model="datos.num_pagos" outlined dense readonly class="col input-premium-compact bg-grey-1" input-class="text-weight-bolder text-center" />
                </div>
                <div class="col row items-center no-wrap">
                  <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right" style="width: 90px;">Tipo de Pago:</div>
                  <q-input v-model="datos.tipo_pago" outlined dense readonly class="col input-premium-compact bg-grey-1" input-class="text-weight-bolder text-uppercase" />
                </div>
              </div>

              <!-- Fila 4: Plazo, Fecha, Categoría -->
              <div class="row items-center q-mb-xs q-col-gutter-xs">
                <div class="col row items-center no-wrap">
                  <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right">Plazo:</div>
                  <q-input v-model="datos.plazo" outlined dense readonly class="col input-premium-compact bg-grey-1" input-class="text-weight-bolder text-uppercase" />
                </div>
                <div class="col row items-center no-wrap">
                  <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right" style="width: 60px;">Fecha:</div>
                  <q-input v-model="datos.fecha" outlined dense readonly class="col input-premium-compact bg-grey-1" input-class="text-weight-bolder text-center" />
                </div>
                <div class="col-6 row items-center no-wrap">
                  <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right" style="width: 70px;">Categoría:</div>
                  <q-input v-model="datos.categoria" outlined dense readonly class="col input-premium-compact bg-grey-1" input-class="text-weight-bolder text-uppercase" />
                </div>
              </div>

              <!-- Fila 5: Boleta, Estatus, Días Vencidos -->
              <div class="row items-center q-mb-xs q-col-gutter-xs">
                <div class="col-4 row items-center no-wrap">
                  <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right">Boleta:</div>
                  <q-input v-model="datos.reportada" outlined dense readonly class="col input-premium-compact bg-grey-1" input-class="text-weight-bolder text-uppercase" />
                </div>
                <div class="col-4 row items-center no-wrap">
                  <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right" style="width: 60px;">Estatus:</div>
                  <q-input v-model="datos.estatus" outlined dense readonly class="col input-premium-compact bg-grey-1" input-class="text-weight-bolder text-uppercase" />
                </div>
                <div class="col-4 row items-center no-wrap">
                  <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right">Días Vencidos:</div>
                  <q-input v-model="datos.dias_vencidos" outlined dense readonly class="col input-premium-compact bg-grey-1" input-class="text-weight-bolder text-center" style="width: 100px;" />
                  <q-space />
                </div>
              </div>

              <!-- Fila 6: Descripción -->
              <div class="row items-start q-mb-xs q-mt-sm">
                <div class="label-fixed-mov text-weight-bold q-mr-sm text-blue-grey-8 text-right q-pt-xs">Descripción:</div>
                <q-input
                  v-model="datos.descripcion"
                  outlined dense readonly type="textarea"
                  class="col input-premium-compact bg-grey-1"
                  input-class="text-weight-bolder text-uppercase font-mono"
                  rows="4"
                />
              </div>

            </q-card-section>
          </q-card>

          <!-- TABLA DE MOVIMIENTOS -->
          <q-card flat bordered class="bg-white q-mb-md">
            <q-markup-table flat dense bordered separator="cell" class="table-sicae-mov">
              <thead class="bg-primary text-white">
                <tr>
                  <th class="text-center" style="width: 40px;"></th>
                  <th class="text-center">{{ datos.es_tradicional ? 'Refrendo' : 'Pago' }}</th>
                  <th class="text-center">Fecha Vence</th>
                  <th class="text-right">Pago por Realizar</th>
                  <th class="text-center">Fecha Pago</th>
                  <th class="text-right">Pago Realizado</th>
                  <th class="text-center">Días Ven.</th>
                  <th class="text-left">Usuario</th>
                </tr>
              </thead>
              <tbody class="bg-white">
                <tr v-for="(mov, i) in tablaMovimientos" :key="i">
                  <td class="text-center">
                    <q-icon v-if="i === 0 && !mov.fecha_pago" name="play_arrow" size="xs" />
                  </td>
                  <td class="text-center font-mono">{{ mov.numero }}</td>
                  <td class="text-center">{{ formatFechaCorta(mov.fecha_vence) }}</td>
                  <td class="text-right">$ {{ formatMoney(mov.pago_realizar) }}</td>
                  <td class="text-center">{{ mov.fecha_pago ? formatFechaCorta(mov.fecha_pago) : '' }}</td>
                  <td class="text-right">$ {{ formatMoney(mov.pago_realizado) }}</td>
                  <td class="text-center">{{ mov.dias_vencidos }}</td>
                  <td class="text-left">{{ mov.usuario }}</td>
                </tr>
                <tr v-if="tablaMovimientos.length === 0">
                  <td colspan="8" class="text-center text-grey-6 italic">Sin movimientos para mostrar</td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-card>
          
          <div v-if="boletaSeleccionada" class="row justify-end q-mt-md q-mr-md q-mb-lg">
            <div class="text-h6 text-weight-bolder text-orange-10 uppercase" style="letter-spacing: 2px;">
              Préstamo {{ datos.es_tradicional ? 'T R A D I C I O N A L' : 'en P A G O S' }}
            </div>
          </div>

        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date } from 'quasar'

const $q = useQuasar()

const adjudicaciones = ref([])
const loading = ref(false)
const filter = ref('')
const modalOpen = ref(false)
const modoVistaDetalle = ref(false)

const busquedaFolio = ref('')
const boletaSeleccionada = ref(null)
const advertencias = ref([])

// Formato local para mostrar en pantalla la fecha actual
const fechaActualVisual = computed(() => {
  const d = new Date()
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  return `${dias[d.getDay()]}, ${meses[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')} ${d.getFullYear()}`
})

const datos = ref({
  cliente: '',
  cliente_id: '',
  identificacion: '',
  bolsa: '',
  prestamo_txt: '',
  num_pagos: '',
  tipo_pago: '',
  plazo: '',
  fecha: '',
  categoria: '',
  reportada: '',
  estatus: '',
  dias_vencidos: '',
  descripcion: '',
  es_tradicional: true
})

const tablaMovimientos = ref([])

const columns = [
  { name: 'folio_boleta', align: 'left', label: 'Folio Boleta', field: 'folio_boleta', sortable: true },
  { name: 'cliente_nombre', align: 'left', label: 'Cliente', field: 'cliente_nombre', sortable: true },
  { name: 'fecha_adjudicacion', align: 'center', label: 'Fecha Adjudicación', field: 'fecha_adjudicacion', sortable: true },
  { name: 'monto_adjudicado', align: 'right', label: 'Monto Absorbido', field: 'monto_adjudicado', sortable: true },
  { name: 'usuario', align: 'left', label: 'Realizado Por', field: 'usuario', sortable: true },
  { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones' }
]

const cargarAdjudicaciones = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/api/adjudicaciones')
    adjudicaciones.value = data
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error cargando historial de adjudicaciones.' })
  } finally {
    loading.value = false
  }
}

const abrirModal = (esDetalle = false) => {
  resetFormulario()
  modoVistaDetalle.value = esDetalle
  modalOpen.value = true
}

const resetFormulario = () => {
  busquedaFolio.value = ''
  boletaSeleccionada.value = null
  advertencias.value = []
  tablaMovimientos.value = []
  datos.value = {
    cliente: '', cliente_id: '', identificacion: '', bolsa: '', prestamo_txt: '',
    num_pagos: '', tipo_pago: '', plazo: '', fecha: '', categoria: '', reportada: '',
    estatus: '', dias_vencidos: '', descripcion: '', es_tradicional: true
  }
}

const buscarBoleta = async () => {
  if (!busquedaFolio.value) return
  
  $q.loading.show()
  try {
    const query = modoVistaDetalle.value ? '?modo_detalle=true' : '?modo_detalle=false'
    const { data } = await api.get(`/api/adjudicaciones/buscar/${busquedaFolio.value}${query}`)
    
    const bol = data.boleta
    boletaSeleccionada.value = bol
    advertencias.value = data.advertencias || []
    
    // Rellenar datos
    datos.value.cliente = bol.cliente?.nombre || ''
    datos.value.cliente_id = bol.cliente_id || ''
    datos.value.identificacion = bol.cliente?.identificacion || 'N/A'
    datos.value.bolsa = bol.no_bolsa || '0'
    datos.value.prestamo_txt = `$${formatMoney(bol.prestamo)}`
    
    datos.value.es_tradicional = bol.tipo_prestamo === 'tradicional'
    
    if (datos.value.es_tradicional) {
      datos.value.num_pagos = '1'
      datos.value.tipo_pago = 'MENSUAL'
      datos.value.plazo = '30 DIAS'
    } else {
      datos.value.num_pagos = String(bol.numero_pagos || 1)
      datos.value.tipo_pago = (bol.periodo === 7 ? 'SEMANAL' : (bol.periodo === 15 ? 'QUINCENAL' : 'MENSUAL'))
      datos.value.plazo = `${bol.meses || 1} MESES`
    }

    datos.value.fecha = formatFechaCorta(bol.fecha_boleta)
    datos.value.categoria = bol.categoria?.nombre || 'GENERAL'
    datos.value.reportada = bol.reporteActivo ? 'REPORTADA' : 'NO REPORTADA'
    
    const estatusMap = { 'PE': 'NO PAGADA', 'LI': 'LIQUIDADA', 'CA': 'CANCELADA', 'EN': 'ADJUDICADA' }
    datos.value.estatus = estatusMap[bol.estatus] || bol.estatus
    
    datos.value.dias_vencidos = String(data.dias_vencidos || 0)
    datos.value.descripcion = (bol.partidas || []).map(p => p.descripcion).join('\n')

    // Construir tablaMovimientos
    tablaMovimientos.value = []
    
    if (datos.value.es_tradicional) {
      // Si es tradicional, mostramos refrendos. El pago 0 es el inicial o el último refrendo.
      // Para asimilarlo a la imagen, podemos mostrar los periodos.
      let num = 0
      
      // Historial de refrendos
      if (bol.tradicional && bol.tradicional.length > 0) {
        bol.tradicional.forEach(tr => {
          tablaMovimientos.value.push({
            numero: String(num).padStart(2, '0'),
            fecha_vence: tr.fecha_vencimiento_anterior || bol.fecha_boleta,
            pago_realizar: tr.interes_pagado,
            fecha_pago: tr.fecha_movimiento,
            pago_realizado: tr.interes_pagado,
            dias_vencidos: 0,
            usuario: tr.user?.name || 'SISTEMA'
          })
          num++
        })
      }
      
      // Fila pendiente
      tablaMovimientos.value.push({
        numero: String(num).padStart(2, '0'),
        fecha_vence: bol.fecha_vencimiento,
        pago_realizar: bol.prestamo,
        fecha_pago: null,
        pago_realizado: 0,
        dias_vencidos: data.dias_vencidos || 0,
        usuario: ''
      })
    } else {
      // Préstamo en PAGOS:
      // Fila 0: El préstamo inicial (similar a la foto)
      tablaMovimientos.value.push({
        numero: '00',
        fecha_vence: bol.fecha_boleta,
        pago_realizar: 0,
        fecha_pago: bol.fecha_boleta,
        pago_realizado: bol.prestamo,
        dias_vencidos: 0,
        usuario: bol.user?.name || ''
      })
      
      // Pagos del calendario
      if (bol.calendarioPagos && bol.calendarioPagos.length > 0) {
        bol.calendarioPagos.forEach(cp => {
          tablaMovimientos.value.push({
            numero: String(cp.num_pago).padStart(2, '0'),
            fecha_vence: cp.fecha_vencimiento,
            pago_realizar: cp.monto_pago,
            fecha_pago: cp.estatus === 'PA' ? cp.fecha_pago : null,
            pago_realizado: cp.estatus === 'PA' ? cp.monto_pago : 0,
            dias_vencidos: cp.estatus === 'PE' ? 
              (new Date() > new Date(cp.fecha_vencimiento) ? 
                Math.floor((new Date() - new Date(cp.fecha_vencimiento)) / (1000 * 60 * 60 * 24)) : 0) 
              : 0,
            usuario: ''
          })
        })
      }
    }

    if (advertencias.value.length > 0) {
      $q.notify({ type: 'warning', message: 'Revisar advertencias.', position: 'top', timeout: 3000 })
    }
  } catch (error) {
    boletaSeleccionada.value = null
    tablaMovimientos.value = []
    const msj = error.response?.data?.message || 'Error de conexión'
    $q.notify({ type: 'negative', message: msj })
  } finally {
    $q.loading.hide()
  }
}

const confirmarAdjudicacion = () => {
  if (!boletaSeleccionada.value) return
  
  let titulo = '¿Confirmar Adjudicación Manual?'
  let mensaje = `Va a adjudicar la boleta <b>${boletaSeleccionada.value.id}</b> del cliente <b>${boletaSeleccionada.value.cliente?.nombre}</b>.`
  
  if (advertencias.value.length > 0) {
    titulo = '<span class="text-negative">CONFIRMACIÓN FORZADA (MANUAL)</span>'
    mensaje += '<br><br><span class="text-negative text-weight-bold">ADVERTENCIA:</span> Esta boleta no cumple las condiciones habituales. ¿Está completamente seguro de forzar la adjudicación?'
  }

  $q.dialog({
    title: titulo,
    message: mensaje,
    html: true,
    cancel: true,
    persistent: true,
    ok: {
      color: advertencias.value.length > 0 ? 'negative' : 'primary',
      label: 'Sí, Adjudicar'
    }
  }).onOk(async () => {
    $q.loading.show({ message: 'Procesando Adjudicación...' })
    try {
      await api.post('/api/adjudicaciones/manual', {
        boleta_id: boletaSeleccionada.value.id,
        monto_adjudicado: boletaSeleccionada.value.prestamo,
        observaciones: 'Adjudicacion Manual'
      })
      
      $q.notify({ type: 'positive', message: 'Boleta Adjudicada Exitosamente.' })
      modalOpen.value = false
      cargarAdjudicaciones()
    } catch (error) {
      const msj = error.response?.data?.message || 'Error al procesar'
      $q.notify({ type: 'negative', message: msj })
    } finally {
      $q.loading.hide()
    }
  })
}

const revertirAdjudicacion = (row) => {
  $q.dialog({
    title: '<span class="text-negative text-weight-bold">Revertir Adjudicación</span>',
    message: `¿Está seguro de revertir la adjudicación de la boleta <b>${row.folio_boleta}</b>?<br>Esto la regresará a estatus Pendiente.`,
    html: true,
    cancel: true,
    ok: { color: 'negative', label: 'Sí, Revertir' }
  }).onOk(async () => {
    $q.loading.show()
    try {
      await api.post(`/api/adjudicaciones/revertir/${row.id}`)
      $q.notify({ type: 'positive', message: 'Adjudicación revertida.' })
      cargarAdjudicaciones()
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || 'Error' })
    } finally {
      $q.loading.hide()
    }
  })
}

const verDetallesBoleta = async (folio) => {
  abrirModal(true)
  busquedaFolio.value = folio
  await buscarBoleta()
}

const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatFecha = (fstr) => {
  if (!fstr) return '---'
  const obj = new Date(fstr)
  return date.formatDate(obj, 'DD-MMM-YYYY')
}
const formatFechaCorta = (fstr) => {
  if (!fstr) return ''
  const obj = new Date(fstr)
  return date.formatDate(obj, 'DD-MMM-YYYY').toLowerCase()
}

onMounted(() => {
  cargarAdjudicaciones()
})
</script>

<style scoped>
  .border-bottom { border-bottom: 2px solid #cbd5e1; }
  .label-fixed-mov { font-size: 11px; color: #334155; }
  
  .input-premium-compact {
    :deep(.q-field__control) { height: 26px !important; min-height: 26px !important; padding: 0 4px; }
    :deep(.q-field__native) { padding: 0 !important; font-size: 11px; }
  }

  .btn-sicae { font-size: 10px; font-weight: bold; width: 85px; }
  .table-sicae-mov { 
    thead th { font-size: 10px; font-weight: 800; height: 25px; padding: 2px 8px; } 
    tbody td { font-size: 11px; padding: 2px 8px; height: 25px; }
  }
  
  .border-left-orange { border-left: 4px solid #ea580c; }
  .font-mono { font-family: monospace; }
</style>
