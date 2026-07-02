import "./../../assets/cart-page.css";

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
    <div className="cart-page">
      {/* HERO */}

      <section className="cart-hero">
        <div className="cart-hero-overlay">
          <h1>Carrito de compras</h1>

          <p>
            Inicio <span>&gt;</span> Carrito
          </p>
        </div>
      </section>

      {/* CONTENT */}

      <section className="cart-container">
        <div className="cart-table">
          <div className="cart-header">
            <span>Productos</span>
            <span>Precio</span>
            <span>Cantidad</span>
            <span>Subtotal</span>
          </div>

          {products.map((product) => (
            <div className="cart-row" key={product.id}>
              <div className="product-info">
                <img src={product.image} alt={product.name} />

                <span>{product.name}</span>
              </div>

              <div>${product.price.toLocaleString()} MX</div>

              <div className="quantity-box">
                <button>-</button>

                <span>{product.quantity}</span>

                <button>+</button>
              </div>

              <div>
                ${(product.price * product.quantity).toLocaleString()}
                .00 MX
              </div>
            </div>
          ))}
        </div>

        {/* SUMMARY */}

        <aside className="summary-card">
          <h2>Total de compra</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString()} MX</span>
          </div>

          <div className="summary-row">
            <span>Envío</span>
            <span>${shipping.toLocaleString()} MX</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toLocaleString()} MX</span>
          </div>

          <button className="pay-button">PAGAR</button>
        </aside>
      </section>

      {/* FEATURES */}

      <section className="cart-features">
        <div>
          <h3>CALIDAD SUPERIOR</h3>
          <p>Fabricado con materiales premium</p>
        </div>

        <div>
          <h3>Protección de garantía</h3>
          <p>Garantía de 2 años</p>
        </div>

        <div>
          <h3>Envío gratis</h3>
          <p>Pedidos superiores a $20,000</p>
        </div>

        <div>
          <h3>Soporte 24/7</h3>
          <p>Atención dedicada</p>
        </div>
      </section>
    </div>
  );
}
