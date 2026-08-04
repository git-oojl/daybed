import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaBoxOpen, FaChartLine, FaReceipt, FaRoute, FaSackDollar, FaTriangleExclamation } from "react-icons/fa6";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { routePaths } from "../../routes/routePaths.js";
import { dashboardService } from "../../services/backendServices.js";
import { formatMoney, formatOrderDate, orderNumber, orderStatus } from "../../utils/orderPresentation.js";

const HERO = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1800&q=82";
const RANGES = [[30, "30 días"], [90, "90 días"], [180, "6 meses"], [365, "12 meses"]];

function Metric({ icon: Icon, label, value, detail }) {
  return <article className="metrics-v2__metric"><span><Icon /></span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article>;
}

export default function BusinessMetricsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useEffectiveSession();
  const viewer = getViewerIdForUser(user);
  const [rangeDays, setRangeDays] = useState(90);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true); setError("");
      setData(await dashboardService.metrics({ range_days: rangeDays }));
    } catch (err) {
      setError(err.message || "No fue posible consultar las métricas.");
      setData(null);
    } finally { setLoading(false); }
  }, [rangeDays]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) return navigate(routePaths.account.login);
    if (!authLoading && isAuthenticated && !["admin", "employee"].includes(viewer)) return navigate(routePaths.support.unauthorized);
    if (!authLoading && isAuthenticated) load();
  }, [authLoading, isAuthenticated, load, navigate, viewer]);

  const statusRows = data?.orders_by_status || [];
  const maxStatus = Math.max(1, ...statusRows.map((item) => Number(item.count || 0)));
  const monthRows = data?.sales_by_month || [];
  const maxMonth = Math.max(1, ...monthRows.map((item) => Number(item.total || 0)));
  const nonCancelled = useMemo(() => statusRows.filter((item) => item.status !== "cancelled").reduce((sum, item) => sum + Number(item.count || 0), 0), [statusRows]);

  return (
    <div className="home-page metrics-v2">
      <HomeHeader />
      <PageHero title="Métricas del negocio" eyebrow="Administración" image={HERO} />
      <main className="metrics-v2__main">
        <section className="metrics-v2__heading"><div><p className="section-kicker">Datos reales</p><h2>Lectura del periodo</h2><p>Los indicadores se recalculan con los pedidos registrados dentro del rango seleccionado.</p></div><label>Periodo<select value={rangeDays} onChange={(event) => setRangeDays(Number(event.target.value))}>{RANGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></section>

        {error ? <section className="state-card state-card--error"><span className="state-card__icon"><FaTriangleExclamation /></span><h2>Las métricas no están disponibles</h2><p>{error}</p><button onClick={load}>Reintentar</button></section> : loading || authLoading ? <section className="state-card"><span className="state-card__icon"><FaChartLine /></span><h2>Calculando indicadores</h2><p>Consultando pedidos, ventas e inventario.</p></section> : data ? <>
          <section className="metrics-v2__cards">
            <Metric icon={FaReceipt} label="Pedidos" value={Number(data.total_orders || 0).toLocaleString("es-MX")} detail={`${nonCancelled} no cancelados`} />
            <Metric icon={FaSackDollar} label="Ventas" value={formatMoney(data.total_sales)} detail={`Últimos ${data.range_days || rangeDays} días`} />
            <Metric icon={FaRoute} label="Distancia media" value={`${Number(data.average_delivery_distance || 0).toFixed(1)} km`} detail={`Entrega media ${formatMoney(data.average_delivery_fee)}`} />
            <Metric icon={FaBoxOpen} label="Stock bajo" value={Number(data.low_stock_count || 0).toLocaleString("es-MX")} detail={`${Number(data.total_products || 0)} productos activos`} />
          </section>

          <section className="metrics-v2__grid">
            <article className="metrics-panel"><header><div><p>Operación</p><h3>Pedidos por estado</h3></div><span>{data.total_orders} pedidos</span></header><div className="metrics-bars">{statusRows.map((item) => { const info = orderStatus(item.status); return <div className="metrics-bar" key={item.status}><div><span>{info.label}</span><strong>{item.count}</strong></div><i><b style={{ width: `${Math.max(4, Number(item.count || 0) / maxStatus * 100)}%` }} /></i></div>; })}</div></article>
            <article className="metrics-panel"><header><div><p>Ingresos</p><h3>Ventas por mes</h3></div><span>{formatMoney(data.total_sales)}</span></header>{monthRows.length ? <div className="metrics-columns">{monthRows.map((item) => <div key={item.month}><span title={formatMoney(item.total)} style={{ height: `${Math.max(8, Number(item.total || 0) / maxMonth * 100)}%` }} /><small>{new Date(`${item.month}-02`).toLocaleDateString("es-MX", { month: "short" })}</small></div>)}</div> : <div className="soft-fallback">Todavía no hay ventas en este periodo.</div>}</article>
          </section>

          <section className="metrics-v2__grid metrics-v2__grid--lower">
            <article className="metrics-panel"><header><div><p>Atención</p><h3>Pedidos recientes</h3></div><Link to={routePaths.backOffice.orders}>Ver operación <FaArrowRight /></Link></header><div className="metrics-list">{(data.recent_orders || []).length ? data.recent_orders.map((order) => <Link to={routePaths.backOffice.orderDetail.replace(":orderId", order.id)} key={order.id}><div><strong>{orderNumber(order.id)}</strong><span>{order.customer_name} · {formatOrderDate(order.created_at)}</span></div><div><span className={`order-pill order-pill--${orderStatus(order.status).tone}`}>{orderStatus(order.status).label}</span><strong>{formatMoney(order.total)}</strong></div></Link>) : <div className="soft-fallback">No hay pedidos recientes en el rango.</div>}</div></article>
            <article className="metrics-panel"><header><div><p>Inventario</p><h3>Productos por reponer</h3></div><Link to={routePaths.backOffice.inventory}>Abrir inventario <FaArrowRight /></Link></header><div className="metrics-list">{(data.low_stock || []).length ? data.low_stock.map((product) => <Link to={routePaths.backOffice.products} key={product.id}><div><strong>{product.name}</strong><span>{product.sku || "Sin SKU"} · mínimo {product.minimum_stock}</span></div><div><strong>{product.stock} uds.</strong></div></Link>) : <div className="soft-fallback">El inventario está por encima de sus mínimos.</div>}</div></article>
          </section>
        </> : null}
      </main>
      <HomeFooter />
    </div>
  );
}
