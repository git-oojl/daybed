import { isPreviewModeActive } from "../dev-preview/previewMode.js";

const PREVIEW_PERMISSION_CODES = [
  "dashboard.view",
  "products.view",
  "products.create",
  "products.update",
  "products.deactivate",
  "inventory.view",
  "inventory.adjust",
  "inventory.movements.view",
  "orders.view",
  "orders.status.update",
];

const previewUsers = {
  customer: {
    id: "preview-customer",
    username: "preview_customer",
    email: "cliente.preview@daybed.local",
    avatar: "/preview-avatars/customer.svg",
    first_name: "Cliente",
    last_name: "Preview",
    phone: "6645550190",
    state: "Baja California",
    city: "Tijuana",
    role: "cliente",
    operational_permission_codes: null,
    effective_permission_codes: [],
  },
  employee: {
    id: "preview-employee",
    username: "preview_employee",
    email: "empleado.preview@daybed.local",
    avatar: "/preview-avatars/employee.svg",
    first_name: "Empleado",
    last_name: "Preview",
    phone: "6645550191",
    state: "Baja California",
    city: "Tijuana",
    role: "empleado",
    operational_permission_codes: null,
    effective_permission_codes: PREVIEW_PERMISSION_CODES,
  },
  admin: {
    id: "preview-admin",
    username: "preview_admin",
    email: "admin.preview@daybed.local",
    avatar: "/preview-avatars/admin.svg",
    first_name: "Admin",
    last_name: "Preview",
    phone: "6645550192",
    state: "Baja California",
    city: "Tijuana",
    role: "administrador",
    operational_permission_codes: null,
    effective_permission_codes: PREVIEW_PERMISSION_CODES,
  },
};

let categories = [
  {
    id: 1,
    name: "Sofás cama",
    slug: "sofas-cama",
    product_count: 3,
    display_order: 1,
    homepage_visible: true,
    filter_attributes: ["room", "style", "material", "is_sofa_bed"],
    active: true,
    description: "Muebles convertibles para descanso y visitas.",
    specification_schema: [
      { key: "apertura", label: "Tipo de apertura", type: "text", filterable: true },
      { key: "tapiz", label: "Tapiz", type: "text", filterable: true },
      { key: "plazas", label: "Plazas", type: "number", filterable: true },
    ],
  },
  {
    id: 2,
    name: "Mesas de centro",
    slug: "mesas-centro",
    product_count: 2,
    display_order: 2,
    homepage_visible: true,
    filter_attributes: ["room", "style", "material"],
    active: true,
    description: "Mesas para sala y convivencia.",
    specification_schema: [
      { key: "forma", label: "Forma", type: "text", filterable: true },
      { key: "cubierta", label: "Cubierta", type: "text", filterable: true },
      { key: "acabado", label: "Acabado", type: "text", filterable: true },
    ],
  },
  {
    id: 3,
    name: "Almacenamiento",
    slug: "almacenamiento",
    product_count: 2,
    display_order: 3,
    homepage_visible: true,
    filter_attributes: ["room", "material", "has_storage"],
    active: true,
    description: "Credenzas, bancos y piezas organizadoras.",
    specification_schema: [
      { key: "capacidad", label: "Capacidad", type: "text", filterable: true },
      { key: "puertas", label: "Puertas o cajones", type: "number", filterable: true },
      { key: "anclaje", label: "Tipo de anclaje", type: "text", filterable: true },
    ],
  },
  {
    id: 4,
    name: "Sillas y bancos",
    slug: "sillas-bancos",
    product_count: 1,
    display_order: 4,
    homepage_visible: true,
    filter_attributes: ["room", "style", "material"],
    active: true,
    description: "Asientos auxiliares de proporciones ligeras.",
    specification_schema: [
      { key: "tapizado", label: "Tapizado", type: "text", filterable: true },
      { key: "altura_asiento", label: "Altura del asiento", type: "number", filterable: true },
    ],
  },
  {
    id: 5,
    name: "Recámara",
    slug: "recamaras",
    product_count: 1,
    display_order: 5,
    homepage_visible: false,
    filter_attributes: ["room", "style", "material", "has_storage"],
    active: true,
    description: "Piezas serenas para una habitación bien resuelta.",
    specification_schema: [
      { key: "almacenamiento", label: "Almacenamiento", type: "boolean", filterable: true },
      { key: "montaje", label: "Montaje", type: "text", filterable: true },
    ],
  },
  {
    id: 6,
    name: "Oficina",
    slug: "oficina",
    product_count: 1,
    display_order: 6,
    homepage_visible: false,
    filter_attributes: ["room", "style", "material"],
    active: true,
    description: "Mobiliario funcional para trabajar desde casa.",
    specification_schema: [
      { key: "gestion_cables", label: "Gestión de cables", type: "boolean", filterable: true },
      { key: "carga_maxima", label: "Carga máxima", type: "number", filterable: true },
    ],
  },
];

