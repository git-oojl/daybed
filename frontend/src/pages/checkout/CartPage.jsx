// CartPage.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import "../../assets/home-page.css";
import "../../assets/cart-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import { routePaths } from "../../routes/routePaths.js";
import { cartService, storeService } from "../../services/backendServices.js";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { productImage } from "../../services/viewMappers.js";
import LoadingState from "../../components/support/LoadingState.jsx";
import ErrorMessage from "../../components/support/ErrorMessage.jsx";

// ✅ Caché de imágenes GLOBAL
const imageCache = new Map();
const FALLBACK_CART_IMAGE = productImage({});

// ✅ Función para obtener imagen según el nombre
const getProductImage = (product) => {
  return productImage(product);
};

// ✅ Componente de imagen con caché
function CachedImage({ src, alt, className }) {
  const [imgSrc, setImgSrc] = useState(() => {
    if (imageCache.has(src)) return imageCache.get(src);
    if (!src || src === "" || src === "null" || src === "undefined") {
      return FALLBACK_CART_IMAGE;
    }
    return src;
  });
  const [isLoaded, setIsLoaded] = useState(imageCache.has(src));

  useEffect(() => {
    if (imageCache.has(src)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImgSrc(imageCache.get(src));
      setIsLoaded(true);
      return;
    }

    if (!src || src === "" || src === "null" || src === "undefined") {
      const fallback = FALLBACK_CART_IMAGE;
      imageCache.set(src, fallback);
      setImgSrc(fallback);
      setIsLoaded(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCache.set(src, src);
      setImgSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      const fallback = FALLBACK_CART_IMAGE;
      imageCache.set(src, fallback);
      setImgSrc(fallback);
      setIsLoaded(true);
    };
    img.src = src;
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt || "Producto"}
      className={className}
      loading="lazy"
      style={{
        opacity: isLoaded ? 1 : 0.5,
        transition: "opacity 0.2s ease-in-out",
        width: "80px",
        height: "80px",
        minWidth: "60px",
        minHeight: "60px",
        objectFit: "cover",
        background: "#f5f0eb",
        borderRadius: "8px",
        border: "1px solid #e8dccc"
      }}
      onError={(e) => {
        e.target.src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=80&fit=crop";
      }}
    />
  );
}

// Icono de basura
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
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useEffectiveSession();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [storeSettings, setStoreSettings] = useState(null);

  // ✅ Función para cargar el carrito
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.get();
      setCartItems(response.items || []);
    } catch (err) {
      console.error("Error al cargar carrito:", err);
      setError(err.message || "Error al cargar el carrito");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Cargar carrito solo cuando hay autenticación
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate(routePaths.account.login);
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCart();
      }
    }
  }, [isAuthenticated, authLoading, navigate, fetchCart]);

  useEffect(() => {
    let active = true;

    storeService
      .settings()
      .then((settings) => {
        if (active) setStoreSettings(settings);
      })
      .catch(() => {
        if (active) setStoreSettings(null);
      });

    return () => {
      active = false;
    };
  }, []);

  // ✅ Eliminar item SIN recargar toda la lista
  const removeFromCart = useCallback(async (itemId) => {
    try {
      setUpdating(true);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      await cartService.removeItem(itemId);
    } catch (err) {
      console.error("Error al eliminar item:", err);
      setError(err.message || "Error al eliminar item");
      await fetchCart();
    } finally {
      setUpdating(false);
    }
  }, [fetchCart]);

  // ✅ Actualizar cantidad SIN recargar toda la lista
  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    try {
      setUpdating(true);
      setCartItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));

      await cartService.updateItem(itemId, { quantity: newQuantity });
    } catch (err) {
      console.error("Error al actualizar cantidad:", err);
      setError(err.message || "Error al actualizar cantidad");
      await fetchCart();
    } finally {
      setUpdating(false);
    }
  }, [fetchCart, removeFromCart]);

  // ✅ Vaciar carrito
  const clearCart = useCallback(async () => {
    if (!window.confirm("¿Vaciar todo el carrito?")) return;

    try {
      setUpdating(true);
      setCartItems([]);
      await cartService.clear();
    } catch (err) {
      console.error("Error al vaciar carrito:", err);
      setError(err.message || "Error al vaciar carrito");
      await fetchCart();
    } finally {
      setUpdating(false);
    }
  }, [fetchCart]);

  // ✅ Calcular totales con useMemo
  const totals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) =>
        sum + Number(item.product?.price || item.price || 0) * (item.quantity || 0),
      0
    );
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const freeShippingThreshold = Number(
      storeSettings?.free_shipping_threshold || 0,
    );
    const qualifiesForFreeShipping =
      freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
    const shippingLabel = qualifiesForFreeShipping
      ? "Gratis"
      : "Se calcula en checkout";
    return { subtotal, totalItems, shippingLabel, total: subtotal };
  }, [cartItems, storeSettings]);

  const formatPrice = (price) => {
    return `$${price.toLocaleString("es-MX")} MX`;
  };

  // Estados de carga
  if (loading || authLoading) {
    return (
      <div className="home-page cart-page">
        <HomeHeader />
        <LoadingState message="Cargando tu carrito..." />
        <HomeFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page cart-page">
        <HomeHeader />
        <main className="cart-state cart-state--error">
          <ErrorMessage message={error} />
          <button type="button" onClick={fetchCart}>Intentar de nuevo</button>
        </main>
        <HomeFooter />
      </div>
    );
  }

  // ✅ Carrito vacío
  if (cartItems.length === 0) {
    return (
      <div className="home-page cart-page">
        <HomeHeader />
        <PageHero title="Carrito de compras" eyebrow="Tu selección" image="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1800&q=82" current="Carrito" />
        <main className="cart-empty">
          <div className="cart-empty__icon"><FaShoppingCart aria-hidden="true" /></div>
          <p className="cart-empty__eyebrow">Tu selección empieza aquí</p>
          <h2>El carrito está listo para una buena pieza</h2>
          <p>Explora la tienda, guarda tus favoritos y regresa cuando hayas encontrado lo que encaja en tu espacio.</p>
          <div className="cart-empty__actions">
            <Link to={routePaths.public.catalog}>Explorar la tienda</Link>
            <Link to={routePaths.public.savedItems}><FaHeart aria-hidden="true" /> Ver guardados</Link>
          </div>
        </main>
        <HomeFooter />
      </div>
    );
  }

  const { subtotal, totalItems, shippingLabel, total } = totals;

  // ✅ Render principal del carrito
  return (
    <div className="home-page cart-page">
      <HomeHeader />

      <PageHero title="Carrito de compras" eyebrow="Tu selección" image="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1800&q=82" current="Carrito" />

      <main className="cart-container">
        <div className="cart-table">
          <div className="cart-header">
            <span>Productos</span>
            <span>Precio</span>
            <span>Cantidad</span>
            <span>Subtotal</span>
            <span className="cart-header__action" aria-hidden="true" />
          </div>

          {cartItems.map((item) => {
            // ✅ Extraer datos del producto
            const product = item.product || item;
            const productName = product.name || item.name || "Producto";
            const productPrice = product.price || item.price || 0;
            const quantity = item.quantity || 0;

            // ✅ Obtener imagen usando la función getProductImage
            const imageUrl = getProductImage(product);

            return (
              <div className="cart-row" key={item.id}>
                <div className="product-info">
                  <CachedImage
                    src={imageUrl}
                    alt={productName}
                    className="cart-product-image"
                  />
                  <span>{productName}</span>
                </div>

                <div className="cart-row__price">
                  {formatPrice(productPrice)}
                </div>

                <div className="quantity-box">
                  <button
                    type="button"
                    aria-label="Disminuir cantidad"
                    onClick={() => updateQuantity(item.id, quantity - 1)}
                    disabled={updating}
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    aria-label="Aumentar cantidad"
                    onClick={() => updateQuantity(item.id, quantity + 1)}
                    disabled={updating}
                  >
                    +
                  </button>
                </div>

                <div className="cart-row__subtotal">
                  {formatPrice(productPrice * quantity)}
                </div>

                <button
                  type="button"
                  className="cart-row__remove"
                  aria-label={`Eliminar ${productName}`}
                  onClick={() => removeFromCart(item.id)}
                  disabled={updating}
                >
                  <IconTrash />
                </button>
              </div>
            );
          })}
        </div>

        <aside className="cart-summary">
          <h2 className="cart-summary__title">Total de compra</h2>

          <div className="cart-summary-row">
            <span>Subtotal ({totalItems} items)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Envío</span>
            <span>{shippingLabel}</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Total parcial</span>
            <span>{formatPrice(total)}</span>
          </div>

          <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
            <button
              onClick={clearCart}
              disabled={updating}
              style={{
                padding: "12px",
                background: "transparent",
                color: "#D32F2F",
                border: "2px solid #D32F2F",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#FDECEA";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
              }}
            >
              Vaciar carrito
            </button>

            <Link
              to={routePaths.checkout.summary}
              className="cart-pay-button"
              style={{
                display: "block",
                textAlign: "center",
                padding: "16px",
                background: "#8B5E3C",
                color: "#FFFFFF",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "1.1rem",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#6B4A2B";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#8B5E3C";
              }}
            >
              Proceder al pago
            </Link>
          </div>
        </aside>
      </main>

      <HomeFooter />
    </div>
  );
}
