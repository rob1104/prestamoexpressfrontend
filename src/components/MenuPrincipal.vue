<template>
  <q-list padding class="menu-principal-list">

    <q-item clickable v-ripple to="/" active-class="menu-item-active" exact class="menu-item q-mx-md q-mb-sm">
      <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
      <q-item-section class="text-weight-bold">Panel Principal</q-item-section>
    </q-item>

    <q-expansion-item icon="local_activity" label="Gestión de Empeños" class="q-mx-md menu-item" header-class="text-weight-bold">
      <q-item v-if="authStore.can('ver clientes')" clickable v-ripple to="/clientes" active-class="text-primary">
        <q-item-section avatar><q-icon name="group" /></q-item-section>
        <q-item-section>Clientes</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver boletas')" clickable v-ripple to="/boletas" active-class="text-primary">
        <q-item-section avatar><q-icon name="list_alt" /></q-item-section>
        <q-item-section>Consultar Boletas</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('crear boletas')" clickable v-ripple to="/boletastradicional" active-class="text-primary">
        <q-item-section avatar><q-icon name="money" /></q-item-section>
        <q-item-section>Tradicional</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('crear boletas')" clickable v-ripple to="/boletaspagos" active-class="text-primary">
        <q-item-section avatar><q-icon name="payment" /></q-item-section>
        <q-item-section>Prestamo en Pagos</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver boletas')" clickable v-ripple to="/movimientostradicional" active-class="text-primary">
        <q-item-section avatar><q-icon name="app_registration" /></q-item-section>
        <q-item-section>Mov. Tradicional</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver boletas')" clickable v-ripple to="/movimientostpagos" active-class="text-primary">
        <q-item-section avatar><q-icon name="credit_score" /></q-item-section>
        <q-item-section>Mov. Pagos</q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item icon="shopping_cart" label="Punto de Venta" class="q-mx-md menu-item" header-class="text-weight-bold">
      <q-item v-if="authStore.can('ventas joyeria')" clickable v-ripple to="/ventajoyeria" active-class="text-primary">
        <q-item-section avatar><q-icon name="diamond" /></q-item-section>
        <q-item-section>Compra/Venta de Joyería</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ventas electronicos')" clickable v-ripple to="/ventaelectronicos" active-class="text-primary">
        <q-item-section avatar><q-icon name="radio" /></q-item-section>
        <q-item-section>Ventas Electrónicos</q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item icon="assessment" label="Caja y Reportes" class="q-mx-md menu-item" header-class="text-weight-bold">
      <q-item v-if="authStore.can('cierre diario')" clickable v-ripple to="/operaciones/cierre" active-class="text-primary">
        <q-item-section avatar><q-icon name="lock_clock" /></q-item-section>
        <q-item-section>Cierre Diario</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('reportes cartera')" clickable v-ripple to="/reportes/cartera" active-class="text-primary">
        <q-item-section avatar><q-icon name="analytics" /></q-item-section>
        <q-item-section>Cartera</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('reportes flujo caja')" clickable v-ripple to="/reportes/flujocaja" active-class="text-primary">
        <q-item-section avatar><q-icon name="account_balance_wallet" /></q-item-section>
        <q-item-section>Flujo de Caja</q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item icon="settings" label="Administración" class="q-mx-md menu-item" header-class="text-weight-bold">
      <q-item v-if="authStore.can('configurar catalogos joyeria')" clickable v-ripple to="/config/conceptosjoyeria" active-class="text-primary">
        <q-item-section avatar><q-icon name="inventory" /></q-item-section>
        <q-item-section>Conceptos Joyería</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('configurar cotizacion oro')" clickable v-ripple to="/config/cotizacionoro" active-class="text-primary">
        <q-item-section avatar><q-icon name="diamond" /></q-item-section>
        <q-item-section>Cotización ORO</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('configurar parametros')" clickable v-ripple to="/config/parametros" active-class="text-primary">
        <q-item-section avatar><q-icon name="settings_suggest" /></q-item-section>
        <q-item-section>Parámetros</q-item-section>
      </q-item>
      <q-separator />
      <q-item v-if="authStore.can('ver usuarios')" clickable v-ripple to="/users" active-class="text-primary">
        <q-item-section avatar><q-icon name="manage_accounts" /></q-item-section>
        <q-item-section>Usuarios</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver roles')" clickable v-ripple to="/roles" active-class="text-primary">
        <q-item-section avatar><q-icon name="lock" /></q-item-section>
        <q-item-section>Roles y Permisos</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver logs')" clickable v-ripple to="/logs" active-class="text-primary">
        <q-item-section avatar><q-icon name="verified_user" /></q-item-section>
        <q-item-section>Logs Auditoría</q-item-section>
      </q-item>
    </q-expansion-item>

  </q-list>
</template>

<script setup>
  import { useAuthStore } from 'src/stores/auth'
  const authStore = useAuthStore()
</script>

<style lang="scss">
  .menu-principal-list {
    .menu-item {
      border-radius: 8px;
      margin-bottom: 4px;
      transition: all 0.2s ease;

      &:hover { background-color: rgba($primary, 0.08); }
    }

    .q-expansion-item__container {
      .q-item { border-radius: 8px; }
    }

    .menu-item-active {
      background: rgba($primary, 0.1);
      color: $primary;
      border-left: 4px solid $primary;
    }
  }
</style>
