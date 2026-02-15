import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "./getServerSession";

export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return handler(req, res);
  };
}
