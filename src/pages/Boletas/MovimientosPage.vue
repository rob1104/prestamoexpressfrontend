<template>
  <q-page class="q-pa-sm bg-blue-grey-1">
    <div class="row q-col-gutter-xs q-mb-sm bg-white border-bottom q-pa-xs items-center shadow-1">
      <div class="col-auto row q-gutter-xs">
        <q-btn flat dense color="grey-9" icon="save" label="F6 Confirmar" @click="confirmarPago" class="btn-sicae" stack />
        <q-btn flat dense color="blue-9" icon="refresh" label="F7 Limpiar" @click="resetModulo" class="btn-sicae" stack />
        <q-btn flat dense color="red-9" icon="logout" label="F9 Salir" to="/" class="btn-sicae" stack />
      </div>
      <q-space />
      <div class="text-h6 text-weight-bolder text-italic q-mr-md text-primary tracking-tighter uppercase">
        Movimientos de Tradicional
      </div>
    </div>

    <q-card flat bordered class="q-mb-sm bg-white">
      <q-card-section class="q-pa-sm">
        <div class="row q-col-gutter-sm items-center">
          <div class="col-12 col-md-3 row items-center no-wrap">
            <div class="label-fixed-mov text-weight-bold q-mr-xs">Folio:</div>
            <q-input
              v-model="busquedaFolio"
              outlined dense
              class="col input-premium-compact"
              input-class="text-weight-bolder text-primary"
              @keyup.enter="buscarBoleta"
              autofocus
            />
          </div>
          <div class="col-12 col-md-6 row items-center no-wrap">
            <div class="label-fixed-mov text-weight-bold q-mr-xs">Fecha Movimiento:</div>
            <q-input
              v-model="fechaMovimiento"
              outlined dense readonly
              bg-color="grey-1"
              class="col input-premium-compact"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-sm">
      <div class="col-12 col-md-8">
        <q-card flat bordered class="full-height">
          <q-card-section class="q-pa-sm q-gutter-y-xs">
            <div class="row q-col-gutter-xs">
              <div class="col-9 row items-center no-wrap">
                <div class="label-fixed-mov text-weight-bold">Cliente:</div>
                <q-input v-model="boleta.cliente_nombre" outlined dense readonly class="col input-premium-compact" />
              </div>
              <div class="col-3 row items-center no-wrap">
                <q-input v-model="boleta.cliente_id" outlined dense readonly class="col input-premium-compact text-center" />
              </div>
            </div>

            <div class="row q-col-gutter-xs">
              <div class="col-9 row items-center no-wrap">
                <div class="label-fixed-mov text-weight-bold">Identificación:</div>
                <q-input v-model="boleta.identificacion" outlined dense readonly class="col input-premium-compact" />
              </div>
              <div class="col-3 row items-center no-wrap">
                <div class="text-caption q-mr-xs">D.R.</div>
                <q-input v-model="boleta.dr" outlined dense readonly class="col input-premium-compact text-center" />
              </div>
            </div>

            <div class="row q-col-gutter-xs q-mt-xs">
              <div class="col-4">
                <div class="row items-center no-wrap q-mb-xs">
                  <span class="label-mini">No. Bolsa:</span>
                  <q-input v-model="boleta.no_bolsa" outlined dense readonly class="col input-premium-compact" />
                </div>
                <div class="row items-center no-wrap q-mb-xs">
                  <span class="label-mini">Préstamo:</span>
                  <q-input v-model="boleta.prestamo" outlined dense readonly class="col input-premium-compact text-right" prefix="$" />
                </div>
                <div class="row items-center no-wrap">
                  <span class="label-mini">Comisión:</span>
                  <q-input v-model="boleta.comision" outlined dense readonly class="col input-premium-compact text-right" prefix="$" />
                </div>
              </div>

              <div class="col-4">
                <div class="row items-center no-wrap q-mb-xs">
                  <span class="label-mini">Fecha:</span>
                  <q-input v-model="boleta.fecha_boleta" outlined dense readonly class="col input-premium-compact" />
                </div>
                <div class="row items-center no-wrap q-mb-xs">
                  <span class="label-mini">Categoría:</span>
                  <q-input v-model="boleta.categoria" outlined dense readonly class="col input-premium-compact" />
                </div>
                <div class="row items-center no-wrap">
                  <span class="label-mini">Estatus:</span>
                  <q-input v-model="boleta.estatus" outlined dense readonly class="col input-premium-compact text-caption" />
                </div>
              </div>

              <div class="col-4">
                <div class="row items-center no-wrap q-mb-xs">
                  <span class="label-mini">Próx. Venc:</span>
                  <q-input v-model="boleta.fecha_vencimiento" outlined dense readonly class="col input-premium-compact text-weight-bolder" bg-color="amber-1" />
                </div>
                <div class="row items-center no-wrap q-mb-xs">
                  <span class="label-mini">Pago Fácil:</span>
                  <q-input v-model="boleta.pago_facil" outlined dense readonly class="col input-premium-compact text-center" />
                </div>
                <div class="row items-center no-wrap">
                  <span class="label-mini">Plazo:</span>
                  <q-input v-model="boleta.plazo" outlined dense readonly class="col input-premium-compact text-center" />
                </div>
              </div>
            </div>

            <div class="q-mt-sm">
              <div class="text-caption text-weight-bold">Descripción:</div>
              <q-input
                v-model="boleta.descripcion"
                type="textarea"
                outlined dense readonly
                rows="2"
                input-style="font-size: 11px"
                bg-color="grey-1"
              />
            </div>

            <div class="row q-col-gutter-xs q-mt-md justify-around">
              <q-btn
                unelevated color="orange-9" icon="priority_high" label="Refrendo"
                class="col-auto action-btn" @click="prepararRefrendo" :disabled="!boleta.id"
              />
              <q-btn
                unelevated color="green-9" icon="timer" label="Liquidación"
                class="col-auto action-btn" @click="prepararLiquidacion" :disabled="!boleta.id"
              />
              <q-btn
                unelevated color="blue-9" icon="add_card" label="Abono Capital"
                class="col-auto action-btn" @click="prepararAbono" :disabled="!boleta.id"
              />
              <q-btn
                outline color="grey-7" icon="payments" label="Abonitos"
                class="col-auto action-btn" :disabled="!boleta.id"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="bg-white">
          <q-card-section class="q-pa-sm">
            <div v-if="pago.importe > 0" class="text-center q-mb-sm">
              <q-badge :color="pago.importe === boleta.total_pagar ? 'green-9' : 'orange-9'" class="q-pa-xs full-width">
                MODO: {{ pago.importe === boleta.total_pagar ? 'LIQUIDACIÓN' : 'REFRENDO' }}
              </q-badge>
            </div>
            <div class="column q-gutter-y-xs">
              <div class="financial-row-mov">
                <span>Importe del Pago:</span>
                <div class="val-box">$ {{ formatMoney(pago.importe) }}</div>
              </div>
              <div class="financial-row-mov secondary">
                <span>Capital a Cambiar:</span>
                <div class="val-box">$ {{ formatMoney(pago.capital_cambiar) }}</div>
              </div>
              <div class="financial-row-mov">
                <span>Abono a Capital:</span>
                <div class="val-box">$ {{ formatMoney(pago.abono_capital) }}</div>
              </div>
              <div class="financial-row-mov">
                <span>Recargos:</span>
                <div class="val-box text-red-9">$ {{ formatMoney(pago.recargos) }}</div>
              </div>
              <div class="financial-row-mov text-green-9 text-weight-bolder">
                <span>Bonificación NC:</span>
                <div class="val-box border-green">-$ {{ formatMoney(pago.bonificacion_nc) }}</div>
              </div>
              <q-separator />
              <div class="financial-row-mov total">
                <span>Total a Pagar:</span>
                <div class="val-box-total">$ {{ formatMoney(totalCalculado) }}</div>
              </div>
              <div class="financial-row-mov q-mt-md">
                <span>Importe Recibido:</span>
                <q-input
                  v-model.number="pago.recibido"
                  outlined dense type="number"
                  class="input-premium-compact"
                  input-class="text-right text-weight-bold"
                  @update:model-value="calcularCambio"
                />
              </div>
              <div class="financial-row-mov">
                <span>Cambio:</span>
                <div class="val-box-cambio">$ {{ formatMoney(pago.cambio) }}</div>
              </div>
              <q-btn
                color="yellow-4"
                text-color="black"
                class="col-auto btn-aceptar-pago border-accent q-ma-md"
                :disabled="movimientosPorRealizar.length === 0"
                @click="confirmarPago"

             >
        <q-icon name="edit_note" size="32px" color="orange-9" />
        <div class="text-overline text-weight-bolder line-height-1">F1 Aceptar<br>Pago</div>
      </q-btn>
            </div>

          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-sm q-mt-sm">
  <div class="col-12 col-md-7">
    <div class="table-header uppercase">Movimientos por Realizar</div>
    <q-markup-table dense flat bordered class="mov-table shadow-1">
      <thead>
        <tr>
          <th>Folio</th><th>Refrendo</th><th>Est.</th>
          <th>Fecha Vence</th><th>Importe</th><th>DV</th><th>Recargos</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="mov in movimientosPorRealizar" :key="mov.folio" class="bg-yellow-1">
          <td class="text-weight-bold">{{ mov.folio }}</td>
          <td>{{ mov.refrendo }}</td>
          <td class="text-weight-bold text-primary">{{ mov.est }}</td>
          <td>{{ mov.vence }}</td>
          <td class="text-weight-bold">$ {{ formatMoney(mov.importe) }}</td>
          <td>{{ mov.dv }}</td>
          <td class="text-red text-weight-bold">$ {{ formatMoney(mov.recargos) }}</td>
        </tr>
        <tr v-if="movimientosPorRealizar.length === 0">
          <td colspan="7" class="text-center text-grey-5 italic q-pa-md">Sin movimientos pendientes</td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>

  <div class="col-12 col-md-5">
    <div class="table-header uppercase">Movimientos Realizados</div>
    <div class="row no-wrap q-gutter-x-xs">
      <q-markup-table dense flat bordered class="mov-table col shadow-1">
        <thead>
          <tr><th>Refrendo</th><th>Fecha Vence</th><th>Importe</th><th>Estatus</th></tr>
        </thead>
        <tbody>
          <tr v-for="mov in movimientosRealizados" :key="mov.id">
            <td class="text-center text-bold">{{ mov.no_pago }}</td>
            <td class="text-center">{{ fechaFormateada(mov.created_at) }}</td>
            <td class="text-right text-bold text-primary">$ {{ formatMoney(mov.totalPagado) }}</td>
            <td class="text-center text-bold text-green-9">APLICADO</td>
          </tr>

          <tr v-if="!boleta.id">
            <td colspan="4" class="text-center text-grey-5 q-pa-md">Esperando operación...</td>
          </tr>
          <tr v-else-if="movimientosRealizados.length === 0">
            <td colspan="4" class="text-center text-grey-5 italic q-pa-md">Sin refrendos anteriores</td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </div>
