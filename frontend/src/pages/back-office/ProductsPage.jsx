import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { useAuthStore } from "../../auth/authStore.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
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
  FaChevronLeft,
  FaChevronRight,
  FaImage,
  FaUpload,
  FaLink,
} from "react-icons/fa";
import { catalogService } from "../../services/backendServices.js";
import { getAccessToken } from "../../auth/tokenStorage.js";
import LoadingState from "../../components/support/LoadingState.jsx";
import ErrorMessage from "../../components/support/ErrorMessage.jsx";
import EmptyState from "../../components/support/EmptyState.jsx";

const API_URL = "http://localhost:8000";
const DELETED_PRODUCTS_KEY = 'daybed_deleted_products';

export default function ProductsPage() {
  const user = useAuthStore((state) => state.user);
  const viewerId = getViewerIdForUser(user);
  const isAdmin = viewerId === "admin";
  const effectivePermissionCodes = user?.effective_permission_codes ?? [];
  const canCreate = isAdmin || effectivePermissionCodes.includes("products.create");
  const canUpdate = isAdmin || effectivePermissionCodes.includes("products.update");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    status: "active",
    image_url: "",
    image_file: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploadMethod, setImageUploadMethod] = useState("url");
  const [categories, setCategories] = useState([]);

  const getToken = () => {
    return getAccessToken() || localStorage.getItem('access_token');
  };

  useEffect(() => {
    const saved = localStorage.getItem(DELETED_PRODUCTS_KEY);
    if (saved) {
      try {
        setDeletedIds(JSON.parse(saved));
      } catch (e) {
        setDeletedIds([]);
      }
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterCategory, filterStatus, searchTerm, deletedIds]);

  // ============ READ - Trae productos según filtro ============
  async function fetchProducts() {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: pageSize,
      };
      if (searchTerm) params.search = searchTerm;
      if (filterCategory) params.category = filterCategory;
      
      // ✅ FILTRO DE ESTADO
      if (filterStatus === "active") {
        params.active = true;
      } else if (filterStatus === "inactive") {
        params.active = false;
      }

      const response = await catalogService.manageProducts(params);
      let productsData = response.results || response || [];
      
      // ✅ FILTRAR productos eliminados
      productsData = productsData.filter(p => !deletedIds.includes(p.id));
      
      // ✅ FILTRO OBLIGATORIO EN FRONTEND (asegura que el filtro se aplique)
      if (filterStatus === "active") {
        productsData = productsData.filter(p => p.active === true);
      } else if (filterStatus === "inactive") {
        productsData = productsData.filter(p => p.active === false);
      }
      
      setProducts(productsData);
      setTotalCount(productsData.length || 0);
      setTotalPages(Math.ceil((productsData.length || 0) / pageSize));
      setError(null);
    } catch (err) {
      setError(err.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const response = await catalogService.manageCategories();
      setCategories(response.results || response || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      "Sofás": <FaCouch size={24} color="#8B5E3C" />,
      "Mesas": <FaTable size={24} color="#8B5E3C" />,
      "Sillas": <FaChair size={24} color="#8B5E3C" />,
      "Almacenamiento": <FaBox size={24} color="#8B5E3C" />,
      "Iluminación": <FaLightbulb size={24} color="#8B5E3C" />,
      "Sofás cama": <FaCouch size={24} color="#8B5E3C" />,
      "Mesas de centro": <FaTable size={24} color="#8B5E3C" />,
      "Sillas de acento": <FaChair size={24} color="#8B5E3C" />,
      "Decoración": <FaLightbulb size={24} color="#8B5E3C" />,
    };
    return icons[categoryName] || <FaBox size={24} color="#8B5E3C" />;
  };

  const getStatusString = (status) => {
    if (typeof status === "boolean") {
      return status ? "active" : "inactive";
    }
    return status === "active" || status === "inactive" ? status : "active";
  };

  const getProductCategoryName = (product) => {
    return product.category_detail?.name || product.category?.name || "Sin categoría";
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

  const getProductImage = (product) => {
    if (!product) return null;
    if (product.image) {
      if (product.image.startsWith("http")) return product.image;
      return `${API_URL}${product.image}`;
    }
    if (product.image_url) {
      if (product.image_url.startsWith("http")) return product.image_url;
      return `${API_URL}${product.image_url}`;
    }
    return null;
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        stock: product.stock,
        category: product.category?.id || product.category,
        status: getStatusString(product.active),
        image_url: product.image_url || product.image || "",
        image_file: null,
      });
      setImagePreview(getProductImage(product));
      setImageUploadMethod(getProductImage(product) ? "url" : "url");
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        status: "active",
        image_url: "",
        image_file: null,
      });
      setImagePreview(null);
      setImageUploadMethod("url");
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setImagePreview(null);
    setImageUploadMethod("url");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image_file: file, image_url: "" });
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, image_url: url, image_file: null });
    setImagePreview(url);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // ✅ Usar FormData para enviar imagen correctamente
    const formDataToSend = new FormData();
    
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description || `${formData.name} - Mueble de calidad`);
    formDataToSend.append("price", Number(formData.price));
    formDataToSend.append("stock", Number(formData.stock));
    formDataToSend.append("category", Number(formData.category) || formData.category);
    formDataToSend.append("active", formData.status === "active");
    
    // ✅ Si hay archivo de imagen, agregarlo al FormData
    if (formData.image_file) {
      formDataToSend.append("image", formData.image_file);
      console.log("📸 Subiendo archivo de imagen:", formData.image_file.name);
    }
    
    // ✅ Si hay URL de imagen, agregarla
    if (formData.image_url && !formData.image_file) {
      formDataToSend.append("image_url", formData.image_url);
      console.log("📸 Subiendo URL de imagen:", formData.image_url);
    }

    let response;
    if (editingProduct) {
      response = await catalogService.updateProduct(editingProduct.id, formDataToSend);
    } else {
      response = await catalogService.createProduct(formDataToSend);
    }

    if (response) {
      handleCloseModal();
      fetchProducts();
    }
  } catch (err) {
    console.error("Error al guardar:", err);
    if (err.response?.data) {
      setError(JSON.stringify(err.response.data, null, 2));
    } else {
      setError(err.message || "Error al guardar producto");
    }
  }
};

  const handleToggleStatus = async (id) => {
    try {
      const product = products.find((p) => p.id === id);
      const newActive = !product.active;
      await catalogService.updateProduct(id, { active: newActive });
      fetchProducts();
    } catch (err) {
      setError(err.message || "Error al cambiar estado");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este producto permanentemente?")) {
      try {
        setDeletingId(id);
        const token = getToken();
        
        if (!token) {
          setError("No hay sesión activa. Por favor, inicia sesión nuevamente.");
          setDeletingId(null);
          return;
        }

        const response = await fetch(`${API_URL}/api/catalog/manage/products/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const newDeletedIds = [...deletedIds, id];
          setDeletedIds(newDeletedIds);
          localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(newDeletedIds));
          
          setProducts(prev => prev.filter(p => p.id !== id));
          setTotalCount(prev => prev - 1);
          setError(null);
          
          await fetchProducts();
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.detail || "Error al eliminar producto");
        }
      } catch (err) {
        console.error("Error en handleDelete:", err);
        setError(err.message || "Error al eliminar producto");
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="home-page dashboard-page">
        <HomeHeader />
        <LoadingState message="Cargando productos..." />
        <HomeFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page dashboard-page">
        <HomeHeader />
        <ErrorMessage message={error} />
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={fetchProducts} className="btn-primary">
            Reintentar
          </button>
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="home-page dashboard-page">
      <HomeHeader />

      <section
        className="dashboard-hero"
        aria-label="Productos"
        style={{
          backgroundImage:
            "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ1TEkqyw1tABVn-JkqxcNMuMAmqLaxjYxp3-bTP1JIg&s=10')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          minHeight: "180px",
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
            backgroundColor: "rgba(62,42,27,0.75)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 15px",
            width: "100%",
            height: "100%",
          }}
        >
          <h1
            className="dashboard-hero__title"
            style={{
              color: "#FFFFFF",
              fontSize: "1.8rem",
              fontWeight: 700,
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              margin: 0,
              fontFamily: '"Playfair Display", serif',
              textAlign: "center",
            }}
          >
            Productos
          </h1>
          <p
            className="dashboard-hero__breadcrumb"
            style={{
              color: "#F5EDE5",
              fontSize: "0.95rem",
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              marginTop: "8px",
              textAlign: "center",
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
            <span style={{ color: "#FFFFFF" }}>Productos</span>
          </p>
        </div>
      </section>

      <main className="dashboard-container" style={{ padding: "16px" }}>
        <div
          className="dashboard-header-actions"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "1.3rem",
              color: "#6B4A2B",
              margin: 0,
            }}
          >
            Lista de productos ({totalCount}){deletedIds.length > 0 && ` (${deletedIds.length} eliminados)`}
          </h2>
          {canCreate && (
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                background: "#8B5E3C",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.9rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <FaPlus size={14} /> Nuevo producto
            </button>
          )}
        </div>

        {/* FILTROS */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px",
            padding: "14px 16px",
            background: "#FDF8F0",
            border: "1px solid #E8DCCC",
            borderRadius: "12px",
            alignItems: "center",
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{
              position: "relative",
              flex: "1 1 180px",
              minWidth: "160px",
              display: "flex",
              gap: "10px",
            }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <FaSearch
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#999",
                  fontSize: "14px",
                }}
              />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  borderRadius: "8px",
                  border: "1px solid #E8DCCC",
                  fontSize: "0.9rem",
                  background: "#FFFFFF",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "9px 16px",
                background: "#8B5E3C",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.85rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Buscar
            </button>
          </form>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              alignItems: "center",
              flex: "1 1 auto",
            }}
          >
            <FaFilter style={{ color: "#8B5E3C", fontSize: "16px" }} />
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
                fetchProducts();
              }}
              style={{
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #E8DCCC",
                fontSize: "0.85rem",
                background: "#FFFFFF",
                minWidth: "120px",
              }}
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            
            {/* ✅ FILTRO DE ESTADO CORREGIDO */}
            <select
              value={filterStatus}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log("🔄 Cambiando filtro a:", newValue);
                setFilterStatus(newValue);
                setCurrentPage(1);
                fetchProducts();
              }}
              style={{
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #E8DCCC",
                fontSize: "0.85rem",
                background: "#FFFFFF",
                minWidth: "120px",
              }}
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {/* TABLA */}
        <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div
            className="dashboard-card"
            style={{
              padding: "16px",
              background: "#FDF8F0",
              border: "1px solid #E8DCCC",
              borderRadius: "16px",
              overflowX: "auto",
            }}
          >
            {products.length === 0 ? (
              <EmptyState message="No hay productos disponibles" />
            ) : (
              <>
                <div
                  className="table-responsive"
                  style={{
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <table
                    className="dashboard-table"
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "500px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "2px solid #E8DCCC" }}>
                        <th style={{ textAlign: "left", padding: "10px 8px", color: "#6B4A2B", fontWeight: 700 }}>
                          Producto
                        </th>
                        <th style={{ textAlign: "left", padding: "10px 8px", color: "#6B4A2B", fontWeight: 700 }}>
                          Categoría
                        </th>
                        <th style={{ textAlign: "left", padding: "10px 8px", color: "#6B4A2B", fontWeight: 700 }}>
                          Precio
                        </th>
                        <th style={{ textAlign: "center", padding: "10px 8px", color: "#6B4A2B", fontWeight: 700 }}>
                          Stock
                        </th>
                        <th style={{ textAlign: "center", padding: "10px 8px", color: "#6B4A2B", fontWeight: 700 }}>
                          Estado
                        </th>
                        <th style={{ textAlign: "center", padding: "10px 8px", color: "#6B4A2B", fontWeight: 700 }}>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          style={{ borderBottom: "1px solid #F0EBE3" }}
                        >
                          <td style={{ padding: "10px 8px" }}>
                            <div
                              className="table-product"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              {getProductImage(product) ? (
                                <img
                                  src={getProductImage(product)}
                                  alt={product.name}
                                  style={{
                                    width: "35px",
                                    height: "35px",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                    border: "1px solid #E8DCCC",
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                getCategoryIcon(getProductCategoryName(product))
                              )}
                              <span
                                style={{
                                  fontWeight: 500,
                                  fontSize: "0.85rem",
                                }}
                              >
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 8px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {getCategoryIcon(getProductCategoryName(product))}
                              <span style={{ fontSize: "0.8rem" }}>
                                {getProductCategoryName(product)}
                              </span>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "10px 8px",
                              fontWeight: 600,
                              color: "#5C2E0B",
                              fontSize: "0.85rem",
                            }}
                          >
                            ${product.price?.toLocaleString()}
                          </td>
                          <td style={{ textAlign: "center", padding: "10px 8px" }}>
                            <span
                              className={`stock-badge ${
                                product.stock === 0 ? "stock-out" : ""
                              }`}
                              style={{
                                display: "inline-block",
                                padding: "3px 12px",
                                borderRadius: "20px",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                background:
                                  product.stock === 0 ? "#FDECEA" : "#E8F5E9",
                                color:
                                  product.stock === 0 ? "#D32F2F" : "#2E7D32",
                              }}
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td style={{ textAlign: "center", padding: "10px 8px" }}>
                            <button
                              onClick={() => handleToggleStatus(product.id)}
                              style={{
                                padding: "3px 12px",
                                borderRadius: "20px",
                                border: "none",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                cursor: "pointer",
                                background: getStatusBg(product.active),
                                color: getStatusColor(product.active),
                              }}
                            >
                              {getStatusLabel(product.active)}
                            </button>
                          </td>
                          <td style={{ textAlign: "center", padding: "10px 8px" }}>
                            <div
                              className="table-actions"
                              style={{
                                display: "flex",
                                gap: "6px",
                                justifyContent: "center",
                                flexWrap: "wrap",
                              }}
                            >
                              {canUpdate && (
                                <button
                                  onClick={() => handleOpenModal(product)}
                                  className="btn-edit"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "5px 12px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "#8B5E3C",
                                    color: "#fff",
                                    fontSize: "0.7rem",
                                    cursor: "pointer",
                                    fontWeight: 500,
                                  }}
                                >
                                  <FaEdit size={11} /> Editar
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="btn-delete"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "5px 12px",
                                  borderRadius: "6px",
                                  border: "none",
                                  background: "#D32F2F",
                                  color: "#fff",
                                  fontSize: "0.7rem",
                                  cursor: "pointer",
                                  fontWeight: 500,
                                  opacity: deletingId === product.id ? 0.6 : 1,
                                }}
                                disabled={deletingId === product.id}
                              >
                                <FaTrash size={11} />{" "}
                                {deletingId === product.id ? "Eliminando..." : "Eliminar"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "16px",
                      paddingTop: "14px",
                      borderTop: "1px solid #E8DCCC",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #E8DCCC",
                        background: currentPage === 1 ? "#F0EBE3" : "#FFFFFF",
                        color: currentPage === 1 ? "#999" : "#5C2E0B",
                        cursor: currentPage === 1 ? "default" : "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      <FaChevronLeft size={13} />
                    </button>

                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "#6B4A2B",
                        padding: "0 10px",
                        textAlign: "center",
                      }}
                    >
                      Página {currentPage} de {totalPages} ({totalCount} productos)
                    </span>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #E8DCCC",
                        background:
                          currentPage === totalPages ? "#F0EBE3" : "#FFFFFF",
                        color:
                          currentPage === totalPages ? "#999" : "#5C2E0B",
                        cursor:
                          currentPage === totalPages ? "default" : "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      <FaChevronRight size={13} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={handleCloseModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2
              style={{
                color: "#6B4A2B",
                marginTop: 0,
                fontSize: "1.3rem",
              }}
            >
              {editingProduct ? "Editar producto" : "Nuevo producto"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 500,
                    marginBottom: "4px",
                    color: "#333",
                    fontSize: "0.9rem",
                  }}
                >
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #E8DCCC",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 500,
                    marginBottom: "4px",
                    color: "#333",
                    fontSize: "0.9rem",
                  }}
                >
                  Descripción
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Breve descripción del producto"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #E8DCCC",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 500,
                    marginBottom: "4px",
                    color: "#333",
                    fontSize: "0.9rem",
                  }}
                >
                  Precio (MXN) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #E8DCCC",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 500,
                    marginBottom: "4px",
                    color: "#333",
                    fontSize: "0.9rem",
                  }}
                >
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #E8DCCC",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 500,
                    marginBottom: "4px",
                    color: "#333",
                    fontSize: "0.9rem",
                  }}
                >
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #E8DCCC",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    background: "#FFFFFF",
                  }}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 500,
                    marginBottom: "4px",
                    color: "#333",
                    fontSize: "0.9rem",
                  }}
                >
                  <FaImage style={{ marginRight: "6px" }} /> Imagen del producto
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setImageUploadMethod("url")}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "6px",
                      border: imageUploadMethod === "url" ? "2px solid #8B5E3C" : "1px solid #E8DCCC",
                      background: imageUploadMethod === "url" ? "#FDF8F0" : "#FFFFFF",
                      color: imageUploadMethod === "url" ? "#8B5E3C" : "#666",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <FaLink size={11} /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadMethod("file")}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "6px",
                      border: imageUploadMethod === "file" ? "2px solid #8B5E3C" : "1px solid #E8DCCC",
                      background: imageUploadMethod === "file" ? "#FDF8F0" : "#FFFFFF",
                      color: imageUploadMethod === "file" ? "#8B5E3C" : "#666",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <FaUpload size={11} /> Subir archivo
                  </button>
                </div>

                {imageUploadMethod === "url" ? (
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleImageUrlChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #E8DCCC",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                    }}
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #E8DCCC",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      background: "#FFFFFF",
                    }}
                  />
                )}

                {imagePreview && (
                  <div style={{ marginTop: "8px" }}>
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "150px",
                        objectFit: "contain",
                        borderRadius: "8px",
                        border: "1px solid #E8DCCC",
                        padding: "4px",
                        background: "#FDF8F0",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <small style={{ color: "#999", fontSize: "0.7rem" }}>
                  Puedes pegar una URL o seleccionar un archivo de imagen.
                </small>
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 500,
                    marginBottom: "4px",
                    color: "#333",
                    fontSize: "0.9rem",
                  }}
                >
                  Estado
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #E8DCCC",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    background: "#FFFFFF",
                  }}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div
                className="form-actions"
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-cancel"
                  style={{
                    padding: "9px 20px",
                    border: "1px solid #E8DCCC",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                    color: "#666",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  style={{
                    padding: "9px 20px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#8B5E3C",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  {editingProduct ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <HomeFooter />
    </div>
  );
}