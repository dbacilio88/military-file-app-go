'use client'

import { Footer } from "@/components/layouts/footer"
import Header from "@/components/layouts/header"
import { ProtectedRoute } from "@/components/PermissionGuard"
import { UsersManagement } from "./management"

export default function UsersPage() {
    return (
        <ProtectedRoute 
            permissions={['user:read']}
            requireAll={false}
        >
            <Header />

            <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="container py-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <UsersManagement />
                    </div>
                </div>
            </main>

            <Footer />
        </ProtectedRoute>
    )
}
