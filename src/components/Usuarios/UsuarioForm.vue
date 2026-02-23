<template>
  <q-card class="user-form-card shadow-24" style="min-width: 450px; border-radius: 20px;">
    <q-card-section class="bg-primary text-white row items-center q-pb-md">
      <div class="text-h6">
        <q-icon :name="isEdit ? 'edit' : 'person_add'" size="28px" class="q-mr-sm text-secondary" />
        {{ isEdit ? 'Actualizar Perfil de Usuario' : 'Registrar Nuevo Usuario' }}
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup class="text-white opacity-70" />
    </q-card-section>

    <q-separator />

    <q-card-section class="q-pa-xl">
      <q-form @submit="onSubmit" class="q-gutter-y-lg">

        <div class="text-overline text-grey-7 q-mb-xs">DATOS DE ACCESO</div>

        <q-input
          autofocus
          v-model="formData.name"
          label="Nombre Completo"
          outlined
          dense
          color="primary"
          bg-color="grey-1"

          :rules="[val => !!val || 'El nombre es obligatorio']"
        >
          <template v-slot:prepend><q-icon name="account_circle" color="primary" /></template>
        </q-input>

        <q-input
          v-model="formData.email"
          label="Correo Electrónico"
          type="email"
          outlined
          dense
          color="primary"
          bg-color="grey-1"

          :rules="[
            val => !!val || 'El correo es obligatorio',
            val => /.+@.+\..+/.test(val) || 'Formato de correo inválido'
          ]"
        >
          <template v-slot:prepend><q-icon name="alternate_email" color="primary" /></template>
        </q-input>

        <div class="text-overline text-grey-7 q-mt-md q-mb-xs">SEGURIDAD Y PERMISOS</div>

        <q-select
          v-model="formData.role"
          :options="roleOptions"
          :loading="loadingRoles"
          label="Asignar Rol"
          outlined
          dense

          map-options
          color="primary"
          bg-color="grey-1"
          :rules="[val => !!val || 'Debes asignar un rol']"
        >
          <template v-slot:prepend><q-icon name="admin_panel_settings" color="primary" /></template>
          <template v-slot:no-option>
            <q-item><q-item-section class="text-grey">Cargando roles...</q-item-section></q-item>
          </template>
        </q-select>

        <q-input
          v-model="formData.password"
          label="Contraseña"
          :type="showPwd ? 'text' : 'password'"
          outlined
          dense
          color="primary"
          bg-color="grey-1"
          :rules="isEdit ? [] : [val => !!val || 'La contraseña es requerida', val => val.length >= 8 || 'Mínimo 8 caracteres']"
          :hint="isEdit ? 'Dejar en blanco si no desea cambiarla' : 'Mínimo 8 caracteres'"
        >
          <template v-slot:prepend><q-icon name="lock_open" color="primary" /></template>
          <template v-slot:append>
            <q-icon
              :name="showPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPwd = !showPwd"
            />
          </template>
        </q-input>

        <div class="row justify-end q-mt-xl q-gutter-x-md">
          <q-btn
            label="Cancelar"
            flat
            color="grey-6"
            v-close-popup
            no-caps
            class="q-px-md"
          />
          <q-btn
            :label="isEdit ? 'Actualizar Usuario' : 'Guardar Usuario'"
            type="submit"
            color="primary"
            unelevated
            rounded
            class="q-px-xl text-weight-bold shadow-5 btn-premium"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { api } from 'boot/axios'
  import { useQuasar } from 'quasar'

  const props = defineProps({
    userData: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['save'])
  const $q = useQuasar()

  // Estado del componente
  const showPwd = ref(false)
  const roleOptions = ref([])
  const loadingRoles = ref(false)

  const formData = reactive({
    name: '',
    email: '',
    password: '',
    role: null
  })

  // Cargar roles desde la base de datos de Spatie
  const fetchRoles = async () => {
    loadingRoles.value = true
    try {
      const response = await api.get('/api/roles/names')
      // El backend devuelve solo los nombres (pluck('name'))
      roleOptions.value = response.data
    } catch (error) {
      console.error('Error al cargar roles:', error)
    } finally {
      loadingRoles.value = false
    }
  }

  onMounted(async () => {
    await fetchRoles()

    if (props.isEdit && props.userData) {
      formData.name = props.userData.name
      formData.email = props.userData.email

      // Mapeamos el rol actual: extraemos el nombre del primer rol del array de Spatie
      if (props.userData.roles && props.userData.roles.length > 0) {
        formData.role = props.userData.roles[0].name
      }

      // La contraseña siempre inicia vacía en edición
      formData.password = ''
    }
  })



  const onSubmit = () => {
    // Emitimos una copia de los datos al componente padre
    emit('save', { ...formData })
  }
</script>

<style lang="scss" scoped>
  .user-form-card {
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .opacity-70 {
    opacity: 0.7;
  }

  .btn-premium {
    transition: all 0.3s ease;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(30, 58, 138, 0.3) !important;
    }
  }

  /* Estilo para los títulos de sección (DATOS DE ACCESO, etc) */
  .text-overline {
    letter-spacing: 1.5px;
    font-weight: 700;
    font-size: 0.7rem;
  }
</style>