let products = [
  productFixture({
    id: 1,
    sku: "DAY-SOFA-ROB-001",
    name: "Daybed Roble Nórdico",
    description: "Sofá cama de roble con cojines claros y líneas limpias.",
    price: "12499.00",
    category: categories[0],
    material: "Roble",
    color: "Natural",
    style: "Nórdico",
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80",
  }),
  productFixture({
    id: 2,
    sku: "DAY-SOFA-LIN-002",
    name: "Sofá Cama Lino Arena",
    description: "Daybed tapizado en lino con base baja para sala compacta.",
    price: "9799.00",
    category: categories[0],
    material: "Lino",
    color: "Arena",
    style: "Contemporáneo",
    stock: 1,
    minimum_stock: 2,
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=80",
  }),
  productFixture({
    id: 3,
    sku: "DAY-MESA-FRE-001",
    name: "Mesa Centro Fresno",
    description: "Mesa rectangular con repisa inferior y acabado mate.",
    price: "3499.00",
    category: categories[1],
    material: "Fresno",
    color: "Miel",
    style: "Moderno",
    stock: 13,
    image:
      "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=900&q=80",
  }),
  productFixture({
    id: 4,
    sku: "DAY-BANCO-NOG-001",
    name: "Banco Baúl Nogal",
    description: "Banco con almacenamiento interno para recámara o recibidor.",
    price: "5299.00",
    category: categories[2],
    material: "Nogal",
    color: "Café",
    style: "Cálido",
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=900&q=80",
  }),
  productFixture({
    id: 5,
    sku: "DAY-SOFA-ARC-003",
    name: "Sofá Cama Arcilla",
    description: "Silueta envolvente, tapizado texturizado y apertura sencilla para visitas.",
    price: "11290.00",
    category: categories[0],
    material: "Bouclé",
    color: "Arcilla",
    style: "Orgánico",
    stock: 6,
    image:
      "https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=900&q=80",
  }),
  productFixture({
    id: 6,
    sku: "DAY-MESA-TRA-002",
    name: "Mesa Travertino Clara",
    description: "Mesa escultórica de bordes suaves para salas de tonos neutros.",
    price: "6890.00",
    category: categories[1],
    material: "Travertino",
    color: "Marfil",
    style: "Contemporáneo",
    stock: 4,
    image:
      "https://images.unsplash.com/photo-1532372320572-cda25653a694?w=900&q=80",
  }),
  productFixture({
    id: 7,
    sku: "DAY-CRED-ENC-001",
    name: "Credenza Encino Bajo",
    description: "Almacenamiento discreto con puertas lisas y herrajes ocultos.",
    price: "8490.00",
    category: categories[2],
    material: "Encino",
    color: "Natural",
    style: "Minimalista",
    stock: 3,
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80",
  }),
  productFixture({
    id: 8,
    sku: "DAY-SILLA-AVE-001",
    name: "Silla Avena Curva",
    description: "Asiento tapizado y respaldo curvo para comedor o rincón de lectura.",
    price: "2890.00",
    category: categories[3],
    material: "Fresno y lino",
    color: "Avena",
    style: "Japandi",
    stock: 11,
    image:
      "https://images.unsplash.com/photo-1503602642458-232111445657?w=900&q=80",
  }),
  productFixture({
    id: 9,
    sku: "DAY-BURO-CAN-001",
    name: "Buró Canela",
    description: "Buró compacto con cajón silencioso y veta cálida para recámara.",
    price: "3190.00",
    category: categories[4],
    material: "Madera sólida",
    color: "Canela",
    style: "Sereno",
    stock: 7,
    image:
      "https://images.unsplash.com/photo-1615874694520-474822394e73?w=900&q=80",
  }),
  productFixture({
    id: 10,
    sku: "DAY-ESCR-ROB-001",
    name: "Escritorio Roble Lineal",
    description: "Superficie amplia con gestión de cableado y cajón de perfil limpio.",
    price: "7490.00",
    category: categories[5],
    material: "Roble",
    color: "Miel claro",
    style: "Moderno",
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&q=80",
  }),
];

let cartItems = [
  { id: 101, product: products[0], quantity: 1 },
  { id: 102, product: products[2], quantity: 2 },
];

let orders = [
  orderFixture({
    id: 801,
    status: "preparing",
    items: [
      { id: 1, product: products[0], quantity: 1 },
      { id: 2, product: products[2], quantity: 1 },
    ],
    payment_method: "card",
    payment_status: "authorized",
    payment_reference: "DAY-PREVIEW-CARD",
    distance_km: "8.4",
    estimated_duration_minutes: "22.0",
    delivery_fee: "147.20",
  }),
  orderFixture({
    id: 802,
    status: "pending",
    items: [{ id: 3, product: products[1], quantity: 1 }],
    payment_method: "transfer",
    payment_status: "awaiting_transfer",
    payment_reference: "DAY-PREVIEW-TRANSFER",
    distance_km: "12.5",
    estimated_duration_minutes: "30.0",
    delivery_fee: "180.00",
  }),
  orderFixture({
    id: 803,
    status: "delivered",
    items: [{ id: 4, product: products[3], quantity: 1 }],
    payment_method: "cash",
    payment_status: "pay_on_delivery",
    payment_reference: "DAY-PREVIEW-CASH",
    distance_km: "6.2",
    estimated_duration_minutes: "18.0",
    delivery_fee: "129.60",
  }),
];

let storeSettings = {
  store_name: "Daybed Tijuana",
  contact_phone: "+52 664 555 0100",
  contact_email: "contacto@daybed.local",
  street: "Av. Reforma 1200",
  neighborhood: "Zona Centro",
  city: "Tijuana",
  state: "Baja California",
  postal_code: "22000",
  latitude: "32.51490000",
  longitude: "-117.03820000",
  delivery_base_fee: "80.00",
  delivery_price_per_km: "8.00",
  free_shipping_threshold: "15000.00",
  show_cart_estimate: true,
  maximum_delivery_radius_km: "80.00",
  currency: "MXN",
  business_hours: "Lun–Sáb · 10:00–19:00",
  support_instructions: "Comparte tu número de pedido y te ayudaremos.",
  cancellation_window_hours: 12,
  default_low_stock_threshold: 2,
  default_preparation_days: 4,
  announcement_message: "Entrega local en Tijuana y zona metropolitana.",
  storefront_available: true,
};

const PREVIEW_STATE_KEY = "daybed:preview-fixtures:v3";
const previewDefaults = clonePreviewState({ categories, products, cartItems, orders, storeSettings, userOverrides: {} });
let userOverrides = {};
hydratePreviewFixtures();

