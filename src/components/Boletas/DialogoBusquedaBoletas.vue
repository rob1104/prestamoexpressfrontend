<template>
  <q-dialog v-model="show" persistent>
    <q-card style="width: 850px; max-width: 95vw;" class="shadow-24">
      <q-card-section class="bg-primary text-white row items-center q-pb-none">
        <div class="column">
          <div class="text-h6 text-weight-bolder uppercase">
            Buscador de Boletas - {{ tipoPrestamo }}
          </div>
          <div class="text-caption">Escriba el nombre del cliente y presione ENTER. (Doble clic para seleccionar)</div>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md bg-grey-2">
        <q-input
          autofocus
          v-model="searchQuery"
          outlined dense
          bg-color="white"
          @keyup.enter="ejecutarBusqueda"
        >
          <template v-slot:append>
            <q-btn round dense flat icon="search" color="primary" @click="ejecutarBusqueda" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-table
          :rows="resultados"
          :columns="columns"
          row-key="id"
          flat bordered dense
          :loading="cargando"
          :pagination="{ rowsPerPage: 10 }"
          class="tabla-buscador"
          no-data-label="No se encontraron boletas para este cliente."
          @row-dblclick="seleccionarBoleta"
        >
          <template v-slot:body-cell-estatus="props">
            <q-td :props="props" class="text-center">
              <q-badge :color="props.value === 'PE' ? 'orange-9' : 'green-9'" class="text-weight-bold">
                {{ props.value === 'PE' ? 'PENDIENTE' : 'LIQUIDADA' }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-prestamo="props">
            <q-td :props="props" class="text-right text-weight-bold text-primary font-mono">
              $ {{ formatMoney(props.value) }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-card-actions align="right" class="bg-blue-grey-1 q-pa-sm border-top">
        <div class="text-caption text-grey-6 italic q-mr-md">Doble clic sobre una fila para enviarla a caja</div>
        <q-btn flat label="Cerrar" color="grey-8" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'
  import { date, useQuasar } from 'quasar'
  import { api } from 'boot/axios'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    tipoPrestamo: { type: String, required: true } // 'tradicional' o 'pagos'
  })

  const emit = defineEmits(['update:modelValue', 'boleta-seleccionada'])
  const $q = useQuasar()

  const searchQuery = ref('')
  const resultados = ref([])
  const cargando = ref(false)

  // Sincronizar el v-model del dialog con el padre
  const show = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // Limpiar búsqueda al abrir
  watch(show, (newVal) => {
    if (newVal) {
      searchQuery.value = ''
      resultados.value = []
    }
  })

  const columns = [
    { name: 'id', label: 'Folio', align: 'left', field: 'id', sortable: true },
    { name: 'cliente', label: 'Cliente', align: 'left', field: row => `${row.cliente?.nombre} ${row.cliente?.apellido_paterno || ''}`, sortable: true },
    { name: 'fecha_boleta', label: 'Fecha Alta', align: 'center', field: 'fecha_boleta', format: val => formatFecha(val), sortable: true },
    { name: 'prestamo', label: 'Préstamo', align: 'right', field: 'prestamo', sortable: true },
    { name: 'estatus', label: 'Estatus', align: 'center', field: 'estatus', sortable: true }
  ]

  const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })
  const formatFecha = (val) => date.formatDate(val, 'DD-MMM-YYYY').toUpperCase()

  // Buscar en el backend aprovechando el método index() de tu BoletaController
  const ejecutarBusqueda = async () => {
    if (!searchQuery.value.trim()) return

    cargando.value = true
    try {
      // Pasamos 'search' y el arreglo 'tipos[]' para filtrar
      const res = await api.get('/api/boletas', {
        params: {
          search: searchQuery.value,
          'tipos[]': props.tipoPrestamo,
          rowsPerPage: 50
        }
      })
      resultados.value = res.data.data // Asumiendo que es una paginación de Laravel
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al buscar clientes.' })
    } finally {
      cargando.value = false
    }
  }

  // Al dar doble clic en una fila
  const seleccionarBoleta = (evt, row) => {
    if (row.estatus === 'LI') {
      $q.notify({ type: 'warning', message: 'Esta boleta ya está liquidada.' })
      // Opcional: Podrías permitir que la abran igual si solo quieren verla
    }
    emit('boleta-seleccionada', row.id)
    show.value = false
  }
</script>

<style scoped>
  .tabla-buscador thead tr th { background-color: #f1f5f9; font-weight: 800; }
  .font-mono { font-family: 'JetBrains Mono', monospace; }
  .border-top { border-top: 1px solid #cbd5e1; }
</style>
