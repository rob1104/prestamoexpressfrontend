<template>
  <q-list padding class="menu-principal-list">

    <q-item clickable v-ripple to="/" active-class="menu-item-active" exact class="menu-item q-mx-md q-mb-sm">
      <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
      <q-item-section class="text-weight-bold">Panel Principal</q-item-section>
    </q-item>

    <q-expansion-item
      icon="group"
      label="Clientes"
      class="q-mx-md menu-item"
      header-class="text-weight-bold"
      :default-opened="isOpened(['/clientes', '/clienteshistorial'])"
    >
      <q-item v-if="authStore.can('ver clientes')" clickable v-ripple to="/clientes" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="contact_page" size="xs" /></q-item-section>
        <q-item-section>Gestión</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver clientes')" clickable v-ripple to="/clienteshistorial" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="history" size="xs" /></q-item-section>
        <q-item-section>Historial</q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item
      icon="local_activity"
      label="Empeños"
      class="q-mx-md menu-item"
      header-class="text-weight-bold"
      :default-opened="isOpened(['/boletas', '/boletastradicional', '/boletaspagos', '/movimientostradicional', '/movimientostpagos'])"
    >
      <q-item-label header class="text-caption text-grey-7 q-pb-none">Crear Boletas</q-item-label>
      <q-item v-if="authStore.can('crear boletas')" clickable v-ripple to="/boletastradicional" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="money" size="xs" /></q-item-section>
        <q-item-section>Empeño Tradicional</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('crear boletas')" clickable v-ripple to="/boletaspagos" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="payment" size="xs" /></q-item-section>
        <q-item-section>Préstamo en Pagos</q-item-section>
      </q-item>

      <q-separator inset class="q-my-sm" />
      <q-item-label header class="text-caption text-grey-4 q-pb-none">Movimientos</q-item-label>
      <q-item v-if="authStore.can('ver boletas')" clickable v-ripple to="/movimientostradicional" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="app_registration" size="xs" /></q-item-section>
        <q-item-section>Mov. Tradicionales</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver boletas')" clickable v-ripple to="/movimientostpagos" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="credit_score" size="xs" /></q-item-section>
        <q-item-section>Mov. en Pagos</q-item-section>
      </q-item>

      <q-separator inset class="q-my-sm" />
      <q-item-label header class="text-caption text-grey-4 q-pb-none">Consultas</q-item-label>
      <q-item v-if="authStore.can('ver boletas')" clickable v-ripple to="/boletas" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="search" size="xs" /></q-item-section>
        <q-item-section>Gestión de Boletas</q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item
      icon="shopping_cart"
      label="Punto de Venta"
      class="q-mx-md menu-item"
      header-class="text-weight-bold"
      :default-opened="isOpened(['/ventasjoyeria', '/comprasjoyeria', '/ventaselectronicos'])"
    >
      <q-item v-if="authStore.can('ventas joyeria')" clickable v-ripple to="/ventasjoyeria" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="diamond" size="xs" /></q-item-section>
        <q-item-section>Ventas de Joyería</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ventas joyeria')" clickable v-ripple to="/comprasjoyeria" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="shopping_bag" size="xs" /></q-item-section>
        <q-item-section>Compras de Joyería</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ventas electronicos')" clickable v-ripple to="/ventaselectronicos" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="radio" size="xs" /></q-item-section>
        <q-item-section>Artículos Varios</q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item
      icon="point_of_sale"
      label="Caja"
      class="q-mx-md menu-item"
      header-class="text-weight-bold"
      :default-opened="isOpened(['/cajahistorial', '/operacionescierre'])"
    >
      <q-item-label header class="text-caption text-grey-7 q-pb-none">Operación Diaria</q-item-label>
      <q-item v-if="authStore.can('ver caja')" clickable v-ripple to="/cajahistorial" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="receipt_long" size="xs"  /></q-item-section>
        <q-item-section>Movimientos</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('cierre diario')" clickable v-ripple to="/operacionescierre" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="lock_clock" size="xs" /></q-item-section>
        <q-item-section>Cierre Diario</q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item
      icon="analytics"
      label="Reportes"
      class="q-mx-md menu-item"
      header-class="text-weight-bold"
      :default-opened="isOpened(['/reportescartera', '/reportesflujocaja', '/reportesboletasdiarias', '/reportesdetallesmovimientos', '/reportesboletasvencidas', '/reportesventas', '/reportescompras', '/reportescierrediario', '/reportespagosdeposito', '/reportesrefrendos'])"
    >
      <q-item-label header class="text-caption text-grey-4 q-pb-none">Operación Diaria</q-item-label>
      <q-item v-if="authStore.can('ver reportes')" clickable v-ripple to="/reportesboletasdiarias" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="receipt_long" size="xs" /></q-item-section>
        <q-item-section>Boletas Creadas</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver reportes')" clickable v-ripple to="/reportespagosdeposito" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="payments" size="xs" /></q-item-section>
        <q-item-section>Pagos Recibidos</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver reportes')" clickable v-ripple to="/reportesrefrendos" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="sync" size="xs" /></q-item-section>
        <q-item-section>Refrendos</q-item-section>
      </q-item>

      <q-separator inset class="q-my-sm" />
      <q-item-label header class="text-caption text-grey-7 q-pb-none">Caja y Flujo</q-item-label>
      <q-item v-if="authStore.can('ver reportes')" clickable v-ripple to="/reportesflujocaja" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="account_balance_wallet" size="xs" /></q-item-section>
        <q-item-section>Flujo de Caja</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver reportes')" clickable v-ripple to="/reportesdetallesmovimientos" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="list_alt" size="xs" /></q-item-section>
        <q-item-section>Detalles de Movimientos</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver reportes')" clickable v-ripple to="/reportescierrediario" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="lock_clock" size="xs" /></q-item-section>
        <q-item-section>Cierres Diarios</q-item-section>
      </q-item>

      <q-separator inset class="q-my-sm" />
      <q-item-label header class="text-caption text-grey-7 q-pb-none">Cartera y Clientes</q-item-label>
      <q-item v-if="authStore.can('ver reportes')" clickable v-ripple to="/reportescartera" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="pie_chart" size="xs" /></q-item-section>
        <q-item-section>Cartera Activa</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver reportes')" clickable v-ripple to="/reportesboletasvencidas" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="warning" size="xs" /></q-item-section>
        <q-item-section>Boletas Vencidas</q-item-section>
      </q-item>

      <q-separator inset class="q-my-sm" />
      <q-item-label header class="text-caption text-grey-7 q-pb-none">Comercial</q-item-label>
      <q-item v-if="authStore.can('ver reportes')" clickable v-ripple to="/reportesventas" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="point_of_sale" size="xs" /></q-item-section>
        <q-item-section>Ventas Detalladas</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver reportes')" clickable v-ripple to="/reportescompras" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="shopping_bag" size="xs" /></q-item-section>
        <q-item-section>Compras Detalladas</q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item
      icon="settings"
      label="Administración"
      class="q-mx-md menu-item"
      header-class="text-weight-bold"
      :default-opened="isOpened(['/adminconceptosflujo', '/configconceptosjoyeria', '/configcotizacionoro', '/configparametros', '/users', '/roles', '/logs', '/adminbasedatos'])"
    >
      <q-item-label header class="text-caption text-grey-4 q-pb-none">Catálogos</q-item-label>
      <q-item v-if="authStore.can('gestionar conceptos flujo')" clickable v-ripple to="/adminconceptosflujo" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="category" size="xs" /></q-item-section>
        <q-item-section>Conceptos de Flujo</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('gestionar catalogos joyeria')" clickable v-ripple to="/configconceptosjoyeria" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="inventory" size="xs" /></q-item-section>
        <q-item-section>Conceptos Joyería</q-item-section>
      </q-item>

      <q-separator inset class="q-my-sm" />
      <q-item-label header class="text-caption text-grey-4 q-pb-none">Operativa</q-item-label>
      <q-item v-if="authStore.can('configurar cotizacion oro')" clickable v-ripple to="/configcotizacionoro" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="diamond" size="xs" /></q-item-section>
        <q-item-section>Cotización del ORO</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('configurar parametros')" clickable v-ripple to="/configparametros" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="settings_suggest" size="xs" /></q-item-section>
        <q-item-section>Parámetros</q-item-section>
      </q-item>
      <q-separator inset class="q-my-sm" />
      <q-separator inset class="q-my-sm" />
      <q-item-label header class="text-caption text-grey-7 q-pb-none">Usuarios y Roles</q-item-label>
      <q-item v-if="authStore.can('ver usuarios')" clickable v-ripple to="/users" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="manage_accounts" size="xs" /></q-item-section>
        <q-item-section>Usuarios</q-item-section>
      </q-item>
      <q-item v-if="authStore.can('ver roles')" clickable v-ripple to="/roles" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="security" size="xs" /></q-item-section>
        <q-item-section>Roles y Permisos</q-item-section>
      </q-item>

      <q-separator inset class="q-my-sm" />
      <q-item-label header class="text-caption text-grey-7 q-pb-none">Sistema</q-item-label>
      <q-item v-if="authStore.can('ver logs')" clickable v-ripple to="/logs" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="history" size="xs" /></q-item-section>
        <q-item-section>Logs de Actividad</q-item-section>
      </q-item>

      <q-item v-if="authStore.can('database.backup')" clickable v-ripple to="/adminbasedatos" active-class="submenu-item-active" class="submenu-item">
        <q-item-section avatar><q-icon name="storage" size="xs" /></q-item-section>
        <q-item-section>Base de Datos</q-item-section>
      </q-item>
    </q-expansion-item>
  </q-list>
