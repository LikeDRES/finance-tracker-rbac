import type { NextApiRequest, NextApiResponse } from "next";
import { withRole } from "@/lib/auth/withRole";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    message: "Welcome Admin",
  });
}

export default withRole("ADMIN")(handler);
