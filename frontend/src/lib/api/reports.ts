const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface ReportSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  totalMovements: number
}

export interface ChartDataPoint {
  date: string
  type: "INCOME" | "EXPENSE"
  _sum: {
    amount: number
  }
}

export interface ReportData {
  summary: ReportSummary
  recentMovements: any[]
  userStats: Array<{
    id: string
    name: string | null
    email: string
    _count: {
      movements: number
    }
  }>
  chartData: ChartDataPoint[]
}

export async function getReport(startDate?: string, endDate?: string) {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)
  
  const res = await fetch(`${API_URL}/api/reports?${params}`, {
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error("Error al obtener reportes")
  }

  return res.json() as Promise<ReportData>
}

export async function downloadReportCSV() {
  const res = await fetch(`${API_URL}/api/reports/csv`, {
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error("Error al descargar reporte")
  }

  // Obtener el blob del CSV
  const blob = await res.blob()
  
  // Crear URL de descarga
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}