</div>
<DialogoDesgloseCobro
      v-model="dialogoCobroDesglose"
      :monto-recibido="pago.recibido"
      :total-pagar="totalCalculado"
      :tipo-operacion="movimientosPorRealizar[0]?.est === 'LI' ? 'LIQUIDACIÓN' : 'REFRENDO'"
      @confirmar="ejecutarPagoFinal"
    />
  </q-page>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { date, useQuasar } from 'quasar'
  import { api } from 'boot/axios'
  import { PrintService } from 'src/services/PrintService'
  import DialogoDesgloseCobro from 'src/components/Caja/DialogoDesgloseCobro.vue'

  const $q = useQuasar()

  const movimientosPorRealizar = ref([])

  const movimientosRealizados = ref([])

  const dialogoCobroDesglose = ref(false)

  // ESTADO
  const busquedaFolio = ref('')
  const fechaMovimiento = ref(date.formatDate(Date.now(), 'dddd, MMMM D YYYY').toLowerCase())
  const boleta = ref({
    id: null,
    cliente_nombre: '',
    cliente_id: '',
    identificacion: '',
    dr: 0,
    no_bolsa: '',
    fecha_boleta: '',
    prestamo: 0,
    comision: 0,
    total_pagar: 0,
    categoria: '',
    estatus: '',
    fecha_vencimiento: '',
    plazo: '',
    descripcion: ''
  })

  const pago = ref({
    importe: 0,
    capital_cambiar: 0,
    bonificacion_nc: 0,
    abono_capital: 0,
    recargos: 0,
    recibido: 0,
    cambio: 0
  })

  const fechaFormateada = (fecha) => {
    const f = new Date(fecha)
    return date.formatDate(f, 'DD-MMM-YYYY', {
      monthsShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    }).toLowerCase()
  }


  const totalCalculado = computed(() => {
    const importe = Number(pago.value.importe) || 0
    const recargos = Number(pago.value.recargos) || 0
    const abono = Number(pago.value.abono_capital) || 0
    const bonificacion = Number(pago.value.bonificacion_nc) || 0

    return (importe + recargos + abono) - bonificacion
  })

  const totalRealizado = computed(() => {
    return (pago.value.importe + pago.value.recargos + pago.value.abono_capital) - pago.value.bonificacion_nc
  })

  // MÉTODOS
  const buscarBoleta = async () => {
    if (!busquedaFolio.value) return

    $q.loading.show({ message: 'Localizando folio...' })

    try {
      const res = await api.get(`/api/boletas/${busquedaFolio.value}`)
      const data = res.data.boleta

      if (data.estatus === 'LI') {
        $q.notify({
          type: 'negative',
          message: 'BOLETA LIQUIDADA',
          caption: 'Esta boleta ya fue desempeñada y no admite más movimientos.',
          icon: 'block',
          position: 'center',
          timeout: 4000
        })

        // Limpiamos la pantalla por si había otra boleta cargada antes
        boleta.value = {}
        resetPago()
        movimientosRealizados.value = []

        // Selecciona el texto del buscador por si el cajero quiere teclear otra
        document.querySelector('.input-premium-compact input').select()

        return
      }

      boleta.value = {
        id: data.id,
        cliente_nombre: data.cliente?.nombre || 'N/A',
        cliente_id: data.cliente_id,
        identificacion: data.cliente?.identificacion || 'SIN IDENTIFICACIÓN',
        dr: 0,
        no_bolsa: data.no_bolsa,
        fecha_boleta: fechaFormateada(data.fecha_boleta), // Formato DD-mmm-YYYY
        prestamo: data.prestamo,
        categoria: 'ORO',
        estatus: data.estado === 'activa' ? 'BOLETA VIGENTE' : data.estatus.toUpperCase(),
        comision: data.comision,
        total_pagar: data.total_pagar,
        fecha_vencimiento: fechaFormateada(data.fecha_vencimiento),
        plazo: data.plazo_dias + ' DIAS',
        pago_facil: 'NO',
        descripcion: data.partidas.map(p =>
          `${p.gramos_cantidad} grs ${p.subtipo}: ${p.descripcion}`
        ).join(' | ')
      }

      movimientosRealizados.value = res.data.pagos || []

      console.log("movimientosRealizados:", movimientosRealizados.value)

      resetPago()

      $q.notify({ type: 'positive', message: 'Datos de boleta recuperados' })

    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e.response?.data?.message || e.message || 'Error al buscar folio'
      })
      boleta.value = {}
      movimientosRealizados.value = []
    } finally {
      $q.loading.hide()
    }
  }

  const resetPago = () => {
    movimientosPorRealizar.value = [] // Vaciar la tabla
    pago.value = { importe: 0, capital_cambiar: 0, abono_capital: 0, recargos: 0, recibido: 0, cambio: 0 }
  }


  // Función auxiliar para calcular recargos por días vencidos
  const calcularRecargosVencimiento = () => {
    const hoy = new Date()
    const vencimiento = new Date(boleta.value.fecha_vencimiento)

    if (hoy > vencimiento) {
      // Ejemplo: $10 de recargo por cada día de retraso
      const diasDiferencia = Math.floor((hoy - vencimiento) / (1000 * 60 * 60 * 24))
      return diasDiferencia * 10
    }
    return 0
  }

  const prepararRefrendo = () => {
    if (!boleta.value.id) return

    // 1. Calculamos valores financieros
    pago.value.importe = boleta.value.comision
    pago.value.recargos = calcularRecargosVencimiento()
    pago.value.bonificacion_nc = calcularBonificacionNC(boleta.value)
    pago.value.abono_capital = 0

    // 2. Calculamos Días Vencidos (DV)
    const hoy = new Date()
    const vencimiento = new Date(boleta.value.fecha_vencimiento)
    const diasVencidos = hoy > vencimiento
      ? Math.floor((hoy - vencimiento) / (1000 * 60 * 60 * 24))
      : 0

    const consecutivo = movimientosRealizados.value.length + 1

    // 3. Agregamos a la tabla de "Movimientos por Realizar"
    movimientosPorRealizar.value = [{
      folio: boleta.value.id,
      refrendo: consecutivo, // Consecutivo (puedes traerlo de la DB)
      est: 'RE',
      vence: boleta.value.fecha_vencimiento,
      importe: boleta.value.comision,
      dv: diasVencidos,
      recargos: pago.value.recargos,
      bonificacion: pago.value.bonificacion_nc
    }]

    $q.notify({ icon: 'refresh', color: 'orange-9', message: 'Operación REFRENDO preparada.' })
  }

  const prepararLiquidacion = () => {
    if (!boleta.value.id) return

    // 1. Calculamos valores financieros (Capital + Intereses)
    pago.value.importe = Number(boleta.value.total_pagar) || 0
    pago.value.recargos = Number(calcularRecargosVencimiento()) || 0
    pago.value.bonificacion_nc = Number(calcularBonificacionNC(boleta.value)) || 0
    pago.value.abono_capital = 0
    pago.value.capital_cambiar = 0

    // 2. Calculamos Días Vencidos (DV)
    const hoy = new Date()
    const vencimiento = new Date(boleta.value.fecha_vencimiento)
    const diasVencidos = hoy > vencimiento
      ? Math.floor((hoy - vencimiento) / (1000 * 60 * 60 * 24))
      : 0

    const consecutivo = movimientosRealizados.value.length + 1

    // 3. Agregamos a la tabla de "Movimientos por Realizar" con el estatus 'LI'
    movimientosPorRealizar.value = [{
      folio: boleta.value.id,
      refrendo: consecutivo, // No aplica un número consecutivo porque es el final
      est: 'LI',       // Siglas para Liquidación
      vence: boleta.value.fecha_vencimiento,
      importe: boleta.value.total_pagar,
      dv: diasVencidos,
      recargos: pago.value.recargos,
      bonificacion: pago.value.bonificacion_nc
    }]

    $q.notify({ icon: 'done_all', color: 'green-9', message: 'Operación LIQUIDACIÓN preparada.' })
  }

  const prepararAbono = () => {
    pago.value.importe = boleta.value.comision // Se paga interés primero
    pago.value.abono_capital = 0 // El cajero ingresará el monto manualmente
    pago.value.capital_cambiar = 0
    $q.notify({ message: 'Ingrese el monto del abono a capital manualmente.', color: 'info' })
  }

  const calcularCambio = () => {
    pago.value.cambio = Math.max(0, pago.value.recibido - totalCalculado.value)
  }

  const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })

  const resetModulo = () => window.location.reload()

  const calcularBonificacionNC = (boletaData) => {


    const hoy = new Date();
    const fechaVencimiento = new Date(boletaData.fecha_vencimiento)

    // Si ya venció, no hay bonificación
    if (hoy >= fechaVencimiento) return 0

    // Calculamos días transcurridos
    const msPorDia = 1000 * 60 * 60 * 24
    const plazoDias = 30
    const diasRestantes = Math.floor((fechaVencimiento - hoy) / msPorDia)
    const diasTranscurridos = plazoDias - diasRestantes
    const interesBase = parseFloat(boletaData.comision)
    let bonificacion = 0

    // Aplicar escalas de descuento
    if (diasTranscurridos >= 0 && diasTranscurridos <= 15) {
      bonificacion = interesBase * 0.50 // 50% de descuento
    } else if (diasTranscurridos >= 16 && diasTranscurridos <= 21) {
      bonificacion = interesBase * 0.25 // 25% de descuento
    }

    console.log(`Días restantes: ${diasRestantes}, Interés base: ${interesBase}, Bonificación calculada: ${bonificacion}`)

    return Math.round(bonificacion * 100) / 100
  }



  // 1. Esta función ahora solo revisa el importe y ABRE EL COMPONENTE
  const confirmarPago = () => {
    if (movimientosPorRealizar.value.length === 0) return

    // Validamos que el importe capturado sea suficiente
    if (pago.value.recibido < totalCalculado.value) {
      $q.notify({ type: 'negative', message: 'El importe recibido es menor al total a pagar.' })
      return
    }

    // Si todo está bien, abrimos el componente de conteo
    dialogoCobroDesglose.value = true
  }

  // 2. Esta función recibe el desglose desde el componente y ejecuta la API
  const ejecutarPagoFinal = async (desgloseDenominaciones) => {
    const esLiquidacion = movimientosPorRealizar.value[0].est === 'LI'
    const nombreOp = esLiquidacion ? 'LIQUIDACIÓN' : 'REFRENDO'
    const endpointApi = esLiquidacion ? '/api/boletas/pagos/liquidacion' : '/api/boletas/pagos/refrendo'

    $q.loading.show({ message: `Procesando ${nombreOp.toLowerCase()} y generando ticket...` })



    try {
      const payload = {
        boleta_id: boleta.value.id,
        no_pago: movimientosPorRealizar.value[0].refrendo === '---' ? 0 : movimientosPorRealizar.value[0].refrendo,
        numero_refrendo: movimientosPorRealizar.value[0].refrendo === '---' ? 0 : movimientosPorRealizar.value[0].refrendo,

        importe_pago: pago.value.importe,
        recargos: pago.value.recargos,
        dias_vencidos: movimientosPorRealizar.value[0].dv,
        bonificacion: movimientosPorRealizar.value[0].bonificacion || 0,
        total_pagado: totalCalculado.value,
        total_recibido: pago.value.recibido, // El importe capturado

        // --- AQUÍ MANDAMOS EL ARREGLO QUE NOS DIO EL COMPONENTE ---
        denominaciones: JSON.stringify(desgloseDenominaciones),

        caja_id: 1 // Asegúrate de mandar el ID de turno correcto
      }

      const res = await api.post(endpointApi, payload)

      if (res.data.ticket_data) {
        if (esLiquidacion) await PrintService.imprimirTicketLiquidacion(res.data.ticket_data)
        else await PrintService.imprimirTicketRefrendo(res.data.ticket_data)
      }

      $q.loading.hide()

      const bonificacionOtorgada = Number(res.data.ticket_data.bonificacion) || 0

      if (bonificacionOtorgada > 0) {
        await new Promise((resolve) => {
          $q.dialog({
            title: '<div class="text-purple-7 text-weight-bolder">COMPROBANTE ADICIONAL</div>',
            message: 'Se aplicó una bonificación por pago anticipado.<br><br><b>Presione ENTER</b> para imprimir el comprobante de bonificación.',
            html: true,
            ok: { label: 'Aceptar (Enter)', color: 'positive', icon: 'print' },
            persistent: true
          }).onOk(async () => {
            // Llamamos a la nueva función
            $q.loading.show({ message: 'Imprimiendo comprobante...' })
            await PrintService.imprimirTicketBonificacion(res.data.ticket_data)
            $q.loading.hide()
            resolve()
          })
        })
      }


      $q.notify({ type: 'positive', message: `¡${nombreOp} registrada exitosamente!` })

      dialogoCobroDesglose.value = false
      resetModulo()

    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al procesar: ' + (e.response?.data?.message || e.message) })
    } finally {
      $q.loading.hide()
    }
  }
