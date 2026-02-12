import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calculator, ArrowRight, Loader2, Navigation, X } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import axios from "axios"

import JeepIcon from "@/components/icons/jeepney.svg";
import BusIcon from "@/components/icons/bus.svg";
import TricycleIcon from "@/components/icons/tricycle.svg";

// --- Types ---
type VehicleType = "jeep" | "bus" | "tricycle"

interface Route {
  id: string
  origin: string
  destination: string
  fare: number
  distance_km: number
  vehicle_type: string
}

interface FareResult {
  route: Route
  fare: number
  breakdown?: string
}

// --- Vehicle Config ---
const VEHICLES: { type: VehicleType; label: string; icon: string; desc: string }[] = [
  { type: "jeep", label: "Jeepney", icon: JeepIcon, desc: "Pinaka-popular" },
  { type: "bus", label: "Bus", icon: BusIcon, desc: "Pangmahabang biyahe" },
  { type: "tricycle", label: "Tricycle", icon: TricycleIcon, desc: "Pang-lokal" },
];


// --- Carousel Images ---
const CAROUSEL_IMAGES = [
  "https://jacliner.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fayala-malls.1aa92c67.jpg&w=640&q=75",
  "https://jacliner.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fone-ayala.1706dcd3.jpg&w=640&q=75",
  "https://jacliner.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fdalahican.44656faa.jpg&w=384&q=75",
  "https://jacliner.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcalamba.7cc2e2ee.jpg&w=640&q=75",
]

// API Base URL
const API_BASE_URL = "https://lagona-oz9x.vercel.app"

