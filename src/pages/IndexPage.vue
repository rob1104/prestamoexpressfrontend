<template>
  <q-page class="q-pa-lg modern-bg">
    <!-- Header -->
    <div class="row items-center q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-grey-9" style="letter-spacing: -0.5px;">Resumen del Día</div>
        <div class="text-subtitle1 text-grey-6 q-mt-xs">Visualización en tiempo real de las métricas clave de la sucursal.</div>
      </div>
      <div class="col-12 col-md-4 text-right desktop-only">
        <q-btn unelevated color="primary" class="q-px-lg text-weight-bold shadow-2 glossy border-radius-sm" icon="refresh" label="Actualizar" @click="fetchDashboardData" :loading="loading" />
      </div>
    </div>

    <!-- Skeletons (Loading State) -->
    <div class="row q-col-gutter-lg" v-if="loading">
      <div class="col-12 col-sm-6 col-md-3" v-for="i in 4" :key="i">
        <q-card class="premium-card">
          <q-card-section class="q-pt-md">
            <q-skeleton type="text" class="text-h6" width="50%" />
            <q-skeleton type="text" class="text-h3 q-mt-sm" width="80%" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dashboard Cards -->
    <div class="row q-col-gutter-xl" v-else>

      <!-- Fila 1: Finanzas -->
      <div class="col-12 text-h6 text-grey-9 q-mt-sm q-mb-xs text-weight-bolder" style="letter-spacing: -0.5px;">
        <q-icon name="account_balance_wallet" color="primary" class="q-mr-sm" size="md" /> Movimientos de Caja
      </div>

      <!-- Ingresos a Caja -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="premium-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-6 text-uppercase text-weight-bolder letter-space-1">Ingresos de Hoy</div>
              <div class="text-h5 text-md-h4 text-weight-bolder text-grey-9 q-mt-sm font-mono">
                ${{ formatMoney(resumen.ingresos_caja) }}
              </div>
            </div>
            <div class="col-auto">
              <div class="icon-box bg-green-1">
                <q-icon name="point_of_sale" color="green-7" size="32px" />
              </div>
            </div>
          </q-card-section>
          <div class="card-indicator bg-green-5"></div>
        </q-card>
      </div>

      <!-- Egresos a Caja -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="premium-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-6 text-uppercase text-weight-bolder letter-space-1">Salidas de Hoy</div>
              <div class="text-h5 text-md-h4 text-weight-bolder text-grey-9 q-mt-sm font-mono">
                ${{ formatMoney(resumen.egresos_caja) }}
              </div>
            </div>
            <div class="col-auto">
              <div class="icon-box bg-red-1">
                <q-icon name="money_off" color="red-6" size="32px" />
              </div>
            </div>
          </q-card-section>
          <div class="card-indicator bg-red-5"></div>
        </q-card>
      </div>

      <!-- Intereses Cobrados -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="premium-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-6 text-uppercase text-weight-bolder letter-space-1">Intereses Cobrados</div>
              <div class="text-h5 text-md-h4 text-weight-bolder text-grey-9 q-mt-sm font-mono">
                ${{ formatMoney(resumen.intereses_cobrados) }}
              </div>
            </div>
            <div class="col-auto">
              <div class="icon-box bg-pink-1">
                <q-icon name="price_check" color="pink-6" size="32px" />
              </div>
            </div>
          </q-card-section>
          <div class="card-indicator bg-pink-5"></div>
        </q-card>
      </div>

      <!-- Ventas del Día -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="premium-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-6 text-uppercase text-weight-bolder letter-space-1">Ventas (Mostrador)</div>
              <div class="text-h5 text-md-h4 text-weight-bolder text-grey-9 q-mt-sm font-mono">
                ${{ formatMoney(resumen.ventas_total) }}
              </div>
            </div>
            <div class="col-auto">
              <div class="icon-box bg-purple-1">
                <q-icon name="shopping_cart" color="purple-6" size="32px" />
              </div>
            </div>
          </q-card-section>
          <div class="card-indicator bg-purple-5"></div>
        </q-card>
      </div>

      <!-- Fila 2: Operativa -->
      <div class="col-12 text-h6 text-grey-9 q-mt-xl q-mb-xs text-weight-bolder" style="letter-spacing: -0.5px;">
        <q-icon name="insert_chart" color="primary" class="q-mr-sm" size="md" /> Operación y Cartera
      </div>

      <!-- Empeños Nuevos -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="premium-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-6 text-uppercase text-weight-bolder letter-space-1">Préstamos Entregados</div>
              <div class="text-h5 text-md-h4 text-weight-bolder text-grey-9 q-mt-sm font-mono">
                ${{ formatMoney(resumen.empenos_monto) }}
              </div>
              <div class="text-caption text-blue-grey-5 q-mt-sm text-weight-bold"><q-icon name="trending_up" class="q-mr-xs"/> En {{ resumen.empenos_count }} boletas</div>
            </div>
            <div class="col-auto">
              <div class="icon-box bg-blue-1">
                <q-icon name="real_estate_agent" color="blue-7" size="32px" />
              </div>
            </div>
          </q-card-section>
          <div class="card-indicator bg-blue-5"></div>
        </q-card>
      </div>

      <!-- Total Cartera Activa -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="premium-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-6 text-uppercase text-weight-bolder letter-space-1">Cartera Activa</div>
              <div class="text-h5 text-md-h4 text-weight-bolder text-grey-9 q-mt-sm font-mono">
                ${{ formatMoney(resumen.cartera_activa) }}
              </div>
              <div class="text-caption text-blue-grey-5 q-mt-sm text-weight-bold"><q-icon name="public" class="q-mr-xs"/> Capital en la calle</div>
            </div>
            <div class="col-auto">
              <div class="icon-box bg-teal-1">
                <q-icon name="account_balance" color="teal-6" size="32px" />
              </div>
            </div>
          </q-card-section>
          <div class="card-indicator bg-teal-5"></div>
        </q-card>
      </div>

      <!-- Boletas Vencidas -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="premium-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-6 text-uppercase text-weight-bolder letter-space-1">Boletas Vencidas</div>
              <div class="text-h5 text-md-h4 text-weight-bolder text-grey-9 q-mt-sm font-mono">
                {{ resumen.boletas_vencidas }}
              </div>
              <div class="text-caption text-orange-8 q-mt-sm text-weight-bold"><q-icon name="warning" class="q-mr-xs"/> Requieren atención</div>
            </div>
            <div class="col-auto">
              <div class="icon-box bg-orange-1">
                <q-icon name="assignment_late" color="orange-8" size="32px" />
              </div>
            </div>
          </q-card-section>
          <div class="card-indicator bg-orange-5"></div>
        </q-card>
      </div>

      <!-- Clientes Nuevos -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="premium-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-6 text-uppercase text-weight-bolder letter-space-1">Clientes Nuevos</div>
              <div class="text-h5 text-md-h4 text-weight-bolder text-grey-9 q-mt-sm font-mono">
                {{ resumen.clientes_nuevos }}
              </div>
              <div class="text-caption text-indigo-5 q-mt-sm text-weight-bold"><q-icon name="person_add" class="q-mr-xs"/> Registrados hoy</div>
            </div>
            <div class="col-auto">
              <div class="icon-box bg-indigo-1">
                <q-icon name="group_add" color="indigo-5" size="32px" />
              </div>
            </div>
          </q-card-section>
          <div class="card-indicator bg-indigo-4"></div>
        </q-card>
      </div>

      <!-- Fila 3: Inventario Físico (ALTO CONTRASTE / TEMA OSCURO PARA DESTACAR) -->
      <div class="col-12 text-h6 text-grey-9 q-mt-xl q-mb-xs text-weight-bolder" style="letter-spacing: -0.5px;">
        <q-icon name="inventory" color="primary" class="q-mr-sm" size="md" /> Inventario de Mi Caja
      </div>

      <div class="col-12" v-if="inventarioCaja">
        <q-card class="premium-dark-card text-white shadow-6">
          <div class="row justify-between items-center q-px-lg q-py-md bg-blue-grey-10">
            <div class="text-subtitle1 text-blue-grey-2 text-weight-bolder text-uppercase letter-space-1">
              <q-icon name="lock" class="q-mr-sm" /> Conteo Actual de Caja
            </div>
            <div class="text-h3 text-weight-bolder text-green-4 font-mono">
              ${{ formatMoney(inventarioCaja.total) }}
            </div>
          </div>

          <div class="q-pa-lg bg-blue-grey-9">
            <div class="row q-col-gutter-xl">
              <!-- Billetes -->
              <div class="col-12 col-md-6">
                <div class="text-subtitle2 text-blue-grey-3 text-uppercase text-weight-bolder letter-space-1 q-mb-md">
                  <q-icon name="payments" class="q-mr-sm"/> Billetes
                </div>
                <div class="row q-col-gutter-sm">
                  <div v-for="(cant, denom) in inventarioCaja.billetes" :key="'b'+denom" class="col-6 col-sm-4 col-md-4">
                    <q-card class="vault-item" flat>
                      <q-card-section class="q-pa-sm text-center">
                        <div class="text-subtitle1 text-md-h6 text-weight-bolder text-white">${{ denom }}</div>
                        <q-badge :color="cant > 0 ? 'green-5' : 'blue-grey-7'" class="text-weight-bold q-mt-xs q-px-sm q-py-xs" text-color="black">
                          {{ cant }} pzs
                        </q-badge>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <!-- Monedas -->
              <div class="col-12 col-md-6">
                <div class="text-subtitle2 text-blue-grey-3 text-uppercase text-weight-bolder letter-space-1 q-mb-md">
                  <q-icon name="toll" class="q-mr-sm"/> Monedas
                </div>
                <div class="row q-col-gutter-sm">
                  <div v-for="(cant, denom) in inventarioCaja.monedas" :key="'m'+denom" class="col-6 col-sm-4 col-md-4">
                    <q-card class="vault-item" flat>
                      <q-card-section class="q-pa-sm text-center">
                        <div class="text-subtitle1 text-md-h6 text-weight-bolder text-white">${{ denom }}</div>
                        <q-badge :color="cant > 0 ? 'orange-4' : 'blue-grey-7'" class="text-weight-bold q-mt-xs q-px-sm q-py-xs" text-color="black">
                          {{ cant }} pzs
                        </q-badge>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </q-card>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(true)

