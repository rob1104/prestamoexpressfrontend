const routes = [
  { path: '/login', component: () => import('pages/LoginPage.vue'), meta: { guestOnly: true } },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), meta: { requiresAuth: true} },
      { path: 'users', component: () => import('pages/Usuarios/UsuariosPage.vue'), meta: { requiresAuth: true, permission: 'ver usuarios'} },
      { path: 'roles', component: () => import('pages/Usuarios/RolesPage.vue'), meta: { requiresAuth: true, permission: 'ver roles'} },
      { path: 'logs', component: () => import('pages/ActivityLogs/ActivityLogsPage.vue'), meta: { requiresAuth: true, permission: 'ver logs'} },
      { path: 'clientes', component: () => import('pages/Clientes/ClientesPage.vue'), meta: { requiresAuth: true, permission: 'ver clientes'} },
      { path: 'boletastradicional', component: () => import('pages/Boletas/TradicionalPage.vue'), meta: { requiresAuth: true, permission: 'crear boletas'} },
      { path: 'boletaspagos', component: () => import('pages/Boletas/PagosPage.vue'), meta: { requiresAuth: true, permission: 'crear boletas'} },
      { path: 'movimientostradicional', component: () => import('pages/Boletas/MovimientosPage.vue'), meta: { requiresAuth: true, permission: 'ver boletas'} },
      { path: 'config', children: [
        { path: 'cotizacionoro', component: () => import('pages/Cotizaciones/OroPage.vue'), meta: { requiresAuth: true, permission: 'configurar cotizacion oro'} },
        { path: 'parametros', component: () => import('pages/Cotizaciones/ParametrosPage.vue'), meta: { requiresAuth: true, permission: 'configurar parametros'} },
      ]}
    ]
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('pages/Error403.vue')

  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
