"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createMovement, updateMovement, Movement } from "@/lib/api/movements"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const movementSchema = z.object({
  amount: z.number()
    .positive("El monto debe ser positivo")
    .min(0.01, "El monto mínimo es 0.01"),
  concept: z.string()
    .min(3, "El concepto debe tener al menos 3 caracteres")
    .max(100, "El concepto no puede exceder 100 caracteres"),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido. Use YYYY-MM-DD"),
  type: z.enum(["INCOME", "EXPENSE"]),
})

type MovementFormValues = z.infer<typeof movementSchema>

interface MovementFormProps {
  movement?: Movement | null
  onSuccess: () => void
}

export function MovementForm({ movement, onSuccess }: MovementFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      amount: movement?.amount || undefined,
      concept: movement?.concept || "",
      date: movement?.date 
        ? new Date(movement.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      type: movement?.type || "INCOME",
    },
  })

  // Actualizar formulario cuando cambia el movimiento a editar
  useEffect(() => {
    if (movement) {
      form.reset({
        amount: movement.amount,
        concept: movement.concept,
        date: new Date(movement.date).toISOString().split('T')[0],
        type: movement.type,
      })
    }
  }, [movement, form])

  const onSubmit = async (data: MovementFormValues) => {
    try {
      setIsLoading(true)
      
      if (movement) {
        await updateMovement(movement.id, data)
        toast.success("Movimiento actualizado exitosamente")
      } else {
        await createMovement(data)
        toast.success("Movimiento creado exitosamente")
      }
      
      form.reset()
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar movimiento")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="concept"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concepto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Salario, Comida, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="INCOME">Ingreso</SelectItem>
                  <SelectItem value="EXPENSE">Egreso</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading 
            ? (movement ? "Actualizando..." : "Creando...")
            : (movement ? "Actualizar movimiento" : "Crear movimiento")
          }
        </Button>
      </form>
    </Form>
  )
}