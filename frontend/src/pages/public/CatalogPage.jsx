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

const products = [
  {
    id: 1,
    name: "Syltherine",
    description: "Mesa de estilo café",
    price: 2500000,
    image: SyltherineDaybed,
    badge: "-30%",
    category: "Mesas",
  },
  {
    id: 2,
    name: "Leviosa",
    description: "Silla de estilo café",
    price: 2500000,
    image: LeviosaDaybed,
    category: "Sillas",
  },
  {
    id: 3,
    name: "Lolito",
    description: "Sofá grande",
    price: 7000000,
    image: LolitoDaybed,
    badge: "-50%",
    category: "Sofás",
  },
  {
    id: 4,
    name: "Respira",
    description: "Set bar exterior",
    price: 5000000,
    image: RespiraDaybed,
    badge: "New",
    badgeType: "new",
    category: "Exterior",
  },
];

function CatalogPage() {
  const [sortBy, setSortBy] = useState("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [notification, setNotification] = useState(null);

  const { addToCart } = useCart();

  const allProducts = Array.from({ length: 32 }, (_, index) => ({
    ...products[index % products.length],
    id: index + 1,
  }));

  const filteredProducts = allProducts.filter((product) => {
    const price = product.price;
    const inPriceRange = price >= priceRange.min && price <= priceRange.max;

    if (selectedCategories.length === 0) {
      return inPriceRange;
    }

    return inPriceRange && selectedCategories.includes(product.category);
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const formatPrice = (price) => {
    return `$${price.toLocaleString("es-MX")} mxn`;
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen);
  };

  const handleClearFilters = () => {
    setPriceRange({ min: 0, max: 10000000 });
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
    ...new Set(allProducts.map((product) => product.category)),
  ];

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
                      max="10000000"
                      step="100000"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          min: parseInt(e.target.value),
                        })
                      }
                      className="catalog-filters__range-input catalog-filters__range-input--min"
                    />
                    <input
                      type="range"
                      min="0"
                      max="10000000"
                      step="100000"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          max: parseInt(e.target.value),
                        })
                      }
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
          {sortedProducts.map((product) => (
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
          ))}
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}

export default CatalogPage;
