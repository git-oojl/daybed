import FeatureState from "./FeatureState.jsx";

export default function LoadingState({ message = "Preparando la información…", detail = "Conservaremos tu lugar mientras termina de cargar." }) {
  return <FeatureState tone="loading" compact title={message} message={detail} />;
}
