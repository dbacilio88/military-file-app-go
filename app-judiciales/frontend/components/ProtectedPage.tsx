'use client'

import React from 'react'
import { usePermissionAction } from '../hooks/usePermissionActions'
import { useAuth } from '../contexts/authContext'
import { Shield, AlertCircle } from 'lucide-react'

interface ProtectedPageProps {
    requiredPermissions: string[]
    children: React.ReactNode
    fallback?: React.ReactNode
}

const ProtectedPage: React.FC<ProtectedPageProps> = ({ 
    requiredPermissions, 
    children, 
    fallback 
}) => {
    const { hasPermission, isAdmin } = usePermissionAction()
    const { user } = useAuth()

    // Admin siempre tiene acceso
    if (isAdmin) {
        return <>{children}</>
    }

    // Verificar si tiene al menos uno de los permisos requeridos
    const hasAccess = requiredPermissions.some(permission => hasPermission(permission))

    if (!hasAccess) {
        if (fallback) {
            return <>{fallback}</>
        }

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <Shield className="w-8 h-8 text-red-600" />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Acceso Denegado
                    </h1>
                    
                    <p className="text-gray-600 mb-6">
                        No tienes los permisos necesarios para acceder a esta página.
                    </p>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <h3 className="text-sm font-medium text-amber-800 mb-1">
                                    Permisos requeridos:
                                </h3>
                                <ul className="text-sm text-amber-700 space-y-1">
                                    {requiredPermissions.map((permission) => (
                                        <li key={permission} className="font-mono">
                                            • {permission}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-gray-500 mb-6">
                        <p>Usuario actual: <strong>{user?.nombre} {user?.apellido}</strong></p>
                        <p>Email: <strong>{user?.email}</strong></p>
                        {user?.profile && (
                            <p>Perfil: <strong>{user.profile.name}</strong></p>
                        )}
                    </div>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Volver
                    </button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

export default ProtectedPage