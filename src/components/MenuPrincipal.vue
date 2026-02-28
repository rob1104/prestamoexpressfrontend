<template>
  <q-list padding class="menu-principal-list">
    <q-item
      clickable
      v-ripple
      to="/"
      active-class="menu-item-active"
      exact
      class="menu-item q-mx-md q-mb-sm"
    >
      <q-item-section avatar>
        <q-icon name="dashboard" />
      </q-item-section>
      <q-item-section class="text-weight-medium">Panel Principal</q-item-section>
    </q-item>

     <q-item-label header class="text-uppercase text-weight-bolder text-grey-6 letter-spacing-1">
      Nuevo
    </q-item-label>

    <q-item
      v-if="authStore.can('crear boletas')"
      clickable
      v-ripple
      to="/boletastradicional"
      active-class="menu-item-active"
      class="menu-item q-mx-md q-mb-xs"
    >
      <q-item-section avatar>
        <q-icon name="money" />
      </q-item-section>
      <q-item-section class="text-weight-medium">Prestamo Tradicional</q-item-section>
      <q-item-section side v-if="authStore.isAdmin">
        <q-badge color="secondary" text-color="primary" label="Admin" />
      </q-item-section>
    </q-item>
     <q-item
      v-if="authStore.can('crear boletas')"
      clickable
      v-ripple
      to="/boletaspagos"
      active-class="menu-item-active"
      class="menu-item q-mx-md q-mb-xs"
    >
      <q-item-section avatar>
        <q-icon name="money" />
      </q-item-section>
      <q-item-section class="text-weight-medium">Prestamo en Pagos</q-item-section>
      <q-item-section side v-if="authStore.isAdmin">
        <q-badge color="secondary" text-color="primary" label="Admin" />
      </q-item-section>
    </q-item>

     <q-item-label header class="text-uppercase text-weight-bolder text-grey-6 letter-spacing-1">
      Movimientos
    </q-item-label>

     <q-item
      v-if="authStore.can('ver boletas')"
      clickable
      v-ripple
      to="/movimientostradicional"
      active-class="menu-item-active"
      class="menu-item q-mx-md q-mb-xs"
    >
      <q-item-section avatar>
        <q-icon name="app_registration" />
      </q-item-section>
      <q-item-section class="text-weight-medium">Tradicional</q-item-section>
      <q-item-section side v-if="authStore.isAdmin">
        <q-badge color="secondary" text-color="primary" label="Admin" />
      </q-item-section>
    </q-item>

    <q-separator class="q-my-md q-mx-lg opacity-30" />

    <q-item-label header class="text-uppercase text-weight-bolder text-grey-6 letter-spacing-1">
      Catálogos
    </q-item-label>

    <q-item
      v-if="authStore.can('ver clientes')"
      clickable
      v-ripple
      to="/clientes"
      active-class="menu-item-active"
      class="menu-item q-mx-md q-mb-xs"
    >
      <q-item-section avatar>
        <q-icon name="group" />
      </q-item-section>
      <q-item-section class="text-weight-medium">Clientes</q-item-section>
      <q-item-section side v-if="authStore.isAdmin">
        <q-badge color="secondary" text-color="primary" label="Admin" />
      </q-item-section>
    </q-item>

    <q-separator class="q-my-md q-mx-lg opacity-30" />

     <q-item-label header class="text-uppercase text-weight-bolder text-grey-6 letter-spacing-1">
      Parametros boletas
    </q-item-label>

    <q-item
      v-if="authStore.can('configurar cotizacion oro')"
      clickable
      v-ripple
      to="/config/cotizacionoro"
      active-class="menu-item-active"
      class="menu-item q-mx-md q-mb-xs"
    >
      <q-item-section avatar>
        <q-icon name="diamond" />
      </q-item-section>
      <q-item-section class="text-weight-medium">Cotización ORO</q-item-section>
      <q-item-section side v-if="authStore.isAdmin">
        <q-badge color="secondary" text-color="primary" label="Admin" />
      </q-item-section>
    </q-item>

    <q-item
      v-if="authStore.can('configurar parametros')"
      clickable
      v-ripple
      to="/config/parametros"
      active-class="menu-item-active"
      class="menu-item q-mx-md q-mb-xs"
    >
      <q-item-section avatar>
        <q-icon name="settings_suggest" />
      </q-item-section>
      <q-item-section class="text-weight-medium">Parametros</q-item-section>
      <q-item-section side v-if="authStore.isAdmin">
        <q-badge color="secondary" text-color="primary" label="Admin" />
      </q-item-section>
    </q-item>

    <q-separator class="q-my-md q-mx-lg opacity-30" />

    <q-item-label header class="text-uppercase text-weight-bolder text-grey-6 letter-spacing-1">
      Configuración
    </q-item-label>

    <q-item
      v-if="authStore.can('ver usuarios')"
      clickable
      v-ripple
      to="/users"
      active-class="menu-item-active"
      class="menu-item q-mx-md q-mb-xs"
    >
      <q-item-section avatar>
        <q-icon name="manage_accounts" />
      </q-item-section>
      <q-item-section class="text-weight-medium">Usuarios</q-item-section>
      <q-item-section side v-if="authStore.isAdmin">
        <q-badge color="secondary" text-color="primary" label="Admin" />
      </q-item-section>
    </q-item>

    <q-item
      v-if="authStore.can('ver roles')"
      clickable
      v-ripple
      to="/roles"
      active-class="menu-item-active"
      class="menu-item q-mx-md q-mb-xs"
    >
      <q-item-section avatar>
        <q-icon name="lock" />
      </q-item-section>
      <q-item-section class="text-weight-medium">Roles y Permisos</q-item-section>
      <q-item-section side v-if="authStore.isAdmin">
        <q-badge color="secondary" text-color="primary" label="Admin" />
      </q-item-section>
    </q-item>

    <q-item
      v-if="authStore.can('ver logs')"
      clickable
      v-ripple
      to="/logs"
      active-class="menu-item-active"
      class="menu-item q-mx-md q-mb-xs"
    >
      <q-item-section avatar>
        <q-icon name="verified_user" />
      </q-item-section>
      <q-item-section class="text-weight-medium">Logs de auditoria</q-item-section>
      <q-item-section side v-if="authStore.isAdmin">
        <q-badge color="secondary" text-color="primary" label="Admin" />
      </q-item-section>
    </q-item>



  </q-list>
</template>

<script setup>
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
</script>

<style lang="scss">
.menu-principal-list {
  .letter-spacing-1 {
    letter-spacing: 1.2px;
    font-size: 0.65rem;
  }

  .menu-item {
    border-radius: 12px;
    transition: all 0.3s ease;
    color: #475569; // Slate-600

    &:hover {
      background-color: rgba($primary, 0.05);
      color: $primary;
    }

    .q-icon {
      font-size: 22px;
    }
  }

  /* Estilo Premium para el ítem activo */
  .menu-item-active {
    background: linear-gradient(90deg, rgba($primary, 0.1) 0%, rgba($primary, 0.02) 100%) !important;
    color: $primary !important;
    border-left: 4px solid $primary;
    border-radius: 4px 12px 12px 4px;

    .q-icon {
      color: $primary;
    }

    .q-item__section--main {
      font-weight: 700 !important;
    }
  }

  .opacity-30 {
    opacity: 0.3;
  }
}
</style>
