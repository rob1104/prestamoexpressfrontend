<template>
  <q-page class="page-container">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="title-main">
          Gestión de Clientes
        </div>
        <div class="title-sub">
          Directorio centralizado de clientes y su información de contacto
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Nuevo Cliente"
          rounded
          class="q-px-lg btn-premium"
          @click="openForm()"
        />
      </div>
    </div>

    <q-card class="card-premium">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        v-model:pagination="pagination"
        class="table-premium"
      >

        <template v-slot:top>
          <div class="row full-width items-center q-gutter-md q-pa-sm">
            <q-space />
            <q-input
              outlined
              dense
              debounce="300"
              v-model="filter"
              placeholder="Buscar por nombre, INE o teléfono..."
              class="bg-white shadow-1"
              style="width: 500px; border-radius: 10px;"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
        </template>

        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar color="primary" text-color="white" size="32px" class="q-mr-md shadow-2">
                {{ props.row.nombre.charAt(0) }}
              </q-avatar>
              <div>
                <div class="text-weight-bolder text-dark">{{ props.row.nombre }} {{ props.row.apellido_paterno }} {{ props.row.apellido_materno }}</div>
                <div class="text-caption text-grey-6 text-uppercase" style="font-size: 0.65rem;">
                  <q-icon name="work" size="10px" /> {{ props.row.ocupacion || 'SIN OCUPACIÓN' }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-identificacion="props">
          <q-td :props="props">
            <div class="column">
              <div class="row items-center">
                <q-icon name="fingerprint" color="primary" class="q-mr-xs" size="xs" />
                <span class="text-weight-medium font-mono">{{ props.row.identificacion }}</span>
              </div>
              <div class="text-caption text-purple-5 text-bold" style="font-size: 12px;">No: {{ props.row.id }}</div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-clasificacion="props">
          <q-td :props="props" class="text-center">
            <q-badge
              :color="getClasifColor(props.value)"
              class="q-px-md q-py-xs text-weight-bolder shadow-2"
              style="border-radius: 6px; letter-spacing: 0.5px; font-size: 0.7rem;"
            >
              <q-icon
                :name="props.value === 'EXCELENTE' ? 'verified' : (props.value === 'MALO' ? 'warning' : 'fiber_manual_record')"
                size="12px"
                class="q-mr-xs"
              />
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-contacto="props">
          <q-td :props="props">
            <div class="column q-gutter-xs">
              <div class="row items-center text-blue-grey-8">
                <q-icon name="smartphone" size="14px" class="q-mr-xs" />
                {{ formatPhone(props.row.telefono1) }}
              </div>
              <div v-if="props.row.telefono2" class="row items-center text-grey-6" style="font-size: 0.75rem;">
                <q-icon name="phone" size="14px" class="q-mr-xs" />
                {{ formatPhone(props.row.telefono2) }}
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-ubicacion="props">
          <q-td :props="props">
            <div class="column">
              <div class="row items-center text-weight-medium">
                <q-icon name="place" color="negative" size="xs" class="q-mr-xs" />
                {{ props.row.municipio }}
              </div>
              <div class="text-caption text-grey-6 q-ml-sm">{{ props.row.estado }}</div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="row q-gutter-x-sm justify-center no-wrap">
              <q-btn
                flat
                round
                color="blue-8"
                icon="edit"
                size="sm"
                class="action-btn shadow-1"
                @click="openForm(props.row)"
              >
                <q-tooltip
                  anchor="top middle"
                  self="bottom middle"
                  class="bg-blue-8 text-white shadow-4"
                >
                  Editar Expediente
                </q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                class="action-btn shadow-1"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip
                  anchor="top middle"
                  self="bottom middle"
                  class="bg-negative text-white shadow-4"
                >
                  Eliminar Cliente
                </q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

      </q-table>
    </q-card>

    <q-dialog v-model="formDialog" persistent backdrop-filter="blur(4px)">
      <cliente-form
        :initial-data="selectedCliente"
        :is-edit="isEdit"
        @save="handleSave"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { api } from 'boot/axios'
  import { useQuasar } from 'quasar'
  import { useAuthStore } from 'stores/auth'
  import ClienteForm from 'src/components/Clientes/ClienteForm.vue'

  const $q = useQuasar()
  const rows = ref([])
  const loading = ref(false)
  const filter = ref('')
  const formDialog = ref(false)
  const isEdit = ref(false)
  const selectedCliente = ref(null)
  const authStore = useAuthStore()

  // Configuración Global de 50 filas
  const pagination = ref({
    sortBy: 'created_at',
    descending: true,
    page: 1,
    rowsPerPage: 50
  })


 const columns = [
  { name: 'nombre', align: 'left', label: 'CLIENTE / OCUPACION', field: 'nombre', sortable: true },
  { name: 'identificacion', align: 'left', label: 'IDENTIFICACIÓN', field: 'identificacion', sortable: true },
  { name: 'clasificacion', align: 'center', label: 'ESTATUS DE RIESGO', field: 'clasificacion', sortable: true },
  { name: 'contacto', align: 'left', label: 'TELÉFONOS', field: 'telefono1' },
  { name: 'ubicacion', align: 'left', label: 'LOCALIZACIÓN', field: 'municipio' },
  { name: 'actions', align: 'center', label: 'ACCIONES' }
]

  const getClasifColor = (val) => {
    const map = {
      'EXCELENTE': 'positive',
      'BUENO': 'indigo-6',
      'NUEVO': 'blue-grey-6',
      'REGULAR': 'orange-8',
      'MALO': 'negative'
    }
    return map[val] || 'grey-7'
  }

  const loadData = async () => {
    loading.value = true
    try {
      const res = await api.get('/api/clientes')
      rows.value = res.data
    } finally {
      loading.value = false
    }
  }

  const openForm = (data = null) => {
    if (data) {
      // Si es edición, cargamos los datos que vienen de la fila
      selectedCliente.value = { ...data }
      isEdit.value = true
    } else {
      // Si es NUEVO, inicializamos el objeto con el valor por defecto
      selectedCliente.value = {
        nombre: '',
        apellido_paterno: '', // Nuevo
        apellido_materno: '', // Nuevo
        ocupacion: '',
        rfc: '',             // Nuevo
        estado_origen: 'TAMAULIPAS', // Nuevo
        fecha_nacimiento: '', // Nuevo (Necesario para RFC)
        identificacion: '',
        clasificacion: 'NUEVO', // <--- Esto asegura que el combo empiece aquí
        telefono1: '',
        callenum: '',
        colonia: '',
        municipio: '',
        estado: 'TAMAULIPAS', // Valor por defecto
        codPostal: '',
        ineFrente: null,
        ineReverso: null
      }
      isEdit.value = false
    }
    formDialog.value = true
  }


  const handleSave = async (formData) => {
    try {
      // Iniciamos estado de carga global si fuera necesario
      $q.loading.show({
        message: isEdit.value ? 'Actualizando cliente...' : 'Registrando nuevo cliente...'
      })

      let response;

      if (isEdit.value) {
        // formData ya trae el ID si viene del componente hijo
        response = await api.put(`/api/clientes/${formData.id}`, formData)
      } else {
        response = await api.post('/api/clientes', formData)
      }

      // ÉXITO: Mostramos el mensaje premium configurado en el controlador
      $q.notify({
        type: 'positive',
        message: response.data.message || 'Operación exitosa',
        icon: 'check_circle',
        position: 'bottom'
      })

      // Cerramos el diálogo y refrescamos la tabla de 50 filas
      formDialog.value = false
      loadData()

    } catch (error) {
      // El error 422 (validación) o 500 ya lo maneja el interceptor de axios.js
      // Pero podemos agregar un log para depuración
      console.error('Error al guardar cliente:', error.response?.data)
    } finally {
      $q.loading.hide()
    }
  }


  const confirmDelete = (row) => {
    $q.dialog({
      title: 'Confirmar Eliminación',
      message: `¿Desea borrar permanentemente al cliente <strong>${row.nombre}</strong>?`,
      html: true,
      ok: { push: true, color: 'negative', label: 'Eliminar' },
      cancel: { flat: true, color: 'grey-8' }
    }).onOk(async () => {
      try {
        const res = await api.delete(`/api/clientes/${row.id}`)
        $q.notify({ type: 'positive', message: res.data.message })
        loadData()
      }
      catch (error) {
        const mensaje = e.response?.data?.message || 'Error al eliminar'
        $q.notify({
          type: 'warning', // Usamos amarillo para advertencias de integridad
          message: mensaje,
          icon: 'warning',
          timeout: 3000
        })
      }
    })
  }

  const formatPhone = (phone) => {
    if (!phone) return '---'
    const cleaned = ('' + phone).replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return phone
  }

  onMounted(loadData)
</script>

<style lang="scss">
  .border-white {
    border: 2px solid white;
  }
  .opacity-60 { opacity: 0.6; }
</style>
