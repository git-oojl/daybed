import "../../assets/dashboard-page.css";

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      {/* HERO */}

      <section className="dashboard-hero">
        <div className="dashboard-overlay">
          <h1>Dashboard</h1>

          <p>
            Inicio <span>&gt;</span> Dashboard
          </p>
        </div>
      </section>

      {/* CONTENIDO */}

      <section className="dashboard-container">
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">Pedidos totales</div>

            <div className="metric-body">
              <div className="metric-row">
                <span>Pedidos mes actual</span>
                <span>124</span>
              </div>

              <div className="metric-row">
                <span>Pedidos del mes anterior</span>
                <span>112</span>
              </div>

              <p className="metric-highlight">+12 pedidos este mes</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">Ventas</div>

            <div className="metric-body">
              <div className="metric-row">
                <span>Ventas mes actual</span>
                <span>$45,230 MX</span>
              </div>

              <div className="metric-row">
                <span>Ventas mes anterior</span>
                <span>$41,611 MX</span>
              </div>

              <p className="metric-highlight">+8% ventas este mes</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">Productos bajos</div>

            <div className="metric-body">
              <div className="metric-row">
                <span>Stock total</span>
                <span>8</span>
              </div>

              <p className="metric-highlight">Necesitan reabastecer</p>
            </div>
          </div>
        </div>

        {/* TABLA */}

        <div className="sales-card">
          <div className="sales-title">Ventas por mes</div>

          <div className="sales-row">
            <span>Enero</span>
            <span>$5,000 MX</span>
          </div>

          <div className="sales-row">
            <span>Febrero</span>
            <span>$8,000 MX</span>
          </div>

          <div className="sales-row">
            <span>Marzo</span>
            <span>$12,000 MX</span>
          </div>

          <div className="sales-row">
            <span>Abril</span>
            <span>$15,000 MX</span>
          </div>

          <div className="sales-row">
            <span>Mayo</span>
            <span>$20,000 MX</span>
          </div>

          <div className="sales-footer">
            <span>Ventas del día</span>
            <span>$1,250 MX</span>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}

      <section className="dashboard-benefits">
        <div>
          <h3>CALIDAD SUPERIOR</h3>
          <p>Fabricado con materiales de primera</p>
        </div>

        <div>
          <h3>Protección de garantía</h3>
          <p>garantía de 2 años</p>
        </div>

        <div>
          <h3>Envío gratis</h3>
          <p>pedidos +$20,000</p>
        </div>

        <div>
          <h3>Soporte 24/7</h3>
          <p>Atención dedicada</p>
        </div>
      </section>
    </div>
  );
}
