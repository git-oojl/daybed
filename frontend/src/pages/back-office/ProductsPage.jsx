// ProductsPage.jsx - CON VALIDACIÓN DE ACCESO
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { routePaths } from "../../routes/routePaths.js";
import { useEffectiveSearchParams } from "../../dev-preview/useEffectiveRouteState.js";
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
import { productImage } from "../../services/viewMappers.js";
import LoadingState from "../../components/support/LoadingState.jsx";
import ErrorMessage from "../../components/support/ErrorMessage.jsx";
import EmptyState from "../../components/support/EmptyState.jsx";

const PAGE_SIZE = 10;
const ROOM_OPTIONS = ["sala", "recámara", "comedor", "oficina", "exterior"];
const STYLE_OPTIONS = [
  "Contemporáneo",
  "Moderno",
  "Nórdico",
  "Japandi",
  "Orgánico",
  "Clásico",
  "Mid-century",
  "Industrial",
  "Minimalista",
  "Escandinavo",
  "Modular",
];
const TYPE_OPTIONS = [
  "sofá cama",
  "sofá",
  "mesa de centro",
  "mesa auxiliar",
  "silla de acento",
  "sillón",
  "cama",
  "buró",
  "comedor",
  "escritorio",
  "repisa",
  "banco",
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams] = useEffectiveSearchParams();
  const categoryParam = searchParams.get("categoria") || "";
  const { user, isAuthenticated, isLoading: authLoading } = useEffectiveSession();
  const viewerId = getViewerIdForUser(user);
  const isAdmin = viewerId === "admin";
  const isEmployee = viewerId === "employee";
  const effectivePermissionCodes = user?.effective_permission_codes ?? [];
  
  // Permisos de catálogo alineados con el backend.
  const canCreate = isAdmin || effectivePermissionCodes.includes("products.create");
  const canUpdate = isAdmin || effectivePermissionCodes.includes("products.update");
  const canDelete = isAdmin || effectivePermissionCodes.includes("products.deactivate");
  const canView = isAdmin || effectivePermissionCodes.includes("products.view");

  // ============================================
  // ✅ VERIFICAR ACCESO
  // ============================================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(routePaths.account.login);
      return;
    }

    if (!authLoading && isAuthenticated) {
      // Empleado necesita permiso para ver productos
      if (isEmployee && !canView) {
        navigate(routePaths.support.unauthorized || "/no-autorizado");
        return;
      }
      // Otros roles (cliente, invitado) no pueden acceder
      if (!isAdmin && !isEmployee) {
        navigate(routePaths.support.unauthorized || "/no-autorizado");
      }
    }
  }, [isAuthenticated, authLoading, user, isAdmin, isEmployee, canView, navigate]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterCategory, setFilterCategory] = useState(categoryParam);
  const [filterStatus, setFilterStatus] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    stock: "",
    minimum_stock: "",
    category: "",
    material: "",
    color: "",
    style: "",
    room: "",
    furniture_type: "",
    has_storage: false,
    is_sofa_bed: false,
    featured: false,
    featured_order: 0,
    width_cm: "",
    height_cm: "",
    depth_cm: "",
    weight_kg: "",
    specifications: "",
    status: "active",
    image_url: "",
    image_file: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploadMethod, setImageUploadMethod] = useState("url");
  const [categories, setCategories] = useState([]);
  
  const initialLoad = useRef(true);
  const isFetching = useRef(false);

