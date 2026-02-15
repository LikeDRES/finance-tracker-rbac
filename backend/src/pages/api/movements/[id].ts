import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/prisma/client"
import { getServerSession } from "@/lib/auth/getServerSession";
import { z } from "zod";
import { updateMovementSchema } from "@/validations/movement";

/**
 * @swagger
 * /api/movements/{id}:
 *   get:
 *     summary: Obtener movimiento por ID
 *     description: Obtiene un movimiento específico. Los usuarios solo ven sus movimientos, los admins ven todos.
 *     tags: [Movements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del movimiento
 *     responses:
 *       200:
 *         description: Movimiento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movement'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Movimiento no encontrado
 *
 *   put:
 *     summary: Actualizar movimiento
 *     description: Actualiza un movimiento existente (solo administradores)
 *     tags: [Movements]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del movimiento
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               concept:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *     responses:
 *       200:
 *         description: Movimiento actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movement'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores
 *       404:
 *         description: Movimiento no encontrado
 *
 *   delete:
 *     summary: Eliminar movimiento
 *     description: Elimina un movimiento existente (solo administradores)
 *     tags: [Movements]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del movimiento
 *     responses:
 *       204:
 *         description: Movimiento eliminado exitosamente (sin contenido)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores
 *       404:
 *         description: Movimiento no encontrado
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Headers CORS
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

  const { id } = req.query;
  const userRole = session.user.role;
  const userId = session.user.id;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "ID inválido" });
  }

  // =========================
  // PUT /api/movements/[id]
  // =========================
  if (req.method === "PUT") {
    try {
      if (userRole !== "ADMIN") {
        return res.status(403).json({ 
          error: "FORBIDDEN",
          message: "Solo los administradores pueden actualizar movimientos" 
        });
      }

      const existingMovement = await prisma.movement.findUnique({
        where: { id },
      });

      if (!existingMovement) {
        return res.status(404).json({ error: "Movimiento no encontrado" });
      }

      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch (e) {
          return res.status(400).json({ error: "JSON inválido" });
        }
      }

      const validatedData = updateMovementSchema.parse(body);

      const updatedMovement = await prisma.movement.update({
        where: { id },
        data: validatedData,
        include: {
          user: { select: { name: true, email: true } },
        },
      });

      return res.status(200).json({
        message: "Movimiento actualizado exitosamente",
        data: updatedMovement,
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
      console.error("Error en PUT /movements/[id]:", error);
      return res.status(500).json({ error: "Error al actualizar movimiento" });
    }
  }

  // =========================
  // DELETE /api/movements/[id]
  // =========================
  if (req.method === "DELETE") {
    try {
      if (userRole !== "ADMIN") {
        return res.status(403).json({ 
          error: "FORBIDDEN",
          message: "Solo los administradores pueden eliminar movimientos" 
        });
      }

      const existingMovement = await prisma.movement.findUnique({
        where: { id },
      });

      if (!existingMovement) {
        return res.status(404).json({ error: "Movimiento no encontrado" });
      }

      await prisma.movement.delete({
        where: { id },
      });

      return res.status(204).end();

    } catch (error) {
      console.error("Error en DELETE /movements/[id]:", error);
      return res.status(500).json({ error: "Error al eliminar movimiento" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}