"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { user, isLoading, signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/movements")
    }
  }, [user, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-200"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-[400px] dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl dark:text-gray-200">Finance Tracker</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Inicia sesión para gestionar tus finanzas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={signIn}
            className="w-full"
            size="lg"
          >
            <Github className="mr-2 h-5 w-5" />
            Continuar con GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}