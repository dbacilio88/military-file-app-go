'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Bell, ChevronDown, Home, Users, FileText, User, LogOut, Settings, Search } from 'lucide-react'
import { useAuth } from '../../contexts/authContext'
import { usePermissionAction } from '../../hooks/usePermissionActions'

interface MenuItem {
    label: string
    href: string
    icon: React.ComponentType<any>
    active: boolean
    permission?: string
    submenu?: SubMenuItem[]
}

interface SubMenuItem {
    label: string
    href: string
    icon: React.ComponentType<any>
    description?: string
    permission?: string
}

const Header: React.FC = () => {
    const [profileOpen, setProfileOpen] = useState(false)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const { user, logout } = useAuth()
    const { hasPermission, isAdmin } = usePermissionAction()
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    const getSubmenuColors = (label: string) => {
        const colorMap: Record<string, any> = {
            'Usuarios': {
                hoverBg: 'hover:from-blue-50 hover:to-indigo-50',
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-600',
                hoverIcon: 'group-hover:text-blue-700',
                hoverText: 'group-hover:text-blue-900'
            },
            'Expedientes': {
                hoverBg: 'hover:from-green-50 hover:to-emerald-50',
                iconBg: 'bg-green-50',
                iconColor: 'text-green-600',
                hoverIcon: 'group-hover:text-green-700',
                hoverText: 'group-hover:text-green-900'
            },
            'default': {
                hoverBg: 'hover:from-gray-50 hover:to-slate-50',
                iconBg: 'bg-gray-50',
                iconColor: 'text-gray-600',
                hoverIcon: 'group-hover:text-gray-700',
                hoverText: 'group-hover:text-gray-900'
            }
        }
        return colorMap[label] || colorMap['default']
    }

    const menuItems: MenuItem[] = [
        {
            label: 'Dashboard',
            href: '/dashboard',
            icon: Home,
            active: pathname === '/dashboard',
            permission: 'dashboard:view'
        },
        {
            label: 'Usuarios',
            href: '#',
            icon: Users,
            active: pathname.startsWith('/users') || pathname.startsWith('/profiles'),
            permission: 'user:read',
            submenu: [
                {
                    label: 'Gestión de Usuarios',
                    href: '/users',
                    icon: Users,
                    description: 'Administrar usuarios del sistema',
                    permission: 'user:read'
                },
                {
                    label: 'Perfiles y Roles',
                    href: '/profiles',
                    icon: Settings,
                    description: 'Configurar perfiles y permisos',
                    permission: 'profile:read'
                }
            ]
        },
        {
            label: 'Expedientes',
            href: '/expedientes',
            icon: FileText,
            active: pathname.startsWith('/expedientes'),
            permission: 'expediente:read'
        }
    ]

    // Filtrar elementos del menú basado en permisos
    const filteredMenuItems = menuItems.filter(item => 
        !item.permission || hasPermission(item.permission) || isAdmin
    )

    if (!user) {
        return null
    }

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo y navegación */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">MJ</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 hidden sm:block">
                                Militares Judiciales
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-1">
                            {filteredMenuItems.map((item) => {
                                const Icon = item.icon
                                const hasSubmenu = item.submenu && item.submenu.length > 0

                                if (!hasSubmenu) {
                                    return (
                                        <Link key={item.label} href={item.href}>
                                            <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 ${
                                                item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                            }`}>
                                                <Icon className="h-4 w-4" />
                                                {item.label}
                                            </button>
                                        </Link>
                                    )
                                }

                                // Para submenús - filtrar por permisos
                                const filteredSubmenu = item.submenu?.filter(subItem => 
                                    !subItem.permission || hasPermission(subItem.permission) || isAdmin
                                ) || []

                                if (filteredSubmenu.length === 0) {
                                    return null
                                }

                                const colors = getSubmenuColors(item.label)
                                
                                return (
                                    <div key={item.label} className="relative group">
                                        <button
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                item.active
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                        >
                                            <Icon className={`h-4 w-4 ${
                                                item.active
                                                    ? 'text-blue-600'
                                                    : 'text-gray-500 group-hover:text-blue-500'
                                            } transition-colors`} />
                                            {item.label}
                                            <ChevronDown className="h-3 w-3 text-gray-400 transition-transform group-hover:rotate-180" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        <div className="absolute left-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 overflow-hidden">
                                                {filteredSubmenu.map((subItem) => {
                                                    const SubIcon = subItem.icon

                                                    return (
                                                        <Link
                                                            key={subItem.label}
                                                            href={subItem.href}
                                                            className={`group flex items-start gap-3 px-4 py-3 hover:bg-gradient-to-r ${colors.hoverBg} transition-all duration-200`}
                                                        >
                                                            <div className={`p-1.5 rounded-lg ${colors.iconBg} group-hover:shadow-sm transition-all duration-200`}>
                                                                <SubIcon className={`h-4 w-4 ${colors.iconColor} ${colors.hoverIcon} transition-colors`} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-medium text-gray-900 ${colors.hoverText} transition-colors`}>
                                                                    {subItem.label}
                                                                </p>
                                                                {subItem.description && (
                                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                                        {subItem.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Acciones del usuario */}
                    <div className="flex items-center gap-3">
                        {/* Búsqueda */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>

                        {/* Notificaciones */}
                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Bell className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    3
                                </span>
                            </button>

                            {notificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <h3 className="font-medium text-gray-900">Notificaciones</h3>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        <div className="px-4 py-3 hover:bg-gray-50">
                                            <p className="text-sm text-gray-900">Nuevo expediente asignado</p>
                                            <p className="text-xs text-gray-500 mt-1">Hace 2 minutos</p>
                                        </div>
                                        <div className="px-4 py-3 hover:bg-gray-50">
                                            <p className="text-sm text-gray-900">Usuario pendiente de aprobación</p>
                                            <p className="text-xs text-gray-500 mt-1">Hace 1 hora</p>
                                        </div>
                                        <div className="px-4 py-3 hover:bg-gray-50">
                                            <p className="text-sm text-gray-900">Expediente actualizado</p>
                                            <p className="text-xs text-gray-500 mt-1">Hace 3 horas</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Perfil de usuario */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-medium hidden sm:block">{user.nombre}</span>
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user.nombre} {user.apellido}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                        <p className="text-xs text-blue-600 font-medium">{user.profile?.name || 'Sin perfil'}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
