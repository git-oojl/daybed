import { useEffect, useMemo, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import "../../assets/home-page.css";
import "../../assets/catalog-page.css";
import "../../assets/saved-items-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import StoreProductCard from "../../components/store/StoreProductCard.jsx";
import FeatureState from "../../components/support/FeatureState.jsx";
import { routePaths } from "../../routes/routePaths.js";
import { cartService, catalogService } from "../../services/backendServices.js";
import { getSavedProductIds, setSavedProductIds, subscribeToSavedItems } from "../../services/savedItems.js";
import { readCollection } from "../../services/viewMappers.js";

export default function SavedItemsPage() {
  const [savedIds, setSavedIds] = useState(() => getSavedProductIds());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => subscribeToSavedItems(setSavedIds), []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    if (!savedIds.length) {
      setProducts([]);
      setLoading(false);
      return () => { active = false; };
    }

    catalogService.products({
      ids: savedIds.join(","),
      page_size: Math.max(20, savedIds.length),
      ordering: "name",
    }).then((response) => {
      if (!active) return;
      const byId = new Map(readCollection(response).map((product) => [String(product.id), product]));
      setProducts(savedIds.map((id) => byId.get(String(id))).filter(Boolean));
    }).catch((requestError) => { if (active) setError(requestError); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [savedIds]);

  const savedProducts = useMemo(() => {
    const ids = new Set(savedIds.map(String));
    return products.filter((product) => ids.has(String(product.id)));
  }, [products, savedIds]);

  function toggleSaved(product) {
    setSavedProductIds(savedIds.filter((id) => id !== String(product.id)));
    setProducts((current) => current.filter((item) => String(item.id) !== String(product.id)));
  }

  async function addToCart(product) {
    if (Number(product.stock || 0) <= 0) return;
    try {
      await cartService.addItem({ product_id: product.id, quantity: 1 });
      window.dispatchEvent(new Event("daybed:cart-updated"));
      setMessage(`${product.name} agregado al carrito.`);
    } catch (requestError) {
      setMessage(requestError.message || "No se pudo agregar al carrito.");
    }
    window.setTimeout(() => setMessage(""), 3000);
  }

  return <div className="home-page saved-page"><HomeHeader /><PageHero title="Guardados" eyebrow="Tu selección" image="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1800&q=82" current="Guardados" /><main className="saved-main"><div className="saved-toolbar"><div><strong>{savedProducts.length}</strong><span> productos guardados</span></div>{savedProducts.length ? <button type="button" onClick={() => setSavedProductIds([])}><FaTrashAlt /> Limpiar guardados</button> : null}</div>{message ? <div className="saved-alert" role="status">{message}</div> : null}{loading ? <FeatureState tone="loading" title="Abriendo tus guardados" message="Estamos comprobando disponibilidad y precios actuales." /> : error ? <FeatureState tone="error" title="No pudimos abrir tus guardados" message={error.message} actionLabel="Ir a Tienda" actionTo={routePaths.public.catalog} /> : savedProducts.length ? <section className="catalog-grid saved-grid">{savedProducts.map((product) => <StoreProductCard key={product.id} product={product} saved onToggleSaved={toggleSaved} onAddToCart={addToCart} />)}</section> : <FeatureState tone="empty" title="Aún no tienes productos guardados" message="Usa el corazón en Tienda o en el detalle de una pieza para crear tu selección." actionLabel="Explorar Tienda" actionTo={routePaths.public.catalog} />}</main><HomeFooter /></div>;
}