export function resetPreviewFixtures() {
  const defaults = clonePreviewState(previewDefaults);
  categories = defaults.categories;
  products = defaults.products;
  cartItems = defaults.cartItems;
  orders = defaults.orders;
  storeSettings = defaults.storeSettings;
  userOverrides = {};
  try { window.sessionStorage.removeItem(PREVIEW_STATE_KEY); } catch { /* noop */ }
}

function hydratePreviewFixtures() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(PREVIEW_STATE_KEY);
    if (!raw) return;
    const state = JSON.parse(raw);
    categories = state.categories || categories;
    products = state.products || products;
    cartItems = state.cartItems || cartItems;
    orders = state.orders || orders;
    storeSettings = state.storeSettings || storeSettings;
    userOverrides = state.userOverrides || {};
  } catch {
    resetPreviewFixtures();
  }
}

function persistPreviewFixtures() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PREVIEW_STATE_KEY, JSON.stringify({ categories, products, cartItems, orders, storeSettings, userOverrides }));
  } catch { /* Preview remains usable when session storage is restricted. */ }
}

function clonePreviewState(value) {
  return JSON.parse(JSON.stringify(value));
}

function customerSafeOrder(order) {
  const safe = clonePreviewState(order);
  safe.payment_summary = Object.fromEntries(
    Object.entries(safe.payment_snapshot || {}).filter(
      ([key, value]) => ["brand", "last4", "masked", "message"].includes(key) && value != null && value !== "",
    ),
  );
  delete safe.payment_snapshot;
  delete safe.internal_notes;
  delete safe.geocoding_provider;
  delete safe.distance_provider;
  delete safe.stock_decremented_at;
  delete safe.stock_released_at;
  delete safe._preview_stock_reserved;
  delete safe.available_status_transitions;
  safe.status_history = (safe.status_history || []).map(({ id, from_status, to_status, created_at }) => ({
    id,
    from_status,
    to_status,
    created_at,
  }));
  return safe;
}

export function getPreviewFixtureResponse(config) {
  if (!isPreviewModeActive()) return undefined;

  const method = String(config.method || "get").toLowerCase();
  const path = normalizePath(config.url);
  const viewer = getPreviewViewer();

  if (method === "get") {
    return getPreviewReadFixture(path, viewer, config.params || {});
  }

  if (["post", "patch", "put", "delete"].includes(method)) {
    return getPreviewWriteFixture(path, config.data, viewer, method);
  }

  return undefined;
}

function getPreviewReadFixture(path, viewer, params = {}) {
  if (path === "/accounts/me/") return viewer;
  if (path === "/accounts/users/") {
    const users = Object.values(previewUsers).map((user) => ({
      ...user,
      ...(userOverrides[user.id] || {}),
    }));
    return { count: users.length, results: users };
  }
  if (path === "/access/roles/") return rolesFixture();
  if (path === "/store/settings/") return storeSettings;
  if (path === "/catalog/categories/" || path === "/catalog/manage/categories/") {
    const visibleCategories = path.includes("manage")
      ? categories
      : categories.filter((category) => category.active !== false);
    return { count: visibleCategories.length, results: visibleCategories };
  }
  if (path === "/catalog/products/" || path === "/catalog/manage/products/") {
    const filtered = filterPreviewProducts(params, { includeInactive: path.includes("manage") });
    return { count: filtered.length, results: filtered };
  }
  if (/^\/catalog\/products\/[^/]+\/reviews\/$/.test(path)) {
    return findReviewProduct(path)?.reviews || [];
  }
  if (path.startsWith("/catalog/products/")) return findProduct(path, false);
  if (path.startsWith("/catalog/manage/products/")) return findProduct(path, true);
  if (path.startsWith("/catalog/manage/categories/")) {
    return categories.find((category) => category.slug === pathId(path)) || null;
  }
  if (path.startsWith("/accounts/users/")) {
    const existing = Object.values(previewUsers).find((user) => String(user.id) === pathId(path));
    return existing ? { ...existing, ...(userOverrides[existing.id] || {}) } : null;
  }
  if (path === "/inventory/products/") {
    const filtered = filterPreviewProducts(params, { includeInactive: true });
    return { count: filtered.length, results: filtered };
  }
  if (path === "/inventory/low-stock/") {
    return products.filter((product) => product.active && product.low_stock);
  }
  if (path === "/inventory/movements/") return [];
  if (path === "/dashboard/metrics/") return dashboardFixture(Number(params.range_days || 90));
  if (path === "/cart/") return cartFixture();
  if (path === "/cart/items/") return cartItems;
  if (path === "/orders/") {
    const personalOrders = filterPreviewOrders(params).filter(
      (order) => order.customer_email === viewer.email,
    );
    return { count: personalOrders.length, results: personalOrders.map(customerSafeOrder) };
  }
  if (path === "/manage/orders/") {
    const filtered = filterPreviewOrders(params);
    return { count: filtered.length, results: filtered };
  }
  if (path.startsWith("/orders/")) {
    const order = findOrder(path);
    return order?.customer_email === viewer.email ? customerSafeOrder(order) : null;
  }
  if (path.startsWith("/manage/orders/")) return findOrder(path);

  return undefined;
}

