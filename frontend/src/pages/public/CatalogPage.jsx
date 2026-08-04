import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import "../../assets/catalog-page.css";
import "../../assets/home-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import StoreProductCard from "../../components/store/StoreProductCard.jsx";
import { catalogService, cartService } from "../../services/backendServices.js";
import {
  getSavedProductIds,
  subscribeToSavedItems,
  toggleSavedProduct,
} from "../../services/savedItems.js";
import { productCategoryName, readCollection } from "../../services/viewMappers.js";

const HERO_IMAGE = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1800&q=82";

function cleanCategory(value) {
  return String(value || "").replace(/Ã¡/g, "á").replace(/Ã©/g, "é").replace(/Ã­/g, "í").replace(/Ã³/g, "ó").replace(/Ãº/g, "ú").replace(/Ã±/g, "ñ").trim();
}

export default function CatalogPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [savedIds, setSavedIds] = useState(() => getSavedProductIds());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productResponse, categoryResponse] = await Promise.all([
        catalogService.products(),
        catalogService.categories().catch(() => []),
      ]);
      const nextProducts = readCollection(productResponse);
      const nextCategories = readCollection(categoryResponse);
      setProducts(nextProducts);
      setCategories(nextCategories);
      const maxPrice = Math.max(1000, ...nextProducts.map((item) => Number(item.price || 0)));
      setPriceRange({ min: 0, max: Math.ceil(maxPrice / 1000) * 1000 });
    } catch (requestError) {
      setError(requestError.message || "No fue posible cargar la colección.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCatalog(); }, [loadCatalog]);
  useEffect(() => subscribeToSavedItems(setSavedIds), []);

  const maxPrice = useMemo(() => Math.max(1000, ...products.map((item) => Number(item.price || 0))), [products]);
  const maxPriceRounded = Math.ceil(maxPrice / 1000) * 1000;
  const categoryNames = useMemo(() => {
    return [...new Set([
      ...categories.map((category) => cleanCategory(category.name)),
      ...products.map((product) => cleanCategory(productCategoryName(product))),
    ].filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  }, [categories, products]);

  const visibleProducts = useMemo(() => {
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const filtered = products.filter((product) => {
      const category = cleanCategory(productCategoryName(product));
      const price = Number(product.price || 0);
      const haystack = `${product.name || ""} ${product.description || ""} ${product.sku || ""} ${category}`.toLowerCase();
      return (!search || haystack.includes(search))
        && price >= priceRange.min
        && price <= priceRange.max
        && (!selectedCategories.length || selectedCategories.includes(category));
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === "price-asc") return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === "price-desc") return Number(b.price || 0) - Number(a.price || 0);
      if (sortBy === "name") return String(a.name || "").localeCompare(String(b.name || ""), "es");
      return 0;
    });
  }, [products, priceRange, searchParams, selectedCategories, sortBy]);

  const notify = (type, message) => {
    setNotification({ type, message });
    window.setTimeout(() => setNotification(null), 3000);
  };

  const toggleCategory = (category) => {
    setSelectedCategories((current) => current.includes(category)
      ? current.filter((item) => item !== category)
      : [...current, category]);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSortBy("default");
    setPriceRange({ min: 0, max: maxPriceRounded });
  };

  const handleToggleSaved = (product) => {
    const next = toggleSavedProduct(product.id);
    notify("success", next.includes(String(product.id)) ? `${product.name} guardado` : `${product.name} eliminado de guardados`);
  };

  const handleAddToCart = async (product) => {
    try {
      await cartService.addItem({ product_id: product.id, quantity: 1 });
      notify("success", `${product.name} agregado al carrito`);
    } catch (requestError) {
      notify("error", requestError.status === 401 ? "Inicia sesión para agregar productos" : requestError.message || "No pudimos agregar el producto");
    }
  };

  return (
    <div className="home-page catalog-page">
      <HomeHeader />
      {notification ? (
        <div className={`catalog-notification catalog-notification--${notification.type}`} role="status">
          {notification.type === "error" ? <FaExclamationTriangle /> : <FaCheckCircle />}
          <span>{notification.message}</span>
        </div>
      ) : null}
      <PageHero title="Tienda" image={HERO_IMAGE} eyebrow="Colección Daybed" />

      <main className="catalog-main">
        {loading ? (
          <section className="catalog-state" role="status"><span className="catalog-state__eyebrow">Tienda Daybed</span><h1>Preparando la colección</h1><p>Estamos organizando productos y disponibilidad.</p></section>
        ) : error ? (
          <section className="catalog-state catalog-state--error"><FaExclamationTriangle /><span className="catalog-state__eyebrow">No pudimos abrir la tienda</span><h1>La colección no está disponible</h1><p>{error}</p><button type="button" onClick={loadCatalog}>Intentar de nuevo</button></section>
        ) : (
          <div className="catalog-layout">
            <aside className="catalog-filters-sidebar" aria-label="Filtros del catálogo">
              <div className="catalog-filters-header"><div><p>Refina la colección</p><h2>Filtros</h2></div><button type="button" className="catalog-filters-clear" onClick={clearFilters}>Limpiar</button></div>

              <div className="catalog-filters-section">
                <label className="catalog-filters-sort" htmlFor="catalog-sort"><span>Ordenar por</span><select id="catalog-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="default">Recomendados</option><option value="price-asc">Precio: menor a mayor</option><option value="price-desc">Precio: mayor a menor</option><option value="name">Nombre</option></select></label>
              </div>

              <div className="catalog-filters-section">
                <h3>Precio</h3>
                <div className="catalog-filters-price-inputs"><span>${priceRange.min.toLocaleString("es-MX")}</span><span>${priceRange.max.toLocaleString("es-MX")}</span></div>
                <label className="catalog-range-label">Precio mínimo<input type="range" min="0" max={maxPriceRounded} step="100" value={priceRange.min} onChange={(event) => setPriceRange((current) => ({ ...current, min: Math.min(Number(event.target.value), current.max) }))} /></label>
                <label className="catalog-range-label">Precio máximo<input type="range" min="0" max={maxPriceRounded} step="100" value={priceRange.max} onChange={(event) => setPriceRange((current) => ({ ...current, max: Math.max(Number(event.target.value), current.min) }))} /></label>
              </div>

              <div className="catalog-filters-section">
                <h3>Categorías</h3>
                <div className="catalog-filters-categories">
                  {categoryNames.map((category) => <label className="catalog-filters-category" key={category}><input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggleCategory(category)} /><span>{category}</span></label>)}
                </div>
              </div>
            </aside>

            <section className="catalog-content" aria-label="Productos">
              <div className="catalog-results-heading"><div><p className="catalog-results-heading__eyebrow">Colección disponible</p><h2>{visibleProducts.length} {visibleProducts.length === 1 ? "producto" : "productos"}</h2></div>{(searchParams.get("search") || "").trim() ? <span>Resultados para “{searchParams.get("search").trim()}”</span> : <span>Piezas para sala, recámara, comedor y trabajo.</span>}</div>
              {visibleProducts.length ? (
                <div className="catalog-grid">
                  {visibleProducts.map((product) => <StoreProductCard key={product.id} product={product} saved={savedIds.includes(String(product.id))} onToggleSaved={handleToggleSaved} onAddToCart={handleAddToCart} />)}
                </div>
              ) : (
                <div className="catalog-empty"><span className="catalog-empty__eyebrow">Sin coincidencias</span><h2>Probemos con una selección más amplia</h2><p>No hay productos que coincidan con estos filtros.</p><button type="button" onClick={clearFilters}>Limpiar filtros</button></div>
              )}
            </section>
          </div>
        )}
      </main>
      <HomeFooter />
    </div>
  );
}
