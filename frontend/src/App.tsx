import Landing from "./pages/landing"
import About from "./pages/about"
import AdminPage from "./pages/admin"
import { Routes, Route, useLocation } from "react-router-dom"

function App() {
  const location = useLocation()

  // check if admin route
  const isAdmin = location.pathname.startsWith("/admin")

  return (
    <>
      {/* ADMIN LAYOUT */}
      {isAdmin ? (
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/Admin" element={<AdminPage />} />
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
