'use client'

import { Footer } from "@/components/layouts/footer"
import Header from "@/components/layouts/header"
import ProtectedRoute from "@/components/protectedRoute"
import ProtectedPage from "@/components/ProtectedPage"
import { ExpedientesManagement } from "./management"

export default function ExpedientesPage() {
    return (
        <ProtectedRoute>
            <ProtectedPage requiredPermissions={['expediente:read']}>
                <Header />

                <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="container py-8">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <ExpedientesManagement />
                        </div>
                    </div>
                </main>

                <Footer />
            </ProtectedPage>
        </ProtectedRoute>
    )
}
