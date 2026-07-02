import { Outlet } from "react-router-dom";

function CheckoutLayout({ children }) {
  return children ?? <Outlet />;
}

export default CheckoutLayout;
