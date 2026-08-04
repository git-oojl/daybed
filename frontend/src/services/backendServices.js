import { apiRequest } from "./apiClient.js";
import { apiEndpoints } from "./apiEndpoints.js";

function get(url, params) {
  return apiRequest({ method: "get", url, params });
}

function post(url, data) {
  return apiRequest({ method: "post", url, data });
}

function patch(url, data) {
  return apiRequest({ method: "patch", url, data });
}

function remove(url) {
  return apiRequest({ method: "delete", url });
}

export const accountService = {
  me: () => get(apiEndpoints.accounts.me),
  updateMe: (data) => patch(apiEndpoints.accounts.me, data),
  changePassword: (data) => post(apiEndpoints.accounts.passwordChange, data),
  requestPasswordReset: (data) => post(apiEndpoints.accounts.passwordReset, data),
  confirmPasswordReset: (data) =>
    post(apiEndpoints.accounts.passwordResetConfirm, data),
  users: (params) => get(apiEndpoints.accounts.users, params),
  createUser: (data) => post(apiEndpoints.accounts.users, data),
  updateUser: (id, data) => patch(apiEndpoints.accounts.userDetail(id), data),
};

export const accessService = {
  roles: () => get(apiEndpoints.access.roles),
  updateEmployeeRole: (permissionCodes) =>
    patch(apiEndpoints.access.employeeRole, {
      permission_codes: permissionCodes,
    }),
};

export const catalogService = {
  categories: (params) => get(apiEndpoints.catalog.categories, params),
  category: (slug) => get(apiEndpoints.catalog.categoryDetail(slug)),
  products: (params) => get(apiEndpoints.catalog.products, params),
  product: (id) => get(apiEndpoints.catalog.productDetail(id)),
  reviews: (id) => get(apiEndpoints.catalog.productReviews(id)),
  createReview: (id, data) => post(apiEndpoints.catalog.productReviews(id), data),
  manageCategories: (params) =>
    get(apiEndpoints.catalog.manageCategories, params),
  createCategory: (data) => post(apiEndpoints.catalog.manageCategories, data),
  updateCategory: (slug, data) =>
    patch(apiEndpoints.catalog.manageCategoryDetail(slug), data),
  deactivateCategory: (slug) =>
    remove(apiEndpoints.catalog.manageCategoryDetail(slug)),
  manageProducts: (params) => get(apiEndpoints.catalog.manageProducts, params),
  createProduct: (data) => post(apiEndpoints.catalog.manageProducts, data),
  updateProduct: (id, data) =>
    patch(apiEndpoints.catalog.manageProductDetail(id), data),
  deactivateProduct: (id) =>
    remove(apiEndpoints.catalog.manageProductDetail(id)),
};

export const cartService = {
  get: () => get(apiEndpoints.cart.detail),
  clear: () => remove(apiEndpoints.cart.detail),
  items: () => get(apiEndpoints.cart.items),
  addItem: (data) => post(apiEndpoints.cart.items, data),
  updateItem: (id, data) => patch(apiEndpoints.cart.itemDetail(id), data),
  removeItem: (id) => remove(apiEndpoints.cart.itemDetail(id)),
};

export const deliveryService = {
  geocode: (data) => post(apiEndpoints.delivery.geocode, data),
  estimate: (data) => post(apiEndpoints.delivery.estimate, data),
};

export const storeService = {
  settings: () => get(apiEndpoints.store.settings),
  updateSettings: (data) => patch(apiEndpoints.store.settings, data),
};

export const orderService = {
  checkout: (data) => post(apiEndpoints.orders.checkout, data),
  list: (params) => get(apiEndpoints.orders.list, params),
  detail: (id) => get(apiEndpoints.orders.detail(id)),
  manageList: (params) => get(apiEndpoints.orders.manageList, params),
  manageDetail: (id) => get(apiEndpoints.orders.manageDetail(id)),
  updateStatus: (id, status) =>
    patch(apiEndpoints.orders.manageDetail(id), { status }),
  updatePaymentStatus: (id, paymentStatus) =>
    patch(apiEndpoints.orders.manageDetail(id), { payment_status: paymentStatus }),
};

export const inventoryService = {
  products: (params) => get(apiEndpoints.inventory.products, params),
  lowStock: (params) => get(apiEndpoints.inventory.lowStock, params),
  updateStock: (id, data) =>
    patch(apiEndpoints.inventory.productStock(id), data),
  movements: (params) => get(apiEndpoints.inventory.movements, params),
};

export const dashboardService = {
  metrics: (params) => get(apiEndpoints.dashboard.metrics, params),
};
