import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post("/api/login", {
        username,
        password,
      })

      console.log("Login successful:", response.data)
      // i-redirect o gawin ang action pagkatapos ng successful login
      // halimbawa: router.push("/dashboard")

    } catch (err: any) {
      const message =
        err.response?.data?.message || "Invalid credentials. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Username */}
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder=" "
                className="peer h-12"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Label
                htmlFor="username"
                className="absolute left-3 top-3 text-sm text-muted-foreground
                transition-all
                peer-placeholder-shown:top-3
                peer-placeholder-shown:text-base
                peer-placeholder-shown:text-muted-foreground
                peer-focus:-top-2
                peer-focus:text-xs
                peer-focus:text-primary
                bg-background px-1"
              >
                Username
              </Label>
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder=" "
                className="peer h-12"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Label
                htmlFor="password"
                className="absolute left-3 top-3 text-sm text-muted-foreground
                transition-all
                peer-placeholder-shown:top-3
                peer-placeholder-shown:text-base
                peer-placeholder-shown:text-muted-foreground
                peer-focus:-top-2
                peer-focus:text-xs
                peer-focus:text-primary
                bg-background px-1"
              >
                Password
              </Label>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-11 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}