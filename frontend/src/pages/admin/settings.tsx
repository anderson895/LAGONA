import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import AdminLayout from "@/components/AdminLayout"
import {
  User,
  Mail,
  Lock,
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react"

// API Configuration
const API_BASE_URL = "http://localhost:5000/api"

interface UserData {
  id: string
  username: string
  email: string
  is_admin: boolean
  is_active: boolean
}

interface ProfileFormData {
  username: string
  email: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function Account_setting() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: "",
    email: "",
  })

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({
    profile: "",
    password: "",
  })

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      if (!token) {
        alert("Please login first")
        return
      }

      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setUser(response.data)
      setProfileForm({
        username: response.data.username,
        email: response.data.email,
      })
    } catch (error: any) {
      console.error("Error fetching user data:", error)
      alert("Failed to load user data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  // Update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    try {
      setSaving(true)
      setErrors({ ...errors, profile: "" })

      const token = localStorage.getItem("token")
      await axios.put(
        `${API_BASE_URL}/users/${user.id}`,
        {
          username: profileForm.username,
          email: profileForm.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      alert("Profile updated successfully")
      fetchUserData()
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setErrors({
        ...errors,
        profile: error.response?.data?.message || "Failed to update profile",
      })
      alert(error.response?.data?.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors({ ...errors, password: "New passwords do not match" })
      alert("New passwords do not match")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setErrors({ ...errors, password: "Password must be at least 6 characters" })
      alert("Password must be at least 6 characters")
      return
    }

    try {
      setSaving(true)
      setErrors({ ...errors, password: "" })

      const token = localStorage.getItem("token")
      await axios.put(
        `${API_BASE_URL}/users/${user.id}`,
        {
          password: passwordForm.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      alert("Password changed successfully")
      
      // Reset password form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      console.error("Error changing password:", error)
      setErrors({
        ...errors,
        password: error.response?.data?.message || "Failed to change password",
      })
      alert(error.response?.data?.message || "Failed to change password")
    } finally {
      setSaving(false)
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U"
    return user.username.substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading account settings...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Overview Card */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-background shadow-lg">
                <AvatarFallback className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2">
                  <h2 className="text-xl sm:text-2xl font-bold">{user?.username}</h2>
                  <div className="flex items-center gap-2">
                    {user?.is_admin && (
                      <Badge variant="default" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                    {user?.is_active ? (
                      <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-red-600 border-red-600">
                        <XCircle className="h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your account's profile information and email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={profileForm.username}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, username: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {errors.profile && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="break-words">{errors.profile}</span>
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              Ensure your account is using a long, random password to stay secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium">Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>At least 6 characters long</li>
                    <li>New password must match confirmation</li>
                  </ul>
                </div>
              </div>

              {errors.password && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="break-words">{errors.password}</span>
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Account Status</CardTitle>
            </div>
            <CardDescription>Information about your account status and role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border">
                <div className="flex-1">
                  <p className="font-medium">Account Type</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.is_admin ? "Administrator" : "Regular User"}
                  </p>
                </div>
                {user?.is_admin ? (
                  <Badge className="gap-1 self-start sm:self-auto">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 self-start sm:self-auto">
                    <User className="h-3 w-3" />
                    User
                  </Badge>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border">
                <div className="flex-1">
                  <p className="font-medium">Account Status</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.is_active ? "Active and operational" : "Account is inactive"}
                  </p>
                </div>
                {user?.is_active ? (
                  <Badge variant="outline" className="gap-1 text-green-600 border-green-600 self-start sm:self-auto">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-red-600 border-red-600 self-start sm:self-auto">
                    <XCircle className="h-3 w-3" />
                    Inactive
                  </Badge>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border">
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground font-mono break-all">{user?.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}