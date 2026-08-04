import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaBoxOpen, FaClock, FaSearch, FaTruck } from "react-icons/fa";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { routePaths } from "../../routes/routePaths.js";
import { orderService } from "../../services/backendServices.js";
import { formatMoney, formatOrderDate, normalizeOrder } from "../../utils/orderPresentation.js";

const HERO = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1800&q=82";
const FILTERS = [
  ["all", "Todos"],
  ["active", "En curso"],
  ["delivered", "Entregados"],
  ["cancelled", "Cancelados"],
];

function OrderCard({ order }) {
  const detailPath = routePaths.account.orderDetail.replace(":orderId", order.id);
  return (
    <article className="orders-v2__card reveal-on-hover">
      <header className="orders-v2__card-head">
        <div>
          <p className="orders-v2__eyebrow">Pedido {order.number}</p>
          <h2>{formatOrderDate(order.created_at)}</h2>
        </div>
        <span className={`order-pill order-pill--${order.statusInfo.tone}`}>{order.statusInfo.label}</span>
      </header>

      <div className="orders-v2__body">
        <div className="orders-v2__products" aria-label="Productos del pedido">
          {order.items.slice(0, 3).map((item) => (
            <div className="orders-v2__product" key={item.id || `${item.name}-${item.quantity}`}>
              <img src={item.image} alt="" />
              <div>
                <strong>{item.name}</strong>
                <span>{item.quantity} × {formatMoney(item.unitPrice)}</span>
              </div>
            </div>
          ))}
          {order.items.length > 3 ? <p className="orders-v2__more">+{order.items.length - 3} piezas más</p> : null}
        </div>

        <dl className="orders-v2__facts">
          <div><dt><FaTruck /> Entrega</dt><dd>{order.address}</dd></div>
          <div><dt><FaClock /> Actualización</dt><dd>{formatOrderDate(order.updated_at || order.created_at, true)}</dd></div>
        </dl>
      </div>

      <footer className="orders-v2__card-foot">
        <div><span>Total</span><strong>{formatMoney(order.total)}</strong></div>
        <Link to={detailPath}>Ver seguimiento <FaArrowRight /></Link>
      </footer>
    </article>
  );
}

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useEffectiveSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate(routePaths.account.login);
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const response = await orderService.list();
        const rows = Array.isArray(response) ? response : response?.results || [];
        if (active) setOrders(rows.map(normalizeOrder));
      } catch (err) {
        if (active) setError(err.message || "No pudimos cargar tus pedidos.");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (isAuthenticated && !authLoading) load();
    return () => { active = false; };
  }, [authLoading, isAuthenticated]);

  const filtered = useMemo(() => orders.filter((order) => {
    const term = query.trim().toLowerCase();
    const matchesText = !term || order.number.toLowerCase().includes(term) || order.items.some((item) => item.name.toLowerCase().includes(term));
    const matchesFilter = filter === "all"
      || (filter === "active" && !["delivered", "cancelled"].includes(order.status))
      || order.status === filter;
    return matchesText && matchesFilter;
  }), [filter, orders, query]);

  const activeCount = orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length;
  const deliveredCount = orders.filter((order) => order.status === "delivered").length;

  return (
    <div className="home-page orders-v2">
      <HomeHeader />
      <PageHero title="Mis pedidos" eyebrow="Tu cuenta" image={HERO} />
      <main className="orders-v2__main">
        <section className="orders-v2__intro">
          <div><p className="section-kicker">Historial de compra</p><h2>Todo lo importante, sin ruido</h2><p>Consulta el estado, la entrega y los productos de cada pedido en una vista clara.</p></div>
          <div className="orders-v2__summary"><span><strong>{activeCount}</strong> en curso</span><span><strong>{deliveredCount}</strong> entregados</span></div>
        </section>

        <section className="orders-v2__toolbar" aria-label="Filtrar pedidos">
          <label className="orders-v2__search"><FaSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pedido o producto" /></label>
          <div className="orders-v2__filters">{FILTERS.map(([value, label]) => <button className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)} key={value}>{label}</button>)}</div>
        </section>

        {loading || authLoading ? (
          <section className="state-card"><span className="state-card__icon"><FaClock /></span><h2>Buscando tus pedidos</h2><p>Estamos organizando tu historial de compra.</p></section>
        ) : error ? (
          <section className="state-card state-card--error"><span className="state-card__icon">!</span><h2>No pudimos abrir tus pedidos</h2><p>{error}</p><button onClick={() => window.location.reload()}>Reintentar</button></section>
        ) : filtered.length ? (
          <section className="orders-v2__list">{filtered.map((order) => <OrderCard order={order} key={order.id} />)}</section>
        ) : (
          <section className="state-card"><span className="state-card__icon"><FaBoxOpen /></span><h2>{orders.length ? "No hay coincidencias" : "Tu historial empieza aquí"}</h2><p>{orders.length ? "Prueba con otro estado o término de búsqueda." : "Cuando realices una compra, podrás seguirla desde esta página."}</p>{orders.length ? <button onClick={() => { setQuery(""); setFilter("all"); }}>Limpiar filtros</button> : <Link to={routePaths.public.catalog}>Explorar la tienda</Link>}</section>
        )}
      </main>
      <HomeFooter />
    </div>
  );
}
