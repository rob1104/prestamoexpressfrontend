<template>
  <q-page class="q-pa-md bg-blue-grey-1">
    <q-card flat bordered class="q-mb-md shadow-2">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="text-h6 text-primary q-mr-md text-weight-bolder">FLUJO DE CAJA GENERAL</div>

        <div class="col-12 col-sm-auto">
          <q-input v-model="form.fecha_inicio" outlined dense type="date" label="Fecha Inicio" bg-color="white" />
        </div>

        <div class="col-12 col-sm-auto">
          <q-input v-model="form.fecha_fin" outlined dense type="date" label="Fecha Fin" bg-color="white" />
        </div>

        <q-btn color="primary" icon="search" label="Consultar" @click="consultarFlujo" :loading="loading" class="q-ml-sm" />
        <q-btn color="grey-7" icon="print" label="Imprimir PDF" @click="imprimirPDF" :disable="!reporte" flat class="q-ml-xs" />
      </q-card-section>
    </q-card>

    <q-card v-if="reporte" flat bordered class="bg-white shadow-10 reporte-container">
      <q-card-section class="text-center q-pb-none">
        <div class="text-h5 text-weight-bolder uppercase">PRESTAMO EXPRESS MATRIZ</div>
        <div class="text-subtitle2">CORPORATIVO EXPRESS S.A. DE C.V.</div>
        <div class="text-h6 q-mt-sm border-y">FLUJO DE CAJA GENERAL CORPORATIVO</div>
        <div class="text-caption text-weight-bold">{{ reporte.config.fecha_rango }}</div>
      </q-card-section>

      <q-card-section class="row q-col-gutter-xl">
        <div class="col-12 col-md-6 border-right">
          <div class="bg-grey-3 text-center text-weight-bold q-pa-xs border-black">E N T R A D A S</div>

          <div class="row justify-between q-mt-md text-weight-bolder fs-14">
            <span>SALDO INICIAL (HISTÓRICO)</span>
            <span>$ {{ formatMoney(reporte.config.saldo_inicial) }}</span>
          </div>

          <div class="q-mt-lg text-weight-bold border-bottom">PAGOS (RECUPERACIÓN)</div>
          <div class="row justify-between q-pl-md q-mt-xs">
            <span>+ Capital Recuperado</span>
            <span>$ {{ formatMoney(reporte.entradas.pagos_capital) }}</span>
          </div>
          <div class="row justify-between q-pl-md">
            <span>+ Intereses e IVA</span>
            <span>$ {{ formatMoney(reporte.entradas.pagos_interes) }}</span>
          </div>
          <div class="row justify-between q-pl-md">
            <span>+ Recargos</span>
            <span>$ {{ formatMoney(reporte.entradas.pagos_recargos) }}</span>
          </div>

          <div class="q-mt-md text-weight-bold border-bottom">OTROS MOVIMIENTOS</div>
          <div class="row justify-between q-pl-md q-mt-xs">
            <span>+ Aportaciones / Entradas Diversas</span>
            <span>$ {{ formatMoney(reporte.entradas.otros) }}</span>
          </div>

          <div class="total-section q-mt-xl q-pa-sm bg-green-1 border-green">
            <div class="row justify-between text-h6 text-green-10 text-weight-bolder">
              <span>TOTAL ENTRADAS:</span>
              <span>$ {{ formatMoney(totalEntradas) }}</span>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="bg-grey-3 text-center text-weight-bold q-pa-xs border-black">S A L I D A S</div>

          <div class="q-mt-md text-weight-bold border-bottom">PRÉSTAMOS</div>
          <div class="row justify-between q-pl-md q-mt-xs">
            <span>- Préstamos Nuevos (Otorgados)</span>
            <span>$ {{ formatMoney(reporte.salidas.prestamos) }}</span>
          </div>

          <div class="q-mt-lg text-weight-bold border-bottom">GASTOS Y RETIROS</div>
          <div class="row justify-between q-pl-md q-mt-xs">
            <span>- Gastos Generales / Varios</span>
            <span>$ {{ formatMoney(reporte.salidas.otros) }}</span>
          </div>

          <div class="total-section q-mt-xl q-pa-sm bg-red-1 border-red" style="margin-top: 135px;">
            <div class="row justify-between text-h6 text-red-10 text-weight-bolder">
              <span>TOTAL SALIDAS:</span>
              <span>$ {{ formatMoney(totalSalidas) }}</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="bg-blue-grey-10 text-white q-pa-lg">
        <div class="row justify-between items-center">
          <div class="column">
            <span class="text-h5 text-weight-light">SALDO FINAL EN CAJA</span>
            <span class="text-caption text-blue-grey-3">Calculado: (Saldo Inicial + Entradas) - Salidas</span>
          </div>
          <div class="text-h3 text-weight-bolder">
            $ {{ formatMoney(totalEntradas - totalSalidas) }}
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { api } from 'boot/axios'
  import { date, useQuasar } from 'quasar'

  const $q = useQuasar()
  const loading = ref(false)
  const reporte = ref(null)

  const form = ref({
    fecha_inicio: date.formatDate(new Date(), 'YYYY-MM-DD'),
    fecha_fin: date.formatDate(new Date(), 'YYYY-MM-DD'),
    caja_id: 1
  })

  // Cálculos Computados para Totales
  const totalEntradas = computed(() => {
    if (!reporte.value) return 0
    const r = reporte.value
    return Number(r.config.saldo_inicial) +
          Number(r.entradas.pagos_capital) +
          Number(r.entradas.pagos_interes) +
          Number(r.entradas.pagos_recargos) +
          Number(r.entradas.otros)
  })

  const totalSalidas = computed(() => {
    if (!reporte.value) return 0
    return Number(reporte.value.salidas.prestamos) + Number(reporte.value.salidas.otros)
  })

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

  // Lógica de Impresión Protegida (Signed URL)
  const imprimirPDF = async () => {
    loading.value = true
    try {
      // 1. Obtenemos la URL firmada desde el backend (Ruta protegida por Auth)
      const res = await api.get('/api/reportes/flujo-caja/url-firmada', {
        params: form.value
      })

      // 2. Abrimos la URL firmada en pestaña nueva
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
  }
  .border-right {
    border-right: 1px solid #ccc;
  }
  .border-black {
    border: 1px solid #000;
  }
  .border-y {
    border-top: 2px solid #000;
    border-bottom: 2px solid #000;
    padding: 5px 0;
  }
  .border-bottom {
    border-bottom: 1px solid #eee;
  }
  .border-green {
    border: 2px solid #2e7d32;
  }
  .border-red {
    border: 2px solid #c62828;
  }
  .fs-14 {
    font-size: 14px;
  }
</style>
