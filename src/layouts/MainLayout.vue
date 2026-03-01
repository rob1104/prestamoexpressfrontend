<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-header elevated class="bg-primary text-white" height-hint="64">
      <q-toolbar class="q-py-sm q-px-md">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        />

        <q-toolbar-title class="text-weight-bold flex items-center">
          <q-icon name="payments" size="32px" class="q-mr-md text-secondary" />
          <div class="gt-xs">XisCAE <span class="text-weight-light">Web</span></div>
          <div class="text-subtitle">Versión 0.0.1</div>
        </q-toolbar-title>

        <q-space />

        <div class="flex items-center q-gutter-x-md">
          <div class="text-right gt-sm">
            <div class="text-subtitle2 text-weight-bold leading-tight">
              {{ authStore.user?.name || 'Usuario' }}
            </div>
            <div class="text-caption text-blue-2 opacity-80">
              {{ authStore.user?.roles?.[0] || 'Cajero' }}
            </div>
          </div>

          <q-btn-dropdown flat round dense no-caps>
            <template v-slot:label>
              <q-avatar size="38px" class="shadow-2 bg-secondary text-primary text-weight-bold">
                {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
              </q-avatar>
            </template>

            <q-list style="min-width: 200px">
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon name="person" color="primary" />
                </q-item-section>
                <q-item-section>Mi Perfil</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-ripple @click="logout" class="text-negative">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>Cerrar Sesión</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="280"
      class="bg-white"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-lg bg-grey-2 text-center border-bottom-soft">
          <q-img src="../assets/logo.png" class="q-mb-lg" />
          <div class="text-h6 text-primary text-weight-bolder">Sucursal Sexta</div>
          <div class="text-caption text-grey-7">Operaciones del día</div>
        </div>

        <div class="q-mt-md">
          <MenuPrincipal />
        </div>
      </q-scroll-area>


    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from 'src/stores/auth'
  // Importación del componente que crearás
  import MenuPrincipal from 'components/MenuPrincipal.vue'

  const authStore = useAuthStore()
  const router = useRouter()
  const leftDrawerOpen = ref(false)

  function toggleLeftDrawer () {
    leftDrawerOpen.value = !leftDrawerOpen.value
  }

  const logout = async () => {
    await authStore.logout()
    router.push('/login')
  }
</script>

<style lang="scss">
  .border-bottom-soft {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .border-top-soft {
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .leading-tight {
    line-height: 1.1;
  }

  /* Mejora la legibilidad del texto en el header */
  .q-header {
    backdrop-filter: blur(7px);
    background-color: rgba($primary, 0.95) !important;
  }

  /* Efecto hover elegante para los items del menú lateral */
  .q-drawer .q-item {
    border-radius: 0 24px 24px 0;
    margin-right: 12px;
    margin-top: 4px;
    color: #5f6368;

    &--active {
      background: rgba($primary, 0.1);
      color: $primary;
      font-weight: 600;
    }
  }

  .fade-slide-enter-from {
    opacity: 0;
    transform: translateY(15px); /* Entra desde un poco más abajo */
  }
  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px); /* Sale un poco hacia arriba */
  }
  .fade-slide-enter-active, .fade-slide-leave-active {
    transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); /* Curva de animación más suave */
  }

</style>
