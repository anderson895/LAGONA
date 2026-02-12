import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Lock, User, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const API_BASE_URL = "https://lagona-oz9x.vercel.app"

export default function LoginAdmin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username,
        password,
      })

      console.log("Login successful:", response.data)

      // Store token and user info in localStorage
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      // Redirect to dashboard
      window.location.href = "/admin/dashboard"

    } catch (err: any) {
      console.error("Login error:", err)
      const message =
        err.response?.data?.message || "Invalid credentials. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1a38] via-[#0f2044] to-[#1a3362] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,rgba(245,158,11,0.10)_0%,transparent_70%),radial-gradient(ellipse_40%_50%_at_5%_90%,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:48px_48px] pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl border-0 relative z-10 bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#0f2044] to-[#1e3d6e] flex items-center justify-center mb-2 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#0f2044]">Admin Login</CardTitle>
          <CardDescription className="text-slate-600">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-slate-700">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="pl-10 h-12 border-slate-200 focus:border-[#1a3362] focus:ring-[#1a3362]/20 bg-white"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 h-12 border-slate-200 focus:border-[#1a3362] focus:ring-[#1a3362]/20 bg-white"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-br from-[#0f2044] to-[#1e3d6e] hover:shadow-lg transition-all hover:-translate-y-0.5 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Login
                </>
              )}
            </Button>
          </form>

          {/* <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-center space-y-2">
              <p className="text-xs text-slate-500">
                🔒 Protected by JWT authentication
              </p>
              <p className="text-xs text-slate-400">
                Default credentials: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#0f2044] font-mono">admin</code> / <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#0f2044] font-mono">admin123</code>
              </p>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  )
}