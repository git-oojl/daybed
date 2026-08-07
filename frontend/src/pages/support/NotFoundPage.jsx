import { Link } from "react-router-dom";
import { FaCompass } from "react-icons/fa";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import "../../assets/support-outcome.css";

export default function NotFoundPage() {
  return <div className="home-page support-outcome-page"><HomeHeader /><main className="support-outcome"><div className="support-outcome__icon"><FaCompass /></div><p className="support-outcome__eyebrow">Página no encontrada</p><h1>Ese rincón no existe</h1><p>La dirección pudo cambiar o el enlace ya no está disponible. Regresa a un punto seguro para continuar.</p><div className="support-outcome__actions"><Link to={routePaths.public.home}>Ir al inicio</Link><Link to={routePaths.public.catalog}>Abrir la tienda</Link></div></main><HomeFooter /></div>;
}
