import { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import {
  FaSearch,
  FaBoxes,
  FaExclamationTriangle,
  FaPlus,
  FaMinus,
  FaTimes,
  FaCheckCircle,
  FaEdit,
} from "react-icons/fa";

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Sofá Daybed",
    sku: "DD37473",
    stock: 30,
    minStock: 30,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200&q=80",
  },
  {
    id: 2,
    name: "Sofá Esquinero",
    sku: "DD73844",
    stock: 39,
    minStock: 20,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80",
  },
  {
    id: 3,
    name: "Mesa de Centro",
    sku: "DD83482",
    stock: 20,
    minStock: 30,
    status: "low",
    image:
      "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=200&q=80",
  },
  {
    id: 4,
    name: "Black Chair",
    sku: "DD38418",
    stock: 6,
    minStock: 30,
    status: "low",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200&q=80",
  },
  {
    id: 5,
    name: "Lámpara Grifo",
    sku: "LG005",
    stock: 12,
    minStock: 3,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&q=80",
  },
];

export default function InventoryPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("1");
  const [stockValue, setStockValue] = useState(30);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [editingStock, setEditingStock] = useState(null);

  const lowStockProducts = products.filter((p) => p.status === "low");

  const filteredProducts = products.filter(
    (p) =>
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleStockUpdate = (e) => {
    e.preventDefault();
    const productId = Number(selectedProduct);
    const product = products.find((p) => p.id === productId);
    
    if (product) {
      const newStock = Number(stockValue);
      const updatedProducts = products.map((p) =>
        p.id === productId
          ? {
              ...p,
              stock: newStock,
              status: newStock >= p.minStock ? "active" : "low",
            }
          : p
      );
      
      setProducts(updatedProducts);
      
      setModalTitle("Stock Actualizado");
      setModalMessage(
        `El stock de "${product.name}" ha sido actualizado a ${newStock} unidades.`
      );
      setShowModal(true);
      setEditingStock(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleProductChange = (e) => {
    const id = e.target.value;
    setSelectedProduct(id);
    const product = products.find((p) => p.id === Number(id));
    if (product) {
      setStockValue(product.stock);
    }
  };

  const handleEditStock = (product) => {
    setSelectedProduct(String(product.id));
    setStockValue(product.stock);
    setEditingStock(product.id);
    // Scroll al formulario
    document.querySelector(".stock-form-container")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-page dashboard-page">
      <HomeHeader />

      <section
        className="dashboard-hero"
        aria-label="Inventario"
        style={{
          backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ1TEkqyw1tABVn-JkqxcNMuMAmqLaxjYxp3-bTP1JIg&s=10')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          className="dashboard-hero__overlay"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(62, 42, 27, 0.75)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            width: "100%",
            height: "100%",
          }}
        >
          <h1
            className="dashboard-hero__title"
            style={{
              color: "#FFFFFF",
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: 700,
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              margin: 0,
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Inventario
          </h1>
          <p
            className="dashboard-hero__breadcrumb"
            style={{
              color: "#F5EDE5",
              fontSize: "clamp(0.9rem, 1.2vw, 1.1rem)",
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              marginTop: "8px",
            }}
          >
            <Link
              to={routePaths.public.home}
              style={{ color: "#FFD700", textDecoration: "none" }}
            >
              Inicio
            </Link>
            <span aria-hidden="true" style={{ margin: "0 8px", color: "#F5EDE5" }}>
              &gt;
            </span>
            <span style={{ color: "#FFFFFF" }}>Inventario</span>
          </p>
        </div>
      </section>

      <main className="dashboard-container">
        <div
          className="dashboard-header-actions"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(1.2rem, 2vw, 1.8rem)",
              color: "#6B4A2B",
              margin: 0,
            }}
          >
            PRODUCTOS
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "24px",
            padding: "16px 20px",
            background: "#FDF8F0",
            border: "1px solid #E8DCCC",
            borderRadius: "12px",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
            <FaSearch
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#999",
              }}
            />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 38px",
                borderRadius: "8px",
                border: "1px solid #E8DCCC",
                fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                background: "#FFFFFF",
              }}
            />
          </div>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div
            className="dashboard-card"
            style={{
              padding: "20px",
              background: "#FDF8F0",
              border: "1px solid #E8DCCC",
              borderRadius: "16px",
              overflowX: "auto",
            }}
          >
            <div className="table-responsive">
              <table
                className="dashboard-table"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "700px",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #E8DCCC" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 10px",
                        color: "#6B4A2B",
                        fontWeight: 700,
                        fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                      }}
                    >
                      Imagen
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 10px",
                        color: "#6B4A2B",
                        fontWeight: 700,
                        fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                      }}
                    >
                      Producto
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 10px",
                        color: "#6B4A2B",
                        fontWeight: 700,
                        fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                      }}
                    >
                      SKU
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "12px 10px",
                        color: "#6B4A2B",
                        fontWeight: 700,
                        fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                      }}
                    >
                      Stock Actual
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "12px 10px",
                        color: "#6B4A2B",
                        fontWeight: 700,
                        fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                      }}
                    >
                      Stock Mínimo
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "12px 10px",
                        color: "#6B4A2B",
                        fontWeight: 700,
                        fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                      }}
                    >
                      Estado
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "12px 10px",
                        color: "#6B4A2B",
                        fontWeight: 700,
                        fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                      }}
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      style={{ borderBottom: "1px solid #F0EBE3" }}
                    >
                      <td style={{ padding: "12px 10px" }}>
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      </td>
                      <td
                        style={{
                          padding: "12px 10px",
                          fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                          fontWeight: 500,
                        }}
                      >
                        {product.name}
                      </td>
                      <td
                        style={{
                          padding: "12px 10px",
                          fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                        }}
                      >
                        {product.sku}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          padding: "12px 10px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 14px",
                            borderRadius: "20px",
                            fontWeight: 600,
                            fontSize: "clamp(0.75rem, 0.9vw, 0.85rem)",
                            background:
                              product.stock <= product.minStock
                                ? "#FDECEA"
                                : "#E8F5E9",
                            color:
                              product.stock <= product.minStock
                                ? "#D32F2F"
                                : "#2E7D32",
                          }}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          padding: "12px 10px",
                          fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                        }}
                      >
                        {product.minStock}
                      </td>
                      <td style={{ textAlign: "center", padding: "12px 10px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 14px",
                            borderRadius: "20px",
                            fontWeight: 600,
                            fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                            background:
                              product.status === "active"
                                ? "#E8F5E9"
                                : "#FDECEA",
                            color:
                              product.status === "active"
                                ? "#2E7D32"
                                : "#D32F2F",
                          }}
                        >
                          {product.status === "active" ? "Activo" : "Bajo Stock"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", padding: "12px 10px" }}>
                        <button
                          type="button"
                          onClick={() => handleEditStock(product)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 16px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#8B5E3C",
                            color: "#fff",
                            fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                            cursor: "pointer",
                            fontWeight: 500,
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#6B4A2B")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#8B5E3C")}
                        >
                          <FaEdit size={14} /> Editar Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div
          className="dashboard-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
            marginTop: "24px",
          }}
        >
          {/* Productos con bajo inventario */}
          <div
            className="dashboard-card"
            style={{
              padding: "24px",
              background: "#FDF8F0",
              border: "1px solid #E8DCCC",
              borderRadius: "16px",
            }}
          >
            <div
              className="dashboard-card-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
                  color: "#8B5E3C",
                  margin: 0,
                }}
              >
                <FaExclamationTriangle /> Productos con bajo inventario
              </h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #E8DCCC" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 8px",
                        color: "#6B4A2B",
                        fontWeight: 600,
                        fontSize: "clamp(0.75rem, 0.9vw, 0.85rem)",
                      }}
                    >
                      Imagen
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 8px",
                        color: "#6B4A2B",
                        fontWeight: 600,
                        fontSize: "clamp(0.75rem, 0.9vw, 0.85rem)",
                      }}
                    >
                      Producto
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "10px 8px",
                        color: "#6B4A2B",
                        fontWeight: 600,
                        fontSize: "clamp(0.75rem, 0.9vw, 0.85rem)",
                      }}
                    >
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((product) => (
                      <tr
                        key={product.id}
                        style={{ borderBottom: "1px solid #F0EBE3" }}
                      >
                        <td
                          style={{
                            padding: "10px 8px",
                          }}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                          />
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                          }}
                        >
                          {product.name}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "10px 8px",
                            fontWeight: 600,
                            color: "#D32F2F",
                            fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                          }}
                        >
                          {product.stock}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          color: "#999",
                        }}
                      >
                        No hay productos con bajo inventario
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actualización de cantidades */}
          <div
            className="dashboard-card stock-form-container"
            style={{
              padding: "24px",
              background: "#FDF8F0",
              border: "1px solid #E8DCCC",
              borderRadius: "16px",
            }}
          >
            <div
              className="dashboard-card-header"
              style={{ marginBottom: "16px" }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
                  color: "#8B5E3C",
                  margin: 0,
                }}
              >
                <FaBoxes /> Actualización de cantidades
              </h3>
              {editingStock && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#8B5E3C",
                    background: "#F8F3ED",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontWeight: 600,
                  }}
                >
                  Editando stock
                </span>
              )}
            </div>

            <form onSubmit={handleStockUpdate}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "#333",
                    fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                  }}
                >
                  Producto
                </label>
                <select
                  value={selectedProduct}
                  onChange={handleProductChange}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "2px solid #E8DCCC",
                    borderRadius: "10px",
                    fontSize: "clamp(0.9rem, 1vw, 1rem)",
                    background: "#FFFFFF",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "#333",
                    fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                  }}
                >
                  Cambiar Stock
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    aria-label="Disminuir stock"
                    onClick={() => setStockValue((v) => Math.max(0, v - 1))}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "2px solid #E8DCCC",
                      background: "#FFFFFF",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#F5F0E8";
                      e.currentTarget.style.borderColor = "#8B5E3C";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#FFFFFF";
                      e.currentTarget.style.borderColor = "#E8DCCC";
                    }}
                  >
                    <FaMinus size={16} color="#8B5E3C" />
                  </button>
                  <input
                    type="number"
                    value={stockValue}
                    onChange={(e) => setStockValue(Math.max(0, Number(e.target.value)))}
                    style={{
                      width: "100px",
                      padding: "10px 12px",
                      border: "2px solid #E8DCCC",
                      borderRadius: "10px",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "#6B4A2B",
                      textAlign: "center",
                      background: "#FFFFFF",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#8B5E3C")}
                    onBlur={(e) => (e.target.style.borderColor = "#E8DCCC")}
                  />
                  <button
                    type="button"
                    aria-label="Aumentar stock"
                    onClick={() => setStockValue((v) => v + 1)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "2px solid #E8DCCC",
                      background: "#FFFFFF",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#F5F0E8";
                      e.currentTarget.style.borderColor = "#8B5E3C";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#FFFFFF";
                      e.currentTarget.style.borderColor = "#E8DCCC";
                    }}
                  >
                    <FaPlus size={16} color="#8B5E3C" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "none",
                  borderRadius: "12px",
                  backgroundColor: editingStock ? "#D28B00" : "#8B5E3C",
                  color: "#FFFFFF",
                  fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 0.2s ease, transform 0.1s ease",
                  boxShadow: "0 4px 12px rgba(139,94,60,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(139,94,60,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(139,94,60,0.3)";
                }}
              >
                {editingStock ? "Actualizar Stock" : "Actualizar Stock"}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Modal de confirmación */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "clamp(28px, 4vw, 40px)",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
              position: "relative",
              animation: "fadeIn 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#999",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#333")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
            >
              <FaTimes />
            </button>

            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "8px",
                  color: "#4CAF50",
                }}
              >
                <FaCheckCircle />
              </div>
              <h2
                style={{
                  color: "#6B4A2B",
                  fontSize: "clamp(1.3rem, 2vw, 1.6rem)",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {modalTitle}
              </h2>
            </div>

            <p
              style={{
                color: "#333",
                fontSize: "clamp(1rem, 1.2vw, 1.1rem)",
                textAlign: "center",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}
            >
              {modalMessage}
            </p>

            <button
              onClick={closeModal}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "12px",
                backgroundColor: "#8B5E3C",
                color: "#FFFFFF",
                fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6B4A2B")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8B5E3C")}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type=number] {
            -moz-appearance: textfield;
          }
        `}
      </style>

      <HomeFooter />
    </div>
  );
}