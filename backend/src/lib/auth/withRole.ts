import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "./getServerSession";
import { prisma } from "@/lib/db/prisma";

export function withRole(role: "ADMIN" | "USER") {
  return function (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
  ) {
    return async function (req: NextApiRequest, res: NextApiResponse) {
      const session = await getServerSession(req);

      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!user || user.role !== role) {
        return res.status(403).json({ error: "Forbidden" });
      }

      return handler(req, res);
    };
  };
}
