import { Link } from "react-router-dom";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import "../../assets/support-outcome.css";

export default function FeedbackMessagesPage() {
  return <div className="home-page support-outcome-page"><HomeHeader /><main className="support-outcome"><p className="support-outcome__eyebrow">Estados de respuesta</p><h1>Elige el resultado que quieres revisar</h1><p>Las confirmaciones y los errores tienen pantallas independientes, con acciones acordes a cada situación.</p><div className="support-outcome__actions"><Link to={routePaths.support.success}>Ver confirmación</Link><Link to={routePaths.support.error}>Ver error</Link></div></main><HomeFooter /></div>;
}
