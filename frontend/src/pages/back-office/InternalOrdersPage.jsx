import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaBox, FaSearch, FaTruck } from "react-icons/fa";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { routePaths } from "../../routes/routePaths.js";
import { orderService } from "../../services/backendServices.js";
import { formatMoney, formatOrderDate, normalizeOrder, ORDER_STATUSES } from "../../utils/orderPresentation.js";

const HERO = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1800&q=82";

export default function InternalOrdersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useEffectiveSession();
  const viewer = getViewerIdForUser(user);
  const canUpdate = viewer === "admin" || (user?.effective_permission_codes || []).includes("orders.status.update");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("active");
  const [changingId, setChangingId] = useState(null);

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
    if (!authLoading && !isAuthenticated) return navigate(routePaths.account.login);
    if (!authLoading && isAuthenticated && !["admin", "employee"].includes(viewer)) return navigate(routePaths.support.unauthorized);
    if (!authLoading && isAuthenticated) loadOrders();
  }, [authLoading, isAuthenticated, loadOrders, navigate, viewer]);

  const filtered = useMemo(() => orders.filter((order) => {
    const term = query.trim().toLowerCase();
    const matchesText = !term || [order.number, order.customerName, order.customerEmail, ...order.items.map((item) => item.name)].some((value) => String(value).toLowerCase().includes(term));
    const matchesStatus = status === "all" || (status === "active" ? !["delivered", "cancelled"].includes(order.status) : order.status === status);
    return matchesText && matchesStatus;
  }), [orders, query, status]);

  async function updateStatus(order, nextStatus) {
    try {
      setChangingId(order.id);
      await orderService.updateStatus(order.id, nextStatus);
      await loadOrders();
    } catch (err) {
      setError(err.message || "No fue posible actualizar el estado.");
    } finally {
      setChangingId(null);
    }
  }

  return (
    <div className="home-page operations-orders">
      <HomeHeader />
      <PageHero title="Gestión de pedidos" eyebrow="Operación" image={HERO} current="Pedidos de clientes" />
      <main className="operations-orders__main">
        <section className="operations-orders__heading">
          <div><p className="section-kicker">Cola de atención</p><h2>Pedidos de clientes</h2><p>Revisa productos, pago, entrega y avanza cada pedido desde su ficha completa.</p></div>
          <div className="operations-orders__totals"><span><strong>{orders.filter((item) => !["delivered", "cancelled"].includes(item.status)).length}</strong> por atender</span><span><strong>{orders.filter((item) => item.status === "shipped").length}</strong> en ruta</span></div>
        </section>

        <section className="operations-orders__toolbar">
          <label><FaSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pedido, cliente o producto" /></label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Estado del pedido">
            <option value="active">Pedidos activos</option><option value="all">Todos los pedidos</option>
            {ORDER_STATUSES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
          </select>
        </section>

        {error ? <div className="inline-notice inline-notice--error"><strong>Atención:</strong> {error}<button onClick={loadOrders}>Reintentar</button></div> : null}

        {loading || authLoading ? (
          <section className="state-card"><span className="state-card__icon"><FaBox /></span><h2>Preparando la cola</h2><p>Cargando pedidos y productos.</p></section>
        ) : filtered.length ? (
          <section className="operations-orders__list">
            {filtered.map((order) => {
              const detail = routePaths.backOffice.orderDetail.replace(":orderId", order.id);
              return (
                <article className="operations-order-card" key={order.id}>
                  <div className="operations-order-card__primary">
                    <div><p>{order.number}</p><h3>{order.customerName}</h3><span>{order.customerEmail}</span></div>
                    <span className={`order-pill order-pill--${order.statusInfo.tone}`}>{order.statusInfo.label}</span>
                  </div>
                  <div className="operations-order-card__products">
                    <div className="operations-order-card__thumbs">{order.items.slice(0, 3).map((item) => <img key={item.id || item.name} src={item.image} alt="" />)}</div>
                    <div><strong>{order.items.length} {order.items.length === 1 ? "producto" : "productos"}</strong><span>{order.items.map((item) => `${item.quantity}× ${item.name}`).slice(0, 2).join(" · ")}</span></div>
                  </div>
                  <dl><div><dt>Creado</dt><dd>{formatOrderDate(order.created_at, true)}</dd></div><div><dt>Entrega</dt><dd>{order.address}</dd></div><div><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div></dl>
                  <footer>
                    {canUpdate ? <label>Estado<select disabled={changingId === order.id} value={order.status} onChange={(event) => updateStatus(order, event.target.value)}>{ORDER_STATUSES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label> : <span />}
                    <Link to={detail}>Abrir ficha <FaArrowRight /></Link>
                  </footer>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="state-card"><span className="state-card__icon"><FaTruck /></span><h2>No hay pedidos en esta vista</h2><p>Cambia el filtro o limpia la búsqueda para consultar el resto de la operación.</p><button onClick={() => { setStatus("all"); setQuery(""); }}>Mostrar todos</button></section>
        )}
      </main>
      <HomeFooter />
    </div>
  );
}
