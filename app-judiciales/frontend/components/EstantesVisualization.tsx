'use client'

import { useState, useEffect } from 'react'
import { Expediente, Grado } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, BookOpen, Users } from 'lucide-react'
import { getExpedientesByDivision } from '@/lib/api'

interface EstantesVisualizationProps {
    onClose: () => void
}

interface Division {
    id: number
    range: string
    expedientes: Expediente[]
    maxCapacity: number
    isLoaded: boolean
}

interface Estante {
    id: number
    name: string
    divisions: Division[]
    description: string
}

// Definición de rangos alfabéticos para oficiales en actividad
const DIVISION_RANGES = [
    // Estante 1 (divisiones 1-20)
    { id: 1, range: 'AA–AG' },
    { id: 2, range: 'AH–AQ' },
    { id: 3, range: 'AR–AZ' },
    { id: 4, range: 'BA–BM' },
    { id: 5, range: 'BN–BZ' },
    { id: 6, range: 'CA–CC' },
    { id: 7, range: 'CD–CJ' },
    { id: 8, range: 'CK–CZ' },
    { id: 9, range: 'DA–DM' },
    { id: 10, range: 'DN–DZ' },
    { id: 11, range: 'EA–EM' },
    { id: 12, range: 'EN–EZ' },
    { id: 13, range: 'FA–FM' },
    { id: 14, range: 'FN–FZ' },
    { id: 15, range: 'GA–GM' },
    { id: 16, range: 'GN–GZ' },
    { id: 17, range: 'HA–HM' },
    { id: 18, range: 'HN–HZ' },
    { id: 19, range: 'IA–IZ' },
    //{ id: 18, range: 'IA–IM' },
    //{ id: 19, range: 'IN–IZ' },
    { id: 20, range: 'JA–JZ' },
    // =============================
    // Estante 2 (divisiones 21-40)
    // { id: 21, range: 'KA–KM' },
    // { id: 22, range: 'KN–KZ' },
    { id: 21, range: 'KA–KZ' },
    { id: 22, range: 'LA–LM' },
    { id: 23, range: 'LN–LZ' },
    //{ id: 25, range: 'MA–MM' },
    { id: 24, range: 'MA–MD' },
    { id: 25, range: 'ME–MM' },
    { id: 26, range: 'MN–MZ' },
    { id: 27, range: 'NA–NZ' },
    { id: 28, range: 'OA–OZ' },
   // { id: 29, range: 'PA–PZ' },
    { id: 29, range: 'PA–PF' },
    { id: 30, range: 'PG–PZ' },

    { id: 31, range: 'QA–QZ' },
    //{ id: 31, range: 'RA–RZ' },
    { id: 32, range: 'RA–RJ' },
    { id: 33, range: 'RK–RZ' },
    { id: 34, range: 'SA–SD' },
    { id: 35, range: 'SE–SZ' },
    { id: 36, range: 'TA–TZ' },
    { id: 37, range: 'UA–UZ' },
   // { id: 36, range: 'VA–VZ' },
    { id: 38, range: 'VA–VD' },
    { id: 39, range: 'VE–VZ' },
    //{ id: 37, range: 'WA–WZ' },
    //{ id: 38, range: 'XA–XZ' },
    //{ id: 39, range: 'YA–YZ' },
    //{ id: 40, range: 'ZA–ZZ' }
    { id: 40, range: 'WA–ZZ' }
]

// Grados de oficiales
const GRADOS_OFICIALES: Grado[] = ['GRAL', 'CRL', 'TTE CRL', 'MY', 'CAP', 'TTE', 'STTE']

