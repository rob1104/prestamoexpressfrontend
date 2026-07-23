<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-gradient-premium">
        <div class="row full-width justify-center q-px-md">
          <div class="col-12 col-sm-8 col-md-5 col-lg-4">

            <q-card class="login-card shadow-24 overflow-hidden q-pa-sm login-anim">
              <div class="top-accent shadow-2"></div>

              <q-card-section class="q-pt-xl q-pb-sm text-center">
                <div class="logo-wrapper">
                  <q-img src="../assets/logo.png" alt="Logo PrestamoExpress" class="logo-img" />
                </div>

                <div class="text-h5 text-weight-bolder text-primary q-mt-lg tracking-tight">
                  SUCURSAL SEXTA
                </div>
                <div class="text-subtitle1 text-grey-8 q-mt-xs text-weight-medium">
                  ¡Bienvenido de nuevo! Ingresa tus credenciales.
                </div>
              </q-card-section>

              <q-card-section class="q-px-xl q-pb-xl">
                <q-form @submit="onSubmit" class="q-gutter-y-md">

                  <q-input
                    v-model="email"
                    label="Correo electrónico"
                    outlined
                    bg-color="grey-1"
                    color="primary"
                    type="email"
                    autofocus
                    lazy-rules
                    :rules="[val => !!val || 'El correo es obligatorio']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="mail_outline" color="primary" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="password"
                    label="Contraseña"
                    outlined
                    bg-color="grey-1"
                    color="primary"
                    :type="showPassword ? 'text' : 'password'"
                    lazy-rules
                    :rules="[val => !!val || 'La contraseña es obligatoria']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock_outline" color="primary" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="showPassword ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer text-grey-7 hover-primary"
                        @click="showPassword = !showPassword"
                      />
                    </template>
                  </q-input>

                  <div class="q-mt-xl">
                    <q-btn
                      :loading="loading"
                      type="submit"
                      label="Iniciar Sesión"
                      class="full-width q-py-sm login-btn text-white"
                      rounded
                      unelevated
                      size="lg"
                    >
                      <template v-slot:loading>
                        <q-spinner-dots color="white" />
                      </template>
                    </q-btn>
                  </div>

                  <div class="text-center q-mt-md">
                    <span class="text-caption text-grey-8 text-weight-medium">
                      <q-icon name="lock" class="q-mr-xs" />
                      Acceso seguro y encriptado
                    </span>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>

            <div class="text-center q-mt-xl text-white text-caption tracking-wide text-weight-medium" style="text-shadow: 0 1px 3px rgba(0,0,0,0.5);">
              © 2026 PRESTAMO EXPRESS - Todos los derechos reservados <br> Versión 0.0.30
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
/* Gradiente Premium de Fondo animado */
.bg-gradient-premium {
  background: linear-gradient(135deg, #4a192c 0%, #a75d61 50%, #ca62a7 100%);
  background-size: 200% 200%;
  animation: gradientBG 15s ease infinite;
}

@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Tarjeta Estilo Premium */
.login-card {
  border-radius: 28px;
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.login-anim {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Acento superior colorido en sincronía con la paleta */
.top-accent {
  height: 8px;
  background: linear-gradient(90deg, #ca62a7, #a75d61, #6d3340);
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

/* Contenedor del Logo */
.logo-wrapper {
  display: inline-block;
  padding: 16px;
  border-radius: 24px;
  background: rgba(202, 98, 167, 0.08); /* Tono muy sutil de la paleta */
  border: 1px solid rgba(202, 98, 167, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  margin-bottom: 8px;
}

.logo-img {
  width: 170px;
  height: auto;
}

/* Animación del botón respetando paleta (reemplazo del azul) */
.login-btn {
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: linear-gradient(45deg, #a75d61, #ca62a7);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(167, 93, 97, 0.4);
    background: linear-gradient(45deg, #b8696d, #db75b8);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 4px 8px rgba(167, 93, 97, 0.3);
  }
}

.tracking-tight { letter-spacing: -0.02em; }
.tracking-wide { letter-spacing: 0.05em; }
.opacity-80 { opacity: 0.8; }

.hover-primary {
  transition: color 0.2s ease;
  &:hover { color: $primary !important; }
}

/* Mejora visual de inputs */
:deep(.q-field__control) {
  border-radius: 12px;
  transition: all 0.3s ease;
}
:deep(.q-field--focused .q-field__control) {
  box-shadow: 0 4px 12px rgba($primary, 0.15);
}
</style>
