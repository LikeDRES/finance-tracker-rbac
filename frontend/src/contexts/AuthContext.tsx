"use client"

import { createContext, useContext, useEffect, useState } from "react"
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/api/auth/session`, {
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (res.ok) {
        const session = await res.json()
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            role: session.user.role || "ADMIN",
          })
        } else {
          setUser(null)
        }
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

  // 🔥 CAMBIADO: Redirección directa a GitHub
  const signIn = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    window.location.href = `${apiUrl}/api/auth/sign-in/github`
  }

  const signOut = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      await fetch(`${apiUrl}/api/auth/sign-out`, {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
      toast.success("Sesión cerrada")
      router.push("/login")
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