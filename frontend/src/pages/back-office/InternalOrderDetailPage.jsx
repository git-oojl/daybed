import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaBoxOpen, FaCheck, FaCreditCard, FaEnvelope, FaMapMarkerAlt, FaPhone, FaTruck, FaUser } from "react-icons/fa";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import OpenStreetMapEmbed from "../../components/store/OpenStreetMapEmbed.jsx";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { routePaths } from "../../routes/routePaths.js";
import { orderService } from "../../services/backendServices.js";
import { formatMoney, formatOrderDate, normalizeOrder, ORDER_STATUSES, paymentMethodLabel, paymentStatusLabel } from "../../utils/orderPresentation.js";

const HERO = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1800&q=82";

export default function InternalOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useEffectiveSession();
  const viewer = getViewerIdForUser(user);
  const canUpdate = viewer === "admin" || (user?.effective_permission_codes || []).includes("orders.status.update");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true); setError("");
      setOrder(normalizeOrder(await orderService.manageDetail(orderId)));
    } catch (err) {
      setError(err.message || "No pudimos abrir este pedido.");
    } finally { setLoading(false); }
  }, [orderId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) return navigate(routePaths.account.login);
    if (!authLoading && isAuthenticated && !["admin", "employee"].includes(viewer)) return navigate(routePaths.support.unauthorized);
    if (!authLoading && isAuthenticated) loadOrder();
  }, [authLoading, isAuthenticated, loadOrder, navigate, viewer]);

  async function changeStatus(nextStatus) {
    try {
      setSaving(true); setError("");
      setOrder(normalizeOrder(await orderService.updateStatus(order.id, nextStatus)));
    } catch (err) { setError(err.message || "No fue posible guardar el estado."); }
    finally { setSaving(false); }
  }

  async function confirmPayment() {
    try {
      setSaving(true); setError("");
      setOrder(normalizeOrder(await orderService.updatePaymentStatus(order.id, "authorized")));
    } catch (err) { setError(err.message || "No fue posible confirmar el pago."); }
    finally { setSaving(false); }
  }

  return (
    <div className="home-page internal-order-detail-v2">
      <HomeHeader />
      <PageHero title={order ? `Pedido ${order.number}` : "Detalle de pedido"} eyebrow="Operación" image={HERO} current="Detalle de pedido" />
      <main className="internal-order-detail-v2__main">
        <Link className="back-inline" to={routePaths.backOffice.orders}><FaArrowLeft /> Volver a pedidos</Link>
        {loading || authLoading ? <section className="state-card"><span className="state-card__icon"><FaBoxOpen /></span><h2>Abriendo la ficha</h2><p>Reuniendo cliente, productos, pago y entrega.</p></section> : error && !order ? <section className="state-card state-card--error"><span className="state-card__icon">!</span><h2>No pudimos abrir el pedido</h2><p>{error}</p><button onClick={loadOrder}>Reintentar</button></section> : order ? (
          <>
            {error ? <div className="inline-notice inline-notice--error">{error}</div> : null}
            <section className="internal-order-detail-v2__summary">
              <div><p className="section-kicker">Creado {formatOrderDate(order.created_at, true)}</p><h2>{order.customerName}</h2><p>{order.items.length} {order.items.length === 1 ? "pieza" : "piezas"} · {formatMoney(order.total)}</p></div>
              <div className="internal-order-detail-v2__status"><span className={`order-pill order-pill--${order.statusInfo.tone}`}>{order.statusInfo.label}</span>{canUpdate ? <select disabled={saving} value={order.status} onChange={(event) => changeStatus(event.target.value)}>{ORDER_STATUSES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select> : null}</div>
            </section>

            <section className="internal-order-detail-v2__layout">
              <div className="internal-order-detail-v2__primary">
                <article className="detail-panel"><header><FaBoxOpen /><div><p>Contenido</p><h3>Productos del pedido</h3></div></header><div className="internal-order-products">{order.items.map((item) => <div className="internal-order-product" key={item.id || item.name}><img src={item.image} alt={item.name} /><div><span>{item.sku}</span><h4>{item.name}</h4><p>{item.description}</p>{item.productId ? <Link to={routePaths.public.productDetail.replace(":productId", item.productId)}>Ver producto</Link> : null}</div><dl><div><dt>Cantidad</dt><dd>{item.quantity}</dd></div><div><dt>Unidad</dt><dd>{formatMoney(item.unitPrice)}</dd></div><div><dt>Subtotal</dt><dd>{formatMoney(item.lineTotal)}</dd></div></dl></div>)}</div></article>

                <article className="detail-panel"><header><FaMapMarkerAlt /><div><p>Logística</p><h3>Dirección y recorrido</h3></div></header><p className="detail-panel__address">{order.address}</p>{order.latitude && order.longitude ? <OpenStreetMapEmbed latitude={order.latitude} longitude={order.longitude} label={`Entrega · ${order.address}`} /> : <div className="soft-fallback">La ubicación exacta todavía no está disponible para mostrarla en el mapa.</div>}<div className="detail-stat-row"><span><strong>{Number(order.distance_km || 0).toFixed(1)} km</strong> distancia estimada</span><span><strong>{Math.round(Number(order.estimated_duration_minutes || 0))} min</strong> recorrido estimado</span><span><strong>{order.delivery_zone || "Estándar"}</strong> zona</span></div></article>
              </div>

              <aside className="internal-order-detail-v2__aside">
                <article className="detail-panel detail-panel--compact"><header><FaUser /><div><p>Cliente</p><h3>Datos de contacto</h3></div></header><ul className="contact-facts"><li><FaUser /><span>{order.customerName}</span></li><li><FaEnvelope /><a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a></li><li><FaPhone /><a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a></li></ul></article>
                <article className="detail-panel detail-panel--compact"><header><FaCreditCard /><div><p>Cobro</p><h3>Pago</h3></div></header><dl className="stacked-facts"><div><dt>Método</dt><dd>{paymentMethodLabel(order.payment_method)}</dd></div><div><dt>Estado</dt><dd>{paymentStatusLabel(order.payment_status)}</dd></div>{order.payment_reference ? <div><dt>Referencia</dt><dd>{order.payment_reference}</dd></div> : null}</dl>{canUpdate && order.payment_status === "awaiting_transfer" ? <button className="solid-action" disabled={saving} onClick={confirmPayment}><FaCheck /> Confirmar transferencia</button> : null}</article>
                <article className="detail-panel detail-panel--compact"><header><FaTruck /><div><p>Resumen</p><h3>Totales</h3></div></header><dl className="order-totals"><div><dt>Productos</dt><dd>{formatMoney(order.subtotal)}</dd></div><div><dt>Entrega</dt><dd>{formatMoney(order.deliveryFee)}</dd></div><div><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div></dl></article>
              </aside>
            </section>
          </>
        ) : null}
      </main>
      <HomeFooter />
    </div>
  );
}
