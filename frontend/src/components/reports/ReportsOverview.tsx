"use client"

import { useEffect, useState } from "react"
import { getReport, downloadReportCSV, ReportData } from "@/lib/api/reports"
import { ReportsChart } from "./ReportsChart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Download, TrendingDown, TrendingUp, Calendar, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function ReportsOverview() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async (start?: string, end?: string) => {
    try {
      setLoading(true)
      const reportData = await getReport(start, end)
      setData(reportData)
    } catch (error) {
      console.error("Error loading report:", error)
      toast.error("Error al cargar reporte")
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    loadReport(startDate || undefined, endDate || undefined)
  }

  // 🔥 NUEVA FUNCIÓN PARA LIMPIAR FILTROS
  const clearFilters = () => {
    setStartDate("")
    setEndDate("")
    loadReport() // Cargar sin filtros
  }

  const handleDownload = async () => {
    try {
      await downloadReportCSV()
      toast.success("Reporte descargado exitosamente")
    } catch (error) {
      toast.error("Error al descargar reporte")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: es })
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros de fecha */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Selecciona un rango de fechas para filtrar los reportes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[200px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha final</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[200px]"
              />
            </div>
            <Button onClick={handleFilter} variant="secondary">
              <Calendar className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            
            {/* 🔥 BOTÓN PARA LIMPIAR FILTROS */}
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-red-600"
              >
                <X className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            )}
            
            <Button onClick={handleDownload} className="ml-auto">
              <Download className="mr-2 h-4 w-4" />
              Descargar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <ReportsChart chartData={data.chartData} summary={data.summary} />

      {/* Usuarios con más movimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios con más movimientos</CardTitle>
          <CardDescription>
            Top 5 usuarios por cantidad de movimientos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Movimientos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.userStats.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || "Sin nombre"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user._count.movements}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Movimientos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos recientes</CardTitle>
          <CardDescription>
            Últimos 10 movimientos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">{movement.concept}</TableCell>
                  <TableCell className={movement.type === "INCOME" ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(movement.amount)}
                  </TableCell>
                  <TableCell>{formatDate(movement.date)}</TableCell>
                  <TableCell>{movement.user.name || movement.user.email}</TableCell>
                  <TableCell>
                    <Badge variant={movement.type === "INCOME" ? "default" : "destructive"}>
                      {movement.type === "INCOME" ? (
                        <><TrendingUp className="mr-1 h-3 w-3" /> Ingreso</>
                      ) : (
                        <><TrendingDown className="mr-1 h-3 w-3" /> Egreso</>
                      )}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}