function getPreviewWriteFixture(path, rawData, viewer, method) {
  const data = normalizeFixtureData(rawData);
  if (path === "/accounts/me/") {
    const nextData = { ...data };
    if (typeof File !== "undefined" && nextData.avatar instanceof File) {
      nextData.avatar = URL.createObjectURL(nextData.avatar);
    }
    userOverrides[viewer.id] = { ...(userOverrides[viewer.id] || {}), ...nextData };
    persistPreviewFixtures();
    return { ...viewer, ...userOverrides[viewer.id] };
  }
  if (path === "/store/contact/") return { id: `preview-contact-${Date.now()}`, ...data, created_at: new Date().toISOString() };
  if (path === "/accounts/password/change/") return { detail: "Contraseña actualizada." };
  if (path === "/accounts/password/reset/" || path === "/accounts/password/reset/confirm/") {
    return { detail: "Solicitud procesada en preview." };
  }
  if (path === "/accounts/register/") return { id: "preview-register", ...data };
  if (path === "/accounts/users/") return { id: "preview-created-user", ...data };
  if (path.startsWith("/accounts/users/")) {
    const existing = Object.values(previewUsers).find((user) => String(user.id) === pathId(path)) || previewUsers.employee;
    const override = data.operational_permission_codes;
    const next = { ...(userOverrides[existing.id] || {}), ...data };
    if (existing.role === "empleado") {
      next.effective_permission_codes = override === null
        ? PREVIEW_PERMISSION_CODES
        : override ?? existing.effective_permission_codes;
    }
    userOverrides[existing.id] = next;
    persistPreviewFixtures();
    return { ...existing, ...next };
  }
  if (path === "/access/roles/empleado/") return rolesFixture(data.permission_codes);
  if (path === "/store/settings/") {
    storeSettings = { ...storeSettings, ...data };
    persistPreviewFixtures();
    return storeSettings;
  }
  if (/^\/catalog\/products\/[^/]+\/reviews\/$/.test(path)) {
    const product = findReviewProduct(path);
    if (!product) throw new Error("Este producto ya no está disponible.");
    const review = {
      id: `preview-review-${Date.now()}`,
      author: `${viewer.first_name || "Cliente"} ${viewer.last_name || "Preview"}`.trim(),
      rating: Number(data.rating || 5),
      title: data.title || "Excelente elección",
      body: data.body || "Una pieza muy bien resuelta.",
      verified_purchase: true,
      date: new Date().toISOString(),
    };
    product.reviews = [review, ...(product.reviews || [])];
    product.review_count = product.reviews.length;
    product.average_rating = product.reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / product.reviews.length;
    product.average_review_rating = product.average_rating;
    persistPreviewFixtures();
    return review;
  }
  if (path === "/catalog/manage/products/") {
    const category = categories.find((item) => String(item.id) === String(data.category)) || categories[0];
    const product = productFixture({
      id: Math.max(...products.map((item) => Number(item.id))) + 1,
      sku: data.sku || `DAY-PREVIEW-${Date.now()}`,
      name: data.name || "Producto preview",
      description: data.description || "Producto creado en preview.",
      price: data.price || "1000.00",
      category,
      stock: Number(data.stock || 1),
      image: data.image_url || undefined,
    });
    Object.assign(product, data, {
      category: category.id,
      category_detail: category,
      stock: Number(data.stock ?? product.stock),
      minimum_stock: Number(data.minimum_stock ?? product.minimum_stock),
      featured_order: Number(data.featured_order ?? product.featured_order),
      has_storage: previewBoolean(data.has_storage, product.has_storage),
      is_sofa_bed: previewBoolean(data.is_sofa_bed, product.is_sofa_bed),
      featured: previewBoolean(data.featured, product.featured),
      active: previewBoolean(data.active, true),
      specifications: previewJson(data.specifications, product.specifications),
    });
    products.push(product);
    persistPreviewFixtures();
    return product;
  }
  if (path.startsWith("/catalog/manage/products/")) {
    const product = findProduct(path, true);
    if (!product) return null;
    Object.assign(product, data, {
      has_storage: data.has_storage === undefined ? product.has_storage : previewBoolean(data.has_storage),
      is_sofa_bed: data.is_sofa_bed === undefined ? product.is_sofa_bed : previewBoolean(data.is_sofa_bed),
      featured: data.featured === undefined ? product.featured : previewBoolean(data.featured),
      active: data.active === undefined ? product.active : previewBoolean(data.active),
      featured_order: data.featured_order === undefined ? product.featured_order : Number(data.featured_order),
      specifications: data.specifications === undefined ? product.specifications : previewJson(data.specifications, product.specifications),
    });
    product.stock = Number(product.stock || 0);
    product.low_stock = product.stock <= Number(product.minimum_stock || 0);
    persistPreviewFixtures();
    return product;
  }
  if (path === "/catalog/manage/categories/") {
    const category = {
      id: Math.max(...categories.map((item) => Number(item.id))) + 1,
      name: data.name || "Colección preview",
      slug: data.slug || `coleccion-${Date.now()}`,
      active: previewBoolean(data.active, true),
      homepage_visible: previewBoolean(data.homepage_visible),
      display_order: Number(data.display_order || categories.length + 1),
      product_count: 0,
      description: data.description || "Colección creada en preview.",
      specification_schema: previewJson(data.specification_schema, []),
      filter_attributes: previewJson(data.filter_attributes, []),
    };
    categories.push(category);
    persistPreviewFixtures();
    return category;
  }
  if (path.startsWith("/catalog/manage/categories/")) {
    const category = categories.find((item) => item.slug === pathId(path));
    if (!category) return null;
    Object.assign(category, data, {
      active: data.active === undefined ? category.active : previewBoolean(data.active),
      homepage_visible: data.homepage_visible === undefined ? category.homepage_visible : previewBoolean(data.homepage_visible),
      display_order: data.display_order === undefined ? category.display_order : Number(data.display_order),
      specification_schema: data.specification_schema === undefined ? category.specification_schema : previewJson(data.specification_schema, category.specification_schema),
      filter_attributes: data.filter_attributes === undefined ? category.filter_attributes : previewJson(data.filter_attributes, category.filter_attributes),
    });
    persistPreviewFixtures();
    return category;
  }
  if (path.includes("/stock/")) {
    const product = findProduct(path, true);
    if (!product) return null;
    product.stock = Number(data.stock ?? product.stock);
    product.low_stock = product.stock <= Number(product.minimum_stock || 0);
    persistPreviewFixtures();
    return product;
  }
  if (path === "/cart/items/") {
    if (!storeSettings.storefront_available) throw new Error("Las compras están pausadas temporalmente. Tu carrito se conserva.");
    const product = products.find((item) => String(item.id) === String(data.product_id));
    if (!product || Number(product.stock || 0) <= 0) {
      throw new Error("Este producto está agotado.");
    }
    const requested = Math.max(1, Number(data.quantity || 1));
    const existing = cartItems.find((item) => String(item.product.id) === String(product.id));
    const requestedTotal = requested + Number(existing?.quantity || 0);
    if (requestedTotal > Number(product.stock)) {
      throw new Error(`Solo hay ${product.stock} unidades disponibles.`);
    }
    if (existing) existing.quantity = requestedTotal;
    else cartItems.push({ id: Date.now(), product, quantity: requested });
    persistPreviewFixtures();
    return existing || cartItems.at(-1);
  }
  if (path.startsWith("/cart/items/")) {
    if (method !== "delete" && !storeSettings.storefront_available) throw new Error("Las compras están pausadas temporalmente. Tu carrito se conserva.");
    const itemId = pathId(path);
    const item = cartItems.find((entry) => String(entry.id) === String(itemId));
    if (!item) return null;
    if (method === "delete") {
      cartItems = cartItems.filter((entry) => String(entry.id) !== String(itemId));
      persistPreviewFixtures();
      return null;
    }
    if (data.quantity !== undefined) {
      const nextQuantity = Number(data.quantity);
      if (!Number.isInteger(nextQuantity) || nextQuantity < 1) throw new Error("La cantidad debe ser al menos 1.");
      if (Number(item.product.stock || 0) <= 0) throw new Error("Este producto está agotado.");
      if (nextQuantity > Number(item.product.stock)) throw new Error(`Solo hay ${item.product.stock} unidades disponibles.`);
      item.quantity = nextQuantity;
    }
    persistPreviewFixtures();
    return item;
  }
  if (path === "/cart/") {
    cartItems = [];
    persistPreviewFixtures();
    return cartFixture();
  }
  if (path === "/delivery/geocode/") {
    const address = data.address || [data.street, data.neighborhood, data.city, data.state, data.postal_code].filter(Boolean).join(", ") || "Av. Reforma 1200, Zona Centro, Tijuana, Baja California, 22000";
    const candidates = [
      { formatted_address: address, latitude: "32.51490000", longitude: "-117.03820000", address: { city: data.city || "Tijuana", state: data.state || "Baja California", postcode: data.postal_code || "22000" } },
      { formatted_address: `${address}, México`, latitude: "32.52010000", longitude: "-117.02180000", address: { city: data.city || "Tijuana", state: data.state || "Baja California", postcode: data.postal_code || "22000" } },
    ];
    return { provider: "nominatim", original_address: address, ...candidates[0], candidates };
  }
  if (path === "/delivery/estimate/") {
    return {
      origin_latitude: storeSettings.latitude,
      origin_longitude: storeSettings.longitude,
      destination_latitude: data.latitude || "32.51490000",
      destination_longitude: data.longitude || "-117.03820000",
      distance_km: "8.400",
      estimated_duration_minutes: "22.0",
      delivery_fee: Number(data.order_subtotal || 0) >= Number(storeSettings.free_shipping_threshold || Infinity) ? "0.00" : "147.20",
      free_shipping_applied: Number(data.order_subtotal || 0) >= Number(storeSettings.free_shipping_threshold || Infinity),
      free_shipping_threshold: storeSettings.free_shipping_threshold,
      delivery_zone: "standard",
      distance_provider: "openrouteservice",
      routing_available: true,
      routing_warning: "",
      geocoding_provider: data.address ? "nominatim" : undefined,
    };
  }
  if (path === "/checkout/") {
    if (!storeSettings.storefront_available) throw new Error("Las compras están pausadas temporalmente. Tu carrito se conserva.");
    if (!cartItems.length) throw new Error("Tu carrito está vacío.");
    const unavailable = cartItems.filter((item) => item.product.active === false || Number(item.product.stock || 0) < Number(item.quantity || 0));
    if (unavailable.length) throw new Error("Uno o más productos ya no tienen existencias suficientes.");
    const id = Math.max(...orders.map((order) => Number(order.id))) + 1;
    const order = orderFixture({
      id,
      status: "pending",
      items: cartItems.map((item, index) => ({ id: Date.now() + index, product: item.product, quantity: item.quantity })),
      payment_method: data.payment_method || "cash",
      payment_status: data.payment_method === "card" ? "authorized" : data.payment_method === "transfer" ? "awaiting_transfer" : "pay_on_delivery",
      payment_reference: `DAY-PREVIEW-${id}`,
      distance_km: data.distance_km || "8.4",
      estimated_duration_minutes: data.estimated_duration_minutes || "22.0",
      delivery_fee: data.delivery_fee || "147.20",
    });
    Object.assign(order, data, {
      id,
      order_code: `DAY-${String(id).padStart(5, "0")}`,
      customer_name: `${viewer.first_name || "Cliente"} ${viewer.last_name || "Preview"}`.trim(),
      customer_email: viewer.email,
      customer_phone: viewer.phone || "",
      original_address: data.original_address || data.formatted_address,
      formatted_address: data.formatted_address || data.original_address,
      latitude: data.latitude,
      longitude: data.longitude,
      delivery_notes: data.delivery_notes || "",
      _preview_stock_reserved: true,
    });
    cartItems.forEach((item) => {
      const product = products.find((entry) => String(entry.id) === String(item.product.id));
      if (product) {
        product.stock = Math.max(0, Number(product.stock) - Number(item.quantity));
        product.low_stock = product.stock <= Number(product.minimum_stock || 0);
      }
    });
    orders.unshift(order);
    cartItems = [];
    persistPreviewFixtures();
    return customerSafeOrder(order);
  }
  if (path.startsWith("/manage/orders/")) {
    const order = findOrder(path);
    if (!order) return null;
    if (data.status) {
      const allowed = allowedTransitions(order.status);
      if (!allowed.includes(data.status)) throw new Error("Esa transición no está disponible para este pedido.");
      const previous = order.status;
      order.status = data.status;
      if (data.status === "cancelled" && order._preview_stock_reserved) {
        order.items.forEach((item) => {
          const product = products.find((entry) => String(entry.id) === String(item.product));
          if (product) {
            product.stock = Number(product.stock || 0) + Number(item.quantity || 0);
            product.low_stock = product.stock <= Number(product.minimum_stock || 0);
          }
        });
        order._preview_stock_reserved = false;
        order.stock_released_at = new Date().toISOString();
      }
      order.status_history.push({ id: Date.now(), from_status: previous, to_status: data.status, note: data.status_note || "", actor_name: viewer.first_name || "Equipo Daybed", created_at: new Date().toISOString() });
    }
    if (data.payment_status) {
      const allowedPaymentSources = ["awaiting_transfer", "pay_on_delivery"];
      const allowedPaymentTargets = ["authorized", "failed"];
      if (data.payment_status === order.payment_status) throw new Error("El pago ya se encuentra en ese estado.");
      if (!allowedPaymentSources.includes(order.payment_status) || !allowedPaymentTargets.includes(data.payment_status)) throw new Error("No se permite esa transición de pago.");
      order.payment_status = data.payment_status;
      order.payment_snapshot = { ...(order.payment_snapshot || {}), message: data.payment_status === "authorized" ? "Pago recibido." : "Pago marcado como no aprobado." };
    }
    if (data.internal_notes !== undefined) order.internal_notes = data.internal_notes;
    order.available_status_transitions = allowedTransitions(order.status);
    order.updated_at = new Date().toISOString();
    persistPreviewFixtures();
    return clonePreviewState(order);
  }

  return undefined;
}

