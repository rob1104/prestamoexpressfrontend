<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-gradient-premium">
        <div class="row full-width justify-center q-px-md">
          <div class="col-12 col-sm-8 col-md-4 col-lg-3">

            <q-card class="login-card shadow-24 overflow-hidden">
              <div class="top-accent shadow-2"></div>

              <q-card-section class="q-pt-xl q-pb-md">
                <div class="text-center">
                  <q-img src="../assets/logo.png" alt="Logo SICAE" />

                  <div class="text-h5 text-weight-bold text-primary q-mt-md">
                    SUCURSAL SEXTA
                  </div>
                  <div class="text-subtitle2 text-grey-7">
                    Acceso al Sistema
                  </div>
                </div>
              </q-card-section>

              <q-card-section class="q-px-lg">
                <q-form @submit="onSubmit" class="q-gutter-y-lg">

                  <q-input
                    v-model="email"
                    label="Correo electrónico"
                    outlined
                    bg-color="white"
                    color="primary"
                    type="email"
                    autofocus
                    :rules="[val => !!val || 'El correo es obligatorio']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="email" color="primary" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="password"
                    label="Contraseña"
                    outlined
                    bg-color="white"
                    color="primary"
                    :type="showPassword ? 'text' : 'password'"
                    :rules="[val => !!val || 'La contraseña es obligatoria']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock" color="primary" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="showPassword ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="showPassword = !showPassword"
                      />
                    </template>
                  </q-input>

                  <div>
                    <q-btn
                      :loading="loading"
                      type="submit"
                      label="Iniciar Sesión"
                      color="primary"
                      class="full-width q-py-sm login-btn"
                      rounded
                      unelevated
                      size="lg"
                    >
                      <template v-slot:loading>
                        <q-spinner-facebook />
                      </template>
                    </q-btn>
                  </div>
                </q-form>
              </q-card-section>
              <q-card-section>

              </q-card-section>
            </q-card>

            <div class="text-center q-mt-lg text-white opacity-70 text-caption">
              © 2026 SICAE - Todos los derechos reservados
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)


const onSubmit = async () => {
  loading.value = true
  const success = await authStore.login(email.value, password.value)
  if (success) {
    router.push('/')
  }
  loading.value = false
}
</script>

<style lang="scss" scoped>
/* Gradiente Premium de Fondo */
.bg-gradient-premium {
  background: linear-gradient(135deg, #6d3340 0%, #a75d61 50%, #ca62a7 100%);
}

/* Tarjeta Estilo Premium */
.login-card {
  border-radius: 24px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Acento superior colorido */
.top-accent {
  height: 6px;
  background: linear-gradient(90deg, #7e0f0f, #ef4444, #e46fe4);
}

/* Contenedor del Logo */
.logo-container {
  width: 90px;
  height: 90px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Animación del botón */
.login-btn {
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #1e3a8a, #3b82f6);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(59, 130, 246, 0.4);
  }
}

.opacity-70 {
  opacity: 0.7;
}

.hover-link:hover {
  text-decoration: underline;
}
</style>
