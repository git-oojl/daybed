import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaCheck,
  FaClock,
  FaClockRotateLeft,
  FaCreditCard,
  FaEnvelope,
  FaLocationDot,
  FaNoteSticky,
  FaPhone,
  FaTruck,
  FaUser,
} from "react-icons/fa6";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import OpenStreetMapEmbed from "../../components/store/OpenStreetMapEmbed.jsx";
import FeatureState from "../../components/support/FeatureState.jsx";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { routePaths } from "../../routes/routePaths.js";
import { useEffectiveLocation, useEffectiveParams } from "../../dev-preview/useEffectiveRouteState.js";
import { orderService } from "../../services/backendServices.js";
import { productImage } from "../../services/viewMappers.js";
import {
  formatMoney,
  formatOrderDate,
  normalizeOrder,
  ORDER_STATUSES,
  paymentMethodLabel,
  paymentStatusLabel,
} from "../../utils/orderPresentation.js";

const HERO = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1800&q=82";
const STATUS_EXPLANATIONS = {
  confirmed: "El pago quedó confirmado y el pedido puede prepararse.",
  preparing: "El equipo está reuniendo y revisando las piezas.",
  shipped: "El pedido salió a entrega.",
  delivered: "La entrega quedó completada.",
  cancelled: "La cancelación es definitiva y libera el inventario reservado.",
};

