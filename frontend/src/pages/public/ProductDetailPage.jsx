import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaCheckCircle, FaHeart, FaRegCopy, FaStar } from "react-icons/fa";
import "../../assets/home-page.css";
import "../../assets/product-detail-page.css";
import HomeFooter from "../../components/HomeFooter.jsx";
import HomeHeader from "../../components/HomeHeader.jsx";
import StoreProductCard from "../../components/store/StoreProductCard.jsx";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { routePaths } from "../../routes/routePaths.js";
import { cartService, catalogService } from "../../services/backendServices.js";
import {
  getSavedProductIds,
  subscribeToSavedItems,
  toggleSavedProduct,
} from "../../services/savedItems.js";
import {
  assetUrl,
  productCategoryName,
  productImage,
  readCollection,
} from "../../services/viewMappers.js";
import useStoreSettings from "../../services/useStoreSettings.js";

function formatPrice(amount) {
  return `$${(Number(amount) || 0).toLocaleString("es-MX")} MXN`;
}

function formatMeasure(value, unit) {
  if (value === null || value === undefined || value === "") return "";
  return `${Number(value).toLocaleString("es-MX")} ${unit}`;
}

function formatSpecLabel(key) {
  return String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatSpecValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (value === null || value === undefined) return "";
  return String(value);
}

function stockLabel(product) {
  const stock = Number(product?.stock || 0);
  if (stock <= 0) return "Agotado por ahora";
  if (product?.low_stock) return `Últimas ${stock} piezas`;
  return "Disponible para entrega";
}

function normalizeReviews(value) {
  if (!Array.isArray(value)) return [];
  return value.map((review, index) => ({
    id: review?.id || `${review?.author || "cliente"}-${index}`,
    author: review?.author || "Cliente Daybed",
    rating: Math.min(5, Math.max(1, Number(review?.rating || 5))),
    title: review?.title || "Buena experiencia",
    body: review?.body || review?.text || "Producto recomendado.",
    verifiedPurchase: Boolean(review?.verified_purchase),
    date: review?.date || review?.created_at || "",
  }));
}

function formatReviewDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function ProductDetailPage() {
  const { settings } = useStoreSettings();
  const { productId } = useParams();
  const { isAuthenticated } = useEffectiveSession();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("descripcion");
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savedIds, setSavedIds] = useState(() => getSavedProductIds());
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
  const [reviewSaving, setReviewSaving] = useState(false);

  useEffect(() => subscribeToSavedItems(setSavedIds), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    Promise.all([
      catalogService.product(productId),
      catalogService.products(),
    ])
      .then(([detail, list]) => {
        if (!active) return;
        const galleryImages = (detail.images || [])
          .filter((image) => image?.active !== false)
          .map((image) => assetUrl(image))
          .filter(Boolean);
        const images = [productImage(detail), ...galleryImages].filter(
          (image, index, all) => image && all.indexOf(image) === index,
        );

        setProduct({
          ...detail,
          categoryName: productCategoryName(detail),
          images: images.length ? images : [productImage({})],
          reviews: normalizeReviews(detail.reviews),
        });
        setActiveImage(0);
        setQuantity(1);
        setRelatedProducts(
          readCollection(list)
            .filter((item) => String(item.id) !== String(detail.id))
            .slice(0, 4),
        );
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || "No pudimos cargar este producto.");
        }
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [productId]);

  const reviews = product?.reviews || [];
  const averageRating = useMemo(() => {
    if (!reviews.length) return Number(product?.average_rating || 0);
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [product?.average_rating, reviews]);

  const additionalInfo = useMemo(() => {
    if (!product) return [];
    const dimensions = product.structured_dimensions || {};
    const specs = product.specifications || {};
    return [
      ["Material", product.material],
      ["Color", product.color],
      ["Estilo", product.style],
      ["Ancho", formatMeasure(dimensions.width_cm, "cm")],
      ["Alto", formatMeasure(dimensions.height_cm, "cm")],
      ["Fondo", formatMeasure(dimensions.depth_cm, "cm")],
      ["Largo", formatMeasure(dimensions.length_cm, "cm")],
      ["Diámetro", formatMeasure(dimensions.diameter_cm, "cm")],
      ["Peso", formatMeasure(dimensions.weight_kg, "kg")],
      ...Object.entries(specs).map(([key, value]) => [
        formatSpecLabel(key),
        formatSpecValue(value),
      ]),
    ].filter(([, value]) => value !== "" && value !== null && value !== undefined);
  }, [product]);

  const flashNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3600);
  };

  const handleAddToCart = async () => {
    if (!product || Number(product.stock || 0) <= 0 || settings.storefront_available === false) return;
    try {
      await cartService.addItem({ product_id: product.id, quantity });
      window.dispatchEvent(new Event("daybed:cart-updated"));
      flashNotice(`${product.name} se agregó al carrito.`);
    } catch (requestError) {
      flashNotice(
        requestError.status === 401
          ? "Inicia sesión para agregar productos al carrito."
          : requestError.message || "No pudimos agregar el producto.",
      );
    }
  };

  const handleToggleSaved = () => {
    if (!product) return;
    const nextIds = toggleSavedProduct(product.id);
    flashNotice(
      nextIds.includes(String(product.id))
        ? "Producto guardado para después."
        : "Producto eliminado de guardados.",
    );
  };

  const handleRelatedAddToCart = async (item) => {
    if (settings.storefront_available === false) { flashNotice("Las compras están pausadas temporalmente."); return; }
    try {
      await cartService.addItem({ product_id: item.id, quantity: 1 });
      window.dispatchEvent(new Event("daybed:cart-updated"));
      flashNotice(`${item.name} se agregó al carrito.`);
    } catch (requestError) {
      flashNotice(requestError.status === 401 ? "Inicia sesión para agregar productos." : requestError.message || "No pudimos agregar el producto.");
    }
  };

  const handleRelatedSaved = (item) => {
    const nextIds = toggleSavedProduct(item.id);
    flashNotice(nextIds.includes(String(item.id)) ? `${item.name} guardado.` : `${item.name} eliminado de guardados.`);
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name || "Daybed",
      text: product?.description || "Mira esta pieza en Daybed.",
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        flashNotice("Enlace copiado.");
      }
    } catch (shareError) {
      if (shareError?.name !== "AbortError") flashNotice("No pudimos compartir el enlace.");
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!reviewForm.title.trim() || !reviewForm.body.trim()) {
      flashNotice("Agrega un título y cuéntanos tu experiencia.");
      return;
    }
    setReviewSaving(true);
    try {
      const created = await catalogService.createReview(product.id, reviewForm);
      setProduct((current) => ({
        ...current,
        reviews: [normalizeReviews([created])[0], ...(current.reviews || [])],
      }));
      setReviewForm({ rating: 5, title: "", body: "" });
      flashNotice("Gracias. Tu reseña ya está publicada.");
    } catch (requestError) {
      flashNotice(requestError.message || "No pudimos publicar la reseña.");
    } finally {
      setReviewSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="home-page product-detail-page">
        <HomeHeader />
        <main className="product-state" role="status">
          <span className="product-state__eyebrow">Tienda Daybed</span>
          <h1>Preparando los detalles</h1>
          <p>Estamos cargando imágenes, medidas y disponibilidad.</p>
        </main>
        <HomeFooter />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="home-page product-detail-page">
        <HomeHeader />
        <main className="product-state product-state--error">
          <span className="product-state__eyebrow">No disponible</span>
          <h1>No encontramos esta pieza</h1>
          <p>{error || "El producto ya no está disponible."}</p>
          <Link to={routePaths.public.catalog}>Volver a la tienda</Link>
        </main>
        <HomeFooter />
      </div>
    );
  }

  const isSaved = savedIds.includes(String(product.id));
  const maxQuantity = Math.max(1, Number(product.stock || 0));
  const tags = [product.categoryName, product.material, product.style].filter(Boolean);

  return (
    <div className="home-page product-detail-page">
      <HomeHeader />

      {notice ? <div className="product-notice" role="status">{notice}</div> : null}

      <nav className="product-breadcrumb" aria-label="Ruta de navegación">
        <div className="product-breadcrumb__inner">
          <Link to={routePaths.public.home}>Inicio</Link>
          <span aria-hidden="true">/</span>
          <Link to={routePaths.public.catalog}>Tienda</Link>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </div>
      </nav>

      <main className="product-detail">
        <section className="product-detail__gallery" aria-label="Imágenes del producto">
          <div className="product-detail__thumbs">
            {product.images.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                className={`product-detail__thumb${activeImage === index ? " product-detail__thumb--active" : ""}`}
                onClick={() => setActiveImage(index)}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <img
                  src={src}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = productImage({});
                  }}
                />
              </button>
            ))}
          </div>
          <div className="product-detail__main-img">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = productImage({});
              }}
            />
          </div>
        </section>

        <section className="product-detail__info" aria-label="Información del producto">
          <p className="product-detail__eyebrow">{product.categoryName}</p>
          <h1 className="product-detail__title">{product.name}</h1>
          <p className="product-detail__price">{formatPrice(product.price)}</p>

          <div className="product-detail__status-row">
            <span className={Number(product.stock || 0) > 0 ? "is-available" : "is-sold-out"}>
              {stockLabel(product)}
            </span>
            {reviews.length ? (
              <button type="button" onClick={() => setActiveTab("reviews")}>
                <FaStar aria-hidden="true" />
                {averageRating.toFixed(1)} · {reviews.length} reseñas
              </button>
            ) : null}
          </div>

          <p className="product-detail__desc">{product.description}</p>

          <div className="product-detail__highlights">
            {[product.material, product.color, product.style].filter(Boolean).map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>

          <div className="product-detail__actions">
            <div className="product-detail__quantity" aria-label="Cantidad">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}>+</button>
            </div>
            <button
              type="button"
              className="product-detail__btn product-detail__btn--cart"
              onClick={handleAddToCart}
              disabled={Number(product.stock || 0) <= 0 || settings.storefront_available === false}
            >
              {Number(product.stock || 0) <= 0 ? "Sin existencias" : settings.storefront_available === false ? "Compra pausada" : "Agregar al carrito"}
            </button>
            <button
              type="button"
              className={`product-detail__btn product-detail__btn--save${isSaved ? " product-detail__btn--save-active" : ""}`}
              onClick={handleToggleSaved}
              aria-pressed={isSaved}
            >
              <FaHeart aria-hidden="true" /> {isSaved ? "Guardado" : "Guardar"}
            </button>
          </div>

          <div className="product-detail__meta">
            <div><span>SKU</span><strong>{product.sku || `DAY-${product.id}`}</strong></div>
            <div><span>Etiquetas</span><strong>{tags.join(" · ") || "Mobiliario Daybed"}</strong></div>
            <div>
              <span>Compartir</span>
              <button type="button" onClick={handleShare}><FaRegCopy aria-hidden="true" /> Copiar enlace</button>
            </div>
          </div>
        </section>
      </main>

      <section className="product-tabs" aria-label="Detalles del producto">
        <div className="product-tabs__nav" role="tablist">
          {[
            { id: "descripcion", label: "Descripción" },
            { id: "info", label: "Medidas y materiales" },
            { id: "reviews", label: `Reseñas (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className={`product-tabs__btn${activeTab === tab.id ? " product-tabs__btn--active" : ""}`}
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="product-tabs__content" role="tabpanel">
          {activeTab === "descripcion" ? (
            <div className="product-tabs__prose">
              <h2>Diseñada para vivirla</h2>
              <p>{product.description}</p>
              <p>
                Cada pieza se revisa antes de salir de tienda. Nuestro equipo puede ayudarte a confirmar medidas, acceso y condiciones de entrega antes de comprar.
              </p>
            </div>
          ) : null}

          {activeTab === "info" ? (
            additionalInfo.length ? (
              <dl className="product-tabs__specs">
                {additionalInfo.map(([label, value]) => (
                  <div key={label} className="product-tabs__spec-row">
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="product-tabs__empty">Nuestro equipo puede confirmar medidas y materiales antes de tu compra.</p>
            )
          ) : null}

          {activeTab === "reviews" ? (
            <div className="product-reviews-layout">
              <div className="product-reviews-summary">
                <span>{averageRating ? averageRating.toFixed(1) : "—"}</span>
                <div>
                  <div className="product-reviews-summary__stars" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((star) => <FaStar key={star} />)}
                  </div>
                  <strong>{reviews.length ? `${reviews.length} opiniones de clientes` : "Tu opinión puede ser la primera"}</strong>
                  <p>Reseñas de personas que compran y viven sus muebles.</p>
                </div>
              </div>

              <div className="product-reviews">
                {reviews.length ? reviews.map((review) => (
                  <article className="product-review" key={review.id}>
                    <div className="product-review__header">
                      <div>
                        <strong>{review.author}</strong>
                        {review.verifiedPurchase ? <span className="product-review__verified"><FaCheckCircle /> Compra verificada</span> : null}
                      </div>
                      <span><FaStar aria-hidden="true" /> {review.rating.toFixed(1)}</span>
                    </div>
                    <h3>{review.title}</h3>
                    <p>{review.body}</p>
                    {review.date ? <time>{formatReviewDate(review.date)}</time> : null}
                  </article>
                )) : (
                  <div className="product-review product-review--empty">
                    <h3>Aún no hay reseñas</h3>
                    <p>Comparte cómo se siente, se ve y funciona esta pieza en tu espacio.</p>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <form className="product-review-form" onSubmit={submitReview}>
                  <div>
                    <p className="product-review-form__eyebrow">Comparte tu experiencia</p>
                    <h3>Escribe una reseña</h3>
                  </div>
                  <label>
                    Calificación
                    <select value={reviewForm.rating} onChange={(event) => setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))}>
                      <option value={5}>5 · Excelente</option>
                      <option value={4}>4 · Muy buena</option>
                      <option value={3}>3 · Buena</option>
                      <option value={2}>2 · Puede mejorar</option>
                      <option value={1}>1 · Mala experiencia</option>
                    </select>
                  </label>
                  <label>
                    Título
                    <input value={reviewForm.title} maxLength={120} onChange={(event) => setReviewForm((current) => ({ ...current, title: event.target.value }))} placeholder="¿Qué fue lo mejor?" />
                  </label>
                  <label>
                    Tu reseña
                    <textarea value={reviewForm.body} rows={4} onChange={(event) => setReviewForm((current) => ({ ...current, body: event.target.value }))} placeholder="Cuéntanos sobre calidad, comodidad, medidas o entrega." />
                  </label>
                  <button type="submit" disabled={reviewSaving}>{reviewSaving ? "Publicando…" : "Publicar reseña"}</button>
                </form>
              ) : (
                <div className="product-review-signin">
                  <strong>¿Ya compraste en Daybed?</strong>
                  <span>Inicia sesión para compartir tu experiencia.</span>
                  <Link to={routePaths.account.login}>Iniciar sesión</Link>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="home-section product-related" aria-labelledby="related-title">
          <div className="home-section__heading product-related__heading">
            <p>También puede gustarte...</p>
            <h2 id="related-title">Piezas para completar el espacio</h2>
            <span>Texturas, escalas y tonos elegidos para acompañar esta pieza sin competir con ella.</span>
          </div>
          <div className="home-products">
            {relatedProducts.map((item) => (
              <StoreProductCard
                key={item.id}
                product={item}
                saved={savedIds.includes(String(item.id))}
                onToggleSaved={handleRelatedSaved}
                onAddToCart={handleRelatedAddToCart}
              />
            ))}
          </div>
          <div className="home-show-more">
            <Link className="home-show-more__btn" to={routePaths.public.catalog}>Ver toda la tienda</Link>
          </div>
        </section>
      ) : null}

      <HomeFooter />
    </div>
  );
}
