const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: "ADMIN" | "USER"
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    movements: number
    accounts: number
    sessions: number
  }
}

export interface UsersResponse {
  data: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  role?: "ADMIN" | "USER"
}

export async function getUsers(filters: UserFilters = {}) {
  const params = new URLSearchParams()
  
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())
  if (filters.search) params.append('search', filters.search)
  if (filters.role) params.append('role', filters.role)
  
  const res = await fetch(`${API_URL}/api/users?${params}`, {
    credentials: "include",
  })
  
  if (!res.ok) {
    throw new Error("Error al obtener usuarios")
  }
  
  return res.json() as Promise<UsersResponse>
}

export async function updateUser(id: string, data: {
  name?: string
  phone?: string | null
  role?: "ADMIN" | "USER"
}) {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Error al actualizar usuario")
  }

  return res.json()
}

// ELIMINAR USUARIO (FRONTEND)
export async function deleteUser(id: string) {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Error al eliminar usuario")
  }

  return true
}