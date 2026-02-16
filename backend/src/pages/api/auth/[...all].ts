import { toNodeHandler } from "better-auth/node";
import { auth } from "@/lib/auth"

console.log('🔍 Todas las rutas de Better Auth:')
console.log('- GET /api/auth/signin/github')
console.log('- POST /api/auth/signin/github')
console.log('- GET /api/auth/callback/github')
console.log('- POST /api/auth/callback/github')

export default toNodeHandler(auth);