import FeatureState from "./FeatureState.jsx";

export default function EmptyState({ message = "Aún no hay información aquí", detail = "Cuando exista contenido, aparecerá organizado en este espacio.", children }) {
  return <FeatureState tone="empty" compact title={message} message={detail}>{children}</FeatureState>;
}
