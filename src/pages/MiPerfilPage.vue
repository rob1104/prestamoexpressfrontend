<template>
  <q-page class="page-container">
    <!-- Header -->
    <div class="row items-center q-mb-xl">
      <div class="col-12">
        <div class="title-main">Mi Perfil</div>
        <div class="title-sub">Actualiza tus datos personales y credenciales de acceso.</div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      
      <!-- Datos Personales -->
      <div class="col-12 col-md-6">
        <q-card class="card-premium" flat bordered>
          <q-card-section class="bg-grey-1 border-bottom-soft">
            <div class="text-h6 text-primary flex items-center text-weight-bold">
              <q-icon name="person" size="sm" class="q-mr-sm" /> Datos Personales
            </div>
          </q-card-section>
          
          <q-card-section class="q-pa-lg">
            <q-form @submit="updateProfile" class="q-gutter-md">
              <q-input autofocus
                v-model="form.name"
                label="Nombre Completo"
                outlined
                dense
                color="primary"
                :rules="[val => !!val || 'El nombre es requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" />
                </template>
              </q-input>

              <q-input
                v-model="form.email"
                label="Correo Electrónico"
                type="email"
                outlined
                dense
                color="primary"
                :rules="[val => !!val || 'El correo es requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <div class="text-right q-mt-md">
                <q-btn
                  label="Guardar Cambios"
                  type="submit"
                  color="primary"
                  class="btn-premium"
                  icon="save"
                  :loading="loadingProfile"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Seguridad (Contraseña) -->
      <div class="col-12 col-md-6">
        <q-card class="card-premium" flat bordered>
          <q-card-section class="bg-grey-1 border-bottom-soft">
            <div class="text-h6 text-primary flex items-center text-weight-bold">
              <q-icon name="security" size="sm" class="q-mr-sm" /> Seguridad y Contraseña
            </div>
          </q-card-section>
          
          <q-card-section class="q-pa-lg">
            <q-form @submit="updatePassword" class="q-gutter-md">
              <q-input
                v-model="passwordForm.current_password"
                label="Contraseña Actual"
                type="password"
                outlined
                dense
                color="primary"
                hint="Requerida solo si deseas cambiar tu contraseña"
              >
                <template v-slot:prepend>
                  <q-icon name="lock_open" />
                </template>
              </q-input>

              <q-input
                v-model="passwordForm.password"
                label="Nueva Contraseña"
                type="password"
                outlined
                dense
                color="primary"
                :rules="[
                  val => !passwordForm.current_password || !!val || 'Ingresa la nueva contraseña',
                  val => !val || val.length >= 8 || 'Mínimo 8 caracteres'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>

              <q-input
                v-model="passwordForm.password_confirmation"
                label="Confirmar Nueva Contraseña"
                type="password"
                outlined
                dense
                color="primary"
                :rules="[
                  val => !passwordForm.password || val === passwordForm.password || 'Las contraseñas no coinciden'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="check_circle" />
                </template>
              </q-input>

              <div class="text-right q-mt-md">
                <q-btn
                  label="Actualizar Contraseña"
                  type="submit"
                  color="secondary"
                  class="btn-premium"
                  icon="key"
                  :loading="loadingPassword"
                  :disable="!passwordForm.current_password || !passwordForm.password"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const loadingProfile = ref(false)
const loadingPassword = ref(false)

const form = ref({
  name: '',
  email: ''
})

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
})

const loadUserData = () => {
  if (authStore.user) {
    form.value.name = authStore.user.name || ''
    form.value.email = authStore.user.email || ''
  }
}

const updateProfile = async () => {
  loadingProfile.value = true
  try {
    const res = await api.put('/api/profile', {
      name: form.value.name,
      email: form.value.email
    })
    
    // Update local store user
    if (res.data.user) {
      authStore.user.name = res.data.user.name
      authStore.user.email = res.data.user.email
    }

    $q.notify({
      color: 'positive',
      message: res.data.message || 'Perfil actualizado correctamente',
      icon: 'check'
    })
  } catch (error) {
    console.error(error)
    let errorMessage = 'Hubo un error al actualizar el perfil'
    if (error.response?.data?.errors) {
      errorMessage = Object.values(error.response.data.errors).flat().join(', ')
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    $q.notify({ color: 'negative', message: errorMessage, icon: 'report_problem' })
  } finally {
    loadingProfile.value = false
  }
}

const updatePassword = async () => {
  loadingPassword.value = true
  try {
    const res = await api.put('/api/profile', {
      name: form.value.name,
      email: form.value.email,
      current_password: passwordForm.value.current_password,
      password: passwordForm.value.password,
      password_confirmation: passwordForm.value.password_confirmation
    })
    
    $q.notify({
      color: 'positive',
      message: 'Contraseña actualizada correctamente',
      icon: 'check'
    })
    
    // Reset password form
    passwordForm.value.current_password = ''
    passwordForm.value.password = ''
    passwordForm.value.password_confirmation = ''
    
  } catch (error) {
    console.error(error)
    let errorMessage = 'Hubo un error al cambiar la contraseña'
    if (error.response?.data?.errors) {
      errorMessage = Object.values(error.response.data.errors).flat().join(', ')
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    $q.notify({ color: 'negative', message: errorMessage, icon: 'report_problem' })
  } finally {
    loadingPassword.value = false
  }
}

onMounted(() => {
  loadUserData()
})
</script>
