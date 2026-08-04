import { productImage } from "../services/viewMappers.js";

export const ORDER_STATUSES = [
  { value: "pending", label: "Recibido", tone: "amber" },
  { value: "confirmed", label: "Pago confirmado", tone: "green" },
  { value: "preparing", label: "En preparación", tone: "violet" },
  { value: "shipped", label: "En camino", tone: "blue" },
  { value: "delivered", label: "Entregado", tone: "green" },
  { value: "cancelled", label: "Cancelado", tone: "red" },
];

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

export function orderNumber(id) {
  return `DAY-${String(id || 0).padStart(5, "0")}`;
}

export function normalizeOrder(raw = {}) {
  const items = Array.isArray(raw.items) ? raw.items.map((item) => {
    const snapshot = item.product_snapshot || {};
    return {
      ...item,
      productId: item.product || snapshot.id,
      name: item.product_name || snapshot.name || "Producto Daybed",
      sku: item.product_sku || snapshot.sku || "Sin SKU",
      description: snapshot.description || "Pieza seleccionada para este pedido.",
      quantity: Number(item.quantity || 1),
      unitPrice: Number(item.unit_price || 0),
      lineTotal: Number(item.line_total || Number(item.unit_price || 0) * Number(item.quantity || 1)),
      image: productImage({ ...snapshot, ...item, name: item.product_name || snapshot.name }),
    };
  }) : [];

  return {
    ...raw,
    id: raw.id,
    number: orderNumber(raw.id),
    customerName: raw.customer_name || "Cliente Daybed",
    customerEmail: raw.customer_email || "Sin correo disponible",
    customerPhone: raw.customer_phone || "Sin teléfono disponible",
    statusInfo: orderStatus(raw.status),
    items,
    address: raw.formatted_address || raw.original_address || "Dirección por confirmar",
    subtotal: Number(raw.products_subtotal || 0),
    deliveryFee: Number(raw.delivery_fee || 0),
    total: Number(raw.total || 0),
  };
}