export default function Landing() {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null)
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FareResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [routesLoading, setRoutesLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([])
  
  // Suggestions state
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([])
  const [destSuggestions, setDestSuggestions] = useState<string[]>([])
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestSuggestions, setShowDestSuggestions] = useState(false)
  const [originFocusIndex, setOriginFocusIndex] = useState(-1)
  const [destFocusIndex, setDestFocusIndex] = useState(-1)

  // Refs for click outside
  const originRef = useRef<HTMLDivElement>(null)
  const destRef = useRef<HTMLDivElement>(null)

  // Carousel auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginSuggestions(false)
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Get unique origins and destinations
  const allOrigins = [...new Set(routes.map((r) => r.origin))].sort()
  const allDestinations = [...new Set(routes.map((r) => r.destination))].sort()

  // Filter origin suggestions based on input
  useEffect(() => {
    if (origin.trim() && routes.length > 0) {
      const filtered = allOrigins.filter((o) =>
        o.toLowerCase().includes(origin.toLowerCase())
      )
      setOriginSuggestions(filtered)
    } else {
      setOriginSuggestions(allOrigins)
    }
    setOriginFocusIndex(-1)
  }, [origin, routes])

  // Filter destination suggestions based on input AND selected origin
  useEffect(() => {
    if (routes.length > 0) {
      let availableDests = allDestinations

      // If origin is selected, only show destinations that have routes from that origin
      if (origin.trim()) {
        const routesFromOrigin = routes.filter(
          (r) => r.origin.toLowerCase() === origin.toLowerCase()
        )
        availableDests = [...new Set(routesFromOrigin.map((r) => r.destination))].sort()
      }

      if (destination.trim()) {
        const filtered = availableDests.filter((d) =>
          d.toLowerCase().includes(destination.toLowerCase())
        )
        setDestSuggestions(filtered)
      } else {
        setDestSuggestions(availableDests)
      }
    }
    setDestFocusIndex(-1)
  }, [destination, origin, routes])

  // Filter routes based on origin and destination input
  useEffect(() => {
    if (!selectedVehicle || routes.length === 0) {
      setFilteredRoutes([])
      return
    }

    const originLower = origin.toLowerCase().trim()
    const destLower = destination.toLowerCase().trim()

    if (!originLower && !destLower) {
      setFilteredRoutes(routes)
      return
    }

    const filtered = routes.filter((route) => {
      const matchOrigin = !originLower || route.origin.toLowerCase().includes(originLower)
      const matchDest = !destLower || route.destination.toLowerCase().includes(destLower)
      return matchOrigin && matchDest
    })

    setFilteredRoutes(filtered)
  }, [origin, destination, routes, selectedVehicle])

  const handleVehicleSelect = async (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle)
    setResult(null)
    setError(null)
    setOrigin("")
    setDestination("")
    setRoutes([])
    setFilteredRoutes([])
    setRoutesLoading(true)
    
    try {
      const res = await axios.get(`${API_BASE_URL}/api/routes`)
      const filteredRoutes = (res.data || []).filter(
        (route: Route) => route.vehicle_type === vehicle
      )
      setRoutes(filteredRoutes)
      setFilteredRoutes(filteredRoutes)
    } catch (err) {
      console.error("Error fetching routes:", err)
      setRoutes([])
      setFilteredRoutes([])
    } finally {
      setRoutesLoading(false)
    }
  }

  const handleCalculate = async () => {
    if (!selectedVehicle || !origin.trim() || !destination.trim()) return
    
    setLoading(true)
    setResult(null)
    setError(null)
    
    try {
      const matchingRoute = routes.find(
        (route) =>
          route.origin.toLowerCase() === origin.trim().toLowerCase() &&
          route.destination.toLowerCase() === destination.trim().toLowerCase()
      )

      if (matchingRoute) {
        setResult({
          route: matchingRoute,
          fare: matchingRoute.fare,
          breakdown: `${matchingRoute.vehicle_type} • ${matchingRoute.distance_km} km`
        })
        setError(null)
      } else {
        setError("Hindi mahanap ang eksaktong ruta. Mangyaring pumili mula sa available na mga ruta sa ibaba.")
        setResult(null)
      }
    } catch (err: any) {
      console.error("Error calculating fare:", err)
      setError(err?.response?.data?.message || "May error sa pagkalkula ng pamasahe. Subukan ulit.")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRouteCardClick = (route: Route) => {
    setOrigin(route.origin)
    setDestination(route.destination)
    
    setResult({
      route: route,
      fare: route.fare,
      breakdown: `${route.vehicle_type} • ${route.distance_km} km`
    })
    setError(null)
    
    document.getElementById('fareForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Handle keyboard navigation for origin suggestions
  const handleOriginKeyDown = (e: React.KeyboardEvent) => {
    if (!showOriginSuggestions || originSuggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setOriginFocusIndex((prev) =>
        prev < originSuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setOriginFocusIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (originFocusIndex >= 0) {
        setOrigin(originSuggestions[originFocusIndex])
        setShowOriginSuggestions(false)
      }
    } else if (e.key === "Escape") {
      setShowOriginSuggestions(false)
    }
  }

  // Handle keyboard navigation for destination suggestions
  const handleDestKeyDown = (e: React.KeyboardEvent) => {
    if (!showDestSuggestions || destSuggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setDestFocusIndex((prev) =>
        prev < destSuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setDestFocusIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (destFocusIndex >= 0) {
        setDestination(destSuggestions[destFocusIndex])
        setShowDestSuggestions(false)
      }
    } else if (e.key === "Escape") {
      setShowDestSuggestions(false)
    }
  }

  const canCalculate = !!selectedVehicle && origin.trim().length > 0 && destination.trim().length > 0

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        .font-display { font-family: 'Sora', sans-serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="font-body">
        <Navbar />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0a1a38] via-[#0f2044] to-[#1a3362] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,rgba(245,158,11,0.10)_0%,transparent_70%),radial-gradient(ellipse_40%_50%_at_5%_90%,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:48px_48px] pointer-events-none" />

          <div className="container mx-auto px-6 py-20 md:py-24 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="inline-flex items-center gap-1.5 bg-white/[0.08] border border-amber-500/35 text-amber-500 hover:bg-white/[0.12] font-display text-[10px] font-bold tracking-widest uppercase px-3.5 py-1 mb-5">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  Official Fare Inquiry System
                </Badge>

                <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-5 text-white">
                  A Digital Guide
                  <span className="block mt-1 text-amber-500">
                    for Provincial Commuters
                  </span>
                </h1>

                <p className="text-base md:text-lg leading-relaxed mb-8 text-white/65 max-w-[420px]">
                  Ibigay ang iyong pinanggalingan at patutunguhan upang malaman
                  ang kaukulang pamasahe batay sa umiiral na rate.
                </p>

                <div className="flex items-center gap-2 text-sm mb-10 text-white/42">
                  <Navigation className="w-4 h-4" />
                  Para sa mga commuter at pasahero ng terminal
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-[280px]">
                  {[
                    { label: "Sasakyan", value: "3" },
                    { label: "Ruta", value: routes.length.toString() || "0" },
                    { label: "Bayan", value: "12" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-white/[0.07] border border-white/10 rounded-xl p-3.5 text-center backdrop-blur-sm"
                    >
                      <div className="font-display text-xl font-bold text-amber-500">{s.value}</div>
                      <div className="text-xs mt-0.5 text-white/50">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden md:block h-[500px]">
                <div className="relative w-full h-full overflow-hidden rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.3)]">
                  <div
                    className="flex h-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                  >
                    {CAROUSEL_IMAGES.map((img, idx) => (
                      <div key={idx} className="min-w-full h-full relative">
                        <img src={img} alt={`Transport ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f2044]/40 to-transparent" />
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {CAROUSEL_IMAGES.map((_, idx) => (
                      <button
                        key={idx}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          idx === currentImageIndex
                            ? "w-6 bg-amber-500"
                            : "w-2 bg-white/40 hover:bg-white/60"
                        }`}
                        onClick={() => setCurrentImageIndex(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="leading-none -mb-px">
            <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full">
              <path d="M0 56 L0 28 Q360 0 720 28 Q1080 56 1440 28 L1440 56 Z" fill="#f8fafc" />
            </svg>
          </div>
        </section>

        {/* Fare Computation Section */}
        <section className="container mx-auto px-6 py-10" id="fareForm">
          <Card className="max-w-4xl mx-auto rounded-3xl shadow-[0_24px_64px_rgba(15,32,68,0.13),0_4px_16px_rgba(15,32,68,0.06)] border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0f2044] via-[#1e3d6e] to-[#1d4fad] px-7 py-4.5 flex items-center gap-3">
              <div className="w-8.5 h-8.5 rounded-lg bg-amber-500/[0.18] flex items-center justify-center">
                <Calculator className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="font-display font-semibold text-white text-[15px]">Fare Computation</p>
                <p className="text-xs text-white/48">Pumili ng sasakyan at ilagay ang detalye ng biyahe</p>
              </div>
            </div>

            <CardContent className="p-7 md:p-10 grid md:grid-cols-2 gap-8 ">
              {/* Left — Vehicle Selection */}
              <div>
                <div className="w-9 h-0.5 bg-amber-500 rounded-sm mb-2.5 " />
                <h2 className="font-display font-bold text-lg mb-1 text-[#0f2044]">Piliin ang Sasakyan</h2>
                <p className="text-sm mb-5 text-slate-600">Anong sasakyan ang iyong sasakay?</p>
                <div className="grid grid-cols-3 gap-3">
                  {VEHICLES.map((v) => (
                    <button
                      key={v.type}
                      onClick={() => handleVehicleSelect(v.type)}
                      className={`cursor-pointer flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all ${
                        selectedVehicle === v.type
                          ? "border-amber-500 bg-amber-50 shadow-[0_6px_18px_rgba(245,158,11,0.20)] -translate-y-0.5"
                          : "border-slate-200 bg-slate-50 hover:border-[#1a3362] hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,32,68,0.09)]"
                      }`}
                    >
                      {/* Replace emoji with SVG/Image */}
                      <img src={v.icon} alt={v.label} className="h-8 w-8" />

                      <span className={`font-display text-xs font-semibold ${
                        selectedVehicle === v.type ? "text-amber-900" : "text-[#0f2044]"
                      }`}>
                        {v.label}
                      </span>
                      <span className="text-[10px] text-slate-600">{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>


              {/* Right — Route Input */}
              <div>
                <div className="w-9 h-0.5 bg-amber-500 rounded-sm mb-2.5" />
                <h2 className="font-display font-bold text-lg mb-1 text-[#0f2044]">Ilagay ang Ruta</h2>
                <p className="text-sm mb-5 text-slate-600">Saan ka magmumula at pupunta?</p>

                {!selectedVehicle ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-xl bg-slate-50 border-[1.5px] border-dashed border-slate-200">
                    <span className="text-2xl">👆</span>
                    <p className="text-sm text-slate-600">Pumili muna ng sasakyan</p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {routesLoading && (
                      <div className="flex items-center gap-2 text-xs text-[#1a3362]">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Nilo-load ang mga available na ruta…
                      </div>
                    )}

                    {/* Origin Input with Suggestions */}
                    <div className="relative" ref={originRef}>
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 z-10" />
                      <input
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        onFocus={() => setShowOriginSuggestions(true)}
                        onKeyDown={handleOriginKeyDown}
                        placeholder="Pinanggalingan"
                        className="w-full pl-10 pr-9 py-3 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus:border-[#1a3362] focus:bg-white focus:ring-[3px] focus:ring-[#1a3362]/[0.08]"
                        autoComplete="off"
                      />
                      {origin && (
                        <button
                          onClick={() => {
                            setOrigin("")
                            setShowOriginSuggestions(false)
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Origin Suggestions Dropdown */}
                      {showOriginSuggestions && originSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-[1.5px] border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50">
                          {originSuggestions.map((suggestion, idx) => (
                            <button
                              key={suggestion}
                              onClick={() => {
                                setOrigin(suggestion)
                                setShowOriginSuggestions(false)
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                                idx === originFocusIndex ? "bg-slate-50" : ""
                              } ${idx === 0 ? "rounded-t-xl" : ""} ${
                                idx === originSuggestions.length - 1 ? "rounded-b-xl" : ""
                              }`}
                            >
                              <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0" />
                              <span className="text-slate-900">{suggestion}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Connector */}
                    <div className="flex justify-center">
                      <div className="rounded-full p-1.5 bg-slate-50 border-[1.5px] border-slate-200">
                        <ArrowRight className="w-3 h-3 rotate-90 text-slate-600" />
                      </div>
                    </div>

                    {/* Destination Input with Suggestions */}
                    <div className="relative" ref={destRef}>
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500 z-10" />
                      <input
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        onFocus={() => setShowDestSuggestions(true)}
                        onKeyDown={handleDestKeyDown}
                        placeholder="Patutunguhan"
                        className="w-full pl-10 pr-9 py-3 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus:border-[#1a3362] focus:bg-white focus:ring-[3px] focus:ring-[#1a3362]/[0.08]"
                        autoComplete="off"
                      />
                      {destination && (
                        <button
                          onClick={() => {
                            setDestination("")
                            setShowDestSuggestions(false)
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Destination Suggestions Dropdown */}
                      {showDestSuggestions && destSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-[1.5px] border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50">
                          {destSuggestions.map((suggestion, idx) => (
                            <button
                              key={suggestion}
                              onClick={() => {
                                setDestination(suggestion)
                                setShowDestSuggestions(false)
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                                idx === destFocusIndex ? "bg-slate-50" : ""
                              } ${idx === 0 ? "rounded-t-xl" : ""} ${
                                idx === destSuggestions.length - 1 ? "rounded-b-xl" : ""
                              }`}
                            >
                              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              <span className="text-slate-900">{suggestion}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Calculate Button */}
                    <Button
                      onClick={handleCalculate}
                      disabled={!canCalculate || loading}
                      className="w-full h-12 rounded-xl bg-gradient-to-br from-[#0f2044] to-[#1e3d6e] text-white font-semibold text-sm shadow-[0_4px_14px_rgba(15,32,68,0.22)] hover:shadow-[0_8px_22px_rgba(15,32,68,0.28)] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Kinukuha ang pamasahe…
                        </>
                      ) : (
                        <>
                          <Calculator className="w-4 h-4 mr-2" />
                          Kalkulahin ang Pamasahe
                        </>
                      )}
                    </Button>

                    {/* Error Message */}
                    {error && (
                      <div className="text-sm rounded-xl px-4 py-3 text-center bg-red-50 border-[1.5px] border-red-200 text-red-500 animate-in fade-in">
                        {error}
                      </div>
                    )}

                    {/* Result Card */}
                    {result && (
                      <Card className="bg-gradient-to-br from-[#0f2044] to-[#1e3d6e] border-0 rounded-2xl p-5 text-center shadow-[0_8px_28px_rgba(15,32,68,0.22)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-white/45">
                          Pamasahe
                        </p>
                        <p className="font-display text-4xl font-bold mb-2 text-amber-500">
                          ₱{result.fare?.toFixed(2)}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm mb-2 text-white/80">
                          <span>{result.route?.origin}</span>
                          <ArrowRight className="w-3 h-3 text-white/35" />
                          <span>{result.route?.destination}</span>
                        </div>
                        {result.route?.distance_km && (
                          <p className="text-xs text-white/40">{result.route.distance_km} km</p>
                        )}
                        {result.breakdown && (
                          <p className="text-xs mt-2 rounded-lg px-3 py-1.5 bg-white/[0.07] text-white/55">
                            {result.breakdown}
                          </p>
                        )}
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Available Routes Section */}
        {selectedVehicle && (
          <section className="py-12 border-t bg-white">
            <div className="container mx-auto px-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                  <div className="w-9 h-0.5 bg-amber-500 rounded-sm mb-2.5" />
                  <h3 className="font-display text-2xl font-bold text-[#0f2044]">
                    {origin || destination ? "Mga Tugmang Ruta" : "Mga Available na Ruta"}
                  </h3>
                  <p className="text-sm mt-1 text-slate-600">
                   
                    {VEHICLES.find((v) => v.type === selectedVehicle)?.label} — 
                    {origin || destination ? " mga ruta base sa iyong search" : " lahat ng available na ruta"}
                  </p>
                </div>
                {!routesLoading && filteredRoutes.length > 0 && (
                  <Badge className="self-start text-sm font-semibold px-4 py-1.5 bg-amber-100 text-amber-900 border-[1.5px] border-amber-200 hover:bg-amber-100">
                    {filteredRoutes.length} ruta
                  </Badge>
                )}
              </div>

              {routesLoading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-600">
                  <Loader2 className="w-7 h-7 animate-spin text-[#1a3362]" />
                  <p className="text-sm">Nilo-load ang mga ruta…</p>
                </div>
              )}

              {!routesLoading && filteredRoutes.length === 0 && routes.length > 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-600">
                  <div className="text-[44px]">🔍</div>
                  <p className="text-sm font-semibold">Walang tugmang ruta</p>
                  <p className="text-xs text-slate-500">Subukan ang ibang pinanggalingan o patutunguhan</p>
                </div>
              )}

              {!routesLoading && routes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-600">
                  <div className="text-[44px]">🗺️</div>
                  <p className="text-sm">Walang available na ruta para sa sasakyang ito.</p>
                </div>
              )}

              {!routesLoading && filteredRoutes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRoutes.map((route) => (
                    <Card
                      key={route.id}
                      onClick={() => handleRouteCardClick(route)}
                      className="border-[1.5px] border-slate-200 rounded-2xl p-4 cursor-pointer transition-all hover:border-amber-500 hover:shadow-[0_6px_20px_rgba(15,32,68,0.08)] hover:-translate-y-0.5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center pt-0.5 gap-1 shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_0_3px_#d1fae5]" />
                          <div className="w-px h-6 bg-slate-200" />
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_0_3px_#fee2e2]" />
                        </div>
                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                              Mula
                            </p>
                            <p className="text-sm font-semibold truncate text-[#0f2044]">{route.origin}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                              Papunta
                            </p>
                            <p className="text-sm font-semibold truncate text-[#0f2044]">{route.destination}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 flex items-center justify-between border-t-[1.5px] border-slate-200">
                        {route.distance_km && (
                          <span className="text-xs text-slate-600">{route.distance_km} km</span>
                        )}
                        <span className="font-display font-bold text-base ml-auto text-[#0f2044]">
                          ₱{route.fare?.toFixed(2)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        
        <section className="py-14 border-t bg-slate-50">
          <div className="container mx-auto px-6 text-center max-w-[560px]">
            <div className="flex justify-center">
              <div className="w-9 h-0.5 bg-amber-500 rounded-sm mb-2.5" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-4 text-[#0f2044]">Layunin ng Sistema</h3>
            <p className="leading-relaxed text-sm md:text-base text-slate-600">
              Ang sistemang ito ay idinisenyo upang magbigay ng malinaw at opisyal na impormasyon
              hinggil sa pamasahe ng mga pasahero. Layunin nitong mapadali ang pagpaplano ng biyahe
              at matiyak ang wastong singil batay sa distansya at ruta.
            </p>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  )
}