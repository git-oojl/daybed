import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import FeatureState from "../../components/support/FeatureState.jsx";
import { routePaths } from "../../routes/routePaths.js";
import {
  FaBoxOpen,
  FaBoxes,
  FaClipboardList,
  FaDollarSign,
  FaExclamationTriangle,
  FaShoppingBag,
  FaTags,
  FaUserTie,
} from "react-icons/fa";
import { dashboardService } from "../../services/backendServices.js";

function translateStatus(status) {
  const labels = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    preparing: "Preparando",
    shipped: "En camino",
    delivered: "Entregado",
    cancelled: "Cancelado",
    paid: "Pagado",
    processing: "Procesando",
    completed: "Completado",
  };
  return labels[String(status || "").toLowerCase()] || status || "Pendiente";
}

function statusColor(label) {
  const colors = {
    Pendiente: "#C78526",
    Confirmado: "#3A6EA5",
    Preparando: "#8A5CB5",
    "En camino": "#3C8D9E",
    Entregado: "#3F7B4E",
    Cancelado: "#A5524A",
    Pagado: "#6A8E35",
    Procesando: "#B96726",
    Completado: "#3F7B4E",
  };
  return colors[label] || "#8B5E3C";
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("es-MX")}`;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [salesByMonth, setSalesByMonth] = useState([]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.metrics();

      setMetrics([
        {
          icon: <FaShoppingBag size={24} />,
          label: "Pedidos",
          value: data.total_orders || data.orders_count || 0,
          tone: "#8B5E3C",
        },
        {
          icon: <FaDollarSign size={24} />,
          label: "Ventas",
          value: formatMoney(data.total_sales || data.sales_total || 0),
          tone: "#4D7B57",
        },
        {
          icon: <FaBoxes size={24} />,
          label: "Productos",
          value: data.total_products || data.products_count || 0,
          tone: "#546E8A",
        },
        {
          icon: <FaExclamationTriangle size={24} />,
          label: "Bajo stock",
          value: data.low_stock_count || data.low_stock?.length || 0,
          tone: "#B96726",
        },
      ]);

      setOrders(
        Array.isArray(data.recent_orders)
          ? data.recent_orders.map((order) => {
              const state = translateStatus(order.status || order.estado);
              return {
                id: order.id || order.order_id,
                code: `DAY-${String(order.id || order.order_id || 0).padStart(5, "0")}`,
                customer:
                  order.customer_name ||
                  order.cliente ||
                  order.customer ||
                  "Cliente",
                total: formatMoney(order.total || 0),
                status: state,
              };
            })
          : [],
      );

      setLowStock(
        Array.isArray(data.low_stock)
          ? data.low_stock.map((item) => ({
              name: item.name || item.nombre || "Producto",
              stock: item.stock || item.cantidad || 0,
            }))
          : [],
      );

      setSalesByMonth(
        Array.isArray(data.sales_by_month)
          ? data.sales_by_month.map((item) => ({
              month: item.month || item.mes || "Mes",
              amount: Number(item.total || item.monto || item.amount || 0),
            }))
          : [],
      );
    } catch (requestError) {
      setError(
        requestError?.message || "No pudimos cargar el resumen operativo.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadDashboard, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadDashboard]);

  const topSalesMonth = useMemo(
    () =>
      salesByMonth.reduce(
        (best, item) => (item.amount > best.amount ? item : best),
        { month: "—", amount: 0 },
      ),
    [salesByMonth],
  );

  const quickLinks = [
    {
      icon: <FaClipboardList />,
      title: "Pedidos",
      text: "Seguimiento y cambios de estado",
      to: routePaths.backOffice.orders,
    },
    {
      icon: <FaBoxOpen />,
      title: "Productos",
      text: "Fichas, imágenes y destacados",
      to: routePaths.backOffice.products,
    },
    {
      icon: <FaTags />,
      title: "Colecciones",
      text: "Portada, orden y filtros",
      to: routePaths.backOffice.categories,
    },
    {
      icon: <FaUserTie />,
      title: "Inventario",
      text: "Stock real y alertas",
      to: routePaths.backOffice.inventory,
    },
  ];

  if (loading) {
    return (
      <div className="home-page dashboard-page">
        <HomeHeader />
        <main className="dashboard-container">
          <FeatureState
            tone="loading"
            title="Cargando operación"
            message="Estamos reuniendo pedidos, ventas, catálogo e inventario."
          />
        </main>
        <HomeFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page dashboard-page">
        <HomeHeader />
        <main className="dashboard-container">
          <FeatureState
            tone="error"
            title="No pudimos cargar la operación"
            message={error}
            actionLabel="Actualizar resumen"
            onAction={loadDashboard}
          />
        </main>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="home-page dashboard-page">
      <HomeHeader />
      <PageHero
        title="Panel operativo"
        eyebrow="Operación"
        image="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1800&q=82"
        current="Panel operativo"
      />

      <main className="dashboard-container">
        <section className="dashboard-header-actions">
          <div>
            <p className="section-kicker">Resumen del día</p>
            <h2>Pedidos, catálogo e inventario</h2>
            <p
              style={{
                color: "#705c4b",
                marginTop: "8px",
                fontSize: "0.98rem",
              }}
            >
              Vista rápida de lo que requiere atención y accesos directos a las
              áreas operativas.
            </p>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "18px",
            marginBottom: "24px",
          }}
        >
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="stat-summary-card"
              style={{
                padding: "20px",
                border: "1px solid #dfcdb8",
                borderRadius: "18px",
                background: "#fffaf3",
                display: "grid",
                gap: "10px",
              }}
            >
              <span
                style={{
                  width: "48px",
                  height: "48px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "14px",
                  background: `${metric.tone}18`,
                  color: metric.tone,
                }}
              >
                {metric.icon}
              </span>
              <span
                style={{
                  color: "#7c6856",
                  fontSize: ".78rem",
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  fontWeight: 800,
                }}
              >
                {metric.label}
              </span>
              <strong
                style={{
                  color: "#403025",
                  fontSize: "clamp(1.45rem, 3vw, 2rem)",
                }}
              >
                {metric.value}
              </strong>
            </article>
          ))}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.45fr .95fr",
            gap: "22px",
            marginBottom: "24px",
          }}
        >
          <article
            className="dashboard-card"
            style={{
              padding: "22px",
              border: "1px solid #dfcdb8",
              borderRadius: "18px",
              background: "#fffaf3",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <p className="section-kicker">Actividad reciente</p>
                <h3 style={{ margin: 0, color: "#49362b" }}>
                  <FaClipboardList /> Pedidos recientes
                </h3>
              </div>
              <Link to={routePaths.backOffice.orders} className="btn-primary">
                Ver pedidos
              </Link>
            </div>

            <div className="table-responsive">
              <table
                className="dashboard-table"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #eadccc" }}>
                    <th style={{ textAlign: "left", padding: "10px 8px" }}>
                      Pedido
                    </th>
                    <th style={{ textAlign: "left", padding: "10px 8px" }}>
                      Cliente
                    </th>
                    <th style={{ textAlign: "left", padding: "10px 8px" }}>
                      Total
                    </th>
                    <th style={{ textAlign: "left", padding: "10px 8px" }}>
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length ? (
                    orders.map((order) => (
                      <tr
                        key={order.code}
                        style={{ borderBottom: "1px solid #f1e7da" }}
                      >
                        <td
                          style={{
                            padding: "10px 8px",
                            fontWeight: 700,
                            color: "#7a5840",
                          }}
                        >
                          <Link
                            to={routePaths.backOffice.orderDetail.replace(
                              ":orderId",
                              order.id,
                            )}
                            style={{
                              color: "inherit",
                              textDecoration: "none",
                            }}
                          >
                            {order.code}
                          </Link>
                        </td>
                        <td style={{ padding: "10px 8px" }}>{order.customer}</td>
                        <td style={{ padding: "10px 8px", fontWeight: 700 }}>
                          {order.total}
                        </td>
                        <td style={{ padding: "10px 8px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              minHeight: "28px",
                              padding: "0 12px",
                              borderRadius: "999px",
                              background: `${statusColor(order.status)}20`,
                              color: statusColor(order.status),
                              fontSize: ".76rem",
                              fontWeight: 800,
                            }}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          padding: "16px 8px",
                          textAlign: "center",
                          color: "#7c6856",
                        }}
                      >
                        No hay pedidos recientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article
            className="dashboard-card"
            style={{
              padding: "22px",
              border: "1px solid #dfcdb8",
              borderRadius: "18px",
              background: "#fffaf3",
            }}
          >
            <p className="section-kicker">Atención inmediata</p>
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: 0,
                color: "#49362b",
              }}
            >
              <FaExclamationTriangle /> Inventario crítico
            </h3>

            {lowStock.length ? (
              <div style={{ display: "grid", gap: "10px" }}>
                {lowStock.map((item) => (
                  <div
                    key={`${item.name}-${item.stock}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 14px",
                      border: "1px solid #eadccc",
                      borderRadius: "12px",
                      background: "#f8efe5",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: "28px",
                        padding: "0 10px",
                        borderRadius: "999px",
                        background: "#fff2df",
                        color: "#b96726",
                        fontSize: ".76rem",
                        fontWeight: 800,
                      }}
                    >
                      {item.stock} en stock
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: "#7c6856" }}>
                Todo el inventario está en niveles saludables.
              </p>
            )}

            <Link
              to={routePaths.backOffice.inventory}
              className="btn-primary"
              style={{ marginTop: "16px" }}
            >
              Abrir inventario
            </Link>
          </article>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "22px",
          }}
        >
          <article
            className="dashboard-card"
            style={{
              padding: "22px",
              border: "1px solid #dfcdb8",
              borderRadius: "18px",
              background: "#fffaf3",
            }}
          >
            <p className="section-kicker">Ventas</p>
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: 0,
                color: "#49362b",
              }}
            >
              <FaDollarSign /> Ritmo mensual
            </h3>
            <p style={{ margin: "0 0 18px", color: "#755f4c" }}>
              Mes más alto:{" "}
              <strong style={{ color: "#49362b" }}>
                {topSalesMonth.month}
              </strong>{" "}
              con {formatMoney(topSalesMonth.amount)}
            </p>

            {salesByMonth.length ? (
              <div style={{ display: "grid", gap: "14px" }}>
                {salesByMonth.map((item) => (
                  <div key={item.month}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        marginBottom: "6px",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{item.month}</span>
                      <span style={{ fontWeight: 700 }}>
                        {formatMoney(item.amount)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "8px",
                        borderRadius: "999px",
                        overflow: "hidden",
                        background: "#eadccc",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(
                            (item.amount /
                              Math.max(...salesByMonth.map((row) => row.amount), 1)) *
                              100,
                            100,
                          )}%`,
                          height: "100%",
                          borderRadius: "999px",
                          background:
                            "linear-gradient(90deg, #8B5E3C, #C08C5A)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: "#7c6856" }}>
                Sin datos de ventas por mes.
              </p>
            )}
          </article>

          <article
            className="dashboard-card"
            style={{
              padding: "22px",
              border: "1px solid #dfcdb8",
              borderRadius: "18px",
              background: "#fffaf3",
            }}
          >
            <p className="section-kicker">Accesos rápidos</p>
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: 0,
                color: "#49362b",
              }}
            >
              <FaUserTie /> Áreas operativas
            </h3>

            <div style={{ display: "grid", gap: "12px" }}>
              {quickLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "42px 1fr",
                    gap: "12px",
                    alignItems: "center",
                    padding: "14px",
                    border: "1px solid #eadccc",
                    borderRadius: "14px",
                    background: "#f8efe5",
                    color: "#4f3a2c",
                    textDecoration: "none",
                  }}
                >
                  <span
                    style={{
                      width: "42px",
                      height: "42px",
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "12px",
                      background: "#765238",
                      color: "#fffaf3",
                    }}
                  >
                    {item.icon}
                  </span>
                  <span style={{ display: "grid", gap: "3px" }}>
                    <strong>{item.title}</strong>
                    <small style={{ color: "#7b6655" }}>{item.text}</small>
                  </span>
                </Link>
              ))}
            </div>
          </article>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}
