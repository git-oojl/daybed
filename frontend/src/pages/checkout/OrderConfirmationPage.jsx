import { Link } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/cart-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";

const OrderConfirmationPage = () => {
  const orderData = {
    id: "#DAY-001",
    estimatedDate: "30 de junio, 2026",
    subtotal: "$13,997 MX",
    shipping: "$500 MX",
    total: "$14,497 MX",
  };

  return (
    <div className="home-page order-page">
      <HomeHeader />

      <section
        className="checkout-hero checkout-hero--order"
        aria-label="Confirmación de pedido"
      >
        <div className="checkout-hero__overlay">
          <h1 className="checkout-hero__title">Confirmación de Pedido</h1>
          <p className="checkout-hero__breadcrumb">
            <Link to={routePaths.public.home}>Inicio</Link>
            <span aria-hidden="true">&gt;</span>
            Dashboard
            <span aria-hidden="true">&gt;</span>
            Checkout
            <span aria-hidden="true">&gt;</span>
            Confirmación de pedido
          </p>
        </div>
      </section>

      <main className="order-container">
        <h2 className="order-success-title">¡PEDIDO CON EXITO!</h2>

        <div className="order-grid">
          <div className="order-grid__side">
            <article className="order-card">
              <header className="order-card__header">Numero de pedido</header>
              <div className="order-card__body">
                <p className="order-card__value">{orderData.id}</p>
              </div>
            </article>

            <article className="order-card">
              <header className="order-card__header">
                Fecha estimada de entrega
              </header>
              <div className="order-card__body">
                <p>{orderData.estimatedDate}</p>
              </div>
            </article>
          </div>

          <article className="order-card order-card--summary">
            <header className="order-card__header">Resumen de pedido</header>
            <div className="order-card__body">
              <div className="order-item">
                <span>Sofa esquinero</span>
                <span>1</span>
                <span>$8,999 MX</span>
              </div>
              <div className="order-item">
                <span>Mesa de Centro</span>
                <span>2</span>
                <span>$4,998 MX</span>
              </div>

              <div className="order-totals">
                <div className="order-totals__row">
                  <span>Subtotal</span>
                  <span>{orderData.subtotal}</span>
                </div>
                <div className="order-totals__row">
                  <span>Envio</span>
                  <span>{orderData.shipping}</span>
                </div>
                <div className="order-totals__row order-totals__row--total">
                  <span>Total</span>
                  <span>{orderData.total}</span>
                </div>
              </div>
            </div>
          </article>

          <div className="order-grid__side">
            <article className="order-card">
              <header className="order-card__header">Metodo de pago</header>
              <div className="order-card__body">
                <p>Tarjeta de crédito</p>
              </div>
            </article>

            <article className="order-card">
              <header className="order-card__header">Dirección de envío</header>
              <div className="order-card__body">
                <p>Calle 123, Colonia Centro, CP 12345</p>
              </div>
            </article>
          </div>
        </div>

        <div className="order-actions">
          <Link to={routePaths.account.orders} className="order-btn">
            Ver mis pedidos
          </Link>
          <Link to={routePaths.public.catalog} className="order-btn">
            Seguir comprando
          </Link>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
};

export default OrderConfirmationPage;
