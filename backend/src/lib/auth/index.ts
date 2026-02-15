// Exportar con alias para evitar conflictos
export { getServerSession, type Session as ServerSession, type SessionUser as ServerSessionUser } from "./getServerSession"
export { getPagesServerSession, type Session as PagesSession, type SessionUser as PagesSessionUser } from "./getPagesServerSession"
export { withAuth } from "./withAuth"
export { withRole } from "./withRole"
export * from "./auth"