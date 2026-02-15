import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth";
import { signUpSchema } from "@/validations/auth";
import { z } from "zod";
import { runCors } from "@/lib/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Aplicar CORS
  if (runCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Agregar headers CORS explícitamente
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  try {
    // Validar datos de entrada
    const validatedData = signUpSchema.parse(req.body);

    const response = await auth.api.signUpEmail({
      body: validatedData,
      headers: req.headers as any,
    });

    return res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = (error as any).issues || [];
      
      return res.status(400).json({
        error: "Validation failed",
        details: issues.map((err: any) => ({
          field: err.path?.join(".") || "",
          message: err.message || "Error de validación",
        })),
      });
    }

    console.error("Error en registro:", error);
    return res.status(500).json({ 
      error: "Error al registrar usuario",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
}