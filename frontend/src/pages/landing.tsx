import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calculator, Bus, ArrowRight, Loader2 } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import axios from "axios"

// --- Types ---
type VehicleType = "jeep" | "bus" | "tricycle"

interface Route {
  id: string
  origin: string
  destination: string
  fare: number
  distance_km: number
}

interface FareResult {
  route: Route
  fare: number
  breakdown?: string
}

// --- Vehicle Config ---
const VEHICLES: { type: VehicleType; label: string; emoji: string; desc: string }[] = [
  { type: "jeep",     label: "Jeepney",  emoji: "🚐", desc: "Pinaka-popular" },
  { type: "bus",      label: "Bus",      emoji: "🚌", desc: "Pangmahabang biyahe" },
  { type: "tricycle", label: "Tricycle", emoji: "🛺", desc: "Pang-lokal" },
]

export default function Landing() {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null)
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FareResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [routesLoading, setRoutesLoading] = useState(false)

  // Fetch available routes from API when vehicle is selected
  const handleVehicleSelect = async (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle)
    setResult(null)
    setError(null)
    setOrigin("")
    setDestination("")
    setRoutes([])

    setRoutesLoading(true)
    try {
      const res = await axios.get(`/api/routes`, {
        params: { vehicle_type: vehicle },
      })
      setRoutes(res.data.routes ?? [])
    } catch (err) {
      // Non-blocking: just clear routes silently; user can still type
      setRoutes([])
    } finally {
      setRoutesLoading(false)
    }
  }

  // Compute fare via API
  const handleCalculate = async () => {
    if (!selectedVehicle || !origin.trim() || !destination.trim()) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await axios.get(`/api/fare`, {
        params: {
          vehicle_type: selectedVehicle,
          origin: origin.trim(),
          destination: destination.trim(),
        },
      })
      setResult(res.data)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Hindi mahanap ang ruta. Subukan ang ibang pinanggalingan o patutunguhan."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const canCalculate =
    !!selectedVehicle && origin.trim().length > 0 && destination.trim().length > 0

  return (
    <div className="min-h-screen w-full" style={{ background: "linear-gradient(160deg, #f0f4ff 0%, #fafafa 60%, #fff7ed 100%)" }}>
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 grid md:grid-cols-2 gap-14 items-center">
        
        {/* Left Content */}
        <div>
          <Badge className="mb-6 bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1">
            Official Fare Inquiry System
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-slate-900">
            A DIGITAL GUIDE
            <span className="block text-blue-600 mt-1">FOR PROVINCIAL COMMUTERS</span>
          </h1>

          <p className="text-slate-600 text-lg mb-8 leading-relaxed">
            Ibigay ang iyong pinanggalingan at patutunguhan upang malaman 
            ang kaukulang pamasahe batay sa umiiral na rate.
          </p>

          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Calculator className="w-4 h-4" />
            Para sa mga commuter at pasahero ng terminal
          </div>

          {/* Stats row */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: "Sasakyan", value: "3" },
              { label: "Ruta", value: "50+" },
              { label: "Bayan", value: "12" },
            ].map((s) => (
              <div key={s.label} className="bg-white/80 rounded-xl p-4 border border-slate-100 text-center shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fare Computation Card */}
        <Card className="shadow-xl border-0 rounded-2xl bg-white overflow-hidden"id="fareForm">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-400" />
          <CardContent className="p-8 space-y-6">
            
            {/* Title */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">Fare Computation</h2>
              <p className="text-sm text-slate-400">Pumili ng sasakyan at ilagay ang detalye ng biyahe</p>
            </div>

            {/* Step 1: Vehicle Selection */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Step 1 — Piliin ang Sasakyan
              </p>
              <div className="grid grid-cols-3 gap-3">
                {VEHICLES.map((v) => (
                  <button
                    key={v.type}
                    onClick={() => handleVehicleSelect(v.type)}
                    className={`
                      flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                      ${selectedVehicle === v.type
                        ? "border-blue-500 bg-blue-50 shadow-md scale-[1.03]"
                        : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"}
                    `}
                  >
                    <span className="text-3xl">{v.emoji}</span>
                    <span className={`text-sm font-semibold ${selectedVehicle === v.type ? "text-blue-700" : "text-slate-700"}`}>
                      {v.label}
                    </span>
                    <span className="text-[10px] text-slate-400">{v.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Route Inputs — shown after vehicle selected */}
            {selectedVehicle && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Step 2 — Ilagay ang Ruta
                </p>

                {routesLoading && (
                  <div className="flex items-center gap-2 text-xs text-blue-500 py-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Nilo-load ang mga available na ruta…
                  </div>
                )}

                {/* Origin */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  <input
                    list="origin-list"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Pinanggalingan"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder:text-slate-400"
                  />
                  {routes.length > 0 && (
                    <datalist id="origin-list">
                      {[...new Set(routes.map((r) => r.origin))].map((o) => (
                        <option key={o} value={o} />
                      ))}
                    </datalist>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="bg-slate-100 rounded-full p-1.5">
                    <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                  </div>
                </div>

                {/* Destination */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  <input
                    list="dest-list"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Patutunguhan"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder:text-slate-400"
                  />
                  {routes.length > 0 && (
                    <datalist id="dest-list">
                      {[...new Set(routes.map((r) => r.destination))].map((d) => (
                        <option key={d} value={d} />
                      ))}
                    </datalist>
                  )}
                </div>
              </div>
            )}

            {/* Calculate Button */}
            <Button
              onClick={handleCalculate}
              disabled={!canCalculate || loading}
              className="w-full h-12 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Kinukuha ang pamasahe…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Kalkulahin ang Pamasahe
                </span>
              )}
            </Button>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 text-center animate-in fade-in duration-200">
                {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 text-center space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pamasahe</p>
                <p className="text-4xl font-bold text-blue-700">
                  ₱{result.fare?.toFixed(2)}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{result.route?.origin}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="font-medium text-slate-700">{result.route?.destination}</span>
                </div>
                {result.route?.distance_km && (
                  <p className="text-xs text-slate-400">{result.route.distance_km} km</p>
                )}
                {result.breakdown && (
                  <p className="text-xs text-slate-500 mt-1 bg-white/60 rounded-lg px-3 py-1.5">
                    {result.breakdown}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Available Routes Section */}
      {selectedVehicle && (
        <section className="bg-white border-t py-12">
          <div className="container mx-auto px-6">

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Mga Available na Ruta
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  {VEHICLES.find(v => v.type === selectedVehicle)?.emoji}{" "}
                  {VEHICLES.find(v => v.type === selectedVehicle)?.label} — mga pinagbibiyaheng ruta
                </p>
              </div>
              {!routesLoading && routes.length > 0 && (
                <span className="self-start sm:self-auto bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-4 py-1.5 text-sm font-semibold">
                  {routes.length} ruta
                </span>
              )}
            </div>

            {/* Loading state */}
            {routesLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                <p className="text-sm">Nilo-load ang mga ruta…</p>
              </div>
            )}

            {/* Empty state */}
            {!routesLoading && routes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                <div className="text-5xl">🗺️</div>
                <p className="text-sm">Walang available na ruta para sa sasakyang ito.</p>
              </div>
            )}

            {/* Routes Grid */}
            {!routesLoading && routes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {routes.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => {
                      setOrigin(route.origin)
                      setDestination(route.destination)
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    className="group text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl p-5 transition-all duration-200 hover:shadow-md"
                  >
                    {/* Route path */}
                    <div className="flex items-start gap-3">
                      {/* Timeline dots */}
                      <div className="flex flex-col items-center pt-1 gap-1 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400 ring-2 ring-green-100" />
                        <div className="w-px h-6 bg-slate-300" />
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400 ring-2 ring-red-100" />
                      </div>

                      {/* Labels */}
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Mula</p>
                          <p className="text-sm font-semibold text-slate-800 truncate">{route.origin}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Papunta</p>
                          <p className="text-sm font-semibold text-slate-800 truncate">{route.destination}</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer row */}
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {route.distance_km && (
                          <span className="text-xs text-slate-400">{route.distance_km} km</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-700">
                          ₱{route.fare?.toFixed(2)}
                        </span>
                        <span className="text-xs text-blue-400 group-hover:translate-x-0.5 transition-transform">→</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

          </div>
        </section>
      )}

      {/* Info Section */}
      <section className={`py-14 border-t ${selectedVehicle ? "bg-slate-50" : "bg-white"}`}>
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <h3 className="text-2xl font-bold mb-4 text-slate-900">Layunin ng Sistema</h3>
          <p className="text-slate-500 leading-relaxed">
            Ang sistemang ito ay idinisenyo upang magbigay ng malinaw at 
            opisyal na impormasyon hinggil sa pamasahe ng mga pasahero. 
            Layunin nitong mapadali ang pagpaplano ng biyahe at matiyak 
            ang wastong singil batay sa distansya at ruta.
          </p>

          {/* Vehicle highlight pills */}
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            {VEHICLES.map((v) => (
              <span
                key={v.type}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-600"
              >
                <span>{v.emoji}</span> {v.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer/>
    </div>
  )
}