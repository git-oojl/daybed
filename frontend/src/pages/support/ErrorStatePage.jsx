import { Link } from "react-router-dom";
import { FaExclamationCircle } from "react-icons/fa";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import "../../assets/support-outcome.css";

export default function ErrorStatePage() {
  return (
    <div className="home-page support-outcome-page">
      <HomeHeader />
      <main className="support-outcome support-outcome--error">
        <div className="support-outcome__icon"><FaExclamationCircle aria-hidden="true" /></div>
        <p className="support-outcome__eyebrow">No se pudo completar</p>
        <h1>Algo interrumpió la operación</h1>
        <p>No se aplicaron cambios. Intenta de nuevo o contacta a Daybed si el problema continúa.</p>
        <div className="support-outcome__actions">
          <button type="button" onClick={() => window.history.back()}>Intentar de nuevo</button>
          <Link to={routePaths.public.contactHelp}>Contactar a Daybed</Link>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
