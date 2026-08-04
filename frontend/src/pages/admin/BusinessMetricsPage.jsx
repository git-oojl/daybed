// BusinessMetricsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import {
  FaArrowTrendUp,
  FaBoxOpen,
  FaChartPie,
  FaLocationDot,
  FaMoneyBillTrendUp,
  FaReceipt,
  FaTruckFast,
  FaTags,
  FaBox,
} from "react-icons/fa6";
import { Link } from "react-router-dom";
import "../../assets/CSS/admin/business-metrics.css";
import { routePaths } from "../../routes/routePaths.js";
import { dashboardService } from "../../services/backendServices.js";
import { inventoryService, catalogService } from "../../services/backendServices.js";
import { useAuthStore } from "../../auth/authStore.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { productImage, readCollection, statusLabel } from "../../services/viewMappers.js";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";

const ADMIN_HERO_IMAGE =
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1920&q=80";

// ============================================
// ✅ COMPONENTE METRIC CARD
// ============================================
function MetricCard({ icon, label, value, detail, trend, tone = "gold" }) {
  return (
    <article className={`business-metric-card business-metric-card--${tone}`}>
      <div className="business-metric-card__icon">{icon}</div>
      <div>
        <p className="business-metric-card__label">{label}</p>
        <strong className="business-metric-card__value">{value}</strong>
        <span className="business-metric-card__detail">
          {trend ? <FaArrowTrendUp aria-hidden="true" /> : null}
          {detail}
        </span>
      </div>
    </article>
  );
}

// ============================================
// ✅ ICONO DE CARGA
// ============================================
function IconLoading() {
  return (
    <svg className="business-metrics-loading__spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="2"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#B88E2F" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ============================================
// ✅ COMPONENTE DE CATEGORÍA
// ============================================
function CategoryItem({ category }) {
  return (
    <div className="business-category-item">
      <span className="business-category-item__name">{category.name}</span>
      <span className="business-category-item__count">{category.product_count || 0} productos</span>
    </div>
  );
}

// ============================================
// ✅ COMPONENTE DE PRODUCTO
// ============================================
function ProductItem({ product }) {
  return (
    <div className="business-product-item">
      <img
        src={productImage(product)}
        alt={product.name}
        className="business-product-item__image"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = productImage({});
        }}
      />
      <div className="business-product-item__info">
        <strong className="business-product-item__name">{product.name}</strong>
        <span className="business-product-item__sku">{product.sku || "Sin SKU"}</span>
      </div>
      <span className="business-product-item__stock">{product.stock || 0} uds.</span>
    </div>
  );
}

