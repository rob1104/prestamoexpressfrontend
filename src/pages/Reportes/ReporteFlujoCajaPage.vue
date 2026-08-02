<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Controles Superiores -->
    <q-card flat bordered class="q-mb-md shadow-2">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="text-h6 text-primary q-mr-md text-weight-bolder">FLUJO DE CAJA GENERAL</div>

        <div class="col-12 col-sm-auto">
          <q-input autofocus v-model="form.fecha_inicio" outlined dense type="date" label="Fecha Inicio" bg-color="white" />
        </div>

        <div class="col-12 col-sm-auto">
          <q-input v-model="form.fecha_fin" outlined dense type="date" label="Fecha Fin" bg-color="white" />
        </div>

        <q-btn color="primary" icon="search" label="Consultar" @click="consultarFlujo" :loading="loading" class="q-ml-sm" />
        <q-btn color="grey-7" icon="print" label="Imprimir PDF" @click="imprimirPDF" :disable="!reporte" flat class="q-ml-xs" />
        <q-space />
        <q-btn color="positive" icon="add" label="Entrada" @click="mostrarEntrada = true" outline class="q-ml-xs bg-white text-weight-bold" />
        <q-btn color="negative" icon="remove" label="Gasto / Salida" @click="mostrarSalida = true" outline class="q-ml-xs bg-white text-weight-bold" />
      </q-card-section>
    </q-card>

    <!-- REPORTE -->
    <q-card v-if="reporte" flat bordered class="bg-white shadow-10 reporte-container">
      
      <!-- HEADER CORPORATIVO -->
      <q-card-section class="text-center q-pb-none">
        <div class="text-h5 text-weight-bolder uppercase">PRESTAMO EXPRESS MATRIZ</div>
        <div class="text-subtitle2">CORPORATIVO EXPRESS S.A. DE C.V.</div>
        <div class="text-subtitle2">SISTEMA DE CASAS DE EMPEÑO "SICAE"</div>
      </q-card-section>

      <!-- METADATOS -->
      <q-card-section class="q-pt-sm">
        <div class="row info-grid q-pa-sm">
          <div class="col-6 col-md-3 text-weight-bold">REPORTE:</div>
          <div class="col-6 col-md-3">FLUJO DE CAJA GENERAL</div>
          <div class="col-6 col-md-3 text-weight-bold text-right">FECHA IMP.:</div>
          <div class="col-6 col-md-3 text-right">{{ formatFechaHoy() }}</div>

          <div class="col-6 col-md-3 text-weight-bold">CAJA:</div>
          <div class="col-6 col-md-3 uppercase">{{ reporte.config.caja }}</div>
          <div class="col-6 col-md-3 text-weight-bold text-right">HORA IMP.:</div>
          <div class="col-6 col-md-3 text-right">{{ formatHoraHoy() }}</div>

          <div class="col-6 col-md-3 text-weight-bold">PERÍODO:</div>
          <div class="col-6 col-md-3 uppercase">{{ reporte.config.fecha_rango }}</div>
          <div class="col-6 col-md-3 text-weight-bold text-right">PÁGINA:</div>
          <div class="col-6 col-md-3 text-right">1</div>
        </div>
      </q-card-section>

      <!-- SALDOS INICIALES -->
      <q-card-section class="q-pt-none">
        <div class="section-header">SALDOS INICIALES</div>
        <div class="row justify-between q-px-md q-pt-sm">
          <span>Fondo Fijo de Caja:</span>
          <span class="text-weight-bold">$ {{ formatMoney(fondoFijo) }}</span>
        </div>
        <div class="row justify-between q-px-md">
          <span>Saldo Inicial Histórico:</span>
          <span class="text-weight-bold">$ {{ formatMoney(reporte.config.saldo_inicial) }}</span>
        </div>
      </q-card-section>

      <!-- ENTRADAS Y SALIDAS -->
      <q-card-section class="q-pt-none">
        <div class="section-header">
          <div class="row">
            <div class="col-6 text-center">E N T R A D A S</div>
            <div class="col-6 text-center">S A L I D A S</div>
          </div>
        </div>
        
        <div class="row table-split q-mt-sm">
          <!-- COLUMNA ENTRADAS -->
          <div class="col-12 col-md-6 column-left">
            <div class="cat-title">PAGOS</div>
            <div class="row justify-between item-row"><span>+ Capital Recuperado</span><span>$ {{ formatMoney(reporte.entradas.pagos_capital) }}</span></div>
            <div class="row justify-between item-row"><span>+ Intereses e IVA</span><span>$ {{ formatMoney(reporte.entradas.pagos_interes) }}</span></div>
            <div class="row justify-between item-row"><span>+ Recargos</span><span>$ {{ formatMoney(reporte.entradas.pagos_recargos) }}</span></div>
            <div class="row justify-between item-row"><span>+ Com. Restructura</span><span>$ 0.00</span></div>
            <div class="row justify-between item-row"><span>+ Com. Cambio Plan</span><span>$ 0.00</span></div>
            <div class="row justify-between item-row"><span>+ Com. Cambio Trad.</span><span>$ 0.00</span></div>
            <div class="row justify-between item-row"><span>- Notas de Crédito</span><span>$ 0.00</span></div>
            <div class="row justify-between subtotal-row">
              <span>Subtotal Pagos</span><span class="text-weight-bold">$ {{ formatMoney(reporte.entradas.pagos_capital + reporte.entradas.pagos_interes + reporte.entradas.pagos_recargos) }}</span>
            </div>

            <div class="cat-title">TRADICIONAL</div>
            <div class="item-row">+ Refrendos</div>
            <div class="row justify-between subitem-row"><span>Comisión</span><span>$ 0.00</span></div>
            <div class="row justify-between subitem-row"><span>Recargos</span><span>$ 0.00</span></div>
            <div class="item-row">+ Liquidaciones</div>
            <div class="row justify-between subitem-row"><span>Capital</span><span>$ 0.00</span></div>
            <div class="row justify-between subitem-row"><span>Comisión</span><span>$ 0.00</span></div>
            <div class="row justify-between subitem-row"><span>Recargos</span><span>$ 0.00</span></div>
            <div class="row justify-between subtotal-row"><span>Subtotal Tradicional</span><span class="text-weight-bold">$ 0.00</span></div>

            <div class="cat-title">VENTAS</div>
            <div class="row text-weight-bold"><div class="col-4"></div><div class="col-4 text-center">ELEC.</div><div class="col-4 text-right">ORO</div></div>
            <div class="row item-row"><div class="col-4">Ventas</div><div class="col-4 text-center">$ 0.00</div><div class="col-4 text-right">$ 0.00</div></div>
            <div class="row item-row"><div class="col-4">Abonos</div><div class="col-4 text-center">$ 0.00</div><div class="col-4 text-right">$ 0.00</div></div>
            <div class="row item-row"><div class="col-4">Liq. Sep</div><div class="col-4 text-center">$ 0.00</div><div class="col-4 text-right">$ 0.00</div></div>
            <div class="row justify-between subtotal-row"><span>Subtotal Ventas</span><span class="text-weight-bold">$ 0.00</span></div>

            <div class="cat-title">OTROS</div>
            <div class="row justify-between item-row"><span>Pagos de Servicios</span><span>$ 0.00</span></div>
            <div class="row justify-between item-row"><span>Aportaciones de Cajas</span><span>$ 0.00</span></div>
            <div class="row justify-between item-row"><span>Venta de Dólares</span><span>$ 0.00</span></div>
            <div class="row justify-between item-row"><span>Entradas Diversas</span><span>$ {{ formatMoney(reporte.entradas.otros) }}</span></div>

            <div class="total-box text-green-9 bg-green-1">
              <div class="row justify-between text-weight-bolder">
                <span>TOTAL DE ENTRADAS</span>
                <span>$ {{ formatMoney(totalEntradas) }}</span>
              </div>
            </div>
          </div>

          <!-- COLUMNA SALIDAS -->
          <div class="col-12 col-md-6 column-right flex column justify-between">
            <div>
              <div class="cat-title">PAGOS</div>
              <div class="row justify-between item-row"><span>+ Préstamos Nuevos</span><span>$ 0.00</span></div>
              <div class="row justify-between item-row"><span>- Canc. Cap. C. Plan Pago</span><span>$ 0.00</span></div>
              <div class="row justify-between item-row"><span>- Canc. Cap. Cambiate Trad.</span><span>$ 0.00</span></div>
              <div class="row justify-between subtotal-row"><span>Total Préstamos Nuevos</span><span class="text-weight-bold">$ 0.00</span></div>

              <div class="cat-title">TRADICIONAL</div>
              <div class="row justify-between item-row"><span>Préstamos Nuevos</span><span>$ {{ formatMoney(reporte.salidas.prestamos) }}</span></div>

              <div class="cat-title">GASTOS Y RETIROS</div>
              <div class="row justify-between item-row"><span>Compra de Dólares</span><span>$ 0.00</span></div>
              <div class="row justify-between item-row"><span>Retiros de Cajas</span><span>$ 0.00</span></div>
              <div class="row justify-between item-row"><span>Gastos Generales / Varios</span><span>$ {{ formatMoney(reporte.salidas.otros) }}</span></div>
              <div class="row justify-between item-row"><span>Salidas de Caja</span><span>$ 0.00</span></div>
              <div class="row justify-between item-row"><span>Compra de Oro y Plata</span><span>$ {{ formatMoney(reporte.salidas.compras_oro) }}</span></div>
              <div class="row justify-between item-row"><span>Dep. Vouchers Oro/Elec.</span><span>$ 0.00</span></div>
            </div>
            
            <div class="total-box text-red-9 bg-red-1" style="margin-top: 15px;">
              <div class="row justify-between text-weight-bolder">
                <span>TOTAL DE SALIDAS</span>
                <span>$ {{ formatMoney(totalSalidas) }}</span>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- DOLARES Y DIVISAS -->
      <q-card-section class="q-pt-none">
        <div class="section-header">CORTE DE DÓLARES Y DIVISAS</div>
        <div class="row q-mt-sm">
          <div class="col-12 col-md-6 column-left">
            <div class="row justify-between"><span>Fondo Fijo de Caja</span><span>$ 0.00</span></div>
            <div class="row justify-between"><span>Saldo Inicial</span><span>$ 0.00</span></div>
            <div class="row justify-between"><span>+ Aportaciones Cajas</span><span>$ 0.00</span></div>
            <div class="row justify-between"><span>- Retiros Cajas</span><span>$ 0.00</span></div>
            <div class="row justify-between"><span>+ Compras (0 movs)</span><span>$ 0.00</span></div>
            <div class="row justify-between"><span>- Ventas (0 movs)</span><span>$ 0.00</span></div>
            <div class="line-bottom q-my-xs"></div>
            <div class="row justify-between text-weight-bold"><span>TOTAL DE DOLARES</span><span>$ 0.00</span></div>
          </div>
          <div class="col-12 col-md-6 column-right">
            <div class="row justify-between"><span>Tipo Cambio Prom. Compra:</span><span>$ 0.000000</span></div>
            <div class="row justify-between"><span>Tipo Cambio Prom. Venta:</span><span>$ 0.000000</span></div>
            <br>
            <div class="row justify-between text-weight-bold"><span>Utilidad Cambiaria en Venta:</span><span>$ 0.00</span></div>
          </div>
        </div>
      </q-card-section>

      <!-- ARQUEO FINAL -->
      <q-card-section class="q-pt-sm">
        <div class="arqueo-box bg-blue-grey-10 text-white q-pa-md">
          <div class="row justify-between items-center q-mb-md">
            <span class="text-body1 text-weight-light">SALDO FINAL CALCULADO EN CAJA</span>
            <span class="text-h5 text-weight-bolder">$ {{ formatMoney(saldoFinalCalculado) }}</span>
          </div>
          <div class="row justify-between items-center diferencia-row q-pt-md">
            <span class="text-body1">DIFERENCIA (Faltante / Sobrante)</span>
            <span class="text-h4 text-weight-bolder" :class="diferencia >= 0 ? 'text-positive' : 'text-negative'">
              $ {{ formatMoney(diferencia) }}
            </span>
          </div>
        </div>
      </q-card-section>

    </q-card>

    <DialogoEntradaCaja v-model="mostrarEntrada" @entrada-registrada="consultarFlujo" />
    <DialogoSalidaCaja v-model="mostrarSalida" @salida-registrada="consultarFlujo" />
  </q-page>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { api } from 'boot/axios'
  import { date, useQuasar } from 'quasar'

  import DialogoEntradaCaja from 'components/Caja/DialogoEntradaCaja.vue'
  import DialogoSalidaCaja from 'components/Caja/DialogoSalidaCaja.vue'

  const $q = useQuasar()
  const loading = ref(false)
  const reporte = ref(null)

  const mostrarEntrada = ref(false)
  const mostrarSalida = ref(false)

  const form = ref({
    fecha_inicio: date.formatDate(new Date(), 'YYYY-MM-DD'),
    fecha_fin: date.formatDate(new Date(), 'YYYY-MM-DD'),
    caja_id: 1
  })

  // Constantes de simulación para cuadraturas
  const fondoFijo = computed(() => {
    return reporte.value ? Number(reporte.value.config.fondo_fijo || 0) : 0
  })
  const gastosPorComprobar = ref(0.00)

  // Cálculos Computados
  const totalEntradas = computed(() => {
    if (!reporte.value) return 0
    const r = reporte.value
    return Number(r.entradas.pagos_capital) +
           Number(r.entradas.pagos_interes) +
           Number(r.entradas.pagos_recargos) +
           Number(r.entradas.otros)
  })

  const totalSalidas = computed(() => {
    if (!reporte.value) return 0
    return Number(reporte.value.salidas.prestamos) + Number(reporte.value.salidas.compras_oro) + Number(reporte.value.salidas.otros)
  })

  const saldoFinalCalculado = computed(() => {
    if (!reporte.value) return 0
    const saldoInicial = Number(reporte.value.config.saldo_inicial) || 0
    return fondoFijo.value + saldoInicial + totalEntradas.value - totalSalidas.value
  })

  const diferencia = computed(() => {
    return saldoFinalCalculado.value
  })

  // Utilidades
  const formatMoney = (val) => {
    return Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const formatFechaHoy = () => {
    return date.formatDate(new Date(), 'DD-MMM-YYYY').toUpperCase()
  }

  const formatHoraHoy = () => {
    return date.formatDate(new Date(), 'hh:mm a')
  }

  const consultarFlujo = async () => {
    loading.value = true
    try {
      const res = await api.get('/api/reportes/flujo-caja', { params: form.value })
      reporte.value = res.data
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al obtener datos de caja' })
    } finally {
      loading.value = false
    }
  }

  const imprimirPDF = async () => {
    loading.value = true
    try {
      const res = await api.get('/api/reportes/flujo-caja/url-firmada', {
        params: form.value
      })
      window.open(res.data.url, '_blank')
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al generar enlace de impresión' })
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
  .reporte-container {
    max-width: 1000px;
    margin: 0 auto;
    font-family: 'Courier New', Courier, monospace;
    font-size: 13px;
  }
  
  .info-grid {
    border-top: 2px solid #000;
    border-bottom: 2px solid #000;
  }
  
  .section-header {
    font-weight: bold;
    text-align: center;
    padding: 6px;
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
    background-color: #f4f4f4;
    margin-top: 16px;
    font-size: 14px;
  }
  
  .column-left {
    border-right: 1px solid #ccc;
    padding-right: 20px;
  }
  .column-right {
    padding-left: 20px;
  }
  
  .cat-title {
    font-weight: bold;
    padding-top: 12px;
    padding-bottom: 4px;
  }
  .item-row {
    padding-left: 15px;
    padding-top: 3px;
    padding-bottom: 3px;
  }
  .subitem-row {
    padding-left: 35px;
    padding-top: 3px;
    padding-bottom: 3px;
  }
  .subtotal-row {
    padding-top: 6px;
    margin-top: 2px;
    border-top: 1px solid #eee;
    font-style: italic;
  }
  
  .total-box {
    border-top: 2px solid #000;
    border-bottom: 2px solid #000;
    padding: 10px;
    font-size: 14px;
  }
  
  .line-bottom {
    border-bottom: 1px solid #ccc;
  }
  
  .arqueo-box {
    border-radius: 6px;
    margin-top: 15px;
  }
  .diferencia-row {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }
</style>