const resumen = ref({
  ingresos_caja: 0,
  egresos_caja: 0,
  empenos_count: 0,
  empenos_monto: 0,
  ventas_total: 0,
  boletas_vencidas: 0,
  cartera_activa: 0,
  clientes_nuevos: 0,
  intereses_cobrados: 0
})

const inventarioCaja = ref(null)

const formatMoney = (val) => {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const [resResumen, resInventario] = await Promise.all([
      api.get('/api/dashboard/resumen'),
      api.get('/api/caja/inventario')
    ])

    if (resResumen.data) {
      resumen.value = resResumen.data
    }
    if (resInventario.data) {
      // Ordenamos las denominaciones de mayor a menor para una mejor visualización
      const sortedBilletes = {}
      Object.keys(resInventario.data.billetes).sort((a,b) => b - a).forEach(k => {
        sortedBilletes[k] = resInventario.data.billetes[k]
      })
      const sortedMonedas = {}
      Object.keys(resInventario.data.monedas).sort((a,b) => b - a).forEach(k => {
        sortedMonedas[k] = resInventario.data.monedas[k]
      })
      inventarioCaja.value = {
        total: resInventario.data.total,
        billetes: sortedBilletes,
        monedas: sortedMonedas
      }
    }
  } catch (error) {
    console.error('Error cargando dashboard', error)
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Fallo al conectar con el servidor para obtener el resumen',
      icon: 'report_problem'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
/* Fondo general más elegante */
.modern-bg {
  background-color: #f4f7f9;
}

/* Tarjetas base con efecto de elevación moderno */
.premium-card {
  background: #ffffff;
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  height: 100%;
}

.premium-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
}

/* Indicador lateral de color en la tarjeta */
.card-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  opacity: 0.8;
}

/* Cajas de los iconos */
.icon-box {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Utilidades tipográficas */
.letter-space-1 {
  letter-spacing: 0.5px;
}
.font-mono {
  font-family: 'Courier New', Courier, monospace;
}

/* Estilos de la bóveda (Inventario Caja) */
.premium-dark-card {
  border-radius: 16px;
  overflow: hidden;
}

.vault-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.vault-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.03);
}
</style>
