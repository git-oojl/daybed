// MyOrdersPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/order-detail-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { Link } from "react-router-dom";
import { routePaths } from "../../routes/routePaths.js";
import { orderService } from "../../services/backendServices.js";
import { useAuthStore } from "../../auth/authStore.js";
// eslint-disable-next-line no-unused-vars
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { productImage } from "../../services/viewMappers.js";

// ============================================
// ✅ FUNCIÓN PARA OBTENER IMAGEN DEL PRODUCTO
// ============================================
const getProductImage = (item) => {
  return productImage({
    ...item,
    name: item.name || item.product_name || item.product_snapshot?.name,
  });
};

// ============================================
// ✅ MAPEO DE ESTADOS
// ============================================
const STATUS_MAP = {
  pending: {
    label: "Pendiente",
    color: "#ED6C02",
    bg: "#FFF8E1",
  },
  confirmed: {
    label: "Confirmado",
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
  preparing: {
    label: "En preparación",
    color: "#6A1B9A",
    bg: "#F3E5F5",
  },
  shipped: {
    label: "Enviado",
    color: "#0D47A1",
    bg: "#E3F2FD",
  },
  delivered: {
    label: "Entregado",
    color: "#1B5E20",
    bg: "#E8F5E9",
  },
  cancelled: {
    label: "Cancelado",
    color: "#D32F2F",
    bg: "#FDECEA",
  },
};

const getStatusInfo = (status) => {
  return STATUS_MAP[status] || STATUS_MAP.pending;
};

const getOrderStatusLabel = (status) => {
  return getStatusInfo(status).label;
};

const getStatusClass = (status) => {
  switch (status) {
    case "pending": return "orders-status--pending";
    case "confirmed": return "orders-status--confirmed";
    case "preparing": return "orders-status--preparing";
    case "shipped": return "orders-status--shipped";
    case "delivered": return "orders-status--delivered";
    case "cancelled": return "orders-status--cancelled";
    default: return "";
  }
};

const PAYMENT_METHOD_MAP = {
  card: "Tarjeta de crédito/débito",
  transfer: "Transferencia bancaria",
  cash: "Efectivo contra entrega",
};

const PAYMENT_STATUS_MAP = {
  authorized: "Pago simulado autorizado",
  awaiting_transfer: "Transferencia simulada pendiente",
  pay_on_delivery: "Pago contra entrega",
  failed: "Pago simulado fallido",
};

const getPaymentMethodLabel = (method) => {
  return PAYMENT_METHOD_MAP[method] || method || "No especificado";
};

const getPaymentStatusLabel = (status) => {
  return PAYMENT_STATUS_MAP[status] || status || "No especificado";
};

const normalizeOrderStatus = (status) => {
  const statusMap = {
    pending: "pending",
    confirmed: "confirmed",
    preparing: "preparing",
    shipped: "shipped",
    delivered: "delivered",
    cancelled: "cancelled",
    completed: "delivered",
    canceled: "cancelled",
    "en proceso": "pending",
    entregado: "delivered",
    cancelado: "cancelled",
  };
  return statusMap[status] || "pending";
};

const formatOrderDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatPrice = (price) => {
  return `$${Number(price || 0).toLocaleString("es-MX")} MX`;
};

const normalizeAddress = (order) => {
  const addressValue =
    order.formatted_address ||
    order.original_address ||
    order.delivery_address ||
    [
      order.address?.street,
      order.address?.city,
      order.address?.state,
      order.address?.zip,
    ].filter(Boolean).join(", ");

  const parts = (addressValue || "-")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    street: parts[0] || "-",
    city: parts[1] || "-",
    state: parts[2] || "-",
    zip: parts[3] || "-",
    country: parts[4] || "-",
    text: addressValue || "-",
  };
};

