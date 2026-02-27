<template>
  <q-page class="q-pa-sm bg-blue-grey-1">
    <div class="row q-col-gutter-xs q-mb-sm bg-white border-bottom q-pa-xs items-center">
      <div class="col-auto row q-gutter-xs">
        <q-btn flat dense color="grey-9" icon="save" label="F6 Confirmar" @click="saveBoleta" class="btn-sicae" stack />
        <q-btn flat dense color="blue-9" icon="refresh" label="F7 Limpiar" @click="resetForm" class="btn-sicae" stack />
        <q-btn flat dense color="red-9" icon="logout" label="F9 Salir" to="/" class="btn-sicae" stack />
      </div>
      <q-space />
      <div class="col-auto">
        <div class="text-h6 text-weight-bolder text-italic q-mr-md text-primary tracking-tighter">
          Préstamo TRADICIONAL
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-sm">

      <div class="col-12 col-md-8 q-gutter-y-sm">
        <BoletaClienteHeader
          v-model="form"
          @cliente-cambiado="onClienteUpdate"
        >
          <template v-slot:plan-info>
            <div class="column q-pa-sm">
              <div class="text-caption text-weight-bold text-primary text-center uppercase">Plazo y Vencimiento</div>
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
                outlined dense readonly
                bg-color="yellow-1"
                input-class="text-center text-weight-bold"
                class="q-mt-xs"
              />

            </div>
          </template>
        </BoletaClienteHeader>

        <BoletaValuacionGrid
          :precios="cotizacionesActuales"
          @update="onValuacionUpdate"
        />
      </div>

      <div class="col-12 col-md-4 q-gutter-y-sm">
        <div class="row items-center no-wrap q-mt-xs">
                <div class="text-caption text-weight-bold q-mr-xs">PROMOCIÓN:</div>
                <q-select
                  emit-value
                  map-options
                  v-model="form.promocion_id"
                  :options="promocionesOptions"
                  outlined dense
                  class="col input-premium-compact"
                  bg-color="blue-1"
                  @update:model-value="onPromocionChange"
                />
              </div>
        <q-card flat bordered class="bg-white shadow-2">
          <q-card-section class="row no-wrap items-center q-pa-none">
            <div class="col-12">
               <BoletaResumenFinanciero :resumen="form" @confirmar="saveBoleta" />
            </div>
          </q-card-section>
        </q-card>

        <BoletaDashboardStats :data="clientStats" :clienteSeleccionado="hasSelectedClient" />
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

  // Componentes locales
  import BoletaClienteHeader from 'components/Boletas/ComponenteBoletaCliente.vue'
  import BoletaValuacionGrid from 'components/Boletas/ComponenteValuacionGrid.vue'
  import BoletaResumenFinanciero from 'components/Boletas/ComponenteResumen.vue'
  import DialogDenominacion from 'src/components/Caja/DialogDenominaciones.vue'
  import BoletaDashboardStats from 'components/Boletas/BoletaDashboardStats.vue'

  const clientStats = ref({})
  const hasSelectedClient = ref(false)
  const promocionesOptions = ref([])

  const $q = useQuasar()

  const valuacionEsValida = ref(true)
  const dialogoDenominacionRef = ref(null)
  const idReciente = ref(null)

  const fechaFormateada = (fecha) => {
    const f = new Date(fecha)
    return date.formatDate(f, 'DD-MMM-YYYY', {
      monthsShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    }).toLowerCase()
  }

  const form = ref({
    cliente_id: null,
    no_bolsa: '',
    categoria_id: 1,
    promocion_id: 1,
    tipo_prestamo: 'tradicional',
    fecha_boleta: fechaFormateada(new Date()),
    fecha_vencimiento: '',
    plazo_dias: 30,
    p_interes: 20.00,
    prestamo: 0,
    valor_comercial: 0,
    comision: 0,
    iva_comision: 0,
    total_pagar: 0,
    partidas: []
  })

  const configSistema = ref({
    p_interes: 20.00,
    iva_tasa: 0.16
  })

  const cargarPromociones = async () => {
    try {
      const res = await api.get('/api/promociones')
      promocionesOptions.value = res.data.map(p => ({
        label: `${p.nombre}`,
        value: p.id,
        dias_regalo: p.dias_regalo,
        cambio_comision: p.cambio_comision
      }))

      const existeSinPromo = promocionesOptions.value.find(p => p.value === 1)

      if (!existeSinPromo) {
        // Si no existe en la DB, la agregamos manualmente al principio
        promocionesOptions.value.unshift({
          label: 'SIN PROMOCION',
          value: 1,
          dias_regalo: 0,
          cambio_comision: configSistema.value.p_interes
        })
      }

      // Ejecutamos el cambio una vez cargado para aplicar comisiones iniciales
      onPromocionChange(form.value.promocion_id)

    } catch (e) {
      console.error("Error al cargar promociones:", e)
    }
  }

  const onPromocionChange = (promoId) => {
    // Buscamos la promoción en nuestro arreglo de opciones
    const promo = promocionesOptions.value.find(p => p.value === promoId)

    if (promo) {
      // Si cambio_comision es 0, usamos el valor por defecto del sistema
      if (parseFloat(promo.cambio_comision) === 0) {
        form.value.p_interes = configSistema.value.p_interes
      } else {
        // Si es distinto de 0, aplicamos el valor de la promoción
        form.value.p_interes = promo.cambio_comision
      }
    } else {
      // Si no hay promoción (opción nula), regresamos al valor base
      form.value.p_interes = configSistema.value.p_interes
    }

    // Recalcular fechas y montos financieros
    calcularVencimiento()
    onValuacionUpdate({
      partidas: form.value.partidas,
      totalPrestamo: form.value.prestamo,
      esValido: valuacionEsValida.value
    })
  }

  const cargarParametrosSistema = async () => {
    try {
      const res = await api.get('/api/config/parametros');
      const data = res.data;

      // Actualizamos el estado de referencia
      configSistema.value = {
        p_interes: parseFloat(data.generales.p_comision),
        iva_tasa: parseFloat(data.generales.p_iva) / 100
      };

      // Aplicamos los valores iniciales al formulario
      form.value.p_interes = configSistema.value.p_interes;

    } catch (e) {
      console.error("Error al cargar configuración:", e);
      $q.notify({ type: 'warning', message: 'Usando configuración de respaldo.' });
    }
  }


  const cotizacionesActuales = ref({
    '8K': 130, '10K': 150, '14K': 250, '18K': 360, '21K': 430, 'ORO_FINO': 0, 'MEDALLA': 0,
    'M2': 768, 'M25': 912, 'M5': 1776, 'M10': 3600, 'M20': 7200, 'M50': 18000
  })

  const calcularVencimiento = () => {
    const promo = promocionesOptions.value.find(p => p.value === form.value.promocion_id)
    const diasExtra = promo ? promo.dias_regalo : 0
    const fe = new Date(form.value.fecha_boleta)
    const fv = date.addToDate(fe, { days: form.value.plazo_dias + diasExtra })
    form.value.fecha_vencimiento = fechaFormateada(fv)
  }

  const onValuacionUpdate = (data) => {
    form.value.partidas = data.partidas
    form.value.prestamo = Math.ceil(data.totalPrestamo / 10) * 10
    form.value.valor_comercial = Math.ceil(form.value.prestamo / 10) * 10 * 1.10
    form.value.comision = form.value.prestamo * (form.value.p_interes / 100)
    form.value.iva_comision = form.value.comision * configSistema.value.iva_tasa
    form.value.total_pagar = form.value.prestamo + form.value.comision
    valuacionEsValida.value = data.esValido
  }

  const onClienteUpdate = async (cliente) => {
    if (cliente && cliente.id) {
      hasSelectedClient.value = true
      try {
        const res = await api.get(`/api/clientes/${cliente.id}/stats`)
        clientStats.value = res.data
      }
      catch (e) {
        console.error("Error al cargar estadísticas del cliente:", e)
      }
    }
    else {
      hasSelectedClient.value = false
      clientStats.value = {}
    }
  }

  const saveBoleta = async () => {
    if (!form.value.no_bolsa) {
      $q.notify({ type: 'warning', message: 'El Número de Bolsa es requerido.' });
      return;
    }
    if (!form.value.cliente_id || form.value.prestamo <= 0) {
      $q.notify({ type: 'warning', message: 'Seleccione un cliente y valúe una prenda.' })
      return
    }
    if (!valuacionEsValida.value) {
      $q.notify({ type: 'warning', message: 'Faltan descripciones en las prendas con peso.' })
      return
    }

    $q.dialog({
      title: 'Confirmar Operación',
      message: '¿Los datos son correctos? Se procederá a generar e imprimir.',
      cancel: true,
      persistent: true
    }).onOk(() => procesarBoleta())
  }

  const procesarBoleta = async () => {
    $q.loading.show({ message: 'Guardando boleta...' })
    try {
      const res = await api.post('/api/boletas', form.value)
      const boletaGuardada = res.data.boleta
      idReciente.value = boletaGuardada.id

      try {
        await PrintService.imprimirBoleta(boletaGuardada)
      } catch (e) {
        $q.notify({ type: 'warning', message: 'Impresión fallida, pero boleta guardada.' });
      }

      $q.loading.hide()

      // Diálogo de copia adicional
      await new Promise((resolve) => {
        $q.dialog({
          title: 'Impresión',
          message: '¿Desea una copia adicional?',
          ok: 'SÍ, REIMPRIMIR',
          cancel: 'NO',
          persistent: true
        }).onOk(async () => {
          await PrintService.imprimirBoleta(boletaGuardada);
          resolve();
        }).onCancel(() => resolve())
      })

      // Aviso de Folio
      $q.dialog({
        title: '<div class="text-orange text-h4 text-weight-bolder">FOLIO ASIGNADO</div>',
        message: `
          <div class="text-center">
            <div class="text-h2 text-orange text-weight-bolder q-my-md">${boletaGuardada.id}</div>
            <div class="text-h4 text-grey-9">$ ${boletaGuardada.prestamo}</div>
          </div>
        `,
        html: true,
        ok: { label: 'Aceptar', color: 'grey-4', textColor: 'black' }
      }).onOk(() => dialogoDenominacionRef.value.show())

    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error de servidor.' })
    } finally {
      $q.loading.hide()
    }
  }

  const onDenominacionFinalizada = async (data) => {
    try {
      await api.post(`/api/movimientoscaja/${idReciente.value}/registrar-efectivo`, data)
      $q.notify({ type: 'positive', message: 'Operación finalizada con éxito.' })
      resetForm()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error en caja: ' + error.message })
    }
  }

  const resetForm = () => window.location.reload()

  const handleKeys = (e) => {
    if (e.key === 'F6') { e.preventDefault(); saveBoleta(); }
    if (e.key === 'F7') { e.preventDefault(); resetForm(); }
  }

  onMounted(() => {
    cargarParametrosSistema()
    cargarPromociones()
    calcularVencimiento()
    window.addEventListener('keydown', handleKeys)
  })
  onUnmounted(() => window.removeEventListener('keydown', handleKeys))
</script>

<style lang="scss" scoped>
  .bg-blue-grey-1 { background-color: #f0f4f7; }
  .btn-sicae { font-size: 10px; width: 85px; border: 1px solid #ddd; margin-right: 2px; background: white; }
  .border-bottom { border-bottom: 2px solid #bdbdbd; }
  .bg-yellow-1 { background-color: #fefce8; }
  .tracking-tighter { letter-spacing: -0.04em; }
  .select-none { user-select: none; }
</style>
