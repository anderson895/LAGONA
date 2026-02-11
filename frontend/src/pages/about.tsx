import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const VEHICLES = [
  { type: "jeep", label: "Jeepney", emoji: "🚐" },
  { type: "bus", label: "Bus", emoji: "🚌" },
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
              Layunin naming magbigay ng malinaw at opisyal na impormasyon hinggil
              sa pamasahe ng mga pasahero. Pinapadali nito ang pagpaplano ng
              biyahe at matitiyak ang wastong singil batay sa distansya at ruta.
            </p>
          </div>

          <div>
            <div className="w-9 h-0.5 bg-amber-500 rounded-sm mb-2.5 mx-auto" />
            <h2 className="font-display text-2xl font-bold text-[#0f2044] mb-3">
              Para sa mga Commuter
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Ang sistemang ito ay para sa lahat ng mga pasahero at commuter na
              nais magkaroon ng mabilis at tumpak na impormasyon tungkol sa pamasahe
              at mga ruta sa kanilang pagbiyahe.
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
            Ang sistemang ito ay ginawa bilang bahagi ng proyektong pang-komunidad
            upang suportahan ang mga lokal na pasahero at commuter. Gumagamit kami
            ng opisyal na datos upang matiyak ang tama at patas na pamasahe.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Maaaring gamitin ang sistema sa mga pangunahing terminal at bayan upang
            mabilis malaman ang mga ruta at presyo ng pamasahe.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}