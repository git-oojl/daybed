import { FaExclamationTriangle } from "react-icons/fa";
import {
  FaArrowTrendUp,
  FaBoxOpen,
  FaChartPie,
  FaLocationDot,
  FaMoneyBillTrendUp,
  FaReceipt,
  FaTruckFast,
} from "react-icons/fa6";
import { Link } from "react-router-dom";
import "../../assets/CSS/admin/business-metrics.css";
import { routePaths } from "../../routes/routePaths.js";

const ADMIN_HERO_IMAGE =
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1920&q=80";

const lowStockProducts = [
  {
    name: "Daybed Roble",
    reference: "DB-104",
    units: 2,
    image: "/images/macetabotom4.jpeg",
  },
  {
    name: "Mesa auxiliar Nórdica",
    reference: "MN-208",
    units: 5,
    image: "/images/maceta5.jpeg",
  },
];

const orderStatus = [
  { label: "Entregados", value: 68, color: "#4d9b63" },
  { label: "En proceso", value: 24, color: "#c99742" },
  { label: "Pendientes", value: 8, color: "#d7765d" },
];

function MetricCard({ icon, label, value, detail, trend, tone = "gold" }) {
  return (
    <article className={`business-metric-card business-metric-card--${tone}`}>
      <div className="business-metric-card__icon">{icon}</div>
      <div>
        <p className="business-metric-card__label">{label}</p>
        <strong className="business-metric-card__value">{value}</strong>
        <span className="business-metric-card__detail">
          {trend ? <FaArrowTrendUp aria-hidden="true" /> : null}
          {detail}
        </span>
      </div>
    </article>
  );
}

function BusinessMetricsPage() {
  return (
    <div className="business-metrics">
      <section
        className="business-metrics__hero"
        style={{ backgroundImage: `url(${ADMIN_HERO_IMAGE})` }}
      >
        <div className="business-metrics__hero-overlay">
          <h1>Métricas del negocio</h1>
          <nav
            aria-label="Miga de pan"
            className="business-metrics__breadcrumb"
          >
            <Link to={routePaths.public.home}>Inicio</Link>
            <span aria-hidden="true">/</span>
            <span>Métricas del negocio</span>
          </nav>
        </div>
      </section>

      <main className="business-metrics__content">
        <div className="business-metrics__heading">
          <div>
            <p className="business-metrics__kicker">Panel administrativo</p>
            <h2>Resumen de rendimiento</h2>
            <p>Consulta el comportamiento de pedidos, ventas e inventario.</p>
          </div>
          <label className="business-metrics__range">
            <span>Rango de fechas</span>
            <select defaultValue="30">
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 3 meses</option>
            </select>
          </label>
        </div>

        <section
          className="business-metrics__summary"
          aria-label="Resumen de métricas"
        >
          <MetricCard
            icon={<FaReceipt />}
            label="Total de pedidos"
            value="124"
            detail="12.5% vs. mes anterior"
            trend
          />
          <MetricCard
            icon={<FaMoneyBillTrendUp />}
            label="Ventas simuladas"
            value="$185,500 MXN"
            detail="Ingresos del periodo"
            tone="green"
          />
          <MetricCard
            icon={<FaTruckFast />}
            label="Costo promedio de entrega"
            value="$280 MXN"
            detail="Por pedido entregado"
            tone="blue"
          />
          <MetricCard
            icon={<FaLocationDot />}
            label="Distancia estimada"
            value="18 km"
            detail="Promedio por entrega"
            tone="terracotta"
          />
        </section>

        <section className="business-metrics__grid">
          <article className="business-panel business-panel--stock">
            <div className="business-panel__heading">
              <div>
                <p className="business-panel__overline">
                  <FaExclamationTriangle /> Atención requerida
                </p>
                <h3>Productos con bajo stock</h3>
              </div>
              <Link to={routePaths.backOffice.inventory}>Ver inventario</Link>
            </div>
            <div className="business-stock-list">
              {lowStockProducts.map((product) => (
                <div className="business-stock-item" key={product.reference}>
                  <img src={product.image} alt="" />
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.reference}</span>
                  </div>
                  <b>{product.units} uds.</b>
                </div>
              ))}
            </div>
            <p className="business-panel__notice">
              2 productos requieren reposición próxima.
            </p>
          </article>

          <article className="business-panel">
            <div className="business-panel__heading">
              <div>
                <p className="business-panel__overline">
                  <FaChartPie /> Distribución
                </p>
                <h3>Pedidos por estado</h3>
              </div>
              <span className="business-panel__total">124 pedidos</span>
            </div>
            <div
              className="business-status-chart"
              aria-label="68 por ciento entregados, 24 por ciento en proceso y 8 por ciento pendientes"
            >
              <div className="business-status-chart__donut">
                <span>
                  100<small>%</small>
                </span>
              </div>
              <div className="business-status-chart__legend">
                {orderStatus.map((status) => (
                  <div key={status.label}>
                    <span style={{ backgroundColor: status.color }} />
                    <p>
                      {status.label}
                      <b>{status.value}%</b>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="business-insight" aria-label="Indicador principal">
          <div className="business-insight__icon">
            <FaBoxOpen />
          </div>
          <div>
            <p>Indicador del periodo</p>
            <strong>Los pedidos entregados aumentaron 12.5%.</strong>
          </div>
          <Link to={routePaths.backOffice.orders}>Revisar pedidos</Link>
        </section>
      </main>
    </div>
  );
}

export default BusinessMetricsPage;
