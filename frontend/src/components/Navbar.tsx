import { Button } from "@/components/ui/button"
import { Bus } from "lucide-react"
import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Bus className="text-blue-600" />
          <h1 className="text-xl font-bold">LAGONA</h1>
        </div>

        {/* Links */}
        <div className="flex gap-4 items-center">
          <Button variant="ghost" asChild>
            <Link to="vehicle">Vehicle</Link>
          </Button>

          <Button variant="ghost" asChild>
            <Link to="routes">Routes</Link>
          </Button>

          <Button variant="ghost" asChild>
            <Link to="about">About us</Link>
          </Button>

          <Button asChild>
            <Link to="#">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}