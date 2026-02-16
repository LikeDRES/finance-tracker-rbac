/// context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/router"
import { toast } from "sonner"

interface User {
  id: string
  name: string | null
  email: string
  role: "ADMIN" | "USER"
  image?: string | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: () => void
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Función para verificar sesión usando fetch con credentials
  const checkSession = useCallback(async () => {
    setIsLoading(true)
    try {
      // ✅ Usar ruta relativa
      const res = await fetch('/api/auth/get-session', {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to fetch session")

      const data = await res.json()

      if (data?.user) {
        const userWithRole = data.user as typeof data.user & { role: "ADMIN" | "USER" }
        setUser({
          id: userWithRole.id,
          name: userWithRole.name,
          email: userWithRole.email,
          image: userWithRole.image ?? null,
          role: userWithRole.role,
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error checking session:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  // ✅ Redirección al login con GitHub - Ruta corregida
  const signIn = () => {
    window.location.href = '/api/auth/signin/social?provider=github'
  }

  // ✅ Cierre de sesión
  const signOut = async () => {
    try {
      await fetch('/api/auth/sign-out', {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
      toast.success("Sesión cerrada correctamente")
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Error al cerrar sesión")
    }
  }

  const refreshSession = async () => {
    await checkSession()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}