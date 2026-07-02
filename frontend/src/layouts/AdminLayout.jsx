import { Outlet } from "react-router-dom";

function AdminLayout({ children }) {
  return children ?? <Outlet />;
}

export default AdminLayout;
