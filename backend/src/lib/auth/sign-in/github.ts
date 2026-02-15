import type { NextApiRequest, NextApiResponse } from "next";
import { runCors } from "@/lib/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Aplicar CORS
  if (runCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Agregar headers CORS explícitamente para la respuesta
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.BETTER_AUTH_BASE_URL}/api/auth/callback/github&scope=user:email`;
  
  console.log("🚀 Redirigiendo a GitHub:", githubAuthUrl);
  
  // Redirigir a GitHub
  res.redirect(githubAuthUrl);
}