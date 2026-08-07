import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCircleCheck, FaFilter, FaTriangleExclamation, FaXmark } from "react-icons/fa6";
import "../../assets/catalog-page.css";
import "../../assets/home-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { useEffectiveSearchParams } from "../../dev-preview/useEffectiveRouteState.js";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import StoreProductCard from "../../components/store/StoreProductCard.jsx";
import FeatureState from "../../components/support/FeatureState.jsx";
import { catalogService, cartService } from "../../services/backendServices.js";
import { getSavedProductIds, subscribeToSavedItems, toggleSavedProduct } from "../../services/savedItems.js";
import { readCollection } from "../../services/viewMappers.js";

const HERO_IMAGE = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1800&q=82";
const SORTS = {
  recommended: "-featured,featured_order,-average_review_rating,-created_at",
  newest: "-created_at",
  "price-asc": "price",
  "price-desc": "-price",
  rating: "-average_review_rating",
  name: "name",
};
const FILTER_LABELS = {
  "category__slug": "Colección",
  room: "Espacio",
  material: "Material",
  color: "Color",
  style: "Estilo",
  in_stock: "Disponibilidad",
  has_storage: "Con almacenamiento",
  is_sofa_bed: "Sofá cama",
  featured: "Destacados",
  min_rating: "Calificación",
  min_price: "Precio desde",
  max_price: "Precio hasta",
  search: "Búsqueda",
};