const fetchProducts = useCallback(async () => {
  if (isFetching.current) return;
  isFetching.current = true;
  
  try {
    setLoading(true);
    const params = {
      page: currentPage,
      page_size: PAGE_SIZE,
    };
    if (searchTerm) params.search = searchTerm;
    if (filterCategory) params.category = filterCategory;
    
    if (filterStatus === "active") {
      params.active = true;
    } else if (filterStatus === "inactive") {
      params.active = false;
    }

    const response = await catalogService.manageProducts(params);
    let productsData = response.results || response || [];
    
    if (filterStatus === "active") {
      productsData = productsData.filter(p => p.active === true);
    } else if (filterStatus === "inactive") {
      productsData = productsData.filter(p => p.active === false);
    }

    const total = typeof response.count === "number"
      ? response.count
      : productsData.length;
    
    setProducts(productsData);
    setTotalCount(total);
    setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    setError(null);
    
  } catch (err) {
    console.error("Error al cargar productos:", err);
    setError(err.message || "Error al cargar productos");
  } finally {
    setLoading(false);
    isFetching.current = false;
  }
}, [currentPage, filterCategory, filterStatus, searchTerm]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await catalogService.manageCategories({ page_size: 100 });
      let categoriesData = [];
      if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response?.results && Array.isArray(response.results)) {
        categoriesData = response.results;
      } else {
        categoriesData = response || [];
      }
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      fetchCategories();
      fetchProducts();
    }
  }, [fetchCategories, fetchProducts]);

  useEffect(() => {
    if (!initialLoad.current && !isFetching.current) {
      fetchProducts();
    }
  }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
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

  const getProductImageUrl = (product) => {
    if (!product) return null;
    return productImage(product);
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku || "",
        description: product.description || "",
        price: product.price,
        stock: product.stock,
        minimum_stock: product.minimum_stock ?? "",
        category: product.category?.id || product.category,
        material: product.material || "",
        color: product.color || "",
        style: product.style || "",
        room: product.room || "",
        furniture_type: product.furniture_type || "",
        has_storage: Boolean(product.has_storage),
        is_sofa_bed: Boolean(product.is_sofa_bed),
        featured: Boolean(product.featured),
        featured_order: product.featured_order || 0,
        width_cm: product.width_cm || "",
        height_cm: product.height_cm || "",
        depth_cm: product.depth_cm || "",
        weight_kg: product.weight_kg || "",
        specifications: product.specifications && Object.keys(product.specifications).length ? JSON.stringify(product.specifications, null, 2) : "",
        status: getStatusString(product.active),
        image_url: product.image_url || "",
        image_file: null,
      });
      setImagePreview(getProductImageUrl(product));
      setImageUploadMethod(getProductImageUrl(product) ? "url" : "url");
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        sku: "",
        description: "",
        price: "",
        stock: "",
        minimum_stock: "",
        category: "",
        material: "",
        color: "",
        style: "",
        room: "",
        furniture_type: "",
        has_storage: false,
        is_sofa_bed: false,
        featured: false,
        featured_order: 0,
        width_cm: "",
        height_cm: "",
        depth_cm: "",
        weight_kg: "",
        specifications: "",
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
    const { name, type, checked, value } = e.target;
    setFormData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
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
      const formDataToSend = new FormData();
      
      formDataToSend.append("name", formData.name);
      formDataToSend.append("sku", formData.sku || "");
      formDataToSend.append("description", formData.description || `${formData.name} - Mueble de calidad`);
      formDataToSend.append("price", Number(formData.price));
      formDataToSend.append("stock", Number(formData.stock));
      formDataToSend.append("minimum_stock", Number(formData.minimum_stock || 0));
      formDataToSend.append("category", Number(formData.category) || formData.category);
      formDataToSend.append("material", formData.material || "");
      formDataToSend.append("color", formData.color || "");
      formDataToSend.append("style", formData.style || "");
      formDataToSend.append("room", formData.room || "");
      formDataToSend.append("furniture_type", formData.furniture_type || "");
      formDataToSend.append("has_storage", String(Boolean(formData.has_storage)));
      formDataToSend.append("is_sofa_bed", String(Boolean(formData.is_sofa_bed)));
      formDataToSend.append("featured", String(Boolean(formData.featured)));
      formDataToSend.append("featured_order", String(Number(formData.featured_order || 0)));
      ["width_cm", "height_cm", "depth_cm", "weight_kg"].forEach((field) => {
        if (formData[field] !== "") formDataToSend.append(field, Number(formData[field]));
      });
      if (formData.specifications.trim()) {
        try {
          formDataToSend.append("specifications", formData.specifications);
          JSON.parse(formData.specifications);
        } catch {
          throw new Error("Las especificaciones avanzadas deben usar JSON válido.");
        }
      }
      formDataToSend.append("active", formData.status === "active");
      
      if (formData.image_file) {
        formDataToSend.append("main_image", formData.image_file);
      }
      if (formData.image_url && !formData.image_file) {
        formDataToSend.append("image_url", formData.image_url);
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
  if (!canDelete) {
    setError("No tienes permisos para desactivar productos");
    return;
  }
  
  if (window.confirm("¿Desactivar este producto? (Se ocultará del catálogo)")) {
    try {
      setDeletingId(id);
      await catalogService.updateProduct(id, { active: false });
      setError(null);

      if (products.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        await fetchProducts();
      }
    } catch (err) {
      console.error("Error en handleDelete:", err);
      setError(err.message || "Error al desactivar producto");
      await fetchProducts();
    } finally {
      setDeletingId(null);
    }
  }
};

  // ✅ Si no tiene permiso de ver, mostrar mensaje de "No autorizado"
  if (!authLoading && isAuthenticated && !canView && isEmployee) {
    return (
      <div className="home-page dashboard-page">
        <HomeHeader />
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2>Acceso no autorizado</h2>
          <p style={{ color: "#7A6B5A" }}>No tienes permisos para ver esta página.</p>
          <Link to={routePaths.public.home} style={{
            display: "inline-block",
            marginTop: "1rem",
            padding: "0.6rem 2rem",
            background: "#8B5E3C",
            color: "#FFFFFF",
            borderRadius: "8px",
            textDecoration: "none",
          }}>Volver al inicio</Link>
        </div>
        <HomeFooter />
      </div>
    );
  }

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
            Volver a cargar productos
          </button>
        </div>
        <HomeFooter />
      </div>
    );
  }

  // ============================================
  // ✅ RENDER PRINCIPAL
  // ============================================
  return (
    <div className="home-page dashboard-page">
      <HomeHeader />

      <PageHero
        title="Productos internos"
        eyebrow="Catálogo operativo"
        image="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1800&q=82"
        current="Productos internos"
      />

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
            Lista de productos {totalCount > 0 && `(${totalCount})`}
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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  padding: "9px 16px",
                  background: "#666",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Limpiar
              </button>
            )}
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
            
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #E8DCCC",
                fontSize: "0.85rem",
                background: "#FFFFFF",
                minWidth: "100px",
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
                              {getProductImageUrl(product) ? (
                                <img
                                  src={getProductImageUrl(product)}
                                  alt={product.name}
                                  style={{
                                    width: "35px",
                                    height: "35px",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                    border: "1px solid #E8DCCC",
                                  }}
                                  onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = productImage({ name: product.name, category: getProductCategoryName(product) });
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
                            ${Number(product.price || 0).toLocaleString("es-MX")}
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
                            {canUpdate ? (
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
                            ) : (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "3px 12px",
                                  borderRadius: "20px",
                                  fontWeight: 600,
                                  fontSize: "0.7rem",
                                  background: getStatusBg(product.active),
                                  color: getStatusColor(product.active),
                                }}
                              >
                                {getStatusLabel(product.active)}
                              </span>
                            )}
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
                              {canDelete && (
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
                                  {deletingId === product.id ? "Desactivando..." : "Desactivar"}
                                </button>
                              )}
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
              maxWidth: "780px",
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
                <textarea
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
                    minHeight: "96px",
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <div className="form-group">
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
                <div className="form-group">
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

              <section className="product-editor__section">
                <div className="product-editor__section-heading">
                  <strong>Ficha comercial</strong>
                  <span>Información que ayuda a vender y administrar la pieza.</span>
                </div>
                <div className="product-editor__grid">
                  <label>SKU<input name="sku" value={formData.sku} onChange={handleChange} placeholder="Se genera automáticamente" /></label>
                  <label>Stock mínimo<input type="number" min="0" name="minimum_stock" value={formData.minimum_stock} onChange={handleChange} /></label>
                  <label>Material<input list="product-material-options" name="material" value={formData.material} onChange={handleChange} placeholder="Lino, roble, acero..." /></label>
                  <label>Color<input list="product-color-options" name="color" value={formData.color} onChange={handleChange} placeholder="Arena, nogal..." /></label>
                  <label>Estilo<select name="style" value={formData.style} onChange={handleChange}><option value="">Selecciona o deja vacío</option>{STYLE_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                  <label>Espacio<select name="room" value={formData.room} onChange={handleChange}><option value="">Selecciona o deja vacío</option>{ROOM_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                  <label>Tipo de mueble<select name="furniture_type" value={formData.furniture_type} onChange={handleChange}><option value="">Selecciona o deja vacío</option>{TYPE_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                </div>
                <datalist id="product-material-options"><option value="Madera" /><option value="Roble" /><option value="Nogal" /><option value="Fresno" /><option value="Lino" /><option value="Bouclé" /><option value="Terciopelo" /><option value="Metal" /><option value="MDF enchapado" /></datalist>
                <datalist id="product-color-options"><option value="Natural" /><option value="Arena" /><option value="Nogal oscuro" /><option value="Nogal claro" /><option value="Miel" /><option value="Terracota" /><option value="Gris" /><option value="Marfil" /><option value="Verde olivo" /><option value="Azul petróleo" /></datalist>
              </section>

              <section className="product-editor__section product-editor__section--merchandising">
                <div className="product-editor__section-heading">
                  <strong>Merchandising de la tienda</strong>
                  <span>Estos controles alimentan Inicio y los filtros reales del catálogo.</span>
                </div>
                <div className="product-editor__toggles">
                  <label><input type="checkbox" name="has_storage" checked={formData.has_storage} onChange={handleChange} />Incluye almacenamiento</label>
                  <label><input type="checkbox" name="is_sofa_bed" checked={formData.is_sofa_bed} onChange={handleChange} />Es sofá cama</label>
                  <label><input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />Mostrar en “Nuestros productos”</label>
                  <label className={formData.featured ? "" : "is-disabled"}>Orden destacado<input type="number" min="1" max="4" name="featured_order" value={formData.featured_order} onChange={handleChange} disabled={!formData.featured} /></label>
                </div>
                <p className="product-editor__hint">La portada muestra hasta cuatro productos destacados activos. Los agotados se excluyen automáticamente.</p>
              </section>

              <section className="product-editor__section">
                <div className="product-editor__section-heading"><strong>Dimensiones</strong><span>Medidas en centímetros y peso en kilogramos.</span></div>
                <div className="product-editor__grid product-editor__grid--dimensions">
                  <label>Ancho total (cm)<input type="number" min="0" step="0.01" name="width_cm" value={formData.width_cm} onChange={handleChange} placeholder="180" /><small>Medida exterior de lado a lado.</small></label>
                  <label>Alto total (cm)<input type="number" min="0" step="0.01" name="height_cm" value={formData.height_cm} onChange={handleChange} placeholder="85" /><small>Incluye respaldo o punto más alto.</small></label>
                  <label>Profundidad total (cm)<input type="number" min="0" step="0.01" name="depth_cm" value={formData.depth_cm} onChange={handleChange} placeholder="92" /><small>Del frente hacia el fondo.</small></label>
                  <label>Peso (kg)<input type="number" min="0" step="0.01" name="weight_kg" value={formData.weight_kg} onChange={handleChange} placeholder="42" /><small>Peso aproximado para entrega y carga.</small></label>
                </div>
              </section>

              <div className="form-group product-editor__advanced" style={{ marginBottom: "14px" }}>
                <label>Especificaciones avanzadas <small>JSON opcional, por ejemplo {`{"tapiz":"desenfundable"}`}</small></label>
                <textarea name="specifications" value={formData.specifications} onChange={handleChange} placeholder={'{"cuidados":"Limpieza en seco"}'} />
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
                      onError={() => {
                        setImagePreview("");
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
