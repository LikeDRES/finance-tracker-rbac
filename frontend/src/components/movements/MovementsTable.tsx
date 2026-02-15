"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getMovements, deleteMovement, Movement, MovementsResponse } from "@/lib/api/movements"
import { MovementFilters } from "./MovementFilters"
import { MovementForm } from "./MovementForm"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { PlusCircle, MoreHorizontal, TrendingDown, TrendingUp, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function MovementsTable() {
  const { user } = useAuth()
  const [movements, setMovements] = useState<Movement[]>([])
  const [pagination, setPagination] = useState<MovementsResponse["pagination"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({})
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [movementToDelete, setMovementToDelete] = useState<Movement | null>(null)

  useEffect(() => {
    loadMovements()
  }, [page, filters])

  const loadMovements = async () => {
    try {
      setLoading(true)
      const data = await getMovements({ 
        page, 
        limit: 10,
        ...filters,
      })
      setMovements(data.data)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error loading movements:", error)
      toast.error("Error al cargar movimientos")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!movementToDelete) return
    
    try {
      await deleteMovement(movementToDelete.id)
      toast.success("Movimiento eliminado exitosamente")
      loadMovements()
    } catch (error) {
      toast.error("Error al eliminar movimiento")
    } finally {
      setDeleteDialogOpen(false)
      setMovementToDelete(null)
    }
  }

  const handleEdit = (movement: Movement) => {
    setEditingMovement(movement)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingMovement(null)
    setFilters({}) // Limpiar filtros después de crear/editar
    setPage(1) // Volver a página 1
    loadMovements()
    toast.success(editingMovement ? "Movimiento actualizado" : "Movimiento creado")
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

  if (loading && movements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movimientos</CardTitle>
          <CardDescription>Cargando movimientos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Movimientos</CardTitle>
            <CardDescription>
              Lista de ingresos y egresos registrados
            </CardDescription>
          </div>
          {user?.role === "ADMIN" && (
            <Button onClick={() => {
              setEditingMovement(null)
              setIsFormOpen(true)
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <MovementFilters onFilterChange={setFilters} />
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Tipo</TableHead>
                {user?.role === "ADMIN" && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.role === "ADMIN" ? 6 : 5} className="text-center py-8 text-gray-500">
                    No hay movimientos registrados
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => (
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
                    {user?.role === "ADMIN" && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(movement)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setMovementToDelete(movement)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-gray-500">
                Página {pagination.page} de {pagination.pages}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === pagination.pages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear/editar */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingMovement ? "Editar movimiento" : "Nuevo movimiento"}
            </DialogTitle>
            <DialogDescription>
              {editingMovement 
                ? "Modifica los datos del movimiento financiero."
                : "Ingresa los datos del nuevo movimiento financiero."}
            </DialogDescription>
          </DialogHeader>
          <MovementForm 
            movement={editingMovement}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el movimiento
              &quot;{movementToDelete?.concept}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}