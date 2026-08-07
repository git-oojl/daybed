export default function RouteLoading({
  title = "Preparando este espacio",
  message = "Estamos acomodando los últimos detalles.",
  compact = false,
}) {
  return (
    <div
      className={`route-loading${compact ? " route-loading--compact" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="route-loading__card">
        <span className="route-loading__spinner" aria-hidden="true" />
        <div>
          <strong>{title}</strong>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}
