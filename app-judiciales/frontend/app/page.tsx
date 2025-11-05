"use client";

import { Header } from "@/components/layouts/header"
import { Footer } from "@/components/layouts/footer";
import ProtectedRoute from "@/components/protectedRoute";
import DashboardStats from "@/components/DashboardStats";

export default function Home() {
  return (
    <ProtectedRoute>
      <Header />

      <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Sistema de gestión de expedientes judiciales</p>
          </div>
          
          {/* Dashboard Stats */}
          <DashboardStats />
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}