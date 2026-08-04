import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/order-detail-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import { routePaths } from "../../routes/routePaths.js";
import { orderService } from "../../services/backendServices.js";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { productImage } from "../../services/viewMappers.js";

const STATUS_MAP = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparación",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  completed: "Entregado",
  canceled: "Cancelado",
};

const ORDER_PROGRESS_STEPS = [
  { id: "pending", label: "Pedido recibido" },
  { id: "confirmed", label: "Pago confirmado" },
  { id: "preparing", label: "Preparando" },
  { id: "shipped", label: "En camino" },
  { id: "delivered", label: "Entregado" },
];

const PAYMENT_METHOD_MAP = {
  card: "Tarjeta de crédito/débito",
  transfer: "Transferencia bancaria",
  cash: "Efectivo contra entrega",
};

const PAYMENT_STATUS_MAP = {
  authorized: "Pago confirmado",
  awaiting_transfer: "Transferencia pendiente",
  pay_on_delivery: "Pago contra entrega",
  failed: "Pago no aprobado",
};

function normalizeOrderStatus(status) {
  return String(status || "pending").toLowerCase();
}

function getOrderStatusLabel(status) {
  return STATUS_MAP[normalizeOrderStatus(status)] || "Pendiente";
}

function getStatusClass(status) {
  switch (normalizeOrderStatus(status)) {
    case "confirmed":
    case "preparing":
    case "shipped":
      return "orders-status--confirmed";
    case "delivered":
    case "completed":
      return "orders-status--completed";
    case "cancelled":
    case "canceled":
      return "orders-status--cancelled";
    default:
      return "orders-status--pending";
  }
}

function getPaymentMethodLabel(method) {
  return PAYMENT_METHOD_MAP[method] || method || "No especificado";
}

function getPaymentStatusLabel(status) {
  return PAYMENT_STATUS_MAP[status] || status || "No especificado";
}

function formatOrderDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(price) {
  return `$${Number(price || 0).toLocaleString("es-MX")} MX`;
}

function getProductImage(item) {
  return productImage({
    ...item,
    name: item.name || item.product_name || item.product_snapshot?.name,
  });
}

function normalizeAddress(order) {
  return (
    order.formatted_address ||
    order.original_address ||
    order.delivery_address ||
    [
      order.address?.street,
      order.address?.city,
      order.address?.state,
      order.address?.zip,
    ]
      .filter(Boolean)
      .join(", ") ||
    "-"
  );
}

