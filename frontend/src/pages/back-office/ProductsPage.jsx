import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaChair,
  FaTable,
  FaBox,
  FaCouch,
  FaLightbulb,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { apiRequest } from "../../services/apiClient.js";
import { apiEndpoints } from "../../services/apiEndpoints.js";
import LoadingState from "../../components/support/LoadingState.jsx";
import ErrorMessage from "../../components/support/ErrorMessage.jsx";
import EmptyState from "../../components/support/EmptyState.jsx";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    status: "active",
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;
      const response = await apiRequest({ 
        method: "get", 
        url: apiEndpoints.catalog.products, 
        params 
      });
      setProducts(response.results || response || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiRequest({ 
        method: "get", 
        url: apiEndpoints.catalog.categories 
      });
      setCategories(response.results || response || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      "Sofás": <FaCouch size={24} color="#8B5E3C" />,
      "Mesas": <FaTable size={24} color="#8B5E3C" />,
      "Sillas": <FaChair size={24} color="#8B5E3C" />,
      "Almacenamiento": <FaBox size={24} color="#8B5E3C" />,
      "Iluminación": <FaLightbulb size={24} color="#8B5E3C" />,
    };
    return icons[categoryName] || <FaBox size={24} color="#8B5E3C" />;
  };

  const getStatusString = (status) => {
    if (typeof status === "boolean") {
      return status ? "active" : "inactive";
    }
    return status === "active" || status === "inactive" ? status : "active";
  };

  const getStatusLabel = (status) => {
    const normalized = getStatusString(status);
    return normalized === "active" ? "Activo" : "Inactivo";
  };

  const getStatusBg = (status) => {
    const normalized = getStatusString(status);
    return normalized === "active" ? "#E8F5E9" : "#FDECEA";
  };

  const getStatusColor = (status) => {
    const normalized = getStatusString(status);
    return normalized === "active" ? "#2E7D32" : "#D32F2F";
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category?.id || product.category,
        status: getStatusString(product.status),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        price: "",
        stock: "",
        category: "",
        status: "active",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: Number(formData.category) || formData.category,
        status: formData.status,
      };
      
      if (editingProduct) {
        await apiRequest({ 
          method: "patch", 
          url: apiEndpoints.catalog.manageProductDetail(editingProduct.id), 
          data: payload 
        });
      } else {
        await apiRequest({ 
          method: "post", 
          url: apiEndpoints.catalog.manageProducts, 
          data: payload 
        });
      }
      handleCloseModal();
      fetchProducts();
    } catch (err) {
      setError(err.message || "Error al guardar producto");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const product = products.find(p => p.id === id);
      const currentStatus = getStatusString(product.status);
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await apiRequest({ 
        method: "patch", 
        url: apiEndpoints.catalog.manageProductDetail(id), 
        data: { status: newStatus } 
      });
      fetchProducts();
    } catch (err) {
      setError(err.message || "Error al cambiar estado");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este producto?")) {
      try {
        await apiRequest({ 
          method: "delete", 
          url: apiEndpoints.catalog.manageProductDetail(id) 
        });
        fetchProducts();
      } catch (err) {
        setError(err.message || "Error al eliminar producto");
      }
    }
  };

  if (loading) return <LoadingState message="Cargando productos..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="home-page dashboard-page">
      <HomeHeader />

      <section className="dashboard-hero" aria-label="Productos" style={{
        backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ1TEkqyw1tABVn-JkqxcNMuMAmqLaxjYxp3-bTP1JIg&s=10')",
        backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat",
        width: "100%", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
      }}>
        <div className="dashboard-hero__overlay" style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(62,42,27,0.75)", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "40px 20px", width: "100%", height: "100%"
        }}>
          <h1 className="dashboard-hero__title" style={{ color: "#FFFFFF", fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,0.6)", margin: 0, fontFamily: '"Playfair Display", serif' }}>
            Productos
          </h1>
          <p className="dashboard-hero__breadcrumb" style={{ color: "#F5EDE5", fontSize: "clamp(0.9rem,1.2vw,1.1rem)", textShadow: "0 1px 4px rgba(0,0,0,0.5)", marginTop: "8px" }}>
            <Link to={routePaths.public.home} style={{ color: "#FFD700", textDecoration: "none" }}>Inicio</Link>
            <span aria-hidden="true" style={{ margin: "0 8px", color: "#F5EDE5" }}>&gt;</span>
            <span style={{ color: "#FFFFFF" }}>Productos</span>
          </p>
        </div>
      </section>

      <main className="dashboard-container">
        <div className="dashboard-header-actions" style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "clamp(1.2rem,2vw,1.8rem)", color: "#6B4A2B", margin: 0 }}>Lista de productos</h2>
          <button onClick={() => handleOpenModal()} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#8B5E3C", color: "#fff", border: "none", borderRadius: "8px", fontSize: "clamp(0.8rem,1vw,0.9rem)", cursor: "pointer" }}>
            <FaPlus /> Nuevo producto
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px", padding: "16px 20px", background: "#FDF8F0", border: "1px solid #E8DCCC", borderRadius: "12px", alignItems: "center" }}>
          <form onSubmit={handleSearch} style={{ position: "relative", flex: "1", minWidth: "200px", display: "flex", gap: "12px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
              <input type="text" placeholder="Buscar productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 38px", borderRadius: "8px", border: "1px solid #E8DCCC", fontSize: "clamp(0.8rem,1vw,0.9rem)", background: "#FFFFFF" }} />
            </div>
            <button type="submit" style={{ padding: "10px 20px", background: "#8B5E3C", color: "#fff", border: "none", borderRadius: "8px", fontSize: "clamp(0.8rem,1vw,0.9rem)", cursor: "pointer" }}>Buscar</button>
          </form>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <FaFilter style={{ color: "#8B5E3C" }} />
            <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); fetchProducts(); }} style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DCCC", fontSize: "clamp(0.8rem,1vw,0.9rem)", background: "#FFFFFF", minWidth: "140px" }}>
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); fetchProducts(); }} style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DCCC", fontSize: "clamp(0.8rem,1vw,0.9rem)", background: "#FFFFFF", minWidth: "120px" }}>
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="dashboard-card" style={{ padding: "20px", background: "#FDF8F0", border: "1px solid #E8DCCC", borderRadius: "16px", overflowX: "auto" }}>
            {products.length === 0 ? (
              <EmptyState message="No hay productos disponibles" />
            ) : (
              <div className="table-responsive">
                <table className="dashboard-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #E8DCCC" }}>
                      <th style={{ textAlign: "left", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem,1vw,0.9rem)" }}>Producto</th>
                      <th style={{ textAlign: "left", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem,1vw,0.9rem)" }}>Categoría</th>
                      <th style={{ textAlign: "left", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem,1vw,0.9rem)" }}>Precio</th>
                      <th style={{ textAlign: "center", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem,1vw,0.9rem)" }}>Stock</th>
                      <th style={{ textAlign: "center", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem,1vw,0.9rem)" }}>Estado</th>
                      <th style={{ textAlign: "center", padding: "12px 10px", color: "#6B4A2B", fontWeight: 700, fontSize: "clamp(0.8rem,1vw,0.9rem)" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} style={{ borderBottom: "1px solid #F0EBE3" }}>
                        <td style={{ padding: "12px 10px" }}>
                          <div className="table-product" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {getCategoryIcon(product.category?.name)}
                            <span style={{ fontWeight: 500, fontSize: "clamp(0.85rem,1vw,0.95rem)" }}>{product.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 10px", fontSize: "clamp(0.85rem,1vw,0.95rem)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {getCategoryIcon(product.category?.name)}
                            <span>{product.category?.name || "Sin categoría"}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 10px", fontWeight: 600, color: "#5C2E0B", fontSize: "clamp(0.85rem,1vw,0.95rem)" }}>${product.price?.toLocaleString()}</td>
                        <td style={{ textAlign: "center", padding: "12px 10px" }}>
                          <span className={`stock-badge ${product.stock === 0 ? "stock-out" : ""}`} style={{ display: "inline-block", padding: "4px 14px", borderRadius: "20px", fontWeight: 600, fontSize: "clamp(0.75rem,0.9vw,0.85rem)", background: product.stock === 0 ? "#FDECEA" : "#E8F5E9", color: product.stock === 0 ? "#D32F2F" : "#2E7D32" }}>
                            {product.stock}
                          </span>
                        </td>
                        <td style={{ textAlign: "center", padding: "12px 10px" }}>
                          <button
                            onClick={() => handleToggleStatus(product.id)}
                            style={{
                              padding: "4px 14px",
                              borderRadius: "20px",
                              border: "none",
                              fontWeight: 600,
                              fontSize: "clamp(0.7rem,0.85vw,0.8rem)",
                              cursor: "pointer",
                              background: getStatusBg(product.status),
                              color: getStatusColor(product.status),
                            }}
                          >
                            {getStatusLabel(product.status)}
                          </button>
                        </td>
                        <td style={{ textAlign: "center", padding: "12px 10px" }}>
                          <div className="table-actions" style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                            <button onClick={() => handleOpenModal(product)} className="btn-edit" style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 14px", borderRadius: "6px", border: "none", background: "#8B5E3C", color: "#fff", fontSize: "clamp(0.7rem,0.85vw,0.8rem)", cursor: "pointer", fontWeight: 500 }}>
                              <FaEdit size={12} /> Editar
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="btn-delete" style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 14px", borderRadius: "6px", border: "none", background: "#D32F2F", color: "#fff", fontSize: "clamp(0.7rem,0.85vw,0.8rem)", cursor: "pointer", fontWeight: 500 }}>
                              <FaTrash size={12} /> Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: "#FFFFFF", borderRadius: "16px", padding: "clamp(20px,4vw,32px)", maxWidth: "500px", width: "90%", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ color: "#6B4A2B", marginTop: 0, fontSize: "clamp(1.2rem,1.8vw,1.5rem)" }}>{editingProduct ? "Editar producto" : "Nuevo producto"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: "4px", color: "#333", fontSize: "clamp(0.85rem,1vw,0.95rem)" }}>Nombre del producto</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: "100%", padding: "10px 14px", border: "1px solid #E8DCCC", borderRadius: "8px", fontSize: "clamp(0.85rem,1vw,0.95rem)" }} />
              </div>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: "4px", color: "#333", fontSize: "clamp(0.85rem,1vw,0.95rem)" }}>Precio (MXN)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required style={{ width: "100%", padding: "10px 14px", border: "1px solid #E8DCCC", borderRadius: "8px", fontSize: "clamp(0.85rem,1vw,0.95rem)" }} />
              </div>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: "4px", color: "#333", fontSize: "clamp(0.85rem,1vw,0.95rem)" }}>Stock</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} required style={{ width: "100%", padding: "10px 14px", border: "1px solid #E8DCCC", borderRadius: "8px", fontSize: "clamp(0.85rem,1vw,0.95rem)" }} />
              </div>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: "4px", color: "#333", fontSize: "clamp(0.85rem,1vw,0.95rem)" }}>Categoría</label>
                <select name="category" value={formData.category} onChange={handleChange} required style={{ width: "100%", padding: "10px 14px", border: "1px solid #E8DCCC", borderRadius: "8px", fontSize: "clamp(0.85rem,1vw,0.95rem)", background: "#FFFFFF" }}>
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: "4px", color: "#333", fontSize: "clamp(0.85rem,1vw,0.95rem)" }}>Estado</label>
                <select name="status" value={formData.status} onChange={handleChange} style={{ width: "100%", padding: "10px 14px", border: "1px solid #E8DCCC", borderRadius: "8px", fontSize: "clamp(0.85rem,1vw,0.95rem)", background: "#FFFFFF" }}>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
              <div className="form-actions" style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="button" onClick={handleCloseModal} className="btn-cancel" style={{ padding: "10px 24px", border: "1px solid #E8DCCC", borderRadius: "8px", background: "#FFFFFF", color: "#666", cursor: "pointer", fontSize: "clamp(0.85rem,1vw,0.95rem)" }}>Cancelar</button>
                <button type="submit" className="btn-submit" style={{ padding: "10px 24px", border: "none", borderRadius: "8px", background: "#8B5E3C", color: "#FFFFFF", cursor: "pointer", fontSize: "clamp(0.85rem,1vw,0.95rem)", fontWeight: 600 }}>{editingProduct ? "Actualizar" : "Crear"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <HomeFooter />
    </div>
  );
}