function normalizeFixtureData(data) {
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    return Object.fromEntries(data.entries());
  }
  return data && typeof data === "object" ? data : {};
}

function previewBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return [true, 1, "1", "true", "on"].includes(value);
}

function previewJson(value, fallback) {
  if (typeof value !== "string") return value ?? fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function filterPreviewProducts(params = {}, { includeInactive = false } = {}) {
  const value = (key) => params?.[key] ?? "";
  const boolValue = (key) => [true, "true", "1", 1].includes(value(key));
  const search = String(value("search") || "").trim().toLowerCase();
  let filtered = products.filter((product) => {
    const categorySlug = product.category_detail?.slug || "";
    const haystack = `${product.name} ${product.description} ${product.sku} ${product.material} ${product.color} ${product.style} ${product.room} ${product.furniture_type}`.toLowerCase();
    return (includeInactive || product.active !== false)
      && (!search || haystack.includes(search))
      && (!value("category__slug") || categorySlug === value("category__slug"))
      && (!value("category") || String(product.category) === String(value("category")))
      && (!value("material") || product.material === value("material"))
      && (!value("color") || product.color === value("color"))
      && (!value("style") || product.style === value("style"))
      && (!value("room") || product.room === value("room"))
      && (!value("furniture_type") || product.furniture_type === value("furniture_type"))
      && (value("has_storage") === "" || Boolean(product.has_storage) === boolValue("has_storage"))
      && (value("is_sofa_bed") === "" || Boolean(product.is_sofa_bed) === boolValue("is_sofa_bed"))
      && (value("featured") === "" || Boolean(product.featured) === boolValue("featured"))
      && (value("in_stock") === "" || (Number(product.stock) > 0) === boolValue("in_stock"))
      && (!value("min_price") || Number(product.price) >= Number(value("min_price")))
      && (!value("max_price") || Number(product.price) <= Number(value("max_price")))
      && (!value("min_rating") || Number(product.average_rating || 0) >= Number(value("min_rating")));
  });
  const ordering = String(value("ordering") || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (ordering.length) {
    filtered = [...filtered].sort((a, b) => {
      for (const entry of ordering) {
        const descending = entry.startsWith("-");
        const requestedField = descending ? entry.slice(1) : entry;
        const field = requestedField === "average_review_rating" ? "average_rating" : requestedField;
        const left = a[field];
        const right = b[field];
        let result;
        if (left == null && right != null) result = 1;
        else if (left != null && right == null) result = -1;
        else if (typeof left === "boolean" || typeof right === "boolean") result = Number(Boolean(left)) - Number(Boolean(right));
        else if (left !== "" && right !== "" && !Number.isNaN(Number(left)) && !Number.isNaN(Number(right))) result = Number(left) - Number(right);
        else result = String(left ?? "").localeCompare(String(right ?? ""), "es", { sensitivity: "base" });
        if (result) return descending ? -result : result;
      }
      return Number(a.id || 0) - Number(b.id || 0);
    });
  }
  return filtered;
}

function filterPreviewOrders(params = {}) {
  const search = String(params.search || "").toLowerCase();
  return orders.filter((order) => (!params.status || order.status === params.status)
    && (!search || `${order.order_code} ${order.customer_name} ${order.customer_email} ${order.formatted_address}`.toLowerCase().includes(search)));
}

function productFixture({
  id,
  sku,
  name,
  description,
  price,
  category,
  material = "Madera",
  color = "Natural",
  style = "Contemporáneo",
  stock = 5,
  minimum_stock = 2,
  image,
}) {
  return {
    id,
    sku,
    name,
    description,
    price,
    category: category?.id,
    category_detail: category,
    material,
    color,
    style,
    room: category?.slug === "recamaras" ? "recámara" : category?.slug === "oficina" ? "oficina" : "sala",
    furniture_type: category?.name || "Mueble",
    has_storage: category?.slug === "almacenamiento" || name.toLowerCase().includes("baúl"),
    is_sofa_bed: category?.slug === "sofas-cama",
    featured: [1, 3, 5, 8].includes(id),
    featured_order: [1, 3, 5, 8].indexOf(id) + 1,
    stock,
    minimum_stock,
    low_stock: Number(stock) <= Number(minimum_stock),
    active: true,
    main_image: image,
    images: [
      { id: `${id}-gallery-1`, image, alt_text: `${name} vista 1`, active: true },
    ],
    structured_dimensions: {
      width_cm: "190.00",
      height_cm: "78.00",
      depth_cm: "88.00",
      weight_kg: "42.00",
    },
    specifications: {
      room: "sala",
      pieces: 1,
      assembly_required: false,
      features: ["convertible", "cojines incluidos"],
    },
    reviews: reviewFixture(name),
    review_count: 2,
    average_review_rating: 4.5,
    average_rating: 4.5,
  };
}

function orderFixture({
  id,
  status,
  items,
  payment_method,
  payment_status,
  payment_reference,
  distance_km,
  estimated_duration_minutes,
  delivery_fee,
}) {
  const orderItems = items.map((item) => {
    const unitPrice = Number(item.product.price || 0);
    const lineTotal = unitPrice * Number(item.quantity || 1);
    return {
      id: item.id,
      product: item.product.id,
      product_name: item.product.name,
      product_sku: item.product.sku,
      unit_price: unitPrice,
      quantity: item.quantity,
      line_total: lineTotal,
      product_snapshot: item.product,
    };
  });
  const productsSubtotal = orderItems.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
  const shipping = Number(delivery_fee || 0);
  const identities = {
    801: { name: "Cliente Preview", email: "cliente.preview@daybed.local", phone: "6645550190", address: "Av. Reforma 1200, Zona Centro, Tijuana, Baja California, 22000", lat: "32.51490000", lng: "-117.03820000", date: "2026-08-03T12:00:00Z", notes: "Llamar al llegar; acceso por elevador." },
    802: { name: "Lucía Herrera", email: "lucia.herrera@example.com", phone: "6645550118", address: "Paseo de los Héroes 9350, Zona Río, Tijuana, Baja California, 22010", lat: "32.52640000", lng: "-117.02070000", date: "2026-07-29T17:30:00Z", notes: "Entregar por recepción del edificio." },
    803: { name: "Cliente Preview", email: "cliente.preview@daybed.local", phone: "6645550190", address: "Calzada Tecnológico 14418, Otay, Tijuana, Baja California, 22427", lat: "32.53190000", lng: "-116.97380000", date: "2026-07-18T10:15:00Z", notes: "Casa con portón color arena." },
  };
  const identity = identities[id] || identities[801];
  const createdAt = identity.date;
  const history = buildPreviewStatusHistory(status, createdAt);

  return {
    id,
    order_code: `DAY-${String(id).padStart(5, "0")}`,
    status,
    available_status_transitions: allowedTransitions(status),
    status_history: history,
    created_at: createdAt,
    updated_at: history.at(-1)?.created_at || createdAt,
    customer_name: identity.name,
    customer_email: identity.email,
    customer_phone: identity.phone,
    original_address: identity.address,
    formatted_address: `${identity.address}, México`,
    latitude: identity.lat,
    longitude: identity.lng,
    distance_km,
    estimated_duration_minutes,
    delivery_fee,
    delivery_zone: "standard",
    geocoding_provider: "nominatim",
    distance_provider: "openrouteservice",
    products_subtotal: productsSubtotal,
    discount_total: 0,
    total: productsSubtotal + shipping,
    delivery_notes: identity.notes,
    internal_notes: id === 802 ? "Confirmar transferencia antes de preparar." : "",
    payment_method,
    payment_status,
    payment_reference,
    payment_processed_at: createdAt,
    payment_snapshot: {
      masked: payment_method === "card" ? "•••• 4242" : undefined,
      message: "Pago registrado.",
    },
    items: orderItems,
  };
}

function allowedTransitions(status) {
  return ({
    pending: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  })[status] || [];
}

function buildPreviewStatusHistory(status, createdAt) {
  const stages = ["pending", "confirmed", "preparing", "shipped", "delivered"];
  if (status === "cancelled") {
    return [
      { id: `${createdAt}-pending`, from_status: "", to_status: "pending", note: "Pedido recibido por Daybed.", actor_name: "Daybed", created_at: createdAt },
      { id: `${createdAt}-cancelled`, from_status: "pending", to_status: "cancelled", note: "Pedido cancelado antes de preparación.", actor_name: "Equipo Daybed", created_at: new Date(new Date(createdAt).getTime() + 3600000).toISOString() },
    ];
  }
  const targetIndex = Math.max(0, stages.indexOf(status));
  return stages.slice(0, targetIndex + 1).map((stage, index) => ({
    id: `${createdAt}-${stage}`,
    from_status: index ? stages[index - 1] : "",
    to_status: stage,
    note: index === 0 ? "Pedido recibido por Daybed." : "",
    actor_name: index === 0 ? "Daybed" : "Equipo Daybed",
    created_at: new Date(new Date(createdAt).getTime() + index * 7200000).toISOString(),
  }));
}

function cartFixture(items = cartItems) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0),
    0,
  );

  return {
    id: "preview-cart",
    items,
    subtotal,
  };
}

