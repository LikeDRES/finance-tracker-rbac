"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  DollarSign,
  Users,
  BarChart3,
} from "lucide-react"

const menuItems = [
  {
    title: "Movimientos",
    href: "/movements",
    icon: DollarSign,
    roles: ["ADMIN", "USER"],
  },
  {
    title: "Usuarios",
    href: "/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    title: "Reportes",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN"],
  },
]

export function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  if (!user) return null

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  )

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start dark:text-gray-300 dark:hover:text-white ${
                isActive ? "dark:bg-gray-800" : ""
              }`}
              onClick={() => router.push(item.href)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}