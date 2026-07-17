// Importación de CSS
import "../../assets/catalog-page.css";
import "../../assets/home-page.css";
import { useState, useEffect } from "react";
import SyltherineDaybed from "../../assets/SyltherineDaybed.jpg";
import LeviosaDaybed from "../../assets/LeviosaDaybed.jpg";
import LolitoDaybed from "../../assets/LolitoDaybed.jpg";
import RespiraDaybed from "../../assets/RespiraDaybed.jpg";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { Link } from "react-router-dom";
import { routePaths } from "../../routes/routePaths.js";
import { useCart } from "../../context/CartContext.jsx";
import { catalogService } from "../../services/backendServices.js";

// ============================================================
// MAPEO POR SKU - TODOS los SKU del backend
// ============================================================
const productMap = {
  "DAY-SOFA-ROB-001": {
    name: "Syltherine",
    description: "Mesa de estilo café",
    category: "Mesas",
    badge: "-30%",
    badgeType: null,
    image: SyltherineDaybed,
  },
  "DAY-SOFA-LIN-002": {
    name: "Leviosa",
    description: "Silla de estilo café",
    category: "Sillas",
    badge: null,
    badgeType: null,
    image: LeviosaDaybed,
  },
  "DAY-MESA-FRE-001": {
    name: "Lolito",
    description: "Sofá grande",
    category: "Sofás",
    badge: "-50%",
    badgeType: null,
    image: LolitoDaybed,
  },
  "DAY-MESA-TER-002": {
    name: "Respira",
    description: "Set bar exterior",
    category: "Exterior",
    badge: "New",
    badgeType: "new",
    image: RespiraDaybed,
  },
  "DAY-SILLA-OLI-001": {
    name: "Leviosa",
    description: "Silla de estilo café",
    category: "Sillas",
    badge: null,
    badgeType: null,
    image: LeviosaDaybed,
  },
  "DAY-BANCO-NOG-001": {
    name: "Respira",
    description: "Set bar exterior",
    category: "Exterior",
    badge: null,
    badgeType: null,
    image: RespiraDaybed,
  },
};

