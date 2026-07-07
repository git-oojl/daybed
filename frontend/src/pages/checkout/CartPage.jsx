import "../../assets/home-page.css";
import "../../assets/cart-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { Link } from "react-router-dom";
import { routePaths } from "../../routes/routePaths.js";

function IconTrash() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M9 7V5h6v2M10 11v6M14 11v6M6 7l1 12h10l1-12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CartPage() {
  const products = [
    {
      id: 1,
      name: "Sofa Esquinero",
      price: 8999,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400",
    },
    {
      id: 2,
      name: "Mesa de Centro",
      price: 2499,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400",
    },
  ];

  const subtotal = 13997;
  const shipping = 500;
  const total = subtotal + shipping;

  return (
    <div className="home-page cart-page">
      <HomeHeader />

      <section className="checkout-hero" aria-label="Carrito de compras">
        <div className="checkout-hero__overlay">
          <h1 className="checkout-hero__title">Carrito de compras</h1>
          <p className="checkout-hero__breadcrumb">
            <Link to={routePaths.public.home}>Inicio</Link>
            <span aria-hidden="true">&gt;</span>
            Carrito
          </p>
        </div>
      </section>

      <main className="cart-container">
        <div className="cart-table">
          <div className="cart-header">
            <span>Productos</span>
            <span>Precio</span>
            <span>Cantidad</span>
            <span>Subtotal</span>
            <span className="cart-header__action" aria-hidden="true" />
          </div>

          {products.map((product) => (
            <div className="cart-row" key={product.id}>
              <div className="product-info">
                <img src={product.image} alt={product.name} />
                <span>{product.name}</span>
              </div>

              <div className="cart-row__price">
                ${product.price.toLocaleString("es-MX")} MX
              </div>

              <div className="quantity-box">
                <button type="button" aria-label="Disminuir cantidad">
                  -
                </button>
                <span>{product.quantity}</span>
                <button type="button" aria-label="Aumentar cantidad">
                  +
                </button>
              </div>

              <div className="cart-row__subtotal">
                ${(product.price * product.quantity).toLocaleString("es-MX")}.00 MX
              </div>

              <button
                type="button"
                className="cart-row__remove"
                aria-label={`Eliminar ${product.name}`}
              >
                <IconTrash />
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h2 className="cart-summary__title">Total de compra</h2>

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString("es-MX")} MX</span>
          </div>
          <div className="cart-summary-row">
            <span>Envío</span>
            <span>${shipping.toLocaleString("es-MX")} MX</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Total</span>
            <span>${total.toLocaleString("es-MX")} MX</span>
          </div>

          <Link to={routePaths.checkout.summary} className="cart-pay-button">
            PAGAR
          </Link>
        </aside>
      </main>

      <HomeFooter />
    </div>
  );
}
