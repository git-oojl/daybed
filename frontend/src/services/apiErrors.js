export const API_ERROR_KINDS = Object.freeze({
  AUTH_EXPIRED: "auth_expired",
  AUTH_INVALID: "auth_invalid",
  PERMISSION_DENIED: "permission_denied",
  NOT_FOUND: "not_found",
  VALIDATION: "validation",
  EXTERNAL_SERVICE: "external_service",
  NETWORK: "network",
  CANCELLED: "cancelled",
  PREVIEW_UNSUPPORTED: "preview_unsupported",
  UNEXPECTED: "unexpected",
});

export class ApiError extends Error {
  constructor(
    message,
    {
      status,
      data,
      fieldErrors,
      kind = API_ERROR_KINDS.UNEXPECTED,
      retryable = false,
      feature = null,
      cause = null,
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status ?? null;
    this.data = data ?? null;
    this.fieldErrors = fieldErrors ?? {};
    this.kind = kind;
    this.retryable = retryable;
    this.feature = feature;
    this.cause = cause;
  }
}

function firstStringValue(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return firstStringValue(value[0]);
  if (value && typeof value === "object") {
    return firstStringValue(Object.values(value)[0]);
  }
  return null;
}

export function getApiErrorMessage(data, fallback = "Ocurrió un error inesperado.") {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.user_message) return firstStringValue(data.user_message) ?? fallback;
  if (data.detail) return firstStringValue(data.detail) ?? fallback;
  if (data.non_field_errors) {
    return firstStringValue(data.non_field_errors) ?? fallback;
  }
  return firstStringValue(data) ?? fallback;
}

function requestPath(error) {
  return String(error?.config?.url || "");
}

function isDeliveryRequest(error) {
  return requestPath(error).includes("/delivery/");
}

function isKnownJwtMessage(data) {
  const raw = JSON.stringify(data || {}).toLowerCase();
  return (
    raw.includes("token_not_valid") ||
    raw.includes("token is invalid") ||
    raw.includes("token dado no es válido") ||
    raw.includes("token no válido") ||
    raw.includes("given token not valid")
  );
}

function normalizedFieldErrors(data) {
  return data && typeof data === "object" && !Array.isArray(data) ? data : {};
}

export function normalizeApiError(error, overrides = {}) {
  if (error instanceof ApiError) return error;

  if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
    return new ApiError("La solicitud fue cancelada.", {
      kind: API_ERROR_KINDS.CANCELLED,
      cause: error,
      ...overrides,
    });
  }

  const response = error?.response;
  if (!response) {
    return new ApiError(
      "No pudimos conectar con Daybed. Revisa tu conexión y vuelve a intentarlo.",
      {
        kind: API_ERROR_KINDS.NETWORK,
        retryable: true,
        data: error,
        cause: error,
        ...overrides,
      },
    );
  }

  const { status, data } = response;
  const declaredCode = data?.code || data?.error_code;
  const feature = data?.feature || (isDeliveryRequest(error) ? "delivery" : null);

  if (declaredCode === "routing_service_unavailable" || declaredCode === "geocoding_service_unavailable") {
    return new ApiError(
      data?.user_message ||
        "La verificación de entrega no está disponible por el momento. Tu sesión y carrito siguen intactos.",
      {
        status,
        data,
        fieldErrors: normalizedFieldErrors(data),
        kind: API_ERROR_KINDS.EXTERNAL_SERVICE,
        retryable: true,
        feature,
        cause: error,
        ...overrides,
      },
    );
  }

  if (status === 401) {
    const invalid = isKnownJwtMessage(data);
    return new ApiError(
      invalid
        ? "Tu sesión venció. Inicia sesión nuevamente para continuar."
        : "Necesitas iniciar sesión para continuar.",
      {
        status,
        data,
        fieldErrors: normalizedFieldErrors(data),
        kind: invalid ? API_ERROR_KINDS.AUTH_EXPIRED : API_ERROR_KINDS.AUTH_INVALID,
        retryable: false,
        cause: error,
        ...overrides,
      },
    );
  }

  if (status === 403) {
    return new ApiError("Tu cuenta no tiene permiso para realizar esta acción.", {
      status,
      data,
      fieldErrors: normalizedFieldErrors(data),
      kind: API_ERROR_KINDS.PERMISSION_DENIED,
      cause: error,
      ...overrides,
    });
  }

  if (status === 404) {
    if (isDeliveryRequest(error)) {
      return new ApiError(
        data?.user_message ||
          "No encontramos una coincidencia clara para esa dirección. Revisa los datos o elige otra sugerencia.",
        {
          status,
          data,
          fieldErrors: normalizedFieldErrors(data),
          kind: API_ERROR_KINDS.VALIDATION,
          feature: "delivery",
          cause: error,
          ...overrides,
        },
      );
    }
    return new ApiError("El contenido que buscas ya no está disponible.", {
      status,
      data,
      fieldErrors: normalizedFieldErrors(data),
      kind: API_ERROR_KINDS.NOT_FOUND,
      cause: error,
      ...overrides,
    });
  }

  if (isDeliveryRequest(error) && status >= 500) {
    return new ApiError(
      data?.user_message ||
        "No pudimos calcular la ruta de entrega. Puedes conservar la dirección y volver a intentarlo.",
      {
        status,
        data,
        fieldErrors: normalizedFieldErrors(data),
        kind: API_ERROR_KINDS.EXTERNAL_SERVICE,
        retryable: true,
        feature: "delivery",
        cause: error,
        ...overrides,
      },
    );
  }

  if ([400, 409, 422].includes(status)) {
    return new ApiError(getApiErrorMessage(data, "Revisa los datos indicados."), {
      status,
      data,
      fieldErrors: normalizedFieldErrors(data),
      kind: API_ERROR_KINDS.VALIDATION,
      cause: error,
      ...overrides,
    });
  }

  return new ApiError(
    status >= 500
      ? "Daybed tuvo un problema inesperado. Tus datos no se perdieron; vuelve a intentarlo en un momento."
      : getApiErrorMessage(data),
    {
      status,
      data,
      fieldErrors: normalizedFieldErrors(data),
      kind: API_ERROR_KINDS.UNEXPECTED,
      retryable: status >= 500,
      cause: error,
      ...overrides,
    },
  );
}

export function createPreviewUnsupportedError(method = "get") {
  const readOnly = ["get", "head", "options"].includes(String(method).toLowerCase());
  return new ApiError(
    readOnly
      ? "Esta vista todavía no tiene datos de preview preparados."
      : "Esta acción no se guarda en la base real mientras usas preview.",
    { kind: API_ERROR_KINDS.PREVIEW_UNSUPPORTED },
  );
}
