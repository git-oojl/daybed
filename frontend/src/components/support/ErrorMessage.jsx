import { FaTriangleExclamation } from "react-icons/fa6";

export default function ErrorMessage({ message = "Ocurrió un error.", onRetry }) {
  return <div className="state-card state-card--compact state-card--error" role="alert"><span className="state-card__icon"><FaTriangleExclamation /></span><h3>No pudimos completar esta vista</h3><p>{message}</p>{onRetry ? <button onClick={onRetry}>Reintentar</button> : null}</div>;
}
