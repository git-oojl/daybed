function ProtectedRoute({ children, allowedViewers = [], redirectTo = '/no-autorizado' }) {
  const guardConfig = {
    allowedViewers,
    redirectTo,
  }

  // TODO: Connect this placeholder to real auth/session state when backend auth exists.
  // The guard config is intentionally declared now so route-level access expectations stay visible.
  void guardConfig

  return children
}

export default ProtectedRoute
