<template>
  <q-card class="role-form-card shadow-24" style="width: 650px; max-width: 95vw; border-radius: 12px;">
    <q-card-section class="bg-primary text-white row items-center">
      <div class="text-h6 flex items-center">
        <q-icon name="security" size="28px" class="q-mr-sm text-secondary" />
        {{ isEdit ? 'Configurar Rol' : 'Nuevo Rol de Sistema' }}
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="q-pa-md scroll" style="max-height: 80vh;">
      <q-form @submit="onSubmit" class="q-gutter-y-sm">
        <div class="row q-col-gutter-sm items-center">
          <div class="col-12 col-md-6">
            <q-input
              autofocus
              v-model="formData.name"
              label="Nombre del Rol"
              outlined
              color="primary"
              :readonly="formData.name === 'Administrador'"
              :rules="[val => !!val || 'El nombre es obligatorio']"
              class="text-h6"
            >
              <template v-slot:prepend><q-icon name="badge" color="primary" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-6 flex items-center justify-end q-gutter-x-sm">
            <q-btn 
              v-if="formData.name !== 'Administrador'"
              outline dense
              color="negative" 
              icon="clear_all" 
              label="Ninguno" 
              class="q-px-sm"
              @click="deselectAllPermissions"
            />
            <q-btn 
              v-if="formData.name !== 'Administrador'"
              outline dense
              color="secondary" 
              icon="done_all" 
              label="Todos" 
              class="q-px-sm"
              @click="selectAllPermissions"
            />
          </div>
        </div>

        <div class="text-subtitle1 text-weight-bold text-primary q-mt-md border-bottom-soft q-pb-none">
          Privilegios del Sistema
          <span class="text-caption text-grey-7 q-ml-sm fw-normal">Selecciona los accesos de este rol</span>
        </div>

        <div class="row q-col-gutter-sm">
          <div v-for="(group, groupName) in groupedPermissions" :key="groupName" class="col-12 col-md-6 col-lg-4">
            <q-card flat bordered class="permission-card bg-white">
              <q-card-section class="bg-grey-1 row items-center q-pa-xs q-px-sm">
                <q-icon :name="group.icon" size="xs" color="primary" class="q-mr-xs" />
                <div class="text-subtitle2 text-weight-bold text-primary">{{ groupName }}</div>
                <q-space />
                <q-checkbox 
                  v-if="formData.name !== 'Administrador'"
                  :model-value="isGroupSelected(groupName)"
                  @update:model-value="val => toggleGroup(groupName, val)"
                  color="secondary"
                  dense size="xs"
                >
                  <q-tooltip>Seleccionar módulo</q-tooltip>
                </q-checkbox>
              </q-card-section>
              <q-separator />
              <q-card-section class="q-pa-xs">
                <div class="row">
                  <div v-for="perm in group.perms" :key="perm.id" class="col-12">
                    <q-checkbox 
                      v-model="formData.permissions" 
                      :val="perm.name" 
                      color="secondary"
                      :disable="formData.name === 'Administrador'"
                      dense size="sm"
                      class="full-width hover-bg rounded-borders q-px-xs q-py-none"
                    >
                      <div class="text-caption text-grey-9 text-capitalize" style="line-height: 1.2;">{{ formatPermissionName(perm.name) }}</div>
                    </q-checkbox>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row justify-end q-mt-md q-gutter-x-sm">
          <q-btn label="Cancelar" flat dense color="grey-7" v-close-popup class="q-px-sm" />
          <q-btn
            label="Guardar"
            type="submit"
            color="primary"
            unelevated dense
            class="btn-premium q-px-md text-weight-bold"
            icon="save"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
  import { ref, reactive, onMounted, computed } from 'vue'
  import { api } from 'boot/axios'

  const props = defineProps({
    roleData: Object,
    isEdit: Boolean
  })
  const emit = defineEmits(['save'])

  const allPermissions = ref([])
  const formData = reactive({
    name: '',
    permissions: []
  })

  onMounted(async () => {
    const resp = await api.get('/api/permissions')
    allPermissions.value = resp.data

    if (props.isEdit && props.roleData) {
      formData.name = props.roleData.name
      formData.permissions = props.roleData.permissions.map(p => p.name)
    }
  })

  const groupedPermissions = computed(() => {
    const groups = {
      'Clientes': { icon: 'group', perms: [] },
      'Boletas y Préstamos': { icon: 'receipt', perms: [] },
      'Ventas': { icon: 'point_of_sale', perms: [] },
      'Caja y Flujo': { icon: 'account_balance_wallet', perms: [] },
      'Reportes': { icon: 'analytics', perms: [] },
      'Configuración': { icon: 'settings', perms: [] },
      'Sistema y Seguridad': { icon: 'security', perms: [] },
      'Otros': { icon: 'category', perms: [] },
    }

    allPermissions.value.forEach(p => {
      const name = p.name.toLowerCase()
      if (name.includes('cliente')) groups['Clientes'].perms.push(p)
      else if (name.includes('boleta')) groups['Boletas y Préstamos'].perms.push(p)
      else if (name.includes('ventas')) groups['Ventas'].perms.push(p)
      else if (name.includes('caja') || name.includes('flujo')) groups['Caja y Flujo'].perms.push(p)
      else if (name.includes('reporte')) groups['Reportes'].perms.push(p)
      else if (name.includes('configurar') || name.includes('catalogo')) groups['Configuración'].perms.push(p)
      else if (name.includes('usuario') || name.includes('role') || name.includes('log') || name.includes('database')) groups['Sistema y Seguridad'].perms.push(p)
      else groups['Otros'].perms.push(p)
    })

    const result = {}
    for (const key in groups) {
      if (groups[key].perms.length > 0) result[key] = groups[key]
    }
    return result
  })

  const formatPermissionName = (name) => {
    return name.replace('database.backup', 'Respaldar Base de Datos')
  }

  const selectAllPermissions = () => {
    formData.permissions = allPermissions.value.map(p => p.name)
  }

  const deselectAllPermissions = () => {
    formData.permissions = []
  }

  const toggleGroup = (groupName, isChecked) => {
    const groupPerms = groupedPermissions.value[groupName].perms.map(p => p.name)
    if (isChecked) {
      // Add missing permissions
      groupPerms.forEach(p => {
        if (!formData.permissions.includes(p)) {
          formData.permissions.push(p)
        }
      })
    } else {
      // Remove permissions in this group
      formData.permissions = formData.permissions.filter(p => !groupPerms.includes(p))
    }
  }

  const isGroupSelected = (groupName) => {
    const groupPerms = groupedPermissions.value[groupName].perms.map(p => p.name)
    if (groupPerms.length === 0) return false
    return groupPerms.every(p => formData.permissions.includes(p))
  }

  const onSubmit = () => emit('save', { ...formData })
</script>

<style scoped>
  .permission-card {
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.05);
    background: white;
    height: 100%;
    transition: all 0.3s;
  }
  .permission-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-color: rgba(0,0,0,0.1);
  }
  .hover-bg {
    transition: background-color 0.2s;
  }
  .hover-bg:hover {
    background-color: #f1f5f9;
  }
</style>
