<template>
  <q-page class="q-pa-xl bg-slate-50">
    <div class="row items-center q-mb-xl">
      <div class="col">
        <div class="text-h4 text-weight-bolder text-primary tracking-tight text-uppercase">
          <q-icon name="payments" class="q-mr-sm" /> Cotización de Oro y Monedas
        </div>
        <div class="text-subtitle1 text-grey-7">
          Gestión centralizada de parámetros de valuación para boletas de empeño
        </div>
      </div>
      <div class="col-auto q-gutter-sm">
        <q-btn
          unelevated
          color="primary"
          icon="check_circle"
          label="F6 - Confirmar"
          rounded
          class="q-px-xl shadow-8 shadow-btn-premium"
          @click="saveCotizaciones"
        />
        <q-btn
          outline
          color="grey-8"
          icon="cancel"
          label="F9 - Salir"
          rounded
          class="q-px-lg"
          to="/"
        />
      </div>
    </div>

    <div class="row q-col-gutter-xl">
      <div class="col-12">
        <q-card class="table-container shadow-24 no-border">
          <q-card-section class="bg-primary text-white q-pa-md">
            <div class="text-h6 text-weight-bold text-center text-uppercase tracking-widest">
              Cotización de Oro por Gramos
            </div>
          </q-card-section>

          <q-card-section class="q-pa-none">
            <q-markup-table flat class="sicae-quotation-table">
              <thead>
                <tr class="bg-grey-2 text-grey-8">
                  <th class="text-left font-bold">KILATAJE</th>
                  <th class="text-center">CLIENTE NUEVO</th>
                  <th class="text-center">BUEN CLIENTE</th>
                  <th class="text-center">EXCELENTE CLIENTE</th>
                  <th class="text-center bg-blue-1">COMPRA</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in gramos" :key="item.id">
                  <td class="text-weight-bolder text-primary text-h6" style="width: 200px">
                    {{ item.descripcion }}
                  </td>
                  <td><q-input v-model.number="item.precio_nuevo" dense outlined prefix="$" type="number" class="price-input" /></td>
                  <td><q-input v-model.number="item.precio_bueno" dense outlined prefix="$" type="number" class="price-input" /></td>
                  <td><q-input v-model.number="item.precio_excelente" dense outlined prefix="$" type="number" class="price-input" /></td>
                  <td class="bg-blue-0"><q-input v-model.number="item.precio_compra" dense outlined prefix="$" type="number" class="price-input purchase-style" /></td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card class="table-container shadow-24 no-border">
          <q-card-section class="bg-indigo-9 text-white q-pa-md">
            <div class="text-h6 text-weight-bold text-center text-uppercase tracking-widest">
              Cotización de Monedas de Oro
            </div>
          </q-card-section>

          <q-card-section class="q-pa-lg row justify-center bg-grey-1 border-bottom">
            <div class="col-12 col-md-6 flex flex-center q-gutter-md">
              <span class="text-subtitle1 text-weight-bold text-uppercase text-indigo-9">
                Precio del Centenario a la Compra:
              </span>
              <q-input
                v-model.number="centenarioCompra"
                dense
                outlined
                prefix="$"
                type="number"
                class="bg-white shadow-2 centenario-input"
                input-class="text-weight-bolder text-h6 text-center"
              />
            </div>
          </q-card-section>

          <q-card-section class="q-pa-none">
            <q-markup-table flat class="sicae-quotation-table">
              <thead>
                <tr class="bg-grey-2 text-grey-8">
                  <th class="text-left font-bold">DENOMINACIÓN</th>
                  <th class="text-center">CLIENTE NUEVO</th>
                  <th class="text-center">BUEN CLIENTE</th>
                  <th class="text-center">EXCELENTE CLIENTE</th>
                  <th class="text-center bg-blue-1">COMPRA</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in monedas" :key="item.id">
                  <td class="text-weight-bolder text-indigo-9 text-h6" style="width: 200px">
                    {{ item.descripcion }}
                  </td>
                  <td><q-input v-model.number="item.precio_nuevo" dense outlined prefix="$" type="number" class="price-input" /></td>
                  <td><q-input v-model.number="item.precio_bueno" dense outlined prefix="$" type="number" class="price-input" /></td>
                  <td><q-input v-model.number="item.precio_excelente" dense outlined prefix="$" type="number" class="price-input" /></td>
                  <td class="bg-blue-0"><q-input v-model.number="item.precio_compra" dense outlined prefix="$" type="number" class="price-input purchase-style" /></td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { api } from 'boot/axios'
  import { useQuasar } from 'quasar'

  const $q = useQuasar()
  const gramos = ref([])
  const monedas = ref([])
  const centenarioCompra = ref(0)

  // Carga de datos desde Backend
  const loadData = async () => {
    $q.loading.show({ message: 'Obteniendo cotizaciones actualizadas...' })
    try {
      const res = await api.get('/api/config/cotizacionoro')
      gramos.value = res.data.gramos

      // Separamos el centenario especial de la lista general
      monedas.value = res.data.monedas.filter(m => m.descripcion !== 'CENTENARIO')
      const centenario = res.data.monedas.find(m => m.descripcion === 'CENTENARIO')
      if (centenario) centenarioCompra.value = centenario.precio_compra
    } finally {
      $q.loading.hide()
    }
  }

  // Guardado Masivo (F6)
  const saveCotizaciones = async () => {
    $q.loading.show({ message: 'Sincronizando precios en servidor...' })
    try {
      // Reconstruimos la lista de monedas incluyendo el centenario especial
      const listaMonedas = [...monedas.value, {
        categoria: 'MONEDAS',
        descripcion: 'CENTENARIO',
        precio_nuevo: 0, precio_bueno: 0, precio_excelente: 0,
        precio_compra: centenarioCompra.value
      }]

      await api.post('/api/config/cotizacionoro/bulk-update', {
        gramos: gramos.value,
        monedas: listaMonedas
      })

      $q.notify({
        type: 'positive',
        message: 'PARÁMETROS ACTUALIZADOS CORRECTAMENTE',
        position: 'top',
        icon: 'verified'
      })
    } finally {
      $q.loading.hide()
    }
  }

  // Manejo de Hotkeys (F6/F9)
  const handleKeydown = (e) => {
    if (e.key === 'F6') { e.preventDefault(); saveCotizaciones(); }
  }

  onMounted(() => {
    loadData()
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
</script>

<style lang="scss" scoped>
    .sicae-quotation-table {
    border-collapse: separate;
    border-spacing: 0 8px;
    background: transparent;

    th { font-size: 0.85rem; letter-spacing: 1px; padding: 16px; }
    td { padding: 8px 24px !important; }
    }

    .price-input {
    width: 140px;
    margin: 0 auto;
    :deep(.q-field__control) {
        background: white;
        border-radius: 8px;
        transition: all 0.3s;
        &:hover { border-color: var(--q-primary); }
    }
    }

    .purchase-style :deep(.q-field__control) {
    background: #f0f9ff;
    border-color: #bae6fd;
    }

    .centenario-input {
    width: 250px;
    :deep(.q-field__control) {
        border-radius: 12px;
        border: 2px solid #eab308;
    }
    }

    .bg-blue-1 { background-color: #e0f2fe; }
    .bg-blue-0 { background-color: #f8fafc; }
    .border-bottom { border-bottom: 1px solid #e2e8f0; }
    .tracking-widest { letter-spacing: 0.1em; }
</style>
