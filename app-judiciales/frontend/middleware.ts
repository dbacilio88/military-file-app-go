import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Rutas que no requieren autenticación
  const publicPaths = ['/login', '/health', '/api/health'];
  
  const pathname = request.nextUrl.pathname;

  // Permitir rutas públicas
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Verificar si hay token en las cookies o headers
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Si no hay token, redirigir al login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si hay token, permitir acceso a todas las rutas
  // Los permisos específicos se manejan en el frontend
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};