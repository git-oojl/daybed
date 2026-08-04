import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import "../../assets/support-outcome.css";

export default function SuccessStatePage() {
  return (
    <div className="home-page support-outcome-page">
      <HomeHeader />
      <main className="support-outcome support-outcome--success">
        <div className="support-outcome__icon"><FaCheckCircle aria-hidden="true" /></div>
        <p className="support-outcome__eyebrow">Todo listo</p>
        <h1>La operación se completó</h1>
        <p>Los cambios quedaron guardados. Puedes continuar desde tu cuenta o volver a la tienda.</p>
        <div className="support-outcome__actions">
          <Link to={routePaths.account.profile}>Ir a mi cuenta</Link>
          <Link to={routePaths.public.catalog}>Volver a la tienda</Link>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
