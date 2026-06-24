<template>
  <q-dialog v-model="mostrar" persistent>
    <q-card style="width: 800px; max-width: 95vw;" class="shadow-24">

      <!-- ENCABEZADO -->
      <q-card-section class="bg-primary text-white row items-center q-pb-sm">
        <div class="text-h6 text-weight-bolder uppercase text-orange-4">
          <q-icon name="devices" size="sm" class="q-mr-sm text-white" />
          Búsqueda y Captura de Electrónicos
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!-- ZONA DE BÚSQUEDA -->
      <q-card-section class="q-pa-md bg-grey-2">
        <div class="row q-col-gutter-sm items-center">
          <div class="col-12 col-md-8">
            <q-input
              v-model="criterioBusqueda"
              label="Buscar por Código o Descripción..."
              outlined dense bg-color="white"
              autofocus
              clearable
              @keyup.enter="buscarArticulos"
            >
              <template v-slot:append>
                <q-btn round dense flat icon="search" @click="buscarArticulos" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4 text-right text-caption text-grey-7">
            Presione ENTER para buscar
          </div>
        </div>
      </q-card-section>

      <!-- TABLA DE RESULTADOS DE INVENTARIO -->
      <q-card-section class="q-pa-none">
        <q-table
          :rows="resultados"
          :columns="columnas"
          row-key="codigo"
          dense flat bordered
          :loading="cargando"
          class="tabla-resultados"
          style="height: 300px"
          virtual-scroll
          :pagination="{ rowsPerPage: 0 }"
          hide-bottom
        >
          <template v-slot:body="props">
            <tr
              :class="{'bg-blue-1': articuloSeleccionado?.codigo === props.row.codigo}"
              class="cursor-pointer"
              @click="seleccionarArticulo(props.row)"
              @dblclick="seleccionarYEnfocarCantidad(props.row)"
            >
              <td class="text-center font-mono text-weight-bold">{{ props.row.codigo }}</td>
              <td class="text-left text-weight-bold">{{ props.row.descripcion }}</td>
              <td class="text-left">{{ props.row.clasificacion_nombre }}</td>
              <td class="text-right text-primary font-mono text-weight-bold">$ {{ formatMoney(props.row.precio) }}</td>
              <td class="text-center">
                <q-badge :color="props.row.existencia > 0 ? 'positive' : 'negative'">
                  {{ props.row.existencia }}
                </q-badge>
              </td>
            </tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey-6 q-pa-md">
              <q-icon size="2em" name="sentiment_dissatisfied" class="q-mr-sm" />
              <span>No se encontraron artículos con ese criterio.</span>
            </div>
          </template>
        </q-table>
      </q-card-section>

      <q-separator />

      <!-- ZONA DE CONFIRMACIÓN (Se activa al seleccionar un renglón) -->
      <q-card-section class="bg-grey-1 q-pa-md" v-if="articuloSeleccionado">
        <div class="row items-center justify-between no-wrap q-col-gutter-md">
          <div class="col-8 text-subtitle2 text-weight-bold text-primary text-uppercase ellipsis">
            {{ articuloSeleccionado.descripcion }}
          </div>

          <div class="col-4 row items-center justify-end no-wrap">
            <span class="text-weight-bold q-mr-sm">Cantidad:</span>
            <q-input
              ref="inputCantidad"
              v-model.number="cantidadVender"
              type="number" outlined dense bg-color="white"
              input-class="text-center text-weight-bolder text-h6"
              style="width: 100px"
              @keyup.enter="confirmarAgregado"
              @focus="$event.target.select()"
            />
          </div>
        </div>
      </q-card-section>

      <!-- BOTONERA -->
      <q-card-actions align="between" class="bg-blue-grey-1 q-pa-md border-top">
        <q-btn flat label="Cancelar" color="red-9" class="text-weight-bold" v-close-popup />
        <q-btn
          unelevated label="Agregar a Venta" color="positive" icon="add_shopping_cart"
          class="q-px-xl text-weight-bold shadow-2"
          :disable="!articuloSeleccionado"
          @click="confirmarAgregado"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// --- PROPIEDADES Y EVENTOS ---
