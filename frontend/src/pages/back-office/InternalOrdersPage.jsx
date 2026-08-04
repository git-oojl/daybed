// InternalOrdersPage.jsx
import { useCallback, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import { orderService } from "../../services/backendServices.js";
import { useAuthStore } from "../../auth/authStore.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import {
  FaSearch,
  FaEye,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaTruck,
  FaBox,
} from "react-icons/fa";

// ============================================
// ✅ MAPEO DE ESTADOS
// ============================================
const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente", icon: FaClock, color: "#ED6C02", bg: "#FFF8E1" },
  { value: "confirmed", label: "Confirmado", icon: FaCheckCircle, color: "#2E7D32", bg: "#E8F5E9" },
  { value: "preparing", label: "En preparación", icon: FaBox, color: "#6A1B9A", bg: "#F3E5F5" },
  { value: "shipped", label: "Enviado", icon: FaTruck, color: "#0D47A1", bg: "#E3F2FD" },
  { value: "delivered", label: "Entregado", icon: FaCheckCircle, color: "#1B5E20", bg: "#E8F5E9" },
  { value: "cancelled", label: "Cancelado", icon: FaTimesCircle, color: "#D32F2F", bg: "#FDECEA" },
];

// ============================================
// ✅ FUNCIONES AUXILIARES
// ============================================
const getStatusInfo = (status) => {
  return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
};

