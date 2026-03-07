<template>
  <q-page class="q-pa-sm bg-blue-grey-1">
    <div class="row q-col-gutter-xs q-mb-sm bg-white border-bottom q-pa-xs items-center shadow-1">
      <div class="col-auto row q-gutter-xs">
        <q-btn flat dense color="grey-9" icon="save" label="F6 Confirmar" @click="confirmarPago" :disable="!boletaValida" class="btn-sicae" stack />
        <q-btn flat dense color="blue-9" icon="refresh" label="F7 Limpiar" @click="resetModulo" class="btn-sicae" stack />
        <q-btn flat dense color="red-9" icon="logout" label="F9 Salir" to="/" class="btn-sicae" stack />
      </div>
      <q-space />
      <div class="row q-gutter-md items-center q-mr-md" v-if="boleta">
        <div class="column items-end">
          <span class="text-caption text-grey-7 line-height-1">PRÉSTAMO</span>
          <span class="text-h6 text-weight-bolder text-primary line-height-1">$ {{ formatMoney(boleta.prestamo) }}</span>
        </div>
        <div class="column items-end">
          <span class="text-caption text-grey-7 line-height-1">INT. + REC.</span>
          <span class="text-h6 text-weight-bolder text-negative line-height-1">$ {{ formatMoney(calculos.interes + calculos.recargos) }}</span>
        </div>
        <div class="column items-end">
          <span class="text-caption text-grey-7 line-height-1">TOTAL</span>
          <span class="text-h6 text-weight-bolder text-blue-10 line-height-1">$ {{ formatMoney(calculos.total) }}</span>
        </div>
      </div>
      <div v-else class="text-h6 text-weight-bolder text-italic q-mr-md text-primary tracking-tighter uppercase">
        Movimientos a Boleta de Pago
      </div>
    </div>

    <q-card flat bordered class="q-mb-sm bg-white">
      <q-card-section class="q-pa-sm">
        <div class="row q-col-gutter-sm items-center">
          <div class="col-12 col-md-3 row items-center no-wrap">
            <div class="label-fixed-mov text-weight-bold q-mr-xs">Folio Boleta:</div>
            <q-input
              v-model="busquedaFolio"
              outlined dense
              placeholder="Escriba Folio + ENTER"
              class="col input-premium-compact"
              @keyup.enter="buscarBoleta"
              mask="#########"
              unmasked-value
            >
              <template v-slot:append><q-icon name="search" size="xs" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-6 text-caption text-grey-8 italic">
            * Busque un folio vigente para realizar refrendos, liquidaciones o abonos a capital.
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-sm" v-if="boleta">
      <div class="col-12 col-md-8 q-gutter-y-sm">
        <q-card flat bordered class="header-compact-card">
          <q-card-section class="bg-blue-grey-1 q-py-xs border-bottom row items-center">
            <q-icon name="person" size="xs" class="q-mr-sm" />
            <div class="text-caption text-weight-bolder uppercase">Información del Cliente</div>
          </q-card-section>
          <q-card-section class="q-pa-sm row q-col-gutter-sm">
            <div class="col-12 col-md-2">
              <div class="label-mini">ID CLIENTE</div>
              <div class="text-weight-bolder text-primary text-h6">{{ boleta.cliente_id }}</div>
            </div>
            <div class="col-12 col-md-4">
              <div class="label-mini">NOMBRE COMPLETO</div>
              <div class="text-weight-bold uppercase">{{ boleta.cliente.nombre }}</div>
            </div>
            <div class="col-12 col-md-4">
              <div class="label-mini">DOMICILIO</div>
              <div class="text-caption text-uppercase truncate">
                {{ boleta.cliente.calle }} {{ boleta.cliente.num_ext }}, {{ boleta.cliente.colonia }}
              </div>
            </div>
            <div class="col-12 col-md-2">
              <div class="label-mini">IDENTIFICACIÓN</div>
              <div class="text-caption text-grey-9 italic truncate">{{ boleta.cliente.identificacion || 'N/A' }}</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="header-compact-card">
          <q-card-section class="bg-blue-grey-1 q-py-xs border-bottom row items-center justify-between">
            <div class="row items-center">
              <q-icon name="assignment" size="xs" class="q-mr-sm" />
              <div class="text-caption text-weight-bolder uppercase">Detalle de la Prenda</div>
            </div>
            <div class="row q-gutter-x-md items-center">
               <span class="text-caption text-weight-bold">CATEGORÍA: <span class="text-primary">{{ boleta.categoria.nombre || 'GENERAL' }}</span></span>
               <q-badge :color="boleta.estatus === 'PE' ? 'orange-9' : 'green-9'" class="q-px-md text-weight-bold">
                 ESTATUS: {{ boleta.estatus === 'PE' ? 'PENDIENTE' : 'LIQUIDADA' }}
               </q-badge>
            </div>
          </q-card-section>

          <div class="row">
            <div class="col-12 col-md-4 border-right q-pa-sm bg-grey-1">
              <div class="financial-row-mov"><span>Fecha Boleta:</span><strong>{{ formatFechaSicae(boleta.fecha_boleta) }}</strong></div>
              <div class="financial-row-mov"><span>Vencimiento:</span><strong class="text-negative">{{ formatFechaSicae(boleta.fecha_vencimiento) }}</strong></div>
              <div class="financial-row-mov"><span>Próximo Remate:</span><strong class="text-deep-orange-9">{{ formatFechaSicae(boleta.fecha_remate) }}</strong></div>
              <q-separator class="q-my-xs" />
              <div class="financial-row-mov"><span>Avalúo:</span><strong>$ {{ formatMoney(boleta.avaluo) }}</strong></div>
              <div class="financial-row-mov"><span>Meses Transc.:</span><q-badge color="blue-grey-8">{{ boleta.meses_transcurridos || 0 }}</q-badge></div>
              <q-separator class="q-my-xs" />
              <div class="financial-row-mov"><span>Préstamo:</span><strong class="text-h6 text-primary">$ {{ formatMoney(boleta.prestamo) }}</strong></div>
            </div>

            <div class="col-12 col-md-8">
              <q-markup-table flat dense bordered square class="no-border-top table-sicae-mov">
                <thead class="bg-grey-2 text-uppercase">
                  <tr><th class="text-left" style="width: 50px">Cant.</th><th class="text-left">Descripción de la Prenda</th><th class="text-right">Valuación</th></tr>
                </thead>
                <tbody>
                  <tr v-for="partida in boleta.partidas" :key="partida.id">
                    <td class="text-center">1</td>
                    <td class="text-caption uppercase">{{ partida.descripcion }}</td>
                    <td class="text-right text-weight-bold text-blue-grey-9">$ {{ formatMoney(partida.valor) }}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
             <q-btn
                color="indigo-10"
                icon="list_alt"
                label="Pagos a Realizar"
                class="full-width q-mb-md"
                @click="dialogPagosVisible = true"
                :disable="!boleta"
              />
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="bg-blue-1 shadow-3">
          <q-card-section class="bg-primary text-white q-py-xs text-center">
            <div class="text-caption text-weight-bold uppercase">Resumen de Liquidación</div>
          </q-card-section>

          <q-card-section class="q-pa-md column q-gutter-y-sm">
            <div class="financial-row-mov">
              <span class="label">Capital (Préstamo):</span>
              <div class="val-box">$ {{ formatMoney(boleta.prestamo) }}</div>
            </div>
            <div class="financial-row-mov">
              <span class="label">Interés Acumulado:</span>
              <div class="val-box">$ {{ formatMoney(calculos.interes) }}</div>
            </div>
            <div class="financial-row-mov">
              <span class="label">Recargos (Mora):</span>
              <div class="val-box text-negative">$ {{ formatMoney(calculos.recargos) }}</div>
            </div>
            <div class="financial-row-mov text-positive" v-if="calculos.bonificacion > 0">
              <span class="label font-bold">Bonificación NC (-):</span>
              <div class="val-box text-positive">$ {{ formatMoney(calculos.bonificacion) }}</div>
            </div>

            <q-separator class="q-my-sm" />

            <div class="financial-row-mov total">
              <span class="text-weight-bolder text-primary">TOTAL A PAGAR:</span>
              <div class="val-box-total shadow-1">$ {{ formatMoney(calculos.total) }}</div>
            </div>

            <div class="q-mt-md">
              <div class="label-mini q-mb-xs">EFECTIVO RECIBIDO:</div>
              <q-input
                v-model.number="pagoRecibido"
                outlined
                bg-color="white"
                prefix="$"
                input-class="text-h4 text-right text-weight-bolder text-orange-10"
                @focus="$event.target.select()"
              />
            </div>

            <div class="row justify-between items-center q-mt-sm bg-white q-pa-sm rounded-borders border-subtle shadow-inner">
              <div class="text-weight-bold text-grey-7">SU CAMBIO:</div>
              <div class="text-h4 text-weight-bolder text-primary">$ {{ formatMoney(cambioCalculado) }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <DenominacionesDialog
      v-model="showDenominaciones"
      :total-requerido="calculos.total"
      @confirmado="finalizarProcesoConEfectivo"
    />


    <CalendarioPagosDialog
      v-model="dialogPagosVisible"
      :rows="listaDePagos"
      @confirmar-seleccion="recibirPagosSeleccionados"
    />
  </q-page>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { api } from 'boot/axios'
  import { useQuasar, date } from 'quasar'

  import CalendarioPagosDialog from 'components/Boletas/CalendarioPagos.vue'
  import DenominacionesDialog from 'components/DenominacionesDialog.vue'


  const showDenominaciones = ref(false)

  const $q = useQuasar()
  const busquedaFolio = ref('')
  const boleta = ref(null)
  const pagoRecibido = ref(0)

  const dialogPagosVisible = ref(false)
  const listaDePagos = ref([])
  const cuotasSeleccionadas = ref([])

  // Desglose financiero (incluido almacenaje si el backend lo separa)
  const calculos = ref({
    interes: 0,
    recargos: 0,
    bonificacion: 0,
    total: 0
  })

  const boletaValida = computed(() => boleta.value && boleta.value.estatus === 'PE')
  const cambioCalculado = computed(() => Math.max(0, (pagoRecibido.value || 0) - calculos.value.total))

  // BÚSQUEDA DE FOLIO
  const buscarBoleta = async () => {
    if (!busquedaFolio.value) return

    $q.loading.show({ message: 'Localizando boleta de pagos...' })
    try {
      const { data } = await api.get(`/api/movimientos/boleta/${busquedaFolio.value}/pagos`)

      if (data.boleta) {
        boleta.value = data.boleta
        listaDePagos.value = data.calendario
        calculos.value = data.calculos
        pagoRecibido.value = 0
      } else {
        $q.notify({ type: 'warning', message: 'Folio no encontrado o ya liquidado.' })
        resetModulo()
      }
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error: ' + (e.response?.data?.message || 'Error de conexión') })
    } finally {
      $q.loading.hide()
    }
  }

  const recibirPagosSeleccionados = (data) => {
    cuotasSeleccionadas.value = data.items

    // Actualizamos los cuadros financieros de la pantalla principal
    calculos.value.interes = 0; // O la suma de intereses si los separas
    calculos.value.total = data.total + calculos.value.recargos;

    $q.notify({
      message: `${data.items.length} pagos seleccionadas para cobrar.`,
      color: 'indigo-10',
      icon: 'shopping_cart'
    })
  }

  // CONFIRMACIÓN DE PAGO (F6)
  const confirmarPago = async () => {
    if (!boletaValida.value) return

    if (cuotasSeleccionadas.value.length === 0) {
      return $q.notify({
        type: 'warning',
        message: 'Debe abrir "Pagos a Realizar" y seleccionar los pagos a cobrar.'
      })
    }

    if (pagoRecibido.value < calculos.value.total) {
      $q.notify({ type: 'negative', message: 'El efectivo recibido es insuficiente.' })
      return
    }

    $q.dialog({
      title: '<div class="text-primary text-weight-bolder">CONFIRMAR LIQUIDACIÓN</div>',
      message: `¿Desea procesar el pago de <strong>${cuotasSeleccionadas.value.length} cuota(s)</strong> por un total de <strong>$${formatMoney(calculos.value.total)}</strong>?`,
      html: true,
      cancel: true,
      persistent: true
    }).onOk(() => {
      // Paso 2: Abrir el contador de billetes que ya usas en Tradicional
      showDenominaciones.value = true
    })
  }

  const finalizarProcesoConEfectivo = async(dataContador) => {
    $q.loading.show({ message: 'Registrando movimientos en caja...' })

    try {
      const payload = {
        boleta_id: boleta.value.id,
        pagos_ids: cuotasSeleccionadas.value.map(p => p.id), // Los IDs de la tabla calendario_pagos
        importe_total: calculos.value.total,
        efectivo_recibido: dataContador.efectivo_recibido,
        cambio: dataContador.cambio,
        // Datos para el cierre diario
        interes: calculos.value.interes,
        recargos: calculos.value.recargos
      }

      await api.post('/api/movimientos/registrar-pago', payload)

      $q.notify({
        type: 'positive',
        message: `¡Cobro exitoso! Entregue $${formatMoney(dataContador.cambio)} de cambio.`
      })

      resetModulo()
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al registrar: ' + e.response?.data?.message })
    } finally {
      $q.loading.hide()
    }
  }

  const resetModulo = () => {
    boleta.value = null
    busquedaFolio.value = ''
    calculos.value = { interes: 0, recargos: 0, bonificacion: 0, total: 0 }
    pagoRecibido.value = 0
  }

  const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const formatFechaSicae = (fechaStr) => {
    if (!fechaStr) return '---';
    const soloFecha = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
    const [anio, mes, dia] = soloFecha.split('-');
    const fechaObj = new Date(anio, mes - 1, dia);
    return date.formatDate(fechaObj, 'DD-MMM-YYYY', {
      monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    });
  }

  const handleKeys = (e) => {
    if (e.key === 'F6') { e.preventDefault(); confirmarPago(); }
    if (e.key === 'F7') { e.preventDefault(); resetModulo(); }
  }

  onMounted(() => window.addEventListener('keydown', handleKeys))
  onUnmounted(() => window.removeEventListener('keydown', handleKeys))
</script>

<style lang="scss" scoped>
  .border-bottom { border-bottom: 2px solid #cbd5e1; }
  .border-right { border-right: 1px solid #cbd5e1; }
  .label-fixed-mov { width: 90px; font-size: 11px; color: #334155; }
  .label-mini { font-size: 10px; color: #64748b; font-weight: bold; margin-bottom: 2px; }
  .line-height-1 { line-height: 1; }
  .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .input-premium-compact {
    :deep(.q-field__control) { height: 26px !important; min-height: 26px !important; }
    :deep(.q-field__native) { padding: 0 4px !important; font-size: 11px; }
  }

  .financial-row-mov {
    display: flex; justify-content: space-between; align-items: center; font-size: 12px; padding: 2px 0;
    .val-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 2px 8px; width: 100px; text-align: right; font-family: monospace; font-weight: 800; }
    &.total .val-box-total { font-size: 20px; color: #1e3a8a; border: 2px solid #1e3a8a; font-weight: 900; background: white; padding: 4px 12px; width: 140px; text-align: right; }
  }

  .header-compact-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden; }
  .btn-sicae { font-size: 10px; font-weight: bold; width: 85px; }
  .table-sicae-mov { thead th { font-size: 10px; font-weight: 800; height: 25px; } }
</style>
