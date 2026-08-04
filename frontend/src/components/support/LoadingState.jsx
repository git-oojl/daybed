import { FaCircleNotch } from "react-icons/fa";

export default function LoadingState({ message = "Cargando información..." }) {
  return <div className="state-card state-card--compact" role="status"><span className="state-card__icon state-card__icon--spin"><FaCircleNotch /></span><h3>{message}</h3><p>Esto debería tomar solo un momento.</p></div>;
}
