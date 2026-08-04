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

const categories = [
  {
    id: 1,
    name: "Sofas cama",
    slug: "sofas-cama",
    product_count: 3,
    active: true,
    description: "Muebles convertibles para descanso y visitas.",
    specification_schema: [
      { key: "apertura", label: "Tipo de apertura" },
      { key: "tapiz", label: "Tapiz" },
      { key: "plazas", label: "Plazas" },
    ],
  },
  {
    id: 2,
    name: "Mesas de centro",
    slug: "mesas-centro",
    product_count: 2,
    active: true,
    description: "Mesas para sala y convivencia.",
    specification_schema: [
      { key: "forma", label: "Forma" },
      { key: "cubierta", label: "Cubierta" },
      { key: "acabado", label: "Acabado" },
    ],
  },
  {
    id: 3,
    name: "Almacenamiento",
    slug: "almacenamiento",
    product_count: 2,
    active: true,
    description: "Credenzas, bancos y piezas organizadoras.",
    specification_schema: [
      { key: "capacidad", label: "Capacidad" },
      { key: "puertas", label: "Puertas o cajones" },
      { key: "anclaje", label: "Tipo de anclaje" },
    ],
  },
  {
    id: 4,
    name: "Sillas y bancos",
    slug: "sillas-bancos",
    product_count: 1,
    active: true,
    description: "Asientos auxiliares de proporciones ligeras.",
    specification_schema: [
      { key: "tapizado", label: "Tapizado" },
      { key: "altura_asiento", label: "Altura del asiento" },
    ],
  },
  {
    id: 5,
    name: "Recámara",
    slug: "recamara",
    product_count: 1,
    active: true,
    description: "Piezas serenas para una habitación bien resuelta.",
    specification_schema: [
      { key: "almacenamiento", label: "Almacenamiento" },
      { key: "montaje", label: "Montaje" },
    ],
  },
  {
    id: 6,
    name: "Oficina",
    slug: "oficina",
    product_count: 1,
    active: true,
    description: "Mobiliario funcional para trabajar desde casa.",
    specification_schema: [
      { key: "gestion_cables", label: "Gestión de cables" },
      { key: "carga_maxima", label: "Carga máxima" },
    ],
  },
];

