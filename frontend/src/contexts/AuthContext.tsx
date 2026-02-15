"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

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
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: session } = await authClient.getSession()
      
      if (session?.user) {
        // Obtener el rol del usuario (por defecto ADMIN según tu BD)
        const userWithRole: User = {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: "ADMIN", // Temporal, puedes obtenerlo de session.user si viene
        }
        setUser(userWithRole)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error checking session:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: `${window.location.origin}/movements`
    })
  }

  const signOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setUser(null)
            toast.success("Sesión cerrada")
            router.push("/login")
          }
        }
      })
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Error al cerrar sesión")
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}