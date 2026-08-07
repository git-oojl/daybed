import { productImage } from "../services/viewMappers.js";

export const ORDER_STATUSES = [
  { value: "pending", label: "Pedido recibido", shortLabel: "Recibido", tone: "amber" },
  { value: "confirmed", label: "Pago confirmado", shortLabel: "Confirmado", tone: "green" },
  { value: "preparing", label: "Preparando tu pedido", shortLabel: "En preparación", tone: "violet" },
  { value: "shipped", label: "En camino", shortLabel: "En camino", tone: "blue" },
  { value: "delivered", label: "Entregado", shortLabel: "Entregado", tone: "green" },
  { value: "cancelled", label: "Pedido cancelado", shortLabel: "Cancelado", tone: "red" },
];

export const ORDER_PROGRESS_STEPS = ORDER_STATUSES.filter((item) => item.value !== "cancelled");

export const paymentMethodLabel = (method) => ({
  card: "Tarjeta",
  transfer: "Transferencia bancaria",
  cash: "Pago contra entrega",
}[method] || "Por confirmar");

export const paymentStatusLabel = (status) => ({
  authorized: "Pago confirmado",
  awaiting_transfer: "Transferencia pendiente",
  pay_on_delivery: "Cobro al entregar",
  failed: "Pago no aprobado",
}[status] || "Por confirmar");

export function orderStatus(status) {
  return ORDER_STATUSES.find((item) => item.value === status) || ORDER_STATUSES[0];
}

export function formatMoney(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatOrderDate(value, includeTime = false) {
  if (!value) return "Fecha por confirmar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

export function orderNumber(id, code) {
  if (code) return String(code).replace(/^PEDIDO\s+/i, "");
  return `DAY-${String(id || 0).padStart(5, "0")}`;
}

function normalizeOptions(item, snapshot) {
  const options = item.selected_options || snapshot.selected_options || snapshot.options || {};
  if (Array.isArray(options)) return options;
  return Object.entries(options).map(([label, value]) => ({ label, value }));
}

export function normalizeOrder(raw = {}) {
  const items = Array.isArray(raw.items) ? raw.items.map((item) => {
    const snapshot = item.product_snapshot || {};
    const quantity = Number(item.quantity || 1);
    const unitPrice = Number(item.unit_price || item.price || 0);
    return {
      ...item,
      productId: item.product || snapshot.id,
      name: item.product_name || snapshot.name || "Producto de la tienda",
      sku: item.product_sku || snapshot.sku || "Sin SKU",
      description: snapshot.description || item.description || "Pieza seleccionada para este pedido.",
      options: normalizeOptions(item, snapshot),
      quantity,
      unitPrice,
      lineTotal: Number(item.line_total || unitPrice * quantity),
      image: productImage({ ...snapshot, ...item, name: item.product_name || snapshot.name }),
    };
  }) : [];

  const subtotal = Number(raw.products_subtotal ?? raw.subtotal ?? items.reduce((sum, item) => sum + item.lineTotal, 0));
  const deliveryFee = Number(raw.delivery_fee ?? raw.shipping ?? 0);
  const discountTotal = Number(raw.discount_total ?? raw.discount ?? 0);
  const latitude = raw.latitude == null || raw.latitude === "" ? null : Number(raw.latitude);
  const longitude = raw.longitude == null || raw.longitude === "" ? null : Number(raw.longitude);

  return {
    ...raw,
    id: raw.id,
    number: orderNumber(raw.id, raw.order_code),
    label: `PEDIDO ${orderNumber(raw.id, raw.order_code)}`,
    customerName: raw.customer_name || "Cliente",
    customerEmail: raw.customer_email || "Sin correo disponible",
    customerPhone: raw.customer_phone || "Sin teléfono disponible",
    status: raw.status || "pending",
    statusInfo: orderStatus(raw.status),
    availableTransitions: Array.isArray(raw.available_status_transitions)
      ? raw.available_status_transitions
      : [],
    statusHistory: Array.isArray(raw.status_history) ? raw.status_history : [],
    items,
    address: raw.formatted_address || raw.original_address || raw.delivery_address || "Dirección por confirmar",
    originalAddress: raw.original_address || "",
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    subtotal,
    deliveryFee,
    discountTotal,
    total: Number(raw.total ?? subtotal + deliveryFee - discountTotal),
    distanceKm: raw.distance_km == null ? null : Number(raw.distance_km),
    durationMinutes: raw.estimated_duration_minutes == null ? null : Number(raw.estimated_duration_minutes),
    deliveryZone: raw.delivery_zone || "standard",
    deliveryNotes: raw.delivery_notes || "",
    internalNotes: raw.internal_notes || "",
    cancellationDeadline: raw.cancellation_deadline || null,
    customerCancellationAvailable: Boolean(raw.customer_cancellation_available),
    preparationEstimateDays: Number(raw.preparation_estimate_days || 0),
  };
}

export function progressIndexFor(status) {
  return ORDER_PROGRESS_STEPS.findIndex((step) => step.value === status);
}

export function canTransition(order, status) {
  return Boolean(status && order?.availableTransitions?.includes(status));
}
