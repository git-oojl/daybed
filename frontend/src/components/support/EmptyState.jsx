import { FaRegFolderOpen } from "react-icons/fa";

function EmptyState({ message = "No hay información para mostrar." }) {
  return (
    <div className="empty-state">
      <FaRegFolderOpen aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