// ============================================
// ✅ COMPONENTE PRINCIPAL
// ============================================
function MyOrdersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Obtener el nombre del cliente autenticado
  const customerName = user?.name || user?.first_name || "Cliente";

  // ============================================
  // ✅ VERIFICAR AUTENTICACIÓN
  // ============================================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(routePaths.account.login);
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  // ============================================
  // ✅ CARGAR PEDIDOS DEL CLIENTE
  // ============================================
  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await orderService.list();
        const rawOrders = Array.isArray(response)
          ? response
          : response?.results || [];

        const normalizedOrders = rawOrders.map((order) => ({
          id: order.id || order.order_id || "-",
          orderNumber: `#DAY-${String(order.id || 0).padStart(4, '0')}`,
          customer: order.customer_name || order.customer?.name || order.customer || "Cliente",
          date: formatOrderDate(order.created_at || order.date || order.order_date),
          status: normalizeOrderStatus(order.status || "pending"),
          statusText: getOrderStatusLabel(order.status || "pending"),
          total: Number(order.total || order.products_subtotal || order.amount || 0),
          subtotal: Number(order.products_subtotal || order.subtotal || order.total || 0),
          shipping: Number(order.delivery_fee || order.shipping || 0),
          paymentMethod: order.payment_method,
          paymentMethodText: getPaymentMethodLabel(order.payment_method),
          paymentStatus: order.payment_status,
          paymentStatusText: getPaymentStatusLabel(order.payment_status),
          paymentReference: order.payment_reference,
          paymentMasked: order.payment_snapshot?.masked,
          items: Array.isArray(order.items)
            ? order.items.map((item) => ({
                id: item.id || item.product || item.product_snapshot?.id,
                name: item.product_name || item.product_snapshot?.name || item.name || "Producto",
                description: item.product_snapshot?.description || item.description || "Producto sin descripción",
                quantity: Number(item.quantity || item.qty || 1),
                price: Number(item.unit_price || item.price || item.line_total || 0),
                image: getProductImage(item),
                rawItem: item,
              }))
            : [],
          address: normalizeAddress(order),
        }));

        if (isMounted) {
          setOrders(normalizedOrders);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "No se pudieron cargar los pedidos.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (isAuthenticated && !authLoading) {
      loadOrders();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, authLoading]);

  // ============================================
  // ✅ HANDLERS
  // ============================================
  const toggleExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // ============================================
  // ✅ FILTRAR PEDIDOS
  // ============================================
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id.toString().toLowerCase().includes(searchLower) ||
      order.customer.toLowerCase().includes(searchLower) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchLower))
    );
  });

  // ============================================
  // ✅ ESTADOS DE CARGA
  // ============================================
  if (authLoading) {
    return (
      <div className="home-page orders-page">
        <HomeHeader />
        <div className="orders-empty">
          <p className="orders-empty__message">Verificando sesión...</p>
        </div>
        <HomeFooter />
      </div>
    );
  }

  // ============================================
  // ✅ RENDER
  // ============================================
  return (
    <div className="home-page orders-page">
      <HomeHeader />

      {/* Hero Section */}
      <section
        className="orders-hero"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80")',
        }}
      >
        <div className="orders-hero__overlay">
          <h1 className="orders-hero__title">
            Pedidos de {customerName}
          </h1>
          <p className="orders-hero__breadcrumb">
            <Link to={routePaths.public.home}>Inicio</Link>
            <span aria-hidden="true">&gt;</span>
            <span>Mis pedidos</span>
          </p>
        </div>
      </section>

      <main className="orders-main">
        {/* ✅ BANNER DE BIENVENIDA */}
        <div style={{
          background: "#FDF8F0",
          border: "1px solid #E8DCCC",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <div>
            <p style={{ margin: 0, color: "#7A6B5A", fontSize: "0.9rem" }}>
              <strong style={{ color: "#6B4A2B" }}>{customerName}</strong>, aquí tienes el historial de tus compras
            </p>
            <p style={{ margin: "4px 0 0 0", color: "#9A8B7A", fontSize: "0.8rem" }}>
              {orders.length} pedidos en total
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{
              background: "#E8DCCC",
              color: "#6B4A2B",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}>
              {orders.filter(o => o.status === "pending" || o.status === "confirmed" || o.status === "preparing").length} activos
            </span>
            <span style={{
              background: "#E8F5E9",
              color: "#2E7D32",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}>
              {orders.filter(o => o.status === "delivered").length} entregados
            </span>
          </div>
        </div>

        <div className="orders-toolbar">
          <div className="orders-search">
            <span className="orders-search__icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="orders-search__input"
              placeholder="Buscar por numero de pedido o producto..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {loading ? (
          <div className="orders-empty">
            <p className="orders-empty__message">Cargando pedidos...</p>
          </div>
        ) : error ? (
          <div className="orders-empty">
            <p className="orders-empty__message">{error}</p>
            <button
              className="orders-empty__btn"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <p className="orders-empty__message">
              {searchTerm ? `No se encontraron pedidos para "${searchTerm}"` : "No tienes pedidos realizados"}
            </p>
            {searchTerm ? (
              <button
                className="orders-empty__btn"
                onClick={() => setSearchTerm("")}
              >
                Limpiar busqueda
              </button>
            ) : (
              <Link to={routePaths.public.catalog} className="orders-empty__btn">
                Ir a la tienda
              </Link>
            )}
          </div>
        ) : (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <React.Fragment key={order.id}>
                      <tr
                        className="orders-table__row"
                        onClick={() => toggleExpand(order.id)}
                      >
                        <td data-label="Pedido" className="orders-table__order">
                          {order.orderNumber}
                        </td>
                        <td data-label="Fecha">{order.date}</td>
                        <td data-label="Total">{formatPrice(order.total)}</td>
                        <td data-label="Estado">
                          <span
                            className={`orders-status ${getStatusClass(order.status)}`}
                            style={{
                              backgroundColor: statusInfo.bg,
                              color: statusInfo.color,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 14px",
                              borderRadius: "20px",
                              fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                              fontWeight: 600,
                            }}
                          >
                            {order.statusText}
                          </span>
                        </td>
                        <td data-label="Detalles">
                          <button
                            className="orders-expand-btn"
                            aria-label="Ver detalles del pedido"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(order.id);
                            }}
                          >
                            {expandedOrder === order.id ? "−" : "+"}
                          </button>
                        </td>
                      </tr>
                      {expandedOrder === order.id && (
                        <tr className="orders-detail-row">
                          <td colSpan="5">
                            <div className="orders-detail-box">
                              <div className="orders-detail-grid">
                                <div className="orders-detail-section">
                                  <h4 className="orders-detail__header">
                                    Productos
                                  </h4>
                                  <div className="orders-detail__content">
                                    {order.items.map((item) => (
                                      <div
                                        className="orders-detail__product"
                                        key={item.id}
                                      >
                                        <div className="orders-detail__product-info">
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="orders-detail__product-image"
                                            onError={(e) => {
                                              e.target.src = productImage({});
                                            }}
                                          />
                                          <div>
                                            <span className="orders-detail__product-name">
                                              {item.name}
                                            </span>
                                            <span className="orders-detail__product-desc">
                                              {item.description}
                                            </span>
                                            <span className="orders-detail__product-qty">
                                              × {item.quantity}
                                            </span>
                                          </div>
                                        </div>
                                        <span className="orders-detail__product-price">
                                          {formatPrice(
                                            item.price * item.quantity,
                                          )}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="orders-detail-section">
                                  <h4 className="orders-detail__header">
                                    Información
                                  </h4>
                                  <div className="orders-detail__content">
                                    <div className="orders-detail__item">
                                      <span className="orders-detail__label">
                                        Número de pedido
                                      </span>
                                      <span className="orders-detail__value">
                                        {order.orderNumber}
                                      </span>
                                    </div>
                                    <div className="orders-detail__item">
                                      <span className="orders-detail__label">
                                        Fecha
                                      </span>
                                      <span className="orders-detail__value">
                                        {order.date}
                                      </span>
                                    </div>
                                    <div className="orders-detail__item">
                                      <span className="orders-detail__label">
                                        Estado
                                      </span>
                                      <span
                                        className={`orders-status ${getStatusClass(order.status)}`}
                                        style={{
                                          backgroundColor: statusInfo.bg,
                                          color: statusInfo.color,
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "6px",
                                          padding: "4px 14px",
                                          borderRadius: "20px",
                                          fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {order.statusText}
                                      </span>
                                    </div>
                                    <div className="orders-detail__item">
                                      <span className="orders-detail__label">
                                        Pago
                                      </span>
                                      <span className="orders-detail__value">
                                        {order.paymentMethodText}
                                        {order.paymentStatus && (
                                          <>
                                            <br />
                                            {order.paymentStatusText}
                                          </>
                                        )}
                                        {order.paymentMasked && (
                                          <>
                                            <br />
                                            {order.paymentMasked}
                                          </>
                                        )}
                                        {order.paymentReference && (
                                          <>
                                            <br />
                                            Ref: {order.paymentReference}
                                          </>
                                        )}
                                      </span>
                                    </div>
                                    <div className="orders-detail__item">
                                      <span className="orders-detail__label">
                                        Dirección de entrega
                                      </span>
                                      <span className="orders-detail__value">
                                        {order.address.street}
                                        <br />
                                        {order.address.city},{" "}
                                        {order.address.state}
                                        <br />
                                        CP {order.address.zip}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="orders-detail-section">
                                  <h4 className="orders-detail__header">Total</h4>
                                  <div className="orders-detail__content">
                                    <div className="orders-detail__total">
                                      <div className="orders-detail__total-row">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(order.subtotal)}</span>
                                      </div>
                                      <div className="orders-detail__total-row">
                                        <span>Envío</span>
                                        <span>
                                          {order.shipping > 0
                                            ? formatPrice(order.shipping)
                                            : "Gratis"}
                                        </span>
                                      </div>
                                      <div className="orders-detail__total-row orders-detail__total-final">
                                        <span>Total</span>
                                        <span>{formatPrice(order.total)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}

export default MyOrdersPage;
