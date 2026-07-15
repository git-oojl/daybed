// ProfilePage.jsx
import { useState } from "react";
import "../../assets/home-page.css";
import "../../assets/CSS/account/profile-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";

// ============================================
// ICONOS SVG
// ============================================
function IconUser() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM3 20.5a9 9 0 0 1 18 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m22 6-10 7L2 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 21s-7-4.5-7-10a7 7 0 1 1 14 0c0 5.5-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 20h9M16.5 3.5l4 4L7 21l-5 1 1-5L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12l5 5L20 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 7h16M9 7V5h6v2M10 11v6M14 11v6M6 7l1 12h10l1-12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Datos del perfil
  const [profile, setProfile] = useState({
    name: "Ana Martínez",
    email: "ana.martinez@email.com",
    phone: "+52 55 1234 5678",
  });

  // Direcciones guardadas
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "Casa",
      street: "Av. Reforma 456",
      colony: "Col. Juárez",
      city: "Ciudad de México",
      state: "CDMX",
      zipCode: "06600",
      isDefault: true,
    },
    {
      id: 2,
      name: "Oficina",
      street: "Blvd. Adolfo López Mateos 123",
      colony: "Col. Polanco",
      city: "Ciudad de México",
      state: "CDMX",
      zipCode: "11560",
      isDefault: false,
    },
  ]);

  // Nueva dirección (formulario)
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    colony: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  });

  // Manejar cambios en el perfil
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en nueva dirección
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Guardar perfil
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setEditing(false);
    setSuccessMessage("Perfil actualizado exitosamente");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Agregar dirección
  const handleAddAddress = (e) => {
    e.preventDefault();
    const newAddr = {
      id: Date.now(),
      ...newAddress,
    };
    setAddresses((prev) => [...prev, newAddr]);
    setShowAddAddress(false);
    setNewAddress({
      name: "",
      street: "",
      colony: "",
      city: "",
      state: "",
      zipCode: "",
      isDefault: false,
    });
    setSuccessMessage("Dirección agregada exitosamente");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Eliminar dirección
  const handleDeleteAddress = (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta dirección?")) {
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      setSuccessMessage("Dirección eliminada");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Establecer dirección como predeterminada
  const handleSetDefault = (id) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    );
  };

  // Cerrar sesión
  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      console.log("Cerrando sesión...");
      window.location.href = "/login";
    }
  };

  return (
    <div className="home-page profile-page">
      <HomeHeader />

      {/* HERO */}
      <section className="checkout-hero" aria-label="Resumen de pedido">
        <div className="checkout-hero__overlay">
          <h1 className="checkout-hero__title">Mi perfil</h1>
        </div>
      </section>

      <main className="profile-container">
        {/* MENSAJE DE ÉXITO */}
        {successMessage && (
          <div className="profile__alert profile__alert--success">
            <IconCheck />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="profile-grid">
          {/* ===== INFORMACIÓN PERSONAL ===== */}
          <section className="profile-card" aria-labelledby="profile-personal">
            <div className="profile-card__header">
              <div className="profile-card__header-left">
                <div className="profile-card__icon">
                  <IconUser />
                </div>
                <div>
                  <h2 id="profile-personal" className="profile-card__title">
                    Información personal
                  </h2>
                  <p className="profile-card__desc">
                    Tus datos personales y de contacto
                  </p>
                </div>
              </div>
              {!editing && (
                <button
                  className="profile-card__edit-btn"
                  onClick={() => setEditing(true)}
                >
                  <IconEdit />
                  Editar
                </button>
              )}
            </div>

            <div className="profile-card__body">
              {editing ? (
                <form onSubmit={handleSaveProfile} className="profile-form">
                  <div className="profile-form__group">
                    <label htmlFor="name">Nombre completo</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      placeholder="Ana Martínez"
                      required
                    />
                  </div>

                  <div className="profile-form__group">
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      placeholder="ana@email.com"
                      required
                    />
                  </div>

                  <div className="profile-form__group">
                    <label htmlFor="phone">Teléfono</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      placeholder="+52 55 1234 5678"
                      required
                    />
                  </div>

                  <div className="profile-form__actions">
                    <button
                      type="button"
                      className="profile-form__btn profile-form__btn--secondary"
                      onClick={() => setEditing(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="profile-form__btn profile-form__btn--primary"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <div className="profile-info__item">
                    <span className="profile-info__label">Nombre</span>
                    <span className="profile-info__value">{profile.name}</span>
                  </div>
                  <div className="profile-info__item">
                    <span className="profile-info__label">
                      Correo electrónico
                    </span>
                    <span className="profile-info__value">{profile.email}</span>
                  </div>
                  <div className="profile-info__item">
                    <span className="profile-info__label">Teléfono</span>
                    <span className="profile-info__value">{profile.phone}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ===== DATOS DE CONTACTO ===== */}
          <section className="profile-card" aria-labelledby="profile-contact">
            <div className="profile-card__header">
              <div className="profile-card__header-left">
                <div className="profile-card__icon">
                  <IconMail />
                </div>
                <div>
                  <h2 id="profile-contact" className="profile-card__title">
                    Datos de contacto
                  </h2>
                  <p className="profile-card__desc">
                    Información de contacto adicional
                  </p>
                </div>
              </div>
            </div>

            <div className="profile-card__body">
              <div className="profile-contact-info">
                <div className="profile-contact-info__item">
                  <div className="profile-contact-info__icon">
                    <IconMail />
                  </div>
                  <div>
                    <p className="profile-contact-info__label">
                      Correo electrónico
                    </p>
                    <p className="profile-contact-info__value">
                      {profile.email}
                    </p>
                  </div>
                </div>
                <div className="profile-contact-info__item">
                  <div className="profile-contact-info__icon">
                    <IconPhone />
                  </div>
                  <div>
                    <p className="profile-contact-info__label">Teléfono</p>
                    <p className="profile-contact-info__value">
                      {profile.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== DIRECCIONES GUARDADAS ===== */}
          <section
            className="profile-card profile-card--addresses"
            aria-labelledby="profile-addresses"
          >
            <div className="profile-card__header">
              <div className="profile-card__header-left">
                <div className="profile-card__icon">
                  <IconLocation />
                </div>
                <div>
                  <h2 id="profile-addresses" className="profile-card__title">
                    Direcciones guardadas
                  </h2>
                  <p className="profile-card__desc">
                    Gestiona tus direcciones de envío
                  </p>
                </div>
              </div>
              {!showAddAddress && (
                <button
                  className="profile-card__add-btn"
                  onClick={() => setShowAddAddress(true)}
                >
                  <IconPlus />
                  Agregar
                </button>
              )}
            </div>

            <div className="profile-card__body">
              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="profile-form">
                  <h4 className="profile-form__subtitle">Nueva dirección</h4>

                  <div className="profile-form__group">
                    <label htmlFor="addr-name">Nombre de la dirección</label>
                    <input
                      type="text"
                      id="addr-name"
                      name="name"
                      value={newAddress.name}
                      onChange={handleAddressChange}
                      placeholder="Casa, Oficina, etc."
                      required
                    />
                  </div>

                  <div className="profile-form__group">
                    <label htmlFor="addr-street">Calle y número</label>
                    <input
                      type="text"
                      id="addr-street"
                      name="street"
                      value={newAddress.street}
                      onChange={handleAddressChange}
                      placeholder="Av. Reforma 456"
                      required
                    />
                  </div>

                  <div className="profile-form__group">
                    <label htmlFor="addr-colony">Colonia</label>
                    <input
                      type="text"
                      id="addr-colony"
                      name="colony"
                      value={newAddress.colony}
                      onChange={handleAddressChange}
                      placeholder="Col. Juárez"
                      required
                    />
                  </div>

                  <div className="profile-form__row">
                    <div className="profile-form__group">
                      <label htmlFor="addr-city">Ciudad</label>
                      <input
                        type="text"
                        id="addr-city"
                        name="city"
                        value={newAddress.city}
                        onChange={handleAddressChange}
                        placeholder="Ciudad de México"
                        required
                      />
                    </div>
                    <div className="profile-form__group">
                      <label htmlFor="addr-state">Estado</label>
                      <input
                        type="text"
                        id="addr-state"
                        name="state"
                        value={newAddress.state}
                        onChange={handleAddressChange}
                        placeholder="CDMX"
                        required
                      />
                    </div>
                  </div>

                  <div className="profile-form__group">
                    <label htmlFor="addr-zip">Código postal</label>
                    <input
                      type="text"
                      id="addr-zip"
                      name="zipCode"
                      value={newAddress.zipCode}
                      onChange={handleAddressChange}
                      placeholder="06600"
                      required
                    />
                  </div>

                  <div className="profile-form__checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={newAddress.isDefault}
                        onChange={handleAddressChange}
                      />
                      Establecer como dirección predeterminada
                    </label>
                  </div>

                  <div className="profile-form__actions">
                    <button
                      type="button"
                      className="profile-form__btn profile-form__btn--secondary"
                      onClick={() => {
                        setShowAddAddress(false);
                        setNewAddress({
                          name: "",
                          street: "",
                          colony: "",
                          city: "",
                          state: "",
                          zipCode: "",
                          isDefault: false,
                        });
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="profile-form__btn profile-form__btn--primary"
                    >
                      Agregar dirección
                    </button>
                  </div>
                </form>
              )}

              <div className="profile-addresses">
                {addresses.length === 0 ? (
                  <p className="profile-addresses__empty">
                    No tienes direcciones guardadas.
                    <br />
                    Agrega una dirección para facilitar tus compras.
                  </p>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`profile-address ${address.isDefault ? "profile-address--default" : ""}`}
                    >
                      <div className="profile-address__header">
                        <div>
                          <span className="profile-address__name">
                            {address.name}
                          </span>
                          {address.isDefault && (
                            <span className="profile-address__badge">
                              Predeterminada
                            </span>
                          )}
                        </div>
                        <div className="profile-address__actions">
                          {!address.isDefault && (
                            <button
                              className="profile-address__btn profile-address__btn--default"
                              onClick={() => handleSetDefault(address.id)}
                            >
                              Establecer como predeterminada
                            </button>
                          )}
                          <button
                            className="profile-address__btn profile-address__btn--delete"
                            onClick={() => handleDeleteAddress(address.id)}
                            aria-label="Eliminar dirección"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                      <p className="profile-address__street">
                        {address.street}
                      </p>
                      <p className="profile-address__details">
                        {address.colony}, {address.city}, {address.state} - CP{" "}
                        {address.zipCode}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* ===== ACCIONES DE CUENTA ===== */}
          <section
            className="profile-card profile-card--danger"
            aria-labelledby="profile-actions"
          >
            <div className="profile-card__header">
              <div className="profile-card__header-left">
                <div className="profile-card__icon profile-card__icon--danger">
                  <IconLogout />
                </div>
                <div>
                  <h2 id="profile-actions" className="profile-card__title">
                    Acciones de cuenta
                  </h2>
                  <p className="profile-card__desc">
                    Gestiona la seguridad de tu cuenta
                  </p>
                </div>
              </div>
            </div>

            <div className="profile-card__body">
              <div className="profile-actions">
                <button
                  className="profile-actions__btn profile-actions__btn--logout"
                  onClick={handleLogout}
                >
                  <IconLogout />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
