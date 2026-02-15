import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Convert Node headers → Web Headers
  const headers = new Headers();

  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(",") : value);
    }
  });

  const session = await auth.api.getSession({
    headers,
  });

  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  return res.status(200).json({
  user: session.user,
});
}
