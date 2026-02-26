<template>
  <q-card flat bordered class="header-compact-card shadow-1">
    <q-card-section class="bg-blue-grey-1 text-blue-grey-10 q-py-xs border-bottom">
      <div class="row items-center">
        <q-icon name="person" size="xs" class="q-mr-xs text-primary" />
        <div class="text-caption text-weight-bolder uppercase tracking-tight">Datos Generales del Empeño</div>
      </div>
    </q-card-section>

    <q-card-section class="q-pa-sm">
      <div class="row q-col-gutter-sm">

        <div class="col-12 col-md-3 q-gutter-y-xs">
          <div class="row items-center no-wrap">
            <div class="label-fixed text-caption text-weight-bold">FECHA:</div>
            <q-input
              v-model="modelValue.fecha_boleta"
              outlined dense readonly
              bg-color="grey-1"
              class="col input-premium-compact"
              input-class="text-weight-bold"
            />
          </div>
          <div class="row items-center no-wrap">
            <div class="label-fixed text-caption text-weight-bold">ID CLIENTE:</div>
            <q-input
              autofocus
              v-model.number="modelValue.cliente_id"
              outlined dense readonly
              bg-color="grey-2"
              class="col input-premium-compact"
              input-class="text-weight-bold text-primary"
            />
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="row q-col-gutter-xs">
            <div class="col-12">
              <q-select
                autofocus
                ref="selectClienteRef"
                v-model="selectedCliente"
                label="Nombre del Cliente (ENTER p/Búsqueda)"
                outlined dense use-input hide-selected fill-input
                :options="clientesOptions"
                @filter="filterClientes"
                @input-value="val => searchInput = val"
                @keyup.enter.stop.prevent="abrirBusquedaAvanzada"
                @update:model-value="onClienteSelect"
                class="input-premium-search"
              >
                <template v-slot:prepend><q-icon name="search" size="xs" /></template>
              </q-select>
            </div>

            <div class="col-12">
              <q-input
                v-model="identificacionDisplay"
                label="Identificación / Documentos:"
                outlined dense readonly
                bg-color="blue-grey-1"
                class="input-premium-compact"
                input-class="text-caption italic"
              />
            </div>

            <div class="col-6">
              <q-input
                v-model.number="modelValue.no_bolsa"
                label="No. de Bolsa"
                outlined dense type="number"
                class="input-premium-compact"
                input-class="text-weight-bold text-orange-9"
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="modelValue.categoria_id"
                label="Categoría"
                :options="categoriasOptions"
                option-label="label"
                option-value="id"
                map-options emit-value
                outlined dense
                class="input-premium-compact"
              />
            </div>
          </div>
        </div>

        <div class="col-12 col-md-3 bg-blue-grey-1 rounded-borders border-subtle">
          <slot name="plan-info"></slot>
        </div>

      </div>
    </q-card-section>



    <q-dialog v-model="showSearchDialog" @show="onDialogShow" persistent>
      <q-card style="width: 700px; max-width: 95vw; border-radius: 4px;">
        <q-card-section class="bg-primary text-white q-py-xs">
          <div class="text-caption text-weight-bolder uppercase">Localizador de Clientes - SICAE Modern</div>
        </q-card-section>

        <q-card-section class="q-pa-sm">
          <q-input
            ref="dialogInputRef"
            v-model="dialogSearchInput"
            label="Escriba el nombre para buscar..."
            outlined dense clearable autofocus
            @update:model-value="ejecutarBusquedaFiltrada"
            @keydown.down.prevent="navigateDown"
            @keydown.up.prevent="navigateUp"
            @keydown.enter.prevent="confirmarSeleccion"
          />
        </q-card-section>

        <q-card-section class="q-pa-none" style="max-height: 350px; overflow-y: auto">
          <q-list separator dense>
            <q-item
              v-for="(c, index) in dialogResults"
              :key="c.id"
              clickable v-ripple
              :active="index === activeIndex"
              active-class="bg-blue-1 text-primary text-weight-bold"
              @click="seleccionarDesdeDialogo(c)"
              @mouseenter="activeIndex = index"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="xs">{{ c.id }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption text-weight-bold">{{ c.nombre }}</q-item-label>
                <q-item-label caption class="text-uppercase" style="font-size: 10px">{{ c.identificacion }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-2 q-pa-xs">
          <div class="text-caption text-grey-7 q-mr-md" style="font-size: 10px">↑ ↓ Navegar • ENTER Seleccionar • ESC Cerrar</div>
          <q-btn flat label="Cerrar" color="grey-9" v-close-popup dense size="sm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
  <q-dialog v-model="showClienteForm" persistent>
  <ClienteForm
    :is-edit="false"
    :initial-data="nuevoClienteData"
    @save="guardarNuevoCliente"
  />
</q-dialog>
</template>

<script setup>
  import { ref, computed, nextTick } from 'vue'
  import { useQuasar } from 'quasar'
  import { api } from 'boot/axios'
  import ClienteForm from '../Clientes/ClienteForm.vue'

  const props = defineProps({ modelValue: { type: Object, required: true } })
  const emit = defineEmits(['update:modelValue', 'cliente-cambiado'])

  const searchInput = ref('')
  const dialogSearchInput = ref('')
  const selectedCliente = ref(null)
  const clientesOptions = ref([])
  const showSearchDialog = ref(false)
  const dialogResults = ref([])
  const activeIndex = ref(0)
  const dialogInputRef = ref(null)

  const showClienteForm = ref(false)
  const nuevoClienteData = ref({})

  const $q = useQuasar()


  const abrirFormularioNuevo = () => {
    // Pre-llenamos el nombre con lo que el usuario ya escribió en el buscador
    nuevoClienteData.value = {
      nombre: searchInput.value || dialogSearchInput.value,
      clasificacion: 'NUEVO'
    }
    showSearchDialog.value = false // Cerramos el buscador si estaba abierto
    showClienteForm.value = true
  }

  const guardarNuevoCliente = async (datos) => {
    $q.loading.show({ message: 'Registrando cliente...' })
    try {
      const res = await api.post('/api/clientes', datos)
      const clienteGuardado = res.data.cliente

      // Lo seleccionamos automáticamente en la boleta
      onClienteSelect({
        label: clienteGuardado.nombre,
        value: clienteGuardado.id,
        identificacion: clienteGuardado.identificacion,
        ...clienteGuardado
      })

      showClienteForm.value = false
      $q.notify({ type: 'positive', message: 'Cliente registrado y seleccionado.' })
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al registrar: ' + (e.response?.data?.message || e.message) })
    } finally {
      $q.loading.hide()
    }
  }

  const categoriasOptions = [
    { id: 1, label: '01: ORO' }, { id: 2, label: '02: BRILLANTES' },
    { id: 3, label: '03: RELOJES FINOS' }, { id: 4, label: '04: AUTOS Y MOTOS' },
    { id: 5, label: '05: APARATOS ELECTRÓNICOS' }, { id: 6, label: '06: VARIOS' },
    { id: 7, label: '07: PLATA' },
  ]

  const identificacionDisplay = computed(() => {
    return selectedCliente.value?.identificacion || '--- SELECCIONE CLIENTE ---'
  })

  //
const abrirBusquedaAvanzada = async () => {
  const textoActual = searchInput.value?.trim().toUpperCase()

  // 1. Validación mínima de caracteres
  if (!textoActual || textoActual.length < 2) {
    $q.notify({ message: 'Escriba al menos 2 letras para buscar', color: 'grey-8', position: 'top' })
    return
  }

  // 2. Si ya hay un cliente seleccionado y el nombre coincide exacto, no re-buscamos
  const nombreSeleccionado = (selectedCliente.value?.label || '').trim().toUpperCase()
    if (selectedCliente.value && textoActual === nombreSeleccionado) return

    // 3. Consultamos primero a la API antes de mostrar nada
    $q.loading.show({ message: 'Buscando coincidencias...', delay: 100 })

    try {
      const res = await api.get(`/api/clientes/search?search=${textoActual}`)
      dialogResults.value = res.data

      // 4. EL CAMBIO CLAVE: Solo abrir si hay resultados
      if (dialogResults.value.length > 0) {
        dialogSearchInput.value = textoActual
        activeIndex.value = 0
        showSearchDialog.value = true
      } else {
        // Si no hay nada, notificamos y dejamos el foco en el input
        $q.notify({
          message: `No se encontraron clientes que coincidan con "${textoActual}"`,
          color: 'info',
          position: 'center',
          icon: 'person_search',
          actions: [{ label: 'REGISTRAR NUEVO', color: 'white', handler: () => abrirFormularioNuevo() }]
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      $q.loading.hide()
    }
  }

  const ejecutarBusquedaFiltrada = async (val) => {
    if (!val || val.length < 2) { dialogResults.value = []; return; }
    try {
      const res = await api.get(`/api/clientes/search?search=${val}`)
      dialogResults.value = res.data
      activeIndex.value = 0
    } catch (e) { console.error(e) }
  }

  const navigateDown = () => { if (activeIndex.value < dialogResults.value.length - 1) activeIndex.value++ }
  const navigateUp = () => { if (activeIndex.value > 0) activeIndex.value-- }
  const confirmarSeleccion = () => { if (dialogResults.value[activeIndex.value]) seleccionarDesdeDialogo(dialogResults.value[activeIndex.value]) }

  const seleccionarDesdeDialogo = (cliente) => {
    onClienteSelect({ label: cliente.nombre, value: cliente.id, identificacion: cliente.identificacion, ...cliente })
    showSearchDialog.value = false
  }

  const onClienteSelect = (cliente) => {
    selectedCliente.value = cliente
    const newValue = { ...props.modelValue, cliente_id: cliente?.value || null }
    emit('update:modelValue', newValue)
    emit('cliente-cambiado', cliente)
  }

  const onDialogShow = () => { nextTick(() => { if (dialogInputRef.value) dialogInputRef.value.focus() }) }

  const filterClientes = async (val, update) => {
    searchInput.value = val
    if (val.length < 2) { update(() => { clientesOptions.value = [] }); return; }
    try {
      const res = await api.get(`/api/clientes/search?search=${val}`)
      update(() => {
        clientesOptions.value = res.data.map(c => ({ label: c.nombre, value: c.id, identificacion: c.identificacion, ...c }))
      })
    } catch (e) { console.error(e) }
  }
</script>

<style lang="scss" scoped>
  .header-compact-card {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
  }

  .border-bottom { border-bottom: 1px solid #cbd5e1; }
  .border-subtle { border-left: 1px solid #cbd5e1; background-color: #f1f5f9; }

  /* Corregir alineación de etiquetas de texto fijo */
  .label-fixed {
    width: 65px;
    font-size: 10px;
    color: #475569;
    display: flex;
    align-items: center;
    height: 28px; /* Debe coincidir con la altura del input */
  }

  /* INPUTS COMPACTOS (Fecha, ID, Bolsa, Categoría) */
  .input-premium-compact {
    :deep(.q-field__control) {
      min-height: 28px !important;
      display: flex;
      align-items: center; // Centra verticalmente el contenido
    }
    :deep(.q-field__native), :deep(.q-field__input) {
      min-height: 28px !important;
      line-height: 28px !important; // Fuerza el texto al centro
      padding: 0 4px !important;
    }
    :deep(.q-field__label) {
      top: 6px; // Ajusta la etiqueta flotante
      font-size: 11px;
    }
  }

  /* INPUT DE BÚSQUEDA (Nombre del Cliente) */


  .tracking-tight { letter-spacing: -0.02em; }
</style>
