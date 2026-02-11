import { useEffect, useState, ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import AdminSideNav from "@/components/AdminSideNav"
import { Activity } from "lucide-react"
import TruckLoader from "./loader/truck"
import axios from "axios"

interface User {
  username: string
  email: string
  is_admin: boolean
}

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      navigate("/admin")
      return
    }

    // Verify token and get user info using axios
    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const data: User = res.data
        if (data.is_admin) {
          setUser(data)
        } else {
          navigate("/")
        }
      })
      .catch(() => {
        localStorage.removeItem("token")
        navigate("/admin")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <TruckLoader/>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Admin Sidebar */}
      <AdminSideNav />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50 lg:mt-0 mt-16">
        {children}
      </main>
    </div>
  )
}
