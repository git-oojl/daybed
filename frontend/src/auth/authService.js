import { apiClient, apiRequest } from "../services/apiClient.js";
import { apiEndpoints } from "../services/apiEndpoints.js";

export async function loginWithEmail({ email, password }) {
  return apiRequest({
    method: "post",
    url: apiEndpoints.auth.login,
    data: { email, password },
  });
}

export async function registerCustomer(payload) {
  return apiRequest({
    method: "post",
    url: apiEndpoints.accounts.register,
    data: payload,
  });
}

export async function logoutRefreshToken(refresh) {
  if (!refresh) return;
  await apiClient.post(apiEndpoints.auth.logout, { refresh });
}

export async function getCurrentUser() {
  return apiRequest({
    method: "get",
    url: apiEndpoints.accounts.me,
  });
}
