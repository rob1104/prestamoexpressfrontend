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
        <div class="text-subtitle2">FLUJO DE CAJA</div>
      </q-card-section>

      <!-- METADATOS -->
      <q-card-section class="q-pt-sm">
        <div class="row info-grid q-pa-sm">
          <div class="col-6 col-md-3 text-weight-bold">FECHA:</div>
          <div class="col-6 col-md-3 uppercase">{{ reporte.config.fecha_impresion }}</div>
          <div class="col-6 col-md-3 text-weight-bold text-right">HORA:</div>
          <div class="col-6 col-md-3 text-right">{{ reporte.config.hora_impresion }}</div>

          <div class="col-6 col-md-3 text-weight-bold">PERÍODO:</div>
          <div class="col-6 col-md-3 uppercase">{{ reporte.config.fecha_rango }}</div>
          <div class="col-6 col-md-3 text-weight-bold text-right">PÁGINA:</div>
          <div class="col-6 col-md-3 text-right">1</div>

          <div class="col-6 col-md-3 text-weight-bold">CAJA:</div>
          <div class="col-6 col-md-3 uppercase">TODAS</div>
          <div class="col-6 col-md-3"></div>
          <div class="col-6 col-md-3"></div>
        </div>
      </q-card-section>

      <!-- SALDOS INICIALES -->
      <q-card-section class="q-pt-none">
        <div class="section-header">FLUJO DE CAJA TODAS LAS CAJAS</div>
        <div class="row justify-between q-px-md q-pt-sm text-weight-bold">
          <span>FONDO FIJO DE CAJA</span>
          <span>{{ formatMoney(reporte.config.fondo_fijo) }}</span>
        </div>
        <div class="row justify-between q-px-md text-weight-bold">
          <span>SALDO INICIAL</span>
          <span>{{ formatMoney(reporte.config.saldo_inicial) }}</span>
        </div>
      </q-card-section>

      <!-- ENTRADAS Y SALIDAS -->
      <q-card-section class="q-pt-none">
        <div class="row table-split q-mt-sm">
          <!-- COLUMNA ENTRADAS -->
          <div class="col-12 col-md-6 column-left">
            <div class="section-header-col text-center">E N T R A D A S</div>
            
            <div class="cat-title">PAGOS</div>
            <div class="row justify-between item-row"><span>+ PAGOS:</span><span>{{ formatMoney(reporte.entradas.pagos.pagos) }}</span></div>
            <div class="row justify-between item-row"><span>+ RECARGOS:</span><span>{{ formatMoney(reporte.entradas.pagos.recargos) }}</span></div>
            <div class="row justify-between item-row"><span>+ COMISION RESTRUCTURA PRESTAMO:</span><span>{{ formatMoney(reporte.entradas.pagos.comision_restructura) }}</span></div>
            <div class="row justify-between item-row"><span>+ COMISION CAMBIO PLAN PAGO:</span><span>{{ formatMoney(reporte.entradas.pagos.comision_cambio_plan) }}</span></div>
            <div class="row justify-between item-row"><span>+ COMISION CAMBIO TRADICIONAL.:</span><span>{{ formatMoney(reporte.entradas.pagos.comision_cambio_trad) }}</span></div>
            <div class="row justify-between item-row"><span>- NOTAS DE CREDITO:</span><span>{{ formatMoney(reporte.entradas.pagos.notas_credito) }}</span></div>
            <div class="row justify-between subtotal-row">
              <span></span><span class="text-weight-bold">{{ formatMoney(reporte.entradas.pagos.total) }}</span>
            </div>

            <div class="cat-title">TRADICIONAL</div>
            <div class="item-row">+ REFRENDOS</div>
            <div class="row justify-between subitem-row"><span>COMISION:</span><span>{{ formatMoney(reporte.entradas.tradicional.refrendos.comision) }}</span></div>
            <div class="row justify-between subitem-row"><span>RECARGOS:</span><span>{{ formatMoney(reporte.entradas.tradicional.refrendos.recargos) }}</span></div>
            <div class="row justify-between subtotal-row"><span></span><span class="text-weight-bold">{{ formatMoney(reporte.entradas.tradicional.refrendos.total) }}</span></div>

            <div class="item-row">+ LIQUIDACIONES</div>
            <div class="row justify-between subitem-row"><span>CAPITAL:</span><span>{{ formatMoney(reporte.entradas.tradicional.liquidaciones.capital) }}</span></div>
            <div class="row justify-between subitem-row"><span>COMISION:</span><span>{{ formatMoney(reporte.entradas.tradicional.liquidaciones.comision) }}</span></div>
            <div class="row justify-between subitem-row"><span>RECARGOS:</span><span>{{ formatMoney(reporte.entradas.tradicional.liquidaciones.recargos) }}</span></div>
            <div class="row justify-between subtotal-row"><span></span><span class="text-weight-bold">{{ formatMoney(reporte.entradas.tradicional.liquidaciones.total) }}</span></div>

            <div class="row justify-between item-row q-mt-sm"><span>- NOTAS DE CREDITO:</span><span>{{ formatMoney(reporte.entradas.tradicional.notas_credito) }}</span></div>
            <div class="row justify-between subtotal-row"><span></span><span class="text-weight-bold">{{ formatMoney(reporte.entradas.tradicional.total) }}</span></div>

            <div class="row text-weight-bold q-mt-md"><div class="col-5">VENTAS</div><div class="col-3 text-center">ELECTRONICOS</div><div class="col-3 text-right">ORO</div></div>
            <div class="line-top q-mb-xs"></div>
            <div class="row item-row"><div class="col-5">VENTAS:</div><div class="col-3 text-center">{{ formatMoney(reporte.entradas.ventas.electronicos.ventas) }}</div><div class="col-3 text-right">{{ formatMoney(reporte.entradas.ventas.oro.ventas) }}</div></div>
            <div class="row item-row"><div class="col-5">SEPARADO Y ABONOS:</div><div class="col-3 text-center">{{ formatMoney(reporte.entradas.ventas.electronicos.separado) }}</div><div class="col-3 text-right">{{ formatMoney(reporte.entradas.ventas.oro.separado) }}</div></div>
            <div class="row item-row"><div class="col-5">LIQ SEPARADO:</div><div class="col-3 text-center">{{ formatMoney(reporte.entradas.ventas.electronicos.liq_separado) }}</div><div class="col-3 text-right">{{ formatMoney(reporte.entradas.ventas.oro.liq_separado) }}</div></div>
            <div class="row item-row text-weight-bold">
              <div class="col-5"></div>
              <div class="col-3 text-center subtotal-row">{{ formatMoney(reporte.entradas.ventas.electronicos.total) }}</div>
              <div class="col-3 text-right subtotal-row">{{ formatMoney(reporte.entradas.ventas.oro.total) }}</div>
            </div>

            <div class="cat-title q-mt-md">PAGOS DE SERVICIOS:</div>
            <div class="row justify-between subitem-row"><span>IMPORTE:</span><span>{{ formatMoney(reporte.entradas.otros.pagos_servicios.importe) }}</span></div>
            <div class="row justify-between subitem-row"><span>COMISION:</span><span>{{ formatMoney(reporte.entradas.otros.pagos_servicios.comision) }}</span></div>
            <div class="row justify-between item-row"><span>TOTAL DE PAGOS DE SERVICIOS:</span><span class="subtotal-row text-weight-bold">{{ formatMoney(reporte.entradas.otros.pagos_servicios.total) }}</span></div>

            <div class="row justify-between item-row q-mt-md"><span>VENTA DE DOLARES:</span><span>{{ formatMoney(reporte.entradas.otros.venta_dolares) }}</span></div>
            <div class="row justify-between item-row"><span>APORTACIONES DE CAJAS:</span><span>{{ formatMoney(reporte.entradas.otros.aportaciones_cajas) }}</span></div>
            <div class="row justify-between item-row"><span>NOTAS DE EXTRAVIO:</span><span>{{ formatMoney(reporte.entradas.otros.notas_extravio) }}</span></div>
            <div class="row justify-between item-row"><span>ENTRADAS A CAJA:</span><span>{{ formatMoney(reporte.entradas.otros.entradas_caja) }}</span></div>
            <div class="row justify-between item-row"><span>ABONITOS:</span><span>{{ formatMoney(reporte.entradas.otros.abonitos) }}</span></div>

            <div class="row justify-between text-weight-bolder total-box q-mt-md">
                <span>TOTAL DE ENTRADAS:</span>
                <span>{{ formatMoney(reporte.entradas.total_general) }}</span>
            </div>
          </div>

          <!-- COLUMNA SALIDAS -->
          <div class="col-12 col-md-6 column-right flex column">
            <div class="section-header-col text-center">S A L I D A S</div>
            
            <div>
              <div class="cat-title">PAGOS</div>
              <div class="row justify-between item-row"><span>+ PRESTAMOS NUEVOS:</span><span>{{ formatMoney(reporte.salidas.pagos.prestamos_nuevos) }}</span></div>
              <div class="row justify-between item-row"><span>- CANC. CAPITAL CAMBIO PLAN PAGO:</span><span>{{ formatMoney(reporte.salidas.pagos.canc_capital_cambio_plan) }}</span></div>
              <div class="row justify-between item-row"><span>- CANC. CAPITAL CAMBIATE TRAD.:</span><span>{{ formatMoney(reporte.salidas.pagos.canc_capital_cambio_trad) }}</span></div>
              <div class="row justify-between subtotal-row"><span>= TOTAL DE PRESTAMOS NUEVOS:</span><span class="text-weight-bold">{{ formatMoney(reporte.salidas.pagos.total) }}</span></div>

              <div class="cat-title">TRADICIONAL</div>
              <div class="row justify-between item-row"><span>PRESTAMOS NUEVOS:</span><span>{{ formatMoney(reporte.salidas.tradicional.prestamos_nuevos) }}</span></div>

              <div class="row justify-between item-row q-mt-md"><span>COMPRA DE DOLARES:</span><span>{{ formatMoney(reporte.salidas.otros.compra_dolares) }}</span></div>
              <div class="row justify-between item-row"><span>RETIROS DE CAJAS:</span><span>{{ formatMoney(reporte.salidas.otros.retiros_cajas) }}</span></div>
              <div class="row justify-between item-row"><span>GASTOS GENERALES:</span><span>{{ formatMoney(reporte.salidas.otros.gastos_generales) }}</span></div>
              <div class="row justify-between item-row"><span>SALIDAS DE CAJA:</span><span>{{ formatMoney(reporte.salidas.otros.salidas_caja) }}</span></div>
              <div class="row justify-between item-row"><span>COMPRA DE ORO Y PLATA:</span><span>{{ formatMoney(reporte.salidas.otros.compra_oro_plata) }}</span></div>
              <div class="row justify-between item-row"><span>DEPOSITOS DE VOUCHERS ORO Y ELECT.:</span><span>{{ formatMoney(reporte.salidas.otros.depositos_vouchers) }}</span></div>
              
              <div class="row justify-between subtotal-row text-weight-bolder q-mt-sm">
                <span>TOTAL DE SALIDAS:</span>
                <span>{{ formatMoney(reporte.salidas.total_general) }}</span>
              </div>
            </div>

            <!-- CORTE DE DOLARES (Inside Right Column) -->
            <div class="section-header-col text-center q-mt-xl">CORTE DE DOLARES</div>
            <div class="row justify-between text-weight-bold q-mt-sm"><span>FONDO FIJO DE CAJA</span><span>{{ formatMoney(reporte.dolares.fondo_fijo) }}</span></div>
            <div class="row justify-between text-weight-bold"><span>SALDO INICIAL</span><span>{{ formatMoney(reporte.dolares.saldo_inicial) }}</span></div>
            <div class="row justify-between item-row q-mt-sm"><span>+ APORTACIONES DE CAJAS:</span><span>{{ formatMoney(reporte.dolares.aportaciones) }}</span></div>
            <div class="row justify-between item-row"><span>- RETIROS DE CAJAS:</span><span>{{ formatMoney(reporte.dolares.retiros) }}</span></div>
            
            <div class="row item-row">
                <div class="col-4">+ COMPRAS:</div><div class="col-4">Movimientos: 0</div><div class="col-4 text-right">{{ formatMoney(reporte.dolares.compras) }}</div>
            </div>
            <div class="row item-row">
                <div class="col-4">- VENTAS:</div><div class="col-4">Movimientos: 0</div><div class="col-4 text-right">{{ formatMoney(reporte.dolares.ventas) }}</div>
            </div>
            
            <div class="row justify-between text-weight-bold subtotal-row"><span>TOTAL DE DOLARES:</span><span>{{ formatMoney(reporte.dolares.total) }}</span></div>

            <div class="row justify-between text-weight-bold q-mt-md"><span>SALDO FINAL</span><span>{{ formatMoney(reporte.dolares.saldo_final) }}</span></div>
            <div class="row justify-between text-weight-bold"><span>MENOS FONDO FIJO DE CAJA</span><span>{{ formatMoney(reporte.dolares.menos_fondo) }}</span></div>
            <div class="row justify-between text-weight-bold subtotal-row"><span></span><span>{{ formatMoney(reporte.dolares.saldo_final - reporte.dolares.menos_fondo) }}</span></div>

            <div class="row justify-between text-weight-bold q-mt-md"><span>TIPO CAMBIO PROMEDIO COMPRA:</span><span>{{ formatMoney(reporte.dolares.tipo_cambio_compra) }}</span></div>
            <div class="row justify-between text-weight-bold"><span>TIPO CAMBIO PROMEDIO VENTA:</span><span>{{ formatMoney(reporte.dolares.tipo_cambio_venta) }}</span></div>
            
            <div class="row justify-between text-weight-bold q-mt-md"><span>UTILIDAD CAMBIARIA EN VENTA:</span><span>{{ formatMoney(reporte.dolares.utilidad) }}</span></div>

          </div>
        </div>

        <div class="row justify-center q-mt-xl text-weight-bold" style="font-size: 14px;">
            <div class="col-12 col-md-8">
                <div class="row justify-between">
                    <span class="col-6">SALDO FINAL EN CAJA</span>
                    <span class="col-6 text-right">{{ formatMoney(reporte.config.saldo_final) }}</span>
                </div>
                <div class="row justify-between text-weight-regular">
                    <span class="col-6 text-right">MENOS FONDO DE CAJA</span>
                    <span class="col-6 text-right">{{ formatMoney(reporte.config.fondo_fijo) }}</span>
                </div>
                <div class="row justify-between text-weight-regular">
                    <span class="col-6 text-right">MENOS GASTOS POR COMPROBAR</span>
                    <span class="col-6 text-right">0.00</span>
                </div>
                <div class="row justify-between subtotal-row q-mt-sm">
                    <span class="col-6 text-right text-weight-bold">DIFERENCIA</span>
                    <span class="col-6 text-right text-weight-bold">{{ formatMoney(reporte.config.saldo_final - reporte.config.fondo_fijo) }}</span>
                </div>
            </div>
        </div>
      </q-card-section>
    </q-card>

    <DialogoEntradaCaja v-model="mostrarEntrada" @entrada-registrada="consultarFlujo" />
    <DialogoSalidaCaja v-model="mostrarSalida" @salida-registrada="consultarFlujo" />
  </q-page>
</template>

<script setup>
  import { ref } from 'vue'
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

  // Utilidades
  const formatMoney = (val) => {
    return Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
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
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
  }
  
  .info-grid {
    border-bottom: 2px solid #000;
  }
  
  .section-header {
    text-align: center;
    padding: 6px;
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
    margin-top: 16px;
    font-size: 15px;
  }
  .section-header-col {
    text-align: center;
    padding: 2px;
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 14px;
  }
  
  .column-left {
    border-right: 1px solid #000;
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
    padding-top: 2px;
    padding-bottom: 2px;
  }
  .subitem-row {
    padding-left: 35px;
    padding-top: 2px;
    padding-bottom: 2px;
  }
  .subtotal-row {
    border-top: 1px solid #000;
    padding-top: 2px;
  }
  
  .total-box {
    border-top: 2px solid #000;
    border-bottom: 2px solid #000;
    padding-top: 6px;
    padding-bottom: 6px;
    font-size: 13px;
  }
  
  .line-bottom {
    border-bottom: 1px solid #000;
  }
  .line-top {
    border-top: 1px solid #000;
  }
</style>
