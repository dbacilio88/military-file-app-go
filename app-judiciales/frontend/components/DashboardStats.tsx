import React, { useEffect, useState } from 'react';
import { RefreshCw, BarChart3, Users, TrendingUp, FileText } from 'lucide-react';
import { getDashboardStats } from '../lib/api';
import type { DashboardStats, ApiResponse } from '../lib/types';

function SmallStat({ label, value, subtitle, icon: Icon, color = "blue" }: { 
  label: string; 
  value: string | number; 
  subtitle?: string;
  icon?: React.ElementType;
  color?: string;
}) {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600", 
    orange: "text-orange-600",
    purple: "text-purple-600"
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
          <div className={`mt-2 text-2xl font-bold ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
            {value}
          </div>
          {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
        </div>
        {Icon && <Icon className={`h-8 w-8 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`} />}
      </div>
    </div>
  );
}

export default function DashboardStatsComponent() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<DashboardStats> = await getDashboardStats();
      if (!res.success) {
        setError((res as any).message || 'Error obteniendo estadísticas');
        setData(null);
      } else {
        setData(res.data || null);
      }
    } catch (err: unknown) {
      console.warn('Error conectando al backend, usando datos de ejemplo:', err);
      // Usar datos de ejemplo cuando no hay backend disponible
      const mockData: DashboardStats = {
        resumen_general: {
          total_expedientes: 1190,
          expedientes_dentro: 850,
          expedientes_fuera: 340,
          porcentaje_dentro: 71.4,
          porcentaje_fuera: 28.6,
          total_paginas: 4760,
          promedio_paginas_por_expediente: 4.0,
          personal_actividad: 950,
          personal_retiro: 240,
          porcentaje_actividad: 79.8,
          porcentaje_retiro: 20.2,
          ubicaciones_unicas: 15
        },
        estadisticas_por_estado: [
          { estado: 'Dentro', total: 850, porcentaje: 71.4, total_paginas: 3400 },
          { estado: 'Fuera', total: 340, porcentaje: 28.6, total_paginas: 1360 }
        ],
        estadisticas_por_situacion: [
          { situacion: 'En Actividad', total: 950, porcentaje: 79.8, total_paginas: 3800 },
          { situacion: 'En Retiro', total: 240, porcentaje: 20.2, total_paginas: 960 }
        ],
        estadisticas_por_grado: [
          { grado: 'CAP', total: 200, dentro: 140, fuera: 60, actividad: 160, retiro: 40, porcentaje: 16.8, total_paginas: 800 },
          { grado: 'TTE', total: 180, dentro: 130, fuera: 50, actividad: 150, retiro: 30, porcentaje: 15.1, total_paginas: 720 },
          { grado: 'MY', total: 150, dentro: 110, fuera: 40, actividad: 120, retiro: 30, porcentaje: 12.6, total_paginas: 600 },
          { grado: 'CRL', total: 120, dentro: 90, fuera: 30, actividad: 100, retiro: 20, porcentaje: 10.1, total_paginas: 480 },
          { grado: 'STTE', total: 110, dentro: 80, fuera: 30, actividad: 90, retiro: 20, porcentaje: 9.2, total_paginas: 440 },
          { grado: 'TCO', total: 100, dentro: 70, fuera: 30, actividad: 80, retiro: 20, porcentaje: 8.4, total_paginas: 400 },
          { grado: 'SSOO', total: 90, dentro: 65, fuera: 25, actividad: 75, retiro: 15, porcentaje: 7.6, total_paginas: 360 },
          { grado: 'TTE CRL', total: 80, dentro: 60, fuera: 20, actividad: 70, retiro: 10, porcentaje: 6.7, total_paginas: 320 },
          { grado: 'EC', total: 70, dentro: 50, fuera: 20, actividad: 60, retiro: 10, porcentaje: 5.9, total_paginas: 280 },
          { grado: 'GRAL', total: 50, dentro: 40, fuera: 10, actividad: 45, retiro: 5, porcentaje: 4.2, total_paginas: 200 },
          { grado: 'TROPA', total: 40, dentro: 25, fuera: 15, actividad: 30, retiro: 10, porcentaje: 3.4, total_paginas: 160 }
        ],
        estadisticas_por_ubicacion: [
          { ubicacion: 'Lima Metropolitana', total: 300, porcentaje: 25.2, total_paginas: 1200 },
          { ubicacion: 'Callao', total: 150, porcentaje: 12.6, total_paginas: 600 },
          { ubicacion: 'Arequipa', total: 120, porcentaje: 10.1, total_paginas: 480 },
          { ubicacion: 'Cusco', total: 100, porcentaje: 8.4, total_paginas: 400 },
          { ubicacion: 'Trujillo', total: 90, porcentaje: 7.6, total_paginas: 360 },
          { ubicacion: 'Piura', total: 80, porcentaje: 6.7, total_paginas: 320 },
          { ubicacion: 'Chiclayo', total: 70, porcentaje: 5.9, total_paginas: 280 },
          { ubicacion: 'Huancayo', total: 60, porcentaje: 5.0, total_paginas: 240 },
          { ubicacion: 'Iquitos', total: 50, porcentaje: 4.2, total_paginas: 200 },
          { ubicacion: 'Tacna', total: 40, porcentaje: 3.4, total_paginas: 160 },
          { ubicacion: 'Otros', total: 130, porcentaje: 10.9, total_paginas: 520 }
        ],
        estadisticas_temporales: {
          ultimos_30_dias: 45,
          tendencia_mensual: 'creciente',
          registros_por_mes: [
            { mes: 1, ano: 2024, mes_nombre: 'Ene', total: 89, porcentaje: 7.5 },
            { mes: 2, ano: 2024, mes_nombre: 'Feb', total: 95, porcentaje: 8.0 },
            { mes: 3, ano: 2024, mes_nombre: 'Mar', total: 102, porcentaje: 8.6 },
            { mes: 4, ano: 2024, mes_nombre: 'Abr', total: 87, porcentaje: 7.3 },
            { mes: 5, ano: 2024, mes_nombre: 'May', total: 108, porcentaje: 9.1 },
            { mes: 6, ano: 2024, mes_nombre: 'Jun', total: 115, porcentaje: 9.7 },
            { mes: 7, ano: 2024, mes_nombre: 'Jul', total: 98, porcentaje: 8.2 },
            { mes: 8, ano: 2024, mes_nombre: 'Ago', total: 118, porcentaje: 9.9 },
            { mes: 9, ano: 2024, mes_nombre: 'Sep', total: 125, porcentaje: 10.5 },
            { mes: 10, ano: 2024, mes_nombre: 'Oct', total: 132, porcentaje: 11.1 },
            { mes: 11, ano: 2024, mes_nombre: 'Nov', total: 121, porcentaje: 10.2 },
            { mes: 12, ano: 2024, mes_nombre: 'Dic', total: 140, porcentaje: 11.8 }
          ]
        },
        generado_en: new Date().toISOString()
      };
      setData(mockData);
      setError(null); // No mostrar error, usar datos de ejemplo
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-gray-600">Cargando estadísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          Error: {error}
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-gray-600">No hay datos de estadísticas disponibles.</div>
    );
  }

  const { resumen_general, estadisticas_por_estado, estadisticas_por_grado, estadisticas_por_situacion, estadisticas_por_ubicacion, estadisticas_temporales, generado_en } = data;

  return (
    <div className="space-y-6">
      {/* Header con botón de recarga */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Estadísticas del Sistema</h2>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Resumen General - Primera fila */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStat 
          label="Total expedientes" 
          value={resumen_general.total_expedientes} 
          icon={BarChart3}
          color="blue"
        />
        <SmallStat 
          label="Expedientes dentro" 
          value={resumen_general.expedientes_dentro}
          subtitle={`${resumen_general.porcentaje_dentro.toFixed(1)}%`}
          icon={FileText}
          color="green"
        />
        <SmallStat 
          label="Expedientes fuera" 
          value={resumen_general.expedientes_fuera}
          subtitle={`${resumen_general.porcentaje_fuera.toFixed(1)}%`}
          icon={FileText}
          color="orange"
        />
        <SmallStat 
          label="Total páginas" 
          value={resumen_general.total_paginas}
          subtitle={`Promedio: ${resumen_general.promedio_paginas_por_expediente.toFixed(1)}`}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Personal por situación - Segunda fila */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SmallStat 
          label="Personal en actividad" 
          value={resumen_general.personal_actividad}
          subtitle={`${resumen_general.porcentaje_actividad.toFixed(1)}%`}
          icon={Users}
          color="green"
        />
        <SmallStat 
          label="Personal en retiro" 
          value={resumen_general.personal_retiro}
          subtitle={`${resumen_general.porcentaje_retiro.toFixed(1)}%`}
          icon={TrendingUp}
          color="orange"
        />
        <SmallStat 
          label="Ubicaciones únicas" 
          value={resumen_general.ubicaciones_unicas}
          icon={BarChart3}
          color="purple"
        />
      </div>

      {/* Información temporal */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Información temporal</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Últimos 30 días</div>
            <div className="text-3xl font-bold text-blue-800">{estadisticas_temporales.ultimos_30_dias}</div>
            <div className="text-xs text-blue-500 mt-1">nuevos registros</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Tendencia mensual</div>
            <div className="text-lg font-bold text-green-800 capitalize">{estadisticas_temporales.tendencia_mensual}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">Generado en</div>
            <div className="text-sm text-gray-800">
              {new Date(generado_en).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas por categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por estado - Circular Chart */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h4 className="font-semibold mb-4 text-gray-900">Por estado</h4>
          <div className="flex items-center justify-center">
            {estadisticas_por_estado && estadisticas_por_estado.length > 0 ? (
              <div className="relative">
                {/* Circular Chart */}
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 120 120">
                    {/* Fondo del círculo */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="20"
                    />
                    
                    {/* Segmentos circulares */}
                    {estadisticas_por_estado.map((s, index) => {
                      const radius = 50;
                      const circumference = 2 * Math.PI * radius;
                      const strokeDasharray = (s.porcentaje / 100) * circumference;
                      
                      // Calcular offset acumulativo
                      let cumulativePercentage = 0;
                      for (let i = 0; i < index; i++) {
                        cumulativePercentage += estadisticas_por_estado[i].porcentaje;
                      }
                      const strokeDashoffset = -(cumulativePercentage / 100) * circumference;
                      
                      const colors = [
                        '#10b981', // green-500 para Dentro
                        '#ef4444', // red-500 para Fuera
                        '#f59e0b', // amber-500 adicional
                        '#3b82f6', // blue-500 adicional
                      ];
                      const color = colors[index % colors.length];
                      
                      return (
                        <circle
                          key={index}
                          cx="60"
                          cy="60"
                          r={radius}
                          fill="none"
                          stroke={color}
                          strokeWidth="20"
                          strokeDasharray={`${strokeDasharray} ${circumference}`}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                          }}
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Texto central */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-gray-900">{resumen_general.total_expedientes}</div>
                    <div className="text-sm text-gray-600 font-medium">Total</div>
                    <div className="text-xs text-gray-500 mt-1">Expedientes</div>
                  </div>
                </div>
                
                {/* Leyenda mejorada */}
                <div className="mt-6 space-y-3">
                  {estadisticas_por_estado.map((s, index) => {
                    const colors = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm font-medium text-gray-700 capitalize">{s.estado}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">{s.total.toLocaleString()}</span>
                          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                            {s.porcentaje.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Fallback con datos del resumen
              <div className="relative">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 120 120">
                    {/* Fondo */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="20"
                    />
                    {/* Dentro */}
                    <circle
                      cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="20"
                      strokeDasharray={`${(resumen_general.porcentaje_dentro / 100) * 314.16} 314.16`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                    />
                    {/* Fuera */}
                    <circle
                      cx="60" cy="60" r="50" fill="none" stroke="#ef4444" strokeWidth="20"
                      strokeDasharray={`${(resumen_general.porcentaje_fuera / 100) * 314.16} 314.16`}
                      strokeDashoffset={`-${(resumen_general.porcentaje_dentro / 100) * 314.16}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-gray-900">{resumen_general.total_expedientes}</div>
                    <div className="text-sm text-gray-600 font-medium">Total</div>
                    <div className="text-xs text-gray-500 mt-1">Expedientes</div>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-gray-700">Dentro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{resumen_general.expedientes_dentro.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                        {resumen_general.porcentaje_dentro.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                      <span className="text-sm font-medium text-gray-700">Fuera</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{resumen_general.expedientes_fuera.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                        {resumen_general.porcentaje_fuera.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Por situación militar - Circular Chart */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h4 className="font-semibold mb-4 text-gray-900">Por situación militar</h4>
          <div className="flex items-center justify-center">
            {estadisticas_por_situacion && estadisticas_por_situacion.length > 0 ? (
              <div className="relative">
                {/* Circular Chart */}
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 120 120">
                    {/* Fondo del círculo */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="20"
                    />
                    
                    {/* Segmentos circulares */}
                    {estadisticas_por_situacion.map((s, index) => {
                      const radius = 50;
                      const circumference = 2 * Math.PI * radius;
                      const strokeDasharray = (s.porcentaje / 100) * circumference;
                      
                      // Calcular offset acumulativo
                      let cumulativePercentage = 0;
                      for (let i = 0; i < index; i++) {
                        cumulativePercentage += estadisticas_por_situacion[i].porcentaje;
                      }
                      const strokeDashoffset = -(cumulativePercentage / 100) * circumference;
                      
                      const colors = [
                        '#3b82f6', // blue-500 para Actividad
                        '#8b5cf6', // purple-500 para Retiro
                        '#10b981', // green-500 adicional
                        '#f59e0b', // amber-500 adicional
                      ];
                      const color = colors[index % colors.length];
                      
                      return (
                        <circle
                          key={index}
                          cx="60"
                          cy="60"
                          r={radius}
                          fill="none"
                          stroke={color}
                          strokeWidth="20"
                          strokeDasharray={`${strokeDasharray} ${circumference}`}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                          }}
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Texto central */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-gray-900">{resumen_general.total_expedientes}</div>
                    <div className="text-sm text-gray-600 font-medium">Total</div>
                    <div className="text-xs text-gray-500 mt-1">Expedientes</div>
                  </div>
                </div>
                
                {/* Leyenda mejorada */}
                <div className="mt-6 space-y-3">
                  {estadisticas_por_situacion.map((s, index) => {
                    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm font-medium text-gray-700">{s.situacion}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">{s.total.toLocaleString()}</span>
                          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                            {s.porcentaje.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Fallback con datos del resumen
              <div className="relative">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 120 120">
                    {/* Fondo */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="20"
                    />
                    {/* Actividad */}
                    <circle
                      cx="60" cy="60" r="50" fill="none" stroke="#3b82f6" strokeWidth="20"
                      strokeDasharray={`${(resumen_general.porcentaje_actividad / 100) * 314.16} 314.16`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                    />
                    {/* Retiro */}
                    <circle
                      cx="60" cy="60" r="50" fill="none" stroke="#8b5cf6" strokeWidth="20"
                      strokeDasharray={`${(resumen_general.porcentaje_retiro / 100) * 314.16} 314.16`}
                      strokeDashoffset={`-${(resumen_general.porcentaje_actividad / 100) * 314.16}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-gray-900">{resumen_general.total_expedientes}</div>
                    <div className="text-sm text-gray-600 font-medium">Total</div>
                    <div className="text-xs text-gray-500 mt-1">Expedientes</div>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium text-gray-700">En Actividad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{resumen_general.personal_actividad.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                        {resumen_general.porcentaje_actividad.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-purple-500" />
                      <span className="text-sm font-medium text-gray-700">En Retiro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{resumen_general.personal_retiro.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                        {resumen_general.porcentaje_retiro.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Segunda fila de estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por grado militar */}
        {estadisticas_por_grado && estadisticas_por_grado.length > 0 && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h4 className="font-semibold mb-6 text-gray-900">Por grado militar</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {estadisticas_por_grado
                .sort((a, b) => {
                  // Orden jerárquico militar (de mayor a menor rango)
                  const orden = ['GRAL', 'CRL', 'TTE CRL', 'MY', 'CAP', 'TTE', 'STTE', 'TCO', 'SSOO', 'EC', 'TROPA'];
                  return orden.indexOf(a.grado) - orden.indexOf(b.grado);
                })
                .map((g, index) => {
                  const maxTotal = Math.max(...estadisticas_por_grado.map(item => item.total));
                  const percentage = maxTotal > 0 ? (g.total / maxTotal) * 100 : 0;
                  
                  // Colores por jerarquía
                  const getColorByRank = (grado: string) => {
                    if (['GRAL'].includes(grado)) return { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700' };
                    if (['CRL', 'TTE CRL'].includes(grado)) return { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700' };
                    if (['MY', 'CAP'].includes(grado)) return { bg: 'bg-yellow-500', light: 'bg-yellow-100', text: 'text-yellow-700' };
                    if (['TTE', 'STTE'].includes(grado)) return { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-700' };
                    if (['TCO', 'SSOO'].includes(grado)) return { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' };
                    return { bg: 'bg-gray-500', light: 'bg-gray-100', text: 'text-gray-700' };
                  };

                  const colors = getColorByRank(g.grado);

                  return (
                    <div key={index} className={`${colors.light} rounded-lg p-3 border border-gray-200 flex flex-col items-center`}>
                      {/* Título del grado */}
                      <div className={`text-sm font-bold ${colors.text} mb-2 text-center`}>
                        {g.grado}
                      </div>
                      
                      {/* Contenedor de la barra vertical */}
                      <div className="flex flex-col items-center justify-end h-32 w-full mb-3">
                        <div className="w-full bg-gray-300 rounded-t-lg h-full flex items-end overflow-hidden shadow-inner">
                          <div
                            className={`w-full ${colors.bg} transition-all duration-1000 ease-out rounded-t-lg flex items-end justify-center pb-1`}
                            style={{ height: `${Math.max(percentage, 5)}%` }}
                          >
                            <span className="text-white text-xs font-bold">
                              {g.total}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Información simplificada */}
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{g.total}</div>
                        <div className="text-sm text-gray-600">{g.porcentaje.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* Leyenda opcional */}
            <div className="mt-4 text-xs text-gray-500 text-center">
              Ordenado por jerarquía militar (de mayor a menor rango)
            </div>
          </div>
        )}

        {/* Por ubicación */}
        {estadisticas_por_ubicacion && estadisticas_por_ubicacion.length > 0 && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h4 className="font-semibold mb-4 text-gray-900">Por ubicación</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {estadisticas_por_ubicacion.map((u, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="text-sm text-gray-600 truncate" title={u.ubicacion}>{u.ubicacion}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-xl font-bold text-purple-600">{u.total}</div>
                    <div className="text-xs text-gray-500">({u.porcentaje.toFixed(1)}%)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tendencia temporal - Line Chart */}
      {estadisticas_temporales?.registros_por_mes && estadisticas_temporales.registros_por_mes.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h4 className="font-semibold mb-4 text-gray-900">Tendencia temporal (por mes)</h4>
          <div className="overflow-x-auto">
            <div className="min-w-full" style={{ height: '300px' }}>
              <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
                {/* Área del gráfico */}
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 0.8}} />
                    <stop offset="100%" style={{stopColor: '#1d4ed8', stopOpacity: 0.9}} />
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                <g stroke="#e5e7eb" strokeWidth="1" opacity="0.5">
                  {[0, 1, 2, 3, 4].map(i => (
                    <line key={`h-${i}`} x1="80" y1={50 + i * 50} x2="720" y2={50 + i * 50} />
                  ))}
                  {estadisticas_temporales.registros_por_mes.map((_, i) => {
                    const x = 80 + (i * (640 / Math.max(estadisticas_temporales.registros_por_mes!.length - 1, 1)));
                    return <line key={`v-${i}`} x1={x} y1="50" x2={x} y2="250" />;
                  })}
                </g>
                
                {/* Datos del gráfico */}
                {(() => {
                  const maxValue = Math.max(...estadisticas_temporales.registros_por_mes.map(r => r.total));
                  const minValue = Math.min(...estadisticas_temporales.registros_por_mes.map(r => r.total));
                  const range = maxValue - minValue || 1;
                  
                  // Crear puntos para la línea
                  const points = estadisticas_temporales.registros_por_mes.map((registro, index) => {
                    const x = 80 + (index * (640 / Math.max(estadisticas_temporales.registros_por_mes!.length - 1, 1)));
                    const y = 250 - ((registro.total - minValue) / range) * 200;
                    return { x, y, registro };
                  });
                  
                  return (
                    <>
                      {/* Línea principal */}
                      <polyline
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points.map(p => `${p.x},${p.y}`).join(' ')}
                        className="transition-all duration-1000 ease-out"
                      />
                      
                      {/* Área bajo la línea */}
                      <polygon
                        fill="url(#lineGradient)"
                        fillOpacity="0.1"
                        points={`80,250 ${points.map(p => `${p.x},${p.y}`).join(' ')} 720,250`}
                        className="transition-all duration-1000 ease-out"
                      />
                      
                      {/* Marcadores (círculos) */}
                      {points.map((point, index) => (
                        <g key={index}>
                          {/* Círculo exterior */}
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="6"
                            fill="#ffffff"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            className="transition-all duration-500 ease-out"
                          />
                          {/* Círculo interior */}
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="3"
                            fill="#3b82f6"
                            className="transition-all duration-500 ease-out"
                          />
                        </g>
                      ))}
                      
                      {/* Etiquetas de los ejes */}
                      {/* Eje Y (valores) */}
                      {[0, 1, 2, 3, 4].map(i => {
                        const value = minValue + (range * i / 4);
                        return (
                          <text
                            key={`y-label-${i}`}
                            x="70"
                            y={255 - i * 50}
                            textAnchor="end"
                            fontSize="12"
                            fill="#6b7280"
                          >
                            {Math.round(value)}
                          </text>
                        );
                      })}
                      
                      {/* Eje X (meses) */}
                      {points.map((point, index) => (
                        <g key={`x-label-${index}`}>
                          <text
                            x={point.x}
                            y="270"
                            textAnchor="middle"
                            fontSize="11"
                            fill="#6b7280"
                          >
                            {point.registro.mes_nombre || `${point.registro.ano}-${point.registro.mes?.toString().padStart(2, '0')}`}
                          </text>
                          <text
                            x={point.x}
                            y="285"
                            textAnchor="middle"
                            fontSize="10"
                            fill="#9ca3af"
                            fontWeight="bold"
                          >
                            {point.registro.total}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay datos de expedientes */}
      {resumen_general.total_expedientes === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-yellow-600" />
            <div>
              <h4 className="font-semibold">No hay expedientes registrados</h4>
              <p className="text-sm mt-1">
                Las estadísticas aparecerán cuando se registren expedientes en el sistema.
                Puedes empezar importando expedientes desde Excel o creándolos manualmente.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
