<template>
  <q-card flat bordered class="shadow-2 rounded-borders">
    <q-card-section class="q-pa-md">
      <div class="row q-col-gutter-md items-start">

        <div class="col-12 col-md-3">
          <div class="row q-col-gutter-sm">
            <q-input
              v-model="modelValue.fecha_boleta"
              label="Fecha de la Boleta:"
              outlined
              dense
              readonly
              bg-color="grey-1"
              class="col-12"
            />
            <q-input
              v-model.number="modelValue.cliente_id"
              label="No. Cliente:"
              outlined
              dense
              readonly
              bg-color="grey-2"
              class="col-12"
            />
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="row q-col-gutter-sm">

            <q-select
              autofocus
              ref="selectClienteRef"
              v-model="selectedCliente"
              label="Nombre del Cliente (ENTER para búsqueda avanzada)"
              outlined
              dense
              use-input
              hide-selected
              fill-input
              :options="clientesOptions"
              @filter="filterClientes"
              @input-value="val => searchInput = val"
              @keyup.enter.stop.prevent="abrirBusquedaAvanzada"
              @update:model-value="onClienteSelect"
              class="col-12"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Presione ENTER para búsqueda avanzada de "{{ searchInput }}"
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              v-model="identificacionDisplay"
              label="Identificación:"
              outlined
              dense
              readonly
              bg-color="grey-1"
              class="col-12"
            />

            <div class="col-6">
              <q-input
                v-model.number="modelValue.no_bolsa"
                label="Número de Bolsa:"
                outlined
                dense
                type="number"
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="modelValue.categoria_id"
                label="Categoría:"
                :options="categoriasOptions"
                option-label="label"
                option-value="id"
                map-options
                emit-value
                outlined
                dense
              />
            </div>
          </div>
        </div>

        <div class="col-12 col-md-3 bg-blue-grey-1 q-pa-sm rounded-borders border-dashed min-height-plan">
          <slot name="plan-info">
            </slot>
        </div>

      </div>
    </q-card-section>

    <q-dialog v-model="showSearchDialog" @show="onDialogShow" persistent>
      <q-card style="width: 700px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="bg-primary text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bold uppercase tracking-widest">Búsqueda Avanzada de Clientes</div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-input
            ref="dialogInputRef"
            v-model="dialogSearchInput"
            label="Nombre del cliente..."
            outlined
            clearable
            autofocus
            @update:model-value="ejecutarBusquedaFiltrada"
            @keydown.down.prevent="navigateDown"
            @keydown.up.prevent="navigateUp"
            @keydown.enter.prevent="confirmarSeleccion"
          >
            <template v-slot:prepend>
              <q-icon name="person_search" color="primary" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-section class="q-pa-none" style="max-height: 400px; overflow-y: auto">
          <q-list separator>
            <q-item
              v-for="(c, index) in dialogResults"
              :key="c.id"
              clickable
              v-ripple
              :active="index === activeIndex"
              active-class="bg-blue-1 text-primary text-weight-bold"
              @click="seleccionarDesdeDialogo(c)"
              @mouseenter="activeIndex = index"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="sm">{{ c.id }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ c.nombre }}</q-item-label>
                <q-item-label caption class="text-uppercase">{{ c.identificacion }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="index === activeIndex">
                <q-icon name="keyboard_return" color="primary" />
              </q-item-section>
            </q-item>
          </q-list>

          <div v-if="dialogResults.length === 0" class="q-pa-xl text-center text-grey-6">
            No se encontraron coincidencias para "{{ dialogSearchInput }}"
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="bg-grey-1 q-pa-sm">
          <div class="text-caption text-grey-7 q-mr-md">↑ ↓ Navegar • ENTER Seleccionar • ESC Cerrar</div>
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
  import { ref, computed, nextTick } from 'vue'
  import { api } from 'boot/axios'
  import { useQuasar } from 'quasar'

  const $q = useQuasar()
  const props = defineProps({ modelValue: { type: Object, required: true } })
  const emit = defineEmits(['update:modelValue', 'cliente-cambiado'])

  // Estado de Búsqueda
  const searchInput = ref('')
  const dialogSearchInput = ref('')
  const selectedCliente = ref(null)
  const clientesOptions = ref([])

  // Estado del Diálogo
  const showSearchDialog = ref(false)
  const dialogResults = ref([])
  const activeIndex = ref(0)
  const dialogInputRef = ref(null)

  const categoriasOptions = [
    { id: 1, label: '01: ORO' },
    { id: 2, label: '02: BRILLANTES' },
    { id: 3, label: '03: RELOJES FINOS' },
    { id: 4, label: '04: AUTOS Y MOTOS' },
    { id: 5, label: '05: APARATOS ELECTRÓNICOS' },
    { id: 6, label: '06: VARIOS' },
    { id: 7, label: '07: PLATA' },
  ]

  // Formateo de identificación para el header
  const identificacionDisplay = computed(() => {
    return selectedCliente.value?.identificacion || 'SIN CLIENTE SELECCIONADO'
  })

  // 1. Abrir diálogo trasladando lo escrito [Evita bucle infinito]
  const abrirBusquedaAvanzada = async () => {
    const textoActual = searchInput.value?.trim().toUpperCase()
    const nombreSeleccionado = (selectedCliente.value?.label || '').trim().toUpperCase()

    // Si el nombre escrito ya coincide con el seleccionado, no abrir modal
    if (selectedCliente.value && textoActual === nombreSeleccionado) return


    dialogSearchInput.value = searchInput.value
    await ejecutarBusquedaFiltrada(dialogSearchInput.value)
    showSearchDialog.value = true
  }

  // 2. Búsqueda reactiva en el modal
  const ejecutarBusquedaFiltrada = async (val) => {
    if (!val || val.length < 2) {
      dialogResults.value = []
      return
    }
    try {
      const res = await api.get(`/api/clientes/search?search=${val}`)
      dialogResults.value = res.data
      activeIndex.value = 0
    } catch (e) { console.error(e) }
  }

  // 3. Navegación por teclado
  const navigateDown = () => {
    if (activeIndex.value < dialogResults.value.length - 1) activeIndex.value++
  }
  const navigateUp = () => {
    if (activeIndex.value > 0) activeIndex.value--
  }
  const confirmarSeleccion = () => {
    if (dialogResults.value[activeIndex.value]) {
      seleccionarDesdeDialogo(dialogResults.value[activeIndex.value])
    }
  }

  const seleccionarDesdeDialogo = (cliente) => {
    onClienteSelect({
      label: cliente.nombre,
      value: cliente.id,
      identificacion: cliente.identificacion,
      ...cliente
    })
    showSearchDialog.value = false
  }

  const onClienteSelect = (cliente) => {
    selectedCliente.value = cliente
    const newValue = { ...props.modelValue, cliente_id: cliente?.value || null }
    emit('update:modelValue', newValue)
    emit('cliente-cambiado', cliente)
  }

  const onDialogShow = () => {
    nextTick(() => {
      if (dialogInputRef.value) dialogInputRef.value.focus()
    })
  }

  const filterClientes = async (val, update) => {
    searchInput.value = val
    if (val.length < 2) {
      update(() => { clientesOptions.value = [] })
      return
    }
    try {
      const res = await api.get(`/api/clientes/search?search=${val}`)
      update(() => {
        clientesOptions.value = res.data.map(c => ({
          label: c.nombre,
          value: c.id,
          identificacion: c.identificacion,
          ...c
        }))
      })
    } catch (e) { console.error(e) }
  }
</script>

<style scoped>
    .border-dashed { border: 2px dashed #b0bec5; }
    .min-height-plan { min-height: 120px; display: flex; flex-direction: column; justify-content: center; }
    .bg-blue-1 { background: #e3f2fd; }
    .tracking-widest { letter-spacing: 0.1em; }
</style>
