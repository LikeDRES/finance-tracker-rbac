import type { NextApiRequest, NextApiResponse } from "next";

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

  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.BETTER_AUTH_BASE_URL}/api/auth/callback/github`;
  const scope = "user:email";

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

  res.redirect(githubAuthUrl);
}