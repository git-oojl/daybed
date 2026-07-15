// InternalOrdersPage.jsx
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
  FaFilter,
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
      id: "#DayBed-001",
      customer: "Juan López",
      email: "juan@email.com",
      date: "10/06/2026",
      total: 4500,
      status: "Pendiente",
      items: 2,
      payment: "Tarjeta",
      delivery: "Calle 123, Tijuana",
    },
    {
      id: "#DayBed-002",
      customer: "María del Mar",
      email: "maria@email.com",
      date: "12/06/2026",
      total: 8999,
      status: "Completado",
      items: 3,
      payment: "Efectivo",
      delivery: "Av. Reforma 456, Mexicali",
    },
    {
      id: "#DayBed-003",
      customer: "Carlos Martínez",
      email: "carlos@email.com",
      date: "20/06/2026",
      total: 2499,
      status: "Cancelado",
      items: 1,
      payment: "Transferencia",
      delivery: "Blvd. Cucapah 789, Tijuana",
    },
    {
      id: "#DayBed-004",
      customer: "Guadalupe Sánchez",
      email: "guadalupe@email.com",
      date: "05/06/2026",
      total: 12499,
      status: "Completado",
      items: 4,
      payment: "Tarjeta",
      delivery: "Calle 456, Ensenada",
    },
    {
      id: "#DayBed-005",
      customer: "Marisol Flores",
      email: "marisol@email.com",
      date: "25/06/2026",
      total: 5999,
      status: "Pendiente",
      items: 2,
      payment: "Efectivo",
      delivery: "Av. López Mateos 789, Tijuana",
    },
  ]);

  const statusOptions = ["Todos", "Pendiente", "Completado", "Cancelado"];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pendiente":
        return <FaClock size={14} />;
      case "Completado":
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
      case "Completado":
        return "#2E7D32";
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
      case "Completado":
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
    const matchesFilter =
      filterStatus === "Todos" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder,
  );
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
          backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80')`,
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
            Pedidos Internos
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
            <span style={{ color: "#FFFFFF" }}>Pedidos Internos</span>
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
            Lista de pedidos
          </h2>
          <div
            className="header-actions"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <div
              className="search-box"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                background: "#FFFFFF",
                border: "1px solid #E8DCCC",
                borderRadius: "8px",
                padding: "0 12px",
                minWidth: "clamp(200px, 25vw, 300px)",
              }}
            >
              <FaSearch
                className="search-icon"
                style={{ color: "#999", fontSize: "16px", marginRight: "8px" }}
              />
              <input
                type="text"
                placeholder="Buscar por cliente o número de pedido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  padding: "10px 0",
                  fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                  background: "transparent",
                  width: "100%",
                  outline: "none",
                  color: "#333",
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="filter-section"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            marginBottom: "24px",
            padding: "12px 16px",
            background: "#FDF8F0",
            border: "1px solid #E8DCCC",
            borderRadius: "12px",
          }}
        >
          <div
            className="filter-label"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#6B4A2B",
              fontWeight: 600,
              fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
            }}
          >
            <FaFilter /> Filtrar por estado:
          </div>
          <div
            className="filter-options"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {statusOptions.map((status) => (
              <button
                key={status}
                className={`filter-btn ${filterStatus === status ? "active" : ""}`}
                onClick={() => handleStatusFilter(status)}
                style={{
                  padding: "6px 16px",
                  border: `1px solid ${filterStatus === status ? "#8B5E3C" : "#E8DCCC"}`,
                  borderRadius: "20px",
                  background: filterStatus === status ? "#8B5E3C" : "#FFFFFF",
                  color: filterStatus === status ? "#FFFFFF" : "#7A6B5A",
                  fontSize: "clamp(0.75rem, 0.85vw, 0.85rem)",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (filterStatus !== status) {
                    e.currentTarget.style.background = "#F5F0E8";
                    e.currentTarget.style.borderColor = "#8B5E3C";
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterStatus !== status) {
                    e.currentTarget.style.background = "#FFFFFF";
                    e.currentTarget.style.borderColor = "#E8DCCC";
                  }
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

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
              className="dashboard-table orders-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "800px",
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
                    Pedido
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
                    Estado
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
                    Número de pedido
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
                    Fecha
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
                    Cliente
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
                    Total
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
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <tr
                      key={order.id}
                      style={{ borderBottom: "1px solid #F0EBE3" }}
                    >
                      <td
                        className="order-id"
                        style={{
                          padding: "12px 10px",
                          fontWeight: 600,
                          color: "#8B5E3C",
                          fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                        }}
                      >
                        {order.id}
                      </td>
                      <td style={{ padding: "12px 10px" }}>
                        <span
                          className="order-status"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 14px",
                            borderRadius: "20px",
                            fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                            fontWeight: 600,
                            background: getStatusBg(order.status),
                            color: getStatusColor(order.status),
                          }}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 10px",
                          fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                        }}
                      >
                        {order.id.replace("#DayBed-", "")}
                      </td>
                      <td
                        style={{
                          padding: "12px 10px",
                          fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                        }}
                      >
                        {order.date}
                      </td>
                      <td
                        style={{
                          padding: "12px 10px",
                          fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                        }}
                      >
                        {order.customer}
                      </td>
                      <td
                        className="order-total"
                        style={{
                          padding: "12px 10px",
                          textAlign: "center",
                          fontWeight: 600,
                          color: "#5C2E0B",
                          fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                        }}
                      >
                        ${order.total.toLocaleString("es-MX")}
                      </td>
                      <td style={{ textAlign: "center", padding: "12px 10px" }}>
                        <Link
                          to={`/interno/pedidos/${order.id.replace("#DayBed-", "")}`}
                          className="btn-view"
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
                            textDecoration: "none",
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
                          <FaEye size={14} /> Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="empty-state"
                      style={{ textAlign: "center", padding: "40px 20px" }}
                    >
                      <div style={{ color: "#D28B00", fontSize: "32px" }}>
                        <FaExclamationTriangle />
                      </div>
                      <p
                        style={{
                          color: "#7A6B5A",
                          marginTop: "12px",
                          fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
                        }}
                      >
                        No se encontraron pedidos
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredOrders.length > ordersPerPage && (
            <div
              className="pagination"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "16px",
                paddingTop: "20px",
                borderTop: "1px solid #E8DCCC",
                marginTop: "16px",
              }}
            >
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 20px",
                  border: "1px solid #E8DCCC",
                  borderRadius: "6px",
                  background: "#FFFFFF",
                  color: "#6B4A2B",
                  fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                  fontWeight: 500,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.background = "#8B5E3C";
                    e.currentTarget.style.color = "#FFFFFF";
                    e.currentTarget.style.borderColor = "#8B5E3C";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.background = "#FFFFFF";
                    e.currentTarget.style.color = "#6B4A2B";
                    e.currentTarget.style.borderColor = "#E8DCCC";
                  }
                }}
              >
                Anterior
              </button>
              <span
                className="pagination-info"
                style={{
                  color: "#7A6B5A",
                  fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                }}
              >
                Página {currentPage} de {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 20px",
                  border: "1px solid #E8DCCC",
                  borderRadius: "6px",
                  background: "#FFFFFF",
                  color: "#6B4A2B",
                  fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                  fontWeight: 500,
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.background = "#8B5E3C";
                    e.currentTarget.style.color = "#FFFFFF";
                    e.currentTarget.style.borderColor = "#8B5E3C";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.background = "#FFFFFF";
                    e.currentTarget.style.color = "#6B4A2B";
                    e.currentTarget.style.borderColor = "#E8DCCC";
                  }
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        <div
          className="dashboard-stats-summary"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <div
            className="stat-summary-card"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E8DCCC",
              borderRadius: "12px",
              padding: "14px 16px",
              textAlign: "center",
            }}
          >
            <span
              className="stat-summary-label"
              style={{
                display: "block",
                fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                color: "#7A6B5A",
                fontWeight: 500,
              }}
            >
              Total
            </span>
            <span
              className="stat-summary-value"
              style={{
                display: "block",
                fontSize: "clamp(1.3rem, 1.8vw, 1.8rem)",
                fontWeight: 700,
                color: "#6B4A2B",
                marginTop: "4px",
              }}
            >
              {orders.length}
            </span>
          </div>
          <div
            className="stat-summary-card"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E8DCCC",
              borderRadius: "12px",
              padding: "14px 16px",
              textAlign: "center",
            }}
          >
            <span
              className="stat-summary-label"
              style={{
                display: "block",
                fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                color: "#7A6B5A",
                fontWeight: 500,
              }}
            >
              Pendientes
            </span>
            <span
              className="stat-summary-value"
              style={{
                display: "block",
                fontSize: "clamp(1.3rem, 1.8vw, 1.8rem)",
                fontWeight: 700,
                color: "#ED6C02",
                marginTop: "4px",
              }}
            >
              {orders.filter((o) => o.status === "Pendiente").length}
            </span>
          </div>
          <div
            className="stat-summary-card"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E8DCCC",
              borderRadius: "12px",
              padding: "14px 16px",
              textAlign: "center",
            }}
          >
            <span
              className="stat-summary-label"
              style={{
                display: "block",
                fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                color: "#7A6B5A",
                fontWeight: 500,
              }}
            >
              Completados
            </span>
            <span
              className="stat-summary-value"
              style={{
                display: "block",
                fontSize: "clamp(1.3rem, 1.8vw, 1.8rem)",
                fontWeight: 700,
                color: "#2E7D32",
                marginTop: "4px",
              }}
            >
              {orders.filter((o) => o.status === "Completado").length}
            </span>
          </div>
          <div
            className="stat-summary-card"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E8DCCC",
              borderRadius: "12px",
              padding: "14px 16px",
              textAlign: "center",
            }}
          >
            <span
              className="stat-summary-label"
              style={{
                display: "block",
                fontSize: "clamp(0.7rem, 0.85vw, 0.8rem)",
                color: "#7A6B5A",
                fontWeight: 500,
              }}
            >
              Cancelados
            </span>
            <span
              className="stat-summary-value"
              style={{
                display: "block",
                fontSize: "clamp(1.3rem, 1.8vw, 1.8rem)",
                fontWeight: 700,
                color: "#D32F2F",
                marginTop: "4px",
              }}
            >
              {orders.filter((o) => o.status === "Cancelado").length}
            </span>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
