import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../prisma/client";
import { getServerSession } from "@/lib/auth/getServerSession";
import { z } from "zod";
import { createMovementSchema } from "@/validations/movement";
/**
 * @swagger
 * /api/movements:
 *   get:
 *     summary: Listar movimientos
 *     description: Obtiene lista paginada de movimientos. Los usuarios solo ven sus movimientos, los admins ven todos.
 *     tags: [Movements]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filtrar por tipo de movimiento
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial para filtrar
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final para filtrar
 *     responses:
 *       200:
 *         description: Lista de movimientos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movement'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Prohibido (rol insuficiente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
 
 /**
 * @swagger
 * /api/movements:
 *   post:
 *     summary: Crear movimiento
 *     description: Crea un nuevo movimiento (solo administradores)
 *     tags: [Movements]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - concept
 *               - date
 *               - type
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Monto del movimiento
 *               concept:
 *                 type: string
 *                 description: Concepto del movimiento
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Fecha del movimiento (YYYY-MM-DD)
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *                 description: Tipo de movimiento
 *     responses:
 *       201:
 *         description: Movimiento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Movement'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores
 */

// Schema para validar query params
const querySchema = z.object({
  page: z.string().optional().default("1").transform(Number).pipe(z.number().min(1)),
  limit: z.string().optional().default("10").transform(Number).pipe(z.number().min(1).max(100)),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  startDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  userId: z.string().cuid().optional(),
  search: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verificar autenticación
  const session = await getServerSession(req);
  
  if (!session) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const userRole = session.user.role;
  const userId = session.user.id;

  // =========================
  // GET /api/movements
  // =========================
  if (req.method === "GET") {
    try {
      // Validar query params
      const query = querySchema.parse(req.query);

      // Construir filtros
      const where: any = {};

      // Filtro por usuario
      if (userRole !== "ADMIN") {
        where.userId = userId;
      } else if (query.userId) {
        where.userId = query.userId;
      }

      // Filtrar por tipo (solo si existe)
      if (query.type) {
        where.type = query.type;
      }

      //  Filtrar por rango de fechas
      if (query.startDate || query.endDate) {
        where.date = {};
        if (query.startDate) where.date.gte = query.startDate;
        if (query.endDate) where.date.lte = query.endDate;
      }

      // Búsqueda por concepto
      if (query.search && query.search.trim() !== "") {
        where.concept = {
          contains: query.search,
          mode: 'insensitive',
        };
      }

      // Calcular total de registros
      const total = await prisma.movement.count({ where });

      // Obtener movimientos con paginación
      const movements = await prisma.movement.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { date: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });

      return res.status(200).json({
        data: movements,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          pages: Math.ceil(total / query.limit),
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          details: error.issues,
        });
      }
      console.error("Error en GET /movements:", error);
      return res.status(500).json({ error: "Error al obtener movimientos" });
    }
  }

  // =========================
  // POST /api/movements
  // =========================
  if (req.method === "POST") {
    try {
      if (userRole !== "ADMIN") {
        return res.status(403).json({ 
          error: "FORBIDDEN",
          message: "Solo los administradores pueden crear movimientos" 
        });
      }

      const validatedData = createMovementSchema.parse(req.body);

      const movement = await prisma.movement.create({
        data: {
          amount: validatedData.amount,
          concept: validatedData.concept,
          date: validatedData.date,
          type: validatedData.type,
          userId: userId,
        },
        include: {
          user: { select: { name: true, email: true } },
        },
      });

      return res.status(201).json({
        message: "Movimiento creado exitosamente",
        data: movement,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          details: error.issues.map(err => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      console.error("Error en POST /movements:", error);
      return res.status(500).json({ error: "Error al crear movimiento" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}