export default function InternalOrderDetailPage() {
  const { orderId } = useEffectiveParams(routePaths.backOffice.orderDetail);
  const navigate = useNavigate();
  const location = useEffectiveLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useEffectiveSession();
  const viewer = getViewerIdForUser(user);
  const canUpdate = viewer === "admin" || (user?.effective_permission_codes || []).includes("orders.status.update");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      setError(null);
      const next = normalizeOrder(await orderService.manageDetail(orderId));
      setOrder(next);
      setInternalNotes(next.internalNotes);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(routePaths.account.login, { replace: true, state: { from: location.pathname } });
      return;
    }
    if (!authLoading && isAuthenticated && !["admin", "employee"].includes(viewer)) {
      navigate(routePaths.support.unauthorized, { replace: true });
      return;
    }
    if (!authLoading && isAuthenticated) loadOrder();
  }, [authLoading, isAuthenticated, loadOrder, location.pathname, navigate, viewer]);

  const nextStatuses = useMemo(() => {
    if (!order) return [];
    return ORDER_STATUSES.filter((status) => order.availableTransitions.includes(status.value));
  }, [order]);

  async function changeStatus(nextStatus) {
    if (!order?.availableTransitions.includes(nextStatus)) return;
    if (
      nextStatus === "cancelled"
      && !window.confirm(
        "Vas a cancelar este pedido. La cancelación es definitiva y libera el inventario reservado. ¿Quieres continuar?",
      )
    ) {
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const updated = normalizeOrder(await orderService.updateStatus(order.id, nextStatus, {
        status_note: STATUS_EXPLANATIONS[nextStatus] || "Estado actualizado por el equipo.",
        internal_notes: internalNotes,
      }));
      setOrder(updated);
      setInternalNotes(updated.internalNotes);
      window.dispatchEvent(new CustomEvent("daybed:orders-updated", { detail: { order: updated } }));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setSaving(false);
    }
  }

  async function saveNotes() {
    if (!order) return;
    try {
      setSaving(true);
      setError(null);
      const updated = normalizeOrder(await orderService.updateStatus(order.id, undefined, { internal_notes: internalNotes }));
      setOrder(updated);
      window.dispatchEvent(new CustomEvent("daybed:orders-updated", { detail: { order: updated } }));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setSaving(false);
    }
  }

  async function confirmPayment() {
    try {
      setSaving(true);
      setError(null);
      const updated = normalizeOrder(await orderService.updatePaymentStatus(order.id, "authorized"));
      setOrder(updated);
      window.dispatchEvent(new CustomEvent("daybed:orders-updated", { detail: { order: updated } }));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="home-page internal-order-detail-v3">
      <HomeHeader />
      <PageHero title={order ? order.label : "Detalle de pedido"} eyebrow="Operación" image={HERO} current="Detalle de pedido" />
      <main className="internal-order-detail-v3__main">
        <Link className="back-inline" to={location.state?.from || routePaths.backOffice.orders}><FaArrowLeft /> Volver a gestión de pedidos</Link>

        {loading || authLoading ? (
          <FeatureState tone="loading" eyebrow="Operación" title="Abriendo la ficha" message="Reuniendo cliente, productos, pago, inventario y entrega." />
        ) : error && !order ? (
          <FeatureState tone="error" eyebrow="Pedido no disponible" title="No pudimos abrir esta ficha" message="El pedido pudo eliminarse, cambiar de acceso o no existir." actionLabel="Volver a pedidos" actionTo={routePaths.backOffice.orders} />
        ) : order ? (
          <>
            {error ? <div className="inline-notice inline-notice--error" role="alert">{error.message || "No fue posible guardar el cambio. La ficha conserva los datos anteriores."}</div> : null}

            <section className="internal-order-overview">
              <div><p className="section-kicker">{order.label}</p><h1>{order.customerName}</h1><p>Creado {formatOrderDate(order.created_at, true)} · {order.items.length} {order.items.length === 1 ? "producto" : "productos"}</p></div>
              <div><span className={`order-pill order-pill--${order.statusInfo.tone}`}>{order.statusInfo.shortLabel}</span><strong>{formatMoney(order.total)}</strong></div>
            </section>

            <section className="internal-order-actions">
              <div>
                <p className="section-kicker">Estado del pedido</p>
                <h2>{order.statusInfo.shortLabel}</h2>
                <p>{nextStatuses.length ? "Selecciona el siguiente estado disponible." : order.status === "cancelled" ? "Pedido cancelado." : "Pedido cerrado."}</p>
                {order.availableTransitions.includes("cancelled") ? <p className="internal-order-actions__warning">Cancelar cierra el pedido y no se puede deshacer.</p> : null}
              </div>
              {canUpdate && nextStatuses.length ? <div className="internal-order-actions__buttons">{nextStatuses.map((status) => <button key={status.value} className={status.value === "cancelled" ? "is-danger" : ""} disabled={saving} type="button" onClick={() => changeStatus(status.value)}>{status.value === "cancelled" ? "Cancelar pedido" : status.shortLabel}</button>)}</div> : null}
            </section>

            <div className="internal-order-layout">
              <div className="internal-order-layout__primary">
                <section className="order-detail-panel">
                  <header><FaBoxOpen /><div><p>Contenido</p><h2>Productos del pedido</h2></div></header>
                  <div className="internal-product-list">{order.items.map((item) => (
                    <article className="internal-product-row" key={item.id || `${item.productId}-${item.name}`}>
                      <img src={item.image} alt={item.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = productImage({}); }} />
                      <div><span>{item.sku}</span><h3>{item.name}</h3><p>{item.description}</p>{item.productId ? <Link className="internal-inline-link" to={`${routePaths.backOffice.products}?producto=${item.productId}`}>Abrir en productos</Link> : null}</div>
                      <dl><div><dt>Cantidad</dt><dd>{item.quantity}</dd></div><div><dt>Unidad</dt><dd>{formatMoney(item.unitPrice)}</dd></div><div><dt>Total</dt><dd>{formatMoney(item.lineTotal)}</dd></div></dl>
                    </article>
                  ))}</div>
                </section>

                <section className="order-detail-panel">
                  <header><FaLocationDot /><div><p>Entrega</p><h2>Destino y recorrido</h2></div></header>
                  <p className="order-detail-address">{order.address}</p>
                  {order.latitude != null && order.longitude != null ? <OpenStreetMapEmbed latitude={order.latitude} longitude={order.longitude} label={`Entrega · ${order.address}`} title={`Entrega de ${order.label}`} /> : <FeatureState compact tone="map" title="Sin coordenadas confirmadas" message="La dirección sigue disponible. Corrige la ubicación desde checkout o registra la entrega manualmente." />}
                  <dl className="delivery-stat-grid">
                    <div><dt><FaTruck />Distancia</dt><dd>{order.distanceKm == null ? "Sin cálculo" : `${order.distanceKm.toFixed(1)} km`}</dd></div>
                    <div><dt><FaClock />Tiempo estimado</dt><dd>{order.durationMinutes == null ? "Sin cálculo" : `${Math.round(order.durationMinutes)} min`}</dd></div>
                    <div><dt><FaLocationDot />Zona</dt><dd>{order.deliveryZone}</dd></div>
                  </dl>
                </section>

                <section className="order-detail-panel">
                  <header><FaClockRotateLeft /><div><p>Trazabilidad</p><h2>Historial de estados</h2></div></header>
                  {order.statusHistory.length ? <ol className="status-history">{order.statusHistory.map((event) => <li key={event.id || `${event.to_status}-${event.created_at}`}><div><strong>{ORDER_STATUSES.find((status) => status.value === event.to_status)?.shortLabel || event.to_status}</strong><p>{event.note || "Cambio registrado por el equipo."}</p><small>{formatOrderDate(event.created_at, true)} · {event.actor_name || "Equipo"}</small></div></li>)}</ol> : <FeatureState compact tone="empty" title="Sin historial previo" message="Los próximos cambios quedarán registrados aquí." />}
                </section>
              </div>

              <aside className="internal-order-layout__aside">
                <section className="order-detail-panel order-detail-panel--compact"><header><FaUser /><div><p>Cliente</p><h2>Contacto</h2></div></header><ul className="contact-facts"><li><FaUser /><span>{order.customerName}</span></li><li><FaEnvelope /><a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a></li><li><FaPhone /><a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a></li></ul></section>
                <section className="order-detail-panel order-detail-panel--compact"><header><FaCreditCard /><div><p>Cobro</p><h2>Pago</h2></div></header><dl className="order-fact-list"><div><dt>Método</dt><dd>{paymentMethodLabel(order.payment_method)}</dd></div><div><dt>Estado</dt><dd>{paymentStatusLabel(order.payment_status)}</dd></div>{order.payment_reference ? <div><dt>Referencia</dt><dd>{order.payment_reference}</dd></div> : null}</dl>{canUpdate && order.payment_status === "awaiting_transfer" ? <button className="solid-action" disabled={saving} type="button" onClick={confirmPayment}><FaCheck /> Confirmar transferencia</button> : null}</section>
                <section className="order-detail-panel order-detail-panel--compact"><header><FaTruck /><div><p>Importes</p><h2>Totales</h2></div></header><dl className="order-money-list"><div><dt>Productos</dt><dd>{formatMoney(order.subtotal)}</dd></div><div><dt>Entrega</dt><dd>{formatMoney(order.deliveryFee)}</dd></div>{order.discountTotal ? <div><dt>Descuento</dt><dd>-{formatMoney(order.discountTotal)}</dd></div> : null}<div className="is-total"><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div></dl></section>
                <section className="order-detail-panel order-detail-panel--compact"><header><FaNoteSticky /><div><p>Equipo</p><h2>Notas internas</h2></div></header><div className="internal-notes-form"><textarea value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} placeholder="Incidencias, acuerdos o instrucciones para el equipo" rows="5" /><button className="ghost-action" disabled={saving || internalNotes === order.internalNotes} type="button" onClick={saveNotes}>Guardar notas</button></div></section>
              </aside>
            </div>
          </>
        ) : null}
      </main>
      <HomeFooter />
    </div>
  );
}