function dashboardFixture(rangeDays = 90) {
  const safeRange = [30, 90, 180, 365].includes(rangeDays) ? rangeDays : 90;
  const snapshots = {
    30: { orders: 1, sales: "12499.00", months: [{ month: "2026-08", total: 12499 }] },
    90: { orders: 3, sales: "35891.20", months: [{ month: "2026-06", total: 9400 }, { month: "2026-07", total: 12800 }, { month: "2026-08", total: 13691.2 }] },
    180: { orders: 7, sales: "84620.00", months: [{ month: "2026-03", total: 10200 }, { month: "2026-04", total: 14100 }, { month: "2026-05", total: 14829 }, { month: "2026-06", total: 9400 }, { month: "2026-07", total: 12800 }, { month: "2026-08", total: 23291 }] },
    365: { orders: 15, sales: "186540.00", months: [{ month: "2025-09", total: 11200 }, { month: "2025-10", total: 14500 }, { month: "2025-11", total: 12900 }, { month: "2025-12", total: 18600 }, { month: "2026-01", total: 15100 }, { month: "2026-02", total: 16800 }, { month: "2026-03", total: 10200 }, { month: "2026-04", total: 14100 }, { month: "2026-05", total: 14829 }, { month: "2026-06", total: 9400 }, { month: "2026-07", total: 12800 }, { month: "2026-08", total: 26111 }] },
  };
  const snapshot = snapshots[safeRange];
  const statusScale = safeRange === 30 ? [1, 0, 0] : safeRange === 90 ? [1, 1, 1] : safeRange === 180 ? [2, 3, 2] : [4, 6, 5];
  const rangeStart = new Date(Date.UTC(2026, 7, 3));
  rangeStart.setUTCDate(rangeStart.getUTCDate() - safeRange);

  return {
    range_days: safeRange,
    range_start: rangeStart.toISOString(),
    total_orders: snapshot.orders,
    orders_count: snapshot.orders,
    total_sales: snapshot.sales,
    total_simulated_sales: snapshot.sales,
    total_products: products.length,
    products_count: products.length,
    low_stock_count: products.filter((product) => product.low_stock).length,
    average_delivery_fee: safeRange <= 30 ? "147.20" : "152.26",
    average_delivery_distance: safeRange <= 30 ? "8.40" : "9.03",
    orders_by_status: [
      { status: "pending", count: statusScale[0] },
      { status: "preparing", count: statusScale[1] },
      { status: "delivered", count: statusScale[2] },
    ],
    recent_orders: orders,
    low_stock: products.filter((product) => product.low_stock),
    sales_by_month: snapshot.months,
  };
}

