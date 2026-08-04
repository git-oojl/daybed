import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/home-page.css";
import HomeFooter from "../../components/HomeFooter.jsx";
import HomeHeader from "../../components/HomeHeader.jsx";
import StoreProductCard from "../../components/store/StoreProductCard.jsx";
import { routePaths } from "../../routes/routePaths.js";
import { cartService, catalogService } from "../../services/backendServices.js";
import {
  getSavedProductIds,
  subscribeToSavedItems,
  toggleSavedProduct,
} from "../../services/savedItems.js";
import { readCollection } from "../../services/viewMappers.js";

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
            Nuestros productos
          </h2>
          {productsError ? <p className="home-products__message">{productsError}</p> : null}
          <div className="home-products">
            {visibleProducts.map((product) => (
              <StoreProductCard
                key={product.id}
                product={product}
                saved={wishlist.includes(String(product.id))}
                onAddToCart={handleAddToCart}
                onToggleSaved={(item) => handleToggleWishlist(item.id)}
              />
            ))}
          </div>
          {visibleProducts.length === 0 && (
            <div className="home-products__empty">
              <strong>La colección se está acomodando</strong>
              <span>Vuelve a intentar o explora la tienda completa.</span>
              <Link to={routePaths.public.catalog}>Ir a Tienda</Link>
            </div>
          )}
          {hasMore && (
            <div className="home-show-more">
              <button
                type="button"
                className="home-show-more__btn"
                onClick={() => setVisibleCount(productsToShow.length)}
              >
                Mostrar más
              </button>
            </div>
          )}
        </section>

        <section aria-label="Galería de la comunidad">
          <div className="home-gallery-header">
            <p className="home-gallery-header__text">
              Comparte con nosotros tu hogar con
            </p>
            <p className="home-gallery-header__hashtag">#ViveDaybed</p>
          </div>
          <div className="home-gallery-marquee">
            <div className="home-gallery-marquee__track">
              {[...GALLERY_IMAGES, ...GALLERY_IMAGES].map((img, index) => (
                <div key={`${img.id}-${index}`} className="home-gallery-marquee__item">
                  <img src={img.src} alt={index < GALLERY_IMAGES.length ? img.alt : ""} loading="lazy" />
                </div>
              ))}
            </div>
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
