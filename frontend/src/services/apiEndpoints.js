export const apiEndpoints = {
  health: "/health/",
  auth: {
    login: "/auth/token/",
    refresh: "/auth/token/refresh/",
    logout: "/auth/logout/",
  },
  accounts: {
    register: "/accounts/register/",
    me: "/accounts/me/",
    users: "/accounts/users/",
    userDetail: (id) => `/accounts/users/${id}/`,
  },
  catalog: {
    categories: "/catalog/categories/",
    categoryDetail: (slug) => `/catalog/categories/${slug}/`,
    products: "/catalog/products/",
    productDetail: (id) => `/catalog/products/${id}/`,
    manageCategories: "/catalog/manage/categories/",
    manageCategoryDetail: (slug) => `/catalog/manage/categories/${slug}/`,
    manageProducts: "/catalog/manage/products/",
    manageProductDetail: (id) => `/catalog/manage/products/${id}/`,
  },
  cart: {
    detail: "/cart/",
    items: "/cart/items/",
    itemDetail: (id) => `/cart/items/${id}/`,
  },
  delivery: {
    geocode: "/delivery/geocode/",
    estimate: "/delivery/estimate/",
  },
  orders: {
    checkout: "/checkout/",
    list: "/orders/",
    detail: (id) => `/orders/${id}/`,
    manageList: "/manage/orders/",
    manageDetail: (id) => `/manage/orders/${id}/`,
  },
  inventory: {
    products: "/inventory/products/",
    lowStock: "/inventory/low-stock/",
    productStock: (id) => `/inventory/products/${id}/stock/`,
    movements: "/inventory/movements/",
  },
  dashboard: {
    metrics: "/dashboard/metrics/",
  },
};
