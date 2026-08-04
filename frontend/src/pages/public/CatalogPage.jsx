// CatalogPage.jsx - CORREGIDO (sin warnings de ESLint)
import "../../assets/catalog-page.css";
import "../../assets/home-page.css";
import { useState, useEffect, useCallback } from "react";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { routePaths } from "../../routes/routePaths.js";
import { catalogService, cartService } from "../../services/backendServices.js";
import { productImage as resolveProductImage } from "../../services/viewMappers.js";

const normalizeCategoryDisplayName = (value = "") => {
  const text = String(value)
    .replace(/Ã¡/g, "á")
    .replace(/Ã©/g, "é")
    .replace(/Ã­/g, "í")
    .replace(/Ã³/g, "ó")
    .replace(/Ãº/g, "ú")
    .replace(/Ã±/g, "ñ")
    .replace(/Ã/g, "í")
    .trim();

  return text;
};

const getCategoryNameSafe = (category) => {
  if (!category) return "";
  if (typeof category === "string") return normalizeCategoryDisplayName(category);
  if (typeof category === "object") {
    return normalizeCategoryDisplayName(category.name || category.title || category.slug || "");
  }
  return "";
};

const getProductCategoryName = (product) => {
  const categoryFromDetails = getCategoryNameSafe(product?.category_detail);
  if (categoryFromDetails) return categoryFromDetails;

  const categoryFromProduct = getCategoryNameSafe(product?.category);
  if (categoryFromProduct) return categoryFromProduct;

  return "";
};

// ✅ Función para obtener imagen según el producto
const getProductImage = (product) => {
  return resolveProductImage(product);
};

