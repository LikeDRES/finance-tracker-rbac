import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await auth.api.signInEmail({
      body: {
        email: req.body.email,
        password: req.body.password,
      },
      headers: req.headers as any,
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(401).json({ 
      error: "Credenciales inválidas",
    });
  }
}