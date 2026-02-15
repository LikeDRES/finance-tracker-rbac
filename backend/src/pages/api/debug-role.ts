import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "@/lib/auth/getServerSession";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req);
  
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  return res.status(200).json({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
    roleFromDb: session.user.role, // Debería ser ADMIN
  });
}