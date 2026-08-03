<template>
  <q-page class="page-container">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="title-main">
          Roles y Permisos
        </div>
        <div class="title-sub">
          Define y controla exactamente qué puede hacer cada grupo de usuarios en el sistema
        </div>
      </div>
      <div class="col-auto" v-if="authStore.can('crear roles')">
        <q-btn 
          color="primary" 
          icon="add_moderator" 
          label="Nuevo Rol" 
          rounded 
          unelevated 
          size="md" 
          class="btn-premium text-weight-bold" 
          @click="openForm(false)" 
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
        class="table-premium"
      >
        <template v-slot:top-right>
          <q-input autofocus 
            outlined 
            dense 
            debounce="300" 
            v-model="filter" 
            placeholder="Buscar rol..." 
            class="bg-white shadow-1" 
            style="width: 300px; border-radius: 8px;"
          >
            <template v-slot:append>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </template>

        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-uppercase text-weight-bold text-grey-4">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <div class="row items-center">
              <q-avatar size="40px" :color="props.row.name === 'Administrador' ? 'orange-2' : 'blue-1'" :text-color="props.row.name === 'Administrador' ? 'orange-9' : 'primary'" class="q-mr-md shadow-1">
                <q-icon :name="props.row.name === 'Administrador' ? 'local_police' : 'supervised_user_circle'" size="sm" />
              </q-avatar>
              <div>
                <div class="text-weight-bold text-primary text-subtitle2">{{ props.row.name }}</div>
                <div class="text-caption text-grey-6">{{ props.row.permissions.length }} privilegios asignados</div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-permissions="props">
          <q-td :props="props">
            <div class="row q-gutter-xs items-center">
              <q-badge
                v-for="p in props.row.permissions.slice(0, 5)"
                :key="p.id"
                :color="getPermColor(p.name).bg"
                :text-color="getPermColor(p.name).text"
                class="q-pa-xs q-px-sm text-weight-medium border-radius-small"
              >
                {{ p.name }}
              </q-badge>
              <q-badge v-if="props.row.permissions.length > 5" color="grey-3" text-color="grey-8" class="q-pa-xs q-px-sm text-weight-bold">
                +{{ props.row.permissions.length - 5 }} más
              </q-badge>
              <q-chip v-if="props.row.permissions.length === 0" color="red-1" text-color="red-9" dense size="sm" icon="warning">
                Sin permisos
              </q-chip>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn v-if="authStore.can('editar roles')" flat round class="action-btn" color="blue-8" icon="edit" size="sm" @click="openForm(true, props.row)">
              <q-tooltip>Modificar Rol</q-tooltip>
            </q-btn>
            <q-btn flat round class="action-btn q-ml-sm" color="negative" icon="delete" size="sm" @click="confirmDelete(props.row)" v-if="props.row.name !== 'Administrador' && authStore.can('borrar roles')">
              <q-tooltip>Eliminar Rol</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="full-width row flex-center text-accent q-gutter-sm q-pa-xl">
            <q-icon size="4em" name="shield" color="grey-4" />
            <span class="text-h6 text-grey-5">No hay roles registrados en el sistema</span>
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="formDialog" persistent backdrop-filter="blur(4px)">
      <RoleForm :is-edit="isEditMode" :role-data="selectedRole" @save="handleSave" />
    </q-dialog>
  </q-page>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { api } from 'boot/axios'
  import { useQuasar } from 'quasar'
  import RoleForm from 'components/Usuarios/RoleForm.vue'
  import { useAuthStore } from 'stores/auth'

  const $q = useQuasar()
  const rows = ref([])
  const loading = ref(false)
  const filter = ref('')
  const formDialog = ref(false)
  const isEditMode = ref(false)
  const selectedRole = ref(null)

  const authStore = useAuthStore()

  const columns = [
    { name: 'name', align: 'left', label: 'ROL DE USUARIO', field: 'name', sortable: true },
    { name: 'permissions', align: 'left', label: 'PRIVILEGIOS', field: 'permissions' },
    { name: 'actions', align: 'right', label: 'OPCIONES' }
  ]

  const loadRoles = async () => {
    loading.value = true
    const resp = await api.get('/api/roles')
    rows.value = resp.data
    loading.value = false
  }

  const openForm = (edit, role = null) => {
    isEditMode.value = edit
    selectedRole.value = role
    formDialog.value = true
  }

  const handleSave = async (data) => {
    try {
      let response;

      if (isEditMode.value) {
        response = await api.put(`/api/roles/${selectedRole.value.id}`, data)
      } else {
        response = await api.post('/api/roles', data)
      }
      $q.notify({
        type: 'positive',
        message: response.data.message || 'Operación realizada con éxito',
        icon: 'check_circle'
      })
      formDialog.value = false
      loadRoles()

    } catch (e) {
      const errorMessage = e.response?.data?.message || 'Error al procesar la solicitud';
      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'report_problem',
        position: 'top-right'
      })
    }
  }

  const confirmDelete = (role) => {
    $q.dialog({
      title: 'Eliminar Rol',
      message: `¿Está seguro que desea eliminar el rol ${role.name}?`,
      cancel: true,
      ok: { color: 'negative', label: 'Eliminar', rounded: true }
    }).onOk(async () => {
      await api.delete(`/api/roles/${role.id}`)
      loadRoles()
    })
  }

  // Dynamic colors for permissions
  const getPermColor = (permName) => {
    const name = permName.toLowerCase();
    if (name.includes('eliminar') || name.includes('borrar')) return { bg: 'red-1', text: 'red-9' };
    if (name.includes('crear') || name.includes('nuevo')) return { bg: 'green-1', text: 'green-9' };
    if (name.includes('editar') || name.includes('modificar') || name.includes('gestionar') || name.includes('configurar')) return { bg: 'orange-1', text: 'orange-9' };
    return { bg: 'blue-1', text: 'blue-9' };
  }

  onMounted(loadRoles)
</script>

<style scoped>
.opacity-80 {
  opacity: 0.8;
}
.border-radius-small {
  border-radius: 6px;
}
</style>
