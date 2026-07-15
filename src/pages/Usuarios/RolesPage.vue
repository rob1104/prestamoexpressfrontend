<template>
  <q-page class="page-container">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="title-main">Roles y Permisos</div>
        <div class="title-sub">Define qué puede hacer cada grupo de usuarios</div>
      </div>
      <div class="col-auto" v-if="authStore.can('crear roles')">

        <q-btn color="primary" icon="enhanced_encryption" label="Crear Rol" rounded unelevated size="md" class="btn-premium" @click="openForm(false)" />
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
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Buscar rol...">
            <template v-slot:append><q-icon name="search" color="primary" /></template>
          </q-input>
        </template>

        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <div class="text-weight-bold text-primary">{{ props.row.name }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-permissions="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <q-badge v-for="p in props.row.permissions.slice(0, 3)" :key="p.id" color="blue-1" text-color="primary">
                {{ p.name }}
              </q-badge>
              <q-badge v-if="props.row.permissions.length > 3" color="grey-3" text-color="grey-9">
                +{{ props.row.permissions.length - 3 }}
              </q-badge>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn v-if="authStore.can('editar roles')" flat round color="blue-7" icon="settings" size="sm" @click="openForm(true, props.row)" />
            <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmDelete(props.row)" v-if="props.row.name !== 'Administrador' && authStore.can('borrar roles')" />
          </q-td>
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
    { name: 'name', align: 'left', label: 'NOMBRE DEL ROL', field: 'name', sortable: true },
    { name: 'permissions', align: 'left', label: 'PERMISOS ASIGNADOS', field: 'permissions' },
    { name: 'actions', align: 'right', label: 'ACCIONES' }
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
      message: `¿Está seguro que desea eliminar el rol ${role.name}?.`,
      cancel: true,
      ok: { color: 'negative', label: 'Eliminar', rounded: true }
    }).onOk(async () => {
      await api.delete(`/api/roles/${role.id}`)
      loadRoles()
    })
  }

  onMounted(loadRoles)
</script>

<style lang="scss">
</style>
