import { FaCheck } from "react-icons/fa";

export default function SuccessMessage({ message = "Operación completada." }) {
  return <div className="inline-notice inline-notice--success" role="status"><FaCheck /> {message}</div>;
}
