export const routePaths = {
  public: {
    home: '/',
    catalog: '/catalogo',
    productDetail: '/productos/:productId',
    contactHelp: '/contacto-ayuda',
  },
  account: {
    login: '/login',
    register: '/crear-cuenta',
    profile: '/cuenta/perfil',
    orders: '/cuenta/pedidos',
    orderDetail: '/cuenta/pedidos/:orderId',
  },
  checkout: {
    cart: '/carrito',
    summary: '/checkout',
    confirmation: '/pedido-confirmado',
    confirmationDetail: '/pedido-confirmado/:orderId',
  },
  backOffice: {
    dashboard: '/interno',
    products: '/interno/productos',
    categories: '/interno/categorias',
    inventory: '/interno/inventario',
    orders: '/interno/pedidos',
    orderDetail: '/interno/pedidos/:orderId',
  },
  admin: {
    internalUsers: '/admin/usuarios',
    rolesPermissions: '/admin/roles-permisos',
    businessMetrics: '/admin/metricas',
    basicSettings: '/admin/configuracion',
  },
  support: {
    unauthorized: '/no-autorizado',
    loadingStates: '/soporte/cargando',
    emptyStates: '/soporte/vacio',
    feedbackMessages: '/soporte/mensajes',
  },
}
