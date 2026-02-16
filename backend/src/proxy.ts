// pages/api/proxy.ts o middleware.ts (donde tengas tu proxy)
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

  // Crear respuesta base
  const response = NextResponse.next();
  
  // Configurar headers CORS para todas las respuestas
  const origin = req.headers.get('origin') || '';
  const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000'];
  
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin'
  );

  // Manejar preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers
    });
  }

  // Siempre permitir rutas de auth
  if (isAuthRoute) {
    console.log("✅ Permitiendo ruta de auth");
    return response;
  }

  // Para otras API routes, verificar autenticación según necesites
  if (isApiRoute) {
    console.log("✅ Permitiendo API route (la autenticación se maneja en la ruta)");
    return response;
  }

  if (isProtectedRoute && !sessionCookie) {
    console.log("🚫 Redirigiendo a login - no autenticado");
    const redirectResponse = NextResponse.redirect(new URL("/login", req.url));
    
    // También añadir CORS a la redirección
    if (allowedOrigins.includes(origin)) {
      redirectResponse.headers.set('Access-Control-Allow-Origin', origin);
    }
    redirectResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return redirectResponse;
  }

  console.log("✅ Permitiendo ruta");
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*"],
};