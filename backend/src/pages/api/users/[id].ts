import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/getServerSession";
import { z } from "zod";

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Endpoints para gestión de usuarios (solo administradores)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del usuario
 *         name:
 *           type: string
 *           description: Nombre del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         phone:
 *           type: string
 *           nullable: true
 *           description: Teléfono del usuario
 *         role:
 *           type: string
 *           enum: [ADMIN, USER]
 *           description: Rol del usuario
 *         emailVerified:
 *           type: boolean
 *           description: Si el email está verificado
 *         image:
 *           type: string
 *           nullable: true
 *           description: URL de la imagen de perfil
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre del usuario
 *           example: "Juan Pérez"
 *         phone:
 *           type: string
 *           nullable: true
 *           description: Teléfono del usuario
 *           example: "+123456789"
 *         role:
 *           type: string
 *           enum: [ADMIN, USER]
 *           description: Rol del usuario
 *           example: "ADMIN"
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     description: |
 *       Actualiza los datos de un usuario específico.
 *       **Solo disponible para administradores**
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a actualizar
 *         example: "p4bLYpPtSO5JJioeb19ezkS5B6nEL7n0"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *           examples:
 *             actualizar-rol:
 *               summary: Cambiar rol de usuario
 *               value:
 *                 role: "ADMIN"
 *             actualizar-datos:
 *               summary: Actualizar nombre y teléfono
 *               value:
 *                 name: "Juan Pérez"
 *                 phone: "+123456789"
 *             actualizar-todo:
 *               summary: Actualizar todos los campos
 *               value:
 *                 name: "María García"
 *                 phone: "+987654321"
 *                 role: "USER"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: VALIDATION_ERROR
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "phone"
 *                       message:
 *                         type: string
 *                         example: "Teléfono inválido"
 *       401:
 *         description: No autorizado - Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No autorizado
 *       403:
 *         description: Prohibido - Se requieren permisos de administrador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: FORBIDDEN
 *                 message:
 *                   type: string
 *                   example: Solo los administradores pueden modificar usuarios
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error al actualizar usuario
 */

const updateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50).optional(),
  phone: z.string().regex(/^\+?[\d\s-]+$/, "Teléfono inválido").optional().nullable(),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 🔥 HEADERS CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const session = await getServerSession(req);
  if (!session) {
    return res.status(401).json({ error: "No autorizado" });
  }

  if (session.user.role !== "ADMIN") {
    return res.status(403).json({ 
      error: "FORBIDDEN",
      message: "Solo los administradores pueden modificar usuarios" 
    });
  }

  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "ID inválido" });
  }

  if (req.method === "PUT") {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch (e) {
          return res.status(400).json({ error: "JSON inválido" });
        }
      }

      const validatedData = updateUserSchema.parse(body);

      const updatedUser = await prisma.user.update({
        where: { id },
        data: validatedData,
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
        },
      });

      return res.status(200).json({
        message: "Usuario actualizado exitosamente",
        data: updatedUser,
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
      console.error("Error en PUT /users/[id]:", error);
      return res.status(500).json({ error: "Error al actualizar usuario" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}