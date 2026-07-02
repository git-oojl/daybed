import { Outlet } from "react-router-dom";

function BackOfficeLayout({ children }) {
  return children ?? <Outlet />;
}

export default BackOfficeLayout;
