import { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import {
  FaShoppingBag,
  FaBoxes,
  FaDollarSign,
  FaExclamationTriangle,
  FaClipboardList,
  FaBoxOpen,
  FaTags,
  FaUserTie,
} from "react-icons/fa";
import { dashboardService } from "../../services/backendServices.js";
import LoadingState from "../../components/support/LoadingState.jsx";
import ErrorMessage from "../../components/support/ErrorMessage.jsx";

export default function DashboardPage() {
  // ✅ Estados para datos del backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Estados para los datos del dashboard
  const [ventasPorMes, setVentasPorMes] = useState([
    { mes: "Enero", monto: 5000 },
    { mes: "Febrero", monto: 8000 },
    { mes: "Marzo", monto: 12000 },
    { mes: "Abril", monto: 15000 },
    { mes: "Mayo", monto: 20000 },
  ]);

  const [productosBajoStock, setProductosBajoStock] = useState([
    { nombre: "Sofá Esquinero", stock: 2 },
    { nombre: "Mesa de Centro", stock: 3 },
    { nombre: "Silla Ergonómica", stock: 1 },
    { nombre: "Lámpara de Pie", stock: 0 },
  ]);

  const [pedidos, setPedidos] = useState([
    {
      id: "#DAY001",
      cliente: "Ana García",
      total: "$4,200",
      estado: "Preparando",
    },
    {
      id: "#DAY002",
      cliente: "Luis Pérez",
      total: "$8,999",
      estado: "Confirmado",
    },
    {
      id: "#DAY003",
      cliente: "María López",
      total: "$2,800",
      estado: "Enviado",
    },
    {
      id: "#DAY004",
      cliente: "Carlos Ruiz",
      total: "$6,500",
      estado: "Entregado",
    },
  ]);

  const [metrics, setMetrics] = useState([
    {
      icon: <FaShoppingBag size={28} />,
      label: "Pedidos",
      value: 18,
      color: "#8B5E3C",
    },
    {
      icon: <FaDollarSign size={28} />,
      label: "Ventas",
      value: "$24,850",
      color: "#2E7D32",
    },
    {
      icon: <FaBoxes size={28} />,
      label: "Productos",
      value: 128,
      color: "#1565C0",
    },
    {
      icon: <FaExclamationTriangle size={28} />,
      label: "Bajo Stock",
      value: 6,
      color: "#D84315",
    },
  ]);

  // ✅ Función para traducir estados del backend a español
  const traducirEstado = useCallback((estado) => {
    const estados = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'preparing': 'Preparando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado',
      'paid': 'Pagado',
      'processing': 'Procesando',
      'completed': 'Completado',
    };
    return estados[estado?.toLowerCase()] || estado || 'Pendiente';
  }, []);

  // ✅ Función para obtener color según estado
  const getEstadoColor = (estado) => {
    const colores = {
      'Pendiente': '#FF9800',
      'Confirmado': '#2196F3',
      'Preparando': '#9C27B0',
      'Enviado': '#00BCD4',
      'Entregado': '#4CAF50',
      'Cancelado': '#F44336',
      'Pagado': '#8BC34A',
      'Procesando': '#FF5722',
      'Completado': '#2E7D32',
    };
    return colores[estado] || '#8B5E3C';
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const data = await dashboardService.metrics();

      // ✅ Actualizar métricas con datos del backend
      setMetrics([
        {
          icon: <FaShoppingBag size={28} />,
          label: "Pedidos",
          value: data.total_orders || data.orders_count || 0,
          color: "#8B5E3C",
        },
        {
          icon: <FaDollarSign size={28} />,
          label: "Ventas",
          value: data.total_sales 
            ? `$${Number(data.total_sales).toLocaleString()}`
            : data.sales_total 
              ? `$${Number(data.sales_total).toLocaleString()}`
              : "$0",
          color: "#2E7D32",
        },
        {
          icon: <FaBoxes size={28} />,
          label: "Productos",
          value: data.total_products || data.products_count || 0,
          color: "#1565C0",
        },
        {
          icon: <FaExclamationTriangle size={28} />,
          label: "Bajo Stock",
          value: data.low_stock_count || data.low_stock?.length || 0,
          color: "#D84315",
        },
      ]);

      // ✅ Actualizar pedidos recientes con estados traducidos
      if (data.recent_orders && data.recent_orders.length > 0) {
        setPedidos(data.recent_orders.map(order => {
          const estadoTraducido = traducirEstado(order.status || order.estado);
          return {
            id: order.id || order.order_id || `#${String(Math.random()).slice(2, 8)}`,
            cliente: order.customer_name || order.cliente || order.customer || "Cliente",
            total: order.total ? `$${order.total.toLocaleString()}` : "$0",
            estado: estadoTraducido,
            _estadoOriginal: order.status || order.estado, // Guardamos original por si acaso
          };
        }));
      }

      // ✅ Actualizar productos con bajo stock
      if (data.low_stock && data.low_stock.length > 0) {
        setProductosBajoStock(data.low_stock.map(item => ({
          nombre: item.name || item.nombre || "Producto",
          stock: item.stock || item.cantidad || 0,
        })));
      }

      // ✅ Actualizar ventas por mes
      if (data.sales_by_month && data.sales_by_month.length > 0) {
        setVentasPorMes(data.sales_by_month.map(item => ({
          mes: item.month || item.mes || "Mes",
          monto: Number(item.total || item.monto || item.amount || 0),
        })));
      }

    } catch (err) {
      console.error("Error al cargar dashboard:", err);
      setError(err.message || "Error al cargar los datos del dashboard");
      // Si falla, mantener los datos de ejemplo
    } finally {
      setLoading(false);
    }
  }, [traducirEstado]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchDashboardData();
  };

  // ✅ Cargar datos del dashboard desde el backend
  useEffect(() => {
    const timeoutId = window.setTimeout(fetchDashboardData, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchDashboardData]);

  // ✅ Estados de carga y error
  if (loading) {
    return (
      <div className="home-page dashboard-page">
        <HomeHeader />
        <LoadingState message="Cargando dashboard..." />
        <HomeFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page dashboard-page">
        <HomeHeader />
        <ErrorMessage message={error} />
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={handleRetry} className="btn-primary">
            Reintentar
          </button>
        </div>
        <HomeFooter />
      </div>
    );
  }

  // ✅ El resto del diseño se mantiene IGUAL
  return (
    <div className="home-page dashboard-page">
      <HomeHeader />

      <section
        className="dashboard-hero"
        aria-label="Dashboard"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          minHeight: "230px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(50,35,22,.72)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "40px 20px",
          }}
        >
          <h1
            style={{
              color: "#fff",
              fontSize: "3rem",
              marginBottom: "10px",
              fontWeight: "700",
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Dashboard Interno
          </h1>
          <p style={{ color: "#F5EDE5", fontSize: "18px" }}>
            <Link
              to={routePaths.public.home}
              style={{ color: "#FFD36A", textDecoration: "none" }}
            >
              Inicio
            </Link>
            <span style={{ margin: "0 8px" }}>{">"}</span>
            Dashboard
          </p>
        </div>
      </section>

      <main className="dashboard-container">
        <div className="dashboard-header-actions">
          <div>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}>
              Dashboard de Empleado
            </h2>
            <p
              style={{
                color: "#777",
                marginTop: "10px",
                fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
              }}
            >
              Administra pedidos, productos, categorías e inventario.
            </p>
          </div>
        </div>

        {/* Tarjetas de métricas - Responsive */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="stat-summary-card"
              style={{
                padding: "20px",
                background: "#FDF8F0",
                border: "1px solid #E8DCCC",
                borderRadius: "16px",
                textAlign: "center",
                transition: "transform 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div style={{ color: metric.color, marginBottom: "8px" }}>
                {metric.icon}
              </div>
              <span
                className="stat-summary-label"
                style={{ display: "block", fontSize: "0.85rem", color: "#666" }}
              >
                {metric.label}
              </span>
              <span
                className="stat-summary-value"
                style={{
                  display: "block",
                  fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                  fontWeight: 700,
                  color: metric.color,
                }}
              >
                {metric.value}
              </span>
            </div>
          ))}
        </div>

        {/* Grid principal - Pedidos recientes + Inventario crítico */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: "30px",
            marginBottom: "35px",
          }}
        >
          {/* Pedidos recientes */}
          <div
            className="dashboard-card"
            style={{
              padding: "24px",
              background: "#FDF8F0",
              border: "1px solid #E8DCCC",
              borderRadius: "16px",
            }}
          >
            <div
              className="dashboard-card-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
                  color: "#8B5E3C",
                }}
              >
                <FaClipboardList /> Pedidos recientes
              </h3>
              <Link
                to={routePaths.backOffice.orders}
                className="btn-primary"
                style={{
                  background: "#8B5E3C",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                }}
              >
                Ver todos
              </Link>
            </div>
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table
                className="dashboard-table"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #E8DCCC" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 8px",
                        color: "#6B4A2B",
                      }}
                    >
                      Pedido
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 8px",
                        color: "#6B4A2B",
                      }}
                    >
                      Cliente
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 8px",
                        color: "#6B4A2B",
                      }}
                    >
                      Total
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 8px",
                        color: "#6B4A2B",
                      }}
                    >
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr
                      key={pedido.id}
                      style={{ borderBottom: "1px solid #F0EBE3" }}
                    >
                      <td
                        style={{
                          padding: "10px 8px",
                          fontWeight: 600,
                          color: "#8B5E3C",
                        }}
                      >
                        {pedido.id}
                      </td>
                      <td style={{ padding: "10px 8px" }}>{pedido.cliente}</td>
                      <td style={{ padding: "10px 8px", fontWeight: 600 }}>
                        {pedido.total}
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <span
                          style={{
                            background: `${getEstadoColor(pedido.estado)}22`,
                            color: getEstadoColor(pedido.estado),
                            padding: "4px 14px",
                            borderRadius: "20px",
                            fontWeight: 600,
                            fontSize: ".8rem",
                            display: "inline-block",
                            border: `1px solid ${getEstadoColor(pedido.estado)}44`,
                          }}
                        >
                          {pedido.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inventario crítico */}
          <div
            className="dashboard-card"
            style={{
              padding: "24px",
              background: "#FDF8F0",
              border: "1px solid #E8DCCC",
              borderRadius: "16px",
            }}
          >
            <div
              className="dashboard-card-header"
              style={{ marginBottom: "20px" }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
                  color: "#8B5E3C",
                }}
              >
                <FaBoxes /> Inventario crítico
              </h3>
            </div>
            {productosBajoStock.map((producto) => (
              <div
                key={producto.nombre}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 0",
                  borderBottom: "1px solid #F0EBE3",
                }}
              >
                <div>
                  <strong style={{ fontSize: "clamp(0.9rem, 1.2vw, 1rem)" }}>
                    {producto.nombre}
                  </strong>
                  <div
                    style={{
                      color: "#888",
                      fontSize: "0.8rem",
                      marginTop: "4px",
                    }}
                  >
                    Requiere reposición
                  </div>
                </div>
                <span
                  style={{
                    background: producto.stock === 0 ? "#FDECEA" : "#FFF3E0",
                    color: producto.stock === 0 ? "#C62828" : "#EF6C00",
                    padding: "6px 16px",
                    borderRadius: "25px",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                >
                  {producto.stock}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Segunda fila - Ventas por mes + Productos bajo stock */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: "30px",
            marginBottom: "35px",
          }}
        >
          {/* Ventas por mes */}
          <div
            className="dashboard-card"
            style={{
              padding: "24px",
              background: "#FDF8F0",
              border: "1px solid #E8DCCC",
              borderRadius: "16px",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
                color: "#8B5E3C",
                marginBottom: "20px",
              }}
            >
              <FaDollarSign /> Ventas por mes
            </h3>
            {ventasPorMes.map((venta) => (
              <div
                key={venta.mes}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid #F0EBE3",
                }}
              >
                <span style={{ fontSize: "clamp(0.9rem, 1.1vw, 1rem)" }}>
                  {venta.mes}
                </span>
                <strong style={{ fontSize: "clamp(0.9rem, 1.1vw, 1rem)" }}>
                  ${venta.monto.toLocaleString()}
                </strong>
              </div>
            ))}
            <div
              style={{
                marginTop: "15px",
                paddingTop: "15px",
                borderTop: "2px solid #8B5E3C",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)",
              }}
            >
              <span>Total del año</span>
              <strong>
                $
                {ventasPorMes
                  .reduce((acc, v) => acc + v.monto, 0)
                  .toLocaleString()}{" "}
                MX
              </strong>
            </div>
          </div>

          {/* Productos con bajo stock */}
          <div
            className="dashboard-card"
            style={{
              padding: "24px",
              background: "#FDF8F0",
              border: "1px solid #E8DCCC",
              borderRadius: "16px",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
                color: "#8B5E3C",
                marginBottom: "20px",
              }}
            >
              <FaExclamationTriangle /> Productos con bajo stock
            </h3>
            {productosBajoStock.map((producto) => (
              <div
                key={producto.nombre}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid #F0EBE3",
                }}
              >
                <span style={{ fontSize: "clamp(0.9rem, 1.1vw, 1rem)" }}>
                  {producto.nombre}
                </span>
                <strong
                  style={{
                    color: producto.stock === 0 ? "#D32F2F" : "#D28B00",
                    fontSize: "clamp(0.9rem, 1.1vw, 1rem)",
                  }}
                >
                  Stock {producto.stock}
                </strong>
              </div>
            ))}
            <div
              style={{
                marginTop: "15px",
                paddingTop: "15px",
                borderTop: "2px solid #D32F2F",
                textAlign: "center",
                color: "#D32F2F",
                fontWeight: "bold",
                fontSize: "clamp(0.85rem, 1.1vw, 1rem)",
              }}
            >
              {productosBajoStock.filter(p => p.stock === 0).length} producto{productosBajoStock.filter(p => p.stock === 0).length !== 1 ? 's' : ''} necesita reabastecimiento inmediato.
            </div>
          </div>
        </div>

        {/* Accesos rápidos + Información del empleado */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: "30px",
            marginBottom: "50px",
          }}
        >
          {/* Accesos rápidos */}
          <div
            className="dashboard-card"
            style={{
              padding: "24px",
              background: "#FDF8F0",
              border: "1px solid #E8DCCC",
              borderRadius: "16px",
            }}
          >
            <div
              className="dashboard-card-header"
              style={{ marginBottom: "20px" }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
                  color: "#8B5E3C",
                }}
              >
                <FaBoxOpen /> Accesos rápidos
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "16px",
              }}
            >
              {[
                {
                  to: routePaths.backOffice.products,
                  icon: <FaBoxOpen size={32} color="#8B5E3C" />,
                  label: "Productos",
                },
                {
                  to: routePaths.backOffice.categories,
                  icon: <FaTags size={32} color="#8B5E3C" />,
                  label: "Categorías",
                },
                {
                  to: routePaths.backOffice.inventory,
                  icon: <FaBoxes size={32} color="#8B5E3C" />,
                  label: "Inventario",
                },
                {
                  to: routePaths.backOffice.orders,
                  icon: <FaShoppingBag size={32} color="#8B5E3C" />,
                  label: "Pedidos",
                },
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "#F8F3ED",
                      border: "1px solid #E8DCCC",
                      borderRadius: "16px",
                      padding: "20px",
                      textAlign: "center",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 20px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ marginBottom: "12px" }}>{item.icon}</div>
                    <h4
                      style={{
                        margin: 0,
                        color: "#5C2E0B",
                        fontSize: "clamp(0.85rem, 1.1vw, 1rem)",
                      }}
                    >
                      {item.label}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Información del empleado */}
          <div
            className="dashboard-card"
            style={{
              padding: "24px",
              background: "#FDF8F0",
              border: "1px solid #E8DCCC",
              borderRadius: "16px",
            }}
          >
            <div
              className="dashboard-card-header"
              style={{ marginBottom: "20px" }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
                  color: "#8B5E3C",
                }}
              >
                <FaUserTie /> Información del empleado
              </h3>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "25px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: "75px",
                  height: "75px",
                  borderRadius: "50%",
                  background: "#E8DCCC",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <FaUserTie size={34} color="#8B5E3C" />
              </div>
              <div>
                <h3
                  style={{
                    marginBottom: "6px",
                    color: "#5C2E0B",
                    fontSize: "clamp(1rem, 1.3vw, 1.2rem)",
                  }}
                >
                  Empleado DayBed
                </h3>
                <p
                  style={{
                    color: "#777",
                    fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                  }}
                >
                  Área de ventas
                </p>
              </div>
            </div>
            <div style={{ display: "grid", gap: "14px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #F0EBE3",
                  paddingBottom: "10px",
                }}
              >
                <span style={{ fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                  Pedidos procesados hoy
                </span>
                <strong style={{ fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                  {pedidos.length}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #F0EBE3",
                  paddingBottom: "10px",
                }}
              >
                <span style={{ fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                  Productos registrados
                </span>
                <strong style={{ fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                  {metrics.find(m => m.label === "Productos")?.value || 0}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #F0EBE3",
                  paddingBottom: "10px",
                }}
              >
                <span style={{ fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                  Categorías activas
                </span>
                <strong style={{ fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                  12
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                  Estado del sistema
                </span>
                <strong
                  style={{
                    color: "#2E7D32",
                    fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                  }}
                >
                  Operativo
                </strong>
              </div>
            </div>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
