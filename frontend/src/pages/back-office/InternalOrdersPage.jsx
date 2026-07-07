import { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import {
  FaSearch,
  FaEye,
  FaEdit,
  FaFilter,
  FaPlus,
  FaCheckCircle,
  FaTruck,
  FaBoxOpen,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function InternalOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const [orders] = useState([
    {
      id: "#ORD-001",
      customer: "Ana García",
      email: "ana@email.com",
      date: "2026-07-05",
      total: 4499,
      status: "Pendiente",
      items: 2,
      payment: "Tarjeta",
      delivery: "Calle 123, Tijuana",
    },
    {
      id: "#ORD-002",
      customer: "Luis Pérez",
      email: "luis@email.com",
      date: "2026-07-04",
      total: 8999,
      status: "Confirmado",
      items: 3,
      payment: "Efectivo",
      delivery: "Av. Reforma 456, Mexicali",
    },
    {
      id: "#ORD-003",
      customer: "María López",
      email: "maria@email.com",
      date: "2026-07-04",
      total: 2499,
      status: "Preparando",
      items: 1,
      payment: "Transferencia",
      delivery: "Blvd. Cucapah 789, Tijuana",
    },
    {
      id: "#ORD-004",
      customer: "Carlos Ramírez",
      email: "carlos@email.com",
      date: "2026-07-03",
      total: 12499,
      status: "Enviado",
      items: 4,
      payment: "Tarjeta",
      delivery: "Calle 456, Ensenada",
    },
    {
      id: "#ORD-005",
      customer: "Laura Fernández",
      email: "laura@email.com",
      date: "2026-07-03",
      total: 5999,
      status: "Entregado",
      items: 2,
      payment: "Efectivo",
      delivery: "Av. López Mateos 789, Tijuana",
    },
    {
      id: "#ORD-006",
      customer: "Jorge Martínez",
      email: "jorge@email.com",
      date: "2026-07-02",
      total: 3499,
      status: "Cancelado",
      items: 1,
      payment: "Tarjeta",
      delivery: "Calle 789, Tecate",
    },
  ]);

  const statusOptions = [
    "Todos",
    "Pendiente",
    "Confirmado",
    "Preparando",
    "Enviado",
    "Entregado",
    "Cancelado",
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pendiente":
        return <FaClock size={14} />;
      case "Confirmado":
        return <FaCheckCircle size={14} />;
      case "Preparando":
        return <FaBoxOpen size={14} />;
      case "Enviado":
        return <FaTruck size={14} />;
      case "Entregado":
        return <FaCheckCircle size={14} />;
      case "Cancelado":
        return <FaTimesCircle size={14} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pendiente":
        return "#ED6C02";
      case "Confirmado":
        return "#2E7D32";
      case "Preparando":
        return "#0288D1";
      case "Enviado":
        return "#6A5ACD";
      case "Entregado":
        return "#4CAF50";
      case "Cancelado":
        return "#D32F2F";
      default:
        return "#666";
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "Pendiente":
        return "#FFF8E1";
      case "Confirmado":
        return "#E8F5E9";
      case "Preparando":
        return "#E3F2FD";
      case "Enviado":
        return "#EDE7F6";
      case "Entregado":
        return "#E8F5E9";
      case "Cancelado":
        return "#FDECEA";
      default:
        return "#F5F5F5";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "Todos" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  return (
    <div className="home-page dashboard-page">
      <HomeHeader />

      <section
        className="dashboard-hero"
        aria-label="Pedidos Internos"
        style={{
          backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuXKMrUPXRYiEM6InCydGROHbsjuaszTXkvxTXR8MzYg&s=10')`,
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
            Pedidos Internos
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
            <span style={{ color: '#FFFFFF' }}>Pedidos Internos</span>
          </p>
        </div>
      </section>

      <main className="dashboard-container">
        <div className="dashboard-header-actions">
          <h2>Lista de pedidos</h2>
          <div className="header-actions">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por cliente o número de pedido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <Link to={`${routePaths.backOffice.orders}/nuevo`} className="btn-primary">
              <FaPlus /> Nuevo pedido
            </Link>
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-label">
            <FaFilter /> Filtrar por estado:
          </div>
          <div className="filter-options">
            {statusOptions.map((status) => (
              <button
                key={status}
                className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                onClick={() => handleStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="table-responsive">
            <table className="dashboard-table orders-table">
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Productos</th>
                  <th>Pago</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">{order.id}</td>
                      <td>
                        <div className="customer-info">
                          <span className="customer-name">{order.customer}</span>
                          <span className="customer-email">{order.email}</span>
                        </div>
                      </td>
                      <td>{order.date}</td>
                      <td className="order-total">${order.total.toLocaleString('es-MX')}</td>
                      <td>{order.items}</td>
                      <td>{order.payment}</td>
                      <td>
                        <span
                          className="order-status"
                          style={{
                            backgroundColor: getStatusBg(order.status),
                            color: getStatusColor(order.status),
                          }}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <Link
                            to={`${routePaths.backOffice.orderDetail.replace(':orderId', order.id.replace('#', ''))}`}
                            className="btn-view"
                          >
                            <FaEye /> Ver
                          </Link>
                          <Link
                            to={`${routePaths.backOffice.orderDetail.replace(':orderId', order.id.replace('#', ''))}/editar`}
                            className="btn-edit"
                          >
                            <FaEdit /> Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      <FaExclamationTriangle size={32} color="#D28B00" />
                      <p>No se encontraron pedidos</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredOrders.length > ordersPerPage && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span className="pagination-info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        <div className="dashboard-stats-summary">
          <div className="stat-summary-card">
            <span className="stat-summary-label">Total de pedidos</span>
            <span className="stat-summary-value">{orders.length}</span>
          </div>
          <div className="stat-summary-card">
            <span className="stat-summary-label">Pendientes</span>
            <span className="stat-summary-value" style={{ color: '#ED6C02' }}>
              {orders.filter((o) => o.status === 'Pendiente').length}
            </span>
          </div>
          <div className="stat-summary-card">
            <span className="stat-summary-label">En proceso</span>
            <span className="stat-summary-value" style={{ color: '#0288D1' }}>
              {orders.filter((o) => o.status === 'Preparando' || o.status === 'Confirmado').length}
            </span>
          </div>
          <div className="stat-summary-card">
            <span className="stat-summary-label">Entregados</span>
            <span className="stat-summary-value" style={{ color: '#4CAF50' }}>
              {orders.filter((o) => o.status === 'Entregado').length}
            </span>
          </div>
          <div className="stat-summary-card">
            <span className="stat-summary-label">Cancelados</span>
            <span className="stat-summary-value" style={{ color: '#D32F2F' }}>
              {orders.filter((o) => o.status === 'Cancelado').length}
            </span>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}