function normalizeOrder(order) {
  const items = Array.isArray(order.items)
    ? order.items.map((item) => {
        const quantity = Number(item.quantity || item.qty || 1);
        const unitPrice = Number(item.unit_price || item.price || 0);
        const lineTotal = Number(item.line_total || unitPrice * quantity);
        return {
          id: item.id || item.product || item.product_snapshot?.id,
          name:
            item.product_name ||
            item.product_snapshot?.name ||
            item.name ||
            "Producto",
          description:
            item.product_snapshot?.description ||
            item.description ||
            "Producto sin descripción",
          quantity,
          unitPrice,
          lineTotal,
          image: getProductImage(item),
        };
      })
    : [];

  return {
    id: order.id,
    orderNumber: `#DAY-${String(order.id || 0).padStart(4, "0")}`,
    createdAt: formatOrderDate(order.created_at || order.date || order.order_date),
    status: normalizeOrderStatus(order.status),
    statusText: getOrderStatusLabel(order.status),
    customerName: order.customer_name || "Cliente",
    customerEmail: order.customer_email || "No disponible",
    customerPhone: order.customer_phone || "No disponible",
    address: normalizeAddress(order),
    subtotal: Number(order.products_subtotal || order.subtotal || 0),
    shipping: Number(order.delivery_fee || order.shipping || 0),
    total: Number(order.total || 0),
    distanceKm: order.distance_km,
    durationMinutes: order.estimated_duration_minutes,
    paymentMethod: order.payment_method,
    paymentMethodText: getPaymentMethodLabel(order.payment_method),
    paymentStatus: order.payment_status,
    paymentStatusText: getPaymentStatusLabel(order.payment_status),
    paymentReference: order.payment_reference,
    paymentMasked: order.payment_snapshot?.masked,
    items,
  };
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useEffectiveSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setError("Pedido no válido.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await orderService.detail(orderId);
      setOrder(normalizeOrder(response));
    } catch (requestError) {
      setError(requestError.message || "No se pudo cargar el pedido.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(routePaths.account.login);
      return;
    }

    if (!authLoading && isAuthenticated) {
      const timeoutId = window.setTimeout(loadOrder, 0);
      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [authLoading, isAuthenticated, loadOrder, navigate]);

  const renderBody = () => {
    if (loading || authLoading) {
      return <p className="orders-empty__message">Cargando pedido...</p>;
    }

    if (error) {
      return (
        <div className="orders-empty">
          <p className="orders-empty__message">{error}</p>
          <button type="button" className="orders-empty__btn" onClick={loadOrder}>
            Reintentar
          </button>
        </div>
      );
    }

    if (!order) {
      return (
        <div className="orders-empty">
          <p className="orders-empty__message">No se encontró el pedido.</p>
          <Link to={routePaths.account.orders} className="orders-empty__btn">
            Volver a mis pedidos
          </Link>
        </div>
      );
    }

    const progressIndex = ORDER_PROGRESS_STEPS.findIndex(
      (step) => step.id === order.status,
    );
    const isCancelled = ["cancelled", "canceled"].includes(order.status);

    return (
      <>
        <section className={`orders-tracker${isCancelled ? " orders-tracker--cancelled" : ""}`} aria-label="Seguimiento del pedido">
          <div className="orders-tracker__heading">
            <div>
              <span>Seguimiento</span>
              <h2>{isCancelled ? "Pedido cancelado" : order.statusText}</h2>
            </div>
            <p>{isCancelled ? "Este pedido ya no continuará su proceso." : "Consulta en qué etapa se encuentra tu compra."}</p>
          </div>
          {!isCancelled ? (
            <ol className="orders-tracker__steps">
              {ORDER_PROGRESS_STEPS.map((step, index) => {
                const isComplete = progressIndex >= index;
                const isCurrent = progressIndex === index;
                return (
                  <li
                    key={step.id}
                    className={`${isComplete ? "is-complete" : ""}${isCurrent ? " is-current" : ""}`}
                  >
                    <span aria-hidden="true">{isComplete ? "✓" : index + 1}</span>
                    <strong>{step.label}</strong>
                  </li>
                );
              })}
            </ol>
          ) : null}
        </section>

        <div className="orders-detail-box">
        <div className="orders-detail-grid">
          <div className="orders-detail-section">
            <h4 className="orders-detail__header">Productos</h4>
            <div className="orders-detail__content">
              {order.items.length > 0 ? (
                order.items.map((item) => (
                  <div className="orders-detail__product" key={item.id}>
                    <div className="orders-detail__product-info">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="orders-detail__product-image"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = productImage({});
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
                          x {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="orders-detail__product-price">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="orders-empty__message">
                  No hay productos asociados a este pedido.
                </p>
              )}
            </div>
          </div>

          <div className="orders-detail-section">
            <h4 className="orders-detail__header">Información</h4>
            <div className="orders-detail__content">
              <div className="orders-detail__item">
                <span className="orders-detail__label">Número de pedido</span>
                <span className="orders-detail__value">{order.orderNumber}</span>
              </div>
              <div className="orders-detail__item">
                <span className="orders-detail__label">Fecha</span>
                <span className="orders-detail__value">{order.createdAt}</span>
              </div>
              <div className="orders-detail__item">
                <span className="orders-detail__label">Estado</span>
                <span className={`orders-status ${getStatusClass(order.status)}`}>
                  {order.statusText}
                </span>
              </div>
              <div className="orders-detail__item">
                <span className="orders-detail__label">Pago</span>
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
                      Referencia: {order.paymentReference}
                    </>
                  )}
                </span>
              </div>
              <div className="orders-detail__item">
                <span className="orders-detail__label">Dirección de entrega</span>
                <span className="orders-detail__value">{order.address}</span>
              </div>
              <div className="orders-detail__item">
                <span className="orders-detail__label">Distancia</span>
                <span className="orders-detail__value">
                  {order.distanceKm ? `${order.distanceKm} km` : "No disponible"}
                </span>
              </div>
              <div className="orders-detail__item">
                <span className="orders-detail__label">Tiempo estimado</span>
                <span className="orders-detail__value">
                  {order.durationMinutes
                    ? `${order.durationMinutes} min`
                    : "No disponible"}
                </span>
              </div>
            </div>
          </div>

          <div className="orders-detail-section">
            <h4 className="orders-detail__header">Cliente</h4>
            <div className="orders-detail__content">
              <div className="orders-detail__item">
                <span className="orders-detail__label">Nombre</span>
                <span className="orders-detail__value">{order.customerName}</span>
              </div>
              <div className="orders-detail__item">
                <span className="orders-detail__label">Correo</span>
                <span className="orders-detail__value">{order.customerEmail}</span>
              </div>
              <div className="orders-detail__item">
                <span className="orders-detail__label">Teléfono</span>
                <span className="orders-detail__value">{order.customerPhone}</span>
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
                    {order.shipping > 0 ? formatPrice(order.shipping) : "Gratis"}
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
      </>
    );
  };

  return (
    <div className="home-page orders-page">
      <HomeHeader />

      <PageHero title={order ? `Pedido ${order.number || order.id}` : "Detalle del pedido"} eyebrow="Seguimiento" image="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1800&q=82" current="Detalle del pedido" />

      <main className="orders-main">
        <div className="orders-toolbar">
          <Link to={routePaths.account.orders} className="orders-empty__btn">
            Volver a mis pedidos
          </Link>
        </div>
        {renderBody()}
      </main>

      <HomeFooter />
    </div>
  );
}
