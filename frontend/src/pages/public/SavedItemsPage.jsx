import { useEffect, useMemo, useState } from "react";
import { generatePath, Link } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaTrashAlt } from "react-icons/fa";
import "../../assets/home-page.css";
import "../../assets/catalog-page.css";
import "../../assets/saved-items-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import { routePaths } from "../../routes/routePaths.js";
import { cartService, catalogService } from "../../services/backendServices.js";
import {
  getSavedProductIds,
  setSavedProductIds,
  subscribeToSavedItems,
} from "../../services/savedItems.js";
import { productImage, readCollection } from "../../services/viewMappers.js";

function formatPrice(price) {
  return `$${Number(price || 0).toLocaleString("es-MX")} mxn`;
}

export default function SavedItemsPage() {
  const [savedIds, setSavedIds] = useState(() => getSavedProductIds());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => subscribeToSavedItems(setSavedIds), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    catalogService
      .products()
      .then((response) => {
        if (active) setProducts(readCollection(response));
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const savedProducts = useMemo(() => {
    const savedIdSet = new Set(savedIds.map(String));
    return products.filter((product) => savedIdSet.has(String(product.id)));
  }, [products, savedIds]);

  const removeSavedProduct = (productId) => {
    setSavedProductIds(savedIds.filter((id) => id !== String(productId)));
  };

  const clearSavedProducts = () => {
    setSavedProductIds([]);
  };

  const addToCart = async (product) => {
    try {
      await cartService.addItem({ product_id: product.id, quantity: 1 });
      setMessage(`${product.name} agregado al carrito.`);
    } catch (error) {
      setMessage(
        error.status === 401
          ? "Inicia sesión para agregar productos al carrito."
          : error.message || "No se pudo agregar al carrito.",
      );
    }
    window.setTimeout(() => setMessage(""), 3500);
  };

  return (
    <div className="home-page saved-page">
      <HomeHeader />

      <PageHero title="Guardados" eyebrow="Tu selección" image="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1800&q=82" current="Guardados" />

      <main className="saved-main">
        <div className="saved-toolbar">
          <div>
            <strong>{savedProducts.length}</strong>
            <span> productos guardados</span>
          </div>
          {savedProducts.length > 0 ? (
            <button type="button" onClick={clearSavedProducts}>
              <FaTrashAlt aria-hidden="true" />
              Limpiar guardados
            </button>
          ) : null}
        </div>

        {message ? <div className="saved-alert">{message}</div> : null}

        {loading ? (
          <div className="saved-empty">Cargando guardados...</div>
        ) : savedProducts.length === 0 ? (
          <section className="saved-empty" aria-label="Sin productos guardados">
            <FaHeart aria-hidden="true" />
            <h2>Aún no tienes productos guardados</h2>
            <p>
              Usa el corazón en el catálogo o en el detalle de producto para
              armar una lista rápida de compra.
            </p>
            <Link to={routePaths.public.catalog}>Ir a la tienda</Link>
          </section>
        ) : (
          <section className="catalog-grid saved-grid" aria-label="Productos guardados">
            {savedProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-card__image">
                  <Link
                    to={generatePath(routePaths.public.productDetail, {
                      productId: product.id,
                    })}
                  >
                    <img
                      className="product-card__img"
                      src={productImage(product)}
                      alt={product.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = productImage({});
                      }}
                    />
                  </Link>
                </div>
                <div className="product-card__body">
                  <h3>
                    <Link
                      to={generatePath(routePaths.public.productDetail, {
                        productId: product.id,
                      })}
                    >
                      {product.name}
                    </Link>
                  </h3>
                  <p>{product.description || "Producto guardado"}</p>
                  <span className="product-card__price">
                    {formatPrice(product.price)}
                  </span>
                  <div className="saved-card-actions">
                    <button type="button" onClick={() => addToCart(product)}>
                      <FaShoppingCart aria-hidden="true" />
                      Carrito
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSavedProduct(product.id)}
                    >
                      <FaTrashAlt aria-hidden="true" />
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}
