import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

type ValidationSchemas = {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
};

export function validate(schemas: ValidationSchemas) {
  return async function validator(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => Promise<void>
  ) {
    try {
      // Validar body
      if (schemas.body) {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        const validatedBody = await schemas.body.parseAsync(body);
        req.body = validatedBody;
      }

      // Validar query
      if (schemas.query) {
        const validatedQuery = await schemas.query.parseAsync(req.query);
        
        if (validatedQuery && typeof validatedQuery === 'object') {
          Object.keys(validatedQuery).forEach((key) => {
            const value = (validatedQuery as Record<string, any>)[key];
            if (value !== undefined) {
              req.query[key] = String(value);
            }
          });
        }
      }

      await next();
    } catch (error) {
      // ✅ CORREGIDO: Diferentes formas de acceder a los errores de Zod
      if (error instanceof z.ZodError) {
        // En versiones recientes de Zod, los errores están en error.issues
        const issues = (error as any).issues || (error as any).errors || [];
        
        return res.status(400).json({
          error: "Validation failed",
          details: issues.map((err: any) => ({
            field: err.path?.join(".") || "",
            message: err.message || "Error de validación",
          })),
        });
      }

      return res.status(400).json({ error: "Invalid request data" });
    }
  };
}