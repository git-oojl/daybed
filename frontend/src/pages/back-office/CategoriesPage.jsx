import { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
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
  FaArrowRight,
} from "react-icons/fa";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([
    { id: 1, name: "Sofás y Sillones", productCount: 12, status: "Activo", icon: <FaCouch size={32} color="#8B5E3C" /> },
    { id: 2, name: "Mesas y Centros", productCount: 10, status: "Activo", icon: <FaTable size={32} color="#8B5E3C" /> },
    { id: 3, name: "Oficinas y Escritorios", productCount: 9, status: "Activo", icon: <FaChair size={32} color="#8B5E3C" /> },
    { id: 4, name: "Iluminación", productCount: 6, status: "Activo", icon: <FaLightbulb size={32} color="#8B5E3C" /> },
    { id: 5, name: "Almacenamiento", productCount: 4, status: "Inactivo", icon: <FaBoxOpen size={32} color="#8B5E3C" /> },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "Activo",
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
            : c
        )
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

  const handleToggleStatus = (id) => {
    setCategories(
      categories.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "Activo" ? "Inactivo" : "Activo" }
          : c
      )
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar esta categoría?")) {
      setCategories(categories.filter((c) => c.id !== id));
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
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          className="dashboard-hero__overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(62, 42, 27, 0.75)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            width: '100%',
            height: '100%',
          }}
        >
          <h1
            className="dashboard-hero__title"
            style={{
              color: '#FFFFFF',
              fontSize: '2.5rem',
              fontWeight: 700,
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              margin: 0,
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Categorías
          </h1>
          <p
            className="dashboard-hero__breadcrumb"
            style={{
              color: '#F5EDE5',
              fontSize: '1.1rem',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              marginTop: '8px',
            }}
          >
            <Link to={routePaths.public.home} style={{ color: '#FFD700', textDecoration: 'none' }}>
              Inicio
            </Link>
            <span aria-hidden="true" style={{ margin: '0 8px', color: '#F5EDE5' }}>&gt;</span>
            <Link to={routePaths.public.catalog} style={{ color: '#FFD700', textDecoration: 'none' }}>
              Catálogo
            </Link>
            <span aria-hidden="true" style={{ margin: '0 8px', color: '#F5EDE5' }}>&gt;</span>
            <span style={{ color: '#FFFFFF' }}>Categorías</span>
          </p>
        </div>
      </section>

      <main className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#6B4A2B', margin: 0 }}>Lista de categorías</h2>
          <button
            onClick={() => handleOpenModal()}
            style={{
              backgroundColor: '#8B5E3C',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#6B4A2B'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#8B5E3C'}
          >
            <FaPlus /> Nueva categoría
          </button>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          {categories.map((category) => (
            <div
              key={category.id}
              className="dashboard-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '32px 24px',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ marginBottom: '16px' }}>
                {category.icon}
              </div>

              <h3 style={{ margin: '0 0 8px 0', color: '#6B4A2B', fontSize: '18px' }}>
                {category.name}
              </h3>

              <span style={{ color: '#7A6B5A', fontSize: '14px', marginBottom: '16px' }}>
                {category.productCount} productos
              </span>

              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button
                  onClick={() => handleOpenModal(category)}
                  style={{
                    backgroundColor: '#8B5E3C',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <FaEdit size={14} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  style={{
                    backgroundColor: '#D32F2F',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <FaTrash size={14} /> Eliminar
                </button>
              </div>

              <button
                onClick={() => handleToggleStatus(category.id)}
                style={{
                  marginTop: '12px',
                  backgroundColor: category.status === 'Activo' ? '#E8F5E9' : '#FDECEA',
                  color: category.status === 'Activo' ? '#2E7D32' : '#D32F2F',
                  border: 'none',
                  padding: '4px 16px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                {category.status}
              </button>
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: '#6B4A2B', marginTop: 0 }}>
              {editingCategory ? 'Editar categoría' : 'Nueva categoría'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px', color: '#333' }}>
                  Nombre de la categoría
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #E8DCCC',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px', color: '#333' }}>
                  Estado
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #E8DCCC',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '10px 24px',
                    border: '1px solid #E8DCCC',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#8B5E3C',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  {editingCategory ? 'Actualizar' : 'Crear'}
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