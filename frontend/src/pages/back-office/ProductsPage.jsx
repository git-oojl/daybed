// ProductsPage.jsx
import { useState } from "react";
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
  FaSofa,
  FaTable,
  FaCouch,
  FaLightbulb,
  FaBox,
} from "react-icons/fa";

export default function ProductsPage() {
  const [products, setProducts] = useState([
    { id: 1, name: "Sofá Esquinero", price: 8999, stock: 5, category: "Sofás", status: "Activo", icon: <FaSofa size={24} color="#8B5E3C" /> },
    { id: 2, name: "Mesa de Centro", price: 2499, stock: 8, category: "Mesas", status: "Activo", icon: <FaTable size={24} color="#8B5E3C" /> },
    { id: 3, name: "Silla Ejecutiva", price: 3499, stock: 3, category: "Sillas", status: "Activo", icon: <FaChair size={24} color="#8B5E3C" /> },
    { id: 4, name: "Estante Libros", price: 5999, stock: 0, category: "Almacenamiento", status: "Inactivo", icon: <FaBox size={24} color="#8B5E3C" /> },
    { id: 5, name: "Lámpara de Pie", price: 1899, stock: 2, category: "Iluminación", status: "Activo", icon: <FaLightbulb size={24} color="#8B5E3C" /> },
    { id: 6, name: "Sillón Reclinable", price: 12499, stock: 4, category: "Sofás", status: "Activo", icon: <FaCouch size={24} color="#8B5E3C" /> },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    status: "Activo",
  });

  const categories = ["Sofás", "Mesas", "Sillas", "Almacenamiento", "Iluminación"];

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
        status: product.status,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        price: "",
        stock: "",
        category: "",
        status: "Activo",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formData.name,
                price: Number(formData.price),
                stock: Number(formData.stock),
                category: formData.category,
                status: formData.status,
              }
            : p
        )
      );
    } else {
      setProducts([
        ...products,
        {
          id: products.length + 1,
          name: formData.name,
          price: Number(formData.price),
          stock: Number(formData.stock),
          category: formData.category,
          status: formData.status,
          icon: <FaBox size={24} color="#8B5E3C" />,
        },
      ]);
    }
    handleCloseModal();
  };

  const handleToggleStatus = (id) => {
    setProducts(
      products.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "Activo" ? "Inactivo" : "Activo" }
          : p
      )
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar este producto?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="home-page dashboard-page">
      <HomeHeader />

      <section
        className="dashboard-hero"
        aria-label="Productos"
        style={{
          backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ1TEkqyw1tABVn-JkqxcNMuMAmqLaxjYxp3-bTP1JIg&s=10')`,
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
            Productos
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
            <span style={{ color: '#FFFFFF' }}>Productos</span>
          </p>
        </div>
      </section>

      <main className="dashboard-container">
        <div className="dashboard-header-actions">
          <h2>Lista de productos</h2>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            <FaPlus /> Nuevo producto
          </button>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="dashboard-card">
            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="table-product">
                          {product.icon}
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>${product.price.toLocaleString('es-MX')}</td>
                      <td>
                        <span className={`stock-badge ${product.stock === 0 ? 'stock-out' : ''}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(product.id)}
                          className={`status-toggle ${product.status === 'Activo' ? 'status-active' : 'status-inactive'}`}
                        >
                          {product.status}
                        </button>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button onClick={() => handleOpenModal(product)} className="btn-edit">
                            <FaEdit /> Editar
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="btn-delete">
                            <FaTrash /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Editar producto' : 'Nuevo producto'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del producto</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Precio (MXN)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCloseModal} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editingProduct ? 'Actualizar' : 'Crear'}
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