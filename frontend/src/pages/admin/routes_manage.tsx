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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Route as RouteIcon,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  Navigation,
  Bus,
  Check,
  X,
  Loader2,
} from "lucide-react"

import JeepneyIcon from "@/components/icons/jeepney.svg";
import BusIcon from "@/components/icons/bus.svg";
import TricycleIcon from "@/components/icons/tricycle.svg";
// API Configuration
const API_BASE_URL = "https://lagona-oz9x.vercel.app/api"

// Types
interface Route {
  id: string
  origin: string
  destination: string
  fare: number
  distance_km: number
  vehicle_type: "jeep" | "bus" | "van" | "tricycle" | "taxi"
  description?: string
  is_active: boolean
}

interface RouteFormData {
  origin: string
  destination: string
  fare: string
  distance_km: string
  vehicle_type: "jeep" | "bus" | "van" | "tricycle" | "taxi"
  description: string
}

const VEHICLE_TYPES = [
  { value: "jeep", label: "Jeepney", icon: JeepneyIcon },
  { value: "bus", label: "Bus", icon: BusIcon },
  { value: "tricycle", label: "Tricycle", icon: TricycleIcon },
] as const;
 

export default function Routes_manages() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [filterVehicleType, setFilterVehicleType] = useState<string>("all")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<RouteFormData>({
    origin: "",
    destination: "",
    fare: "",
    distance_km: "",
    vehicle_type: "jeep",
    description: "",
  })

  // Fetch routes
  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const params = filterVehicleType !== "all" ? { vehicle_type: filterVehicleType } : {}
      const response = await axios.get(`${API_BASE_URL}/routes`, { params })
      setRoutes(response.data)
    } catch (error) {
      console.error("Error fetching routes:", error)
      alert("Failed to fetch routes. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [filterVehicleType])

  // Create route
  const handleCreateRoute = async () => {
    try {
      setIsSubmitting(true)
      const payload = {
        origin: formData.origin,
        destination: formData.destination,
        fare: parseFloat(formData.fare),
        distance_km: parseFloat(formData.distance_km),
        vehicle_type: formData.vehicle_type,
        description: formData.description || undefined,
      }

      await axios.post(`${API_BASE_URL}/routes`, payload)
      
      alert("Route created successfully")
      
      setIsCreateDialogOpen(false)
      resetForm()
      fetchRoutes()
    } catch (error: any) {
      console.error("Error creating route:", error)
      alert(error.response?.data?.message || "Failed to create route")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update route
  const handleUpdateRoute = async () => {
    if (!selectedRoute) return

    try {
      setIsSubmitting(true)
      const payload = {
        origin: formData.origin,
        destination: formData.destination,
        fare: parseFloat(formData.fare),
        distance_km: parseFloat(formData.distance_km),
        vehicle_type: formData.vehicle_type,
        description: formData.description || undefined,
      }

      await axios.put(`${API_BASE_URL}/routes/${selectedRoute.id}`, payload)
      
      alert("Route updated successfully")
      
      setIsEditDialogOpen(false)
      setSelectedRoute(null)
      resetForm()
      fetchRoutes()
    } catch (error: any) {
      console.error("Error updating route:", error)
      alert(error.response?.data?.message || "Failed to update route")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete route
  const handleDeleteRoute = async () => {
    if (!selectedRoute) return

    try {
      setIsSubmitting(true)
      await axios.delete(`${API_BASE_URL}/routes/${selectedRoute.id}`)
      
      alert("Route deleted successfully")
      
      setIsDeleteDialogOpen(false)
      setSelectedRoute(null)
      fetchRoutes()
    } catch (error: any) {
      console.error("Error deleting route:", error)
      alert(error.response?.data?.message || "Failed to delete route")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Form helpers
  const resetForm = () => {
    setFormData({
      origin: "",
      destination: "",
      fare: "",
      distance_km: "",
      vehicle_type: "jeep",
      description: "",
    })
  }

  const openEditDialog = (route: Route) => {
    setSelectedRoute(route)
    setFormData({
      origin: route.origin,
      destination: route.destination,
      fare: route.fare.toString(),
      distance_km: route.distance_km.toString(),
      vehicle_type: route.vehicle_type,
      description: route.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (route: Route) => {
    setSelectedRoute(route)
    setIsDeleteDialogOpen(true)
  }

 const getVehicleIcon = (type: string) => {
  const vehicle = VEHICLE_TYPES.find(v => v.value === type);
  return vehicle?.icon || BusIcon; // returns string URL
};

  const getVehicleLabel = (type: string) => {
    const vehicle = VEHICLE_TYPES.find(v => v.value === type)
    return vehicle?.label || type
  }

  const isFormValid = () => {
    return (
      formData.origin.trim() !== "" &&
      formData.destination.trim() !== "" &&
      formData.fare !== "" &&
      parseFloat(formData.fare) > 0 &&
      formData.distance_km !== "" &&
      parseFloat(formData.distance_km) > 0
    )
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Routes Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage transportation routes and fares
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Route
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
              <RouteIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Fare</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{routes.length > 0 
                  ? (routes.reduce((sum, r) => sum + r.fare, 0) / routes.length).toFixed(2)
                  : "0.00"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Distance</CardTitle>
              <Navigation className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {routes.length > 0
                  ? (routes.reduce((sum, r) => sum + r.distance_km, 0) / routes.length).toFixed(1)
                  : "0.0"} km
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vehicle Types</CardTitle>
              <Bus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(routes.map(r => r.vehicle_type)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Routes</CardTitle>
            <CardDescription>Filter routes by vehicle type</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={filterVehicleType} onValueChange={setFilterVehicleType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                {VEHICLE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Routes Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Routes</CardTitle>
            <CardDescription>
              A list of all transportation routes in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : routes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <RouteIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No routes found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first route
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Vehicle Type</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Fare</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route) => {
                    
                    return (
                      <TableRow key={route.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-green-600" />
                            {route.origin}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-red-600" />
                            {route.destination}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <img
                                src={getVehicleIcon(route.vehicle_type)}
                                alt={getVehicleLabel(route.vehicle_type)}
                                className="h-4 w-4"
                            />
                            {getVehicleLabel(route.vehicle_type)}
                            </Badge>

                        </TableCell>
                        <TableCell>{route.distance_km} km</TableCell>
                        <TableCell className="font-semibold">₱{route.fare.toFixed(2)}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                          {route.description || "—"}
                        </TableCell>
                        <TableCell>
                          {route.is_active ? (
                            <Badge variant="default" className="gap-1">
                              <Check className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <X className="h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(route)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(route)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Route</DialogTitle>
              <DialogDescription>
                Add a new transportation route to the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-origin">Origin *</Label>
                  <Input
                    id="create-origin"
                    placeholder="e.g., Laguna"
                    value={formData.origin}
                    onChange={(e) =>
                      setFormData({ ...formData, origin: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-destination">Destination *</Label>
                  <Input
                    id="create-destination"
                    placeholder="e.g., Manila"
                    value={formData.destination}
                    onChange={(e) =>
                      setFormData({ ...formData, destination: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-vehicle">Vehicle Type *</Label>
                <Select
                  value={formData.vehicle_type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, vehicle_type: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="create-vehicle">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                            <img src={type.icon} alt={type.label} className="h-4 w-4" />
                            {type.label}
                        </div>
                        </SelectItem>

                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-distance">Distance (km) *</Label>
                  <Input
                    id="create-distance"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 12.5"
                    value={formData.distance_km}
                    onChange={(e) =>
                      setFormData({ ...formData, distance_km: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-fare">Fare (₱) *</Label>
                  <Input
                    id="create-fare"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 95.00"
                    value={formData.fare}
                    onChange={(e) =>
                      setFormData({ ...formData, fare: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-description">Description (Optional)</Label>
                <Textarea
                  id="create-description"
                  placeholder="e.g., via main highway"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  resetForm()
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateRoute} disabled={!isFormValid() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Route
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Route</DialogTitle>
              <DialogDescription>
                Update the route information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-origin">Origin *</Label>
                  <Input
                    id="edit-origin"
                    placeholder="e.g., Laguna"
                    value={formData.origin}
                    onChange={(e) =>
                      setFormData({ ...formData, origin: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-destination">Destination *</Label>
                  <Input
                    id="edit-destination"
                    placeholder="e.g., Manila"
                    value={formData.destination}
                    onChange={(e) =>
                      setFormData({ ...formData, destination: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-vehicle">Vehicle Type *</Label>
                <Select
                  value={formData.vehicle_type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, vehicle_type: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="edit-vehicle">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                            <img src={type.icon} alt={type.label} className="h-4 w-4" />
                            {type.label}
                        </div>
                        </SelectItem>

                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-distance">Distance (km) *</Label>
                  <Input
                    id="edit-distance"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 12.5"
                    value={formData.distance_km}
                    onChange={(e) =>
                      setFormData({ ...formData, distance_km: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fare">Fare (₱) *</Label>
                  <Input
                    id="edit-fare"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 95.00"
                    value={formData.fare}
                    onChange={(e) =>
                      setFormData({ ...formData, fare: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  placeholder="e.g., via main highway"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setSelectedRoute(null)
                  resetForm()
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateRoute} disabled={!isFormValid() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Update Route
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the route from{" "}
                <span className="font-semibold">{selectedRoute?.origin}</span> to{" "}
                <span className="font-semibold">{selectedRoute?.destination}</span>.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setSelectedRoute(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRoute}
                className="bg-destructive hover:bg-destructive/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}