function unique(items, key) {
  return [...new Set(items.map((item) => item?.[key]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "es"));
}

export default function CatalogPage() {
  const { user } = useEffectiveSession();
  const viewer = getViewerIdForUser(user);
  const canUseCustomerFlows = !user || viewer === "customer";
  const [searchParams, setSearchParams] = useEffectiveSearchParams();
  const queryKey = searchParams.toString();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedIds, setSavedIds] = useState(() => getSavedProductIds());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => subscribeToSavedItems(setSavedIds), []);

  useEffect(() => {
    let active = true;
    Promise.all([catalogService.products({ page_size: 200 }), catalogService.categories({ page_size: 100 })])
      .then(([productResponse, categoryResponse]) => {
        if (!active) return;
        setAllProducts(readCollection(productResponse));
        setCategories(readCollection(categoryResponse));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = Object.fromEntries(searchParams.entries());
      const sort = params.sort || "recommended";
      delete params.sort;
      params.ordering = SORTS[sort] || SORTS.recommended;
      const response = await catalogService.products(params);
      setProducts(readCollection(response));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [queryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const optionSets = useMemo(() => ({
    rooms: unique(allProducts, "room"),
    materials: unique(allProducts, "material"),
    colors: unique(allProducts, "color"),
    styles: unique(allProducts, "style"),
  }), [allProducts]);

  const categoryMap = useMemo(() => Object.fromEntries(categories.map((category) => [category.slug, category.name])), [categories]);
  const activeFilters = useMemo(() => [...searchParams.entries()].filter(([key, value]) => value && key !== "sort"), [queryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value === "" || value == null || value === false) next.delete(key);
    else next.set(key, String(value));
    setSearchParams(next, { replace: true });
  }

  function clearFilters() {
    const next = new URLSearchParams();
    const sort = searchParams.get("sort");
    if (sort && sort !== "recommended") next.set("sort", sort);
    setSearchParams(next, { replace: true });
  }

  function chipLabel(key, value) {
    if (key === "category__slug") return `${FILTER_LABELS[key]}: ${categoryMap[value] || value}`;
    if (["in_stock", "has_storage", "is_sofa_bed", "featured"].includes(key)) return FILTER_LABELS[key];
    if (key === "min_rating") return `${value}+ estrellas`;
    if (key === "min_price" || key === "max_price") return `${FILTER_LABELS[key]}: $${Number(value).toLocaleString("es-MX")}`;
    return `${FILTER_LABELS[key] || key}: ${value}`;
  }

  function notify(type, message) {
    setNotification({ type, message });
    window.setTimeout(() => setNotification(null), 2800);
  }

  function toggleSaved(product) {
    const next = toggleSavedProduct(product.id);
    notify("success", next.includes(String(product.id)) ? `${product.name} guardado` : `${product.name} eliminado de guardados`);
  }

  async function addToCart(product) {
    if (Number(product.stock || 0) <= 0) return;
    try {
      await cartService.addItem({ product_id: product.id, quantity: 1 });
      window.dispatchEvent(new Event("daybed:cart-updated"));
      notify("success", `${product.name} agregado al carrito`);
    } catch (requestError) {
      notify("error", requestError.message || "No pudimos agregar el producto.");
    }
  }

  return (
    <div className="home-page catalog-page">
      <HomeHeader />
      {notification ? <div className={`catalog-notification catalog-notification--${notification.type}`} role="status">{notification.type === "error" ? <FaTriangleExclamation /> : <FaCircleCheck />}<span>{notification.message}</span></div> : null}
      <PageHero title="Tienda" image={HERO_IMAGE} eyebrow="Colección Daybed" />
      <main className="catalog-main">
        <div className="catalog-layout">
          <aside className="catalog-filters-sidebar" aria-label="Filtros del catálogo">
            <div className="catalog-filters-header"><div><p>Encuentra tu pieza</p><h2><FaFilter /> Filtros</h2></div><button type="button" onClick={clearFilters}>Limpiar</button></div>

            <div className="catalog-filters-section"><label className="catalog-filters-sort">Ordenar<select value={searchParams.get("sort") || "recommended"} onChange={(event) => setFilter("sort", event.target.value)}><option value="recommended">Recomendados</option><option value="newest">Más recientes</option><option value="rating">Mejor calificados</option><option value="price-asc">Precio: menor a mayor</option><option value="price-desc">Precio: mayor a menor</option><option value="name">Nombre</option></select></label></div>
            <div className="catalog-filters-section"><label>Colección<select value={searchParams.get("category__slug") || ""} onChange={(event) => setFilter("category__slug", event.target.value)}><option value="">Todas</option>{categories.filter((item) => item.active !== false).map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label><label>Espacio<select value={searchParams.get("room") || ""} onChange={(event) => setFilter("room", event.target.value)}><option value="">Todos</option>{optionSets.rooms.map((value) => <option key={value}>{value}</option>)}</select></label></div>
            <div className="catalog-filters-section"><label>Material<select value={searchParams.get("material") || ""} onChange={(event) => setFilter("material", event.target.value)}><option value="">Todos</option>{optionSets.materials.map((value) => <option key={value}>{value}</option>)}</select></label><label>Estilo<select value={searchParams.get("style") || ""} onChange={(event) => setFilter("style", event.target.value)}><option value="">Todos</option>{optionSets.styles.map((value) => <option key={value}>{value}</option>)}</select></label><label>Color<select value={searchParams.get("color") || ""} onChange={(event) => setFilter("color", event.target.value)}><option value="">Todos</option>{optionSets.colors.map((value) => <option key={value}>{value}</option>)}</select></label></div>
            <div className="catalog-filters-section catalog-filter-checks">
              <label><input type="checkbox" checked={searchParams.get("in_stock") === "true"} onChange={(event) => setFilter("in_stock", event.target.checked ? "true" : "")} />Solo disponibles</label>
              <label><input type="checkbox" checked={searchParams.get("is_sofa_bed") === "true"} onChange={(event) => setFilter("is_sofa_bed", event.target.checked ? "true" : "")} />Sofá cama</label>
              <label><input type="checkbox" checked={searchParams.get("has_storage") === "true"} onChange={(event) => setFilter("has_storage", event.target.checked ? "true" : "")} />Con almacenamiento</label>
              <label><input type="checkbox" checked={searchParams.get("featured") === "true"} onChange={(event) => setFilter("featured", event.target.checked ? "true" : "")} />Selección Daybed</label>
            </div>
            <div className="catalog-filters-section catalog-price-fields"><label>Precio mínimo<input type="number" min="0" step="100" value={searchParams.get("min_price") || ""} onChange={(event) => setFilter("min_price", event.target.value)} placeholder="0" /></label><label>Precio máximo<input type="number" min="0" step="100" value={searchParams.get("max_price") || ""} onChange={(event) => setFilter("max_price", event.target.value)} placeholder="Sin límite" /></label><label>Calificación<select value={searchParams.get("min_rating") || ""} onChange={(event) => setFilter("min_rating", event.target.value)}><option value="">Todas</option><option value="4">4+ estrellas</option><option value="4.5">4.5+ estrellas</option></select></label></div>
          </aside>

          <section className="catalog-content" aria-label="Productos">
            <div className="catalog-results-heading"><div><p className="catalog-results-heading__eyebrow">Colección disponible</p><h1>{loading ? "Buscando piezas" : `${products.length} ${products.length === 1 ? "producto" : "productos"}`}</h1></div></div>
            {activeFilters.length ? <div className="catalog-active-filters" aria-label="Filtros activos">{activeFilters.map(([key, value]) => <button type="button" key={`${key}-${value}`} onClick={() => setFilter(key, "")}>{chipLabel(key, value)} <FaXmark /></button>)}</div> : null}
            {loading ? <FeatureState tone="loading" compact title="Aplicando filtros" message="Estamos preparando una selección coherente con tus preferencias." /> : error ? <FeatureState tone="error" title="No pudimos abrir la colección" message={error.message} actionLabel="Intentar de nuevo" onAction={loadProducts} /> : products.length ? <div className="catalog-grid">{products.map((product) => <StoreProductCard key={product.id} product={product} saved={canUseCustomerFlows && savedIds.includes(String(product.id))} onToggleSaved={canUseCustomerFlows ? toggleSaved : undefined} onAddToCart={canUseCustomerFlows ? addToCart : undefined} />)}</div> : <FeatureState tone="empty" title="No hay piezas con esta combinación" message="Quita un filtro para ampliar la colección; tus demás preferencias permanecerán activas." actionLabel="Limpiar filtros" onAction={clearFilters} />}
          </section>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
