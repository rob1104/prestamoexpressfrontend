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
        Ventas de Joyería [ CAJA ]
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
              @update:model-value="alCambiarTipoVenta"
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
              option-label="nombre"
              option-value="id"
              map-options emit-value
              outlined dense
              class="col input-premium-compact"
            />
          </div>

          <div class="col-12 row items-center no-wrap">
            <div class="label-fixed-mov text-weight-bold q-mr-xs">Cliente:</div>
            <q-input
              v-model="form.cliente"
              outlined dense
              class="col input-premium-compact text-uppercase"
              placeholder="Escriba el nombre del cliente..."
            />
          </div>

        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-sm">
      <div class="col-12 col-md-9">
        <q-markup-table dense flat bordered class="bg-white shadow-1 table-sicae" style="height: 350px;">
          <thead class="bg-grey-2">
            <tr>
              <th class="text-center" style="width: 50px">Cant.</th>
              <th class="text-left">Concepto</th>
              <th class="text-right">Importe</th>
              <th class="text-left">Categoría</th>
              <th class="text-left">Clasificación</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in carrito" :key="index" @dblclick="editarRenglon(index)" class="cursor-pointer">
              <td class="text-center">{{ item.cantidad }}</td>
              <td class="text-left text-weight-bold">{{ item.concepto }}</td>
              <td class="text-right font-mono text-primary">$ {{ formatMoney(item.importe) }}</td>
              <td class="text-left">{{ item.categoria_nombre }}</td>
              <td class="text-left">{{ item.clasificacion_nombre }}</td>
            </tr>
            <tr v-if="carrito.length === 0">
              <td colspan="5" class="text-center text-grey-5 italic q-pa-lg">
                No hay conceptos agregados a la venta. Haga clic en "Agregar".
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>

      <div class="col-12 col-md-3 column justify-between">
        <div class="column q-gutter-y-sm q-mb-md">
          <q-btn color="grey-9" icon="arrow_drop_up" label="Agregar" stack class="full-width shadow-2 text-weight-bold" @click="abrirModalConcepto" />
          <q-btn color="grey-4" text-color="black" icon="arrow_drop_down" label="Quitar" stack class="full-width shadow-1" @click="quitarUltimoConcepto" :disable="carrito.length === 0" />
        </div>

        <q-card flat bordered class="bg-white shadow-1">
          <q-card-section class="q-pa-sm column q-gutter-y-xs">
            <div class="financial-row-mov">
              <span class="text-weight-bold">Sub Total:</span>
              <div class="val-box">$ {{ formatMoney(totales.subtotal) }}</div>
            </div>

            <div class="financial-row-mov cursor-pointer" @dblclick="solicitarDescuento">
              <span class="text-weight-bold">(-) Descuento:</span>
              <div class="val-box text-negative">$ {{ formatMoney(form.descuento) }}</div>
            </div>

            <q-separator class="q-my-xs" />

            <div class="financial-row-mov total">
              <span class="text-weight-bolder text-primary">Total a Pagar:</span>
              <div class="val-box-total shadow-1">$ {{ formatMoney(totales.totalPagar) }}</div>
            </div>

            <div class="financial-row-mov q-mt-sm">
              <span class="text-weight-bold">Cambio:</span>
              <div class="val-box">$ {{ formatMoney(totales.cambio) }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <DialogoAgregarConceptoJoyeria
      v-model="modalConceptoVisible"
      @concepto-agregado="recibirConcepto"
    />
  </q-page>

  <DialogoCobroVentaJoyeria
      v-model="modalCobroVisible"
      :total-pagar="totales.totalPagar"
      :tipo-venta="form.tipo_venta"
      :modo="form.modo"
      @procesar-pago="finalizarVenta"
    />

    <DialogoDesgloseCobro
      v-model="showDenominaciones"
      :total-pagar="datosPagoTemporal?.efectivo > 0 ? (datosPagoTemporal.efectivo - datosPagoTemporal.cambio) : 0"
      :monto-recibido="datosPagoTemporal?.efectivo || 0"
      tipo-operacion="VENTA DE JOYERÍA"
      @confirmar="procesarVentaFinal"
    />
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { date, useQuasar } from 'quasar'
  import { api } from 'boot/axios'
  import { PrintService } from 'src/services/PrintService'

  import DialogoAgregarConceptoJoyeria from 'src/components/Ventas/DialogoAgregarConceptoJoyeria.vue'
  import DialogoCobroVentaJoyeria from 'src/components/Ventas/DialogoCobroVentaJoyeria.vue'
  import DialogoDesgloseCobro from 'src/components/Caja/DialogoDesgloseCobro.vue'


  const $q = useQuasar()

  const modalConceptoVisible = ref(false)
  const modalCobroVisible = ref(false)

  const showDenominaciones = ref(false)
  const datosPagoTemporal = ref(null)

  const recibirConcepto = (nuevoArticulo) => {
    carrito.value.push(nuevoArticulo)
    $q.notify({ message: 'Concepto agregado a la venta', color: 'positive', icon: 'check_circle' })
  }

  // --- ESTADO DEL FORMULARIO ---
  const form = ref({
    tipo_venta: 'TOTAL',
    modo: 'CONTADO',
    fecha: date.formatDate(Date.now(), 'dddd, MMMM D YYYY').toLowerCase(),
    nota_mostrador: '',
    vendedor_id: null,
    cliente: '',
    descuento: 0,
    efectivo_recibido: 0 // Se llenará al presionar F6
  })

  const obtenerSiguienteFolio = async () => {
  try {
      const res = await api.get('/api/ventas-joyeria/siguiente-folio')
      form.value.nota_mostrador = res.data.siguiente_folio
    } catch (error) {
      console.error('No se pudo obtener el folio siguiente', error)
      form.value.nota_mostrador = ''
    }
  }

  // Simulación de catálogo de Vendedores
  const vendedoresOptions = ref([
    { id: 1, nombre: '001: RAMIRO NUÑEZ' },
    { id: 2, nombre: '002: JUAN PEREZ' }
  ])

  // --- CARRITO DE COMPRAS (El Grid) ---
  const carrito = ref([])

  // --- COMPUTADOS MATHEMATICOS (CalculaTotales de VB6) ---
  const totales = computed(() => {
    const subtotal = carrito.value.reduce((acc, item) => acc + Number(item.importe), 0)
    const totalPagar = Math.max(0, subtotal - form.value.descuento)
    const cambio = Math.max(0, form.value.efectivo_recibido - totalPagar)

    return { subtotal, totalPagar, cambio }
  })


  const accionNotaMostrador = () => {
    $q.notify({ message: 'Lógica para generar nota de mostrador pendiente', color: 'info' })
  }


  const accionAceptarPago = () => {
    if (carrito.value.length === 0) {
      $q.notify({ type: 'negative', message: 'NO Existe ningún Concepto de Venta Capturado' })
      return
    }
    if (!form.value.cliente) {
      $q.notify({ type: 'warning', message: 'Favor de teclear el nombre del cliente' })
      return
    }

    // Abre el modal de cobro interactivo
    modalCobroVisible.value = true
  }

  const finalizarVenta = async(desglosePago) => {
    // Guardamos temporalmente cómo nos pagó
    datosPagoTemporal.value = desglosePago

    // Si nos dio dinero en EFECTIVO, abrimos el contador de billetes
    if (desglosePago.efectivo > 0) {
      showDenominaciones.value = true
    } else {
      // Si pagó TODO con Tarjeta (Voucher/Débito), nos saltamos los billetes y guardamos
      procesarVentaFinal(null)
    }
  }

  const procesarVentaFinal = async (dataContador) => {
    $q.loading.show({ message: 'Guardando Venta y Generando Ticket...' })

    try {
      const payload = {
        tipo_venta: form.value.tipo_venta,
        modo: form.value.modo,
        cliente: form.value.cliente,
        nota_mostrador: form.value.nota_mostrador,
        vendedor_id: form.value.vendedor_id,
        descuento: form.value.descuento,
        conceptos: carrito.value,
        pago: datosPagoTemporal.value,
        // NUEVO: Agregamos las denominaciones al payload
        denominaciones: dataContador ? dataContador.denominaciones : null
      }

      const res = await api.post('/api/ventas-joyeria/procesar', payload)

      // Si todo salió bien, enviamos a imprimir el ticket térmico
      if (res.data.ticket_data) {
        try {
          await PrintService.imprimirTicketVentaJoyeria(res.data.ticket_data)
        } catch (printError) {
          $q.notify({ type: 'warning', message: 'Venta guardada, pero la impresora no respondió.' })
        }
      }

      $q.notify({ type: 'positive', message: '¡Venta registrada con éxito!', icon: 'check_circle' })

      // Limpiamos y cerramos todo
      showDenominaciones.value = false
      limpiarDatos()

    } catch (error) {
      const mensaje = error.response?.data?.message || error.message || "Error al procesar la venta"
      $q.notify({ type: 'negative', message: 'Error: ' + mensaje })
    } finally {
      $q.loading.hide()
    }
  }

  const limpiarDatos = () => {
    form.value.nota_mostrador = ''
    form.value.cliente = ''
    form.value.descuento = 0
    form.value.efectivo_recibido = 0
    carrito.value = []
    obtenerSiguienteFolio()
  }


  const abrirModalConcepto = () => {
    modalConceptoVisible.value = true
  }

  const quitarUltimoConcepto = () => {
    carrito.value.pop()
  }

  const solicitarDescuento = () => {
    $q.notify({ message: 'Solicitando autorización para descuento...', color: 'warning', icon: 'security' })
  }

  const alCambiarTipoVenta = (val) => {
    if (val === 'PAGOS') {
      form.value.vendedor_id = null
    }
  }

  const accionCargarNota = () => {
    // 1. Abrimos un cuadro de diálogo nativo de Quasar para pedir el Folio
    $q.dialog({
      title: '<div class="text-primary text-weight-bolder uppercase">Cargar Nota de Mostrador</div>',
      message: 'Ingrese el número de Folio:',
      html: true,
      prompt: {
        model: '',
        type: 'number',
        outlined: true,
        dense: true
      },
      cancel: { label: 'Cancelar', flat: true, color: 'grey-8' },
      ok: { label: 'Buscar', unelevated: true, color: 'primary' },
      persistent: true
    }).onOk(async (folio) => {

      if (!folio) return

      $q.loading.show({ message: 'Buscando Nota de Mostrador...' })

      try {
        // 2. Consultamos la API
        const res = await api.get(`/api/ventas-joyeria/nota/${folio}`)
        const nota = res.data.nota
        const detalles = res.data.detalles

        // 3. Diccionarios para traducir las letras de la BD a las palabras del Select
        const mapaTipoVenta = { 'T': 'TOTAL', 'S': 'SEPARADO', 'P': 'PAGOS' }
        const mapaModoPago = { 'C': 'CONTADO', 'V': 'VOUCHER', 'D': 'DEBITO', 'M': 'MIXTO' }

        // 4. Llenamos el encabezado
        form.value.tipo_venta = mapaTipoVenta[nota.tipo_venta] || 'TOTAL'
        form.value.modo = mapaModoPago[nota.modo] || 'CONTADO'
        form.value.nota_mostrador = nota.id
        form.value.vendedor_id = nota.vendedor_id
        form.value.cliente = nota.cliente
        form.value.descuento = Number(nota.descuento)


        form.value.fecha = nota.fecha_movimiento

        // 5. Llenamos el Grid / Carrito con los artículos
        carrito.value = detalles.map(d => ({
          cantidad: Number(d.cantidad),
          concepto: d.concepto,
          importe: Number(d.importe),
          categoria_nombre: d.categoria,
          clasificacion_nombre: d.clasificacion
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

  const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const atajosTeclado = (e) => {
    if (e.key === 'F4') { e.preventDefault(); accionNotaMostrador(); }
    if (e.key === 'F5') { e.preventDefault(); accionCargarNota(); }
    if (e.key === 'F6') { e.preventDefault(); accionAceptarPago(); }
    if (e.key === 'F8') { e.preventDefault(); limpiarDatos(); }
  }

  onMounted(() => {
    obtenerSiguienteFolio()
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

  .label-fixed-mov { width: 100px; font-size: 11px; color: #334155; }

  .input-premium-compact {
    :deep(.q-field__control) { height: 26px !important; min-height: 26px !important; }
    :deep(.q-field__native) { padding: 0 4px !important; font-size: 11px; }
  }

  .table-sicae {
    thead th { font-size: 11px; font-weight: 800; height: 30px; text-transform: uppercase; }
    tbody td { padding: 4px 8px !important; border: 1px solid #e2e8f0; font-size: 11px;}
  }

  .font-mono { font-family: 'JetBrains Mono', monospace; font-weight: bold; }

  .financial-row-mov {
    display: flex; justify-content: space-between; align-items: center; font-size: 12px;
    .val-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 4px 8px; width: 110px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; }
    &.total .val-box-total { font-size: 16px; color: #1e3a8a; border: 2px solid #1e3a8a; font-weight: 900; background: white; padding: 4px 12px; width: 130px; text-align: right; }
  }
</style>
