import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "@/lib/auth/getServerSession";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req);
  
  return res.status(200).json({
    message: "Session info",
    session: session,
    hasRole: session?.user?.role ? true : false,
    role: session?.user?.role || "no role",
  });
}