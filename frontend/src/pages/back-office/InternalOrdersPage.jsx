import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaSearch } from "react-icons/fa";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import FeatureState from "../../components/support/FeatureState.jsx";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { routePaths } from "../../routes/routePaths.js";
import { useEffectiveLocation, useEffectiveSearchParams } from "../../dev-preview/useEffectiveRouteState.js";
import { orderService } from "../../services/backendServices.js";
import { productImage } from "../../services/viewMappers.js";
import { formatMoney, formatOrderDate, normalizeOrder, ORDER_STATUSES } from "../../utils/orderPresentation.js";

const HERO = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1800&q=82";

export default function InternalOrdersPage() {
  const navigate = useNavigate();
  const location = useEffectiveLocation();
  const [searchParams, setSearchParams] = useEffectiveSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useEffectiveSession();
  const viewer = getViewerIdForUser(user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("estado") || "active");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await orderService.manageList();
      const rows = Array.isArray(response) ? response : response?.results || [];
      setOrders(rows.map(normalizeOrder));
    } catch (err) {
      setError(err.message || "No pudimos cargar la operación de pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) return navigate(routePaths.account.login, { replace: true });
    if (!authLoading && isAuthenticated && !["admin", "employee"].includes(viewer)) return navigate(routePaths.support.unauthorized, { replace: true });
    if (!authLoading && isAuthenticated) loadOrders();
  }, [authLoading, isAuthenticated, loadOrders, navigate, viewer]);

  useEffect(() => {
    const refresh = () => loadOrders();
    window.addEventListener("daybed:orders-updated", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("daybed:orders-updated", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [loadOrders]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (status !== "active") next.set("estado", status);
    if (query.trim()) next.set("q", query.trim());
    setSearchParams(next, { replace: true });
  }, [query, setSearchParams, status]);

  const filtered = useMemo(() => orders.filter((order) => {
    const term = query.trim().toLowerCase();
    const matchesText = !term || [order.number, order.customerName, order.customerEmail, ...order.items.map((item) => item.name)].some((value) => String(value).toLowerCase().includes(term));
    const matchesStatus = status === "all" || (status === "active" ? !["delivered", "cancelled"].includes(order.status) : order.status === status);
    return matchesText && matchesStatus;
  }), [orders, query, status]);

  return (
    <div className="home-page operations-orders">
      <HomeHeader />
      <PageHero title="Gestión de pedidos" eyebrow="Operación Daybed" image={HERO} current="Pedidos de clientes" />
      <main className="operations-orders__main">
        <section className="operations-orders__heading">
          <div><p className="section-kicker">Cola de atención</p><h2>Un registro claro por pedido</h2><p>Cada ficha conserva su propio cliente, productos, pago, entrega e historial.</p></div>
          <div className="operations-orders__totals"><span><strong>{orders.filter((item) => !["delivered", "cancelled"].includes(item.status)).length}</strong> por atender</span><span><strong>{orders.filter((item) => item.status === "shipped").length}</strong> en ruta</span></div>
        </section>

        <section className="operations-orders__toolbar">
          <label><FaSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pedido, cliente o producto" /></label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Estado del pedido">
            <option value="active">Pedidos activos</option><option value="all">Todos los pedidos</option>
            {ORDER_STATUSES.map((item) => <option value={item.value} key={item.value}>{item.shortLabel}</option>)}
          </select>
        </section>

        {error ? <div className="inline-notice inline-notice--error" role="alert"><strong>No pudimos actualizar la cola.</strong><span>{error}</span><button type="button" onClick={loadOrders}>Intentar de nuevo</button></div> : null}

        {loading || authLoading ? (
          <FeatureState tone="loading" title="Preparando la cola" message="Cargando pedidos y productos sin alterar el filtro seleccionado." />
        ) : filtered.length ? (
          <section className="operations-orders__list">
            {filtered.map((order) => {
              const detail = routePaths.backOffice.orderDetail.replace(":orderId", order.number);
              return (
                <article className="operations-order-card" key={order.id}>
                  <div className="operations-order-card__primary">
                    <div><p>{order.label}</p><h3>{order.customerName}</h3><span>{order.customerEmail}</span></div>
                    <span className={`order-pill order-pill--${order.statusInfo.tone}`}>{order.statusInfo.shortLabel}</span>
                  </div>
                  <div className="operations-order-card__products">
                    <div className="operations-order-card__thumbs">{order.items.slice(0, 3).map((item) => <img key={item.id || item.name} src={item.image} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = productImage({}); }} />)}</div>
                    <div><strong>{order.items.length} {order.items.length === 1 ? "producto" : "productos"}</strong><span>{order.items.map((item) => `${item.quantity}× ${item.name}`).slice(0, 2).join(" · ")}</span></div>
                  </div>
                  <dl><div><dt>Creado</dt><dd>{formatOrderDate(order.created_at, true)}</dd></div><div><dt>Entrega</dt><dd>{order.address}</dd></div><div><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div></dl>
                  <footer><span>{order.availableTransitions.length ? `${order.availableTransitions.length} acciones válidas` : "Sin acciones pendientes"}</span><Link state={{ from: `${location.pathname}${location.search}` }} to={detail}>Abrir ficha <FaArrowRight /></Link></footer>
                </article>
              );
            })}
          </section>
        ) : (
          <FeatureState tone="empty" title="No hay pedidos en esta vista" message="Cambia el filtro o limpia la búsqueda; ningún registro fue eliminado." actionLabel="Mostrar todos" onAction={() => { setStatus("all"); setQuery(""); }} />
        )}
      </main>
      <HomeFooter />
    </div>
  );
}
