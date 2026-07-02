import { Outlet } from "react-router-dom";

function PublicLayout({ children }) {
  return children ?? <Outlet />;
}

export default PublicLayout;
