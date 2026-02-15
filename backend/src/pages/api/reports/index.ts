import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/getServerSession";
import { MovementType } from "@prisma/client";

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Obtener reporte financiero
 *     description: Genera reporte con saldo actual y estadísticas (solo administradores)
 *     tags: [Reports]
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *         description: Reporte generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalIncome:
 *                       type: number
 *                     totalExpense:
 *                       type: number
 *                     balance:
 *                       type: number
 *                     totalMovements:
 *                       type: integer
 *                 recentMovements:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movement'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // HEADERS CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
      message: "Solo los administradores pueden ver reportes" 
    });
  }

  // =========================
  // GET /api/reports
  // =========================
  if (req.method === "GET") {
    try {
      // Obtener parámetros de fecha (opcional)
      const { startDate, endDate } = req.query;
      
      const dateFilter: any = {};
      if (startDate || endDate) {
        dateFilter.date = {};
        if (startDate) dateFilter.date.gte = new Date(startDate as string);
        if (endDate) dateFilter.date.lte = new Date(endDate as string);
      }

      // 1. Calcular saldo actual
      const [incomeResult, expenseResult] = await Promise.all([
        prisma.movement.aggregate({
          where: { 
            type: MovementType.INCOME,
            ...dateFilter,
          },
          _sum: { amount: true },
        }),
        prisma.movement.aggregate({
          where: { 
            type: MovementType.EXPENSE,
            ...dateFilter,
          },
          _sum: { amount: true },
        }),
      ]);

      const totalIncome = incomeResult._sum.amount || 0;
      const totalExpense = expenseResult._sum.amount || 0;
      const balance = totalIncome - totalExpense;

      // 2. Obtener últimos movimientos
      const recentMovements = await prisma.movement.findMany({
        where: dateFilter,
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { date: "desc" },
        take: 10,
      });

      // 3. Estadísticas por usuario
      const userStats = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          _count: {
            select: { movements: true },
          },
        },
        orderBy: {
          movements: {
            _count: "desc",
          },
        },
        take: 5,
      });

      // 4. Datos para gráfico (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const movementsByDay = await prisma.movement.groupBy({
        by: ['date', 'type'],
        where: {
          date: { gte: thirtyDaysAgo },
          ...dateFilter,
        },
        _sum: { amount: true },
        orderBy: { date: 'asc' },
      });

      return res.status(200).json({
        summary: {
          totalIncome,
          totalExpense,
          balance,
          totalMovements: recentMovements.length,
        },
        recentMovements,
        userStats,
        chartData: movementsByDay,
      });

    } catch (error) {
      console.error("Error en GET /reports:", error);
      return res.status(500).json({ error: "Error al generar reporte" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}