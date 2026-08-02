const routes = [
  { path: '/login', component: () => import('pages/LoginPage.vue'), meta: { guestOnly: true } },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), meta: { requiresAuth: true } },
      { path: 'users', component: () => import('pages/Usuarios/UsuariosPage.vue'), meta: { requiresAuth: true, permission: 'ver usuarios' } },
      { path: 'roles', component: () => import('pages/Usuarios/RolesPage.vue'), meta: { requiresAuth: true, permission: 'ver roles' } },
      { path: 'logs', component: () => import('pages/ActivityLogs/ActivityLogsPage.vue'), meta: { requiresAuth: true, permission: 'ver logs' } },
      
      { path: 'clientes', component: () => import('pages/Clientes/ClientesPage.vue'), meta: { requiresAuth: true, permission: 'ver clientes' } },
      { path: 'clienteshistorial/:id?', component: () => import('pages/Clientes/HistorialClientePage.vue'), meta: { requiresAuth: true, permission: 'ver clientes' } },
      
      { path: 'boletas', component: () => import('pages/Boletas/GestionBoletas.vue'), meta: { requiresAuth: true, permission: 'ver boletas' } },
      { path: 'boletastradicional', component: () => import('pages/Boletas/TradicionalPage.vue'), meta: { requiresAuth: true, permission: 'crear boletas' } },
      { path: 'boletaspagos', component: () => import('pages/Boletas/PagosPage.vue'), meta: { requiresAuth: true, permission: 'crear boletas' } },
      { path: 'movimientostradicional', component: () => import('pages/Boletas/MovimientosPage.vue'), meta: { requiresAuth: true, permission: 'ver boletas' } },
      { path: 'movimientostpagos', component: () => import('pages/Boletas/MovimientosPagosPage.vue'), meta: { requiresAuth: true, permission: 'ver boletas' } },
      
      { path: 'ventasjoyeria', component: () => import('pages/Ventas/VentasJoyeriaPage.vue'), meta: { requiresAuth: true, permission: 'ventas joyeria' } },
      { path: 'comprasjoyeria', component: () => import('pages/Ventas/ComprasJoyeriaPage.vue'), meta: { requiresAuth: true, permission: 'ventas joyeria' } },
      { path: 'ventaselectronicos', component: () => import('pages/Ventas/VentasElectronicosPage.vue'), meta: { requiresAuth: true, permission: 'ventas electronicos' } },
      
      { path: 'operacionescierre', component: () => import('pages/Cierre/ProcesarCierrePage.vue'), meta: { requiresAuth: true, permission: 'cierre diario' } },
      
      { path: 'cajahistorial', component: () => import('pages/Caja/HistorialMovimientosPage.vue'), meta: { requiresAuth: true, permission: 'ver caja' } },
      
      { path: 'configcotizacionoro', component: () => import('pages/Cotizaciones/OroPage.vue'), meta: { requiresAuth: true, permission: 'configurar cotizacion oro' } },
      { path: 'configparametros', component: () => import('pages/Cotizaciones/ParametrosPage.vue'), meta: { requiresAuth: true, permission: 'configurar parametros' } },
      { path: 'configconceptosjoyeria', component: () => import('pages/Catalogos/CatalogosJoyeriaPage.vue'), meta: { requiresAuth: true, permission: 'configurar catalogos joyeria' } },
      
      { path: 'adminbasedatos', component: () => import('pages/Administracion/DatabaseAdminPage.vue'), meta: { requiresAuth: true, permission: 'database.backup' } },
      { path: 'adminconceptosflujo', component: () => import('pages/Administracion/ConceptosFlujoPage.vue'), meta: { requiresAuth: true } },
      
      { path: 'perfil', component: () => import('pages/MiPerfilPage.vue'), meta: { requiresAuth: true } },

      { path: 'reportescartera', component: () => import('pages/Reportes/ReporteCarteraPage.vue'), meta: { requiresAuth: true, permission: 'ver reportes' } },
      { path: 'reportesflujocaja', component: () => import('pages/Reportes/ReporteFlujoCajaPage.vue'), meta: { requiresAuth: true, permission: 'ver reportes' } },
      { path: 'reportesboletasdiarias', component: () => import('pages/Reportes/ReporteBoletasDiariasPage.vue'), meta: { requiresAuth: true, permission: 'ver reportes' } },
      { path: 'reportespagosdeposito', component: () => import('pages/Reportes/ReportePagosDepositoPage.vue'), meta: { requiresAuth: true, permission: 'ver reportes' } },
      { path: 'reportesrefrendos', component: () => import('pages/Reportes/ReporteRefrendosPage.vue'), meta: { requiresAuth: true, permission: 'ver reportes' } },
      { path: 'reportesboletasvencidas', component: () => import('pages/Reportes/ReporteBoletasVencidasPage.vue'), meta: { requiresAuth: true, permission: 'ver reportes' } },
      { path: 'reportesventas', component: () => import('pages/Reportes/ReporteVentasPage.vue'), meta: { requiresAuth: true, permission: 'ver reportes' } },
      { path: 'reportescompras', component: () => import('pages/Reportes/ReporteComprasPage.vue'), meta: { requiresAuth: true, permission: 'ver reportes' } },
      { path: 'reportescierrediario', component: () => import('pages/Reportes/CierreDiarioReportePage.vue'), meta: { requiresAuth: true, permission: 'ver reportes' } },
      { path: 'reportesdetallesmovimientos', component: () => import('pages/Reportes/ReporteDetallesMovimientosPage.vue'), meta: { requiresAuth: true, permission: 'ver reportes' } },
    ]
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('pages/Error403.vue')
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
