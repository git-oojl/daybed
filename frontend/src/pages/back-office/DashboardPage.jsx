// DashboardPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/dashboard-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import {
  FaShoppingBag,
  FaDollarSign,
  FaChair,
  FaTags,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBoxOpen,
  FaClipboardList,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function DashboardPage() {
  const stats = [
    { title: "Pedidos", value: 174, icon: <FaShoppingBag size={28} color="#8B5E3C" /> },
    { title: "Ventas", value: "$54,320", icon: <FaDollarSign size={28} color="#4CAF50" /> },
    { title: "Productos", value: 83, icon: <FaChair size={28} color="#D28B00" /> },
    { title: "Categorías", value: 12, icon: <FaTags size={28} color="#6A5ACD" /> },
  ];

  const recentOrders = [
    { id: "#001", customer: "Ana García", total: "$4,200", status: "Entregado" },
    { id: "#002", customer: "Luis Pérez", total: "$8,999", status: "Preparando" },
    { id: "#003", customer: "María López", total: "$2,800", status: "Pendiente" },
  ];

  const lowStock = ["Sofá Esquinero", "Mesa de Centro", "Buró Moderno", "Silla Nórdica"];

  const recentActivity = [
    "Nuevo pedido registrado hace 5 minutos.",
    "Inventario actualizado correctamente.",
    'Producto "Sofá Esquinero" modificado.',
    "Nueva categoría agregada.",
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Entregado":
        return "#2E7D32";
      case "Preparando":
        return "#C28C29";
      case "Pendiente":
        return "#D32F2F";
      default:
        return "#666";
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "Entregado":
        return "#E8F5E9";
      case "Preparando":
        return "#FFF8E1";
      case "Pendiente":
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
        aria-label="Dashboard"
        style={{
          backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKvg7iJf912elv6kvZjoKR6OIqwxmSiY5v8BnfgQFCsA&s=10')`,
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
            Dashboard
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
            <span style={{ color: '#FFFFFF' }}>Dashboard</span>
          </p>
        </div>
      </section>

      <main className="dashboard-container">
        <div className="dashboard-stats">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.title}>
              <div className="stat-card__icon">{stat.icon}</div>
              <div className="stat-card__content">
                <span className="stat-card__title">{stat.title}</span>
                <span className="stat-card__value">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card orders-card">
            <div className="dashboard-card__header">
              <h2>Pedidos recientes</h2>
              <Link to={routePaths.backOffice.orders} className="dashboard-card__link">
                Ver todos →
              </Link>
            </div>

            <div className="orders-list">
              {recentOrders.map((order) => (
                <div className="order-item" key={order.id}>
                  <span className="order-item__id">{order.id}</span>
                  <span className="order-item__customer">{order.customer}</span>
                  <span className="order-item__total">{order.total}</span>
                  <span
                    className="order-item__status"
                    style={{
                      backgroundColor: getStatusBg(order.status),
                      color: getStatusColor(order.status),
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card stock-card">
            <div className="dashboard-card__header">
              <h2>Stock bajo</h2>
              <Link to={routePaths.backOffice.inventory} className="dashboard-card__link">
                Ver inventario →
              </Link>
            </div>

            <div className="stock-list">
              {lowStock.map((item) => (
                <div className="stock-item" key={item}>
                  <span className="stock-item__icon"><FaExclamationTriangle color="#D32F2F" size={16} /></span>
                  <span className="stock-item__name">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card actions-card">
            <div className="dashboard-card__header">
              <h2>Acciones rápidas</h2>
            </div>

            <div className="actions-grid">
              <Link to={routePaths.backOffice.products} className="action-btn primary">
                <FaClipboardList /> Productos
              </Link>
              <Link to={routePaths.backOffice.categories} className="action-btn primary">
                <FaTags /> Categorías
              </Link>
              <Link to={routePaths.backOffice.inventory} className="action-btn secondary">
                <FaBoxOpen /> Inventario
              </Link>
              <Link to={routePaths.backOffice.orders} className="action-btn secondary">
                <FaClipboardList /> Pedidos
              </Link>
            </div>
          </div>

          <div className="dashboard-card activity-card">
            <div className="dashboard-card__header">
              <h2>Actividad reciente</h2>
            </div>

            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div className="activity-item" key={index}>
                  {activity}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}