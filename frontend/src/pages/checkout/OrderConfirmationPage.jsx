// OrderConfirmationPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/cart-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import { routePaths } from "../../routes/routePaths.js";
import { useEffectiveLocation, useEffectiveParams } from "../../dev-preview/useEffectiveRouteState.js";
import { orderService } from "../../services/backendServices.js";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { productImage } from "../../services/viewMappers.js";

// ============================================
// ✅ ICONOS SVG
// ============================================
function IconCheck() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" stroke="#4CAF50" strokeWidth="1.5"/>
      <path d="M7 12l3 3 7-7" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconPackage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 3h4l2 4v6h-6V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="8" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10.5 19h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconCreditCard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 8h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconLocation() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s-7-4.5-7-10a7 7 0 1 1 14 0c0 5.5-7 10-7 10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconLoading() {
  return (
    <svg className="order-confirmation-loading__spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="2"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#B88E2F" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ============================================
// ✅ FORMATO DE PRECIOS
// ============================================
function formatPrice(amount) {
  const numAmount = Number(amount || 0);
  return `$${numAmount.toLocaleString("es-MX")} MX`;
}

function formatOrderNumber(id) {
  if (!id) return "-";
  const value = String(id);
  if (value.startsWith("#")) return value;
  return /^\d+$/.test(value) ? `#DAY-${value.padStart(4, "0")}` : value;
}

function formatDistance(distanceKm) {
  const distance = Number(distanceKm);
  if (!Number.isFinite(distance) || distance <= 0) return null;
  return `${distance.toFixed(1)} km`;
}

function formatRouteDuration(minutes) {
  const duration = Number(minutes);
  if (!Number.isFinite(duration) || duration <= 0) return null;
  return duration < 60
    ? `${Math.round(duration)} min`
    : `${Math.floor(duration / 60)} h ${Math.round(duration % 60)} min`;
}

// ============================================
// ✅ COMPONENTE PRINCIPAL
// ============================================
const OrderConfirmationPage = () => {
  const location = useEffectiveLocation();
  const navigate = useNavigate();
  const { orderId: routeOrderId } = useEffectiveParams(routePaths.checkout.confirmationDetail);
  const { user, isAuthenticated, isLoading: authLoading } = useEffectiveSession();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  // ============================================
  // ✅ OBTENER DATOS DEL PEDIDO
  // ============================================
  useEffect(() => {
    const loadOrder = async () => {
      // Verificar autenticación
      if (!authLoading && !isAuthenticated) {
        navigate(routePaths.account.login);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // ✅ 1. Intentar obtener datos del estado de navegación (desde checkout)
        const stateOrder = location.state?.orderData;
        const stateOrderId = location.state?.orderId || routeOrderId;

        if (stateOrder) {
          setOrder(stateOrder);
          return;
        }

        // ✅ 2. Si no hay datos en estado, intentar obtener desde el backend
        if (stateOrderId) {
          try {
            const orderData = await orderService.detail(stateOrderId);
            setOrder(orderData);
            return;
          } catch (err) {
            setOrder(null);
            setError(err.message || "No se pudo cargar el pedido.");
            return;
          }
        }

        setOrder(null);

      } catch (err) {
        console.error("Error al cargar confirmación:", err);
        setError(err.message || "Error al cargar los datos del pedido");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [location.state, routeOrderId, isAuthenticated, authLoading, navigate]);

  // ============================================
  // ✅ FUNCIONES AUXILIARES
  // ============================================
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPaymentLabel = (method) => {
    const methods = {
      card: "Tarjeta de crédito/débito",
      transfer: "Transferencia bancaria",
      cash: "Efectivo contra entrega",
    };
    return methods[method] || method || "No especificado";
  };

  const getPaymentStatusLabel = (status) => {
    const statuses = {
      authorized: "Pago confirmado",
      awaiting_transfer: "Transferencia pendiente",
      pay_on_delivery: "Pago contra entrega",
      failed: "Pago no aprobado",
    };
    return statuses[status] || status || "No especificado";
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      preparing: "Preparando",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
    return statusMap[status] || status || "Pendiente";
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      preparing: "#8b5cf6",
      shipped: "#06b6d4",
      delivered: "#22c55e",
      cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  // ✅ Obtener nombre del cliente
  const getCustomerName = () => {
    if (order?.customer_name) return order.customer_name;
    if (user?.name) return user.name;
    if (user?.first_name) return `${user.first_name} ${user.last_name || ''}`.trim();
    return "Cliente";
  };

  // ============================================
  // ✅ ESTADOS DE CARGA Y ERROR
  // ============================================
  if (loading || authLoading) {
    return (
      <div className="home-page order-page">
        <HomeHeader />
        <div className="order-confirmation-loading">
          <IconLoading />
          <p>Cargando confirmación del pedido...</p>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page order-page">
        <HomeHeader />
        <div className="order-confirmation-error">
          <p>{error}</p>
          <button onClick={() => navigate(routePaths.public.home)}>
            Volver al inicio
          </button>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="home-page order-page">
        <HomeHeader />
        <div className="order-confirmation-empty">
          <p>No se encontraron datos del pedido</p>
          <Link to={routePaths.public.home} className="order-btn">
            Volver al inicio
          </Link>
        </div>
        <HomeFooter />
      </div>
    );
  }

  // ============================================
  // ✅ DATOS DEL PEDIDO
  // ============================================
  const orderItems = order.items || [];
  const subtotal = order.products_subtotal || order.subtotal || 0;
  const shipping = order.delivery_fee || 0;
  const total = order.total || (subtotal + shipping);
  const estimatedDate = order.estimated_delivery_date || order.estimatedDate;
  const customerName = getCustomerName();
  const routeDistance = formatDistance(order.distance_km);
  const routeDuration = formatRouteDuration(order.estimated_duration_minutes);

  // ============================================
  // ✅ RENDER PRINCIPAL
  // ============================================
  return (
    <div className="home-page order-page">
      <HomeHeader />

      {/* HERO - Estilo checkout */}
      <PageHero title="Pedido confirmado" eyebrow="Gracias por tu compra" image="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1800&q=82" current="Confirmación" />

      <main className="order-container">
        {/* ✅ ICONO DE ÉXITO */}
        <div className="order-success-icon">
          <IconCheck />
          <h2 className="order-success-title">¡Gracias por tu compra, {customerName}! </h2>
          <p className="order-success-subtitle">
            Hemos recibido tu pedido y lo estamos procesando.
          </p>
        </div>

        {/* ✅ NÚMERO DE PEDIDO Y ESTADO */}
        <div className="order-summary-header">
          <div className="order-summary-header__item">
            <span className="order-summary-header__label">Número de pedido</span>
            <span className="order-summary-header__value">{formatOrderNumber(order.id)}</span>
          </div>
          <div className="order-summary-header__item">
            <span className="order-summary-header__label">Fecha</span>
            <span className="order-summary-header__value">{formatDate(order.created_at)}</span>
          </div>
          <div className="order-summary-header__item">
            <span className="order-summary-header__label">Estado</span>
            <span 
              className="order-summary-header__badge"
              style={{ backgroundColor: getStatusColor(order.status) }}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        {/* ✅ GRID DE DETALLES */}
        <div className="order-grid">
          {/* COLUMNA IZQUIERDA */}
          <div className="order-grid__side">
            {/* Método de pago */}
            <article className="order-card">
              <header className="order-card__header">
                <IconCreditCard />
                Método de pago
              </header>
              <div className="order-card__body">
                <p>{getPaymentLabel(order.payment_method)}</p>
                {order.payment_status && (
                  <p className="order-card__detail">{getPaymentStatusLabel(order.payment_status)}</p>
                )}
                {order.payment_summary?.masked && (
                  <p className="order-card__detail">{order.payment_summary.masked}</p>
                )}
                {order.payment_reference && (
                  <p className="order-card__detail">Referencia: {order.payment_reference}</p>
                )}
              </div>
            </article>

            {/* Dirección de envío */}
            <article className="order-card">
              <header className="order-card__header">
                <IconLocation />
                Dirección de envío
              </header>
              <div className="order-card__body">
                <p>{order.formatted_address || order.original_address || "Dirección no especificada"}</p>
              </div>
            </article>
          </div>

          {/* COLUMNA CENTRAL - RESUMEN DEL PEDIDO */}
          <article className="order-card order-card--summary">
            <header className="order-card__header">
              <IconPackage />
              Resumen del pedido
            </header>
            <div className="order-card__body">
              {orderItems.map((item, index) => {
                const itemName = item.product_name || item.name || "Producto";
                const itemImage = productImage(item);
                return (
                <div className="order-item" key={index}>
                  <span className="order-item__product">
                    <img
                      src={itemImage}
                      alt={itemName}
                      className="order-item__image"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = productImage({ name: itemName });
                      }}
                    />
                    <span className="order-item__name">{itemName}</span>
                  </span>
                  <span className="order-item__qty">{item.quantity || 1}</span>
                  <span className="order-item__price">{formatPrice(item.unit_price || item.price || 0)}</span>
                </div>
              );
              })}

              <div className="order-totals">
                <div className="order-totals__row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="order-totals__row">
                  <span>Envío</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="order-totals__row order-totals__row--total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </article>

          {/* COLUMNA DERECHA */}
          <div className="order-grid__side">
            {/* Entrega estimada */}
            <article className="order-card">
              <header className="order-card__header">
                <IconTruck />
                Entrega estimada
              </header>
              <div className="order-card__body">
                <p className="order-card__value">{estimatedDate ? formatDate(estimatedDate) : "3-5 días hábiles"}</p>
                <p className="order-card__detail">{order.shipping_method || "Envío estándar"}</p>
                {routeDistance && (
                  <p className="order-card__detail">{routeDistance} de ruta</p>
                )}
                {routeDuration && (
                  <p className="order-card__detail">Tiempo estimado: {routeDuration}</p>
                )}
              </div>
            </article>

            {/* Contacto */}
            <article className="order-card">
              <header className="order-card__header">
                ¿Necesitas ayuda?
              </header>
              <div className="order-card__body">
                <p>Contacta a nuestro equipo de soporte</p>
                <a href="mailto:hola@daybed.mx" className="order-card__link">
                  hola@daybed.mx
                </a>
              </div>
            </article>
          </div>
        </div>

        {/* ✅ BOTONES DE ACCIÓN */}
        <div className="order-actions">
          <Link to={routePaths.account.orders} className="order-btn order-btn--primary">
            Ver mis pedidos
          </Link>
          <Link to={routePaths.public.catalog} className="order-btn order-btn--secondary">
            Seguir comprando
          </Link>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
};

export default OrderConfirmationPage;
