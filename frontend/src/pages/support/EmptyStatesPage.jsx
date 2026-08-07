import { Link } from "react-router-dom";
import { FaBoxOpen } from "react-icons/fa";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import "../../assets/support-outcome.css";

export default function EmptyStatesPage() {
  return <div className="home-page support-outcome-page"><HomeHeader /><main className="support-outcome"><div className="support-outcome__icon"><FaBoxOpen /></div><p className="support-outcome__eyebrow">Todavía no hay contenido</p><h1>Este espacio está listo para estrenarse</h1><p>No es un error: simplemente no hay elementos que mostrar con la selección actual.</p><div className="support-outcome__actions"><Link to={routePaths.public.catalog}>Descubrir productos</Link><button type="button" onClick={() => window.history.back()}>Volver</button></div></main><HomeFooter /></div>;
}
