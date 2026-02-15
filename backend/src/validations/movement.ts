import { z } from "zod";
import { MovementType } from "@prisma/client";

// Esquema para crear un movimiento
export const createMovementSchema = z.object({
  amount: z.number()
    .positive("El monto debe ser positivo")
    .min(0.01, "El monto mínimo es 0.01")
    .max(9999999.99, "El monto máximo es 9,999,999.99"),

  concept: z.string()
    .min(3, "El concepto debe tener al menos 3 caracteres")
    .max(100, "El concepto no puede exceder 100 caracteres")
    .trim()
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, "El concepto solo puede contener letras, números, espacios, guiones y puntos"),

  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido. Use YYYY-MM-DD")
    .transform((str) => new Date(str))
    .refine((date) => date <= new Date(), "La fecha no puede ser futura")
    .refine((date) => date >= new Date("1900-01-01"), "La fecha es demasiado antigua"),

  type: z.enum([MovementType.INCOME, MovementType.EXPENSE]),
});

// Esquema para actualizar un movimiento
export const updateMovementSchema = createMovementSchema.partial();

// Esquema para parámetros de consulta (GET) - VERSIÓN CORREGIDA
export const queryMovementsSchema = z.object({
  page: z.string().optional().default("1").transform(Number).pipe(z.number().min(1)),
  limit: z.string().optional().default("10").transform(Number).pipe(z.number().min(1).max(100)),
  startDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  type: z.enum([MovementType.INCOME, MovementType.EXPENSE]).optional(),
  userId: z.string().cuid().optional(),
  search: z.string().optional(), // ← AGREGADO para búsqueda por concepto
});

// Tipos inferidos
export type CreateMovementInput = z.infer<typeof createMovementSchema>;
export type UpdateMovementInput = z.infer<typeof updateMovementSchema>;
export type QueryMovementsInput = z.infer<typeof queryMovementsSchema>;