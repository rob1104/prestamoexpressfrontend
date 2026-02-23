<template>
  <q-card class="role-form-card shadow-24" style="min-width: 550px; border-radius: 20px;">
    <q-card-section class="bg-primary text-white row items-center">
      <div class="text-h6">
        <q-icon name="security" size="28px" class="q-mr-sm text-secondary" />
        {{ isEdit ? 'Configurar Rol' : 'Nuevo Rol de Sistema' }}
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="q-pa-lg">
      <q-form @submit="onSubmit" class="q-gutter-y-md">
        <q-input
          autofocus
          v-model="formData.name"
          label="Nombre del Rol"
          outlined
          dense
          :readonly="formData.name === 'Administrador'"
          :rules="[val => !!val || 'El nombre es obligatorio']"
        >
          <template v-slot:prepend><q-icon name="badge" color="primary" /></template>
        </q-input>

        <div class="text-subtitle2 text-primary q-mt-md border-bottom q-pb-xs">
          Permisos Asignados
        </div>

        <div class="row q-col-gutter-sm">
          <div v-for="perm in allPermissions" :key="perm.id" class="col-12 col-sm-6">
            <q-item tag="label" v-ripple class="permission-item">
              <q-item-section avatar>
                <q-checkbox v-model="formData.permissions" :val="perm.name" color="secondary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ perm.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </div>

        <div class="row justify-end q-mt-xl q-gutter-x-md">
          <q-btn label="Cancelar" flat color="grey-7" v-close-popup />
          <q-btn
            label="Guardar Cambios"
            type="submit"
            color="primary"
            unelevated
            rounded
            class="q-px-xl"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue'
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
    // Cargar lista maestra de permisos
    const resp = await api.get('/api/permissions')
    allPermissions.value = resp.data

    if (props.isEdit && props.roleData) {
      formData.name = props.roleData.name
      // Mapeamos solo los nombres de los permisos que ya tiene el rol
      formData.permissions = props.roleData.permissions.map(p => p.name)
    }
  })

  const onSubmit = () => emit('save', { ...formData })
</script>

<style scoped>
  .permission-item {
    border: 1px solid #f1f5f9;
    border-radius: 8px;
    transition: background 0.3s;
  }
  .permission-item:hover {
    background: #f8fafc;
  }
</style>
