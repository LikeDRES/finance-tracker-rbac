import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/getServerSession";
import { MovementType } from "@prisma/client";

/**
 * @swagger
 * /api/reports/csv:
 *   get:
 *     summary: Descargar reporte CSV
 *     description: Genera y descarga un archivo CSV con todos los movimientos (solo administradores)
 *     tags: [Reports]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Archivo CSV descargado
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 🔥 HEADERS CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
      message: "Solo los administradores pueden descargar reportes" 
    });
  }

  // =========================
  // GET /api/reports/csv
  // =========================
  if (req.method === "GET") {
    try {
      // Obtener todos los movimientos para el CSV
      const movements = await prisma.movement.findMany({
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { date: "desc" },
      });

      // Calcular totales
      const totalIncome = movements
        .filter(m => m.type === MovementType.INCOME)
        .reduce((sum, m) => sum + m.amount, 0);
      
      const totalExpense = movements
        .filter(m => m.type === MovementType.EXPENSE)
        .reduce((sum, m) => sum + m.amount, 0);
      
      const balance = totalIncome - totalExpense;

      // Crear contenido CSV
      let csv = "=== REPORTE FINANCIERO ===\n";
      csv += `Generado el: ${new Date().toLocaleString()}\n`;
      csv += `Total Ingresos: $${totalIncome}\n`;
      csv += `Total Egresos: $${totalExpense}\n`;
      csv += `Saldo Actual: $${balance}\n`;
      csv += `Total Movimientos: ${movements.length}\n\n`;
      
      csv += "=== DETALLE DE MOVIMIENTOS ===\n";
      csv += "ID,Fecha,Concepto,Monto,Tipo,Usuario,Email,Creado\n";

      movements.forEach(m => {
        csv += `${m.id},`;
        csv += `${new Date(m.date).toLocaleDateString()},`;
        csv += `"${m.concept.replace(/"/g, '""')}",`;
        csv += `${m.amount},`;
        csv += `${m.type},`;
        csv += `"${m.user.name?.replace(/"/g, '""') || ''}",`;
        csv += `${m.user.email},`;
        csv += `${new Date(m.createdAt).toLocaleString()}\n`;
      });

      // Configurar headers para descarga CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=reporte-${new Date().toISOString().split('T')[0]}.csv`);
      
      return res.status(200).send(csv);

    } catch (error) {
      console.error("Error en GET /reports/csv:", error);
      return res.status(500).json({ error: "Error al generar CSV" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}