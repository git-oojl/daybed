import { generatePath, Link } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { routePaths } from "../../routes/routePaths.js";
import { productCategoryName, productImage } from "../../services/viewMappers.js";
import useStoreSettings from "../../services/useStoreSettings.js";

function formatPrice(amount) {
  return `$${Number(amount || 0).toLocaleString("es-MX")} MXN`;
}

export default function StoreProductCard({
  product,
  saved = false,
  onToggleSaved,
  onAddToCart,
  compact = false,
}) {
  const { settings } = useStoreSettings();
  const detailPath = generatePath(routePaths.public.productDetail, {
    productId: product.id,
  });
  const category = productCategoryName(product);
  const stock = Number(product.stock ?? 0);
  const purchasePaused = settings.storefront_available === false;

  return (
    <article className={`store-product-card${compact ? " store-product-card--compact" : ""}`}>
      <div className="store-product-card__media">
        <Link to={detailPath} aria-label={`Ver detalle de ${product.name}`}>
          <img
            src={productImage(product)}
            alt={product.name}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = productImage({});
            }}
          />
        </Link>
        {onToggleSaved ? (
          <button
            type="button"
            className={`store-product-card__heart${saved ? " is-saved" : ""}`}
            onClick={() => onToggleSaved(product)}
            aria-label={saved ? `Quitar ${product.name} de guardados` : `Guardar ${product.name}`}
            aria-pressed={saved}
          >
            <FaHeart aria-hidden="true" />
          </button>
        ) : null}
        {product.badge ? <span className="store-product-card__badge">{product.badge}</span> : null}
      </div>
      <div className="store-product-card__body">
        {category ? <p className="store-product-card__category">{category}</p> : null}
        <h3><Link to={detailPath}>{product.name}</Link></h3>
        <p className="store-product-card__description">
          {product.description || "Una pieza funcional para completar tu espacio."}
        </p>
        <div className="store-product-card__bottom">
          <strong>{formatPrice(product.price)}</strong>
          {stock <= 0 ? <span className="store-product-card__stock">Agotado</span> : purchasePaused ? <span className="store-product-card__stock">Compra pausada</span> : null}
        </div>
        <div className="store-product-card__actions">
          <Link to={detailPath}>Ver detalle</Link>
          {onAddToCart ? (
            <button type="button" onClick={() => onAddToCart(product)} disabled={stock <= 0 || purchasePaused}>
              <FaShoppingCart aria-hidden="true" />
              {stock <= 0 ? "Agotado" : purchasePaused ? "Compra pausada" : "Agregar"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
