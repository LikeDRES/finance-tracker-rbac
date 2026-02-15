import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    return res.status(200).json(session || null);
  } catch (error) {
    console.error("Error obteniendo sesión:", error);
    return res.status(500).json({ error: "Error al obtener sesión" });
  }
}