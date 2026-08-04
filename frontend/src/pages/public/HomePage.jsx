import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/home-page.css";
import HomeFooter from "../../components/HomeFooter.jsx";
import HomeHeader from "../../components/HomeHeader.jsx";
import { routePaths } from "../../routes/routePaths.js";
import { cartService, catalogService } from "../../services/backendServices.js";
import {
  getSavedProductIds,
  subscribeToSavedItems,
  toggleSavedProduct,
} from "../../services/savedItems.js";
import { productImage, readCollection } from "../../services/viewMappers.js";

const INITIAL_VISIBLE = 4;

const CATEGORIES = [
  {
    id: "comedor",
    label: "Comedor",
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80",
    path: routePaths.public.catalog,
  },
  {
    id: "sala",
    label: "Sala",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    path: routePaths.public.catalog,
  },
  {
    id: "habitacion",
    label: "Habitación",
    image:
      "https://images.unsplash.com/photo-1632829401795-2745c905ac77?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    path: routePaths.public.catalog,
  },
];

const GALLERY_IMAGES = [
  {
    id: 1,
    className: "home-gallery__item--1",
    src: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80",
    alt: "Rincón acogedor con sillón",
  },
  {
    id: 2,
    className: "home-gallery__item--2",
    src: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80",
    alt: "Escritorio en casa",
  },
  {
    id: 3,
    className: "home-gallery__item--3",
    src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80",
    alt: "Comedor elegante",
  },
  {
    id: 4,
    className: "home-gallery__item--4",
    src: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&q=80",
    alt: "Detalle decorativo",
  },
  {
    id: 5,
    className: "home-gallery__item--5",

    src: "https://images.unsplash.com/photo-1632829401795-2745c905ac77?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Habitación moderna",
  },
  {
    id: 6,
    className: "home-gallery__item--6",
    src: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&q=80",
    alt: "Mesa de comedor",
  },
  {
    id: 7,
    className: "home-gallery__item--7",
    src: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=400&q=80",
    alt: "Cocina con detalles",
  },
];

function formatPrice(amount) {
  return `$${(Number(amount) || 0).toLocaleString("es-MX").replace(/,/g, ".")} mxn`;
}

function IconHeart({ filled }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      aria-hidden="true"
    >
      <path
        d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconShare() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 12h8M14 8l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProductCard({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onShare,
}) {
  return (
    <article className="home-product">
      <div className="home-product__img-wrap">
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
        <div className="home-product__overlay">
          <button
            type="button"
            className="home-product__add-btn"
            onClick={() => onAddToCart(product)}
          >
            Agregar al carrito
          </button>
          <div className="home-product__actions">
            <button
              type="button"
              className="home-product__action-btn"
              onClick={() => onShare(product)}
            >
              <IconShare />
              Compartir
            </button>
            <button
              type="button"
              className={`home-product__action-btn${isWishlisted ? " home-product__action-btn--active" : ""}`}
              onClick={() => onToggleWishlist(product.id)}
              aria-pressed={isWishlisted}
            >
              <IconHeart filled={isWishlisted} />
              Guardar
            </button>
          </div>
        </div>
      </div>
      <div className="home-product__info">
        <h3 className="home-product__name">
          <Link to={routePaths.public.productDetail.replace(":productId", product.id)}>
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
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState("");
  const [wishlist, setWishlist] = useState(() => getSavedProductIds());
  const [toast, setToast] = useState("");

  useEffect(() => {
    let active = true;
    catalogService
      .products({ ordering: "-id" })
      .then((response) => {
        if (active) setProducts(readCollection(response));
      })
      .catch(() => {
        if (active) setProductsError("No fue posible cargar los productos.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => subscribeToSavedItems(setWishlist), []);

  const productsToShow = products;
  const visibleProducts = useMemo(() => {
    return productsToShow.slice(0, visibleCount);
  }, [productsToShow, visibleCount]);

  const hasMore = visibleCount < productsToShow.length;

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2800);
  }, []);

  const handleAddToCart = useCallback(
    async (product) => {
      try {
        await cartService.addItem({ product_id: product.id, quantity: 1 });
        showToast(`${product.name} agregado al carrito`);
      } catch (error) {
        showToast(error.status === 401 ? "Inicia sesión para agregar productos" : "No se pudo agregar el producto");
      }
    },
    [showToast],
  );

  const handleToggleWishlist = useCallback(
    (productId) => {
      const nextIds = toggleSavedProduct(productId);
      showToast(
        nextIds.includes(String(productId))
          ? "Producto guardado"
          : "Producto eliminado de guardados",
      );
    },
    [showToast],
  );

  const handleShare = useCallback(
    async (product) => {
      const shareData = {
        title: product.name,
        text: product.description,
        url: window.location.href,
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(
            `${product.name} - ${formatPrice(product.price)}`,
          );
          showToast("Enlace copiado al portapapeles");
        }
      } catch {
        showToast("No se pudo compartir");
      }
    },
    [showToast],
  );

  return (
    <div className="home-page">
      <HomeHeader />

      <main>
        <section className="home-hero" aria-label="Colección destacada">
          <div className="home-hero__card">
            <h1 className="home-hero__title">
              Descubre nuestra nueva colección
            </h1>
            <p className="home-hero__text">
              Diseña la comodidad para cada rincón de tu hogar, transforma
              espacios y crea experiencias con DayBed
            </p>
            <button
              type="button"
              className="home-hero__cta"
              onClick={() => navigate(routePaths.public.catalog)}
            >
              COMPRA AHORA
            </button>
          </div>
        </section>

        <section
          className="home-section"
          aria-labelledby="home-categories-title"
        >
          <p className="home-section__eyebrow">
            El confort que buscabas esta en DayBed
          </p>
          <h2 className="home-section__title" id="home-categories-title">
            Navega en nuestras diferentes secciones
          </h2>
          <div className="home-categories">
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} to={cat.path} className="home-category">
                <div className="home-category__img-wrap">
                  <img
                    className="home-category__img"
                    src={cat.image}
                    alt={cat.label}
                    loading="lazy"
                  />
                </div>
                <p className="home-category__label">{cat.label}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-section" aria-labelledby="home-products-title">
          <h2 className="home-section__title" id="home-products-title">
            Nuestros Productos
          </h2>
          {productsError ? <p className="home-products__message">{productsError}</p> : null}
          <div className="home-products">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlist.includes(String(product.id))}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                onShare={handleShare}
              />
            ))}
          </div>
          {visibleProducts.length === 0 && (
            <p style={{ textAlign: "center", color: "#9f9f9f" }}>
              No se encontraron productos
            </p>
          )}
          {hasMore && (
            <div className="home-show-more">
              <button
                type="button"
                className="home-show-more__btn"
                onClick={() => setVisibleCount(productsToShow.length)}
              >
                Mostrar Más
              </button>
            </div>
          )}
        </section>

        <section aria-label="Galería de la comunidad">
          <div className="home-gallery-header">
            <p className="home-gallery-header__text">
              Comparte con nosotros tu hogar con
            </p>
            <p className="home-gallery-header__hashtag">#DayBedFunx</p>
          </div>
          <div className="home-gallery">
            {GALLERY_IMAGES.map((img) => (
              <div
                key={img.id}
                className={`home-gallery__item ${img.className}`}
              >
                <img src={img.src} alt={img.alt} loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      </main>

      <HomeFooter />

      {toast && (
        <div className="home-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

export default HomePage;
