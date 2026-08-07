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
import { cartService } from "../../services/backendServices.js";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { productImage } from "../../services/viewMappers.js";
import LoadingState from "../../components/support/LoadingState.jsx";
import FeatureState from "../../components/support/FeatureState.jsx";
import useStoreSettings from "../../services/useStoreSettings.js";

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
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = FALLBACK_CART_IMAGE;
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
  const { settings: storeSettings } = useStoreSettings();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // ✅ Función para cargar el carrito
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.get();
      setCartItems(response.items || []);
    } catch (err) {
      console.error("Error al cargar carrito:", err);
      setError(err);
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



  // ✅ Eliminar item SIN recargar toda la lista
  const removeFromCart = useCallback(async (itemId) => {
    try {
      setUpdating(true);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      await cartService.removeItem(itemId);
      window.dispatchEvent(new Event("daybed:cart-updated"));
    } catch (err) {
      console.error("Error al eliminar item:", err);
      setError(err);
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
      window.dispatchEvent(new Event("daybed:cart-updated"));
    } catch (err) {
      console.error("Error al actualizar cantidad:", err);
      setError(err);
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
      window.dispatchEvent(new Event("daybed:cart-updated"));
    } catch (err) {
      console.error("Error al vaciar carrito:", err);
      setError(err);
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
    const shippingLabel = storeSettings?.show_cart_estimate === false
      ? "Se confirma al elegir dirección"
      : qualifiesForFreeShipping
        ? "Gratis"
        : "Se calcula en checkout";
    return { subtotal, totalItems, shippingLabel, total: subtotal };
  }, [cartItems, storeSettings]);

  const formatPrice = (price) => {
    return `$${Number(price || 0).toLocaleString("es-MX")} MXN`;
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
        <PageHero title="Carrito de compras" eyebrow="Tu selección" image="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1800&q=82" current="Carrito" />
        <main className="cart-state cart-state--error">
          <FeatureState tone="error" title="No pudimos abrir tu carrito" message={error.message || "Tu selección sigue guardada. Intenta cargarla nuevamente."} actionLabel="Intentar de nuevo" onAction={fetchCart} secondaryLabel="Volver a Tienda" secondaryTo={routePaths.public.catalog} />
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
  const unavailableItems = cartItems.filter((item) => Number((item.product || item).stock || 0) < Number(item.quantity || 0) || (item.product || item).active === false);

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
                  <span>{productName}{product.active === false ? <small className="cart-stock-warning">Producto no disponible</small> : Number(product.stock || 0) === 0 ? <small className="cart-stock-warning">Agotado</small> : Number(product.stock || 0) < quantity ? <small className="cart-stock-warning">Solo quedan {Number(product.stock || 0)} disponibles</small> : null}</span>
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
                    disabled={updating || quantity >= Number(product.stock || 0)}
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

          <div className="cart-summary__actions">
            <button className="cart-clear-button" type="button" onClick={clearCart} disabled={updating}>Vaciar carrito</button>
            {storeSettings?.storefront_available === false ? <div className="cart-summary__blocked"><strong>Las compras están pausadas</strong><span>Tu carrito se conserva. Vuelve cuando la tienda online esté disponible.</span></div> : unavailableItems.length ? <div className="cart-summary__blocked"><strong>Revisa la disponibilidad</strong><span>Ajusta o elimina las piezas agotadas antes de continuar.</span></div> : <Link to={routePaths.checkout.summary} className="cart-pay-button">Continuar al checkout</Link>}
          </div>
        </aside>
      </main>

      <HomeFooter />
    </div>
  );
}