</template>

<script setup>
  import { useAuthStore } from 'src/stores/auth'
  import { useRoute } from 'vue-router'

  const authStore = useAuthStore()
  const route = useRoute()

  const isOpened = (paths) => {
    return paths.some(path => route.path === path || route.path.startsWith(path + '/'))
  }
</script>

<style lang="scss">
  .menu-principal-list {

    .menu-item {
      border-radius: 0 24px 24px 0;
      margin-right: 16px;
      margin-bottom: 4px;
      margin-top: 4px;
      color: white;
      transition: all 0.3s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.08);
      }
    }

    /* El menú principal Activo (Panel Principal) */
    .menu-item-active {
      background-color: rgba($primary, 0.9) !important;
      color: white !important;
      font-weight: bold;
      border-left: 4px solid white;
    }

    /* Cabeceras principales de expansión */
    .q-expansion-item {
      color: white !important;
    }

    .q-item__section--main {
      color: white !important;
    }

    .q-expansion-item__container {
      border-radius: 0 24px 24px 0;
    }

    /* Sub-menús (Las opciones dentro de los desplegables) */
    .submenu-item {
      border-radius: 12px;
      margin: 4px 12px 4px 36px;
      padding-left: 12px;
      color: #e2e8f0; /* Gris muy claro para alto contraste */
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
        transform: translateX(4px);
      }
    }

    /* El Sub-menú Activo */
    .submenu-item-active {
      background: linear-gradient(135deg, $primary 0%, scale-color($primary, $lightness: 15%) 100%) !important;
      color: white !important;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transform: scale(1.02);

      /* Aseguramos que los íconos también sean blancos */
      .q-icon {
        color: white !important;
      }
    }
  }
</style>
