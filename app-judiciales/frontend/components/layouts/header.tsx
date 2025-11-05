"use client"

import { useState } from "react";
import Link from 'next/link'
import { Home, Shield, FileText, Users, ChevronDown, Bell, User, LogOut, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/contexts/toastContext";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationsPanel } from "./notifications";

interface MenuItem {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    label: string
    href: string
    active?: boolean
    submenu?: SubMenuItem[]
}

interface SubMenuItem {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    label: string
    href: string
    description?: string
}

interface HeaderProps {
    userName?: string
    userRole?: string
}

const menuItems: MenuItem[] = [
    { icon: Home, label: 'Dashboard', href: '/' },
    {
        icon: Shield,
        label: 'Usuarios',
        href: '/users',
        submenu: [
            {
                icon: Shield,
                label: 'Gestión de Usuarios',
                href: '/users',
                description: 'Administrar usuarios del sistema'
            },
        ]
    },
    {
        icon: FileText,
        label: 'Expedientes',
        href: '/expedientes',
        submenu: [
            {
                icon: FileText,
                label: 'Gestión de Expedientes',
                href: '/expedientes',
                description: 'Administrar expedientes judiciales'
            },
        ]
    }
]

export function Header({
    userName = "Usuario",
    userRole = "Rol"
}: HeaderProps) {

    const { user, profileName, logout } = useAuth()
    const toast = useToast()
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications()
    const displayName = user ? `${user.nombre} ${user.apellido}`.trim() : userName
    const displayProfile = profileName || userRole

    const toggleSubmenu = (label: string) => {
        setOpenSubmenu(openSubmenu === label ? null : label)
    }
    const handleLogout = () => {
        setProfileOpen(false)
        toast.success('Sesión cerrada correctamente')
        logout()
    }


    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
    const getSubmenuColors = (menuLabel: string) => {
        switch (menuLabel) {
            case 'Usuarios':
                return {
                    iconBg: 'bg-indigo-50',
                    iconColor: 'text-indigo-600',
                    hoverBg: 'hover:from-indigo-50 hover:to-indigo-100',
                    hoverIcon: 'group-hover:text-indigo-700',
                    hoverText: 'group-hover:text-indigo-700',
                    activeBg: 'bg-indigo-100',
                    activeIcon: 'text-indigo-600'
                }
            case 'Personas':
                return {
                    iconBg: 'bg-blue-50',
                    iconColor: 'text-blue-600',
                    hoverBg: 'hover:from-blue-50 hover:to-blue-100',
                    hoverIcon: 'group-hover:text-blue-700',
                    hoverText: 'group-hover:text-blue-700',
                    activeBg: 'bg-blue-100',
                    activeIcon: 'text-blue-600'
                }
            case 'Persons':
                return {
                    iconBg: 'bg-blue-50',
                    iconColor: 'text-blue-600',
                    hoverBg: 'hover:from-blue-50 hover:to-blue-100',
                    hoverIcon: 'group-hover:text-blue-700',
                    hoverText: 'group-hover:text-blue-700',
                    activeBg: 'bg-blue-100',
                    activeIcon: 'text-blue-600'
                }
            case 'Analytics':
                return {
                    iconBg: 'bg-purple-50',
                    iconColor: 'text-purple-600',
                    hoverBg: 'hover:from-purple-50 hover:to-purple-100',
                    hoverIcon: 'group-hover:text-purple-700',
                    hoverText: 'group-hover:text-purple-700',
                    activeBg: 'bg-purple-100',
                    activeIcon: 'text-purple-600'
                }
            case 'Settings':
                return {
                    iconBg: 'bg-emerald-50',
                    iconColor: 'text-emerald-600',
                    hoverBg: 'hover:from-emerald-50 hover:to-emerald-100',
                    hoverIcon: 'group-hover:text-emerald-700',
                    hoverText: 'group-hover:text-emerald-700',
                    activeBg: 'bg-emerald-100',
                    activeIcon: 'text-emerald-600'
                }
            case 'Help':
                return {
                    iconBg: 'bg-amber-50',
                    iconColor: 'text-amber-600',
                    hoverBg: 'hover:from-amber-50 hover:to-amber-100',
                    hoverIcon: 'group-hover:text-amber-700',
                    hoverText: 'group-hover:text-amber-700',
                    activeBg: 'bg-amber-100',
                    activeIcon: 'text-amber-600'
                }
            default:
                return {
                    iconBg: 'bg-gray-50',
                    iconColor: 'text-gray-600',
                    hoverBg: 'hover:from-gray-50 hover:to-gray-100',
                    hoverIcon: 'group-hover:text-gray-700',
                    hoverText: 'group-hover:text-gray-700',
                    activeBg: 'bg-gray-100',
                    activeIcon: 'text-gray-600'
                }
        }
    }

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Planillas
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon
                                const hasSubmenu = item.submenu && item.submenu.length > 0

                                return (
                                    <div key={item.label} className="relative group">
                                        {hasSubmenu ? (
                                            <>
                                                <button
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${item.active
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                        }`}
                                                >
                                                    <Icon className={`h-4 w-4 ${item.active
                                                        ? 'text-blue-600'
                                                        : 'text-gray-500 group-hover:text-blue-500'
                                                        } transition-colors`} />
                                                    {item.label}
                                                    <ChevronDown className="h-3 w-3 text-gray-400 transition-transform group-hover:rotate-180" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                <div className="absolute left-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 overflow-hidden">
                                                        {item.submenu?.map((subItem) => {
                                                            const SubIcon = subItem.icon
                                                            const colors = getSubmenuColors(item.label)

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
                                                                        <p className={`text-sm font-medium text-gray-900 ${colors.hoverText} transition-colors`}>{subItem.label}</p>
                                                                        {subItem.description && (
                                                                            <p className="text-xs text-gray-500 mt-0.5">{subItem.description}</p>
                                                                        )}
                                                                    </div>
                                                                </Link>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${item.active
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}
                                            >
                                                <Icon className={`h-4 w-4 ${item.active
                                                    ? 'text-blue-600'
                                                    : 'text-gray-500 group-hover:text-blue-500'
                                                    } transition-colors`} />
                                                {item.label}
                                            </Link>
                                        )}
                                    </div>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative hidden sm:flex"
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                            >
                                <Bell className="h-5 w-5" />
                                {
                                    unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )
                                }
                            </Button>

                            {/* Notifications Dropdown */}
                            {notificationsOpen && (
                                <NotificationsPanel
                                    notifications={notifications}
                                    unreadCount={unreadCount}
                                    onMarkAsRead={markAsRead}
                                    onMarkAllAsRead={markAllAsRead}
                                    onDelete={deleteNotification}
                                    onClose={() => setNotificationsOpen(false)}
                                />
                            )}
                        </div>

                        {/* User Profile */}
                        <button
                            onClick={() => setProfileOpen(true)}
                            className="hidden sm:flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50 transition-colors bg-white"
                        >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                                <p className="text-xs text-gray-500">{displayProfile}</p>
                            </div>
                        </button>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {
                    mobileMenuOpen && (
                        <div className="border-t border-gray-200 md:hidden bg-white">
                            <nav className="container py-4 space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon
                                    const hasSubmenu = item.submenu && item.submenu.length > 0
                                    const isSubmenuOpen = openSubmenu === item.label

                                    return (
                                        <div key={item.label}>
                                            {hasSubmenu ? (
                                                <>
                                                    <button
                                                        onClick={() => toggleSubmenu(item.label)}
                                                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${item.active
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${item.active
                                                                ? 'bg-blue-100'
                                                                : 'bg-gray-100'
                                                                }`}>
                                                                <Icon className={`h-4 w-4 ${item.active
                                                                    ? 'text-blue-600'
                                                                    : 'text-gray-600'
                                                                    }`} />
                                                            </div>
                                                            {item.label}
                                                        </div>
                                                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {/* Mobile Submenu */}
                                                    {isSubmenuOpen && (
                                                        <div className="ml-8 mt-1 space-y-1">
                                                            {item.submenu?.map((subItem) => {
                                                                const SubIcon = subItem.icon
                                                                const colors = getSubmenuColors(item.label)

                                                                return (
                                                                    <Link
                                                                        key={subItem.label}
                                                                        href={subItem.href}
                                                                        className={`group flex items-start gap-3 px-4 py-2 rounded-lg text-sm hover:bg-gradient-to-r ${colors.hoverBg} transition-all`}
                                                                        onClick={() => setMobileMenuOpen(false)}
                                                                    >
                                                                        <div className={`p-2 rounded-lg ${colors.iconBg} group-hover:shadow-sm transition-all`}>
                                                                            <SubIcon className={`h-4 w-4 ${colors.iconColor} flex-shrink-0`} />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className={`font-medium text-gray-900 ${colors.hoverText} transition-colors`}>{subItem.label}</p>
                                                                            {subItem.description && (
                                                                                <p className="text-xs text-gray-500">{subItem.description}</p>
                                                                            )}
                                                                        </div>
                                                                    </Link>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${item.active
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                        }`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <div className={`p-2 rounded-lg ${item.active
                                                        ? 'bg-blue-100'
                                                        : 'bg-gray-100'
                                                        }`}>
                                                        <Icon className={`h-4 w-4 ${item.active
                                                            ? 'text-blue-600'
                                                            : 'text-gray-600'
                                                            }`} />
                                                    </div>
                                                    {item.label}
                                                </Link>
                                            )}
                                        </div>
                                    )
                                })}

                                {/* Notifications Button - Mobile */}
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false)
                                        setNotificationsOpen(true)
                                    }}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-amber-50">
                                            <Bell className="h-4 w-4 text-amber-500" />
                                        </div>
                                        Notifications
                                    </div>
                                    {
                                        unreadCount > 0 && (
                                            <span className="h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                                {
                                                    unreadCount > 9 ? '9+' : unreadCount
                                                }
                                            </span>
                                        )}
                                </button>

                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false)
                                        setProfileOpen(true)
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                >
                                    <div className="p-2 rounded-lg bg-green-50">
                                        <User className="h-4 w-4 text-green-500" />
                                    </div>
                                    Profile
                                </button>
                            </nav>
                        </div>
                    )}
            </header>

            {/* Profile Dialog */}
            <Dialog open={profileOpen} onOpenChange={
                setProfileOpen
            }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Perfil de Usuario</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <User className="h-10 w-10 text-white" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold">{displayName}</h3>
                                <p className="text-sm text-gray-500">{displayProfile}</p>
                                <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Settings className="mr-2 h-4 w-4" />
                                Configuración de Cuenta
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Cerrar Sesión
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

