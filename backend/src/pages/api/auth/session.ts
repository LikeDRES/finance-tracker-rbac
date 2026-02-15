import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "@/lib/auth/getServerSession";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://finance-tracker-rbac-euu2.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req);
    return res.status(200).json(session || null);
  } catch (error) {
    console.error("Error obteniendo sesión:", error);
    return res.status(500).json({ error: "Error interno" });
  }
}