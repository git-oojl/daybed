import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/cart-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import { cartService } from "../../services/backendServices.js";
import { useAuthStore } from "../../auth/authStore.js";
import LoadingState from "../../components/support/LoadingState.jsx";
import ErrorMessage from "../../components/support/ErrorMessage.jsx";
import EmptyState from "../../components/support/EmptyState.jsx";

// ✅ Caché de imágenes GLOBAL
const imageCache = new Map();

// ============================================================
// ✅ MAPA DE IMÁGENES POR NOMBRE DE PRODUCTO (para el carrito)
// ============================================================
const productImages = {
  "Sofá Cama Lino Arena": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=80&fit=crop",
  "Sofá Cama Lino": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=80&fit=crop",
  "Mesa Centro Fresno": "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=80&h=80&fit=crop",
  "Mesa Redonda Terra": "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=80&h=80&fit=crop",
  "Silla Lectura Olivo": "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop",
  "Silla Lectura": "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop",
  "Mesa de Noche": "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=80&h=80&fit=crop",
  "Escritorio Ejecutivo": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=80&h=80&fit=crop",
  "Sillón Relax": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=80&h=80&fit=crop",
  "Lámpara de Pie": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=80&h=80&fit=crop",
  "Sofá Esquinero": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=80&h=80&fit=crop",
};

// ✅ Función para obtener imagen según el nombre
const getProductImage = (product) => {
  // Si el producto ya tiene imagen, usarla
  if (product.image) return product.image;
  if (product.images?.length > 0) return product.images[0];
  
  const name = product.name || "";
  // Buscar coincidencia exacta o parcial
  for (const [key, value] of Object.entries(productImages)) {
    if (name.includes(key) || key.includes(name)) {
      return value;
    }
  }
  
  // Si no coincide, usar imagen por categoría
  const category = product.category?.name || product.category || "";
  if (category.includes("Sofá") || category.includes("Sillón")) {
    return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=80&fit=crop";
  }
  if (category.includes("Mesa")) {
    return "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=80&h=80&fit=crop";
  }
  if (category.includes("Silla")) {
    return "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop";
  }
  
  return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=80&fit=crop";
};

// ✅ Componente de imagen con caché
function CachedImage({ src, alt, className }) {
  const [imgSrc, setImgSrc] = useState(() => {
    if (imageCache.has(src)) return imageCache.get(src);
    if (!src || src === "" || src === "null" || src === "undefined") {
      return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=80&fit=crop";
    }
    return src;
  });
  const [isLoaded, setIsLoaded] = useState(imageCache.has(src));

  useEffect(() => {
    if (imageCache.has(src)) {
      setImgSrc(imageCache.get(src));
      setIsLoaded(true);
      return;
    }

    if (!src || src === "" || src === "null" || src === "undefined") {
      const fallback = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=80&fit=crop";
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
      const fallback = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=80&fit=crop";
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
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

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
        fetchCart();
      }
    }
  }, [isAuthenticated, authLoading, navigate, fetchCart]);

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
  }, [fetchCart]);

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
      (sum, item) => sum + (item.product?.price || item.price || 0) * (item.quantity || 0),
      0
    );
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const shipping = subtotal > 0 ? 500 : 0;
    return { subtotal, totalItems, shipping, total: subtotal + shipping };
  }, [cartItems]);

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
        <ErrorMessage message={error} />
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={fetchCart} className="btn-primary">
            Reintentar
          </button>
        </div>
        <HomeFooter />
      </div>
    );
  }

  // ✅ Carrito vacío
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
          <EmptyState message="Tu carrito está vacío" />
          <p style={{ margin: "1rem 0 2rem", color: "#7b6f5d" }}>
            ¡Explora nuestros productos y encuentra lo que necesitas!
          </p>
          <Link
            to={routePaths.public.catalog}
            style={{
              display: "inline-block",
              padding: "0.85rem 2rem",
              background: "#8B5E3C",
              color: "white",
              borderRadius: "0.8rem",
              textDecoration: "none",
              fontWeight: "700",
            }}
          >
            Ir a la tienda
          </Link>
        </main>
        <HomeFooter />
      </div>
    );
  }

  const { subtotal, totalItems, shipping, total } = totals;

  // ✅ Render principal del carrito
  return (
    <div className="home-page cart-page">
      <HomeHeader />

      <section className="checkout-hero" aria-label="Carrito de compras">
        <div className="checkout-hero__overlay">
          <h1 className="checkout-hero__title">
            Carrito de compras ({totalItems} items)
          </h1>
          <p className="checkout-hero__breadcrumb">
            <Link to={routePaths.public.home}>Inicio</Link>
            <span aria-hidden="true">&gt;</span>
            <Link to={routePaths.public.catalog}>Catálogo</Link>
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
            <span>{shipping > 0 ? formatPrice(shipping) : "Gratis"}</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Total</span>
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