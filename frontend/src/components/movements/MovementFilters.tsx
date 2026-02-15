import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface MovementFiltersProps {
  onFilterChange: (filters: any) => void
}

export function MovementFilters({ onFilterChange }: MovementFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [type, setType] = useState<string>("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Efecto para aplicar filtros cuando cambian
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters: any = {}
      
      if (searchTerm) filters.search = searchTerm
      if (type && type !== "all") filters.type = type
      if (startDate) filters.startDate = startDate
      if (endDate) filters.endDate = endDate
      
      console.log("📊 Aplicando filtros:", filters)
      onFilterChange(filters)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, type, startDate, endDate, onFilterChange])

  const clearFilters = () => {
    setSearchTerm("")
    setType("")
    setStartDate("")
    setEndDate("")
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Búsqueda en tiempo real */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por concepto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="INCOME">Ingresos</SelectItem>
            <SelectItem value="EXPENSE">Egresos</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            placeholder="Fecha inicial"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[160px]"
          />
          <span className="text-gray-500">a</span>
          <Input
            type="date"
            placeholder="Fecha final"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[160px]"
          />
        </div>

        {(searchTerm || type || startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-600"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}