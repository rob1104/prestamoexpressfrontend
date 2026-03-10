<template>
  <q-card style="width: 850px; max-width: 95vw;" class="bg-white border-radius-lg">
    <q-card-section class="bg-primary text-white row items-center justify-between q-pa-md">
      <div class="row items-center">
        <q-icon name="receipt_long" size="md" class="q-mr-sm" />
        <div>
          <div class="text-h6 text-weight-bolder">Detalles de Boleta No: {{ boleta?.id || '...' }}</div>
          <div class="text-caption" style="opacity: 0.8;">{{ boleta?.tipo_prestamo?.toUpperCase() }}</div>
        </div>
      </div>
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section v-if="cargando" class="text-center q-pa-xl">
      <q-spinner-dots color="primary" size="3em" />
      <div class="text-grey-7 q-mt-md text-weight-bold">Cargando detalles de la boleta...</div>
    </q-card-section>

    <q-card-section v-else-if="boleta" class="q-pa-md q-gutter-y-md">

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-card flat bordered class="bg-grey-1 q-pa-sm full-height">
            <div class="text-overline text-primary text-weight-bold">DATOS DEL CLIENTE</div>
            <div class="text-h6 text-blue-grey-9 text-weight-bold">
              {{ boleta.cliente?.nombre }} {{ boleta.cliente?.apellidos }}
            </div>
            <div class="text-caption text-grey-7">Préstamo otorgado el: <b>{{ formatDate(boleta.fecha_boleta) }}</b></div>
            <div class="text-caption text-grey-7">Vencimiento: <b>{{ formatDate(boleta.fecha_vencimiento) }}</b></div>
          </q-card>
        </div>
        <div class="col-12 col-md-6">
          <q-card flat bordered class="bg-green-1 q-pa-sm full-height column justify-center items-end border-green">
            <div class="text-overline text-green-9 text-weight-bold">IMPORTE PRESTADO</div>
            <div class="text-h3 text-weight-bolder text-green-10 font-mono">
              ${{ formatMoney(boleta.prestamo) }}
            </div>
          </q-card>
        </div>
      </div>

      <div>
        <div class="text-subtitle2 text-weight-bold text-blue-grey-8 q-mb-xs">PRENDAS AMPARADAS</div>
        <q-markup-table dense flat bordered class="bg-white">
          <thead class="bg-grey-2">
            <tr>
              <th class="text-left">Tipo</th>
              <th class="text-left">Descripción</th>
              <th class="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(partida, i) in boleta.partidas" :key="i">
              <td class="text-left text-weight-bold uppercase">{{ partida.tipo }}</td>
              <td class="text-left text-caption" style="white-space: normal;">{{ partida.descripcion }}</td>
              <td class="text-right font-mono text-primary text-weight-bold">${{ formatMoney(Math.round(partida.valor)) }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>

      <div v-if="boleta.tipo_prestamo === 'pagos'">
        <div class="text-subtitle2 text-weight-bold text-blue-grey-8 q-mb-xs q-mt-md">CALENDARIO DE PAGOS</div>
        <q-markup-table dense flat bordered class="bg-white">
          <thead class="bg-grey-2">
            <tr>
              <th class="text-left">No.</th>
              <th class="text-left">Vencimiento</th>
              <th class="text-right">Capital</th>
              <th class="text-right">Interés</th>
              <th class="text-right">Total a Pagar</th>
              <th class="text-right">Saldo Final</th>
              <th class="text-center">Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pago in calendarioEnriquecido" :key="pago.id" :class="pago.estatus === 'PA' ? 'bg-green-1' : ''">
              <td class="text-left font-mono text-weight-bold">{{ pago.num_pago }}</td>
              <td class="text-left font-mono text-capitalize">{{ formatDate(pago.fecha_vencimiento) }}</td>

              <td class="text-right font-mono">${{ formatMoney(pago.capital_calculado) }}</td>
              <td class="text-right font-mono">${{ formatMoney(pago.interes_calculado) }}</td>

              <td class="text-right font-mono text-weight-bold text-primary">
                ${{ formatMoney(pago.total || pago.monto) }}
              </td>

              <td class="text-right font-mono text-grey-7">${{ formatMoney(pago.saldo_remanente) }}</td>

              <td class="text-center">
                <q-badge :color="pago.estatus === 'PA' ? 'green' : 'orange'" class="text-weight-bold">
                  {{ pago.estatus === 'PA' ? 'PAGADO' : 'PENDIENTE' }}
                </q-badge>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>

      <div v-else-if="boleta.tipo_prestamo === 'tradicional'">
        <div v-if="boleta.tradicional">
          <div class="row items-center justify-between q-mt-md q-mb-sm">
            <div class="text-subtitle2 text-weight-bold text-blue-grey-8">DESGLOSE DEL ÚLTIMO CÁLCULO</div>
            <q-badge :color="boleta.tradicional[0].estatus === 'LI' ? 'green-6' : (boleta.tradicional[0].estatus === 'RE' ? 'blue-6' : 'orange-6')" class="q-pa-sm text-weight-bold shadow-1">
              ESTATUS: {{ boleta.tradicional[0].estatus === 'LI' ? 'LIQUIDADO' : (boleta.tradicional[0].estatus === 'RE' ? 'REFRENDADO' : 'PENDIENTE') }}
            </q-badge>
          </div>

          <q-card flat bordered class="bg-blue-grey-1 q-pa-sm">
            <div class="row q-col-gutter-sm text-center">

              <div class="col-4 col-md-2">
                <div class="text-caption text-grey-7 text-weight-bold">DÍAS</div>
                <div class="text-subtitle1 text-weight-bolder">{{ boleta.tradicional[0].dias_reales }}</div>
              </div>

              <div class="col-4 col-md-2">
                <div class="text-caption text-grey-7 text-weight-bold">INTERÉS</div>
                <div class="text-subtitle1 text-weight-bolder font-mono text-primary">${{ formatMoney(boleta.tradicional[0].interes) }}</div>
              </div>

              <div class="col-4 col-md-2">
                <div class="text-caption text-grey-7 text-weight-bold">ALMACENAJE</div>
                <div class="text-subtitle1 text-weight-bolder font-mono">${{ formatMoney(boleta.tradicional[0].almacenaje) }}</div>
              </div>

              <div class="col-4 col-md-2">
                <div class="text-caption text-grey-7 text-weight-bold">ADMIN.</div>
                <div class="text-subtitle1 text-weight-bolder font-mono">${{ formatMoney(boleta.tradicional[0].administracion) }}</div>
              </div>

              <div class="col-4 col-md-2">
                <div class="text-caption text-grey-7 text-weight-bold">IVA</div>
                <div class="text-subtitle1 text-weight-bolder font-mono">${{ formatMoney(boleta.tradicional[0].iva_interes) }}</div>
              </div>

              <div class="col-4 col-md-2" style="border-left: 2px solid #cfd8dc;">
                <div class="text-caption text-indigo text-weight-bold">TOTAL</div>
                <div class="text-subtitle1 text-weight-bolder font-mono text-indigo-9">
                  ${{ formatMoney(
                        Number(boleta.tradicional[0].interes) +
                        Number(boleta.tradicional[0].almacenaje) +
                        Number(boleta.tradicional[0].administracion) +
                        Number(boleta.tradicional[0].custodia) +
                        Number(boleta.tradicional[0].iva_interes)
                     ) }}
                </div>
              </div>
            </div>
          </q-card>
        </div>

        <div class="q-mt-lg q-mb-xs">
           <div class="text-subtitle2 text-weight-bold text-blue-grey-8">HISTORIAL DE RECIBOS COBRADOS</div>
        </div>

        <q-markup-table dense flat bordered class="bg-white" v-if="boleta.pagos?.length > 0">
          <thead class="bg-grey-2">
            <tr>
              <th class="text-left">Fecha de Recibo</th>
              <th class="text-left">Concepto</th>
              <th class="text-right">Importe Recibido</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mov in boleta.pagos" :key="mov.id">
              <td class="text-left font-mono text-capitalize">{{ formatDate(mov.created_at) }}</td>
              <td class="text-left text-weight-bold uppercase">{{ nombreMovimiento(mov.tipo_movimiento) }}</td>
              <td class="text-right font-mono text-weight-bold">${{ formatMoney(mov.totalPagado || mov.importe_pago || mov.total) }}</td>
            </tr>
          </tbody>
        </q-markup-table>
        <div v-else class="text-center q-pa-md bg-grey-1 border-radius-sm text-grey-6 text-italic">
          Aún no se han cobrado recibos en caja para esta boleta.
        </div>
      </div>

    </q-card-section>
  </q-card>
</template>

<script setup>
  import { ref, onMounted, watch, computed } from 'vue'
  import { api } from 'boot/axios'
  import { date } from 'quasar'

  const props = defineProps({
    boletaId: { type: Number, required: true }
  })

  const boleta = ref(null)
  const cargando = ref(true)

  const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const formatDate = (val) => {
    if (!val) return '---'
    const formatted = date.formatDate(val, 'DD-MMM-YYYY')
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  const cargarDetalles = async () => {
    cargando.value = true
    try {
      const res = await api.get(`/api/boletas/${props.boletaId}/detalles`)
      boleta.value = res.data
    } catch (error) {
      console.error("Error al cargar detalles de la boleta", error)
    } finally {
      cargando.value = false
    }
  }

  const nombreMovimiento = (tipo) => {
    const tipos = {
      1: 'LIQUIDACIÓN',
      3: 'REFRENDO',
      4: 'PAGO EN BOLETA DE PAGOS'
    }
    // Si llega un número que no está en la lista, muestra el número o "Desconocido"
    return tipos[tipo] || `MOVIMIENTO ${tipo || 'DESCONOCIDO'}`
  }


  // --- CALCULADORA EN TIEMPO REAL DEL CALENDARIO (BLINDADA) ---
  const calendarioEnriquecido = computed(() => {
    const pagos = boleta.value?.calendarioPagos || boleta.value?.calendario_pagos || []
    if (!boleta.value || boleta.value.tipo_prestamo !== 'pagos' || pagos.length === 0) {
      return []
    }

    let saldo = Number(boleta.value.prestamo)

    // FIX INFALIBLE: Sacamos el multiplicador por pura lógica matemática.
    // Ej: 4 pagos en 1 mes = Multiplicador 4 (Semanal).
    const meses = Number(boleta.value.meses) || 1
    let multiplicador = pagos.length / meses

    // Respaldo de seguridad por si la división falla
    if (!multiplicador || multiplicador < 1) {
      const pid = Number(boleta.value.periodo_id || boleta.value.periodo)
      if (pid === 1) multiplicador = 4 // Semanal
      else if (pid === 2 || pid === 3) multiplicador = 2 // Catorcenal/Quincenal
      else multiplicador = 1 // Mensual
    }

    // Ahora sí, dividimos el 20% mensual entre 4, dándonos un correcto 5% semanal
    const tasaPeriodo = (Number(boleta.value.p_interes) / 100) / multiplicador

    return pagos.map((pago, index) => {
      const esUltimo = index === pagos.length - 1
      const pagoTotal = Number(pago.total || pago.monto || 0)

      // 1. Interés = Saldo actual * Tasa (Ej. $5,590 * 0.05)
      let interes = Math.round((saldo * tasaPeriodo) * 100) / 100

      // 2. Capital = Lo que sobra del pago
      let capital = pagoTotal - interes

      // 3. Ajuste milimétrico para que el último pago cuadre a $0.00
      if (esUltimo) {
        capital = saldo
        interes = pagoTotal - capital
      }

      // 4. Bajamos la deuda
      saldo = saldo - capital

      return {
        ...pago,
        capital_calculado: capital,
        interes_calculado: interes,
        saldo_remanente: Math.max(0, saldo)
      }
    })
  })

  onMounted(() => cargarDetalles())

  // Si el modal se queda abierto y cambia el ID, recargamos
  watch(() => props.boletaId, () => {
    cargarDetalles()
  })
</script>

<style scoped>
  .border-radius-lg { border-radius: 12px; overflow: hidden; }
  .border-green { border: 1px solid #a5d6a7; }
  .font-mono { font-family: 'JetBrains Mono', monospace; }
  .uppercase { text-transform: uppercase; }
</style>
