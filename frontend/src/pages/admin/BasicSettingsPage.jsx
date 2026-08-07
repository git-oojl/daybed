import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBoxOpen, FaBuilding, FaCheck, FaClipboardList, FaGlobe, FaLayerGroup, FaLocationDot, FaRoute, FaTruckFast, FaWarehouse } from "react-icons/fa6";
import "../../assets/CSS/admin/settings-page.css";
import { storeService } from "../../services/backendServices.js";
import { primeStoreSettings } from "../../services/useStoreSettings.js";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import OpenStreetMapEmbed from "../../components/store/OpenStreetMapEmbed.jsx";
import FeatureState from "../../components/support/FeatureState.jsx";
import { routePaths } from "../../routes/routePaths.js";

const HERO = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1800&q=82";
const EMPTY = {
  store_name: "Daybed", contact_phone: "", contact_email: "", business_hours: "", support_instructions: "",
  street: "", neighborhood: "", city: "", state: "", postal_code: "", latitude: "", longitude: "",
  delivery_base_fee: "", delivery_price_per_km: "", maximum_delivery_radius_km: "", free_shipping_threshold: "",
  currency: "MXN", cancellation_window_hours: 12, default_low_stock_threshold: 2, default_preparation_days: 4,
  announcement_message: "", instagram_url: "", facebook_url: "", storefront_available: true, show_cart_estimate: true,
};

function payloadFor(form) {
  return { ...form, free_shipping_threshold: form.free_shipping_threshold === "" ? null : form.free_shipping_threshold };
}

function Field({ label, name, form, onChange, type = "text", hint, wide = false, ...props }) {
  return <label className={`daybed-setting-field${wide ? " is-wide" : ""}`}><span>{label}</span><input type={type} name={name} value={form[name] ?? ""} onChange={onChange} {...props} />{hint ? <small>{hint}</small> : null}</label>;
}