const formatPrice = (amount) => {
  return `$${Number(amount || 0).toLocaleString("es-MX")} MX`;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ============================================
// ✅ COMPONENTE PRINCIPAL
// ============================================
export default function InternalOrdersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const viewerId = getViewerIdForUser(user);
  const effectivePermissionCodes = user?.effective_permission_codes ?? [];
  const canUpdateStatus =
    viewerId === "admin" ||
    effectivePermissionCodes.includes("orders.status.update");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  
  const ordersPerPage = 5;

  // ============================================
  // ✅ CARGAR PEDIDOS
  // ============================================
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await orderService.manageList();
      const ordersList = response.results || response || [];
      
      // Normalizar pedidos
      const normalizedOrders = ordersList.map((order) => ({
        id: order.id,
        orderNumber: `#DAY-${String(order.id).padStart(4, '0')}`,
        customer: order.customer_name || order.user?.name || "Cliente",
        email: order.customer_email || order.user?.email || order.email || "No disponible",
        date: order.created_at,
        total: order.total || order.products_subtotal || 0,
        status: order.status || "pending",
        items: order.items || [],
        payment: order.payment_method || "No especificado",
        address: order.formatted_address || order.original_address || "Dirección no disponible",
      }));
      
      setOrders(normalizedOrders);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
      setError(err.message || "No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // ✅ VERIFICAR AUTENTICACIÓN Y ROL
  // ============================================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(routePaths.account.login);
      return;
    }

    if (!authLoading && isAuthenticated) {
      if (viewerId !== "admin" && viewerId !== "employee") {
        navigate(routePaths.support.unauthorized || "/no-autorizado");
        return;
      }

      const timeoutId = window.setTimeout(loadOrders, 0);
      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [isAuthenticated, authLoading, viewerId, navigate, loadOrders]);

  // ============================================
  // ✅ ACTUALIZAR ESTADO DEL PEDIDO
  // ============================================
  const handleUpdateStatus = async (orderId, status) => {
    setUpdating(true);
    setError(null);

    try {
      await orderService.updateStatus(orderId, status);
      // Recargar pedidos después de actualizar
      await loadOrders();
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus("");
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      setError(err.message || "No se pudo actualizar el estado del pedido.");
    } finally {
      setUpdating(false);
    }
  };

  // ============================================
  // ✅ ABRIR MODAL DE CAMBIO DE ESTADO
  // ============================================
  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  // ============================================
  // ✅ FILTRAR Y PAGINAR
  // ============================================
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));

  // Estadísticas
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  // ============================================
  // ✅ ESTADOS DE CARGA Y ERROR
  // ============================================
  if (loading || authLoading) {
    return (
      <div className="home-page dashboard-page">
        <HomeHeader />
        <div className="dashboard-loading">
          <p>Cargando pedidos...</p>
        </div>
        <HomeFooter />
      </div>
    );
  }

  // ============================================
  // ✅ RENDER PRINCIPAL
  // ============================================
  return (
    <div className="home-page dashboard-page">
      <HomeHeader />

      <section className="dashboard-hero" aria-label="Pedidos Internos">
        <div className="dashboard-hero__overlay" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          minHeight: "200px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(62, 42, 27, 0.75)",
          }} />
          <h1 style={{
            color: "#FFFFFF",
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            fontWeight: 700,
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            margin: 0,
            fontFamily: '"Playfair Display", serif',
            position: "relative",
            zIndex: 1,
          }}>
            Pedidos Internos
          </h1>
          <p style={{
            color: "#F5EDE5",
            fontSize: "clamp(0.9rem, 1.2vw, 1.1rem)",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            marginTop: "8px",
            position: "relative",
            zIndex: 1,
          }}>
            <Link to={routePaths.public.home} style={{ color: "#FFD700", textDecoration: "none" }}>Inicio</Link>
            <span style={{ margin: "0 8px", color: "#F5EDE5" }}>&gt;</span>
            <span style={{ color: "#FFFFFF" }}>Pedidos Internos</span>
          </p>
        </div>
      </section>

      <main className="dashboard-container">
        {error && (
          <div style={{
            padding: "12px 20px",
            background: "#FDECEA",
            border: "1px solid #F5C6CB",
            borderRadius: "8px",
            color: "#D32F2F",
            marginBottom: "20px",
          }}>
            {error}
          </div>
        )}

        {/* CONTROLES */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}>
          <h2 style={{
            fontSize: "clamp(1.2rem, 2vw, 1.8rem)",
            color: "#6B4A2B",
            margin: 0,
          }}>
            Lista de pedidos
          </h2>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
          }}>
            <div style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              background: "#FFFFFF",
              border: "1px solid #E8DCCC",
              borderRadius: "8px",
              padding: "0 12px",
              minWidth: "clamp(200px, 25vw, 300px)",
            }}>
              <FaSearch style={{ color: "#999", fontSize: "16px", marginRight: "8px" }} />
              <input
                type="text"
                placeholder="Buscar por cliente o pedido..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  border: "none",
                  padding: "10px 0",
                  fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                  background: "transparent",
                  width: "100%",
                  outline: "none",
                  color: "#333",
                }}
              />
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
          marginBottom: "24px",
          padding: "12px 16px",
          background: "#FDF8F0",
          border: "1px solid #E8DCCC",
          borderRadius: "12px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#6B4A2B",
            fontWeight: 600,
            fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
          }}>
            <FaFilter /> Filtrar por estado:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            <button
              onClick={() => {
                setFilterStatus("all");
                setCurrentPage(1);
              }}
              style={{
                padding: "4px 14px",
                border: `1px solid ${filterStatus === "all" ? "#8B5E3C" : "#E8DCCC"}`,
                borderRadius: "20px",
                background: filterStatus === "all" ? "#8B5E3C" : "#FFFFFF",
                color: filterStatus === "all" ? "#FFFFFF" : "#7A6B5A",
                fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Todos ({stats.total})
            </button>
            {STATUS_OPTIONS.map((status) => {
              const count = orders.filter(o => o.status === status.value).length;
              return (
                <button
                  key={status.value}
                  onClick={() => {
                    setFilterStatus(status.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "4px 14px",
                    border: `1px solid ${filterStatus === status.value ? status.color : "#E8DCCC"}`,
                    borderRadius: "20px",
                    background: filterStatus === status.value ? status.color : "#FFFFFF",
                    color: filterStatus === status.value ? "#FFFFFF" : status.color,
                    fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {status.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* TABLA */}
        <div style={{
          padding: "20px",
          background: "#FDF8F0",
          border: "1px solid #E8DCCC",
          borderRadius: "16px",
          overflowX: "auto",
        }}>
          <div className="table-responsive">
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "800px",
            }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E8DCCC" }}>
                  <th style={{ textAlign: "left", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem, 1vw, 0.9rem)" }}>Pedido</th>
                  <th style={{ textAlign: "left", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem, 1vw, 0.9rem)" }}>Cliente</th>
                  <th style={{ textAlign: "left", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem, 1vw, 0.9rem)" }}>Fecha</th>
                  <th style={{ textAlign: "center", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem, 1vw, 0.9rem)" }}>Total</th>
                  <th style={{ textAlign: "center", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem, 1vw, 0.9rem)" }}>Estado</th>
                  <th style={{ textAlign: "center", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem, 1vw, 0.9rem)" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ color: "#D28B00", fontSize: "32px" }}>
                        <FaExclamationTriangle />
                      </div>
                      <p style={{ color: "#7A6B5A", marginTop: "12px", fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)" }}>
                        No se encontraron pedidos
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={order.id} style={{ borderBottom: "1px solid #F0EBE3" }}>
                        <td style={{ padding: "12px 10px", fontWeight: 600, color: "#8B5E3C", fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                          {order.orderNumber}
                        </td>
                        <td style={{ padding: "12px 10px", fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                          {order.customer}
                        </td>
                        <td style={{ padding: "12px 10px", fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                          {formatDate(order.date)}
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "center", fontWeight: 600, color: "#5C2E0B", fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                          {formatPrice(order.total)}
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "center" }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 14px",
                            borderRadius: "20px",
                            fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                            fontWeight: 600,
                            background: statusInfo.bg,
                            color: statusInfo.color,
                          }}>
                            <StatusIcon size={14} />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <Link
                              to={`/interno/pedidos/${order.id}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 14px",
                                borderRadius: "6px",
                                background: "#8B5E3C",
                                color: "#fff",
                                fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                                cursor: "pointer",
                                textDecoration: "none",
                                fontWeight: 500,
                                transition: "background 0.2s ease",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "#6B4A2B"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "#8B5E3C"}
                            >
                              <FaEye size={14} /> Ver
                            </Link>
                            {canUpdateStatus && (
                              <button
                                onClick={() => openStatusModal(order)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "6px 14px",
                                  borderRadius: "6px",
                                  border: "1px solid #8B5E3C",
                                  background: "transparent",
                                  color: "#8B5E3C",
                                  fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                                  cursor: "pointer",
                                  fontWeight: 500,
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#8B5E3C";
                                  e.currentTarget.style.color = "#FFFFFF";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "transparent";
                                  e.currentTarget.style.color = "#8B5E3C";
                                }}
                              >
                                <FaSpinner size={14} /> Estado
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          {filteredOrders.length > ordersPerPage && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "16px",
              paddingTop: "20px",
              borderTop: "1px solid #E8DCCC",
              marginTop: "16px",
            }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 20px",
                  border: "1px solid #E8DCCC",
                  borderRadius: "6px",
                  background: "#FFFFFF",
                  color: "#6B4A2B",
                  fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                  fontWeight: 500,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                Anterior
              </button>
              <span style={{ color: "#7A6B5A", fontSize: "clamp(0.85rem, 1vw, 0.95rem)" }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 20px",
                  border: "1px solid #E8DCCC",
                  borderRadius: "6px",
                  background: "#FFFFFF",
                  color: "#6B4A2B",
                  fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                  fontWeight: 500,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* ESTADÍSTICAS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "12px",
          marginTop: "24px",
        }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E8DCCC", borderRadius: "12px", padding: "14px 16px", textAlign: "center" }}>
            <span style={{ display: "block", fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)", color: "#7A6B5A", fontWeight: 500 }}>Total</span>
            <span style={{ display: "block", fontSize: "clamp(1.3rem, 1.8vw, 1.8rem)", fontWeight: 700, color: "#6B4A2B", marginTop: "4px" }}>{stats.total}</span>
          </div>
          {STATUS_OPTIONS.map((status) => {
            const count = orders.filter(o => o.status === status.value).length;
            return (
              <div key={status.value} style={{ background: "#FFFFFF", border: "1px solid #E8DCCC", borderRadius: "12px", padding: "14px 16px", textAlign: "center" }}>
                <span style={{ display: "block", fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)", color: "#7A6B5A", fontWeight: 500 }}>{status.label}</span>
                <span style={{ display: "block", fontSize: "clamp(1.3rem, 1.8vw, 1.8rem)", fontWeight: 700, color: status.color, marginTop: "4px" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </main>

      {/* MODAL CAMBIAR ESTADO */}
      {showStatusModal && selectedOrder && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }} onClick={() => setShowStatusModal(false)}>
          <div style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            maxWidth: "480px",
            width: "100%",
            padding: "32px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            animation: "fadeIn 0.3s ease",
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: "1.2rem",
              color: "#6B4A2B",
              margin: "0 0 8px 0",
            }}>
              Cambiar estado del pedido
            </h3>
            <p style={{ color: "#7A6B5A", fontSize: "0.9rem", margin: "0 0 20px 0" }}>
              Pedido: <strong>{selectedOrder.orderNumber}</strong> - {selectedOrder.customer}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {STATUS_OPTIONS.map((status) => {
                const StatusIcon = status.icon;
                const isSelected = newStatus === status.value;
                return (
                  <button
                    key={status.value}
                    onClick={() => setNewStatus(status.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      border: `2px solid ${isSelected ? status.color : "#E8DCCC"}`,
                      borderRadius: "10px",
                      background: isSelected ? status.bg : "#FFFFFF",
                      color: isSelected ? status.color : "#7A6B5A",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      width: "100%",
                      fontSize: "0.95rem",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <StatusIcon size={18} />
                    {status.label}
                    {isSelected && <span style={{ marginLeft: "auto", color: status.color }}>✓</span>}
                  </button>
                );
              })}
            </div>

            <div style={{
              display: "flex",
              gap: "12px",
              marginTop: "24px",
              justifyContent: "flex-end",
            }}>
              <button
                onClick={() => setShowStatusModal(false)}
                style={{
                  padding: "10px 24px",
                  border: "1px solid #E8DCCC",
                  borderRadius: "8px",
                  background: "#FFFFFF",
                  color: "#7A6B5A",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedOrder.id, newStatus)}
                disabled={newStatus === selectedOrder.status || updating}
                style={{
                  padding: "10px 24px",
                  border: "none",
                  borderRadius: "8px",
                  background: (newStatus === selectedOrder.status || updating) ? "#D4C5B2" : "#8B5E3C",
                  color: "#FFFFFF",
                  cursor: (newStatus === selectedOrder.status || updating) ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
              >
                {updating ? "Guardando..." : "Guardar cambio"}
              </button>
            </div>
          </div>
        </div>
      )}

      <HomeFooter />
    </div>
  );
}
