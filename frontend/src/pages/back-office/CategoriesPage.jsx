import { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { useAuthStore } from "../../auth/authStore.js";
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
} from "react-icons/fa";

export default function CategoriesPage() {
  const user = useAuthStore((state) => state.user);
  const viewerId = getViewerIdForUser(user);
  const isAdmin = viewerId === "admin";
  const effectivePermissionCodes = user?.effective_permission_codes ?? [];
  const canCreate = isAdmin || effectivePermissionCodes.includes("products.create");
  const canUpdate = isAdmin || effectivePermissionCodes.includes("products.update");
  const canDeactivate =
    isAdmin || effectivePermissionCodes.includes("products.deactivate");
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Sofás y Sillones",
      productCount: 12,
      status: "Activo",
      icon: <FaCouch size={32} color="#8B5E3C" />,
    },
    {
      id: 2,
      name: "Mesas y Centros",
      productCount: 10,
      status: "Activo",
      icon: <FaTable size={32} color="#8B5E3C" />,
    },
    {
      id: 3,
      name: "Oficinas y Escritorios",
      productCount: 9,
      status: "Activo",
      icon: <FaChair size={32} color="#8B5E3C" />,
    },
    {
      id: 4,
      name: "Iluminación",
      productCount: 6,
      status: "Activo",
      icon: <FaLightbulb size={32} color="#8B5E3C" />,
    },
    {
      id: 5,
      name: "Almacenamiento",
      productCount: 4,
      status: "Inactivo",
      icon: <FaBoxOpen size={32} color="#8B5E3C" />,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "Activo",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");

  const statusOptions = ["Todos", "Activo", "Inactivo"];

  const normalizeString = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const filteredCategories = categories.filter((category) => {
    const normalizedSearch = normalizeString(searchTerm);
    const normalizedName = normalizeString(category.name);
    const matchesSearch = normalizedName.includes(normalizedSearch);
    const matchesStatus =
      filterStatus === "Todos" || category.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        status: category.status,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        status: "Activo",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formData.name,
                status: formData.status,
              }
            : c,
        ),
      );
    } else {
      setCategories([
        ...categories,
        {
          id: categories.length + 1,
          name: formData.name,
          productCount: 0,
          status: formData.status,
          icon: <FaBoxOpen size={32} color="#8B5E3C" />,
        },
      ]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Desactivar esta categoría?")) {
      setCategories(
        categories.map((c) => (c.id === id ? { ...c, status: "Inactivo" } : c)),
      );
    }
  };

  return (
    <div className="home-page dashboard-page">
      <HomeHeader />

      <section
        className="dashboard-hero"
        aria-label="Categorías"
        style={{
          backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHiRSfEbe7wtyi1Tb8akT0CrMXFu44M9J17JpKGlZAsw&s=10')`,
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
            Categorías
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
            <span
              aria-hidden="true"
              style={{ margin: "0 8px", color: "#F5EDE5" }}
            >
              &gt;
            </span>
            <Link
              to={routePaths.public.catalog}
              style={{ color: "#FFD700", textDecoration: "none" }}
            >
              Catálogo
            </Link>
            <span
              aria-hidden="true"
              style={{ margin: "0 8px", color: "#F5EDE5" }}
            >
              &gt;
            </span>
            <span style={{ color: "#FFFFFF" }}>Categorías</span>
          </p>
        </div>
      </section>

      <main className="dashboard-container">
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
            Lista de categorías
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
              <FaPlus /> Nueva categoría
            </button>
          )}
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
              placeholder="Buscar categorías..."
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
                }}
              >
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
                  {category.icon}
                </div>

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

                <span
                  style={{
                    color: "#7A6B5A",
                    fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                    marginBottom: "16px",
                  }}
                >
                  {category.productCount} productos
                </span>

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
                      style={{
                        backgroundColor: "#F8F3ED",
                        color: "#8B5E3C",
                        border: "1px solid #E8DCCC",
                        padding: "8px 18px",
                        borderRadius: "25px",
                        fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease",
                        flex: 1,
                        justifyContent: "center",
                      }}
                    >
                      <FaEdit size={14} /> Editar
                    </button>
                  )}
                  {canDeactivate && (
                    <button
                      onClick={() => handleDelete(category.id)}
                      style={{
                        backgroundColor: "#FDECEA",
                        color: "#D32F2F",
                        border: "1px solid #F5D0CC",
                        padding: "8px 18px",
                        borderRadius: "25px",
                        fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease",
                        flex: 1,
                        justifyContent: "center",
                      }}
                    >
                      <FaTrash size={14} /> Desactivar
                    </button>
                  )}
                </div>

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
                      backgroundColor:
                        category.status === "Activo" ? "#E8F5E9" : "#FDECEA",
                      color:
                        category.status === "Activo" ? "#2E7D32" : "#D32F2F",
                      padding: "4px 16px",
                      borderRadius: "20px",
                      fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                      fontWeight: 600,
                    }}
                  >
                    {category.status}
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
              No se encontraron categorías que coincidan con los filtros
            </div>
          )}
        </div>
      </main>

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
              {editingCategory ? "Editar categoría" : "Nueva categoría"}
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
                  Nombre de la categoría
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #E8DCCC",
                    borderRadius: "10px",
                    fontSize: "clamp(0.9rem, 1vw, 1rem)",
                    outline: "none",
                  }}
                />
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
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: "12px 28px",
                    border: "2px solid #E8DCCC",
                    borderRadius: "10px",
                    backgroundColor: "#FFFFFF",
                    color: "#666",
                    cursor: "pointer",
                    fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "12px 32px",
                    border: "none",
                    borderRadius: "10px",
                    backgroundColor: "#8B5E3C",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(139,94,60,0.3)",
                  }}
                >
                  {editingCategory ? "Actualizar" : "Crear"}
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
