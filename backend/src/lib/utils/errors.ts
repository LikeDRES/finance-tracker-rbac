import { NextApiResponse } from "next";
import { Prisma } from "@prisma/client";

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function handleError(error: unknown, res: NextApiResponse) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.code,
      message: error.message,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Errores conocidos de Prisma
    switch (error.code) {
      case "P2002":
        return res.status(409).json({
          error: "DUPLICATE_ERROR",
          message: "Ya existe un registro con esos datos",
        });
      case "P2025":
        return res.status(404).json({
          error: "NOT_FOUND",
          message: "Registro no encontrado",
        });
      default:
        console.error("Prisma error:", error);
    }
  }

  // Error por defecto
  console.error("Unexpected error:", error);
  return res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "Error interno del servidor",
  });
}