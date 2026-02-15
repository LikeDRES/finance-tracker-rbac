"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ReportsChartProps {
  chartData: any[]
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
  }
}

const COLORS = ["#10b981", "#ef4444", "#f59e0b"]

export function ReportsChart({ chartData, summary }: ReportsChartProps) {
  // Datos para el gráfico de pastel
  const pieData = [
    { name: "Ingresos", value: summary.totalIncome },
    { name: "Egresos", value: summary.totalExpense },
  ].filter(item => item.value > 0)

  // Procesar datos para el gráfico de barras
  const barData = chartData.reduce((acc: any[], item: any) => {
    const date = new Date(item.date).toLocaleDateString()
    const existing = acc.find(d => d.date === date)
    
    if (existing) {
      existing[item.type] = (existing[item.type] || 0) + (item._sum?.amount || 0)
    } else {
      acc.push({
        date,
        INCOME: item.type === "INCOME" ? item._sum?.amount || 0 : 0,
        EXPENSE: item.type === "EXPENSE" ? item._sum?.amount || 0 : 0,
      })
    }
    return acc
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gráfico de barras */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Movimientos por día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="INCOME" name="Ingresos" fill="#10b981" />
                <Bar dataKey="EXPENSE" name="Egresos" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de pastel */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de saldo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Ingresos:</span>
              <span className="text-green-600 font-bold text-lg">
                {formatCurrency(summary.totalIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Egresos:</span>
              <span className="text-red-600 font-bold text-lg">
                {formatCurrency(summary.totalExpense)}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-800 font-semibold">Saldo Actual:</span>
                <span className={`font-bold text-xl ${
                  summary.balance >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {formatCurrency(summary.balance)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}