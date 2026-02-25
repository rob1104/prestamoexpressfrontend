<template>
  <q-page class="q-pa-md bg-slate-50">
    <div class="row items-center q-mb-md justify-between">
      <div class="col-auto">
        <div class="text-h5 text-weight-bolder text-primary uppercase tracking-tighter">
          <q-icon name="ReceiptLong" class="q-mr-sm" /> Préstamo Tradicional
        </div>
      </div>
      <div class="col-auto q-gutter-sm">
        <q-btn outline color="secondary" icon="refresh" label="F7 Limpiar" @click="resetForm" />
        <q-btn outline color="grey-8" icon="logout" label="F9 Salir" to="/" />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-9 q-gutter-y-md">

        <BoletaClienteHeader
          v-model="form"
          @cliente-cambiado="onClienteUpdate"
        >
          <template v-slot:plan-info>
            <div class="column q-pa-md">
              <div class="text-caption text-weight-bold text-primary text-center">PLAZO Y VENCIMIENTO</div>
              <q-select
                v-model="form.plazo_dias"
                :options="[
                  { label:'30 DIAS', value:30 },
                  { label:'15 DIAS', value:15 },
                  { label:'07 DIAS', value:7 },
                  { label:'1 DIA', value:1 },
                ]"
                outlined dense map-options emit-value
                bg-color="white"
                @update:model-value="calcularVencimiento"
              />
              <q-input
                v-model="form.fecha_vencimiento"
                label="Vence el:"
                outlined dense readonly
                bg-color="yellow-1"
                input-class="text-center text-weight-bold"
              />
            </div>
          </template>
        </BoletaClienteHeader>

        <BoletaValuacionGrid
          :precios="cotizacionesActuales"
          @update="onValuacionUpdate"
        />
      </div>

      <div class="col-12 col-md-3">
        <BoletaResumenFinanciero
          :resumen="form"
          @confirmar="saveBoleta"
          class="sticky-resumen"
        />
      </div>
    </div>
    <DialogDenominacion
      ref="dialogoDenominacionRef"
      :montoObjetivo="form.prestamo"
      @confirmado="onDenominacionFinalizada"
    />
  </q-page>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { date, useQuasar } from 'quasar'
  import { api } from 'boot/axios'
  import { PrintService } from 'src/services/PrintService'
  import BoletaClienteHeader from 'components/Boletas/ComponenteBoletaCliente.vue'
  import BoletaValuacionGrid from 'components/Boletas/ComponenteValuacionGrid.vue'
  import BoletaResumenFinanciero from 'components/Boletas/ComponenteResumen.vue'
  import DialogDenominacion from 'src/components/Caja/DialogDenominaciones.vue'


  const $q = useQuasar()

  const valuacionEsValida = ref(true)
  const dialogoDenominacionRef = ref(null)
  const idReciente = ref(null) // Para almacenar el ID de la boleta recién creada y usarlo al registrar el movimiento de caja

  // 1. ESTADO INICIAL DEL FORMULARIO
  const form = ref({
    cliente_id: null,
    no_bolsa: '',
    categoria_id: 1,
    tipo_prestamo: 'tradicional',
    fecha_boleta: date.formatDate(Date.now(), 'YYYY-MM-DD'),
    fecha_vencimiento: '',
    plazo_dias: 30,
    p_interes: 20.00, // Porcentaje de comisión base
    prestamo: 0,
    valor_comercial: 0,
    comision: 0,
    iva_comision: 0,
    total_pagar: 0,
    partidas: [] // Detalle de prendas
  })

  // Cotizaciones de oro según el tipo de cliente
  const cotizacionesActuales = ref({
    '8K': 130, '10K': 150, '14K': 250, '18K': 360, '21K': 430, 'ORO_FINO': 0, 'MEDALLA': 0,
    'M2': 768, 'M25': 912, 'M5': 1776, 'M10': 3600, 'M20': 7200, 'M50': 18000
  })

  // 2. LÓGICA DE CÁLCULO
  const calcularVencimiento = () => {
    const fe = new Date(form.value.fecha_boleta)
    const fv = date.addToDate(fe, { days: form.value.plazo_dias + 1 })

    // Formateamos a 'DD-MMM-YYYY' y forzamos minúsculas
    const fechaFormateada = date.formatDate(fv, 'DD-MMM-YYYY', {
      monthsShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    })

    form.value.fecha_vencimiento = fechaFormateada.toLowerCase() // Resultado: 25-mar-2026
  }

  const onValuacionUpdate = (data) => {
    form.value.partidas = data.partidas //
    form.value.prestamo = data.totalPrestamo //

    // Regla de negocio: Valor comercial es ~25% mayor al préstamo
    form.value.valor_comercial = form.value.prestamo / 0.8

    // Comisiones e IVA
    form.value.comision = form.value.prestamo * (form.value.p_interes / 100)
    form.value.iva_comision = form.value.comision * 0.16
    form.value.total_pagar = form.value.prestamo + form.value.comision //+ form.value.iva_comision
    valuacionEsValida.value = data.esValido
  }

  const onClienteUpdate = (cliente) => {
    if (cliente) {
      // Aquí podrías ajustar el p_interes o cotizaciones según el perfil del cliente
      console.log("Cliente seleccionado:", cliente.nombre_completo)
    }
  }

  // 3. PERSISTENCIA (GUARDADO F6)
  const saveBoleta = async () => {

    if (!form.value.no_bolsa) {
      $q.notify({ type: 'warning', message: 'El Número de Bolsa es requerido.' });
      return;
    }

    if (!form.value.cliente_id || form.value.prestamo <= 0) {
      $q.notify({ type: 'warning', message: 'Seleccione un cliente y valúe al menos una prenda.' })
      return
    }

    if (!valuacionEsValida.value) {
      $q.notify({
        type: 'warning',
        message: 'Todas las prendas con gramos deben tener una descripción.'
      })
      return
    }

    $q.dialog({
      title: 'Confirmar Operación',
      message: '¿Los datos son correctos? Se procederá a generar la boleta e imprimir el ticket.',
      cancel: true,
      persistent: true
    }).onOk(async () => {
      await procesarBoleta()
    })
  }

  const procesarBoleta = async () => {
    $q.loading.show({ message: 'Guardando boleta en el sistema...' })
    try {
      // Guardamos la boleta y obtenemos el ID generado
      const res = await api.post('/api/boletas', form.value)
      const boletaGuardada = res.data.boleta
      idReciente.value = boletaGuardada.id

      $q.loading.show({ message: 'Enviando a la impresora...' })
      try {
        await PrintService.imprimirBoleta(boletaGuardada)
      }
      catch (printerror) {
        $q.notify({
          type: 'warning',
          message: 'Boleta guardada, pero la IMPRESIÓN FALLÓ.',
          timeout: 3000
        });
      }

      $q.loading.hide()

      const confirmarReimpresion = () => {
        return new Promise((resolve) => {
          $q.dialog({
            title: 'Ticket Impreso',
            message: '¿Desea imprimir una COPIA ADICIONAL del ticket?',
            ok: { label: 'SÍ, REIMPRIMIR', color: 'primary', unelevated: true },
            cancel: { label: 'NO, CONTINUAR', flat: true, color: 'grey-7' },
            persistent: true
          }).onOk(async () => {
            try {
              $q.loading.show({ message: 'Imprimiendo copia...' })
              await PrintService.imprimirBoleta(boletaGuardada)
              $q.loading.hide();
            } catch (e) {
              $q.loading.hide();
              $q.notify({ type: 'negative', message: 'Fallo al imprimir la copia.' })
            }
            resolve();
          }).onCancel(() => {
            resolve()
          })
        })
      }
      await confirmarReimpresion()

      $q.dialog({
        title: '<div class="text-orange text-h4 text-weight-bolder">PRESTAMO TRADICIONAL</div>',
        message: `
          <div class="text-center">
            <div class="text-h6">El Número de Folio asignado a la Boleta es</div>
            <div class="text-h2 text-orange text-weight-bolder q-my-md">${boletaGuardada.id}</div>
            <div class="text-h6">Importe del Préstamo</div>
            <div class="text-h3 text-orange text-weight-bolder">$ ${boletaGuardada.prestamo}</div>
          </div>
        `,
        html: true,
        ok: { label: 'Aceptar', color: 'grey-4', textColor: 'black' }
      }).onOk(() => {
        dialogoDenominacionRef.value.show()
      })

    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error: ' + e.response.data.message })
    } finally {
      $q.loading.hide()
    }
  }

  const onDenominacionFinalizada = async (data) => {
    try {
      await api.post(`/api/movimientoscaja/${idReciente.value}/registrar-efectivo`, data)
      $q.notify({ type: 'positive', message: 'Movimiento de caja registrado. Proceso finalizado.' })
      resetForm()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al registrar efectivo: ' + error.message })
    }
  }

  const resetForm = () => {
    window.location.reload() // Forma rápida de limpiar todo el estado
  }

  // Atajos de teclado
  const handleKeys = (e) => {
    if (e.key === 'F6') { e.preventDefault(); saveBoleta(); }
    if (e.key === 'F7') { e.preventDefault(); resetForm(); }
  }


  const formatMoney = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 2 })

  onMounted(() => {
    calcularVencimiento()
    window.addEventListener('keydown', handleKeys)
  })
  onUnmounted(() => window.removeEventListener('keydown', handleKeys))

</script>

<style lang="scss" scoped>
  .financial-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    &.secondary { opacity: 0.8; font-size: 0.9rem; }
    .label { font-weight: 500; }
    .value { font-weight: 900; }
  }

  .sticky-resumen { position: sticky; top: 20px; }
  .bg-yellow-1 { background-color: #fefce8; }
  .tracking-tighter { letter-spacing: -0.04em; }
</style>
