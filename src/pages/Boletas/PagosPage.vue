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
        <div class="text-h6 text-weight-bolder text-italic q-mr-md text-green-8 tracking-tighter">
          Préstamo EN PAGOS
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
            <div class="column q-pa-sm q-gutter-y-xs">
              <div class="text-caption text-weight-bold text-green-8 text-center uppercase">Esquema de Pagos</div>

              <q-select
                v-model="form.meses"
                :options="[1, 2, 3, 4, 5, 6]"
                :option-label="opt => opt + (opt === 1 ? ' MES' : ' MESES')"
                outlined dense bg-color="white"
                label="Plazo"
                @update:model-value="recalcularPagosFijos"
              />

              <q-select
                v-model="form.periodo_id"
                :options="[
                  { label:'1: SEMANAL', value: 1, multiplicador: 4 },
                  { label:'2: CATORCENAL', value: 2, multiplicador: 2 },
                  { label:'3: QUINCENAL', value: 3, multiplicador: 2 },
                  { label:'4: MENSUAL', value: 4, multiplicador: 1 },
                ]"
                outlined dense map-options emit-value
                bg-color="white"
                label="Tipo de pago"
                @update:model-value="recalcularPagosFijos"
              />

              <q-input
                v-model="form.numero_pagos"
                label="No. de Pagos"
                outlined dense readonly
                bg-color="yellow-1"
                input-class="text-center text-weight-bold text-primary text-h6"
              />

            </div>
          </template>
        </BoletaClienteHeader>

        <div v-if="form.categoria_id === 1 || form.categoria_id == '01'">
          <div class="row items-center q-mb-sm q-mt-sm bg-white q-pa-sm border-bottom shadow-1">
            <div class="text-caption text-weight-bold q-mr-sm text-green-8 uppercase">Cotización de Oro:</div>
            <q-select
              v-model="clasificacionActual"
              :options="['NUEVO', 'BUENO', 'EXCELENTE', 'COMPRA']"
              outlined dense bg-color="green-1" class="col-4"
              @update:model-value="onClasificacionChange"
            >
              <template v-slot:prepend><q-icon name="military_tech" color="orange-8" /></template>
            </q-select>
            <q-space />
            <div v-if="hasSelectedClient" class="text-caption text-grey-7 italic">
              El cambio se guardará en el perfil del cliente.
            </div>
          </div>

          <BoletaValuacionGrid
            :precios="cotizacionesActuales"
            @update="onValuacionUpdate"
          />
        </div>

        <div v-else-if="form.categoria_id === 5 || form.categoria_id == '05'" class="q-mt-sm">
          <BoletaValuacionElectronicos
            @update="onValuacionUpdate"
          />
        </div>
      </div>

      <div class="col-12 col-md-4 q-gutter-y-sm">

        <div class="row items-center no-wrap q-mt-xs">
          <div class="text-caption text-weight-bold q-mr-xs">PROMOCIÓN:</div>
          <q-select
            emit-value map-options
            v-model="form.promocion_id"
            :options="promocionesOptions"
            outlined dense class="col input-premium-compact"
            bg-color="green-1"
            @update:model-value="onPromocionChange"
          />
        </div>

        <q-card flat bordered class="bg-white shadow-2">
          <q-card-section class="q-pa-sm">
             <BoletaResumenFinanciero :resumen="form" @confirmar="saveBoleta" />

             <div class="q-mt-sm q-pa-sm bg-grey-2 border-radius-sm" v-if="form.numero_pagos > 0">
               <div class="text-caption text-weight-bold text-center text-grey-8 q-mb-xs">DESGLOSE DE PAGOS FIJOS</div>
               <div class="row justify-between text-caption">
                 <span>Total de Pagos:</span>
                 <span class="text-weight-bold">{{ form.numero_pagos }}</span>
               </div>
               <div class="row justify-between text-caption">
                 <span>{{ form.numero_pagos - 1 }} Pagos de:</span>
                 <span class="text-weight-bold text-primary">$ {{ formatMoney(form.pago_fijo) }}</span>
               </div>
               <div class="row justify-between text-caption">
                 <span>1 Pago final de:</span>
                 <span class="text-weight-bold text-orange-9">$ {{ formatMoney(form.ultimo_pago) }}</span>
               </div>
             </div>
             <div class="q-mt-md" v-if="tablaAmortizacion.length > 0">
               <div class="text-caption text-weight-bolder text-center text-green-9 q-mb-xs">
                 TABLA DE AMORTIZACIÓN
               </div>

               <q-markup-table dense flat bordered class="tabla-amortizacion bg-grey-1">
                 <thead>
                   <tr>
                     <th class="text-left">No. Pago</th>
                     <th class="text-left">Fecha Vence</th>
                     <th class="text-left">Día</th>
                     <th class="text-right">S. Inicial</th>
                     <th class="text-right">Capital</th>
                     <th class="text-right">Comisión</th>
                     <th class="text-right">S. Final</th>
                     <th class="text-right text-weight-bolder">Pago</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr v-for="fila in tablaAmortizacion" :key="fila.no_pago">
                     <td class="text-left font-mono">{{ fila.no_pago }}</td>
                     <td class="text-left font-mono">{{ fila.fecha_vencimiento }}</td>
                     <td class="text-left">{{ fila.dia }}</td>
                     <td class="text-right font-mono">$ {{ formatMoney(fila.saldo_inicial) }}</td>
                     <td class="text-right font-mono">$ {{ formatMoney(fila.capital) }}</td>
                     <td class="text-right font-mono">$ {{ formatMoney(fila.comision) }}</td>
                     <td class="text-right font-mono">$ {{ formatMoney(fila.saldo_final) }}</td>
                     <td class="text-right font-mono text-weight-bold text-primary">
                       $ {{ formatMoney(fila.pago_requerido) }}
                     </td>
                   </tr>
                 </tbody>
                 <tfoot class="bg-grey-3 text-weight-bold">
                   <tr>
                     <td colspan="3" class="text-right">TOTALES:</td>
                     <td class="text-right font-mono">$ {{ formatMoney(form.prestamo) }}</td>
                     <td class="text-right font-mono">$ {{ formatMoney(form.prestamo) }}</td>
                     <td class="text-right font-mono">$ {{ formatMoney(form.comision) }}</td>
                     <td class="text-right font-mono">-</td>
                     <td class="text-right font-mono text-green-9">$ {{ formatMoney(form.total_pagar) }}</td>
                   </tr>
                 </tfoot>
               </q-markup-table>
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
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { date, useQuasar } from 'quasar'
  import { api } from 'boot/axios'
  import { PrintService } from 'src/services/PrintService'

  import BoletaClienteHeader from 'components/Boletas/ComponenteBoletaCliente.vue'
  import BoletaValuacionGrid from 'components/Boletas/ComponenteValuacionGrid.vue'
  import BoletaValuacionElectronicos from 'components/Boletas/ComponenteValuacionElectronicos.vue'
  import BoletaResumenFinanciero from 'components/Boletas/ComponenteResumen.vue'
  import DialogDenominacion from 'src/components/Caja/DialogDenominaciones.vue'
  import BoletaDashboardStats from 'components/Boletas/BoletaDashboardStats.vue'

  const $q = useQuasar()
  const hasSelectedClient = ref(false)
  const clientStats = ref({})
  const promocionesOptions = ref([])
  const valuacionEsValida = ref(true)
  const dialogoDenominacionRef = ref(null)
  const idReciente = ref(null)
  const clasificacionActual = ref('NUEVO')
  const cotizacionesDB = ref([])
  const cotizacionesActuales = ref({})

  const configSistema = ref({ p_interes: 20.00, iva_tasa: 0.16 })

  const tablaAmortizacion = ref([])
  const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fechaFormateada = (fecha) => date.formatDate(new Date(fecha), 'DD-MMM-YYYY').toLowerCase()

  const form = ref({
    cliente_id: null,
    no_bolsa: '',
    categoria_id: 1,
    promocion_id: 1,
    tipo_prestamo: 'pagos', // Etiqueta clave para el backend
    fecha_boleta: fechaFormateada(new Date()),

    // --- NUEVAS VARIABLES DE PAGOS ---
    meses: 1,
    periodo_id: 1,
    numero_pagos: 0,
    pago_fijo: 0,
    ultimo_pago: 0,
    // ---------------------------------

    p_interes: 20.00,
    prestamo: 0,
    valor_comercial: 0,
    comision: 0,
    iva_comision: 0,
    total_pagar: 0,
    partidas: []
  })

  // Limpiamos los cálculos si el usuario cambia de categoría
  watch(() => form.value.categoria_id, (nuevaCategoria, viejaCategoria) => {
    if (nuevaCategoria !== viejaCategoria) {
      form.value.prestamo = 0
      form.value.total_pagar = 0
      form.value.comision = 0
      form.value.valor_comercial = 0
      form.value.partidas = []
      valuacionEsValida.value = false
    }
  })

  const calcularPMT = (rate, nper, pv) => {
    if (rate === 0) return pv / nper;
    const pvif = Math.pow(1 + rate, nper);
    return (rate * pv * pvif) / (pvif - 1);
  }

  // -------------------------------------------------------------------------
  // EL CORAZÓN DE LOS PRÉSTAMOS EN PAGOS (LÓGICA MATEMÁTICA)
  // -------------------------------------------------------------------------
  const recalcularPagosFijos = () => {
    tablaAmortizacion.value = []; // Limpiamos la tabla anterior

    let multiplicador = 1;
    let diasAErrojar = 0;
    let mesesASumar = 0;

    // Asignamos los días exactos de salto por cada periodo
    if (form.value.periodo_id === 1) { multiplicador = 4; diasAErrojar = 7; } // Semanal
    if (form.value.periodo_id === 2) { multiplicador = 2; diasAErrojar = 14; } // Catorcenal
    if (form.value.periodo_id === 3) { multiplicador = 2; diasAErrojar = 15; } // Quincenal
    if (form.value.periodo_id === 4) { multiplicador = 1; mesesASumar = 1; } // Mensual

    form.value.numero_pagos = form.value.meses * multiplicador;

    if (form.value.prestamo <= 0) {
        form.value.comision = 0;
        form.value.total_pagar = 0;
        form.value.pago_fijo = 0;
        form.value.ultimo_pago = 0;
        return;
    }

    const prestamo = form.value.prestamo;
    const periodos = form.value.numero_pagos;
    const tasaPeriodo = (form.value.p_interes / 100) / multiplicador;

    const pagoFijoExacto = calcularPMT(tasaPeriodo, periodos, prestamo);
    const pagoFijo = Math.round(pagoFijoExacto);

    let saldo = prestamo;
    let totalIntereses = 0;

    // Convertimos la fecha base (hoy) a un objeto manipulable
    let fechaCiclo = new Date(form.value.fecha_boleta);

    for (let i = 1; i <= periodos; i++) {
        // 1. Calcular la fecha de vencimiento de este pago
        if (mesesASumar > 0) {
            fechaCiclo = date.addToDate(fechaCiclo, { months: mesesASumar });
        } else {
            fechaCiclo = date.addToDate(fechaCiclo, { days: diasAErrojar });
        }

        // 2. Definir si es el último pago
        const esUltimo = (i === periodos);

        // 3. Matemáticas del renglón
        let interes = Math.round((saldo * tasaPeriodo) * 100) / 100;
        let pagoActual = pagoFijo;

        if (esUltimo) {
            pagoActual = Math.round(saldo + (saldo * tasaPeriodo));
            interes = pagoActual - saldo;
        }

        let capital = pagoActual - interes;
        let saldoFinal = saldo - capital;

        // 4. Guardar el renglón en nuestra nueva tabla
        tablaAmortizacion.value.push({
            no_pago: `${String(i).padStart(2, '0')}/${String(periodos).padStart(2, '0')}`,
            fecha_vencimiento: date.formatDate(fechaCiclo, 'DD-MMM-YYYY').toLowerCase(),
            dia: nombresDias[fechaCiclo.getDay()],
            saldo_inicial: saldo,
            capital: capital,
            comision: interes,
            saldo_final: Math.max(0, saldoFinal), // Evitamos el -0.00
            pago_requerido: pagoActual
        });

        // 5. Preparar saldo para la siguiente vuelta
        saldo = saldoFinal;
        totalIntereses += interes;
    }

    form.value.pago_fijo = pagoFijo;
    form.value.ultimo_pago = tablaAmortizacion.value[tablaAmortizacion.value.length - 1].pago_requerido;
    form.value.comision = Number(totalIntereses.toFixed(2));
    form.value.iva_comision = form.value.comision * configSistema.value.iva_tasa;
    form.value.total_pagar = prestamo + form.value.comision;

    if (tablaAmortizacion.value.length > 0) {
        form.value.fecha_vencimiento = tablaAmortizacion.value[tablaAmortizacion.value.length - 1].fecha_vencimiento;
    }

  }

  const onValuacionUpdate = (data) => {
    form.value.partidas = data.partidas

    // Mantenemos la lógica de redondeo para que en caja no existan monedas sueltas
    form.value.prestamo = form.value.categoria_id === 1 || form.value.categoria_id === '01'
                          ? Math.ceil(data.totalPrestamo / 10) * 10
                          : data.totalPrestamo

    form.value.valor_comercial = form.value.prestamo * 1.10
    valuacionEsValida.value = data.esValido

    // Lanzamos el recálculo
    recalcularPagosFijos()
  }

  // ... (Aquí van las demás funciones que ya tienes: cargarCotizacionesOro,
  // aplicarPreciosPorClasificacion, cargarPromociones, saveBoleta, etc.
  // Son exactamente iguales que en TradicionalPage.vue)

  const onClienteUpdate = async (cliente) => {
    if (cliente && cliente.id) {
      hasSelectedClient.value = true
      clasificacionActual.value = cliente.clasificacion || 'NUEVO'
      // aplicarPreciosPorClasificacion(clasificacionActual.value) // Descomentar cuando agregues la función
      try {
        const res = await api.get(`/api/clientes/${cliente.id}/stats`)
        clientStats.value = res.data
      } catch (e) { console.error(e) }
    } else {
      hasSelectedClient.value = false
      clientStats.value = {}
    }
  }

  // --- MOCK TEMPORAL (Rellena con tus funciones de carga) ---
  const onPromocionChange = () => { recalcularPagosFijos() }

  const onClasificacionChange = () => {}

  const saveBoleta = () => {
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
      message: '¿Los datos son correctos? Se generará la boleta EN PAGOS y su calendario de plazos.',
      cancel: true,
      persistent: true
    }).onOk(() => procesarBoleta())
  }

  const procesarBoleta = async () => {
    $q.loading.show({ message: 'Guardando boleta en pagos...' })
    try {
      // 1. Enviamos el Payload a Laravel (incluye meses, numero_pagos, pago_fijo, etc.)
      const payload = {
        ...form.value,
        calendario: tablaAmortizacion.value // Aquí va toda la tabla de pagos
      }
      const res = await api.post('/api/boletas', payload)
      const boletaGuardada = res.data.boleta
      idReciente.value = boletaGuardada.id

      // 2. Imprimimos el ticket
      try {
        await PrintService.imprimirBoleta(boletaGuardada)
      } catch (e) {
        $q.notify({ type: 'warning', message: 'Impresión fallida, pero boleta guardada.' });
      }

      $q.loading.hide()

      // 3. Diálogo para copia adicional
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

      // 4. Aviso del Folio Asignado (Mismo diseño, pero en color verde para Pagos)
      $q.dialog({
        title: '<div class="text-green-8 text-h4 text-weight-bolder">FOLIO ASIGNADO</div>',
        message: `
          <div class="text-center">
            <div class="text-h2 text-green-8 text-weight-bolder q-my-md">${boletaGuardada.id}</div>
            <div class="text-h4 text-grey-9">$ ${boletaGuardada.prestamo}</div>
          </div>
        `,
        html: true,
        ok: { label: 'Aceptar', color: 'grey-4', textColor: 'black' }
      }).onOk(() => dialogoDenominacionRef.value.show()) // 5. Abre la ventana de monedas

    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error de servidor: ' + (e.response?.data?.message || e.message) })
    } finally {
      $q.loading.hide()
    }
  }

  const resetForm = () => window.location.reload()

  const onDenominacionFinalizada = async (data) => {
    try {
      await api.post(`/api/movimientoscaja/${idReciente.value}/registrar-efectivo`, data)
      $q.notify({ type: 'positive', message: 'Operación finalizada con éxito.' })
      resetForm()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error en caja: ' + error.message })
    }
  }
  // ----------------------------------------------------------

  const handleKeys = (e) => {
    if (e.key === 'F6') { e.preventDefault(); saveBoleta(); }
    if (e.key === 'F7') { e.preventDefault(); resetForm(); }
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

  const cargarCotizacionesOro = async () => {
    try {
      const res = await api.get('/api/config/cotizacionoro')
      cotizacionesDB.value = res.data
      console.log("Cotizaciones de oro cargadas:", cotizacionesDB.value)
      aplicarPreciosPorClasificacion(clasificacionActual.value)
    } catch (e) {
      console.error("Error al cargar cotizaciones de oro:", e)
    }
  }

  const aplicarPreciosPorClasificacion = (clasificacion) => {
    if (!cotizacionesDB.value.gramos || !cotizacionesDB.value.monedas) return;

    // 1. Identificamos qué columna de la base de datos vamos a leer
    let columnaPrecio = 'precio_nuevo'; // Por defecto
    const clasifBuscada = String(clasificacion).trim().toUpperCase();

    if (clasifBuscada === 'NUEVO') {
      columnaPrecio = 'precio_nuevo';
    } else if (clasifBuscada === 'BUENO') {
      columnaPrecio = 'precio_bueno';
    } else if (clasifBuscada === 'EXCELENTE') {
      columnaPrecio = 'precio_excelente';
    } else if (clasifBuscada === 'COMPRA') {
      columnaPrecio = 'precio_compra';
    }

    // 2. Función "Buscadora" para encontrar el precio exacto de cada metal
    const getPrecio = (arreglo, nombreDescripcion) => {
      // Busca la fila donde la descripción sea "8K", "10K", etc.
      const fila = arreglo.find(item =>
        String(item.descripcion).trim().toUpperCase() === String(nombreDescripcion).trim().toUpperCase()
      );
      // Si la encuentra, devuelve el valor de la columna que elegimos arriba
      return fila ? parseFloat(fila[columnaPrecio]) || 0 : 0;
    };

    const g = cotizacionesDB.value.gramos;
    const m = cotizacionesDB.value.monedas;

    // 3. Asignamos los precios buscando cada metal por su descripción en BD
    cotizacionesActuales.value = {
      '8K': getPrecio(g, '8K'),
      '10K': getPrecio(g, '10K'),
      '14K': getPrecio(g, '14K'),
      '18K': getPrecio(g, '18K'),
      '21K': getPrecio(g, '21K'),
      'ORO_FINO': getPrecio(g, 'ORO FINO') || getPrecio(g, 'ORO_FINO'),
      'MEDALLA': getPrecio(g, 'MEDALLA'),

      // MONEDAS: He puesto varias opciones de búsqueda por si en tu BD se llaman diferente
      // (ej. si guardaste "2 PESOS" en lugar de "M2")
      'M2': getPrecio(m, 'M2') || getPrecio(m, '2 PESOS'),
      'M25': getPrecio(m, 'M25') || getPrecio(m, 'M2.5') || getPrecio(m, '2.5 PESOS') || getPrecio(m, '2 1/2 PESOS'),
      'M5': getPrecio(m, 'M5') || getPrecio(m, '5 PESOS'),
      'M10': getPrecio(m, 'M10') || getPrecio(m, '10 PESOS'),
      'M20': getPrecio(m, 'M20') || getPrecio(m, '20 PESOS'),
      'M50': getPrecio(m, 'M50') || getPrecio(m, '50 PESOS')
    };

    console.log("Precios actualizados para el Grid:", cotizacionesActuales.value);

    // 4. Forzamos el recálculo en la tabla si el cajero ya había capturado gramos
    if (form.value.prestamo > 0) {
      form.value.partidas = [...form.value.partidas];
    }
  }

  onMounted(() => {
    cargarParametrosSistema()
    cargarPromociones()
    cargarCotizacionesOro()
    window.addEventListener('keydown', handleKeys)
  })
  onUnmounted(() => window.removeEventListener('keydown', handleKeys))
</script>

<style lang="scss" scoped>
  .bg-blue-grey-1 { background-color: #f0f4f7; }
  .btn-sicae { font-size: 10px; width: 85px; border: 1px solid #ddd; margin-right: 2px; background: white; }
  .border-bottom { border-bottom: 2px solid #bdbdbd; }
  .tracking-tighter { letter-spacing: -0.04em; }
  .tabla-amortizacion {
    th {
      font-size: 0.65rem;
      padding: 4px !important;
      background-color: #e2e8f0;
      color: #334155;
    }
    td {
      font-size: 0.70rem;
      padding: 2px 4px !important;
    }
    .font-mono {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      letter-spacing: -0.03em;
    }
  }
</style>
