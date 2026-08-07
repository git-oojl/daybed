import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaCircleInfo,
  FaCreditCard,
  FaHeadset,
  FaLocationDot,
  FaReceipt,
  FaTruck,
} from "react-icons/fa6";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import OpenStreetMapEmbed from "../../components/store/OpenStreetMapEmbed.jsx";
import FeatureState from "../../components/support/FeatureState.jsx";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { routePaths } from "../../routes/routePaths.js";
import { useEffectiveLocation, useEffectiveParams } from "../../dev-preview/useEffectiveRouteState.js";
import { API_ERROR_KINDS } from "../../services/apiErrors.js";
import { orderService } from "../../services/backendServices.js";
import { productImage } from "../../services/viewMappers.js";
import useStoreSettings from "../../services/useStoreSettings.js";
import {
  formatMoney,
  formatOrderDate,
  normalizeOrder,
  ORDER_PROGRESS_STEPS,
  paymentMethodLabel,
  paymentStatusLabel,
  progressIndexFor,
} from "../../utils/orderPresentation.js";

const HERO = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1800&q=82";

function ProgressTracker({ order }) {
  const cancelled = order.status === "cancelled";
  const currentIndex = progressIndexFor(order.status);

  return (
    <section className={`order-progress${cancelled ? " order-progress--cancelled" : ""}`} aria-label="Seguimiento del pedido">
      <div className="order-progress__summary">
        <div>
          <p className="section-kicker">Estado actual</p>
          <h2>{order.statusInfo.label}</h2>
        </div>
        <p>{cancelled ? "Este pedido terminó y no puede volver a activarse." : "Seguimos cada etapa hasta que tu pedido llegue a destino."}</p>
      </div>
      {cancelled ? (
        <div className="order-cancel-note"><FaCircleInfo /><span>{order.statusHistory.at(-1)?.note || "La cancelación quedó registrada en el historial del pedido."}</span></div>
      ) : (
        <ol className="order-progress__steps">
          {ORDER_PROGRESS_STEPS.map((step, index) => {
            const complete = currentIndex >= index;
            return (
              <li key={step.value} className={`${complete ? "is-complete" : ""}${currentIndex === index ? " is-current" : ""}`}>
                <span>{complete ? "✓" : index + 1}</span>
                <strong>{step.shortLabel}</strong>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function ProductRow({ item }) {
  return (
    <article className="order-line-item">
      <img
        src={item.image}
        alt={item.name}
        onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = productImage({}); }}
      />
      <div className="order-line-item__copy">
        <span>{item.sku}</span>
        <h3>{item.name}</h3>
        {item.options.length ? <p>{item.options.map((option) => `${option.label}: ${option.value}`).join(" · ")}</p> : null}
        <dl>
          <div><dt>Cantidad</dt><dd>{item.quantity}</dd></div>
          <div><dt>Precio unitario</dt><dd>{formatMoney(item.unitPrice)}</dd></div>
        </dl>
      </div>
      <strong className="order-line-item__total">{formatMoney(item.lineTotal)}</strong>
    </article>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useEffectiveParams(routePaths.account.orderDetail);
  const navigate = useNavigate();
  const location = useEffectiveLocation();
  const { isAuthenticated, isLoading: authLoading } = useEffectiveSession();
  const { settings } = useStoreSettings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrder = useCallback(async ({ silent = false } = {}) => {
    if (!orderId) return;
    try {
      if (!silent) setLoading(true);
      setError(null);
      const response = await orderService.detail(orderId);
      setOrder(response ? normalizeOrder(response) : null);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(routePaths.account.login, { replace: true, state: { from: { pathname: location.pathname }, sessionMessage: "Inicia sesión de nuevo para consultar tu pedido." } });
      return;
    }
    if (!authLoading && isAuthenticated) loadOrder();
  }, [authLoading, isAuthenticated, loadOrder, location.pathname, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const refresh = () => loadOrder({ silent: true });
    window.addEventListener("daybed:orders-updated", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("daybed:orders-updated", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [isAuthenticated, loadOrder]);

  let content;
  if (loading || authLoading) {
    content = <FeatureState tone="loading" eyebrow="Pedido Daybed" title="Abriendo tu pedido" message="Estamos reuniendo el seguimiento, los productos y la entrega." />;
  } else if (error || !order) {
    const expired = error?.kind === API_ERROR_KINDS.AUTH_EXPIRED || error?.kind === API_ERROR_KINDS.AUTH_INVALID;
    content = (
      <FeatureState
        tone={expired ? "auth" : "error"}
        eyebrow="No encontramos esta ficha"
        title={expired ? "Tu sesión terminó" : "Este pedido no está disponible"}
        message={expired ? "Vuelve a iniciar sesión. Tus pedidos y tu carrito permanecerán asociados a tu cuenta." : "Puede que el enlace haya cambiado o que este pedido no pertenezca a tu cuenta."}
        actionLabel={expired ? "Iniciar sesión" : "Volver a Mis pedidos"}
        actionTo={expired ? routePaths.account.login : routePaths.account.orders}
        secondaryLabel="Ir a Tienda"
        secondaryTo={routePaths.public.catalog}
      />
    );
  } else {
    content = (
      <>
        <section className="order-detail-heading">
          <div><p className="section-kicker">{order.label}</p><h1>Resumen y seguimiento</h1><p>Realizado el {formatOrderDate(order.created_at, true)}</p></div>
          <span className={`order-pill order-pill--${order.statusInfo.tone}`}>{order.statusInfo.shortLabel}</span>
        </section>

        <ProgressTracker order={order} />

        <div className="customer-order-layout">
          <div className="customer-order-layout__primary">
            <section className="order-detail-panel">
              <header><FaBoxOpen /><div><p>Contenido</p><h2>Productos del pedido</h2></div></header>
              <div className="order-line-items">{order.items.map((item) => <ProductRow key={item.id || `${item.productId}-${item.name}`} item={item} />)}</div>
            </section>

            <section className="order-detail-panel">
              <header><FaLocationDot /><div><p>Entrega</p><h2>Destino del pedido</h2></div></header>
              <p className="order-detail-address">{order.address}</p>
              {order.deliveryNotes ? <div className="order-detail-note"><strong>Indicaciones:</strong> {order.deliveryNotes}</div> : null}
              {order.latitude != null && order.longitude != null ? (
                <OpenStreetMapEmbed compact latitude={order.latitude} longitude={order.longitude} label={`Destino · ${order.address}`} title={`Destino del ${order.label}`} />
              ) : (
                <FeatureState compact tone="map" title="Ubicación aún sin coordenadas" message="La dirección está guardada y Daybed la usará para la entrega. El mapa aparecerá cuando la ubicación quede confirmada." />
              )}
            </section>
          </div>

          <aside className="customer-order-layout__aside">
            <section className="order-detail-panel order-detail-panel--compact">
              <header><FaReceipt /><div><p>Resumen</p><h2>Totales</h2></div></header>
              <dl className="order-money-list">
                <div><dt>Productos</dt><dd>{formatMoney(order.subtotal)}</dd></div>
                <div><dt>Envío</dt><dd>{order.deliveryFee ? formatMoney(order.deliveryFee) : "Gratis"}</dd></div>
                {order.discountTotal ? <div><dt>Descuentos</dt><dd>-{formatMoney(order.discountTotal)}</dd></div> : null}
                <div className="is-total"><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div>
              </dl>
            </section>

            <section className="order-detail-panel order-detail-panel--compact">
              <header><FaCreditCard /><div><p>Pago</p><h2>Forma de pago</h2></div></header>
              <dl className="order-fact-list">
                <div><dt>Método</dt><dd>{paymentMethodLabel(order.payment_method)}</dd></div>
                <div><dt>Estado</dt><dd>{paymentStatusLabel(order.payment_status)}</dd></div>
                {order.payment_reference ? <div><dt>Referencia</dt><dd>{order.payment_reference}</dd></div> : null}
              </dl>
            </section>

            <section className="order-detail-panel order-detail-panel--compact">
              <header><FaTruck /><div><p>Operación</p><h2>Preparación y cancelación</h2></div></header>
              <dl className="order-fact-list">
                <div><dt>Preparación estimada</dt><dd>{order.preparationEstimateDays ? `${order.preparationEstimateDays} días` : "Por confirmar"}</dd></div>
                <div><dt>Cancelación</dt><dd>{order.status === "cancelled" ? "Cancelación registrada" : order.customerCancellationAvailable ? `Disponible hasta ${formatOrderDate(order.cancellationDeadline, true)}` : "Consulta con soporte"}</dd></div>
              </dl>
              <p className="order-policy-copy">{settings.support_instructions}</p>
            </section>

            <section className="order-support-card">
              <FaHeadset />
              <div><p>¿Necesitas ayuda?</p><h2>Estamos contigo</h2><span>Incluye {order.label} cuando nos escribas para atenderte más rápido.</span></div>
              <Link to={`${routePaths.public.contactHelp}?pedido=${encodeURIComponent(order.number)}`}>Contactar a Daybed</Link>
            </section>
          </aside>
        </div>
      </>
    );
  }

  return (
    <div className="home-page customer-order-detail">
      <HomeHeader />
      <PageHero title="Detalle del pedido" eyebrow="Tu cuenta" image={HERO} current="Detalle del pedido" />
      <main className="customer-order-detail__main">
        <Link className="back-inline" to={routePaths.account.orders}><FaArrowLeft /> Volver a Mis pedidos</Link>
        {content}
      </main>
      <HomeFooter />
    </div>
  );
}
