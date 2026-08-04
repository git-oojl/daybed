import { useEffect, useState } from "react";
import { generatePath, Link, useParams } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/product-detail-page.css";
import HomeFooter from "../../components/HomeFooter.jsx";
import HomeHeader from "../../components/HomeHeader.jsx";
import { routePaths } from "../../routes/routePaths.js";
import { cartService, catalogService } from "../../services/backendServices.js";
import {
  assetUrl,
  productCategoryName,
  productImage,
  readCollection,
} from "../../services/viewMappers.js";

const DEFAULT_PRODUCT = {
  id: 8,
  name: "Potty",
  subtitle: "Maceta minimalista",
  price: 500000,
  rating: 4.5,
  reviews: 5,
  sku: "PM001",
  category: "Decoración",
  tags: ["Casa", "Tienda", "Decoración", "Jardín"],
  description:
    "Embellece tu espacio con nuestra Maceta Minimalista Potty. Diseñada con líneas limpias y materiales naturales, esta maceta aporta un toque de elegancia y serenidad a cualquier rincón de tu hogar. Perfecta para plantas pequeñas y medianas.",
  longDescription:
    "La Maceta Minimalista Potty combina funcionalidad y estética en un diseño atemporal. Fabricada con madera de alta calidad y acabados naturales, cada pieza es única. Su forma cilíndrica y proporciones equilibradas la convierten en el complemento ideal para interiores modernos y espacios al aire libre. Fácil de mantener y duradera, Potty es la elección perfecta para quienes valoran el diseño consciente y la belleza en los detalles.",
  images: [
    "/images/maceta1.jpeg",
    "/images/maceta2.jpeg",
    "/images/maceta3.jpeg",
    "/images/maceta4.jpeg",
    "/images/maceta5.jpeg",
  ],
  galleryImages: [
    "/images/maceta1.jpeg",
    "/images/macetabotom2.jpeg",
    "/images/macetabotom3.jpeg",
    "/images/macetabotom4.jpeg",
  ],
  sizes: ["13", "15"],
  colors: [
    { id: "sage", value: "#b5c4a8" },
    { id: "wood", value: "#c4a882" },
  ],
};

const RELATED_PRODUCTS = [
  {
    id: 1,
    name: "Syltherine",
    description: "Elegante mesa y silla estilo café",
    price: 2500000,
    oldPrice: 3500000,
    discount: "-30%",
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&q=80",
  },
  {
    id: 2,
    name: "Leviosa",
    description: "Comodo y estilo",
    price: 2500000,
    oldPrice: null,
    discount: null,
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1683793837504-318275ff665d?q=80&w=687&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Lolito",
    description: "La mejor cama que existió",
    price: 7000000,
    oldPrice: 14000000,
    discount: "-50%",
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80",
  },
  {
    id: 4,
    name: "Respira",
    description: "Sofá respira",
    price: 500000,
    oldPrice: null,
    discount: null,
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80",
  },
];

function formatPrice(amount) {
  return `$${(Number(amount) || 0).toLocaleString("es-MX")} mxn`;
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
  if (Number(product.stock) <= 0) return "Agotado";
  if (product.low_stock) return `Últimas piezas: ${product.stock}`;
  return `Disponible: ${product.stock}`;
}

