"use client";

import Header from "@/components/layouts/header"
import { Footer } from "@/components/layouts/footer";
import DashboardStats from "@/components/DashboardStats";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  // Verificar autenticación y permisos
  useEffect(() => {
    console.log('🏠 Dashboard: Estado de autenticación:', {
      isLoading,
      hasUser: !!user,
      userEmail: user?.email,
      isAdmin: user?.isAdmin,
      permissions: user?.permissions,
      hasDashboardView: hasPermission('dashboard:view')
    });

    if (!isLoading && !user) {
      console.log('🚪 Dashboard: Sin usuario, redirigiendo a login');
      router.push('/login');
      return;
    }

    // Verificar si tiene permisos para el dashboard
    if (!isLoading && user && !hasPermission('dashboard:view') && !user.isAdmin) {
      console.log('❌ Dashboard: Sin permisos, redirigiendo a home');
      router.push('/');
      return;
    }

    if (!isLoading && user && (hasPermission('dashboard:view') || user.isAdmin)) {
      console.log('✅ Dashboard: Acceso permitido');
    }
  }, [user, isLoading, hasPermission, router]);

  // Mostrar loading mientras se carga la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no hay usuario, mostrar mensaje de redirección
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Redirigiendo al login...</h2>
          <p className="text-gray-600 mt-2">Por favor, inicia sesión para acceder al dashboard</p>
        </div>
      </div>
    );
  }

  // Verificar permisos
  if (!hasPermission('dashboard:view') && !user.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Sin permisos</h2>
          <p className="text-gray-600 mt-2">No tienes permisos para acceder al dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Sistema de gestión de expedientes judiciales</p>
            
            {/* Información del usuario actual */}
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">
                Usuario: <span className="font-medium text-gray-900">{user.nombre} {user.apellido}</span>
                {user.isAdmin && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Administrador
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Perfil: {user.profile?.name || 'Sin perfil'} | Permisos: {user.permissions.length}
              </p>
            </div>
          </div>
          
          {/* Dashboard Stats */}
          <DashboardStats />
        </div>
      </main>
      <Footer />
    </>
  );
}
