import { FaRegFolderOpen } from "react-icons/fa";

export default function EmptyState({ message = "No hay información para mostrar.", detail = "Cuando exista contenido, aparecerá organizado en este espacio.", children }) {
  return <div className="state-card state-card--compact"><span className="state-card__icon"><FaRegFolderOpen /></span><h3>{message}</h3><p>{detail}</p>{children}</div>;
}
