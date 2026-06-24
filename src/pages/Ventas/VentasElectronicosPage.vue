<template>
  <q-page class="q-pa-sm bg-blue-grey-1">
    <div class="row q-col-gutter-xs q-mb-sm bg-white border-bottom q-pa-xs items-center shadow-1">
      <div class="col-auto row q-gutter-xs">
        <q-btn flat dense color="blue-grey-8" icon="receipt" label="F4 Nota Mostrador" @click="accionNotaMostrador" class="btn-sicae" stack />
        <q-btn flat dense color="blue-9" icon="file_download" label="F5 Carga Nota" @click="accionCargarNota" class="btn-sicae" stack />
        <q-btn flat dense color="green-9" icon="payments" label="F6 Acepta Pago" @click="accionAceptarPago" class="btn-sicae" stack />
        <q-btn flat dense color="orange-9" icon="cleaning_services" label="F8 Limpiar" @click="limpiarDatos" class="btn-sicae" stack />
        <q-btn flat dense color="red-9" icon="logout" label="F9 Salir" to="/" class="btn-sicae" stack />
      </div>
      <q-space />
      <div class="text-h6 text-weight-bolder text-italic q-mr-md text-primary tracking-tighter uppercase">
        Ventas de Electrónicos [ CAJA ]
      </div>
    </div>

    <q-card flat bordered class="q-mb-sm bg-white shadow-1">
      <q-card-section class="q-pa-sm">
        <div class="row q-col-gutter-sm">

          <div class="col-12 col-md-3 row items-center no-wrap">
            <div class="label-fixed-mov text-weight-bold q-mr-xs">Tipo de Venta:</div>
            <q-select
              v-model="form.tipo_venta"
              :options="['TOTAL', 'SEPARADO', 'PAGOS']"
              outlined dense
              class="col input-premium-compact"
            />
          </div>

          <div class="col-12 col-md-3 row items-center no-wrap">
            <div class="label-fixed-mov text-weight-bold q-mr-xs">Modo:</div>
            <q-select
              v-model="form.modo"
              :options="['CONTADO', 'VOUCHER', 'DEBITO', 'MIXTO']"
              outlined dense
              class="col input-premium-compact"
            />
          </div>

          <div class="col-12 col-md-6 row items-center justify-end no-wrap">
            <div class="label-fixed-mov text-weight-bold q-mr-xs text-right">Fecha Mov.:</div>
            <q-input
              v-model="form.fecha"
              outlined dense readonly
              bg-color="grey-2"
              class="input-premium-compact"
              style="width: 250px"
              input-class="text-weight-bold text-center"
            />
          </div>

          <div class="col-12 col-md-3 row items-center no-wrap">
            <div class="label-fixed-mov text-weight-bold q-mr-xs">Nota Mostrador:</div>
            <q-input
              v-model="form.nota_mostrador"
              outlined dense
              class="col input-premium-compact"
              input-class="text-weight-bolder text-primary"
              :readonly="form.tipo_venta !== 'PAGOS'"
            />
          </div>

          <div class="col-12 col-md-9 row items-center no-wrap">
            <div class="label-fixed-mov text-weight-bold q-mr-xs">Vendedor:</div>
            <q-select
              v-model="form.vendedor_id"
              :options="vendedoresOptions"
              option-label="nombre" option-value="id" map-options emit-value
              outlined dense class="col input-premium-compact"
            />
          </div>

          <div class="col-12 col-md-9 row items-center no-wrap">
            <div class="label-fixed-mov text-weight-bold q-mr-xs">Cliente:</div>
            <q-input
              v-model="form.cliente"
              outlined dense
              class="col input-premium-compact text-uppercase"
              placeholder="Escriba el nombre del cliente..."
            />
          </div>

          <div class="col-12 col-md-3 row items-center no-wrap">
            <div class="label-fixed-mov text-weight-bold q-mr-xs">No. Bolsa:</div>
            <q-input
              v-model="form.no_bolsa"
              outlined dense
              class="col input-premium-compact"
            />
          </div>

          <div class="col-12 col-md-6 row items-center no-wrap">
            <div class="label-fixed-mov text-weight-bold q-mr-xs">Empresa:</div>
            <q-select
              v-model="form.empresa_id"
              :options="empresasOptions"
              option-label="nombre" option-value="id" map-options emit-value
              outlined dense class="col input-premium-compact"
            />
          </div>

          <div class="col-12 col-md-6 row items-center no-wrap">
            <div class="label-fixed-mov text-weight-bold q-mr-xs">Sucursal:</div>
            <q-select
              v-model="form.sucursal_id"
              :options="sucursalesOptions"
              option-label="nombre" option-value="id" map-options emit-value
              outlined dense class="col input-premium-compact"
            />
          </div>

        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-sm q-mb-sm">
      <div class="col-12 col-md-11">
        <q-markup-table dense flat bordered class="bg-white shadow-1 table-sicae" style="height: 200px;">
          <thead class="bg-grey-2">
            <tr>
              <th class="text-center" style="width: 50px">Cant.</th>
              <th class="text-left">Clas</th>
              <th class="text-left">Sub Clas</th>
              <th class="text-center">No. Código</th>
              <th class="text-left">Descripción</th>
              <th class="text-right">Precio</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in carrito" :key="index" class="cursor-pointer">
              <td class="text-center">{{ item.cantidad }}</td>
              <td class="text-left">{{ item.clasificacion_nombre }}</td>
              <td class="text-left">{{ item.subclasificacion_nombre }}</td>
              <td class="text-center font-mono">{{ item.codigo }}</td>
              <td class="text-left text-weight-bold">{{ item.descripcion }}</td>
              <td class="text-right font-mono text-primary">$ {{ formatMoney(item.precio) }}</td>
            </tr>
            <tr v-if="carrito.length === 0">
              <td colspan="6" class="text-center text-grey-5 italic q-pa-lg">
                No hay electrónicos agregados. Haga clic en "Agregar".
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>

      <div class="col-12 col-md-1 column justify-start q-gutter-y-sm">
        <q-btn color="grey-9" icon="arrow_drop_up" label="Agregar" stack class="full-width shadow-2 text-weight-bold" @click="abrirModalConcepto" />
        <q-btn color="grey-4" text-color="black" icon="arrow_drop_down" label="Quitar" stack class="full-width shadow-1" @click="quitarUltimoConcepto" :disable="carrito.length === 0" />
      </div>
    </div>

    <div class="row q-col-gutter-sm">

      <div class="col-12 col-md-6">
        <q-card flat bordered class="bg-white shadow-1 full-height" :class="{'opacity-50': form.tipo_venta === 'TOTAL'}">
          <q-card-section class="q-pa-xs bg-blue-grey-8 text-white text-center text-weight-bold uppercase" style="font-size: 11px;">
            Pagos Realizados
          </q-card-section>

          <q-markup-table dense flat class="table-sicae" style="height: 120px;">
            <thead class="bg-grey-2">
              <tr><th>No.</th><th>Fecha</th><th class="text-right">Importe</th></tr>
            </thead>
            <tbody>
              <tr v-for="pago in pagosRealizados" :key="pago.no_pago">
                <td class="text-center">{{ pago.no_pago }}</td>
                <td class="text-center">{{ pago.fecha }}</td>
                <td class="text-right text-positive text-weight-bold">$ {{ formatMoney(pago.importe) }}</td>
              </tr>
              <tr v-if="pagosRealizados.length === 0">
                <td colspan="3" class="text-center text-grey-5 italic">Sin pagos previos</td>
              </tr>
            </tbody>
          </q-markup-table>

          <q-card-section class="q-pa-sm q-gutter-y-xs border-top">
            <div class="financial-row-mov">
              <span class="text-weight-bold">Total Pagado:</span>
              <div class="val-box">$ {{ formatMoney(totales.pagadoPreviamente) }}</div>
            </div>
            <div class="financial-row-mov">
              <span class="text-weight-bold">Saldo a Pagar:</span>
              <div class="val-box text-negative">$ {{ formatMoney(totales.saldo) }}</div>
            </div>
            <div class="financial-row-mov">
              <span class="text-weight-bold">Fecha Límite:</span>
              <div class="val-box">{{ form.fecha_limite || '---' }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="bg-white shadow-1">
          <q-card-section class="q-pa-sm column q-gutter-y-sm">
            <div class="financial-row-mov">
              <span class="text-weight-bold text-h6">Sub Total:</span>
              <div class="val-box text-subtitle1">$ {{ formatMoney(totales.subtotal) }}</div>
            </div>

            <div class="financial-row-mov cursor-pointer" @dblclick="solicitarDescuento">
              <span class="text-weight-bold text-h6">(-) Descuento:</span>
              <div class="val-box text-negative text-subtitle1">$ {{ formatMoney(form.descuento) }}</div>
            </div>

            <q-separator />

            <div class="financial-row-mov total q-mt-sm">
              <span class="text-weight-bolder text-primary">Total a Pagar:</span>
              <div class="val-box-total shadow-1">$ {{ formatMoney(totales.totalPagar) }}</div>
            </div>

            <div class="financial-row-mov q-mt-md" v-if="form.tipo_venta === 'SEPARADO'">
              <span class="text-weight-bold text-orange-9">Mínimo para Separar:</span>
              <div class="val-box text-orange-9">$ {{ formatMoney(totales.minimoSeparado) }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

    </div>
    <DialogoBuscarElectronico
      v-model="modalBuscarVisible"
      @articulo-agregado="recibirArticulo"
    />

    <DialogoCobroVentaElectronicos
      v-model="modalCobroVisible"
      :total-pagar="totales.totalPagar"
      :tipo-venta="form.tipo_venta"
      :modo="form.modo"
      @procesar-pago="prepararVentaFinal"
    />

    <DialogoDesgloseCobro
      v-model="showDenominaciones"
      :total-pagar="datosPagoTemporal?.efectivo > 0 ? (datosPagoTemporal.efectivo - datosPagoTemporal.cambio) : 0"
      :monto-recibido="datosPagoTemporal?.efectivo || 0"
      tipo-operacion="VENTA DE ELECTRÓNICOS"
      @confirmar="procesarVentaFinal"
    />
  </q-page>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { date, useQuasar } from 'quasar'
  import { api } from 'boot/axios'
  import { PrintService } from 'src/services/PrintService'

  import DialogoBuscarElectronico from 'src/components/Ventas/DialogoBuscarElectronico.vue'
  import DialogoCobroVentaElectronicos from 'src/components/Ventas/DialogoCobroVentaElectronicos.vue'
  import DialogoDesgloseCobro from 'src/components/Caja/DialogoDesgloseCobro.vue'


  const $q = useQuasar()

  const modalBuscarVisible = ref(false)
  const modalCobroVisible = ref(false)
  const showDenominaciones = ref(false)
  const datosPagoTemporal = ref(null)



  const abrirModalConcepto = () => {
    modalBuscarVisible.value = true
  }


  const recibirArticulo = (nuevoArticulo) => {
    carrito.value.push(nuevoArticulo)
    $q.notify({
      message: 'Artículo agregado a la venta',
      color: 'positive',
      icon: 'check_circle',
      position: 'top-right'
    })
  }

  // --- ESTADO DEL FORMULARIO ---
  const form = ref({
    tipo_venta: 'TOTAL',
    modo: 'CONTADO',
    fecha: date.formatDate(Date.now(), 'DD/MM/YYYY'),
    nota_mostrador: '',
    vendedor_id: null,
    empresa_id: null,
    sucursal_id: null,
    cliente: '',
    no_bolsa: '',
    descuento: 0,
    fecha_limite: ''
  })

  // Catálogos simulados
  const vendedoresOptions = ref([{ id: 1, nombre: '001: RAMIRO NUÑEZ' }])
  const empresasOptions = ref([{ id: 1, nombre: '001: PRESTAMO EXPRESS' }])
  const sucursalesOptions = ref([{ id: 1, nombre: '001: MATRIZ' }])

  // --- LISTAS DE DATOS ---
  const carrito = ref([])
  const pagosRealizados = ref([]) // Se llenará si cargan una nota con "F5"

  // --- CÁLCULOS MATEMÁTICOS ---
  const totales = computed(() => {
    const subtotal = carrito.value.reduce((acc, item) => acc + (Number(item.precio) * Number(item.cantidad)), 0)
    const totalPagar = Math.max(0, subtotal - form.value.descuento)
    const minimoSeparado = totalPagar * 0.20 // 20% mínimo
    const pagadoPreviamente = pagosRealizados.value.reduce((acc, item) => acc + Number(item.importe), 0)
    const saldo = Math.max(0, totalPagar - pagadoPreviamente)

    return { subtotal, totalPagar, minimoSeparado, pagadoPreviamente, saldo }
  })

  // 1. Al presionar F6
  const accionAceptarPago = () => {
    if (carrito.value.length === 0) {
      return $q.notify({ type: 'negative', message: 'NO Existe ningún Concepto de Venta Capturado' })
    }
    // Validaciones extraídas de tu VB6
    if (!form.value.cliente) return $q.notify({ type: 'warning', message: 'Favor de teclear el Nombre del Cliente' })
    if (!form.value.vendedor_id) return $q.notify({ type: 'warning', message: 'Debe seleccionar un Vendedor' })
    if (!form.value.empresa_id) return $q.notify({ type: 'warning', message: 'Debe seleccionar una Empresa' })
    if (!form.value.sucursal_id) return $q.notify({ type: 'warning', message: 'Debe seleccionar una Sucursal' })

    modalCobroVisible.value = true
  }

  // 2. Al darle Aceptar en el modal de Cobro
  const prepararVentaFinal = (desglosePago) => {
    datosPagoTemporal.value = desglosePago

    if (desglosePago.efectivo > 0) {
      // Si hay efectivo, contamos billetes
      showDenominaciones.value = true
    } else {
      // Si pagó con pura tarjeta, directo a guardar
      procesarVentaFinal(null)
    }
  }

  // 3. Envío final al backend
  const procesarVentaFinal = async (dataContador) => {
    $q.loading.show({ message: 'Guardando Venta de Electrónicos y Generando Ticket...' })

    try {
      const payload = {
        tipo_venta: form.value.tipo_venta,
        modo: form.value.modo,
        fecha: form.value.fecha,
        cliente: form.value.cliente,
        no_bolsa: form.value.no_bolsa,
        nota_mostrador: form.value.nota_mostrador,
        vendedor_id: form.value.vendedor_id,
        empresa_id: form.value.empresa_id,
        sucursal_id: form.value.sucursal_id,
        descuento: form.value.descuento,
        conceptos: carrito.value,
        pago: datosPagoTemporal.value,
        denominaciones: dataContador ? JSON.stringify(dataContador.denominaciones || dataContador) : null
      }

      const res = await api.post('/api/ventas-electronicos/procesar', payload)

      // Si Laravel dice que todo salió bien, enviamos a imprimir a Python
      if (res.data.ticket_data) {
        try {
          await PrintService.imprimirTicketVentaElectronicos(res.data.ticket_data)
        } catch (printError) {
          $q.notify({ type: 'warning', message: 'Venta guardada, pero la impresora no respondió.' })
        }
      }

      $q.notify({ type: 'positive', message: '¡Venta registrada con éxito!', icon: 'check_circle' })

      // Limpieza
      showDenominaciones.value = false
      limpiarDatos()

    } catch (error) {
      const mensaje = error.response?.data?.message || error.message || "Error al procesar la venta"
      $q.notify({ type: 'negative', message: 'Error: ' + mensaje })
    } finally {
      $q.loading.hide()
    }
  }


  // --- FUNCIONES BOTONERA ---
  const accionNotaMostrador = () => $q.notify({ message: 'Lógica generar nota pendiente', color: 'info' })
  // --- CARGAR NOTA DE MOSTRADOR (F5) ---
  const accionCargarNota = () => {
    $q.dialog({
      title: '<div class="text-primary text-weight-bolder uppercase">Cargar Nota de Mostrador</div>',
      message: 'Ingrese el número de Folio de la venta de Electrónicos:',
      html: true,
      prompt: { model: '', type: 'number', outlined: true, dense: true },
      cancel: { label: 'Cancelar', flat: true, color: 'grey-8' },
      ok: { label: 'Buscar', unelevated: true, color: 'primary' },
      persistent: true
    }).onOk(async (folio) => {
      if (!folio) return

      $q.loading.show({ message: 'Buscando Nota de Mostrador...' })

      try {
        const res = await api.get(`/api/ventas-electronicos/nota/${folio}`)
        const nota = res.data.nota
        const detalles = res.data.detalles
        const pagos = res.data.pagos

        const mapaTipoVenta = { 'T': 'TOTAL', 'S': 'SEPARADO', 'P': 'PAGOS' }
        const mapaModoPago = { 'C': 'CONTADO', 'V': 'VOUCHER', 'D': 'DEBITO', 'M': 'MIXTO' }

        // 1. Llenamos Encabezado
        form.value.tipo_venta = mapaTipoVenta[nota.tipo_venta] || 'TOTAL'
        form.value.modo = mapaModoPago[nota.modo] || 'CONTADO'
        form.value.nota_mostrador = nota.id
        form.value.vendedor_id = nota.vendedor_id
        form.value.empresa_id = nota.empresa_id
        form.value.sucursal_id = nota.sucursal_id
        form.value.cliente = nota.cliente
        form.value.no_bolsa = nota.no_bolsa || ''
        form.value.descuento = Number(nota.descuento)
        form.value.fecha_limite = nota.fecha_limite || ''

        // 2. Llenamos el Grid
        carrito.value = detalles.map(d => ({
          cantidad: Number(d.cantidad),
          codigo: d.codigo,
          descripcion: d.descripcion,
          precio: Number(d.precio),
          clasificacion_nombre: d.clasificacion || 'GENERAL',
          subclasificacion_nombre: d.subclasificacion || 'N/A'
        }))

        // 3. Llenamos Pagos Realizados
        pagosRealizados.value = pagos.map(p => ({
          no_pago: p.no_pago,
          fecha: p.fecha_pago,
          importe: Number(p.importe)
        }))

        $q.notify({ type: 'positive', message: 'Nota cargada exitosamente', icon: 'file_download_done' })

      } catch (error) {
        const mensaje = error.response?.data?.message || 'Error al conectar con el servidor'
        $q.notify({ type: 'negative', message: mensaje, icon: 'warning' })
      } finally {
        $q.loading.hide()
      }
    })
  }

  // --- OBTENER FOLIO SIGUIENTE ---
  const obtenerSiguienteFolio = async () => {
    try {
      const res = await api.get('/api/ventas-electronicos/siguiente-folio')
      form.value.nota_mostrador = res.data.siguiente_folio
    } catch (error) {
      console.error('Error al obtener el folio:', error)
      form.value.nota_mostrador = ''
    }
  }

  const limpiarDatos = () => {
    form.value.nota_mostrador = ''
    form.value.cliente = ''
    form.value.no_bolsa = ''
    form.value.descuento = 0
    carrito.value = []
    pagosRealizados.value = []
    obtenerSiguienteFolio()
  }


  const quitarUltimoConcepto = () => carrito.value.pop()

  const solicitarDescuento = () => $q.notify({ message: 'Solicitando autorización descuento...', color: 'warning' })

  const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })



  // --- ATAJOS DE TECLADO ---
  const atajosTeclado = (e) => {
    if (e.key === 'F4') { e.preventDefault(); accionNotaMostrador(); }
    if (e.key === 'F5') { e.preventDefault(); accionCargarNota(); }
    if (e.key === 'F6') { e.preventDefault(); accionAceptarPago(); }
    if (e.key === 'F8') { e.preventDefault(); limpiarDatos(); }
  }

  onMounted(() => {
    obtenerSiguienteFolio() // Pedimos el folio al entrar a la pantalla
    window.addEventListener('keydown', atajosTeclado)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', atajosTeclado)
  })
