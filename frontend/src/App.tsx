import { Button } from "@/components/ui/button"
import Landing from "./pages/landing" 
import { Routes,Route } from "react-router-dom"

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Routes>
        <Route path='/' element={<Landing/>}/>
      </Routes>
     
    </div>
  )
}

export default App