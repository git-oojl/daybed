import React, { useState } from "react";
import "../../assets/home-page.css";
import "../../assets/order-detail-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { Link } from "react-router-dom";
import { routePaths } from "../../routes/routePaths.js";

// Importar imágenes de la tienda
import SyltherineDaybed from "../../assets/SyltherineDaybed.jpg";
import LeviosaDaybed from "../../assets/LeviosaDaybed.jpg";
import LolitoDaybed from "../../assets/LolitoDaybed.jpg";
import RespiraDaybed from "../../assets/RespiraDaybed.jpg";

function MyOrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Órdenes con productos de la tienda
  const orders = [
    {
      id: "ORD-2024-001",
      date: "15 de diciembre, 2024",
      status: "completed",
      statusText: "Entregado",
      total: 9500000,
      subtotal: 9000000,
      shipping: 500000,
      items: [
        {
          id: 1,
          name: "Syltherine",
          description: "Mesa de estilo café",
          quantity: 2,
          price: 2500000,
          image: SyltherineDaybed,
        },
        {
          id: 4,
          name: "Respira",
          description: "Set bar exterior",
          quantity: 1,
          price: 5000000,
          image: RespiraDaybed,
        },
      ],
      address: {
        street: "Av. Reforma 123",
        city: "Ciudad de México",
        state: "CDMX",
        zip: "06600",
        country: "México",
      },
      customer: {
        name: "Ana Martínez",
        email: "ana.martinez@email.com",
        phone: "5512345678",
      },
    },
    {
      id: "ORD-2024-002",
      date: "10 de diciembre, 2024",
      status: "pending",
      statusText: "En proceso",
      total: 2500000,
      subtotal: 2500000,
      shipping: 0,
      items: [
        {
          id: 2,
          name: "Leviosa",
          description: "Silla de estilo café",
          quantity: 1,
          price: 2500000,
          image: LeviosaDaybed,
        },
      ],
      address: {
        street: "Calle Independencia 456",
        city: "Guadalajara",
        state: "Jalisco",
        zip: "44100",
        country: "México",
      },
      customer: {
        name: "Carlos López",
        email: "carlos.lopez@email.com",
        phone: "3312345678",
      },
    },
    {
      id: "ORD-2024-003",
      date: "5 de diciembre, 2024",
      status: "cancelled",
      statusText: "Cancelado",
      total: 7000000,
      subtotal: 7000000,
      shipping: 0,
      items: [
        {
          id: 3,
          name: "Lolito",
          description: "Sofá grande",
          quantity: 1,
          price: 7000000,
          image: LolitoDaybed,
        },
      ],
      address: {
        street: "Boulevard Insurgentes 789",
        city: "Monterrey",
        state: "Nuevo León",
        zip: "64700",
        country: "México",
      },
      customer: {
        name: "María Fernández",
        email: "maria.fernandez@email.com",
        phone: "8112345678",
      },
    },
  ];

  const formatPrice = (price) => {
    return `$${price.toLocaleString("es-MX")} MX`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "orders-status--pending";
      case "completed":
        return "orders-status--completed";
      case "cancelled":
        return "orders-status--cancelled";
      default:
        return "";
    }
  };

  const toggleExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  return (
    <div className="home-page orders-page">
      <HomeHeader />

      {/* Hero Section */}
      <section
        className="orders-hero"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80")',
        }}
      >
        <div className="orders-hero__overlay">
          <h1 className="orders-hero__title">Mis pedidos</h1>
          <p className="orders-hero__breadcrumb">
            <Link to={routePaths.public.home}>Inicio</Link>
            <span aria-hidden="true">&gt;</span>
            <span>Mis pedidos</span>
          </p>
        </div>
      </section>

      <main className="orders-main">
        <div className="orders-toolbar">
          <div className="orders-search">
            <span className="orders-search__icon">🔍</span>
            <input
              type="text"
              className="orders-search__input"
              placeholder="Buscar pedido por número o producto..."
            />
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <p className="orders-empty__message">
              No tienes pedidos realizados
            </p>
            <Link to={routePaths.public.catalog} className="orders-empty__btn">
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr
                      className="orders-table__row"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <td data-label="Pedido" className="orders-table__order">
                        {order.id}
                      </td>
                      <td data-label="Fecha">{order.date}</td>
                      <td data-label="Total">{formatPrice(order.total)}</td>
                      <td data-label="Estado">
                        <span
                          className={`orders-status ${getStatusClass(order.status)}`}
                        >
                          {order.statusText}
                        </span>
                      </td>
                      <td data-label="Detalles">
                        <button
                          className="orders-expand-btn"
                          aria-label="Ver detalles del pedido"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(order.id);
                          }}
                        >
                          {expandedOrder === order.id ? "−" : "+"}
                        </button>
                      </td>
                    </tr>
                    {expandedOrder === order.id && (
                      <tr className="orders-detail-row">
                        <td colSpan="5">
                          <div className="orders-detail-box">
                            <div className="orders-detail-grid">
                              <div className="orders-detail-section">
                                <h4 className="orders-detail__header">
                                  Productos
                                </h4>
                                <div className="orders-detail__content">
                                  {order.items.map((item) => (
                                    <div
                                      className="orders-detail__product"
                                      key={item.id}
                                    >
                                      <div className="orders-detail__product-info">
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="orders-detail__product-image"
                                        />
                                        <div>
                                          <span className="orders-detail__product-name">
                                            {item.name}
                                          </span>
                                          <span className="orders-detail__product-desc">
                                            {item.description}
                                          </span>
                                          <span className="orders-detail__product-qty">
                                            × {item.quantity}
                                          </span>
                                        </div>
                                      </div>
                                      <span className="orders-detail__product-price">
                                        {formatPrice(
                                          item.price * item.quantity,
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="orders-detail-section">
                                <h4 className="orders-detail__header">
                                  Información
                                </h4>
                                <div className="orders-detail__content">
                                  <div className="orders-detail__item">
                                    <span className="orders-detail__label">
                                      Número de pedido
                                    </span>
                                    <span className="orders-detail__value">
                                      {order.id}
                                    </span>
                                  </div>
                                  <div className="orders-detail__item">
                                    <span className="orders-detail__label">
                                      Fecha
                                    </span>
                                    <span className="orders-detail__value">
                                      {order.date}
                                    </span>
                                  </div>
                                  <div className="orders-detail__item">
                                    <span className="orders-detail__label">
                                      Estado
                                    </span>
                                    <span
                                      className={`orders-status ${getStatusClass(order.status)}`}
                                    >
                                      {order.statusText}
                                    </span>
                                  </div>
                                  <div className="orders-detail__item">
                                    <span className="orders-detail__label">
                                      Dirección de entrega
                                    </span>
                                    <span className="orders-detail__value">
                                      {order.address.street}
                                      <br />
                                      {order.address.city},{" "}
                                      {order.address.state}
                                      <br />
                                      CP {order.address.zip}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="orders-detail-section">
                                <h4 className="orders-detail__header">Total</h4>
                                <div className="orders-detail__content">
                                  <div className="orders-detail__total">
                                    <div className="orders-detail__total-row">
                                      <span>Subtotal</span>
                                      <span>{formatPrice(order.subtotal)}</span>
                                    </div>
                                    <div className="orders-detail__total-row">
                                      <span>Envío</span>
                                      <span>
                                        {order.shipping > 0
                                          ? formatPrice(order.shipping)
                                          : "Gratis"}
                                      </span>
                                    </div>
                                    <div className="orders-detail__total-row orders-detail__total-final">
                                      <span>Total</span>
                                      <span>{formatPrice(order.total)}</span>
                                    </div>
                                  </div>
                                  <Link
                                    to={routePaths.account.orderDetail.replace(
                                      ":orderId",
                                      order.id,
                                    )}
                                    className="orders-detail__view-btn"
                                  >
                                    Ver detalle completo
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}

export default MyOrdersPage;
