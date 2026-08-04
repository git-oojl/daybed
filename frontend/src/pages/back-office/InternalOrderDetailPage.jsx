// InternalOrderDetailPage.jsx
import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import { orderService } from "../../services/backendServices.js";
import { useAuthStore } from "../../auth/authStore.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import {
  FaUser,
  FaBox,
  FaTruck,
  FaMapMarkerAlt,
  FaEdit,
  FaTimes,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaPhone,
  FaEnvelope,
  FaUserCircle,
} from "react-icons/fa";

// ============================================
// ✅ MAPA DE ESTADOS
// ============================================
const STATUS_MAP = {
  pending: { label: "Pendiente", color: "#ED6C02", bg: "#FFF8E1", icon: FaClock },
  confirmed: { label: "Confirmado", color: "#2E7D32", bg: "#E8F5E9", icon: FaCheckCircle },
  preparing: { label: "En preparación", color: "#6A5ACD", bg: "#EDE7F6", icon: FaBox },
  shipped: { label: "Enviado", color: "#0288D1", bg: "#E1F5FE", icon: FaTruck },
  delivered: { label: "Entregado", color: "#2E7D32", bg: "#E8F5E9", icon: FaCheckCircle },
  cancelled: { label: "Cancelado", color: "#D32F2F", bg: "#FDECEA", icon: FaTimesCircle },
};

function getStatusInfo(status) {
  return STATUS_MAP[status] || STATUS_MAP.pending;
}

