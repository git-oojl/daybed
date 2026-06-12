import { Outlet } from 'react-router-dom'

function SupportLayout({ children }) {
  return children ?? <Outlet />
}

export default SupportLayout