// ============================================
// ✅ COMPONENTE PRINCIPAL
// ============================================
function BusinessMetricsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // ============================================
  // ✅ DATOS ESTÁTICOS DE FALLBACK
  // ============================================
  const fallbackMetrics = {
    total_orders: 124,
    total_simulated_sales: 185500,
    average_delivery_fee: 280,
    average_delivery_distance: 18,
    orders_by_status: [
      { status: "delivered", label: "Entregados", value: 68, color: "#4d9b63" },
      { status: "preparing", label: "En proceso", value: 24, color: "#c99742" },
      { status: "pending", label: "Pendientes", value: 8, color: "#d7765d" },
    ],
    low_stock_count: 2,
    recent_orders: [],
    low_stock_products: [
      { name: "Daybed Roble", reference: "DB-104", units: 2, image: "/images/macetabotom4.jpeg" },
      { name: "Mesa auxiliar Nórdica", reference: "MN-208", units: 5, image: "/images/maceta5.jpeg" },
    ],
  };

  const fallbackCategories = [
    { id: 1, name: "Sofás", product_count: 12 },
    { id: 2, name: "Mesas", product_count: 8 },
    { id: 3, name: "Sillas", product_count: 15 },
    { id: 4, name: "Lámparas", product_count: 6 },
  ];

  const fallbackProducts = [
    { id: 1, name: "Sofá Cama Lino", sku: "DAY-SOF-001", stock: 8 },
    { id: 2, name: "Mesa Centro Fresno", sku: "DAY-MES-002", stock: 12 },
    { id: 3, name: "Silla Lectura Olivo", sku: "DAY-SIL-003", stock: 5 },
  ];

  // ============================================
  // ✅ CARGAR MÉTRICAS DEL BACKEND
  // ============================================
  const loadMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const [response, lowStockResponse, categoriesResponse, productsResponse] = await Promise.all([
        dashboardService.metrics(),
        inventoryService.lowStock(),
        catalogService.categories(),
        catalogService.products(),
      ]);

      // Mapear métricas
      const mappedMetrics = {
        total_orders: response.total_orders || 0,
        total_simulated_sales: response.total_simulated_sales || 0,
        average_delivery_fee: response.average_delivery_fee || 0,
        average_delivery_distance: response.average_delivery_distance || 0,
        orders_by_status: (response.orders_by_status || []).map((item) => ({
          ...item,
          label: statusLabel(item.status),
          value: item.count,
        })),
        low_stock_count: response.low_stock_count || 0,
        recent_orders: response.recent_orders || [],
        low_stock_products: readCollection(lowStockResponse).map((product) => ({
          name: product.name,
          reference: product.sku,
          units: product.stock,
          image: productImage(product),
        })),
      };

      setMetrics(mappedMetrics);

      // Mapear categorías
      const categoriesData = readCollection(categoriesResponse);
      setCategories(categoriesData);

      // Mapear productos (últimos 5)
      const productsData = readCollection(productsResponse);
      setProducts(productsData.slice(0, 5));

    } catch (err) {
      console.error("Error al cargar métricas:", err);
      setError(err.message || "Error al cargar las métricas");
      // Usar datos de fallback
      setMetrics(fallbackMetrics);
      setCategories(fallbackCategories);
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ✅ VERIFICAR AUTENTICACIÓN Y ROL
  // ============================================
  useEffect(() => {
    const initializeMetrics = async () => {
      if (!authLoading && !isAuthenticated) {
        navigate(routePaths.account.login);
        return;
      }

      if (!authLoading && isAuthenticated) {
        const viewerId = getViewerIdForUser(user);
        if (viewerId !== "admin" && viewerId !== "employee") {
          navigate(routePaths.support.unauthorized || "/no-autorizado");
          return;
        }
        await loadMetrics();
      }
    };

    initializeMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, user, navigate]);

  // ============================================
  // ✅ DATOS PARA MOSTRAR
  // ============================================
  const data = metrics || fallbackMetrics;

  const totalOrders = data.total_orders || 0;
  const totalSales = data.total_simulated_sales || 0;
  const avgDeliveryFee = data.average_delivery_fee || 0;
  const avgDistance = data.average_delivery_distance || 0;
  const orderStatusData = data.orders_by_status || [];
  const lowStockProducts = data.low_stock_products || [];

  const formatPrice = (amount) => {
    return `$${(Number(amount) || 0).toLocaleString("es-MX")} MXN`;
  };

  // ============================================
  // ✅ ESTADOS DE CARGA Y ERROR
  // ============================================
  if (loading || authLoading) {
    return (
      <div className="home-page business-metrics">
        <HomeHeader />
        <section className="business-metrics__hero" style={{ backgroundImage: `url(${ADMIN_HERO_IMAGE})` }}>
          <div className="business-metrics__hero-overlay">
            <h1>Métricas del negocio</h1>
            <nav aria-label="Miga de pan" className="business-metrics__breadcrumb">
              <Link to={routePaths.public.home}>Inicio</Link>
              <span aria-hidden="true">/</span>
              <span>Métricas del negocio</span>
            </nav>
          </div>
        </section>
        <div className="business-metrics-loading">
          <IconLoading />
          <p>Cargando métricas...</p>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="home-page business-metrics">
        <HomeHeader />
        <section className="business-metrics__hero" style={{ backgroundImage: `url(${ADMIN_HERO_IMAGE})` }}>
          <div className="business-metrics__hero-overlay">
            <h1>Métricas del negocio</h1>
            <nav aria-label="Miga de pan" className="business-metrics__breadcrumb">
              <Link to={routePaths.public.home}>Inicio</Link>
              <span aria-hidden="true">/</span>
              <span>Métricas del negocio</span>
            </nav>
          </div>
        </section>
        <div className="business-metrics-error">
          <p>
            <FaExclamationTriangle aria-hidden="true" />
            {error}
          </p>
          <button onClick={loadMetrics}>Reintentar</button>
        </div>
        <HomeFooter />
      </div>
    );
  }

  // ============================================
  // ✅ RENDER PRINCIPAL
  // ============================================
  return (
    <div className="home-page business-metrics">
      <HomeHeader />

      <section
        className="business-metrics__hero"
        style={{ backgroundImage: `url(${ADMIN_HERO_IMAGE})` }}
      >
        <div className="business-metrics__hero-overlay">
          <h1>Métricas del negocio</h1>
          <nav
            aria-label="Miga de pan"
            className="business-metrics__breadcrumb"
          >
            <Link to={routePaths.public.home}>Inicio</Link>
            <span aria-hidden="true">/</span>
            <span>Métricas del negocio</span>
          </nav>
        </div>
      </section>

      <main className="business-metrics__content">
        <div className="business-metrics__heading">
          <div>
            <p className="business-metrics__kicker">Panel administrativo</p>
            <h2>Resumen de rendimiento</h2>
            <p>Consulta el comportamiento de pedidos, ventas e inventario.</p>
          </div>
          <label className="business-metrics__range">
            <span>Rango de fechas</span>
            <select defaultValue="30">
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 3 meses</option>
            </select>
          </label>
        </div>

        <section
          className="business-metrics__summary"
          aria-label="Resumen de métricas"
        >
          <MetricCard
            icon={<FaReceipt />}
            label="Total de pedidos"
            value={totalOrders}
            detail="Pedidos del periodo"
            trend
          />
          <MetricCard
            icon={<FaMoneyBillTrendUp />}
            label="Ventas simuladas"
            value={formatPrice(totalSales)}
            detail="Ingresos del periodo"
            tone="green"
          />
          <MetricCard
            icon={<FaTruckFast />}
            label="Costo promedio de entrega"
            value={formatPrice(avgDeliveryFee)}
            detail="Por pedido entregado"
            tone="blue"
          />
          <MetricCard
            icon={<FaLocationDot />}
            label="Distancia estimada"
            value={`${avgDistance} km`}
            detail="Promedio por entrega"
            tone="terracotta"
          />
        </section>

        <section className="business-metrics__grid">
          <article className="business-panel business-panel--stock">
            <div className="business-panel__heading">
              <div>
                <p className="business-panel__overline">
                  <FaExclamationTriangle /> Atención requerida
                </p>
                <h3>Productos con bajo stock</h3>
              </div>
              <Link to={routePaths.backOffice.inventory}>Ver inventario</Link>
            </div>
            <div className="business-stock-list">
              {lowStockProducts.length === 0 ? (
                <div className="business-stock-empty">
                  No hay productos con bajo stock
                </div>
              ) : (
                lowStockProducts.map((product) => (
                  <div className="business-stock-item" key={product.reference}>
                    <img
                      src={product.image || productImage({})}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = productImage({});
                      }}
                    />
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.reference}</span>
                    </div>
                    <b>{product.units} uds.</b>
                  </div>
                ))
              )}
            </div>
            <p className="business-panel__notice">
              {data.low_stock_count || 0} productos requieren reposición próxima.
            </p>
          </article>

          <article className="business-panel">
            <div className="business-panel__heading">
              <div>
                <p className="business-panel__overline">
                  <FaChartPie /> Distribución
                </p>
                <h3>Pedidos por estado</h3>
              </div>
              <span className="business-panel__total">{totalOrders} pedidos</span>
            </div>
            <div
              className="business-status-chart"
              aria-label="Distribución de pedidos por estado"
            >
              <div className="business-status-chart__donut">
                <span>
                  {totalOrders}<small>%</small>
                </span>
              </div>
              <div className="business-status-chart__legend">
                {orderStatusData.map((status) => (
                  <div key={status.status || status.label}>
                    <span style={{ backgroundColor: status.color || "#B88E2F" }} />
                    <p>
                      {status.label}
                      <b>{status.value || status.count || 0}%</b>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>

        {/* ============================================
            ✅ CATEGORÍAS Y PRODUCTOS
            ============================================ */}
        <section className="business-metrics__catalog">
          <div className="business-metrics__catalog-grid">
            {/* CATEGORÍAS */}
            <article className="business-panel business-panel--categories">
              <div className="business-panel__heading">
                <div>
                  <p className="business-panel__overline">
                    <FaTags /> Catálogo
                  </p>
                  <h3>Categorías</h3>
                </div>
                <Link to={routePaths.backOffice.categories}>Ver todas</Link>
              </div>
              <div className="business-categories-list">
                {categories.length === 0 ? (
                  <div className="business-categories-empty">
                    No hay categorías registradas
                  </div>
                ) : (
                  categories.map((category) => (
                    <CategoryItem key={category.id} category={category} />
                  ))
                )}
              </div>
            </article>

            {/* PRODUCTOS RECIENTES */}
            <article className="business-panel business-panel--products">
              <div className="business-panel__heading">
                <div>
                  <p className="business-panel__overline">
                    <FaBox /> Últimos
                  </p>
                  <h3>Productos agregados</h3>
                </div>
                <Link to={routePaths.backOffice.products}>Ver todos</Link>
              </div>
              <div className="business-products-list">
                {products.length === 0 ? (
                  <div className="business-products-empty">
                    No hay productos registrados
                  </div>
                ) : (
                  products.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                )}
              </div>
            </article>
          </div>
        </section>

        <section className="business-insight" aria-label="Indicador principal">
          <div className="business-insight__icon">
            <FaBoxOpen />
          </div>
          <div>
            <p>Indicador del periodo</p>
            <strong>
              {totalOrders > 0
                ? `Los pedidos entregados representan el ${orderStatusData[0]?.value || 68}% del total.`
                : "Cargando indicadores..."}
            </strong>
          </div>
          <Link to={routePaths.backOffice.orders}>Revisar pedidos</Link>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}

export default BusinessMetricsPage;
