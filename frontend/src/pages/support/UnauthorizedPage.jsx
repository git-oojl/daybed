import { Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import "../../assets/support-outcome.css";

export default function UnauthorizedPage() {
  return <div className="home-page support-outcome-page"><HomeHeader /><main className="support-outcome support-outcome--warning"><div className="support-outcome__icon"><FaLock /></div><p className="support-outcome__eyebrow">Acceso protegido</p><h1>Esta herramienta no corresponde a tu cuenta</h1><p>Tu sesión funciona correctamente, pero este espacio requiere otro permiso. Puedes volver a tu cuenta o a la tienda.</p><div className="support-outcome__actions"><Link to={routePaths.account.profile}>Ir a mi cuenta</Link><Link to={routePaths.public.catalog}>Volver a la tienda</Link></div></main><HomeFooter /></div>;
}
