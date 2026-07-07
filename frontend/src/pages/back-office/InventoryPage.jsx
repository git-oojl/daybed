import { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/inventory-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";

const INVENTORY_PRODUCTS = [
  {
    id: 1,
    name: "Sofá Esquinero",
    sku: "SE001",
    stock: 24,
    minStock: 5,
    status: "active",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80",
  },
  {
    id: 2,
    name: "Mesa de Centro",
    sku: "MC002",
    stock: 3,
    minStock: 5,
    status: "low",
    image: "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=200&q=80",
  },
  {
    id: 3,
    name: "Black Chair",
    sku: "BC003",
    stock: 2,
    minStock: 4,
    status: "low",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200&q=80",
  },
  {
    id: 4,
    name: "Sofá Daybed",
    sku: "SD004",
    stock: 18,
    minStock: 5,
    status: "active",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200&q=80",
  },
  {
    id: 5,
    name: "Lámpara Grifo",
    sku: "LG005",
    stock: 12,
    minStock: 3,
    status: "active",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&q=80",
  },
];

const LOW_STOCK_PRODUCTS = INVENTORY_PRODUCTS.filter((p) => p.status === "low");

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("4");
  const [stockValue, setStockValue] = useState(18);

  const filteredProducts = INVENTORY_PRODUCTS.filter(
    (p) =>
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="home-page inventory-page">
      <HomeHeader />

      <section className="inventory-hero" aria-label="Inventario">
        <div className="inventory-hero__overlay">
          <h1 className="inventory-hero__title">Inventario</h1>
          <p className="inventory-hero__breadcrumb">
            <Link to={routePaths.public.home}>inicio</Link>
            <span aria-hidden="true">&gt;</span>
            <span>Inventario</span>
          </p>
        </div>
      </section>

      <main className="inventory-main">
        <h2 className="inventory-section__title">PRODUCTOS</h2>

        <div className="inventory-toolbar">
          <div className="inventory-search">
            <span className="inventory-search__icon"><IconSearch /></span>
            <input
              type="search"
              className="inventory-search__input"
              placeholder="Buscar productos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="button" className="inventory-filter-btn">
            Filtros
          </button>
        </div>

        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>SKU</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      className="inventory-table__img"
                      src={product.image}
                      alt={product.name}
                    />
                  </td>
                  <td className="inventory-table__product">{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.stock}</td>
                  <td>{product.minStock}</td>
                  <td>
                    <span
                      className={`inventory-status inventory-status--${product.status === "active" ? "active" : "low"}`}
                    >
                      {product.status === "active" ? "Activo" : "Bajo Stock"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="inventory-edit-btn"
                      aria-label={`Editar ${product.name}`}
                    >
                      <IconEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="inventory-bottom">
          <div className="inventory-module">
            <div className="inventory-module__header">
              Productos con bajo inventario
            </div>
            <div className="inventory-module__body">
              <table className="inventory-module__table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Producto</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {LOW_STOCK_PRODUCTS.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img
                          className="inventory-module__img"
                          src={product.image}
                          alt={product.name}
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="inventory-module__footer">
              <button type="button" className="inventory-module__footer-btn">
                Filtrado
              </button>
            </div>
          </div>

          <div className="inventory-module">
            <div className="inventory-module__header">
              Actualización de cantidades
            </div>
            <form
              className="inventory-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="inventory-form__field">
                <label htmlFor="inventory-sku">SKU</label>
                <div className="inventory-form__search">
                  <span className="inventory-form__search-icon"><IconSearch /></span>
                  <input
                    id="inventory-sku"
                    type="search"
                    className="inventory-form__input"
                    placeholder="Buscar por SKU"
                  />
                </div>
              </div>

              <div className="inventory-form__field">
                <label htmlFor="inventory-product">Producto</label>
                <select
                  id="inventory-product"
                  className="inventory-form__select"
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    const product = INVENTORY_PRODUCTS.find(
                      (p) => p.id === Number(e.target.value),
                    );
                    if (product) setStockValue(product.stock);
                  }}
                >
                  {INVENTORY_PRODUCTS.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inventory-form__control">
                <span className="inventory-form__control-label">Cambiar Stock</span>
                <div className="inventory-form__stepper">
                  <button
                    type="button"
                    aria-label="Disminuir stock"
                    onClick={() => setStockValue((v) => Math.max(0, v - 1))}
                  >
                    -
                  </button>
                  <span>{stockValue}</span>
                  <button
                    type="button"
                    aria-label="Aumentar stock"
                    onClick={() => setStockValue((v) => v + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
