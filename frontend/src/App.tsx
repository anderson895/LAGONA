import Landing from "./pages/landing"
import About from "./pages/about"
import LoginAdmin from "./pages/LoginAdmin"
import Dashboard from "./pages/admin/dashboard"
import Routes_manages from "./pages/admin/routes_manage"
import { Routes, Route, useLocation } from "react-router-dom"
import Account_setting from "./pages/admin/settings"

function App() {
  const location = useLocation()
  // check if admin route
  const isAdmin = location.pathname.startsWith("/admin")
  
  return (
    <>
      {/* ADMIN LAYOUT */}
      {isAdmin ? (
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/admin" element={<LoginAdmin />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/routes" element={<Routes_manages />} />
            <Route path="/admin/settings" element={<Account_setting />} />
          </Routes>
        </div>
      ) : (
        /* PUBLIC LAYOUT */
        <div className="flex min-h-svh flex-col items-center justify-center">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/About" element={<About />} />
          </Routes>
        </div>
      )}
    </>
  )
}

export default App