</script>

<style lang="scss" scoped>
  .bg-blue-grey-1 { background-color: #f0f4f7; }
  .btn-sicae { font-size: 10px; width: 85px; border: 1px solid #ddd; background: white; }
  .border-bottom { border-bottom: 2px solid #bdbdbd; }

  .label-fixed-mov { width: 90px; font-size: 11px; color: #334155; }
  .label-mini { width: 70px; font-size: 10px; color: #64748b; font-weight: bold; }

  .input-premium-compact {
    :deep(.q-field__control) { height: 26px !important; min-height: 26px !important; }
    :deep(.q-field__native) { padding: 0 4px !important; font-size: 11px; }
  }

  .action-btn { font-size: 11px; height: 40px; min-width: 120px; }

  .financial-row-mov {
    display: flex; justify-content: space-between; align-items: center; font-size: 12px;
    .val-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 2px 8px; width: 110px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; }
    &.total .val-box-total { font-size: 16px; color: #1e3a8a; border: 2px solid #1e3a8a; font-weight: 900; text-align: right; width: 110px; padding: 2px 8px; }
    .val-box-cambio { font-size: 14px; color: #b91c1c; font-weight: 800; text-align: right; width: 110px; }
  }

  .mov-table {
    .bg-yellow-1 { background-color: #fffde7 !important; } // Color de "preparado"

    tbody tr:hover {
      background: rgba(25, 118, 210, 0.05);
    }

    td {
      padding: 4px 8px !important;
      border: 1px solid #e2e8f0;
    }
  }

  .table-header {
    background: #334155;
    color: white;
    font-size: 10px;
    font-weight: 800;
    padding: 6px 12px;
    border-radius: 4px 4px 0 0;
  }
</style>
