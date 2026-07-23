// Importación de CSS
import "../../assets/catalog-page.css";
import "../../assets/home-page.css";
import { useState } from "react";
import SyltherineDaybed from "../../assets/SyltherineDaybed.jpg";
import LeviosaDaybed from "../../assets/LeviosaDaybed.jpg";
import LolitoDaybed from "../../assets/LolitoDaybed.jpg";
import RespiraDaybed from "../../assets/RespiraDaybed.jpg";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { Link } from "react-router-dom";
import { routePaths } from "../../routes/routePaths.js";
import { useCart } from "../../context/CartContext.jsx";

function CatalogPage() {
  const [sortBy, setSortBy] = useState("default");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading] = useState(false);

  const { addToCart } = useCart();

  // ============================================================
  // PRODUCTOS - TODOS LOS PRECIOS EN MILES
  // ============================================================
  const allProducts = [
    { id: 1, name: "Syltherine", description: "Mesa de estilo café", price: 12499, image: SyltherineDaybed, badge: "-30%", category: "Mesas" },
    { id: 2, name: "Leviosa", description: "Silla de estilo café", price: 4599, image: LeviosaDaybed, category: "Sillas" },
    { id: 3, name: "Lolito", description: "Sofá grande", price: 3499, image: LolitoDaybed, badge: "-50%", category: "Sofás" },
    { id: 4, name: "Respira", description: "Set bar exterior", price: 5299, image: RespiraDaybed, badge: "New", badgeType: "new", category: "Decoración" },
    { id: 5, name: "Respira", description: "Set bar exterior", price: 2899, image: RespiraDaybed, category: "Decoración" },
    { id: 6, name: "Respira", description: "Set bar exterior", price: 5299, image: RespiraDaybed, category: "Decoración" },
    { id: 7, name: "Leviosa", description: "Silla de estilo café", price: 9799, image: LeviosaDaybed, category: "Sillas" },
    { id: 8, name: "Leviosa", description: "Silla de estilo café", price: 4599, image: LeviosaDaybed, category: "Sillas" },
    { id: 9, name: "Syltherine", description: "Mesa de estilo café", price: 12499, image: SyltherineDaybed, badge: "-30%", category: "Mesas" },
    { id: 10, name: "Lolito", description: "Sofá grande", price: 3499, image: LolitoDaybed, badge: "-50%", category: "Sofás" },
    { id: 11, name: "Respira", description: "Set bar exterior", price: 5299, image: RespiraDaybed, badge: "New", badgeType: "new", category: "Decoración" },
    { id: 12, name: "Leviosa", description: "Silla de estilo café", price: 9799, image: LeviosaDaybed, category: "Sillas" },
  ];

  // Generar 32 productos
  const generateProducts = () => {
    const products = [];
    for (let i = 0; i < 32; i++) {
      const base = allProducts[i % allProducts.length];
      products.push({ ...base, id: i + 1 });
    }
    return products;
  };

  const finalProducts = generateProducts();

  // ============================================================
  // CALCULAR EL PRECIO MÁXIMO DINÁMICAMENTE
  // ============================================================
  const maxProductPrice = Math.max(...finalProducts.map(p => 
    typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0
  ));
  
  // Redondear hacia arriba al millar más cercano para mejor UX
  const maxPriceRounded = Math.ceil(maxProductPrice / 1000) * 1000;

  const [priceRange, setPriceRange] = useState({ 
    min: 0, 
    max: maxPriceRounded 
  });

  // Filtrar productos por precio y categoría
  const filteredProducts = finalProducts.filter((product) => {
    const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
    const inPriceRange = price >= priceRange.min && price <= priceRange.max;

    if (selectedCategories.length === 0) {
      return inPriceRange;
    }

    return inPriceRange && selectedCategories.includes(product.category);
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

  const handleAddToCart = (product) => {
    addToCart(product);
    setNotification(`✅ ${product.name} agregado al carrito`);
    setTimeout(() => setNotification(null), 3000);
  };

  const categories = [
    ...new Set(finalProducts.map((product) => product.category).filter(Boolean)),
  ];

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

  return (
    <div className="home-page catalog-page">
      <HomeHeader />

      {notification && (
        <div className="cart-notification" style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          background: "#2f2a25",
          color: "white",
          padding: "1rem 1.5rem",
          borderRadius: "0.8rem",
          zIndex: 9999,
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          animation: "slideDown 0.3s ease",
          maxWidth: "350px",
        }}>
          {notification}
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

            {/* Categorías */}
            <div className="catalog-filters-section">
              <h4>Categorías</h4>
              <div className="catalog-filters-categories">
                {categories.map((category) => (
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
                sortedProducts.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div
                      className="product-card__image"
                      style={{ backgroundImage: `url(${product.image})` }}
                    >
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
                      <p>{product.description}</p>
                      <span className="product-card__price">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </article>
                ))
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