"use client"
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowRight, Loader2 } from "lucide-react";

const VEHICLES = [
  { type: "jeep", label: "Jeepney", emoji: "🚐" },
  { type: "bus", label: "Bus", emoji: "🚌" },
  { type: "tricycle", label: "Tricycle", emoji: "🛺" },
];

interface Route {
  id: string;
  origin: string;
  destination: string;
  fare: number;
  distance_km: number;
}

export default function RoutesPage() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedVehicle) return;
    setLoading(true);
    setError(null);
    axios
      .get(`/api/routes`, { params: { vehicle_type: selectedVehicle } })
      .then((res) => setRoutes(res.data.routes ?? []))
      .catch(() => setError("Hindi ma-load ang mga ruta."))
      .finally(() => setLoading(false));
  }, [selectedVehicle]);

  return (
    <div className="min-h-screen w-full bg-slate-50 font-body">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0a1a38] via-[#0f2044] to-[#1a3362] py-24">
        <div className="container mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Mga Ruta
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
            Pumili ng sasakyan upang makita ang mga available na ruta, pamasahe, at distansya.
          </p>
        </div>
      </section>

      {/* Vehicle Selector */}
      <section className="py-12">
        <div className="container mx-auto px-6 flex justify-center gap-4 flex-wrap">
          {VEHICLES.map((v) => (
            <Badge
              key={v.type}
              variant={selectedVehicle === v.type ? "default" : "outline"}
              className={`flex items-center gap-2 text-sm px-4 py-2 cursor-pointer ${
                selectedVehicle === v.type ? "bg-amber-500 text-white border-none" : "bg-white text-[#0f2044] border-slate-200"
              }`}
              onClick={() => setSelectedVehicle(v.type)}
            >
              <span>{v.emoji}</span> {v.label}
            </Badge>
          ))}
        </div>
      </section>

      {/* Routes List */}
      <section className="container mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" /> Nilo-load ang mga ruta…
          </div>
        )}

        {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && selectedVehicle && routes.length === 0 && !error && (
          <p className="text-gray-500 text-center mt-10">Walang available na ruta para sa sasakyang ito.</p>
        )}

        {!loading && routes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-xl p-4 shadow hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 uppercase">Mula</span>
                  <p className="font-semibold">{route.origin}</p>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400 uppercase">Papunta</span>
                  <p className="font-semibold">{route.destination}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-3">
                  <span>{route.distance_km} km</span>
                  <span>₱{route.fare?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}