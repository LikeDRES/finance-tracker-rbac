import { toNodeHandler } from "better-auth/node";
import { getAuth } from "@/lib/auth";

// Better Auth lo maneja internamente
export default toNodeHandler(getAuth());