export function EstantesVisualization({ onClose }: EstantesVisualizationProps) {
    const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
    const [estantes, setEstantes] = useState<Estante[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        initializeEstantes()
    }, [])

    const initializeEstantes = () => {
        console.log('=== INICIALIZANDO ESTANTES ===')

        // Crear divisiones sin expedientes (carga lazy)
        const divisionesVacias = DIVISION_RANGES.map(divRange => ({
            id: divRange.id,
            range: divRange.range,
            expedientes: [],
            maxCapacity: 100,
            isLoaded: false
        }))

        // Organizar en estantes
        const estantesData: Estante[] = [
            {
                id: 1,
                name: 'Estante 1',
                description: 'Oficiales en Actividad (AA-JZ)',
                divisions: divisionesVacias.slice(0, 20)
            },
            {
                id: 2,
                name: 'Estante 2',
                description: 'Oficiales en Actividad (KA-ZZ)',
                divisions: divisionesVacias.slice(20, 40)
            },
            // Estantes 3-11 (para futuras implementaciones)
            ...Array.from({ length: 9 }, (_, i) => ({
                id: i + 3,
                name: `Estante ${i + 3}`,
                description: 'Reservado para futuras categorías',
                divisions: Array.from({ length: 20 }, (_, j) => ({
                    id: (i + 2) * 20 + j + 1,
                    range: 'Sin asignar',
                    expedientes: [],
                    maxCapacity: 100,
                    isLoaded: true
                }))
            }))
        ]

        setEstantes(estantesData)
        console.log('Estantes inicializados con carga lazy')
    }

    const loadDivisionData = async (division: Division) => {
        if (division.isLoaded) {
            setSelectedDivision(division)
            return
        }

        try {
            setLoading(true)
            console.log(`Cargando división ${division.id}: ${division.range}`)

            const response = await getExpedientesByDivision(division.range)

            if (response.success && response.data) {
                const expedientes = Array.isArray(response.data) ? response.data :
                    (response.data as any).expedientes || []

                // Actualizar la división en el estado
                setEstantes(prevEstantes => {
                    return prevEstantes.map(estante => ({
                        ...estante,
                        divisions: estante.divisions.map(div =>
                            div.id === division.id
                                ? { ...div, expedientes, isLoaded: true }
                                : div
                        )
                    }))
                })

                // Seleccionar la división actualizada
                const updatedDivision = { ...division, expedientes, isLoaded: true }
                setSelectedDivision(updatedDivision)

                console.log(`División ${division.id} cargada: ${expedientes.length} expedientes`)
            }
        } catch (error) {
            console.error('Error loading division data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getOccupancyColor = (division: Division): string => {
        if (!division.isLoaded) return 'bg-blue-50 border-blue-200' // No cargado

        const occupancyPercentage = (division.expedientes.length / division.maxCapacity) * 100

        if (occupancyPercentage === 0) return 'bg-gray-100 border-gray-200'
        if (occupancyPercentage <= 50) return 'bg-green-100 border-green-300'
        if (occupancyPercentage <= 80) return 'bg-yellow-100 border-yellow-300'
        return 'bg-red-100 border-red-300'
    }

    const getTotalExpedientes = (estante: Estante): number => {
        return estante.divisions
            .filter(div => div.isLoaded)
            .reduce((total, div) => total + div.expedientes.length, 0)
    }

    const getDivisionDisplayText = (division: Division): string => {
        if (!division.isLoaded) {
            return 'Click para cargar'
        }
        return division.expedientes.length.toString()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-7xl h-full max-h-[90vh] overflow-auto">
                <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Visualización de Estantes</h2>
                        <p className="text-gray-600 mt-1">Sistema de organización por primer apellido para oficiales en actividad</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-8">
                    {estantes.slice(0, 2).map(estante => (
                        <Card key={estante.id} className="border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-indigo-600" />
                                        {estante.name}
                                    </div>
                                    <div className="text-sm text-gray-600 flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {getTotalExpedientes(estante)} expedientes cargados
                                    </div>
                                </CardTitle>
                                <p className="text-sm text-gray-600">{estante.description}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-10 gap-2">
                                    {estante.divisions.map(division => (
                                        <div
                                            key={division.id}
                                            className={`
                                                p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                                                hover:shadow-md hover:scale-105 disabled:cursor-not-allowed
                                                ${getOccupancyColor(division)}
                                                ${selectedDivision?.id === division.id ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                                                ${loading ? 'opacity-50' : ''}
                                            `}
                                            onClick={() => loadDivisionData(division)}
                                        >
                                            <div className="text-center">
                                                <div className="text-xs font-semibold text-gray-700">
                                                    Div. {division.id}
                                                </div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    {division.range}
                                                </div>
                                                <div className="text-lg font-bold text-gray-800 mt-1">
                                                    {getDivisionDisplayText(division)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    / {division.maxCapacity}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Estantes 3-11 (vista compacta) */}
                    <Card className="border-2 border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-gray-500">Estantes 3-11</CardTitle>
                            <p className="text-sm text-gray-400">Reservados para futuras implementaciones (TCO, SSOO, EC, TROPA, etc.)</p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-9 gap-4">
                                {estantes.slice(2).map(estante => (
                                    <div key={estante.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="text-center text-gray-400">
                                            <BookOpen className="h-6 w-6 mx-auto mb-1" />
                                            <div className="text-sm font-semibold">{estante.name}</div>
                                            <div className="text-xs">Sin asignar</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Panel de detalles de división seleccionada */}
                    {selectedDivision && (
                        <Card className="border-2 border-indigo-200 bg-indigo-50">
                            <CardHeader>
                                <CardTitle className="text-indigo-800">
                                    División {selectedDivision.id} - {selectedDivision.range}
                                </CardTitle>
                                <p className="text-sm text-indigo-600">
                                    {selectedDivision.expedientes.length} de {selectedDivision.maxCapacity} expedientes
                                </p>
                            </CardHeader>
                            <CardContent>
                                {selectedDivision.expedientes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                                        {selectedDivision.expedientes
                                            .sort((a, b) => a.apellidos_nombres.localeCompare(b.apellidos_nombres))
                                            .map(expediente => (
                                                <div key={expediente.id} className="bg-white p-3 rounded-lg border border-indigo-200">
                                                    <div className="text-sm font-semibold text-gray-800">
                                                        {expediente.grado}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {expediente.apellidos_nombres}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        CIP: {expediente.cip}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>No hay expedientes en esta división</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Leyenda */}
                    <Card className="bg-gray-50">
                        <CardHeader>
                            <CardTitle className="text-sm">Leyenda de Ocupación</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
                                    <span>Sin cargar (Click para cargar)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                                    <span>Vacío (0%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                                    <span>Baja ocupación (1-50%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                                    <span>Media ocupación (51-80%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                                    <span>Alta ocupación (81-100%)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}