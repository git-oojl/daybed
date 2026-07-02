import { Outlet } from "react-router-dom";

function CustomerLayout({ children }) {
  return children ?? <Outlet />;
}

export default CustomerLayout;
