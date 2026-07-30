const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80";

export function readCollection(response) {
  return Array.isArray(response) ? response : response?.results ?? [];
}

export function productImage(product) {
  const firstImage = product?.images?.[0];
  if (typeof firstImage === "string") return firstImage;
  return product?.main_image || product?.image || FALLBACK_PRODUCT_IMAGE;
}

export function productCategoryName(product) {
  return (
    product?.category_detail?.name ||
    product?.category?.name ||
    (typeof product?.category === "string" ? product.category : "Sin categoría")
  );
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function statusLabel(status) {
  return {
    pending: "Pendiente",
    confirmed: "Confirmado",
    preparing: "En preparación",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  }[status] || status;
}
