// CategoriesPage.jsx
import { useCallback, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { routePaths } from "../../routes/routePaths.js";
import {
  FaCouch,
  FaTable,
  FaChair,
  FaLightbulb,
  FaBoxOpen,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaEye,
  FaSpinner,
} from "react-icons/fa";
import { catalogService } from "../../services/backendServices.js";
import LoadingState from "../../components/support/LoadingState.jsx";
import ErrorMessage from "../../components/support/ErrorMessage.jsx";

// ============================================
// ✅ MAPA DE ICONOS POR CATEGORÍA
// ============================================
const getCategoryIcon = (name) => {
  const icons = {
    "Sofás": <FaCouch size={32} color="#8B5E3C" />,
    "Mesas": <FaTable size={32} color="#8B5E3C" />,
    "Sillas": <FaChair size={32} color="#8B5E3C" />,
    "Iluminación": <FaLightbulb size={32} color="#8B5E3C" />,
    "Almacenamiento": <FaBoxOpen size={32} color="#8B5E3C" />,
    "Sofás cama": <FaCouch size={32} color="#8B5E3C" />,
    "Mesas de centro": <FaTable size={32} color="#8B5E3C" />,
    "Sillas de acento": <FaChair size={32} color="#8B5E3C" />,
    "Decoración": <FaLightbulb size={32} color="#8B5E3C" />,
  };
  return icons[name] || <FaBoxOpen size={32} color="#8B5E3C" />;
};

// ============================================
// ✅ FUNCIONES AUXILIARES
// ============================================
const normalizeString = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const getStatusValue = (categoryOrStatus) => {
  if (typeof categoryOrStatus === "boolean") return categoryOrStatus;
  if (typeof categoryOrStatus === "object" && categoryOrStatus !== null) {
    return categoryOrStatus.active !== false;
  }
  return categoryOrStatus === "active" || categoryOrStatus === "Activo";
};

const getStatusLabel = (status) => {
  return getStatusValue(status) ? "Activo" : "Inactivo";
};

// ============================================
// ✅ COMPONENTE PRINCIPAL
// ============================================
export default function CategoriesPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useEffectiveSession();
  const viewerId = getViewerIdForUser(user);
  const isAdmin = viewerId === "admin";
  const isEmployee = viewerId === "employee";
  const effectivePermissionCodes = user?.effective_permission_codes ?? [];
  
  // ✅ PERMISOS
  const canCreate = isAdmin || effectivePermissionCodes.includes("products.create");
  const canUpdate = isAdmin || effectivePermissionCodes.includes("products.update");
  const canDeactivate =
    isAdmin || effectivePermissionCodes.includes("products.deactivate");
  const canView = isAdmin || effectivePermissionCodes.includes("products.view");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    attributes: "",
    status: "active",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [updating, setUpdating] = useState(false);

  const statusOptions = ["Todos", "Activo", "Inactivo"];

  // ============================================
  // ✅ CARGAR CATEGORÍAS Y CONTAR PRODUCTOS
  // ============================================
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener categorías
      const response = await catalogService.manageCategories({ page_size: 100 });
      let categoriesData = response.results || response || [];
      
      // Obtener productos para contar por categoría
      try {
        const productsResponse = await catalogService.manageProducts({ page_size: 1000 });
        const products = productsResponse.results || productsResponse || [];
        
        // Contar productos por categoría
        const productCounts = {};
        products.forEach(product => {
          const categoryId = product.category?.id || product.category;
          if (categoryId) {
            productCounts[categoryId] = (productCounts[categoryId] || 0) + 1;
          }
        });
        
        // Agregar contador a cada categoría
        categoriesData = categoriesData.map(category => ({
          ...category,
          product_count: productCounts[category.id] || 0,
        }));
        
      } catch {
        categoriesData = categoriesData.map(category => ({
          ...category,
          product_count: category.product_count || 0,
        }));
      }
      
      setCategories(categoriesData);
    } catch (err) {
      console.error("No pudimos cargar las colecciones:", err);
      setError(err.message || "No pudimos cargar las colecciones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate(routePaths.account.login);
      return;
    }

    if (!isAdmin && !isEmployee) {
      navigate(routePaths.support.unauthorized || "/no-autorizado");
      return;
    }

    if (!canView) {
      navigate(routePaths.support.unauthorized || "/no-autorizado");
      return;
    }

    const timeoutId = window.setTimeout(fetchCategories, 0);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    authLoading,
    isAuthenticated,
    isAdmin,
    isEmployee,
    canView,
    navigate,
    fetchCategories,
  ]);

  // ============================================
  // ✅ FILTRAR CATEGORÍAS
  // ============================================
  const filteredCategories = categories.filter((category) => {
    const normalizedSearch = normalizeString(searchTerm);
    const normalizedName = normalizeString(category.name);
    const matchesSearch = normalizedName.includes(normalizedSearch);
    const categoryStatus = getStatusLabel(category);
    const matchesStatus =
      filterStatus === "Todos" || categoryStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ============================================
  // ✅ CREAR/EDITAR CATEGORÍA
  // ============================================
  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        attributes: (category.specification_schema || []).map((item) => item.label || item.key).join(", "),
        status: getStatusValue(category) ? "active" : "inactive",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        attributes: "",
        status: "active",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        specification_schema: formData.attributes.split(",").map((label) => label.trim()).filter(Boolean).map((label) => ({
          key: label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
          label,
          type: "text",
          filterable: true,
        })),
        active: formData.status === "active",
      };

      if (editingCategory) {
        await catalogService.updateCategory(editingCategory.slug || editingCategory.id, payload);
      } else {
        await catalogService.createCategory(payload);
      }
      handleCloseModal();
      await fetchCategories();
    } catch (err) {
      console.error("Error al guardar categoría:", err);
      setError(err.message || "Error al guardar categoría");
    } finally {
      setUpdating(false);
    }
  };

  // ============================================
  // ✅ CAMBIAR ESTADO
  // ============================================
  const handleToggleStatus = async (category) => {
    const newActive = !getStatusValue(category);
    const newStatus = newActive ? "Activo" : "Inactivo";
    
    if (!window.confirm(`¿Cambiar estado de "${category.name}" a "${newStatus}"?`)) {
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      await catalogService.updateCategory(category.slug || category.id, { active: newActive });
      await fetchCategories();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setError(err.message || "Error al cambiar estado");
    } finally {
      setUpdating(false);
    }
  };

  // ============================================
  // ✅ DESACTIVAR CATEGORÍA
  // ============================================
  const handleDelete = async (category) => {
    if (!isAdmin) {
      setError("No tienes permisos para desactivar colecciones");
      return;
    }
    
    if (!window.confirm(`¿Desactivar la categoría "${category.name}"?`)) {
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      await catalogService.updateCategory(category.slug || category.id, { active: false });
      await fetchCategories();
    } catch (err) {
      console.error("Error al desactivar categoría:", err);
      setError(err.message || "Error al desactivar categoría");
    } finally {
      setUpdating(false);
    }
  };

  // ============================================
  // ✅ ESTADOS DE CARGA
  // ============================================
  if (loading || authLoading) {
    return (
      <div className="home-page dashboard-page">
        <HomeHeader />
        <LoadingState message="Cargando colecciones..." />
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
          <button onClick={fetchCategories} style={{
            padding: "10px 24px",
            background: "#8B5E3C",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}>Reintentar</button>
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

      {/* HERO */}
      <PageHero
        title="Colecciones y atributos"
        eyebrow="Merchandising"
        image="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1800&q=82"
        current="Colecciones y atributos"
      />

      <main className="dashboard-container">
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            marginTop: "16px",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(1.2rem, 2vw, 1.8rem)",
              color: "#6B4A2B",
              margin: 0,
            }}
          >
            Colecciones de la tienda ({categories.length})
          </h2>
          {canCreate && (
            <button
              onClick={() => handleOpenModal()}
              style={{
                backgroundColor: "#8B5E3C",
                color: "#FFFFFF",
                border: "none",
                padding: "12px 28px",
                borderRadius: "8px",
                fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background-color 0.2s ease",
                boxShadow: "0 2px 8px rgba(139,94,60,0.3)",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#6B4A2B")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#8B5E3C")}
            >
              <FaPlus /> Nueva colección
            </button>
          )}
        </div>

        {/* FILTROS */}
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
              placeholder="Buscar colecciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <FaFilter style={{ color: "#8B5E3C" }} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #E8DCCC",
                fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                background: "#FFFFFF",
                minWidth: "120px",
              }}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* GRID DE CATEGORÍAS */}
        <div
          className="dashboard-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div
                key={category.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "clamp(24px, 3vw, 32px)",
                  background: "#FFFFFF",
                  border: "1px solid #E8DCCC",
                  borderRadius: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "transform 0.2s ease, boxShadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                }}
              >
                {/* ICONO */}
                <div
                  style={{
                    marginBottom: "12px",
                    background: "#F8F3ED",
                    padding: "14px",
                    borderRadius: "50%",
                    width: "68px",
                    height: "68px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getCategoryIcon(category.name)}
                </div>

                {/* NOMBRE */}
                <h3
                  style={{
                    margin: "0 0 4px 0",
                    color: "#6B4A2B",
                    fontSize: "clamp(1rem, 1.3vw, 1.2rem)",
                    fontWeight: 700,
                  }}
                >
                  {category.name}
                </h3>

                {/* PRODUCTOS */}
                <span
                  style={{
                    color: "#7A6B5A",
                    fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                    marginBottom: "16px",
                  }}
                >
                  {category.product_count || 0} productos
                </span>
                <p className="collection-card__description">{category.description || "Agrupación comercial para organizar productos y sus atributos."}</p>
                <div className="collection-card__attributes">{(category.specification_schema || []).slice(0, 3).map((attribute) => <span key={attribute.key}>{attribute.label || attribute.key}</span>)}{(category.specification_schema || []).length === 0 ? <span>Sin atributos definidos</span> : null}</div>

                {/* ACCIONES */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    width: "100%",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {canUpdate && (
                    <button
                      onClick={() => handleOpenModal(category)}
                      disabled={updating}
                      style={{
                        backgroundColor: "#F8F3ED",
                        color: "#8B5E3C",
                        border: "1px solid #E8DCCC",
                        padding: "8px 18px",
                        borderRadius: "25px",
                        fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                        fontWeight: 600,
                        cursor: updating ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease",
                        flex: 1,
                        justifyContent: "center",
                        opacity: updating ? 0.5 : 1,
                      }}
                    >
                      <FaEdit size={14} /> Editar
                    </button>
                  )}
                  
                  {canUpdate && (
                    <button
                      onClick={() => handleToggleStatus(category)}
                      disabled={updating}
                      style={{
                        backgroundColor: getStatusValue(category) ? "#E8F5E9" : "#FFF3E0",
                        color: getStatusValue(category) ? "#2E7D32" : "#EF6C00",
                        border: "1px solid",
                        borderColor: getStatusValue(category) ? "#A5D6A7" : "#FFCC80",
                        padding: "8px 18px",
                        borderRadius: "25px",
                        fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                        fontWeight: 600,
                        cursor: updating ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease",
                        flex: 1,
                        justifyContent: "center",
                        opacity: updating ? 0.5 : 1,
                      }}
                    >
                      {updating ? <FaSpinner className="spinner" /> : getStatusLabel(category)}
                    </button>
                  )}

                  {/* DESACTIVAR - SOLO ADMIN */}
                  {canDeactivate && (
                    <button
                      onClick={() => handleDelete(category)}
                      disabled={updating}
                      style={{
                        backgroundColor: "#FDECEA",
                        color: "#D32F2F",
                        border: "1px solid #F5D0CC",
                        padding: "8px 18px",
                        borderRadius: "25px",
                        fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                        fontWeight: 600,
                        cursor: updating ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease",
                        flex: 1,
                        justifyContent: "center",
                        opacity: updating ? 0.5 : 1,
                      }}
                    >
                      <FaTrash size={14} /> Desactivar
                    </button>
                  )}
                  {!canUpdate && !canDeactivate && (
                    <span style={{ color: "#7A6B5A", fontSize: "0.85rem" }}>Solo lectura</span>
                  )}
                </div>

                {/* ESTADO Y VER PRODUCTOS */}
                <div
                  style={{
                    marginTop: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: getStatusValue(category) ? "#E8F5E9" : "#FDECEA",
                      color: getStatusValue(category) ? "#2E7D32" : "#D32F2F",
                      padding: "4px 16px",
                      borderRadius: "20px",
                      fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                      fontWeight: 600,
                    }}
                  >
                    {getStatusLabel(category)}
                  </span>
                  <Link
                    to={`${routePaths.backOffice.products}?categoria=${category.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#8B5E3C",
                      textDecoration: "none",
                      fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                      fontWeight: 500,
                      padding: "4px 12px",
                      borderRadius: "20px",
                      backgroundColor: "#F8F3ED",
                      border: "1px solid #E8DCCC",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#8B5E3C";
                      e.currentTarget.style.color = "#FFFFFF";
                      e.currentTarget.style.borderColor = "#8B5E3C";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#F8F3ED";
                      e.currentTarget.style.color = "#8B5E3C";
                      e.currentTarget.style.borderColor = "#E8DCCC";
                    }}
                  >
                    <FaEye size={14} /> Ver productos
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "60px 20px",
                color: "#999",
                fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
              }}
            >
              No se encontraron colecciones que coincidan con los filtros
            </div>
          )}
        </div>
      </main>

      {/* MODAL CREAR/EDITAR */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "clamp(20px, 4vw, 32px)",
              maxWidth: "480px",
              width: "92%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                color: "#6B4A2B",
                marginTop: 0,
                fontSize: "clamp(1.2rem, 1.8vw, 1.5rem)",
                fontWeight: 700,
              }}
            >
              {editingCategory ? "Editar colección" : "Nueva colección"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "#333",
                    fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                  }}
                >
                  Nombre de la colección *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Sofás cama, Mesas auxiliares..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #E8DCCC",
                    borderRadius: "10px",
                    fontSize: "clamp(0.9rem, 1vw, 1rem)",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#8B5E3C")}
                  onBlur={(e) => (e.target.style.borderColor = "#E8DCCC")}
                />
              </div>

              <div className="collection-editor__field">
                <label>Descripción para la tienda</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Qué reúne esta colección y qué la distingue." />
              </div>
              <div className="collection-editor__field">
                <label>Atributos de producto</label>
                <input name="attributes" value={formData.attributes} onChange={handleChange} placeholder="Tapiz, acabado, número de plazas" />
                <small>Sepáralos con comas. Se usarán como ficha y futuros filtros de catálogo.</small>
              </div>

              <div style={{ marginBottom: "28px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "#333",
                    fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
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
                    padding: "12px 16px",
                    border: "2px solid #E8DCCC",
                    borderRadius: "10px",
                    fontSize: "clamp(0.9rem, 1vw, 1rem)",
                    backgroundColor: "#FFFFFF",
                    outline: "none",
                  }}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={updating}
                  style={{
                    padding: "12px 28px",
                    border: "2px solid #E8DCCC",
                    borderRadius: "10px",
                    backgroundColor: "#FFFFFF",
                    color: "#666",
                    cursor: updating ? "not-allowed" : "pointer",
                    fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                    fontWeight: 600,
                    opacity: updating ? 0.5 : 1,
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    padding: "12px 32px",
                    border: "none",
                    borderRadius: "10px",
                    backgroundColor: "#8B5E3C",
                    color: "#FFFFFF",
                    cursor: updating ? "not-allowed" : "pointer",
                    fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(139,94,60,0.3)",
                    opacity: updating ? 0.5 : 1,
                  }}
                >
                  {updating ? "Guardando..." : editingCategory ? "Actualizar" : "Crear"}
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
