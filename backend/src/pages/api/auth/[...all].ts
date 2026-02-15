import { toNodeHandler } from "better-auth/node";
import { getAuth } from "@/lib/auth";

export default toNodeHandler(getAuth());