function rolesFixture(employeePermissions = PREVIEW_PERMISSION_CODES) {
  const permissionDetails = {
    "dashboard.view": ["Resumen operativo", "Consulta métricas y actividad diaria."],
    "products.view": ["Ver productos", "Consulta el catálogo interno y sus fichas."],
    "products.create": ["Crear productos", "Publica nuevas piezas y colecciones."],
    "products.update": ["Editar productos", "Actualiza contenido, precios y atributos."],
    "products.deactivate": ["Desactivar productos", "Retira piezas sin borrar su historial."],
    "inventory.view": ["Ver inventario", "Consulta existencias y mínimos de reposición."],
    "inventory.adjust": ["Ajustar inventario", "Registra entradas, salidas y correcciones."],
    "inventory.movements.view": ["Ver movimientos", "Consulta el historial de cambios de stock."],
    "orders.view": ["Ver pedidos", "Consulta pedidos y datos necesarios para surtirlos."],
    "orders.status.update": ["Actualizar pedidos", "Avanza preparación, envío y entrega."],
  };
  const permissionCatalog = PREVIEW_PERMISSION_CODES.map((code) => ({
    code,
    name: permissionDetails[code]?.[0] || code,
    label: permissionDetails[code]?.[0] || code.replace(".", " "),
    description: permissionDetails[code]?.[1] || "Acceso operativo del equipo.",
    category: code.split(".")[0],
  }));

  return {
    roles: [
      {
        id: "administrador",
        name: "Administrador",
        permission_codes: PREVIEW_PERMISSION_CODES,
        effective_permission_codes: PREVIEW_PERMISSION_CODES,
      },
      {
        id: "empleado",
        name: "Empleado",
        permission_codes: employeePermissions || PREVIEW_PERMISSION_CODES,
        effective_permission_codes: employeePermissions || PREVIEW_PERMISSION_CODES,
      },
    ],
    permission_catalog: permissionCatalog,
  };
}

