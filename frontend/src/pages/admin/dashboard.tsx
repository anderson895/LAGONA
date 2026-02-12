import axios from "axios"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AdminLayout from "@/components/AdminLayout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  Route,
  Bus,
  MapPin,
} from "lucide-react"
import { Link } from "react-router-dom"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Stats {
  totalRoutes: number
  totalUsers: number
  activeRoutes: number
  vehicleTypes: {
    jeep: number
    bus: number
    tricycle: number
  }
}

interface RecentRoute {
  id: string
  origin: string
  destination: string
  vehicle_type: string
  fare: number
  created_at: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRoutes: 0,
    totalUsers: 0,
    activeRoutes: 0,
    vehicleTypes: { jeep: 0, bus: 0, tricycle: 0 },
  })
  const [recentRoutes, setRecentRoutes] = useState<RecentRoute[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      console.error("No token found")
      setLoading(false)
      return
    }

    try {
      const api = axios.create({
        baseURL: "https://lagona-oz9x.vercel.app/api",
        headers: { Authorization: `Bearer ${token}` },
      })

      const [routesRes, usersRes] = await Promise.all([api.get("/routes"), api.get("/users")])

      const routes = routesRes.data
      const users = usersRes.data

      const vehicleTypes = routes.reduce(
        (acc: any, route: any) => {
          if (route.vehicle_type) {
            acc[route.vehicle_type] = (acc[route.vehicle_type] || 0) + 1
          }
          return acc
        },
        { jeep: 0, bus: 0, tricycle: 0 }
      )

      setStats({
        totalRoutes: routes.length,
        totalUsers: users.length,
        activeRoutes: routes.filter((r: any) => r.is_active).length,
        vehicleTypes,
      })

      setRecentRoutes(routes.slice(-5).reverse())
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Routes",
      value: stats.totalRoutes,
      description: "All routes in system",
      icon: Route,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered users",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Active Routes",
      value: stats.activeRoutes,
      description: "Currently active",
      icon: Bus,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Vehicle Types",
      value: 3,
      description: "Different types",
      icon: MapPin,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  // Chart.js data
  const vehicleChartData = {
    labels: ["Jeepney", "Bus", "Tricycle"],
    datasets: [
      {
        label: "Number of Routes",
        data: [stats.vehicleTypes.jeep, stats.vehicleTypes.bus, stats.vehicleTypes.tricycle],
        backgroundColor: ["#2563EB", "#7C3AED", "#F97316"], // Tailwind colors
      },
    ],
  }

  const vehicleChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Vehicle Type Distribution",
        font: { size: 16 },
      },
    },
  }

 

  return (
    <AdminLayout>

     {loading ? (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    ) : (

      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your routes.
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/routes">
              <MapPin className="mr-2 h-4 w-4" />
              Manage Routes
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Routes */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Routes</CardTitle>
              <CardDescription>Latest routes added to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Fare</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRoutes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No routes available
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentRoutes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell>
                          <div className="font-medium">
                            {route.origin} → {route.destination}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {route.vehicle_type}
                          </Badge>
                        </TableCell>
                        <TableCell>₱{route.fare.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Vehicle Distribution</CardTitle>
              <CardDescription>Routes by vehicle type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {["jeep", "bus", "tricycle"].map((type, idx) => {
                const colors = ["blue-600", "purple-600", "orange-600"]
                const nameMap: any = { jeep: "Jeepney", bus: "Bus", tricycle: "Tricycle" }
                const count = stats.vehicleTypes[type as keyof typeof stats.vehicleTypes]
                return (
                  <div className="space-y-3" key={type}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full bg-${colors[idx]}`} />
                        <span className="text-sm font-medium">{nameMap[type]}</span>
                      </div>
                      <span className="text-sm font-bold">{count}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-${colors[idx]}`}
                        style={{
                          width: `${stats.totalRoutes > 0 ? (count / stats.totalRoutes) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Distribution Graph */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Vehicle Distribution Graph</CardTitle>
            <CardDescription>Visual representation of routes by vehicle type</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar data={vehicleChartData} options={vehicleChartOptions} />
          </CardContent>
        </Card>
      </div>
       )}
    </AdminLayout>
  )
}
