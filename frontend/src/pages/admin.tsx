import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminPage() {
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
          <form className="space-y-6">

            {/* Username */}
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder=" "
                className="peer h-12"
                required
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

            <Button type="submit" className="w-full h-11 cursor-pointer">
              Login
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
