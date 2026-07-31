<template>
  <q-page class="q-pa-md bg-blue-grey-1">
    <!-- Header -->
    <div class="row items-center q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-primary">Resumen del Día</div>
        <div class="text-subtitle1 text-grey-7">Visualización en tiempo real de las métricas clave de la sucursal.</div>
      </div>
      <div class="col-12 col-md-4 text-right desktop-only">
        <q-btn flat color="primary" icon="refresh" label="Actualizar" @click="fetchDashboardData" :loading="loading" />
      </div>
    </div>

    <!-- Skeletons (Loading State) -->
    <div class="row q-col-gutter-lg" v-if="loading">
      <div class="col-12 col-sm-6 col-md-3" v-for="i in 4" :key="i">
        <q-card class="my-card" flat bordered>
          <q-card-section class="q-pt-xs">
            <q-skeleton type="text" class="text-h6" width="50%" />
            <q-skeleton type="text" class="text-h3" width="80%" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dashboard Cards -->
    <div class="row q-col-gutter-lg" v-else>
      
      <!-- Fila 1: Finanzas -->
      <div class="col-12 text-h6 text-primary q-mt-md q-mb-sm text-weight-bold">
        <q-icon name="account_balance_wallet" class="q-mr-sm" /> Movimientos de Caja
      </div>

      <!-- Ingresos a Caja -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="dashboard-card bg-white" flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-7 text-uppercase text-weight-bold">Ingresos de Hoy</div>
              <div class="text-h4 text-weight-bolder text-green-8 q-mt-sm">
                ${{ formatMoney(resumen.ingresos_caja) }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar size="56px" color="green-1" text-color="green-8" icon="point_of_sale" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Egresos a Caja -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="dashboard-card bg-white" flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-7 text-uppercase text-weight-bold">Salidas de Hoy</div>
              <div class="text-h4 text-weight-bolder text-red-8 q-mt-sm">
                ${{ formatMoney(resumen.egresos_caja) }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar size="56px" color="red-1" text-color="red-8" icon="money_off" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Intereses Cobrados -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="dashboard-card bg-white" flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-7 text-uppercase text-weight-bold">Intereses Cobrados</div>
              <div class="text-h4 text-weight-bolder text-primary q-mt-sm">
                ${{ formatMoney(resumen.intereses_cobrados) }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar size="56px" color="pink-1" text-color="primary" icon="price_check" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Ventas del Día -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="dashboard-card bg-white" flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-7 text-uppercase text-weight-bold">Ventas (Mostrador)</div>
              <div class="text-h4 text-weight-bolder text-purple-8 q-mt-sm">
                ${{ formatMoney(resumen.ventas_total) }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar size="56px" color="purple-1" text-color="purple-8" icon="shopping_cart" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Fila 2: Operativa -->
      <div class="col-12 text-h6 text-primary q-mt-xl q-mb-sm text-weight-bold">
        <q-icon name="insert_chart" class="q-mr-sm" /> Operación y Cartera
      </div>

      <!-- Empeños Nuevos -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="dashboard-card bg-white" flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-7 text-uppercase text-weight-bold">Préstamos Entregados</div>
              <div class="text-h4 text-weight-bolder text-blue-8 q-mt-sm">
                ${{ formatMoney(resumen.empenos_monto) }}
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">En {{ resumen.empenos_count }} boletas nuevas</div>
            </div>
            <div class="col-auto">
              <q-avatar size="56px" color="blue-1" text-color="blue-8" icon="real_estate_agent" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Total Cartera Activa -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="dashboard-card bg-white" flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-7 text-uppercase text-weight-bold">Cartera Activa</div>
              <div class="text-h4 text-weight-bolder text-teal-8 q-mt-sm">
                ${{ formatMoney(resumen.cartera_activa) }}
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">Capital en la calle</div>
            </div>
            <div class="col-auto">
              <q-avatar size="56px" color="teal-1" text-color="teal-8" icon="account_balance" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Boletas Vencidas -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="dashboard-card bg-white" flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-7 text-uppercase text-weight-bold">Boletas Vencidas</div>
              <div class="text-h4 text-weight-bolder text-orange-9 q-mt-sm">
                {{ resumen.boletas_vencidas }}
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">Requieren atención</div>
            </div>
            <div class="col-auto">
              <q-avatar size="56px" color="orange-1" text-color="orange-9" icon="warning" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Clientes Nuevos -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="dashboard-card bg-white" flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-grey-7 text-uppercase text-weight-bold">Clientes Nuevos</div>
              <div class="text-h4 text-weight-bolder text-indigo-8 q-mt-sm">
                {{ resumen.clientes_nuevos }}
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">Registrados hoy</div>
            </div>
            <div class="col-auto">
              <q-avatar size="56px" color="indigo-1" text-color="indigo-8" icon="person_add" />
            </div>
          </q-card-section>
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

const formatMoney = (val) => {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const res = await api.get('/api/dashboard/resumen')
    if (res.data) {
      resumen.value = res.data
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
.dashboard-card {
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
}
.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}
</style>