const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue', 'articulo-agregado'])

const mostrar = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// --- ESTADO DEL COMPONENTE ---
const criterioBusqueda = ref('')
const cargando = ref(false)
const resultados = ref([])
const articuloSeleccionado = ref(null)
const cantidadVender = ref(1)
const inputCantidad = ref(null) // Referencia para auto-enfocar el input

// Configuración de la tabla
const columnas = [
  { name: 'codigo', label: 'CÓDIGO', align: 'center', field: 'codigo' },
  { name: 'descripcion', label: 'DESCRIPCIÓN', align: 'left', field: 'descripcion' },
  { name: 'clasificacion', label: 'CLASIFICACIÓN', align: 'left', field: 'clasificacion_nombre' },
  { name: 'precio', label: 'PRECIO', align: 'right', field: 'precio' },
  { name: 'existencia', label: 'EXIST.', align: 'center', field: 'existencia' }
]

const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// --- FUNCIONES ---

// Limpiar el estado al abrir la ventana
watch(mostrar, (nuevoValor) => {
  if (nuevoValor) {
    criterioBusqueda.value = ''
    resultados.value = []
    articuloSeleccionado.value = null
    cantidadVender.value = 1
  }
})

// Simulación de búsqueda en el Backend (Laravel)
const buscarArticulos = async () => {
  if (!criterioBusqueda.value.trim()) return

  cargando.value = true
  articuloSeleccionado.value = null

  // Aquí irá tu llamada a Axios (ej. api.get(`/api/inventario-electronicos/buscar?q=${criterioBusqueda.value}`))
  // Por ahora, usamos un setTimeout para simular la carga y devolver datos de prueba
  setTimeout(() => {
    resultados.value = [
      {
        codigo: '10045',
        descripcion: 'LAPTOP HP CORE I5 8GB RAM 256GB SSD',
        clasificacion_nombre: 'COMPUTO',
        subclasificacion_nombre: 'LAPTOP',
        precio: 3500.00,
        existencia: 2
      },
      {
        codigo: '10046',
        descripcion: 'CONSOLA XBOX ONE S 500GB',
        clasificacion_nombre: 'VIDEOJUEGOS',
        subclasificacion_nombre: 'CONSOLAS',
        precio: 2800.00,
        existencia: 1
      }
    ]
    cargando.value = false
  }, 500)
}

const seleccionarArticulo = (articulo) => {
  articuloSeleccionado.value = articulo
  cantidadVender.value = 1
}

const seleccionarYEnfocarCantidad = (articulo) => {
  seleccionarArticulo(articulo)
  // Pequeño retardo para asegurar que el input se renderizó antes de enfocarlo
  setTimeout(() => {
    if (inputCantidad.value) {
      inputCantidad.value.focus()
    }
  }, 100)
}

const confirmarAgregado = () => {
  if (!articuloSeleccionado.value) return

  if (cantidadVender.value <= 0) {
    $q.notify({ type: 'negative', message: 'La cantidad debe ser mayor a cero' })
    return
  }

  if (cantidadVender.value > articuloSeleccionado.value.existencia) {
    $q.notify({ type: 'warning', message: 'La cantidad supera la existencia en inventario' })
    return
  }

  // Enviamos los datos al componente padre
  emit('articulo-agregado', {
    cantidad: cantidadVender.value,
    codigo: articuloSeleccionado.value.codigo,
    descripcion: articuloSeleccionado.value.descripcion,
    precio: articuloSeleccionado.value.precio,
    clasificacion_nombre: articuloSeleccionado.value.clasificacion_nombre,
    subclasificacion_nombre: articuloSeleccionado.value.subclasificacion_nombre
  })

  // Cerramos el modal
  mostrar.value = false
}
</script>

<style scoped>
  .border-top { border-top: 1px solid #cbd5e1; }
  .font-mono { font-family: 'JetBrains Mono', monospace; }

  .tabla-resultados :deep(thead th) {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: #f1f5f9;
  }
</style>
