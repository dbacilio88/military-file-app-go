"use client";

import Header from "@/components/layouts/header"
import { Footer } from "@/components/layouts/footer";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, FileText, Users, BarChart3, ArrowRight } from "lucide-react";

export default function WelcomePage() {
  const { user, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  // Redireccionar al login si no hay usuario
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

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
          <p className="text-gray-600 mt-2">Por favor, inicia sesión para acceder al sistema</p>
        </div>
      </div>
    );
  }

  const availableFeatures = [
    {
      title: "Dashboard",
      description: "Visualiza estadísticas y resúmenes del sistema",
      icon: BarChart3,
      href: "/dashboard",
      permission: "dashboard:view",
      color: "bg-blue-500"
    },
    {
      title: "Expedientes",
      description: "Gestiona expedientes judiciales militares",
      icon: FileText,
      href: "/expedientes",
      permission: "expediente:read",
      color: "bg-green-500"
    },
    {
      title: "Usuarios",
      description: "Administra usuarios del sistema",
      icon: Users,
      href: "/users",
      permission: "user:read",
      color: "bg-purple-500"
    },
    {
      title: "Perfiles",
      description: "Configura perfiles y permisos",
      icon: Shield,
      href: "/profiles",
      permission: "profile:read",
      color: "bg-orange-500"
    }
  ];

  const accessibleFeatures = availableFeatures.filter(feature => 
    hasPermission(feature.permission) || user.isAdmin
  );

  return (
    <>
      <Header />

      <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div className="container py-12">
          {/* Encabezado de bienvenida */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenido al Sistema de Expedientes Judiciales
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Hola, <span className="font-semibold text-blue-600">{user.nombre} {user.apellido}</span>
            </p>
            <p className="text-gray-500">
              Perfil: <span className="font-medium">{user.profile?.name || 'Sin perfil'}</span>
              {user.isAdmin && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Administrador
                </span>
              )}
            </p>
          </div>

          {/* Funcionalidades disponibles */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Funcionalidades Disponibles
            </h2>
            
            {accessibleFeatures.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {accessibleFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      onClick={() => router.push(feature.href)}
                      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${feature.color} text-white group-hover:scale-110 transition-transform`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {feature.description}
                          </p>
                          <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                            Acceder
                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Sin Acceso a Funcionalidades
                </h3>
                <p className="text-gray-600 mb-6">
                  Tu cuenta no tiene permisos para acceder a ninguna funcionalidad del sistema.
                </p>
                <p className="text-sm text-gray-500">
                  Contacta al administrador para solicitar los permisos necesarios.
                </p>
              </div>
            )}
          </div>

          {/* Información del sistema */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Sistema de Gestión de Expedientes Judiciales Militares
              </h3>
              <p className="text-gray-600 text-sm">
                Plataforma integral para la administración y seguimiento de expedientes 
                en el ámbito de la justicia militar.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}