function IconFacebook() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-12h4v2a4 4 0 0 1 4-4Z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function IconTwitter() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2Z" />
    </svg>
  );
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("13");
  const [selectedColor, setSelectedColor] = useState("sage");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("descripcion");
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setLoading(true);
        setError("");
      }
      return Promise.all([catalogService.product(productId), catalogService.products()]);
    })
      .then(([detail, list]) => {
        if (!active) return;
        const galleryImages = (detail.images || [])
          .filter((image) => image?.active !== false)
          .map((image) => assetUrl(image))
          .filter(Boolean);
        const displayImages = [
          productImage(detail),
          ...galleryImages,
        ].filter((image, index, images) => image && images.indexOf(image) === index);
        const detailTags = [
          productCategoryName(detail),
          detail.material,
          detail.color,
          detail.style,
        ].filter(Boolean);
        const normalized = {
          ...detail,
          subtitle: productCategoryName(detail),
          category: productCategoryName(detail),
          tags: detailTags,
          rating: 0,
          reviews: 0,
          images: displayImages,
          galleryImages: displayImages,
          sizes: ["Único"],
          colors: [],
          longDescription: detail.description || "Sin descripción disponible.",
        };
        setProduct(normalized);
        setActiveImage(0);
        setRelatedProducts(readCollection(list).filter((item) => item.id !== detail.id).slice(0, 4));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "No se pudo cargar el producto.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      await cartService.addItem({ product_id: PRODUCT.id, quantity });
      setCartMessage("Producto agregado al carrito.");
    } catch (requestError) {
      setCartMessage(requestError.status === 401 ? "Inicia sesión para agregar productos." : "No se pudo agregar el producto.");
    }
  };

  const PRODUCT = product || DEFAULT_PRODUCT;

  const fullTitle = PRODUCT.name;
  const dimensions = PRODUCT.structured_dimensions || {};
  const specs = PRODUCT.specifications || {};
  const additionalInfo = [
    ["Material", PRODUCT.material],
    ["Color", PRODUCT.color],
    ["Estilo", PRODUCT.style],
    ["Ancho", formatMeasure(dimensions.width_cm, "cm")],
    ["Alto", formatMeasure(dimensions.height_cm, "cm")],
    ["Fondo", formatMeasure(dimensions.depth_cm, "cm")],
    ["Largo", formatMeasure(dimensions.length_cm, "cm")],
    ["Diámetro", formatMeasure(dimensions.diameter_cm, "cm")],
    ["Peso", formatMeasure(dimensions.weight_kg, "kg")],
    ...Object.entries(specs).map(([key, value]) => [formatSpecLabel(key), formatSpecValue(value)]),
  ].filter(([, value]) => value !== "" && value !== null && value !== undefined);

  if (loading) return <div className="home-page product-detail-page"><HomeHeader /><p className="product-detail__state">Cargando producto...</p><HomeFooter /></div>;
  if (error) return <div className="home-page product-detail-page"><HomeHeader /><p className="product-detail__state">{error}</p><HomeFooter /></div>;

  return (
    <div className="home-page product-detail-page">
      <HomeHeader />

      <nav className="product-breadcrumb" aria-label="Ruta de navegación">
        <div className="product-breadcrumb__inner">
          <Link to={routePaths.public.home}>Inicio</Link>
          <span className="product-breadcrumb__separator" aria-hidden="true">
            &gt;
          </span>
          <Link to={routePaths.public.catalog}>Tienda</Link>
          <span className="product-breadcrumb__separator" aria-hidden="true">
            &gt;
          </span>
          <span className="product-breadcrumb__current">
            {PRODUCT.name}
          </span>
        </div>
      </nav>

      <main className="product-detail">
        <section
          className="product-detail__gallery"
          aria-label="Imágenes del producto"
        >
          <div className="product-detail__thumbs">
            {PRODUCT.images.map((src, index) => (
              <button
                key={src}
                type="button"
                className={`product-detail__thumb${activeImage === index ? " product-detail__thumb--active" : ""}`}
                onClick={() => setActiveImage(index)}
                aria-label={`Ver imagen ${index + 1}`}
                aria-current={activeImage === index ? "true" : undefined}
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
              src={PRODUCT.images[activeImage]}
              alt={fullTitle}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = productImage({});
              }}
            />
          </div>
        </section>

        <section
          className="product-detail__info"
          aria-label="Información del producto"
        >
          <h1 className="product-detail__title">{PRODUCT.name}</h1>
          <p className="product-detail__price">{formatPrice(PRODUCT.price)}</p>

          <div className="product-detail__rating" aria-label="Estado de inventario">
            <span>{PRODUCT.category}</span>
            <span className="product-detail__rating-divider" aria-hidden="true" />
            <span>{stockLabel(PRODUCT)}</span>
          </div>

          <p className="product-detail__desc">{PRODUCT.description}</p>

          <div className="product-detail__option">
            <span className="product-detail__option-label">Modelo</span>
            <div className="product-detail__sizes">
              {PRODUCT.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`product-detail__size-btn${selectedSize === size ? " product-detail__size-btn--active" : ""}`}
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={selectedSize === size}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {PRODUCT.colors.length ? (
            <div className="product-detail__option">
              <span className="product-detail__option-label">Color</span>
              <div className="product-detail__colors">
                {PRODUCT.colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    className={`product-detail__color-swatch${selectedColor === color.id ? " product-detail__color-swatch--active" : ""}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.id)}
                    aria-label={`Color ${color.id}`}
                    aria-pressed={selectedColor === color.id}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="product-detail__actions">
            <div className="product-detail__quantity">
              <button
                type="button"
                aria-label="Disminuir cantidad"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                aria-label="Aumentar cantidad"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="product-detail__btn product-detail__btn--cart"
              onClick={handleAddToCart}
            >
              Agregar al carrito
            </button>
          </div>
          {cartMessage ? <p className="product-detail__cart-message">{cartMessage}</p> : null}

          <div className="product-detail__meta">
            <div className="product-detail__meta-row">
              <span className="product-detail__meta-label">SKU :</span>
              <span className="product-detail__meta-value">{PRODUCT.sku}</span>
            </div>
            <div className="product-detail__meta-row">
              <span className="product-detail__meta-label">Categoría :</span>
              <span className="product-detail__meta-value">
                {PRODUCT.category}
              </span>
            </div>
            <div className="product-detail__meta-row">
              <span className="product-detail__meta-label">Etiquetas :</span>
              <span className="product-detail__meta-value">
                {PRODUCT.tags.join(", ")}
              </span>
            </div>
            <div className="product-detail__meta-row product-detail__share">
              <span className="product-detail__meta-label">Compartir :</span>
              <div className="product-detail__share-icons">
                <a href="#" aria-label="Compartir en Facebook">
                  <IconFacebook />
                </a>
                <a href="#" aria-label="Compartir en LinkedIn">
                  <IconLinkedIn />
                </a>
                <a href="#" aria-label="Compartir en Twitter">
                  <IconTwitter />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <section className="product-tabs" aria-label="Detalles del producto">
        <div className="product-tabs__nav" role="tablist">
          {[
            { id: "descripcion", label: "Descripción" },
            { id: "info", label: "Información Adicional" },
            { id: "reviews", label: `Reviews [${PRODUCT.reviews}]` },
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
          {activeTab === "descripcion" && <p>{PRODUCT.longDescription}</p>}
          {activeTab === "info" && (
            <dl className="product-tabs__specs">
              {additionalInfo.map(([label, value]) => (
                <div key={label} className="product-tabs__spec-row">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {activeTab === "reviews" && (
            <p>
              Este MVP no incluye reseñas reales todavía. El producto ya está
              conectado al catálogo, carrito y checkout.
            </p>
          )}
        </div>
      </section>

      <div className="product-inline-gallery" aria-label="Galería de imágenes">
        {PRODUCT.galleryImages.map((src, index) => (
          <div key={src} className="product-inline-gallery__item">
            <img
              src={src}
              alt={`${fullTitle} vista ${index + 1}`}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = productImage({});
              }}
            />
          </div>
        ))}
      </div>

      <section
        className="home-section product-related"
        aria-labelledby="productos-relevantes"
      >
        <h2 id="productos-relevantes" className="home-section__title">
          Productos relevantes
        </h2>
        <div className="home-products">
          {(relatedProducts.length ? relatedProducts : RELATED_PRODUCTS).map((product) => (
            <article className="home-product" key={product.id}>
              <Link
                className="home-product__img-wrap"
                to={generatePath(routePaths.public.productDetail, {
                  productId: product.id,
                })}
              >
                <img
                  className="home-product__img"
                  src={productImage(product)}
                  alt={product.name}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = productImage({});
                  }}
                />
                {product.discount && (
                  <span className="home-product__badge home-product__badge--sale">
                    {product.discount}
                  </span>
                )}
                {product.isNew && !product.discount && (
                  <span className="home-product__badge home-product__badge--new">
                    New
                  </span>
                )}
              </Link>
              <div className="home-product__info">
                <h3 className="home-product__name">
                  <Link
                    to={generatePath(routePaths.public.productDetail, {
                      productId: product.id,
                    })}
                  >
                    {product.name}
                  </Link>
                </h3>
                <p className="home-product__desc">{product.description}</p>
                <div className="home-product__prices">
                  <span className="home-product__price">
                    {formatPrice(product.price)}
                  </span>
                  {product.oldPrice && (
                    <span className="home-product__old-price">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="home-show-more">
          <Link to={routePaths.public.catalog} className="home-show-more__btn">
            Mostrar más
          </Link>
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}
