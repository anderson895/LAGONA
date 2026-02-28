import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const VEHICLES = [
  { type: "jeep", label: "Jeepney", emoji: "🚐" },
  { type: "tricycle", label: "Tricycle", emoji: "🛺" },
];

export default function About() {
  return (
    <div className="min-h-screen w-full bg-slate-50 font-body">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0a1a38] via-[#0f2044] to-[#1a3362] py-24">
        <div className="container mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Tungkol sa Amin
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
            Ang sistemang ito ay idinisenyo upang gabayan ang mga commuter at
            pasahero sa kanilang pagbiyahe, magbigay ng opisyal na impormasyon
            tungkol sa pamasahe, at mapadali ang pagpaplano ng ruta.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center space-y-12">
          <div>
            <div className="w-9 h-0.5 bg-amber-500 rounded-sm mb-2.5 mx-auto" />
            <h2 className="font-display text-2xl font-bold text-[#0f2044] mb-3">
              Layunin ng Sistema
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Ang goal ng system na ito ay magbigay ng malinaw at reliable na impormasyon tungkol sa pamasahe ng mga commuters. Pinapadali nito ang trip planning at sinisigurado na ang fares ay base sa rates na nakuha mula sa active jeepney at tricycle drivers at sa terminals.
            </p>
          </div>

          <div>
            <div className="w-9 h-0.5 bg-amber-500 rounded-sm mb-2.5 mx-auto" />
            <h2 className="font-display text-2xl font-bold text-[#0f2044] mb-3">
              Para sa mga Commuter
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Ang system na ito ay para sa mga commuters na taga-San Pedro, Santa Rosa, at Biñan na gustong magkaroon ng mabilis, accurate, at reliable na impormasyon tungkol sa pamasahe at mga ruta ng kanilang biyahe.
            </p>
          </div>

          <div>
            <div className="w-9 h-0.5 bg-amber-500 rounded-sm mb-2.5 mx-auto" />
            <h2 className="font-display text-2xl font-bold text-[#0f2044] mb-3">
              Mga Sasakyang Saklaw
            </h2>
            <div className="flex justify-center gap-4 flex-wrap mt-4">
              {VEHICLES.map((v) => (
                <Badge
                  key={v.type}
                  variant="outline"
                  className="flex items-center gap-2 text-sm px-4 py-2 bg-white border-[1.5px] border-slate-200 text-[#0f2044] hover:bg-white"
                >
                  <span>{v.emoji}</span> {v.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Optional Team / Info Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="w-9 h-0.5 bg-amber-500 rounded-sm mb-2.5 mx-auto" />
          <h2 className="font-display text-2xl font-bold text-[#0f2044] mb-6">
            Pangunahing Impormasyon
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Ang system na ito ay ginawa bilang bahagi ng isang community-based project para suportahan ang mga local commuters.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            Ang fare at route information ay directly gathered mula sa mga jeepney at tricycle drivers, pati na rin sa mga terminal sa mga nasabing lugar. Dahil dito, mas nasisigurado namin na ang data na nasa system ay updated, accurate, at based sa actual na sinisingil.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Maaaring gamitin ang system sa mga pangunahing terminal at bayan para mabilis na malaman ang information ng routes at estimated fare
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}