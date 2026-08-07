import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCreditCard,
  FaLocationDot,
  FaPen,
  FaTruck,
  FaUser,
} from "react-icons/fa6";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import Avatar from "../../components/account/Avatar.jsx";
import OpenStreetMapEmbed from "../../components/store/OpenStreetMapEmbed.jsx";
import FeatureState from "../../components/support/FeatureState.jsx";
import { routePaths } from "../../routes/routePaths.js";
import { API_ERROR_KINDS } from "../../services/apiErrors.js";
import { cartService, deliveryService, orderService } from "../../services/backendServices.js";
import { useEffectiveSession } from "../../auth/useEffectiveSession.js";
import { productImage } from "../../services/viewMappers.js";
import { formatMoney } from "../../utils/orderPresentation.js";
import useStoreSettings from "../../services/useStoreSettings.js";

const HERO = "https://images.unsplash.com/photo-1618220179428-22790b461013?w=1800&q=82";
const REQUIRED_ADDRESS_FIELDS = ["street", "city", "state", "postal_code"];

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cardDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCard(value) {
  return cardDigits(value).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value) {
  const digits = cardDigits(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function productFor(item) {
  return item.product || item;
}

export default function CheckoutSummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useEffectiveSession();
  const { settings: storeSettings } = useStoreSettings();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [payment, setPayment] = useState({ card_number: "", card_expiry: "", card_cvv: "" });
  const [address, setAddress] = useState({
    street: "",
    neighborhood: "",
    city: user?.city || "",
    state: user?.state || "",
    postal_code: "",
    reference: "",
    delivery_notes: "",
  });

  const loadCheckout = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);
      const cart = await cartService.get();
      setCartItems(cart?.items || []);
    } catch (error) {
      setPageError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(routePaths.account.login, {
        replace: true,
        state: {
          from: { pathname: location.pathname },
          sessionMessage: "Inicia sesión para continuar con tu compra.",
        },
      });
      return;
    }
    if (!authLoading && isAuthenticated) loadCheckout();
  }, [authLoading, isAuthenticated, loadCheckout, location.pathname, navigate]);

  useEffect(() => {
    setAddress((current) => ({ ...current, city: current.city || user?.city || "", state: current.state || user?.state || "" }));
  }, [user?.city, user?.state]);

  const subtotal = useMemo(() => cartItems.reduce((sum, item) => {
    const product = productFor(item);
    return sum + Number(product.price || 0) * Number(item.quantity || 0);
  }, 0), [cartItems]);
  const soldOutItems = useMemo(() => cartItems.filter((item) => {
    const product = productFor(item);
    return product.active === false || Number(product.stock || 0) < Number(item.quantity || 0);
  }), [cartItems]);
  const baseDeliveryFee = useMemo(() => {
    const threshold = Number(storeSettings.free_shipping_threshold || 0);
    if (threshold > 0 && subtotal >= threshold) return 0;
    return Number(storeSettings.delivery_base_fee || 0);
  }, [storeSettings.delivery_base_fee, storeSettings.free_shipping_threshold, subtotal]);
  const effectiveShipping = deliveryEstimate ? Number(deliveryEstimate.delivery_fee || 0) : baseDeliveryFee;
  const total = subtotal + effectiveShipping;
  const addressComplete = REQUIRED_ADDRESS_FIELDS.every((field) => clean(address[field])) && /^\d{5}$/.test(clean(address.postal_code));

  function updateAddress(event) {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
    setCandidates([]);
    setSelectedCandidate(null);
    setDeliveryEstimate(null);
    setAddressError(null);
  }

  async function calculateEstimate(candidate) {
    try {
      setEstimating(true);
      setAddressError(null);
      const estimate = await deliveryService.estimate({
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        order_subtotal: subtotal.toFixed(2),
      });
      setDeliveryEstimate(estimate);
    } catch (error) {
      setDeliveryEstimate(null);
      setAddressError(error);
    } finally {
      setEstimating(false);
    }
  }

  async function verifyAddress() {
    if (!addressComplete) {
      setAddressError({ kind: API_ERROR_KINDS.VALIDATION, message: "Completa calle y número, municipio o ciudad, entidad y un código postal mexicano de cinco dígitos." });
      return;
    }
    try {
      setGeocoding(true);
      setAddressError(null);
      setCandidates([]);
      setSelectedCandidate(null);
      setDeliveryEstimate(null);
      const result = await deliveryService.geocode({
        street: clean(address.street),
        neighborhood: clean(address.neighborhood),
        city: clean(address.city),
        state: clean(address.state),
        postal_code: clean(address.postal_code),
      });
      const nextCandidates = result.candidates?.length ? result.candidates : [result];
      setCandidates(nextCandidates);
      if (nextCandidates.length === 1) {
        setSelectedCandidate(nextCandidates[0]);
        await calculateEstimate(nextCandidates[0]);
      }
    } catch (error) {
      setAddressError(error);
    } finally {
      setGeocoding(false);
    }
  }

  async function chooseCandidate(candidate) {
    setSelectedCandidate(candidate);
    setDeliveryEstimate(null);
    await calculateEstimate(candidate);
  }

  function paymentReady() {
    if (paymentMethod !== "card") return true;
    return cardDigits(payment.card_number).length >= 13 && /^\d{2}\/\d{2}$/.test(payment.card_expiry) && /^\d{3,4}$/.test(payment.card_cvv);
  }

  async function submitOrder() {
    if (storeSettings.storefront_available === false) {
      setSubmitError({ message: "Las compras están pausadas temporalmente. Tu carrito permanece guardado." });
      return;
    }
    if (soldOutItems.length) {
      setSubmitError({ message: "Actualiza el carrito: una pieza ya no tiene existencias suficientes." });
      return;
    }
    if (!acceptedTerms || !paymentReady()) {
      setSubmitError({ message: !acceptedTerms ? "Acepta los términos de compra para continuar." : "Revisa los datos de la tarjeta." });
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      const payload = {
        delivery_address: {
          street: clean(address.street),
          neighborhood: clean(address.neighborhood),
          city: clean(address.city),
          state: clean(address.state),
          postal_code: clean(address.postal_code),
          country: "México",
          reference: clean(address.reference),
        },
        delivery_notes: clean(address.delivery_notes),
        payment_method: paymentMethod,
        ...(selectedCandidate ? {
          latitude: selectedCandidate.latitude,
          longitude: selectedCandidate.longitude,
          geocoding_provider: "nominatim",
        } : {}),
        ...(paymentMethod === "card" ? payment : {}),
      };
      const order = await orderService.checkout(payload);
      navigate(routePaths.checkout.confirmationDetail.replace(":orderId", order.id), { replace: true, state: { orderId: order.id, orderData: order } });
    } catch (error) {
      setSubmitError(error);
      if (error?.fieldErrors?.cart) await loadCheckout();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || authLoading) {
    return <div className="home-page checkout-v3"><HomeHeader /><PageHero title="Resumen de pedido" eyebrow="Compra Daybed" image={HERO} /><main className="checkout-v3__main"><FeatureState tone="loading" title="Preparando tu pedido" message="Comprobamos el carrito y la disponibilidad sin modificar tu selección." /></main><HomeFooter /></div>;
  }

  if (pageError) {
    const expired = [API_ERROR_KINDS.AUTH_EXPIRED, API_ERROR_KINDS.AUTH_INVALID].includes(pageError.kind);
    return <div className="home-page checkout-v3"><HomeHeader /><PageHero title="Resumen de pedido" eyebrow="Compra Daybed" image={HERO} /><main className="checkout-v3__main"><FeatureState tone={expired ? "auth" : "error"} title={expired ? "Tu sesión terminó" : "No pudimos abrir el checkout"} message={expired ? "Inicia sesión de nuevo. El carrito permanece asociado a tu cuenta." : pageError.message} actionLabel={expired ? "Iniciar sesión" : "Intentar de nuevo"} actionTo={expired ? routePaths.account.login : undefined} onAction={expired ? undefined : loadCheckout} secondaryLabel="Volver al carrito" secondaryTo={routePaths.checkout.cart} /></main><HomeFooter /></div>;
  }

  if (!cartItems.length) {
    return <div className="home-page checkout-v3"><HomeHeader /><PageHero title="Resumen de pedido" eyebrow="Compra Daybed" image={HERO} /><main className="checkout-v3__main"><FeatureState tone="empty" title="Tu carrito está listo para una nueva pieza" message="Agrega un producto disponible para preparar la entrega." actionLabel="Explorar Tienda" actionTo={routePaths.public.catalog} secondaryLabel="Ver guardados" secondaryTo={routePaths.public.savedItems} /></main><HomeFooter /></div>;
  }

  return (
    <div className="home-page checkout-v3">
      <HomeHeader />
      <PageHero title="Resumen de pedido" eyebrow="Compra Daybed" image={HERO} />
      <main className="checkout-v3__main">
        <Link className="back-inline" to={routePaths.checkout.cart}><FaArrowLeft /> Volver al carrito</Link>
        <section className="checkout-v3__heading"><div><p className="section-kicker">Compra protegida</p><h1>Confirma entrega y pago</h1><p>Tu identidad proviene de la cuenta. Aquí solo decides dónde entregar y cómo pagar.</p></div></section>

        {storeSettings.storefront_available === false ? <div className="inline-notice inline-notice--warning" role="status"><strong>La tienda online está en pausa.</strong><span>Puedes revisar tu pedido y conservar el carrito, pero no finalizar una compra todavía.</span></div> : null}
        {soldOutItems.length ? <div className="inline-notice inline-notice--error" role="alert"><strong>Hay productos sin disponibilidad suficiente.</strong><span>Regresa al carrito para ajustar cantidades antes de finalizar.</span><Link to={routePaths.checkout.cart}>Revisar carrito</Link></div> : null}
        {submitError ? <div className="inline-notice inline-notice--error" role="alert"><strong>No pudimos finalizar el pedido.</strong><span>{submitError.message}</span></div> : null}

        <div className="checkout-v3__layout">
          <div className="checkout-v3__flow">
            <section className="checkout-section-card">
              <header><FaUser /><div><p>Paso 1</p><h2>Cuenta que realiza la compra</h2></div></header>
              <div className="checkout-account-readonly"><Avatar user={user} size="lg" /><div><strong>{[user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "Usuario Daybed"}</strong><span>{user?.email}</span><span>{user?.phone || "Agrega un teléfono en tu perfil para facilitar la entrega"}</span></div><Link to={routePaths.account.profile}><FaPen /> Editar perfil</Link></div>
              <p className="checkout-help-copy">Nombre, correo y teléfono pertenecen a tu cuenta y se adjuntan automáticamente al pedido; no se duplican como campos editables.</p>
            </section>

            <section className="checkout-section-card">
              <header><FaLocationDot /><div><p>Paso 2</p><h2>Dirección de entrega</h2></div></header>
              <div className="checkout-address-grid">
                <label className="is-wide">Calle y número *<input name="street" value={address.street} onChange={updateAddress} placeholder="Av. Vallarta 2450" /></label>
                <label className="is-wide">Colonia o localidad<input name="neighborhood" value={address.neighborhood} onChange={updateAddress} placeholder="Arcos Vallarta" /></label>
                <label>Ciudad o municipio *<input name="city" value={address.city} onChange={updateAddress} placeholder="Guadalajara" /></label>
                <label>Estado o entidad *<input name="state" value={address.state} onChange={updateAddress} placeholder="Jalisco" /></label>
                <label>Código postal *<input inputMode="numeric" maxLength="5" name="postal_code" value={address.postal_code} onChange={updateAddress} placeholder="44130" /></label>
                <label className="is-wide">Referencia adicional<input name="reference" value={address.reference} onChange={updateAddress} placeholder="Portón blanco, entre calle 4 y 5" /></label>
                <label className="is-wide">Indicaciones de entrega<textarea name="delivery_notes" value={address.delivery_notes} onChange={updateAddress} rows="3" placeholder="Piso, acceso, horario o referencias útiles" /></label>
              </div>
              <button className="solid-action" type="button" disabled={!addressComplete || geocoding} onClick={verifyAddress}>{geocoding ? "Buscando coincidencias…" : "Verificar en el mapa"}</button>
              {!addressComplete ? <p className="checkout-field-hint">Completa calle, ciudad o municipio, entidad y un código postal mexicano de cinco dígitos.</p> : <p className="checkout-field-hint">La verificación en mapa es opcional. Si no aparece una coincidencia útil, puedes continuar con la dirección escrita.</p>}

              {addressError ? <div className="checkout-local-error" role="alert"><strong>{addressError.kind === API_ERROR_KINDS.EXTERNAL_SERVICE ? "No pudimos validar la ubicación ahora" : "Revisa la dirección"}</strong><p>{addressError.message}</p><p>Puedes continuar con la dirección manual. Si vuelves a verificar y encontramos una coincidencia, también guardaremos la ubicación del pedido.</p>{selectedCandidate ? <button type="button" onClick={() => calculateEstimate(selectedCandidate)}>Recalcular entrega</button> : null}</div> : null}

              {candidates.length ? <fieldset className="address-candidates"><legend>Selecciona la coincidencia correcta</legend>{candidates.map((candidate, index) => <label key={`${candidate.latitude}-${candidate.longitude}-${index}`} className={selectedCandidate === candidate ? "is-selected" : ""}><input type="radio" name="candidate" checked={selectedCandidate === candidate} onChange={() => chooseCandidate(candidate)} /><span><strong>{candidate.formatted_address}</strong><small>{candidate.address?.postcode ? `C.P. ${candidate.address.postcode}` : "Verifica la ubicación antes de continuar"}</small></span></label>)}</fieldset> : null}

              {selectedCandidate ? <div className="checkout-map-block"><OpenStreetMapEmbed compact latitude={selectedCandidate.latitude} longitude={selectedCandidate.longitude} label={selectedCandidate.formatted_address} title="Destino de entrega seleccionado" />{estimating ? <p className="checkout-field-hint">Calculando entrega…</p> : deliveryEstimate ? <div className="delivery-estimate-card"><span><FaTruck /><strong>{Number(deliveryEstimate.distance_km).toFixed(1)} km</strong></span><span><strong>{Math.round(Number(deliveryEstimate.estimated_duration_minutes))} min</strong> estimados</span><span><strong>{Number(deliveryEstimate.delivery_fee) ? formatMoney(deliveryEstimate.delivery_fee) : "Envío gratis"}</strong></span></div> : null}</div> : null}
            </section>

            <section className="checkout-section-card">
              <header><FaCreditCard /><div><p>Paso 3</p><h2>Forma de pago</h2></div></header>
              <div className="payment-options">{[["cash", "Pago contra entrega"], ["transfer", "Transferencia bancaria"], ["card", "Tarjeta"]].map(([value, label]) => <label className={paymentMethod === value ? "is-selected" : ""} key={value}><input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} /><span>{label}</span></label>)}</div>
              {paymentMethod === "card" ? <div className="checkout-card-fields"><label className="is-wide">Número de tarjeta<input inputMode="numeric" value={payment.card_number} onChange={(event) => setPayment((current) => ({ ...current, card_number: formatCard(event.target.value) }))} placeholder="4242 4242 4242 4242" /></label><label>Vencimiento<input value={payment.card_expiry} onChange={(event) => setPayment((current) => ({ ...current, card_expiry: formatExpiry(event.target.value) }))} placeholder="MM/AA" /></label><label>CVV<input inputMode="numeric" maxLength="4" value={payment.card_cvv} onChange={(event) => setPayment((current) => ({ ...current, card_cvv: cardDigits(event.target.value).slice(0, 4) }))} placeholder="123" /></label></div> : null}
            </section>
          </div>

          <aside className="checkout-v3__summary">
            <section className="checkout-order-card"><p className="section-kicker">Tu selección</p><h2>{cartItems.length} {cartItems.length === 1 ? "pieza" : "piezas"}</h2><div className="checkout-product-list">{cartItems.map((item) => { const product = productFor(item); return <article key={item.id}><img src={productImage(product)} alt={product.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = productImage({}); }} /><div><strong>{product.name}</strong><span>{item.quantity} × {formatMoney(product.price)}</span>{Number(product.stock || 0) < Number(item.quantity || 0) ? <em>Sin existencias suficientes</em> : null}</div><b>{formatMoney(Number(product.price || 0) * Number(item.quantity || 0))}</b></article>; })}</div><dl className="order-money-list"><div><dt>Productos</dt><dd>{formatMoney(subtotal)}</dd></div><div><dt>Envío</dt><dd>{effectiveShipping ? formatMoney(effectiveShipping) : "Gratis"}</dd></div>{deliveryEstimate ? <><div><dt>Distancia estimada</dt><dd>{Number(deliveryEstimate.distance_km).toFixed(1)} km</dd></div><div><dt>Tiempo estimado</dt><dd>{Math.round(Number(deliveryEstimate.estimated_duration_minutes))} min</dd></div></> : <div><dt>Estimación</dt><dd>Envío base sin mapa</dd></div>}<div className="is-total"><dt>Total</dt><dd>{formatMoney(total)}</dd></div></dl><label className="checkout-terms"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} /><span>Acepto los términos de compra y confirmo que la dirección escrita es correcta.</span></label><button className="checkout-submit" type="button" disabled={storeSettings.storefront_available === false || submitting || soldOutItems.length > 0 || !acceptedTerms || !paymentReady() || !addressComplete} onClick={submitOrder}>{submitting ? "Creando pedido…" : "Confirmar pedido"}</button><p>El servidor vuelve a comprobar existencias y aplica el envío real según la configuración actual de la tienda.</p></section>
          </aside>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