// ============================================
// ✅ COMPONENTE DE CARGA
// ============================================
function IconLoading() {
  return (
    <svg className="internal-order-detail-loading__spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="2"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#B88E2F" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ============================================
// ✅ COMPONENTE PRINCIPAL
// ============================================
export default function InternalOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  // ============================================
  // ✅ CARGAR PEDIDO
  // ============================================
  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const orderData = await orderService.manageDetail(orderId);
      setOrder(orderData);
    } catch (err) {
      console.error("Error al cargar pedido:", err);
      setError(err.message || "No se pudo cargar el pedido");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // ============================================
  // ✅ VERIFICAR AUTENTICACIÓN Y ROL
  // ============================================
  useEffect(() => {
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
      const timeoutId = window.setTimeout(loadOrder, 0);
      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [isAuthenticated, authLoading, user, navigate, loadOrder]);

  // ============================================
  // ✅ FUNCIONES AUXILIARES
  // ============================================
  const formatPrice = (amount) => {
    return `$${(Number(amount) || 0).toLocaleString("es-MX")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ============================================
  // ✅ OBTENER DATOS DEL CLIENTE
  // ============================================
  const getCustomerName = () => {
    if (order?.customer_name) return order.customer_name;
    return "Cliente";
  };

  const getCustomerEmail = () => {
    if (order?.customer_email) return order.customer_email;
    return "No disponible";
  };

  const getCustomerPhone = () => {
    if (order?.customer_phone) return order.customer_phone;
    return "No disponible";
  };

  // ============================================
  // ✅ ESTADOS DE CARGA
  // ============================================
  if (loading || authLoading) {
    return (
      <div className="home-page dashboard-page">
        <HomeHeader />
        <section className="dashboard-hero" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
          <div className="dashboard-hero__overlay" style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(62, 42, 27, 0.75)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            width: "100%",
            height: "100%",
          }}>
            <h1 className="dashboard-hero__title" style={{
              color: "#FFFFFF",
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: 700,
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              margin: 0,
              fontFamily: '"Playfair Display", serif',
            }}>Detalle de Pedido</h1>
          </div>
        </section>
        <div className="internal-order-detail-loading" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <IconLoading />
          <p>Cargando pedido...</p>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page dashboard-page">
        <HomeHeader />
        <section className="dashboard-hero" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
          <div className="dashboard-hero__overlay" style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(62, 42, 27, 0.75)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            width: "100%",
            height: "100%",
          }}>
            <h1 className="dashboard-hero__title" style={{
              color: "#FFFFFF",
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: 700,
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              margin: 0,
              fontFamily: '"Playfair Display", serif',
            }}>Detalle de Pedido</h1>
          </div>
        </section>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <p style={{ color: "#D32F2F" }}>❌ {error}</p>
          <button onClick={loadOrder} style={{
            marginTop: "1rem",
            padding: "0.5rem 2rem",
            background: "#8B5E3C",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}>Reintentar</button>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="home-page dashboard-page">
        <HomeHeader />
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <p>No se encontró el pedido</p>
          <Link to={routePaths.backOffice.orders} style={{
            display: "inline-block",
            marginTop: "1rem",
            padding: "0.5rem 2rem",
            background: "#8B5E3C",
            color: "#FFFFFF",
            borderRadius: "8px",
            textDecoration: "none",
          }}>Volver a pedidos</Link>
        </div>
        <HomeFooter />
      </div>
    );
  }

  // ============================================
  // ✅ DATOS DEL PEDIDO
  // ============================================
  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  const customerName = getCustomerName();
  const customerEmail = getCustomerEmail();
  const customerPhone = getCustomerPhone();

  // ============================================
  // ✅ RENDER PRINCIPAL
  // ============================================
  return (
    <div className="home-page dashboard-page">
      <HomeHeader />

      <section className="dashboard-hero" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100%",
        minHeight: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        <div className="dashboard-hero__overlay" style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(62, 42, 27, 0.75)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          width: "100%",
          height: "100%",
        }}>
          <h1 className="dashboard-hero__title" style={{
            color: "#FFFFFF",
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            fontWeight: 700,
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            margin: 0,
            fontFamily: '"Playfair Display", serif',
          }}>Detalle de Pedido</h1>
          <p className="dashboard-hero__breadcrumb" style={{
            color: "#F5EDE5",
            fontSize: "clamp(0.9rem, 1.2vw, 1.1rem)",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            marginTop: "8px",
          }}>
            <Link to={routePaths.public.home} style={{ color: "#FFD700", textDecoration: "none" }}>Inicio</Link>
            <span aria-hidden="true" style={{ margin: "0 8px", color: "#F5EDE5" }}>&gt;</span>
            <Link to={routePaths.backOffice.orders} style={{ color: "#FFD700", textDecoration: "none" }}>Pedidos Internos</Link>
            <span aria-hidden="true" style={{ margin: "0 8px", color: "#F5EDE5" }}>&gt;</span>
            <span style={{ color: "#FFFFFF" }}>Detalle</span>
          </p>
        </div>
      </section>

      <main className="dashboard-container">
        {/* ✅ HEADER DEL PEDIDO */}
        <div className="dashboard-header-actions" style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}>
          <div>
            <h2 style={{
              fontSize: "clamp(1.2rem, 2vw, 1.8rem)",
              color: "#6B4A2B",
              margin: 0,
            }}>
              Pedido #{order.id}
            </h2>
            <p style={{ color: "#7A6B5A", margin: "4px 0 0" }}>
              {formatDate(order.created_at)}
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <Link to={routePaths.backOffice.orders} style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              background: "#6A5ACD",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
              cursor: "pointer",
              textDecoration: "none",
              fontWeight: 600,
              transition: "background-color 0.2s ease",
            }}>
              <FaTimes /> Volver a pedidos
            </Link>
          </div>
        </div>

        {/* ✅ ESTADO ACTUAL - SOLO VISUAL */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "16px 20px",
          background: statusInfo.bg,
          border: `1px solid ${statusInfo.color}`,
          borderRadius: "12px",
          marginBottom: "24px",
        }}>
          <StatusIcon size={24} color={statusInfo.color} />
          <div>
            <span style={{ fontSize: "0.8rem", color: "#7A6B5A" }}>Estado actual</span>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", color: statusInfo.color }}>
              {statusInfo.label}
            </p>
          </div>
        </div>

        {/* ✅ GRID DE INFORMACIÓN */}
        <div className="dashboard-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "24px",
          marginBottom: "24px",
        }}>
          {/* ✅ INFORMACIÓN DEL CLIENTE (AHORA CON DATOS REALES) */}
          <div className="dashboard-card" style={{
            padding: "24px",
            background: "#FDF8F0",
            border: "1px solid #E8DCCC",
            borderRadius: "16px",
          }}>
            <h3 style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "clamp(1.1rem, 1.5vw, 1.2rem)",
              color: "#8B5E3C",
              margin: "0 0 16px 0",
            }}>
              <FaUserCircle /> Información del cliente
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                background: "#FFFFFF",
                borderRadius: "8px",
                border: "1px solid #F0EBE3",
              }}>
                <FaUser size={16} color="#8B5E3C" />
                <div>
                  <span style={{ color: "#7A6B5A", fontSize: "0.75rem", display: "block" }}>Nombre</span>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: "clamp(0.95rem, 1.1vw, 1rem)" }}>
                    {customerName}
                  </p>
                </div>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                background: "#FFFFFF",
                borderRadius: "8px",
                border: "1px solid #F0EBE3",
              }}>
                <FaEnvelope size={16} color="#8B5E3C" />
                <div>
                  <span style={{ color: "#7A6B5A", fontSize: "0.75rem", display: "block" }}>Email</span>
                  <p style={{ margin: 0, fontSize: "clamp(0.9rem, 1vw, 1rem)" }}>
                    {customerEmail}
                  </p>
                </div>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                background: "#FFFFFF",
                borderRadius: "8px",
                border: "1px solid #F0EBE3",
              }}>
                <FaPhone size={16} color="#8B5E3C" />
                <div>
                  <span style={{ color: "#7A6B5A", fontSize: "0.75rem", display: "block" }}>Teléfono</span>
                  <p style={{ margin: 0, fontSize: "clamp(0.9rem, 1vw, 1rem)" }}>
                    {customerPhone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dirección de entrega */}
          <div className="dashboard-card" style={{
            padding: "24px",
            background: "#FDF8F0",
            border: "1px solid #E8DCCC",
            borderRadius: "16px",
          }}>
            <h3 style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "clamp(1.1rem, 1.5vw, 1.2rem)",
              color: "#8B5E3C",
              margin: "0 0 16px 0",
            }}>
              <FaMapMarkerAlt /> Dirección de entrega
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{
                padding: "12px 16px",
                background: "#FFFFFF",
                borderRadius: "8px",
                border: "1px solid #F0EBE3",
              }}>
                <span style={{ color: "#7A6B5A", fontSize: "0.75rem", display: "block" }}>Dirección</span>
                <p style={{ margin: "4px 0 0 0", fontSize: "clamp(0.9rem, 1vw, 1rem)" }}>
                  {order.formatted_address || order.original_address || "No disponible"}
                </p>
              </div>
              {order.delivery_zone && (
                <div style={{
                  padding: "8px 12px",
                  background: "#FFFFFF",
                  borderRadius: "8px",
                  border: "1px solid #F0EBE3",
                }}>
                  <span style={{ color: "#7A6B5A", fontSize: "0.75rem", display: "block" }}>Zona de entrega</span>
                  <p style={{ margin: "4px 0 0 0", fontWeight: 500, fontSize: "clamp(0.9rem, 1vw, 1rem)" }}>
                    {order.delivery_zone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ PRODUCTOS DEL PEDIDO */}
        <div className="dashboard-card" style={{
          padding: "24px",
          background: "#FDF8F0",
          border: "1px solid #E8DCCC",
          borderRadius: "16px",
          marginBottom: "24px",
          overflowX: "auto",
        }}>
          <h3 style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "clamp(1.1rem, 1.5vw, 1.2rem)",
            color: "#8B5E3C",
            margin: "0 0 16px 0",
          }}>
            <FaBox /> Productos del pedido
          </h3>
          <div className="table-responsive">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E8DCCC" }}>
                  <th style={{ textAlign: "left", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem, 1vw, 0.9rem)" }}>Producto</th>
                  <th style={{ textAlign: "left", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem, 1vw, 0.9rem)" }}>SKU</th>
                  <th style={{ textAlign: "center", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem, 1vw, 0.9rem)" }}>Cantidad</th>
                  <th style={{ textAlign: "right", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem, 1vw, 0.9rem)" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #F0EBE3" }}>
                    <td style={{ padding: "12px 10px", fontSize: "clamp(0.85rem, 1vw, 0.95rem)", fontWeight: 500 }}>
                      {item.product_name || item.name || "Producto"}
                    </td>
                    <td style={{ padding: "12px 10px", fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                      {item.product_sku || item.sku || "-"}
                    </td>
                    <td style={{ textAlign: "center", padding: "12px 10px", fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                      {item.quantity || 0}
                    </td>
                    <td style={{ textAlign: "right", padding: "12px 10px", fontWeight: 600, color: "#5C2E0B", fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                      {formatPrice((item.unit_price || item.price || 0) * (item.quantity || 0))}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="3" style={{ textAlign: "right", padding: "16px 10px", fontWeight: 700, fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)", color: "#6B4A2B" }}>
                    Total
                  </td>
                  <td style={{ textAlign: "right", padding: "16px 10px", fontWeight: 700, color: "#8B5E3C", fontSize: "clamp(1rem, 1.2vw, 1.1rem)" }}>
                    {formatPrice(order.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ NOTAS */}
        <div className="dashboard-card" style={{
          padding: "24px",
          background: "#FDF8F0",
          border: "1px solid #E8DCCC",
          borderRadius: "16px",
        }}>
          <h3 style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "clamp(1.1rem, 1.5vw, 1.2rem)",
            color: "#8B5E3C",
            margin: "0 0 16px 0",
          }}>
            <FaEdit /> Notas del pedido
          </h3>
          <p style={{ color: "#7A6B5A", margin: 0 }}>
            {order.notes || "No hay notas para este pedido"}
          </p>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
