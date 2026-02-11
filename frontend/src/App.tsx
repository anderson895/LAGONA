import Landing from "./pages/landing" 
import About from "./pages/about" 
import RoutesPage from "./pages/routes"
import Vehicle from "./pages/vehicle"
import { Routes,Route } from "react-router-dom"

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/About' element={<About/>}/>
        <Route path='/Ruta' element={<RoutesPage/>}/>
        <Route path='/Vehicle' element={<Vehicle/>}/>
      </Routes>
     
    </div>
  )
}

export default App