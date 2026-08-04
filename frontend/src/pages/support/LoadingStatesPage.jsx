import { Link } from "react-router-dom";
import { FaCircleNotch } from "react-icons/fa";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import "../../assets/support-outcome.css";

export default function LoadingStatesPage() {
  return <div className="home-page support-outcome-page"><HomeHeader /><main className="support-outcome"><div className="support-outcome__icon support-outcome__icon--spin"><FaCircleNotch /></div><p className="support-outcome__eyebrow">Preparando la vista</p><h1>Estamos reuniendo tu información</h1><p>Productos, pedidos y datos de tu cuenta se mostrarán aquí en cuanto estén disponibles.</p><div className="support-outcome__skeleton"><i /><i /><i /></div><div className="support-outcome__actions"><Link to={routePaths.public.catalog}>Seguir explorando</Link></div></main><HomeFooter /></div>;
}
