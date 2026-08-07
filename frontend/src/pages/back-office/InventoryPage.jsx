import { useEffect, useState } from "react";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { inventoryService } from "../../services/backendServices.js";
import { productImage, readCollection } from "../../services/viewMappers.js";
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
import LoadingState from "../../components/support/LoadingState.jsx";
import ErrorMessage from "../../components/support/ErrorMessage.jsx";

export default function InventoryPage() {
  const { user } = useEffectiveSession();
  const viewerId = getViewerIdForUser(user);
  const isAdmin = viewerId === "admin";
  const effectivePermissionCodes = user?.effective_permission_codes ?? [];
  const canAdjustInventory =
    isAdmin || effectivePermissionCodes.includes("inventory.adjust");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [stockValue, setStockValue] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [editingStock, setEditingStock] = useState(null);

  const normalizeProduct = (product) => ({
    ...product,
    minStock: product.minimum_stock,
    status: product.low_stock ? "low" : "active",
    image: productImage(product),
  });

  const loadInventory = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await inventoryService.products();
      const loadedProducts = readCollection(response).map(normalizeProduct);
      const selectedId = Number(selectedProduct);
      const selectedLoadedProduct =
        loadedProducts.find((product) => product.id === selectedId) ||
        loadedProducts[0];
      setProducts(loadedProducts);
      setSelectedProduct(
        selectedLoadedProduct ? String(selectedLoadedProduct.id) : "",
      );
      setStockValue(selectedLoadedProduct?.stock || 0);
    } catch (error) {
      setLoadError(error.message || "No se pudo cargar el inventario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(loadInventory);
    // The inventory endpoint is fetched when this operational view is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lowStockProducts = products.filter((p) => p.status === "low");

  const filteredProducts = products.filter(
    (p) =>
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.sku || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    const productId = Number(selectedProduct);
    const product = products.find((p) => p.id === productId);

    if (!product) {
      setModalTitle("Selecciona un producto");
      setModalMessage("No hay un producto válido para actualizar.");
      setShowModal(true);
      return;
    }

    try {
      const newStock = Number(stockValue);
      const updated = await inventoryService.updateStock(productId, {
        stock: newStock,
        minimum_stock: product.minStock,
        reason: "Ajuste desde el panel de inventario",
      });
      setProducts((current) => current.map((item) => item.id === productId ? normalizeProduct(updated) : item));
      setModalTitle("Stock actualizado");
      setModalMessage(`El stock de "${product.name}" ha sido actualizado a ${newStock} unidades.`);
      setShowModal(true);
      setEditingStock(null);
    } catch (error) {
      setModalTitle("No se pudo actualizar");
      setModalMessage(error.message || "Intenta nuevamente.");
      setShowModal(true);
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
    document
      .querySelector(".stock-form-container")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="home-page dashboard-page">
        <HomeHeader />
        <LoadingState message="Cargando inventario..." />
        <HomeFooter />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="home-page dashboard-page">
        <HomeHeader />
        <ErrorMessage message={loadError} />
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button type="button" onClick={loadInventory} className="btn-primary">
            Volver a cargar inventario
          </button>
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="home-page dashboard-page">
      <HomeHeader />

      <PageHero
        title="Inventario"
        eyebrow="Control de existencias"
        image="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1800&q=82"
        current="Inventario"
      />

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
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = productImage({});
                          }}
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
                          {product.status === "active"
                            ? "Activo"
                            : "Bajo Stock"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", padding: "12px 10px" }}>
                        {canAdjustInventory ? (
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
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#6B4A2B")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "#8B5E3C")
                            }
                          >
                            <FaEdit size={14} /> Editar Stock
                          </button>
                        ) : (
                          <span style={{ color: "#7A6B5A" }}>Solo lectura</span>
                        )}
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
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = productImage({});
                            }}
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

          {canAdjustInventory && (
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
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
                    onChange={(e) =>
                      setStockValue(Math.max(0, Number(e.target.value)))
                    }
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
                disabled={products.length === 0}
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
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(139,94,60,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(139,94,60,0.3)";
                }}
              >
                {editingStock ? "Actualizar Stock" : "Actualizar Stock"}
              </button>
            </form>
          </div>
          )}
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#6B4A2B")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#8B5E3C")
              }
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
