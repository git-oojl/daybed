import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/home-page.css";
import { routePaths } from "../../routes/routePaths.js";

const INITIAL_VISIBLE = 4;

const NAV_LINKS = [
  { label: "Inicio", path: routePaths.public.home },
  { label: "Tienda", path: routePaths.public.catalog },
  { label: "Sobre Nosotros", path: routePaths.public.contactHelp },
  { label: "Contacto", path: routePaths.public.contactHelp },
];

const FOOTER_LINKS = [
  { label: "Inicio", path: routePaths.public.home },
  { label: "Tienda", path: routePaths.public.catalog },
  { label: "Sobre Nosotros", path: routePaths.public.contactHelp },
  { label: "Contacto", path: routePaths.public.contactHelp },
];

const HELP_LINKS = [
  { label: "Opciones de Pago", path: routePaths.public.contactHelp },
  { label: "Devoluciones", path: routePaths.public.contactHelp },
  { label: "Políticas de privacidad", path: routePaths.public.contactHelp },
];

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

const ALL_PRODUCTS = [
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
      "https://images.unsplash.com/photo-1683793837504-318275ff665d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
  {
    id: 5,
    name: "Grifo",
    description: "Lámpara de noche",
    price: 1500000,
    oldPrice: null,
    discount: null,
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
  },
  {
    id: 6,
    name: "Muggo",
    description: "Lámpara de noche",
    price: 1500000,
    oldPrice: null,
    discount: null,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80",
  },
  {
    id: 7,
    name: "Pingky",
    description: "Cómoda pingky",
    price: 7000000,
    oldPrice: 14000000,
    discount: "-50%",
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500&q=80",
  },
  {
    id: 8,
    name: "Potty",
    description: "Florero pequeño",
    price: 500000,
    oldPrice: null,
    discount: null,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1615529182904-1488c6e4435e?w=500&q=80",
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
  return `$${amount.toLocaleString("es-MX").replace(/,/g, ".")} mxn`;
}

function IconUser() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM3 20.5a9 9 0 0 1 18 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M20 20l-3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
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

function IconCart() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 3h2l1.5 9h11L19 6H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19" r="1.5" fill="currentColor" />
      <circle cx="17" cy="19" r="1.5" fill="currentColor" />
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

function IconCompare() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 6v12M16 6v12M4 10h8M12 14h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
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
          src={product.image}
          alt={product.name}
          loading="lazy"
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
            <button type="button" className="home-product__action-btn">
              <IconCompare />
              Comparar
            </button>
            <button
              type="button"
              className={`home-product__action-btn${isWishlisted ? " home-product__action-btn--active" : ""}`}
              onClick={() => onToggleWishlist(product.id)}
              aria-pressed={isWishlisted}
            >
              <IconHeart filled={isWishlisted} />
              Like
            </button>
          </div>
        </div>
      </div>
      <div className="home-product__info">
        <h3 className="home-product__name">{product.name}</h3>
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");
  const [toast, setToast] = useState("");

  const visibleProducts = useMemo(() => {
    const filtered = searchQuery.trim()
      ? ALL_PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : ALL_PRODUCTS;
    return filtered.slice(0, visibleCount);
  }, [searchQuery, visibleCount]);

  const hasMore = visibleCount < ALL_PRODUCTS.length && !searchQuery.trim();

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2800);
  }, []);

  const handleAddToCart = useCallback(
    (product) => {
      setCartCount((prev) => prev + 1);
      showToast(`${product.name} agregado al carrito`);
    },
    [showToast],
  );

  const handleToggleWishlist = useCallback((productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

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

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) {
      setNewsletterMsg("Ingresa un correo válido");
      return;
    }
    setNewsletterMsg("¡Gracias por suscribirte!");
    setNewsletterEmail("");
    showToast("Suscripción exitosa");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header__inner">
          <Link
            to={routePaths.public.home}
            className="home-header__logo"
            onClick={closeMenu}
          >
            DayBed
          </Link>

          <nav
            className={`home-nav${menuOpen ? " home-nav--open" : ""}`}
            aria-label="Navegación principal"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`home-nav__link${link.path === routePaths.public.home ? " home-nav__link--active" : ""}`}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="home-header__actions">
            <button
              type="button"
              className="home-header__icon-btn"
              aria-label="Mi cuenta"
              onClick={() => navigate(routePaths.account.login)}
            >
              <IconUser />
            </button>
            <button
              type="button"
              className="home-header__icon-btn"
              aria-label="Buscar"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((prev) => !prev)}
            >
              <IconSearch />
            </button>
            <button
              type="button"
              className="home-header__icon-btn"
              aria-label="Lista de deseos"
              onClick={() => navigate(routePaths.public.catalog)}
            >
              <IconHeart filled={wishlist.length > 0} />
              {wishlist.length > 0 && (
                <span className="home-header__badge">{wishlist.length}</span>
              )}
            </button>
            <button
              type="button"
              className="home-header__icon-btn"
              aria-label="Carrito"
              onClick={() => navigate(routePaths.checkout.cart)}
            >
              <IconCart />
              {cartCount > 0 && (
                <span className="home-header__badge">{cartCount}</span>
              )}
            </button>
            <button
              type="button"
              className="home-header__menu-btn"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="home-search">
            <input
              type="search"
              className="home-search__input"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(ALL_PRODUCTS.length);
              }}
              autoFocus
            />
          </div>
        )}
      </header>

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
          <div className="home-products">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlist.includes(product.id)}
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
                onClick={() => setVisibleCount(ALL_PRODUCTS.length)}
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

      <footer className="home-footer">
        <div className="home-footer__inner">
          <div>
            <p className="home-footer__logo">Daybed.</p>
            <p className="home-footer__address">
              400 University Drive Suite 200 Coral Gables, FL 33134 USA
            </p>
          </div>

          <div>
            <p className="home-footer__heading">Links</p>
            <ul className="home-footer__links">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="home-footer__heading">Ayuda</p>
            <ul className="home-footer__links">
              {HELP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="home-footer__heading">Noticias</p>
            <form className="home-newsletter" onSubmit={handleNewsletter}>
              <input
                type="email"
                className="home-newsletter__input"
                placeholder="Ingresa tu correo electrónico"
                value={newsletterEmail}
                onChange={(e) => {
                  setNewsletterEmail(e.target.value);
                  setNewsletterMsg("");
                }}
              />
              <button type="submit" className="home-newsletter__btn">
                Suscribirse
              </button>
            </form>
            {newsletterMsg && (
              <p className="home-newsletter__msg">{newsletterMsg}</p>
            )}
          </div>
        </div>

        <p className="home-footer__copy">
          2023 DayBed. Todos los derechos reservados
        </p>
      </footer>

      {toast && (
        <div className="home-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

export default HomePage;
