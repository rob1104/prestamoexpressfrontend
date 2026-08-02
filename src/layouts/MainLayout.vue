<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-header class="header-gradient text-white" height-hint="64">
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
          <q-avatar size="36px" class="bg-white q-mr-md" text-color="primary">
            <q-icon name="storefront" size="24px" />
          </q-avatar>
          <div class="gt-xs text-white" style="letter-spacing: 0.5px;">Préstamo Express <span class="text-weight-light text-grey-3">SICAE</span></div>
          <q-badge color="accent" class="q-ml-md text-caption q-py-xs q-px-sm" rounded>v0.0.40</q-badge>
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
              <q-avatar size="38px" class="shadow-2 bg-white text-primary text-weight-bolder">
                {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
              </q-avatar>
            </template>

            <q-list style="min-width: 200px">
              <q-item clickable v-ripple to="/perfil">
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
      :width="320"
      class="bg-secondary text-white"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-lg text-center border-bottom-soft bg-dark">
          <q-img src="../assets/logo.png" class="q-mb-md" style="max-width: 150px; margin: 0 auto; display: block;" />
          <div class="text-caption text-grey-4 q-mt-sm">Operaciones del día</div>
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

    <DialogoAperturaCaja
      v-model="requiereApertura"
      @apertura-registrada="desbloquearSistema"
    />

  </q-layout>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from 'src/stores/auth'
  import { api } from 'boot/axios'

  import MenuPrincipal from 'components/MenuPrincipal.vue'
  import DialogoAperturaCaja from 'components/Caja/DialogoAperturaCaja.vue'

  const requiereApertura = ref(false)

  const authStore = useAuthStore()
  const router = useRouter()
  const leftDrawerOpen = ref(false)

  onMounted(async () => {
    try {
      const res = await api.get('/api/caja/check-apertura')
      if (!res.data.apertura_realizada) {
      requiereApertura.value = true
    }
    } catch (error) {
      console.error('Error al verificar apertura:', error)
    }
  })

  const desbloquearSistema = (monto) => {
    console.log('Desbloqueando sistema con monto:', monto)
    requiereApertura.value = false
  }

  function toggleLeftDrawer () {
    leftDrawerOpen.value = !leftDrawerOpen.value
  }

  const logout = async () => {
    await authStore.logout()
    router.push('/login')
  }
</script>

<style lang="scss">
  .q-header {
    backdrop-filter: blur(7px);
    background-color: rgba($primary, 0.95) !important;
  }
</style>
