"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
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

  /**
   * 🔎 Verifica sesión contra tu API local (mismo dominio)
   */
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      if (!res.ok) {
        setUser(null)
        return
      }

      const session = await res.json()

      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image ?? null,
          role: session.user.role, // ❗ no forzar ADMIN
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

  /**
   * 🔐 Login → redirección directa
   */
  const signIn = () => {
    window.location.href = "/api/auth/sign-in/github"
  }

  /**
   * 🚪 Logout limpio
   */
  const signOut = async () => {
    try {
      const res = await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error("Logout failed")
      }

      setUser(null)
      toast.success("Sesión cerrada correctamente")
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Error al cerrar sesión")
    }
  }

  /**
   * 🔄 Permite refrescar sesión manualmente si lo necesitas
   */
  const refreshSession = async () => {
    setIsLoading(true)
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
