import assert from "node:assert/strict";
import test from "node:test";

import { API_ERROR_KINDS, normalizeApiError } from "../src/services/apiErrors.js";

test("classifies routing failures without treating them as authentication errors", () => {
  const error = normalizeApiError({
    config: { url: "/delivery/estimate/" },
    response: {
      status: 503,
      data: {
        code: "routing_service_unavailable",
        feature: "delivery",
        user_message: "No pudimos calcular la entrega.",
      },
    },
  });

  assert.equal(error.kind, API_ERROR_KINDS.EXTERNAL_SERVICE);
  assert.equal(error.feature, "delivery");
  assert.equal(error.retryable, true);
});

test("classifies invalid JWT responses as an expired session", () => {
  const error = normalizeApiError({
    config: { url: "/accounts/me/" },
    response: {
      status: 401,
      data: { code: "token_not_valid", detail: "El token dado no es válido para ningún tipo de token" },
    },
  });

  assert.equal(error.kind, API_ERROR_KINDS.AUTH_EXPIRED);
  assert.match(error.message, /sesión venció/i);
});

test("keeps ordinary validation errors local to their feature", () => {
  const error = normalizeApiError({
    config: { url: "/orders/checkout/" },
    response: { status: 400, data: { cart: ["Una pieza ya no está disponible."] } },
  });

  assert.equal(error.kind, API_ERROR_KINDS.VALIDATION);
  assert.equal(error.fieldErrors.cart[0], "Una pieza ya no está disponible.");
});
