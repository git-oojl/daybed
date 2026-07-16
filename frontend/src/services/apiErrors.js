export class ApiError extends Error {
  constructor(message, { status, data, fieldErrors } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status ?? null;
    this.data = data ?? null;
    this.fieldErrors = fieldErrors ?? {};
  }
}

function firstStringValue(value) {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return firstStringValue(value[0]);
  }
  if (value && typeof value === "object") {
    return firstStringValue(Object.values(value)[0]);
  }
  return null;
}

export function getApiErrorMessage(
  data,
  fallback = "Ocurrió un error inesperado.",
) {
  if (!data) {
    return fallback;
  }
  if (typeof data === "string") {
    return data;
  }
  if (data.detail) {
    return firstStringValue(data.detail) ?? fallback;
  }
  if (data.non_field_errors) {
    return firstStringValue(data.non_field_errors) ?? fallback;
  }

  return firstStringValue(data) ?? fallback;
}

export function normalizeApiError(error) {
  const response = error?.response;
  if (!response) {
    return new ApiError("No se pudo conectar con el servidor.", {
      data: error,
    });
  }

  return new ApiError(getApiErrorMessage(response.data), {
    status: response.status,
    data: response.data,
    fieldErrors:
      response.data && typeof response.data === "object" ? response.data : {},
  });
}