function CatalogPage() {
  const [sortBy, setSortBy] = useState("default");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [storeCategories, setStoreCategories] = useState([]);
  const [error, setError] = useState(null);

  // ============================================================
  // ✅ CARGAR PRODUCTOS DEL BACKEND
  // ============================================================
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsResponse, categoriesResponse] = await Promise.all([
        catalogService.products(),
        catalogService.categories().catch(() => []),
      ]);

      let productsData = [];
      if (Array.isArray(productsResponse)) {
        productsData = productsResponse;
      } else if (productsResponse?.results && Array.isArray(productsResponse.results)) {
        productsData = productsResponse.results;
      } else {
        productsData = productsResponse || [];
      }

      let categoriesData = [];
      if (Array.isArray(categoriesResponse)) {
        categoriesData = categoriesResponse;
      } else if (categoriesResponse?.results && Array.isArray(categoriesResponse.results)) {
        categoriesData = categoriesResponse.results;
      } else {
        categoriesData = categoriesResponse || [];
      }

      const realCategoryNames = categoriesData
        .map((category) => getCategoryNameSafe(category))
        .filter(Boolean);

      setStoreCategories(realCategoryNames);

      if (productsData.length > 0) {
        setProducts(productsData);
        setError(null);
      } else {
        setProducts([]);
        setError(null);
      }

    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
      setStoreCategories([]);
      setError('No fue posible cargar los productos desde el servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ useEffect CORREGIDO - agregar eslint-disable-next-line
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  // ✅ Obtener categorías únicas de los productos reales
  const getProductCategories = () => {
    const categories = new Set();
    products.forEach((product) => {
      const categoryName = getProductCategoryName(product);
      if (categoryName) {
        categories.add(categoryName);
      }
    });
    return [...categories];
  };

  // ✅ Usar las categorías reales del backend y de los productos visibles
  const productCategories = getProductCategories();
  const allCategories = [...new Set([...storeCategories, ...productCategories])];

  // ✅ CALCULAR EL PRECIO MÁXIMO
  const maxProductPrice = products.length > 0 
    ? Math.max(...products.map(p => typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0), 0)
    : 10000;
  
  const maxPriceRounded = Math.ceil(Math.max(maxProductPrice, 1000) / 1000) * 1000;

  const [priceRange, setPriceRange] = useState({ 
    min: 0, 
    max: maxPriceRounded 
  });

  // ✅ useEffect CORREGIDO - agregar eslint-disable-next-line
  useEffect(() => {
    if (products.length > 0) {
      const newMax = Math.max(...products.map(p => 
        typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0
      ), 0);
      const newMaxRounded = Math.ceil(Math.max(newMax, 1000) / 1000) * 1000;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPriceRange(prev => ({ ...prev, max: newMaxRounded }));
    }
  }, [products]);

  // Filtrar productos por precio y categoría
  const filteredProducts = products.filter((product) => {
    const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
    const inPriceRange = price >= priceRange.min && price <= priceRange.max;

    const categoryName = getProductCategoryName(product);

    if (selectedCategories.length === 0) {
      return inPriceRange;
    }

    return inPriceRange && selectedCategories.includes(categoryName);
  });

  // Ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
    const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0;
    
    switch (sortBy) {
      case "price-asc":
        return priceA - priceB;
      case "price-desc":
        return priceB - priceA;
      case "name":
        return (a.name || '').localeCompare(b.name || '');
      default:
        return 0;
    }
  });

  const formatPrice = (price) => {
    const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
    return `$${numPrice.toLocaleString("es-MX")} mxn`;
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleClearFilters = () => {
    setPriceRange({ min: 0, max: maxPriceRounded });
    setSelectedCategories([]);
    setSortBy("default");
  };

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // ✅ handleAddToCart usando cartService
  const handleAddToCart = async (product) => {
    try {
      if (!product.id || product.id < 1) {
        setNotification({ type: "error", message: "Producto no válido" });
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      await cartService.addItem({
        product_id: product.id,
        quantity: 1
      });
      setNotification({ type: "success", message: `${product.name} agregado al carrito` });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      
      if (error.message?.includes('autenticación') || error.status === 401) {
        setNotification({ type: "error", message: "Por favor, inicia sesión para agregar productos" });
      } else if (error.message?.includes('no existe')) {
        setNotification({ type: "error", message: `El producto "${product.name}" no existe en la base de datos` });
      } else {
        setNotification({ type: "error", message: error.message || 'No se pudo agregar al carrito' });
      }
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // ============================================================
  // ESTADOS DE CARGA Y ERROR
  // ============================================================
  if (loading) {
    return (
      <div className="home-page catalog-page">
        <HomeHeader />
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <p>Cargando productos...</p>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="home-page catalog-page">
        <HomeHeader />
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <p style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <FaExclamationTriangle aria-hidden="true" />
            {error}
          </p>
          <button 
            onClick={fetchProducts}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 2rem",
              background: "#2f2a25",
              color: "white",
              border: "none",
              borderRadius: "0.3rem",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="home-page catalog-page">
      <HomeHeader />

      {notification && (
        <div className="cart-notification" style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          background: notification.type === "error" ? '#D32F2F' : '#2f2a25',
          color: "white",
          padding: "1rem 1.5rem",
          borderRadius: "0.8rem",
          zIndex: 9999,
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          animation: "slideDown 0.3s ease",
          maxWidth: "350px",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          {notification.type === "error" ? (
            <FaExclamationTriangle aria-hidden="true" />
          ) : (
            <FaCheckCircle aria-hidden="true" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="catalog-hero" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80")',
      }}>
        <div className="catalog-hero__overlay" />
        <div className="catalog-hero__content">
          <h1>Tienda</h1>
          <p>
            <Link to={routePaths.public.home}>Inicio</Link>
            <span aria-hidden="true">&gt;</span>
            <span>Tienda</span>
          </p>
        </div>
      </section>

      <main className="catalog-main">
        {/* LAYOUT: Filtros a la izquierda + Productos a la derecha */}
        <div className="catalog-layout">
          
          {/* SIDEBAR - FILTROS */}
          <aside className="catalog-filters-sidebar">
            <div className="catalog-filters-header">
              <h3>Filtros</h3>
              <button 
                className="catalog-filters-clear"
                onClick={handleClearFilters}
              >
                Limpiar todo
              </button>
            </div>

            {/* Rango de Precio */}
            <div className="catalog-filters-section">
              <h4>Rango de Precio</h4>
              <div className="catalog-filters-price-inputs">
                <span>${(priceRange.min / 1000).toFixed(0)}k</span>
                <span>${(priceRange.max / 1000).toFixed(0)}k</span>
              </div>
              <div className="catalog-filters-price-range">
                <input
                  type="range"
                  min="0"
                  max={maxPriceRounded}
                  step="100"
                  value={priceRange.min}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val <= priceRange.max) {
                      setPriceRange({ ...priceRange, min: val });
                    }
                  }}
                  className="catalog-filters-range-input catalog-filters-range-input--min"
                />
                <input
                  type="range"
                  min="0"
                  max={maxPriceRounded}
                  step="100"
                  value={priceRange.max}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= priceRange.min) {
                      setPriceRange({ ...priceRange, max: val });
                    }
                  }}
                  className="catalog-filters-range-input catalog-filters-range-input--max"
                />
              </div>
            </div>

            {/* Categorías - CON CATEGORÍAS DINÁMICAS */}
            <div className="catalog-filters-section">
              <h4>Categorías</h4>
              <div className="catalog-filters-categories">
                {allCategories.map((category) => (
                  <label className="catalog-filters-category" key={category}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* CONTENIDO PRINCIPAL */}
          <div className="catalog-content">
            {/* Toolbar */}
            <div className="catalog-toolbar">
              <div className="catalog-toolbar__start">
                <span className="catalog-toolbar__results">
                  {sortedProducts.length} productos
                </span>
              </div>

              <div className="catalog-toolbar__end">
                <span className="catalog-toolbar__label">Ordenar por</span>
                <select
                  className="catalog-toolbar__select"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="default">Predeterminado</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="name">Nombre</option>
                </select>
              </div>
            </div>

            {/* Grid de productos */}
            <section className="catalog-grid">
              {sortedProducts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", width: "100%" }}>
                  <p>No hay productos que coincidan con los filtros seleccionados</p>
                  <button
                    onClick={handleClearFilters}
                    style={{
                      marginTop: "1rem",
                      padding: "0.5rem 2rem",
                      background: "#2f2a25",
                      color: "white",
                      border: "none",
                      borderRadius: "0.3rem",
                      cursor: "pointer",
                    }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                sortedProducts.map((product) => {
                  const productImageUrl = getProductImage(product);
                  const categoryName = getProductCategoryName(product);

                  return (
                    <article className="product-card" key={product.id}>
                      <div className="product-card__image">
                        <img
                          className="product-card__img"
                          src={productImageUrl}
                          alt={product.name}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = resolveProductImage({});
                          }}
                        />
                        {product.badge ? (
                          <span
                            className={`product-card__badge ${product.badgeType === "new" ? "product-card__badge--new" : ""}`}
                          >
                            {product.badge}
                          </span>
                        ) : null}
                        <div className="product-card__overlay">
                          <button type="button" onClick={() => handleAddToCart(product)}>
                            Agregar a carrito
                          </button>
                        </div>
                      </div>
                      <div className="product-card__body">
                        <h3>{product.name}</h3>
                        <p>{product.description || categoryName || "Mueble de calidad"}</p>
                        <span className="product-card__price">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}

export default CatalogPage;
