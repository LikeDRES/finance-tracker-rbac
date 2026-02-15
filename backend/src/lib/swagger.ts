import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "pages/api", // Carpeta donde están tus API routes
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Finance Tracker API",
        description: "API para gestión de finanzas personales con RBAC",
        version: "1.0.0",
        contact: {
          name: "Desarrollador",
          email: "tu@email.com",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Servidor local de desarrollo",
        },
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "better-auth.session_token",
            description: "Autenticación mediante cookie de sesión",
          },
        },
        schemas: {
          Movement: {
            type: "object",
            properties: {
              id: { type: "string", description: "ID único del movimiento" },
              amount: { type: "number", description: "Monto del movimiento" },
              concept: { type: "string", description: "Concepto o descripción" },
              date: { type: "string", format: "date", description: "Fecha del movimiento" },
              type: { type: "string", enum: ["INCOME", "EXPENSE"], description: "Tipo de movimiento" },
              userId: { type: "string", description: "ID del usuario que creó el movimiento" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          User: {
            type: "object",
            properties: {
              id: { type: "string", description: "ID único del usuario" },
              name: { type: "string", description: "Nombre del usuario" },
              email: { type: "string", format: "email", description: "Email del usuario" },
              phone: { type: "string", description: "Teléfono", nullable: true },
              role: { type: "string", enum: ["ADMIN", "USER"], description: "Rol del usuario" },
              emailVerified: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          Error: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
      security: [{ cookieAuth: [] }],
    },
  });

  return spec;
};