import "../../assets/home-page.css";
import "../../assets/cart-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { Link } from "react-router-dom";
import { routePaths } from "../../routes/routePaths.js";
import { useCart } from "../../context/CartContext.jsx";

function IconTrash() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity,
    getTotalPrice 
  } = useCart();

  const formatPrice = (price) => {
    return `$${price.toLocaleString("es-MX")} MX`;
  };

  const subtotal = getTotalPrice();
  const shipping = subtotal > 0 ? 500 : 0;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
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
        <main className="cart-container" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2>🛒 Tu carrito está vacío</h2>
          <p style={{ margin: "1rem 0 2rem", color: "#7b6f5d" }}>
            ¡Explora nuestros productos y encuentra lo que necesitas!
          </p>
          <Link 
            to={routePaths.public.home} 
            style={{
              display: "inline-block",
              padding: "0.85rem 2rem",
              background: "#2f2a25",
              color: "white",
              borderRadius: "0.8rem",
              textDecoration: "none",
              fontWeight: "700"
            }}
          >
            Ir a la tienda
          </Link>
        </main>
        <HomeFooter />
      </div>
    );
  }

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

          {cartItems.map((product) => (
            <div className="cart-row" key={product.id}>
              <div className="product-info">
                <img src={product.image} alt={product.name} />
                <span>{product.name}</span>
              </div>

              <div className="cart-row__price">
                {formatPrice(product.price)}
              </div>

              <div className="quantity-box">
                <button 
                  type="button" 
                  aria-label="Disminuir cantidad"
                  onClick={() => updateQuantity(product.id, product.quantity - 1)}
                >
                  -
                </button>
                <span>{product.quantity}</span>
                <button 
                  type="button" 
                  aria-label="Aumentar cantidad"
                  onClick={() => updateQuantity(product.id, product.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div className="cart-row__subtotal">
                {formatPrice(product.price * product.quantity)}
              </div>

              <button
                type="button"
                className="cart-row__remove"
                aria-label={`Eliminar ${product.name}`}
                onClick={() => removeFromCart(product.id)}
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
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Envío</span>
            <span>{shipping > 0 ? formatPrice(shipping) : "Gratis"}</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
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