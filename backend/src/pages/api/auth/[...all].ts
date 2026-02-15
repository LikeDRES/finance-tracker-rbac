import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth";
import { toNodeHandler } from "better-auth/node";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return toNodeHandler(auth)(req, res);
}