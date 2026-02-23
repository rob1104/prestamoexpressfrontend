<template>
  <q-page class="q-pa-lg bg-slate-50">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4 text-weight-bolder text-primary tracking-tight">
          Gestión de Usuarios
        </div>
        <div class="text-subtitle1 text-grey-7">
          Administración centralizada de accesos y perfiles
        </div>
      </div>
      <div class="col-auto" v-if="authStore.can('crear usuarios')">
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo Usuario"
          rounded
          unelevated
          size="md"
          class="shadow-btn-premium text-weight-bold"
          @click="openForm(false)"
        />
      </div>
    </div>

    <q-card class="table-container shadow-24">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        :pagination="pagination"
        class="sicae-premium-table"
      >
        <template v-slot:top-right>
          <q-input
            outlined
            dense
            debounce="300"
            v-model="filter"
            placeholder="Buscar usuario..."
            class="bg-white shadow-1"
            style="width: 300px; border-radius: 8px;"
          >
            <template v-slot:append>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </template>

        <template v-slot:header="props">
          <q-tr :props="props" class="bg-primary text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bolder text-uppercase cursor-pointer"
              style="font-size: 0.75rem; letter-spacing: 0.1em; padding: 16px;"
            >
              {{ col.label }}
              </q-th>
          </q-tr>
        </template>

        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="38px" class="q-mr-md shadow-2 bg-blue-1 text-primary text-weight-bold border-white">
                {{ props.row.name.charAt(0).toUpperCase() }}
              </q-avatar>
              <div>
                <div class="text-weight-bold text-blue-grey-10">{{ props.row.name }}</div>
                <div class="text-caption text-grey-6">ID: #{{ props.row.id }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-email="props">
          <q-td :props="props">
            <div class="row items-center text-blue-grey-7">
              <q-icon name="alternate_email" size="14px" class="q-mr-xs opacity-60" />
              {{ props.row.email }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-role="props">
          <q-td :props="props" class="text-center">
            <q-badge
              :color="props.row.roles?.[0]?.name === 'Administrador' ? 'secondary' : 'indigo-1'"
              :text-color="props.row.roles?.[0]?.name === 'Administrador' ? 'primary' : 'indigo-9'"
              class="q-px-md q-py-xs text-weight-bolder shadow-1"
              style="border-radius: 6px;"
            >
              {{ props.row.roles?.[0]?.name || 'Sin Rol' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-active="props">
          <q-td :props="props" class="text-center">
            <q-chip
              :color="props.row.active ? 'positive' : 'negative'"
              text-color="white"
              size="sm"
              class="text-weight-bolder status-chip"
            >
              {{ props.row.active ? 'ACTIVO' : 'INACTIVO' }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <div class="q-gutter-x-sm">
              <q-btn v-if="authStore.can('editar usuarios')" flat round color="blue-7" icon="edit_note" size="sm" @click="openForm(true, props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                v-if="authStore.can('editar usuarios')"
                flat round
                :color="props.row.active ? 'warning' : 'positive'"
                :icon="props.row.active ? 'person_off' : 'person_add_alt'"
                size="sm"
                @click="toggleStatus(props.row)"
              >
                <q-tooltip>{{ props.row.active ? 'Desactivar' : 'Activar' }}</q-tooltip>
              </q-btn>
              <q-btn v-if="authStore.can('borrar usuarios')" flat round color="negative" icon="delete_sweep" size="sm" @click="confirmDelete(props.row)">
                <q-tooltip>Borrar</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="formDialog" persistent backdrop-filter="blur(4px) brightness(60%)">
      <UserForm :is-edit="isEditMode" :user-data="selectedUser" @save="handleSave" />
    </q-dialog>
  </q-page>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { api } from 'boot/axios'
  import { useQuasar } from 'quasar'
  import UserForm from 'components/Usuarios/UsuarioForm.vue'
  import { useAuthStore } from 'stores/auth'

  const $q = useQuasar()
  const rows = ref([])
  const loading = ref(false)
  const filter = ref('') // <--- Estado para el buscador
  const formDialog = ref(false)
  const isEditMode = ref(false)
  const selectedUser = ref(null)
  const authStore = useAuthStore()

  // Configuración de paginación inicial
  const pagination = ref({
    sortBy: 'name',
    descending: false,
    page: 1,
    rowsPerPage: 10
  })

  const columns = [
    { name: 'name', align: 'left', label: 'Nombre', field: 'name', sortable: true }, // <--- sortable habilitado
    { name: 'email', align: 'left', label: 'Correo', field: 'email', sortable: true },
    { name: 'role', align: 'center', label: 'Rol', field: row => row.roles?.[0]?.name, sortable: true },
    { name: 'active', align: 'center', label: 'Estatus', field: 'active', sortable: true },
    { name: 'actions', align: 'right', label: 'Acciones', sortable: false }
  ]

  const loadUsers = async () => {
    loading.value = true
    try {
      const response = await api.get('/api/users')
      rows.value = response.data
    } finally {
      loading.value = false
    }
  }

  const openForm = (edit, user = null) => {
    isEditMode.value = edit
    selectedUser.value = user
    formDialog.value = true
  }

  const handleSave = async (data) => {
    try {
      if (isEditMode.value) {
        await api.put(`/api/users/${selectedUser.value.id}`, data)
        $q.notify({ color: 'positive', message: 'Actualizado correctamente' })
      } else {
        await api.post('/api/users', data)
        $q.notify({ color: 'positive', message: 'Creado correctamente' })
      }
      formDialog.value = false
      loadUsers()
    } catch (e) {}
  }

  const confirmDelete = (user) => {
    $q.dialog({
      title: 'Confirmar',
      message: `¿Eliminar a ${user.name}?`,
      cancel: true,
      persistent: true,
      ok: { color: 'negative', label: 'Eliminar', rounded: true }
    }).onOk(async () => {
      await api.delete(`/api/users/${user.id}`)
      loadUsers()
    })
  }

  const toggleStatus = (user) => {
    $q.dialog({
      title: 'Estatus',
      message: `¿Cambiar estatus de ${user.name}?`,
      cancel: true,
      persistent: true,
      ok: { color: 'primary', label: 'Confirmar', rounded: true }
    }).onOk(async () => {
      await api.patch(`/api/users/${user.id}/toggle`)
      loadUsers()
    })
  }

  onMounted(loadUsers)
</script>

<style lang="scss">

  .bg-slate-50 {
    background-color: #f8fafc;
  }

  .table-container {
    border-radius: 20px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  .shadow-btn-premium {
    box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.3), 0 4px 6px -2px rgba(30, 58, 138, 0.1);
    transition: all 0.3s ease;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgba(30, 58, 138, 0.25);
    }
  }


  .sicae-premium-table {
    .q-table__top {
      padding: 20px;
    }



    tbody tr {
      transition: background-color 0.2s ease;
      &:hover {
        background-color: #f1f5f9 !important;
      }
    }

    td {
      padding: 12px 16px !important;
      border-bottom: 1px solid #f1f5f9;
    }
  }

  .border-white {
    border: 2px solid white;
  }

  .tracking-tight { letter-spacing: -0.025em; }
  .opacity-60 { opacity: 0.6; }


</style>
