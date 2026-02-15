import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/prisma/client"
import { getServerSession } from "@/lib/auth/getServerSession";
import { z } from "zod";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar usuarios
 *     description: Obtiene lista paginada de usuarios (solo administradores)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Resultados por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, USER]
 *         description: Filtrar por rol
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores
 */

// Schema para query params
const querySchema = z.object({
  page: z.string().optional().default("1").transform(Number).pipe(z.number().min(1)),
  limit: z.string().optional().default("10").transform(Number).pipe(z.number().min(1).max(100)),
  search: z.string().optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 🔥 HEADERS CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
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

  // Verificar rol de ADMIN
  if (session.user.role !== "ADMIN") {
    return res.status(403).json({ 
      error: "FORBIDDEN",
      message: "Solo los administradores pueden acceder a este recurso" 
    });
  }

  // =========================
  // GET /api/users
  // =========================
  if (req.method === "GET") {
    try {
      const query = querySchema.parse(req.query);

      const where: any = {};
      
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
        ];
      }

      if (query.role) {
        where.role = query.role;
      }

      const total = await prisma.user.count({ where });

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              movements: true,
              accounts: true,
              sessions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });

      return res.status(200).json({
        data: users,
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
          details: error.issues.map(err => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      console.error("Error en GET /users:", error);
      return res.status(500).json({ error: "Error al obtener usuarios" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}