function reviewFixture(productName) {
  return [
    {
      author: "Mariana Lopez",
      rating: 5,
      title: "Muy buena calidad",
      body: `El ${productName} se siente firme, llegó bien empacado y se ve igual que en el catálogo.`,
      date: "2026-07-18",
    },
    {
      author: "Carlos Rivera",
      rating: 4,
      title: "Buena compra",
      body: "La entrega fue clara y el mueble funciona bien para un espacio pequeño.",
      date: "2026-07-09",
    },
  ];
}

function findProduct(path, includeInactive = true) {
  const id = Number(pathId(path));
  const product = products.find((item) => Number(item.id) === id) || null;
  if (!product) return null;
  return includeInactive || product.active !== false ? product : null;
}

function findReviewProduct(path) {
  const match = path.match(/\/catalog\/products\/([^/]+)\/reviews\//);
  const id = Number(match?.[1]);
  return products.find((product) => Number(product.id) === id) || null;
}

function findOrder(path) {
  const identifier = pathId(path);
  return orders.find((order) => String(order.id) === String(identifier) || order.order_code === identifier) || null;
}

function pathId(path) {
  return path.split("/").filter(Boolean).at(-1);
}

function getPreviewViewer() {
  if (typeof window === "undefined") return previewUsers.customer;
  const params = new URLSearchParams(window.location.search);
  const viewer = previewUsers[params.get("viewer")] || previewUsers.customer;
  return { ...viewer, ...(userOverrides[viewer.id] || {}) };
}

function normalizePath(url = "") {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
  let pathname;

  try {
    pathname = new URL(url, baseUrl).pathname;
  } catch {
    pathname = String(url).split("?")[0];
  }

  pathname = pathname.replace(/^\/api(?=\/)/, "");
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  if (!pathname.endsWith("/")) pathname = `${pathname}/`;
  return pathname;
}