const products = [
  productFixture({
    id: 1,
    sku: "DAY-SOFA-ROB-001",
    name: "Daybed Roble Nordico",
    description: "Sofa cama de roble con cojines claros y lineas limpias.",
    price: "12499.00",
    category: categories[0],
    material: "Roble",
    color: "Natural",
    style: "Nordico",
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80",
  }),
  productFixture({
    id: 2,
    sku: "DAY-SOFA-LIN-002",
    name: "Sofa Cama Lino Arena",
    description: "Daybed tapizado en lino con base baja para sala compacta.",
    price: "9799.00",
    category: categories[0],
    material: "Lino",
    color: "Arena",
    style: "Contemporaneo",
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

const cartItems = [
  { id: 101, product: products[0], quantity: 1 },
  { id: 102, product: products[2], quantity: 2 },
];

const orders = [
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

const storeSettings = {
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
};

export function getPreviewFixtureResponse(config) {
  if (!isDevPreviewRoute()) return undefined;

  const method = String(config.method || "get").toLowerCase();
  const path = normalizePath(config.url);
  const viewer = getPreviewViewer();

  if (method === "get") {
    return getPreviewReadFixture(path, viewer, config.params || {});
  }

  if (["post", "patch", "put", "delete"].includes(method)) {
    return getPreviewWriteFixture(path, config.data, viewer);
  }

  return undefined;
}

function getPreviewReadFixture(path, viewer, params = {}) {
  if (path === "/accounts/me/") return viewer;
  if (path === "/accounts/users/") {
    return {
      count: 3,
      results: Object.values(previewUsers),
    };
  }
  if (path === "/access/roles/") return rolesFixture();
  if (path === "/store/settings/") return storeSettings;
  if (path === "/catalog/categories/" || path === "/catalog/manage/categories/") {
    return { count: categories.length, results: categories };
  }
  if (path === "/catalog/products/" || path === "/catalog/manage/products/") {
    return { count: products.length, results: products };
  }
  if (/^\/catalog\/products\/[^/]+\/reviews\/$/.test(path)) {
    return findReviewProduct(path).reviews;
  }
  if (path.startsWith("/catalog/products/")) return findProduct(path);
  if (path.startsWith("/catalog/manage/products/")) return findProduct(path);
  if (path.startsWith("/catalog/manage/categories/")) {
    return categories.find((category) => category.slug === pathId(path)) || categories[0];
  }
  if (path.startsWith("/accounts/users/")) {
    return Object.values(previewUsers).find((user) => String(user.id) === pathId(path)) || previewUsers.customer;
  }
  if (path === "/inventory/products/") return { count: products.length, results: products };
  if (path === "/inventory/low-stock/") {
    return products.filter((product) => product.low_stock);
  }
  if (path === "/inventory/movements/") return [];
  if (path === "/dashboard/metrics/") return dashboardFixture(Number(params.range_days || 90));
  if (path === "/cart/") return cartFixture();
  if (path === "/cart/items/") return cartItems;
  if (path === "/orders/" || path === "/manage/orders/") {
    return { count: orders.length, results: orders };
  }
  if (path.startsWith("/orders/") || path.startsWith("/manage/orders/")) {
    return findOrder(path);
  }

  return undefined;
}

function getPreviewWriteFixture(path, data, viewer) {
  if (path === "/accounts/me/") return { ...viewer, ...(data || {}) };
  if (path === "/accounts/password/change/") return { detail: "Contraseña actualizada." };
  if (path === "/accounts/password/reset/" || path === "/accounts/password/reset/confirm/") {
    return { detail: "Solicitud procesada en preview." };
  }
  if (path === "/accounts/register/") return { id: "preview-register", ...data };
  if (path === "/accounts/users/") return { id: "preview-created-user", ...data };
  if (path.startsWith("/accounts/users/")) {
    const existing =
      Object.values(previewUsers).find((user) => String(user.id) === pathId(path)) ||
      previewUsers.employee;
    const next = { ...existing, ...(data || {}) };
    const override = data?.operational_permission_codes;

    if (existing.role === "empleado") {
      next.effective_permission_codes =
        override === null
          ? PREVIEW_PERMISSION_CODES
          : override ?? existing.effective_permission_codes;
    }

    return next;
  }
  if (path === "/access/roles/empleado/") return rolesFixture(data?.permission_codes);
  if (path === "/store/settings/") return { ...storeSettings, ...(data || {}) };
  if (/^\/catalog\/products\/[^/]+\/reviews\/$/.test(path)) {
    return {
      id: "preview-review",
      author: `${viewer.first_name || "Cliente"} ${viewer.last_name || "Preview"}`.trim(),
      rating: Number(data?.rating || 5),
      title: data?.title || "Excelente elección",
      body: data?.body || "Una pieza muy bien resuelta.",
      verified_purchase: true,
      date: new Date().toISOString(),
    };
  }
  if (path === "/catalog/manage/products/") {
    return productFixture({
      id: 999,
      sku: data?.get?.("sku") || data?.sku || "DAY-PREVIEW-999",
      name: data?.get?.("name") || data?.name || "Producto preview",
      description: data?.get?.("description") || data?.description || "Producto creado en preview.",
      price: data?.get?.("price") || data?.price || "1000.00",
      category: categories[0],
      stock: Number(data?.get?.("stock") || data?.stock || 1),
    });
  }
  if (path.startsWith("/catalog/manage/products/")) return findProduct(path);
  if (path === "/catalog/manage/categories/") {
    return {
      id: 999,
      name: data?.name || "Categoria preview",
      slug: data?.slug || "categoria-preview",
      active: true,
      product_count: 0,
      description: data?.description || "Colección creada en preview.",
      specification_schema: data?.specification_schema || [],
    };
  }
  if (path.startsWith("/catalog/manage/categories/")) return categories[0];
  if (path === "/inventory/products/1/stock/" || path.includes("/stock/")) {
    return { ...findProduct(path), stock: Number(data?.stock || 1) };
  }
  if (path === "/cart/items/") {
    const product = products.find((item) => item.id === Number(data?.product_id)) || products[0];
    return { id: 999, product, quantity: Number(data?.quantity || 1) };
  }
  if (path.startsWith("/cart/items/")) return cartItems[0];
  if (path === "/cart/") return cartFixture([]);
  if (path === "/delivery/geocode/") {
    return {
      provider: "nominatim",
      formatted_address:
        data?.address || "Av. Reforma 1200, Zona Centro, Tijuana, B.C.",
      latitude: "32.51490000",
      longitude: "-117.03820000",
    };
  }
  if (path === "/delivery/estimate/") {
    return {
      distance_km: "8.40",
      estimated_duration_minutes: "22.00",
      delivery_fee: "147.20",
      delivery_zone: "standard",
      distance_provider: "openrouteservice",
      geocoding_provider: data?.address ? "nominatim" : undefined,
    };
  }
  if (path === "/checkout/") return orders[0];
  if (path.startsWith("/manage/orders/")) {
    return { ...findOrder(path), ...(data?.status ? { status: data.status } : {}) };
  }

  return undefined;
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
  style = "Contemporaneo",
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
  const productsSubtotal = orderItems.reduce(
    (sum, item) => sum + Number(item.line_total || 0),
    0,
  );
  const shipping = Number(delivery_fee || 0);

  return {
    id,
    status,
    created_at: "2026-08-03T12:00:00Z",
    customer_name: "Cliente Preview",
    customer_email: "cliente.preview@daybed.local",
    customer_phone: "6645550190",
    original_address: "Av. Reforma 1200, Zona Centro, Tijuana, B.C.",
    formatted_address: "Av. Reforma 1200, Zona Centro, Tijuana, B.C., Mexico",
    latitude: "32.51490000",
    longitude: "-117.03820000",
    distance_km,
    estimated_duration_minutes,
    delivery_fee,
    delivery_zone: "standard",
    geocoding_provider: "nominatim",
    distance_provider: "openrouteservice",
    products_subtotal: productsSubtotal,
    total: productsSubtotal + shipping,
    payment_method,
    payment_status,
    payment_reference,
    payment_processed_at: "2026-08-03T12:02:00Z",
    payment_snapshot: {
      masked: payment_method === "card" ? "•••• 4242" : undefined,
      message: "Pago registrado.",
    },
    items: orderItems,
  };
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
      body: `El ${productName} se siente firme, llego bien empacado y se ve igual que en el catalogo.`,
      date: "2026-07-18",
    },
    {
      author: "Carlos Rivera",
      rating: 4,
      title: "Buena compra",
      body: "La entrega fue clara y el mueble funciona bien para un espacio pequeno.",
      date: "2026-07-09",
    },
  ];
}

function findProduct(path) {
  const id = Number(pathId(path));
  return products.find((product) => product.id === id) || products[0];
}

function findReviewProduct(path) {
  const match = path.match(/\/catalog\/products\/([^/]+)\/reviews\//);
  const id = Number(match?.[1]);
  return products.find((product) => product.id === id) || products[0];
}

function findOrder(path) {
  const id = Number(pathId(path));
  return orders.find((order) => order.id === id) || orders[0];
}

function pathId(path) {
  return path.split("/").filter(Boolean).at(-1);
}

function getPreviewViewer() {
  if (typeof window === "undefined") return previewUsers.customer;
  const params = new URLSearchParams(window.location.search);
  return previewUsers[params.get("viewer")] || previewUsers.customer;
}

function isDevPreviewRoute() {
  return (
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    window.location.pathname === "/dev/preview"
  );
}

function normalizePath(url = "") {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
  let pathname = url;

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
