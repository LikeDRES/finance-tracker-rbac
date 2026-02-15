import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  console.log("=".repeat(50));
  console.log(`📍 Proxy ejecutándose para: ${req.nextUrl.pathname}`);
  console.log(`🔐 Método: ${req.method}`);
  
  const allCookies = req.cookies.getAll();
  console.log("🍪 Todas las cookies:", allCookies.map(c => c.name));
  
  const sessionCookie =
    req.cookies.get("better-auth.session_token") ||
    req.cookies.get("better-auth.session-token");
  
  console.log(`🍪 Session cookie presente: ${!!sessionCookie}`);

  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
  
  console.log(`🛣️ Es ruta de auth: ${isAuthRoute}`);
  console.log(`🛣️ Es API route: ${isApiRoute}`);
  console.log(`🛡️ Es ruta protegida: ${isProtectedRoute}`);

  // Siempre permitir rutas de auth
  if (isAuthRoute) {
    console.log("✅ Permitiendo ruta de auth");
    return NextResponse.next();
  }

  // Para otras API routes, verificar autenticación según necesites
  if (isApiRoute) {
    console.log("✅ Permitiendo API route (la autenticación se maneja en la ruta)");
    return NextResponse.next();
  }

  if (isProtectedRoute && !sessionCookie) {
    console.log("🚫 Redirigiendo a login - no autenticado");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  console.log("✅ Permitiendo ruta");
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*"], // Monitorear todas las API routes
};