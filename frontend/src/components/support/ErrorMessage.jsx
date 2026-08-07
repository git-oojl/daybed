import FeatureState from "./FeatureState.jsx";

export default function ErrorMessage({ message = "Algo interrumpió esta vista.", onRetry, title = "No pudimos mostrar esta información" }) {
  return <FeatureState tone="error" compact title={title} message={message} actionLabel={onRetry ? "Intentar de nuevo" : undefined} onAction={onRetry} />;
}
