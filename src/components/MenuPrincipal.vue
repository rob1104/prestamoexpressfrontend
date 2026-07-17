<template>
  <q-list padding class="menu-principal-list">

    <q-item clickable v-ripple to="/" active-class="menu-item-active" exact class="menu-item q-mx-md q-mb-sm">
      <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
      <q-item-section class="text-weight-bold">Panel Principal</q-item-section>
    </q-item>

    <q-expansion-item icon="local_activity" label="Gestión de Empeños" class="q-mx-md menu-item" header-class="text-weight-bold">
      <q-item v-if="authStore.can('ver clientes')" clickable v-ripple to="/clientes" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="group" size="xs" /></q-item-section>
        <q-item-section>Clientes</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver boletas')" clickable v-ripple to="/boletas" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="list_alt" size="xs" /></q-item-section>
        <q-item-section>Consultar Boletas</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('crear boletas')" clickable v-ripple to="/boletastradicional" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="money" size="xs" /></q-item-section>
        <q-item-section>Tradicional</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('crear boletas')" clickable v-ripple to="/boletaspagos" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="payment" size="xs" /></q-item-section>
        <q-item-section>Prestamo en Pagos</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver boletas')" clickable v-ripple to="/movimientostradicional" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="app_registration" size="xs" /></q-item-section>
        <q-item-section>Mov. Tradicional</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver boletas')" clickable v-ripple to="/movimientostpagos" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="credit_score" size="xs" /></q-item-section>
        <q-item-section>Mov. Pagos</q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item icon="shopping_cart" label="Punto de Venta" class="q-mx-md menu-item" header-class="text-weight-bold">
      <q-item v-if="authStore.can('ventas joyeria')" clickable v-ripple to="/ventajoyeria" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="diamond" size="xs" /></q-item-section>
        <q-item-section>Compra/Venta de Joyería</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ventas electronicos')" clickable v-ripple to="/ventaelectronicos" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="radio" size="xs" /></q-item-section>
        <q-item-section>Ventas Electrónicos</q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item icon="assessment" label="Caja y Reportes" class="q-mx-md menu-item" header-class="text-weight-bold">
      <q-item v-if="authStore.can('cierre diario')" clickable v-ripple to="/operaciones/cierre" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="lock_clock" size="xs" /></q-item-section>
        <q-item-section>Cierre Diario</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('reportes cartera')" clickable v-ripple to="/reportes/cartera" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="analytics" size="xs" /></q-item-section>
        <q-item-section>Cartera</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('reportes flujo caja')" clickable v-ripple to="/reportes/flujocaja" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="account_balance_wallet" size="xs" /></q-item-section>
        <q-item-section>Flujo de Caja</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('reportes boletas vencidas')" clickable v-ripple to="/reportes/boletas-vencidas" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="warning" size="xs" /></q-item-section>
        <q-item-section>Boletas Vencidas</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('reportes ventas')" clickable v-ripple to="/reportes/ventas" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="point_of_sale" size="xs" /></q-item-section>
        <q-item-section>Ventas Detallado</q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item icon="settings" label="Administración" class="q-mx-md menu-item" header-class="text-weight-bold">
      <q-item v-if="authStore.can('configurar catalogos joyeria')" clickable v-ripple to="/config/conceptosjoyeria" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="inventory" size="xs" /></q-item-section>
        <q-item-section>Conceptos Joyería</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('configurar cotizacion oro')" clickable v-ripple to="/config/cotizacionoro" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="diamond" size="xs" /></q-item-section>
        <q-item-section>Cotización ORO</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('configurar parametros')" clickable v-ripple to="/config/parametros" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="settings_suggest" size="xs" /></q-item-section>
        <q-item-section>Parámetros</q-item-section>
      </q-item>
      <q-separator inset class="q-my-sm" />
      <q-item v-if="authStore.can('ver usuarios')" clickable v-ripple to="/users" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="manage_accounts" size="xs" /></q-item-section>
        <q-item-section>Usuarios</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver roles')" clickable v-ripple to="/roles" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="lock" size="xs" /></q-item-section>
        <q-item-section>Roles y Permisos</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver logs')" clickable v-ripple to="/logs" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="verified_user" size="xs" /></q-item-section>
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
      margin-bottom: 6px;
      transition: all 0.3s ease;

      /* Al pasar el mouse por un módulo principal */
      &:hover { background-color: rgba($primary, 0.05); }
    }

    .q-expansion-item__container {
      border-radius: 8px;
    }

    /* Modulo Principal Activo (Panel Principal) */
    .menu-item-active {
      background: linear-gradient(90deg, rgba($primary, 0.15) 0%, rgba($primary, 0.05) 100%);
      color: $primary;
      border-left: 5px solid $primary;
      font-weight: 700;
      box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    }

    /* Sub-menús (Las opciones dentro de los desplegables) */
    .submenu-item {
      border-radius: 6px;
      margin: 2px 10px 4px 10px; /* Margen para anidarlos visualmente */
      padding-left: 10px;
      color: $grey-8;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: rgba($primary, 0.08);
        color: $primary;
        transform: translateX(3px); /* Pequeña animación a la derecha */
      }
    }

    /* El Sub-menú Activo (Para que contraste fuertemente dónde estás) */
    .submenu-item-active {
      background-color: $primary !important;
      color: white !important;
      font-weight: 600;
      box-shadow: 0 4px 10px rgba($primary, 0.3);
      transform: scale(1.02);
      
      /* Aseguramos que los íconos también sean blancos */
      .q-icon {
        color: white !important;
      }
    }
  }
</style>