export default function BasicSettingsPage() {
  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const data = { ...EMPTY, ...(await storeService.settings()) };
      setForm(data); setSaved(data);
    } catch (requestError) { setError(requestError); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setSuccess(""); setError(null);
  }

  async function submit(event) {
    event.preventDefault();
    try {
      setSaving(true); setError(null); setSuccess("");
      const data = { ...EMPTY, ...(await storeService.updateSettings(payloadFor(form))) };
      setForm(data); setSaved(data); primeStoreSettings(data); setSuccess("La configuración de la tienda quedó actualizada.");
    } catch (requestError) { setError(requestError); }
    finally { setSaving(false); }
  }

  return <div className="home-page daybed-settings-page"><HomeHeader /><PageHero title="Configuración de la tienda" eyebrow="Administración global" image={HERO} current="Negocio y tienda online" /><main className="daybed-settings-main"><section className="daybed-settings-intro"><div><p className="section-kicker">Identidad y operación</p><h1>Negocio y tienda online</h1><p>Estos ajustes controlan la marca pública, el contacto, el envío y lo que aparece en el escaparate.</p></div><span><FaBuilding /> Solo administradores</span></section>{loading ? <FeatureState tone="loading" title="Cargando la configuración" message="Estamos reuniendo identidad, comercio, escaparate y operación." /> : error && !saved.store_name ? <FeatureState tone="error" title="No pudimos abrir la configuración" message={error.message} actionLabel="Intentar de nuevo" onAction={load} /> : <form className="daybed-settings-form" onSubmit={submit}>{success ? <div className="inline-notice inline-notice--success"><FaCheck /><span>{success}</span></div> : null}{error ? <div className="inline-notice inline-notice--error"><strong>No se guardaron los cambios.</strong><span>{error.message}</span></div> : null}

    <section className="daybed-settings-group"><header><FaBuilding /><div><p>Identidad</p><h2>Marca y atención al cliente</h2></div></header><div className="daybed-settings-grid"><Field label="Nombre comercial" name="store_name" form={form} onChange={change} hint="Se usa en navegación, acceso, soporte y checkout." /><Field label="Correo público" name="contact_email" type="email" form={form} onChange={change} /><Field label="Teléfono de soporte" name="contact_phone" form={form} onChange={change} /><Field label="Horario" name="business_hours" form={form} onChange={change} hint="Se muestra en contacto y soporte." /><label className="daybed-setting-field is-wide"><span>Instrucciones de soporte</span><textarea name="support_instructions" value={form.support_instructions} onChange={change} rows="3" /></label></div></section>

    <section className="daybed-settings-group"><header><FaLocationDot /><div><p>Ubicación</p><h2>Showroom y origen de entrega</h2></div></header><div className="daybed-settings-grid"><Field label="Calle y número" name="street" form={form} onChange={change} wide /><Field label="Colonia" name="neighborhood" form={form} onChange={change} /><Field label="Ciudad" name="city" form={form} onChange={change} /><Field label="Estado" name="state" form={form} onChange={change} /><Field label="Código postal" name="postal_code" form={form} onChange={change} /><Field label="Latitud" name="latitude" type="number" step="0.00000001" form={form} onChange={change} /><Field label="Longitud" name="longitude" type="number" step="0.00000001" form={form} onChange={change} /></div><OpenStreetMapEmbed compact latitude={form.latitude || undefined} longitude={form.longitude || undefined} label={`${form.store_name || "Daybed"} · ${form.street || "Ubicación del showroom"}, ${form.city || "Ciudad"}`} title={`Ubicación de ${form.store_name || "la tienda"}`} /></section>

    <section className="daybed-settings-group"><header><FaTruckFast /><div><p>Comercio</p><h2>Envío e inventario</h2></div></header><div className="daybed-settings-grid"><Field label="Tarifa base" name="delivery_base_fee" type="number" min="0" step="0.01" form={form} onChange={change} /><Field label="Precio por kilómetro" name="delivery_price_per_km" type="number" min="0" step="0.01" form={form} onChange={change} /><Field label="Radio máximo (km)" name="maximum_delivery_radius_km" type="number" min="0" step="0.1" form={form} onChange={change} /><Field label="Envío gratis desde" name="free_shipping_threshold" type="number" min="0" step="0.01" form={form} onChange={change} hint="Vacío desactiva el umbral." /><Field label="Moneda" name="currency" form={form} onChange={change} readOnly hint="La tienda muestra sus importes en esta moneda." /><Field label="Umbral de poco inventario" name="default_low_stock_threshold" type="number" min="0" form={form} onChange={change} /><Field label="Ventana de cancelación (h)" name="cancellation_window_hours" type="number" min="0" form={form} onChange={change} /><Field label="Preparación estimada (días)" name="default_preparation_days" type="number" min="0" form={form} onChange={change} /></div><div className="daybed-settings-effect"><FaRoute /><p>Impacta checkout, costos de entrega, cobertura, alertas de inventario y tiempos visibles para el cliente.</p></div></section>

    <section className="daybed-settings-group"><header><FaGlobe /><div><p>Escaparate</p><h2>Comunicación y disponibilidad</h2></div></header><div className="daybed-settings-grid"><Field label="Anuncio público" name="announcement_message" form={form} onChange={change} wide /><Field label="Instagram" name="instagram_url" type="url" form={form} onChange={change} /><Field label="Facebook" name="facebook_url" type="url" form={form} onChange={change} /><label className="daybed-setting-toggle"><input type="checkbox" name="storefront_available" checked={Boolean(form.storefront_available)} onChange={change} /><span><strong>Tienda online disponible</strong><small>Controla si el escaparate acepta nuevas compras.</small></span></label><label className="daybed-setting-toggle"><input type="checkbox" name="show_cart_estimate" checked={Boolean(form.show_cart_estimate)} onChange={change} /><span><strong>Mostrar estimación en carrito</strong><small>El cálculo definitivo ocurre en checkout.</small></span></label></div><div className="daybed-settings-links"><Link to={routePaths.backOffice.products}><FaBoxOpen /><div><strong>Productos destacados</strong></div></Link><Link to={routePaths.backOffice.categories}><FaLayerGroup /><div><strong>Colecciones del catálogo</strong></div></Link><Link to={routePaths.backOffice.inventory}><FaWarehouse /><div><strong>Inventario</strong></div></Link><Link to={routePaths.backOffice.orders}><FaClipboardList /><div><strong>Pedidos</strong></div></Link></div></section>

    <footer className="daybed-settings-actions"><button type="button" onClick={() => setForm(saved)} disabled={saving}>Descartar cambios</button><button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar configuración global"}</button></footer>
  </form>}</main><HomeFooter /></div>;
}
