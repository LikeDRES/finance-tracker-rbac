const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface Movement {
  id: string
  amount: number
  concept: string
  date: string
  type: "INCOME" | "EXPENSE"
  userId: string
  user: {
    name: string | null
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface MovementsResponse {
  data: Movement[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface MovementFilters {
  page?: number
  limit?: number
  type?: "INCOME" | "EXPENSE"
  startDate?: string
  endDate?: string
  search?: string
}

export async function getMovements(filters: MovementFilters = {}) {
  const params = new URLSearchParams()
  
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())
  if (filters.type) params.append('type', filters.type)
  if (filters.startDate) params.append('startDate', filters.startDate)
  if (filters.endDate) params.append('endDate', filters.endDate)
  if (filters.search) params.append('search', filters.search)
  
  const res = await fetch(`${API_URL}/api/movements?${params}`, {
    credentials: "include",
  })
  
  if (!res.ok) {
    throw new Error("Error al obtener movimientos")
  }
  
  return res.json() as Promise<MovementsResponse>
}

export async function createMovement(data: {
  amount: number
  concept: string
  date: string
  type: "INCOME" | "EXPENSE"
}) {
  const res = await fetch(`${API_URL}/api/movements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Error al crear movimiento")
  }

  return res.json()
}

export async function updateMovement(id: string, data: {
  amount?: number
  concept?: string
  date?: string
  type?: "INCOME" | "EXPENSE"
}) {
  const res = await fetch(`${API_URL}/api/movements/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Error al actualizar movimiento")
  }

  return res.json()
}

export async function deleteMovement(id: string) {
  const res = await fetch(`${API_URL}/api/movements/${id}`, {
    method: "DELETE",
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Error al eliminar movimiento")
  }

  return true
}