function CatalogPage() {
  const [sortBy, setSortBy] = useState("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 13000 });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [notification, setNotification] = useState(null);
  const [backendProducts, setBackendProducts] = useState([]);
  const [maxPrice, setMaxPrice] = useState(13000);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  // Cargar productos del backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await catalogService.products();
        const data = response.results ?? response;
        setBackendProducts(data);
        
        if (data.length > 0) {
          const prices = data.map(p => parseFloat(p.price) || 0);
          const max = Math.max(...prices);
          const maxRounded = Math.ceil(max / 1000) * 1000;
          setMaxPrice(maxRounded);
          setPriceRange({ min: 0, max: maxRounded });
        }
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Crear lista de productos mapeados usando el SKU
  const baseProducts = backendProducts.map((backendProduct) => {
    const sku = backendProduct.sku;
    const mapped = productMap[sku];
    
    // Si el SKU existe en el mapa, usar los datos mapeados
    if (mapped) {
      return {
        id: backendProduct.id,
        sku: sku,
        name: mapped.name,
        description: mapped.description,
        category: mapped.category,
        badge: mapped.badge,
        badgeType: mapped.badgeType,
        price: parseFloat(backendProduct.price) || 0,
        image: mapped.image,
        _backendName: backendProduct.name,
      };
    }
    
    // Si el SKU no está en el mapa, usar los datos del backend
    return {
      id: backendProduct.id,
      sku: sku,
      name: backendProduct.name,
      description: backendProduct.description || "Sin descripción",
      category: backendProduct.category_detail?.name || "Sin categoría",
      badge: null,
      badgeType: null,
      price: parseFloat(backendProduct.price) || 0,
      image: RespiraDaybed,
      _backendName: backendProduct.name,
    };
  });

  // Generar 32 productos
  const allProducts = [];
  for (let i = 0; i < 32; i++) {
    if (baseProducts.length > 0) {
      const baseProduct = baseProducts[i % baseProducts.length];
      allProducts.push({
        ...baseProduct,
        id: i + 1,
      });
    }
  }

  // Si no hay productos del backend, usar los estáticos
  if (allProducts.length === 0) {
    const staticProducts = [
      { id: 1, name: "Syltherine", description: "Mesa de estilo café", price: 2500000, image: SyltherineDaybed, badge: "-30%", category: "Mesas" },
      { id: 2, name: "Leviosa", description: "Silla de estilo café", price: 2500000, image: LeviosaDaybed, category: "Sillas" },
      { id: 3, name: "Lolito", description: "Sofá grande", price: 7000000, image: LolitoDaybed, badge: "-50%", category: "Sofás" },
      { id: 4, name: "Respira", description: "Set bar exterior", price: 5000000, image: RespiraDaybed, badge: "New", badgeType: "new", category: "Exterior" },
    ];
    for (let i = 0; i < 32; i++) {
      const base = staticProducts[i % staticProducts.length];
      allProducts.push({ ...base, id: i + 1 });
    }
  }

  // Filtrar productos por precio y categoría
  const filteredProducts = allProducts.filter((product) => {
    const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
    const inPriceRange = price >= priceRange.min && price <= priceRange.max;

    if (selectedCategories.length === 0) {
      return inPriceRange;
    }

    return inPriceRange && selectedCategories.includes(product.category);
  });

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

  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen);
  };

  const handleClearFilters = () => {
    setPriceRange({ min: 0, max: maxPrice });
    setSelectedCategories([]);
    setSortBy("default");
    setFilterOpen(false);
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
    ...new Set(allProducts.map((product) => product.category).filter(Boolean)),
  ];

  // Estado de carga
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
        <div
          className="cart-notification"
          style={{
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
          }}
        >
          {notification}
        </div>
      )}

      {/* Hero Section - Full width */}
      <section
        className="catalog-hero"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80")',
        }}
      >
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
        {/* Toolbar */}
        <section className="catalog-toolbar">
          <div className="catalog-toolbar__start">
            <button
              type="button"
              className={`catalog-toolbar__button ${filterOpen ? "catalog-toolbar__button--active" : ""}`}
              onClick={handleFilterToggle}
            >
              <span className="catalog-toolbar__icon">≡</span>
              Filtrar
            </button>
            <button
              type="button"
              className="catalog-toolbar__button"
              onClick={handleClearFilters}
              title="Limpiar todos los filtros"
            >
              <span className="catalog-toolbar__icon">✕</span>
            </button>
          </div>

          <div className="catalog-toolbar__end">
            <div className="catalog-toolbar__label">Ordenar por</div>
            <select
              className="catalog-toolbar__select"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="default">Predeterminado</option>
              <option value="name">Nombre</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </section>

        {/* Panel de filtros */}
        {filterOpen && (
          <div className="catalog-filters">
            <div className="catalog-filters__content">
              <div className="catalog-filters__header">
                <h3>Filtros</h3>
              </div>

              <div className="catalog-filters__grid">
                <div className="catalog-filters__section">
                  <h4>Rango de Precio</h4>
                  <div className="catalog-filters__price-display">
                    <span>${(priceRange.min / 1000).toFixed(0)}k</span>
                    <span>${(priceRange.max / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="catalog-filters__price-range">
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step="100"
                      value={priceRange.min}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val <= priceRange.max) {
                          setPriceRange({ ...priceRange, min: val });
                        }
                      }}
                      className="catalog-filters__range-input catalog-filters__range-input--min"
                    />
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step="100"
                      value={priceRange.max}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= priceRange.min) {
                          setPriceRange({ ...priceRange, max: val });
                        }
                      }}
                      className="catalog-filters__range-input catalog-filters__range-input--max"
                    />
                  </div>
                </div>

                <div className="catalog-filters__section">
                  <h4>Categorías</h4>
                  <div className="catalog-filters__categories">
                    {categories.map((category) => (
                      <label
                        className="catalog-filters__category"
                        key={category}
                      >
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
              </div>
            </div>
          </div>
        )}

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
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                    >
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
      </main>

      <HomeFooter />
    </div>
  );
}

export default CatalogPage;