</script>

<style lang="scss" scoped>
  .bg-blue-grey-1 { background-color: #f0f4f7; }
  .btn-sicae { font-size: 10px; width: 100px; border: 1px solid #ddd; background: white; }
  .border-bottom { border-bottom: 2px solid #bdbdbd; }
  .border-top { border-top: 1px solid #cbd5e1; }
  .opacity-50 { opacity: 0.5; pointer-events: none; }

  .label-fixed-mov { width: 100px; font-size: 11px; color: #334155; }

  .input-premium-compact {
    :deep(.q-field__control) { height: 26px !important; min-height: 26px !important; }
    :deep(.q-field__native) { padding: 0 4px !important; font-size: 11px; }
  }

  .table-sicae {
    thead th { font-size: 11px; font-weight: 800; height: 26px; text-transform: uppercase; }
    tbody td { padding: 4px 8px !important; border: 1px solid #e2e8f0; font-size: 11px;}
  }

  .font-mono { font-family: 'JetBrains Mono', monospace; font-weight: bold; }

  .financial-row-mov {
    display: flex; justify-content: space-between; align-items: center; font-size: 12px;
    .val-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 4px 8px; width: 110px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; }
    &.total .val-box-total { font-size: 18px; color: #1e3a8a; border: 2px solid #1e3a8a; font-weight: 900; background: white; padding: 4px 12px; width: 140px; text-align: right; }
  }
</style>
