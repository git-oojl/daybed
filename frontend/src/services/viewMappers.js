const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80";
const PRODUCT_IMAGE_FALLBACKS = [
  {
    keys: ["sofa", "sillon", "sillón", "daybed"],
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  },
  {
    keys: ["mesa", "comedor", "centro"],
    image:
      "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=600&q=80",
  },
  {
    keys: ["silla"],
    image:
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&q=80",
  },
  {
    keys: ["lampara", "lámpara", "iluminacion", "iluminación"],
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80",
  },
  {
    keys: ["armario", "ropero", "almacenamiento", "cajon", "cajón", "baul", "baúl"],
    image:
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&q=80",
  },
  {
    keys: ["cama", "recamara", "recámara", "habitacion", "habitación"],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80",
  },
];
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
const BACKEND_ORIGIN = (
  import.meta.env.VITE_BACKEND_ORIGIN ??
  API_BASE_URL.replace(/\/api\/?$/, "")
).replace(/\/$/, "");

export function readCollection(response) {
  return Array.isArray(response) ? response : response?.results ?? [];
}

export function assetUrl(value) {
  if (!value) return "";

  if (typeof value === "object") {
    return assetUrl(value.image || value.url || value.src || value.main_image);
  }

  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith("/")) return `${BACKEND_ORIGIN}${value}`;
  return value;
}

export function productImage(product) {
  const snapshot = product?.product_snapshot;
  const firstImage = firstUsableImage(product?.images);
  const firstSnapshotImage = firstUsableImage(snapshot?.images);
  const candidates = [
    product?.main_image,
    product?.image,
    firstImage,
    snapshot?.main_image,
    snapshot?.image,
    firstSnapshotImage,
  ];
  const image = candidates.map(assetUrl).find(Boolean);
  return image || productImageFallback(product);
}

export function productCategoryName(product) {
  return (
    product?.category_detail?.name ||
    product?.category?.name ||
    (typeof product?.category === "string" ? product.category : "Sin categoría")
  );
}

function productImageFallback(product) {
  const hint = `${product?.name || ""} ${productCategoryName(product)}`.toLowerCase();
  const fallback = PRODUCT_IMAGE_FALLBACKS.find(({ keys }) =>
    keys.some((key) => hint.includes(key)),
  );
  return fallback?.image || FALLBACK_PRODUCT_IMAGE;
}

function firstUsableImage(images) {
  if (!Array.isArray(images)) return null;
  return images.find((image) => image?.active !== false && assetUrl(image));
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
