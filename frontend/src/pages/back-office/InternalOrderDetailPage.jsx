import { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import {
  FaUser,
  FaBox,
  FaTruck,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClipboardList,
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus,
  FaMinus,
} from "react-icons/fa";

export default function InternalOrderDetailPage() {
  const [orderStatus, setOrderStatus] = useState("Pendiente");
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  const orderData = {
    id: "#DayBed-001",
    customer: "Juan López",
    email: "juanlopez@gmail.com",
    phone: "(664) 7837-455-45",
    address: "Blvd. Cucapah 20100-Sur, Col. El Lago, CP 22210, Tijuana, B.C.",
    deliveryType: "Standard",
    distance: "17 km",
    estimatedCost: 350,
    total: 10000,
    status: "Pendiente",
    items: [
      { name: "Sofá Esquinero", sku: "DD73844", quantity: 1, price: 6000 },
      { name: "Mesa de Centro", sku: "DD83482", quantity: 1, price: 4000 },
    ],
  };

  const statusOptions = [
    "Pendiente",
    "Confirmado",
    "Preparando",
    "Enviado",
    "Entregado",
    "Cancelado",
  ];

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

  return (
    <div className="home-page dashboard-page">
      <HomeHeader />

      <section
        className="dashboard-hero"
        aria-label="Detalle de Pedido"
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
            Detalle de Pedido
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
              to={routePaths.backOffice.orders}
              style={{ color: "#FFD700", textDecoration: "none" }}
            >
              Pedidos Internos
            </Link>
            <span
              aria-hidden="true"
              style={{ margin: "0 8px", color: "#F5EDE5" }}
            >
              &gt;
            </span>
            <span style={{ color: "#FFFFFF" }}>Detalle</span>
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
            {orderData.id} - {orderData.customer}
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
            <Link
              to={routePaths.backOffice.orders}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                background: "#6A5ACD",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                cursor: "pointer",
                textDecoration: "none",
                fontWeight: 600,
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#5A4ABD")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#6A5ACD")
              }
            >
              <FaTimes /> Volver a pedidos
            </Link>
          </div>
        </div>

        <div
          className="dashboard-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          {/* Información del cliente */}
          <div
            className="dashboard-card"
            style={{
              padding: "24px",
              background: "#FDF8F0",
              border: "1px solid #E8DCCC",
              borderRadius: "16px",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "clamp(1.1rem, 1.5vw, 1.2rem)",
                color: "#8B5E3C",
                margin: "0 0 16px 0",
              }}
            >
              <FaUser /> Información del cliente
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div>
                <span style={{ color: "#7A6B5A", fontSize: "0.85rem" }}>
                  Nombre
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontWeight: 500,
                    fontSize: "clamp(0.95rem, 1.1vw, 1rem)",
                  }}
                >
                  {orderData.customer}
                </p>
              </div>
              <div>
                <span style={{ color: "#7A6B5A", fontSize: "0.85rem" }}>
                  Email
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "clamp(0.9rem, 1vw, 1rem)",
                  }}
                >
                  {orderData.email}
                </p>
              </div>
              <div>
                <span style={{ color: "#7A6B5A", fontSize: "0.85rem" }}>
                  Teléfono
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "clamp(0.9rem, 1vw, 1rem)",
                  }}
                >
                  {orderData.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Datos de entrega */}
          <div
            className="dashboard-card"
            style={{
              padding: "24px",
              background: "#FDF8F0",
              border: "1px solid #E8DCCC",
              borderRadius: "16px",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "clamp(1.1rem, 1.5vw, 1.2rem)",
                color: "#8B5E3C",
                margin: "0 0 16px 0",
              }}
            >
              <FaTruck /> Datos de entrega
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div>
                <span style={{ color: "#7A6B5A", fontSize: "0.85rem" }}>
                  Tipo de entrega
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontWeight: 500,
                    fontSize: "clamp(0.95rem, 1.1vw, 1rem)",
                  }}
                >
                  {orderData.deliveryType}
                </p>
              </div>
              <div>
                <span style={{ color: "#7A6B5A", fontSize: "0.85rem" }}>
                  Dirección
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "clamp(0.9rem, 1vw, 1rem)",
                  }}
                >
                  {orderData.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="dashboard-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          {/* Estimación de distancia y costo */}
          <div
            className="dashboard-card"
            style={{
              padding: "24px",
              background: "#FDF8F0",
              border: "1px solid #E8DCCC",
              borderRadius: "16px",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "clamp(1.1rem, 1.5vw, 1.2rem)",
                color: "#8B5E3C",
                margin: "0 0 16px 0",
              }}
            >
              <FaMapMarkerAlt /> Estimación de distancia y costo
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div>
                <span style={{ color: "#7A6B5A", fontSize: "0.85rem" }}>
                  Distancia Estimada
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontWeight: 500,
                    fontSize: "clamp(0.95rem, 1.1vw, 1rem)",
                  }}
                >
                  {orderData.distance}
                </p>
              </div>
              <div>
                <span style={{ color: "#7A6B5A", fontSize: "0.85rem" }}>
                  Costo Estimado
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontWeight: 700,
                    color: "#8B5E3C",
                    fontSize: "clamp(1rem, 1.2vw, 1.1rem)",
                  }}
                >
                  ${orderData.estimatedCost.toFixed(2)} MXN
                </p>
              </div>
            </div>
          </div>

          {/* Cambio de estado del pedido */}
          <div
            className="dashboard-card"
            style={{
              padding: "24px",
              background: "#FDF8F0",
              border: "1px solid #E8DCCC",
              borderRadius: "16px",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "clamp(1.1rem, 1.5vw, 1.2rem)",
                color: "#8B5E3C",
                margin: "0 0 16px 0",
              }}
            >
              <FaClipboardList /> Cambio de estado del pedido
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div>
                <span style={{ color: "#7A6B5A", fontSize: "0.85rem" }}>
                  Estado actual
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    display: "inline-block",
                    padding: "4px 16px",
                    borderRadius: "20px",
                    fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                    fontWeight: 600,
                    background: getStatusBg(orderStatus),
                    color: getStatusColor(orderStatus),
                  }}
                >
                  {orderStatus}
                </p>
              </div>
              <div>
                <span style={{ color: "#7A6B5A", fontSize: "0.85rem" }}>
                  Cambiar estado
                </span>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    marginTop: "4px",
                    border: "2px solid #E8DCCC",
                    borderRadius: "10px",
                    fontSize: "clamp(0.9rem, 1vw, 1rem)",
                    background: "#FFFFFF",
                    outline: "none",
                    cursor: "pointer",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#8B5E3C")}
                  onBlur={(e) => (e.target.style.borderColor = "#E8DCCC")}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => alert(`Estado actualizado a: ${orderStatus}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#8B5E3C",
                  color: "#FFFFFF",
                  fontSize: "clamp(0.9rem, 1vw, 1rem)",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                  marginTop: "4px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#6B4A2B")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#8B5E3C")
                }
              >
                <FaSave /> Actualizar estado
              </button>
            </div>
          </div>
        </div>

        {/* Productos del pedido */}
        <div
          className="dashboard-card"
          style={{
            padding: "24px",
            background: "#FDF8F0",
            border: "1px solid #E8DCCC",
            borderRadius: "16px",
            marginBottom: "24px",
            overflowX: "auto",
          }}
        >
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "clamp(1.1rem, 1.5vw, 1.2rem)",
              color: "#8B5E3C",
              margin: "0 0 16px 0",
            }}
          >
            <FaBox /> Productos del pedido
          </h3>
          <div className="table-responsive">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "500px",
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
                    Cantidad
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "12px 10px",
                      color: "#6B4A2B",
                      fontWeight: 700,
                      fontSize: "clamp(0.8rem, 1vw, 0.9rem)",
                    }}
                  >
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderData.items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #F0EBE3" }}>
                    <td
                      style={{
                        padding: "12px 10px",
                        fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                        fontWeight: 500,
                      }}
                    >
                      {item.name}
                    </td>
                    <td
                      style={{
                        padding: "12px 10px",
                        fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                      }}
                    >
                      {item.sku}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        padding: "12px 10px",
                        fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                      }}
                    >
                      {item.quantity}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: "12px 10px",
                        fontWeight: 600,
                        color: "#5C2E0B",
                        fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                      }}
                    >
                      ${(item.price * item.quantity).toFixed(2)} MXN
                    </td>
                  </tr>
                ))}
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      textAlign: "right",
                      padding: "16px 10px",
                      fontWeight: 700,
                      fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)",
                      color: "#6B4A2B",
                    }}
                  >
                    Total
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      padding: "16px 10px",
                      fontWeight: 700,
                      color: "#8B5E3C",
                      fontSize: "clamp(1rem, 1.2vw, 1.1rem)",
                    }}
                  >
                    ${orderData.total.toFixed(2)} MXN
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notas internas opcionales */}
        <div
          className="dashboard-card"
          style={{
            padding: "24px",
            background: "#FDF8F0",
            border: "1px solid #E8DCCC",
            borderRadius: "16px",
          }}
        >
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "clamp(1.1rem, 1.5vw, 1.2rem)",
              color: "#8B5E3C",
              margin: "0 0 16px 0",
            }}
          >
            <FaEdit /> Notas internas opcionales
          </h3>
          {!showNoteInput ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p style={{ color: "#7A6B5A", margin: 0 }}>
                {note || "No hay notas para este pedido"}
              </p>
              <button
                onClick={() => setShowNoteInput(true)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #8B5E3C",
                  borderRadius: "8px",
                  background: "transparent",
                  color: "#8B5E3C",
                  cursor: "pointer",
                  fontSize: "clamp(0.8rem, 0.9vw, 0.85rem)",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#8B5E3C";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#8B5E3C";
                }}
              >
                Agregar nota
              </button>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Escribe una nota sobre el producto o el pedido..."
                rows="3"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #E8DCCC",
                  borderRadius: "10px",
                  fontSize: "clamp(0.9rem, 1vw, 1rem)",
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                  background: "#FFFFFF",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#8B5E3C")}
                onBlur={(e) => (e.target.style.borderColor = "#E8DCCC")}
              />
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => {
                    setShowNoteInput(false);
                    if (!note) setNote("No hay notas para este pedido");
                  }}
                  style={{
                    padding: "8px 20px",
                    border: "1px solid #E8DCCC",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                    color: "#666",
                    cursor: "pointer",
                    fontSize: "clamp(0.8rem, 0.9vw, 0.85rem)",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F5F5F5")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#FFFFFF")
                  }
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowNoteInput(false);
                    alert("Nota guardada correctamente");
                  }}
                  style={{
                    padding: "8px 20px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#8B5E3C",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    fontSize: "clamp(0.8rem, 0.9vw, 0.85rem)",
                    fontWeight: 600,
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#6B4A2B")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#8B5E3C")
                  }
                >
                  Guardar nota
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
