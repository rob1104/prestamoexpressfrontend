<template>
  <q-page class="q-pa-md bg-blue-grey-1">
    <q-card flat bordered class="q-mb-md shadow-2">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="text-h6 text-primary q-mr-md text-weight-bolder">REPORTE DE CARTERA</div>

        <div class="col-12 col-sm-auto">
          <q-input v-model="form.fecha" outlined dense label="Fecha de Corte" bg-color="white">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.fecha" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-auto">
          <q-input v-model.number="form.dias_adjudicar" type="number" outlined dense label="Días para Adjudicar" bg-color="white" style="width: 150px" />
        </div>

        <q-btn color="primary" icon="search" label="Consultar" @click="consultarCartera" :loading="loading" class="q-ml-sm" />
        <q-btn color="secondary" icon="print" label="Imprimir PDF" @click="imprimirPDF" flat class="q-ml-xs" />
      </q-card-section>
    </q-card>

    <div v-if="reporteData">
      <q-card flat bordered class="bg-white shadow-5 q-mb-lg">
        <q-card-section class="q-pa-none">
          <q-markup-table flat bordered dense class="reporte-cartera-table">
            <thead>
              <tr class="bg-grey-3">
                <th class="text-left" style="width: 40%">CONCEPTO / DESCRIPCIÓN</th>
                <th class="text-center">CANT.</th>
                <th class="text-right">CAPITAL</th>
                <th class="text-right">UTILIDAD (INT/REC)</th>
                <th class="text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr class="section-header bg-blue-1">
                <td colspan="5" class="text-weight-bold text-blue-10">1. MOVIMIENTOS DEL DÍA (PRÉSTAMOS NUEVOS)</td>
              </tr>
              <tr>
                <td>Préstamos realizados en la fecha</td>
                <td class="text-center">{{ reporteData.resumen.prestamos.cantidad }}</td>
                <td class="text-right">$ {{ formatMoney(reporteData.resumen.prestamos.monto) }}</td>
                <td class="text-right">$ 0.00</td>
                <td class="text-right text-weight-bold">$ {{ formatMoney(reporteData.resumen.prestamos.monto) }}</td>
              </tr>

              <tr class="section-header bg-green-1">
                <td colspan="5" class="text-weight-bold text-green-10">2. RECUPERACIÓN DE CARTERA (COBRANZA)</td>
              </tr>
              <tr>
                <td>Desempeños y Refrendos realizados</td>
                <td class="text-center">{{ reporteData.resumen.cobranza.cantidad }}</td>
                <td class="text-right">$ {{ formatMoney(reporteData.resumen.cobranza.capital) }}</td>
                <td class="text-right">$ {{ formatMoney(reporteData.resumen.cobranza.utilidad) }}</td>
                <td class="text-right text-weight-bold text-green-9">$ {{ formatMoney(reporteData.resumen.cobranza.total) }}</td>
              </tr>

              <tr class="section-header bg-orange-1">
                <td colspan="5" class="text-weight-bold text-orange-10">3. CARTERA POR COBRAR AL CORTE</td>
              </tr>
              <tr>
                <td>Cartera Vigente (Al corriente)</td>
                <td class="text-center">{{ reporteData.cartera.vigente_cant }}</td>
                <td class="text-right">$ {{ formatMoney(reporteData.cartera.vigente_monto) }}</td>
                <td class="text-right">--</td>
                <td class="text-right">$ {{ formatMoney(reporteData.cartera.vigente_monto) }}</td>
              </tr>
              <tr>
                <td>Cartera Vencida (En mora)</td>
                <td class="text-center">{{ reporteData.cartera.vencida_cant }}</td>
                <td class="text-right">$ {{ formatMoney(reporteData.cartera.vencida_monto) }}</td>
                <td class="text-right">--</td>
                <td class="text-right">$ {{ formatMoney(reporteData.cartera.vencida_monto) }}</td>
              </tr>
              <tr class="bg-red-1">
                <td class="text-weight-bold">Posible Adjudicación (Vencido > {{ form.dias_adjudicar }} días)</td>
                <td class="text-center">{{ reporteData.cartera.adjudicada_cant }}</td>
                <td class="text-right text-weight-bold">$ {{ formatMoney(reporteData.cartera.adjudicada_monto) }}</td>
                <td class="text-right">--</td>
                <td class="text-right text-weight-bold text-red">$ {{ formatMoney(reporteData.cartera.adjudicada_monto) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-grey-9 text-white">
              <tr>
                <td colspan="2" class="text-right text-weight-bolder uppercase">Total Cartera en Calle:</td>
                <td class="text-right text-h6">$ {{ formatMoney(reporteData.cartera.total_general) }}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </q-markup-table>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="bg-white shadow-5 q-pa-md">
        <div class="text-center text-weight-bolder text-h5 uppercase q-mb-xs">CARTERA</div>
        <div class="text-center text-subtitle2 italic q-mb-md">Información Detallada por Producto</div>

        <div class="text-weight-bold text-primary q-mb-xs">P A G O S</div>
        <q-markup-table flat bordered dense class="q-mb-lg table-detalle">
          <thead class="bg-blue-1">
            <tr>
              <th class="text-left" style="width: 40%">CONCEPTO</th>
              <th class="text-right">Capital</th>
              <th class="text-right">Comisión</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>+ Préstamos Nuevos</td>
              <td class="text-right">{{ formatMoney(reporteData.detalle.pagos.nuevos?.capital) }}</td>
              <td class="text-right">{{ formatMoney(reporteData.detalle.pagos.nuevos?.comision) }}</td>
              <td class="text-right text-weight-bold">{{ formatMoney(Number(reporteData.detalle.pagos.nuevos?.capital) + Number(reporteData.detalle.pagos.nuevos?.comision)) }}</td>
            </tr>
            <tr>
              <td>Por Cobrar Vigente</td>
              <td class="text-right">{{ formatMoney(reporteData.detalle.pagos.vigente?.capital) }}</td>
              <td class="text-right">{{ formatMoney(reporteData.detalle.pagos.vigente?.comision) }}</td>
              <td class="text-right">{{ formatMoney(Number(reporteData.detalle.pagos.vigente?.capital) + Number(reporteData.detalle.pagos.vigente?.comision)) }}</td>
            </tr>
            <tr class="bg-orange-1 text-weight-bold">
              <td>Posible Adjudicación ({{ reporteData.detalle.pagos.adjudicado?.cantidad }})</td>
              <td class="text-right">{{ formatMoney(reporteData.detalle.pagos.adjudicado?.capital) }}</td>
              <td class="text-right">{{ formatMoney(reporteData.detalle.pagos.adjudicado?.comision) }}</td>
              <td class="text-right">{{ formatMoney(Number(reporteData.detalle.pagos.adjudicado?.capital) + Number(reporteData.detalle.pagos.adjudicado?.comision)) }}</td>
            </tr>
          </tbody>
        </q-markup-table>

        <div class="text-weight-bold text-orange-9 q-mb-xs">T R A D I C I O N A L</div>
        <q-markup-table flat bordered dense class="table-detalle">
          <thead class="bg-orange-1">
            <tr>
              <th class="text-left" style="width: 40%">CONCEPTO</th>
              <th class="text-right">Capital</th>
              <th class="text-right">Comisión</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>+ Préstamos Nuevos</td>
              <td class="text-right">{{ formatMoney(reporteData.detalle.tradicional.nuevos?.capital) }}</td>
              <td class="text-right">{{ formatMoney(reporteData.detalle.tradicional.nuevos?.comision) }}</td>
              <td class="text-right text-weight-bold">{{ formatMoney(Number(reporteData.detalle.tradicional.nuevos?.capital) + Number(reporteData.detalle.tradicional.nuevos?.comision)) }}</td>
            </tr>
            <tr>
              <td>Por Cobrar Vigente</td>
              <td class="text-right">{{ formatMoney(reporteData.detalle.tradicional.vigente?.capital) }}</td>
              <td class="text-right">{{ formatMoney(reporteData.detalle.tradicional.vigente?.comision) }}</td>
              <td class="text-right">{{ formatMoney(Number(reporteData.detalle.tradicional.vigente?.capital) + Number(reporteData.detalle.tradicional.vigente?.comision)) }}</td>
            </tr>
            <tr class="bg-red-1 text-weight-bold">
              <td>Posible Adjudicación ({{ reporteData.detalle.tradicional.adjudicado?.cantidad }})</td>
              <td class="text-right">{{ formatMoney(reporteData.detalle.tradicional.adjudicado?.capital) }}</td>
              <td class="text-right">{{ formatMoney(reporteData.detalle.tradicional.adjudicado?.comision) }}</td>
              <td class="text-right">{{ formatMoney(Number(reporteData.detalle.tradicional.adjudicado?.capital) + Number(reporteData.detalle.tradicional.adjudicado?.comision)) }}</td>
            </tr>
          </tbody>
        </q-markup-table>

        <div class="row justify-end q-mt-md">
          <div class="col-12 col-md-6 text-right">
            <div class="text-caption text-grey-7">Ajuste Diferencial Estimado: <span class="text-red">-$ 0.00</span></div>
            <div class="text-h5 text-weight-bolder">TOTAL CARTERA ({{ form.fecha }}):
              <span class="text-primary text-h4">$ {{ formatMoney(reporteData.totales.total_general) }}</span>
            </div>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
  import { ref } from 'vue'
  import { api } from 'boot/axios'
  import { date, useQuasar } from 'quasar'

  const $q = useQuasar()
  const loading = ref(false)
  const reporteData = ref(null)

  const form = ref({
    fecha: date.formatDate(new Date(), 'YYYY-MM-DD'),
    dias_adjudicar: 15
  })

  // Función estandarizada de moneda con protección contra nulos
  const formatMoney = (val) => {
    if (val === undefined || val === null) return '0.00'
    return Number(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const consultarCartera = async () => {
    loading.value = true
    try {
      const res = await api.get('/api/reportes/cartera', { params: form.value })
      reporteData.value = res.data
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Error al obtener datos de cartera' })
    } finally {
      loading.value = false
    }
  }


  const imprimirPDF = async() => {

    try {
      // 1. Pedimos el link firmado (Esta petición lleva el Token en el header)
      const res = await api.get('/api/reportes/cartera/url-firmada', {
        params: form.value
      })

      // 2. Abrimos la URL firmada que nos mandó Laravel
      // Esta URL ya no necesita token porque lleva la firma en el query string
      window.open(res.data.url, '_blank')

    } catch (e) {
      $q.notify({
        type: 'negative',
        message: 'No tienes permiso para generar este reporte' //Error si no esta firmada
      })
    }
  }
</script>

<style scoped>
  .reporte-cartera-table, .table-detalle {
    font-family: 'Courier New', Courier, monospace;
  }

  .reporte-cartera-table thead th, .table-detalle thead th {
    font-size: 13px;
    font-weight: bold;
  }

  .section-header td {
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .table-detalle td {
    font-size: 13px;
  }
</style>
