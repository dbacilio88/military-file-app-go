'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/contexts/ToastContext'
import { bulkImportExpedientes } from '@/lib/api'
import { Grado, GradoLabels, BulkImportResult } from '@/lib/types'
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, X, Download, FileX, Eye } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ExcelRow {
    Grado: string
    CIP: string
    ApellidosNombres: string
    NumeroPaginas: number | string
    Ano: number | string
    // Campos calculados
    rowIndex?: number
    errors?: string[]
    isValid?: boolean
    duplicateColor?: string // Color para grupos de duplicados
}

interface ExpedientesImportProps {
    onImportComplete: () => void
    onCancel: () => void
}

export function ExpedientesImport({ onImportComplete, onCancel }: ExpedientesImportProps) {
    const [file, setFile] = useState<File | null>(null)
    const [excelData, setExcelData] = useState<ExcelRow[]>([])
    const [validRows, setValidRows] = useState<ExcelRow[]>([])
    const [errorRows, setErrorRows] = useState<ExcelRow[]>([])
    const [importing, setImporting] = useState(false)
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload')
    const [importResults, setImportResults] = useState<BulkImportResult | null>(null)
    
    const fileInputRef = useRef<HTMLInputElement>(null)
    const toast = useToast()

    const requiredHeaders = ['Grado', 'CIP', 'ApellidosNombres', 'NumeroPaginas', 'Ano']
    const validGrados: Grado[] = ['GRAL', 'CRL', 'TTE CRL', 'MY', 'CAP', 'TTE', 'STTE', 'TCO', 'SSOO', 'EC', 'TROPA']

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (!selectedFile) return

        // Validar tipo de archivo
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ]
        
        if (!validTypes.includes(selectedFile.type)) {
            toast.error('Tipo de archivo no válido. Use archivos Excel (.xlsx, .xls).')
            return
        }

        // Validar tamaño (10MB máximo según swagger)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (selectedFile.size > maxSize) {
            toast.error('El archivo es demasiado grande. Tamaño máximo: 10MB.')
            return
        }

        setFile(selectedFile)
        processExcelFile(selectedFile)
    }

    const processExcelFile = async (file: File) => {
        setLoading(true)
        try {
            const arrayBuffer = await file.arrayBuffer()
            const workbook = XLSX.read(arrayBuffer)
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            
            // Convertir a JSON con headers
            const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[]
            
            if (jsonData.length === 0) {
                toast.error('El archivo está vacío o no tiene datos válidos.')
                return
            }

            // Validar headers
            const firstRow = jsonData[0]
            const headers = Object.keys(firstRow)
            const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))
            
            if (missingHeaders.length > 0) {
                toast.error(`Faltan columnas requeridas: ${missingHeaders.join(', ')}`)
                return
            }

            // Agregar índice de fila para referencia
            const dataWithIndex = jsonData.map((row, index) => ({ ...row, rowIndex: index + 2 })) // +2 porque Excel empieza en 1 y tenemos header

            setExcelData(dataWithIndex)
            validateData(dataWithIndex)
            setStep('preview')
            
        } catch (error) {
            console.error('Error processing Excel file:', error)
            toast.error('Error al procesar el archivo Excel.')
        } finally {
            setLoading(false)
        }
    }

    const validateData = (data: ExcelRow[]) => {
        const validRowsTemp: ExcelRow[] = []
        const errorRowsTemp: ExcelRow[] = []
        const cipCounts = new Map<string, number>()
        const duplicateCips = new Set<string>()
        
        // Colores para grupos de duplicados - más vibrantes para mejor visibilidad
        const duplicateColors = [
            'bg-red-200 border-red-400 text-red-900',
            'bg-blue-200 border-blue-400 text-blue-900', 
            'bg-yellow-200 border-yellow-400 text-yellow-900',
            'bg-purple-200 border-purple-400 text-purple-900',
            'bg-pink-200 border-pink-400 text-pink-900',
            'bg-indigo-200 border-indigo-400 text-indigo-900',
            'bg-orange-200 border-orange-400 text-orange-900',
            'bg-teal-200 border-teal-400 text-teal-900'
        ]
        
        // Primer paso: encontrar CIPs duplicados
        data.forEach((row) => {
            const cip = row.CIP?.toString().trim()
            if (cip) {
                cipCounts.set(cip, (cipCounts.get(cip) || 0) + 1)
            }
        })
        
        // Asignar colores a CIPs duplicados
        const cipColorMap = new Map<string, string>()
        let colorIndex = 0
        cipCounts.forEach((count, cip) => {
            if (count > 1) {
                duplicateCips.add(cip)
                cipColorMap.set(cip, duplicateColors[colorIndex % duplicateColors.length])
                colorIndex++
            }
        })
        
        data.forEach((row) => {
            const errors: string[] = []
            let duplicateColor: string | undefined
            
            // Validar Grado
            const grado = row.Grado?.toString().toUpperCase().trim()
            if (!grado) {
                errors.push('Grado es requerido')
            } else if (!validGrados.includes(grado as Grado)) {
                errors.push(`Grado inválido. Valores permitidos: ${validGrados.join(', ')}`)
            }

            // Validar CIP
            const cip = row.CIP?.toString().trim()
            if (!cip) {
                errors.push('CIP es requerido')
            } else {
                // Validar longitud exacta de 9 caracteres
                if (cip.length !== 9) {
                    errors.push('CIP debe tener exactamente 9 caracteres')
                }
                // Validar que sea numérico
                if (!/^\d{9}$/.test(cip)) {
                    errors.push('CIP debe contener solo números')
                }
                // Validar que no esté duplicado y asignar color
                if (duplicateCips.has(cip)) {
                    errors.push(`CIP duplicado en el archivo (${cipCounts.get(cip)} veces)`)
                    duplicateColor = cipColorMap.get(cip)
                }
            }

            // Validar Apellidos y Nombres
            const apellidosNombres = row.ApellidosNombres?.toString().trim()
            if (!apellidosNombres) {
                errors.push('Apellidos y Nombres es requerido')
            } else if (apellidosNombres.length < 3) {
                errors.push('Apellidos y Nombres debe tener al menos 3 caracteres')
            }

            // Validar Número de Páginas
            const numeroPaginas = Number(row.NumeroPaginas)
            if (!numeroPaginas || isNaN(numeroPaginas) || numeroPaginas < 1) {
                errors.push('Número de Páginas debe ser un número mayor a 0')
            }

            // Validar Año
            const ano = Number(row.Ano)
            if (!ano || isNaN(ano)) {
                errors.push('Año es requerido')
            } else if (ano < 1900 || ano > 2100) {
                errors.push('Año debe estar entre 1900 y 2100')
            } else if (!Number.isInteger(ano)) {
                errors.push('Año debe ser un número entero')
            }

            const processedRow = { ...row, errors, duplicateColor }

            if (errors.length > 0) {
                errorRowsTemp.push({ ...processedRow, isValid: false })
            } else {
                validRowsTemp.push({ ...processedRow, isValid: true })
            }
        })

        setValidRows(validRowsTemp)
        setErrorRows(errorRowsTemp)
    }

    const handleImport = async () => {
        if (!file) {
            toast.error('Seleccione un archivo para importar.')
            return
        }

        setImporting(true)
        setStep('importing')
        
        try {
            const response = await bulkImportExpedientes(file)
            
            if (response.success && response.data) {
                setImportResults(response.data)
                setStep('complete')
                
                if (response.data.failed_imports === 0) {
                    toast.success(`¡Importación exitosa! ${response.data.successful_imports} expedientes importados.`)
                } else {
                    toast.warning(`Importación parcial: ${response.data.successful_imports} exitosos, ${response.data.failed_imports} fallidos.`)
                }
            } else {
                throw new Error('Respuesta inválida del servidor')
            }

        } catch (error: any) {
            console.error('Error during bulk import:', error)
            toast.error(error.message || 'Error durante la importación masiva')
            setStep('preview') // Volver a preview en caso de error
        } finally {
            setImporting(false)
        }
    }

    const downloadTemplate = () => {
        const templateData = [
            {
                Grado: 'CAP',
                CIP: '123456789',
                ApellidosNombres: 'APELLIDO NOMBRE',
                NumeroPaginas: 10,
                Ano: 2024
            },
            {
                Grado: 'MY',
                CIP: '987654321',
                ApellidosNombres: 'OTRO APELLIDO NOMBRE',
                NumeroPaginas: 15,
                Ano: 2023
            }
        ]
        
        const ws = XLSX.utils.json_to_sheet(templateData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla')
        XLSX.writeFile(wb, 'plantilla_expedientes.xlsx')
    }

    const resetImport = () => {
        setFile(null)
        setExcelData([])
        setValidRows([])
        setErrorRows([])
        setStep('upload')
        setImportResults(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Importación Masiva de Expedientes</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Cargar expedientes desde archivo Excel (.xlsx, .xls)
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={downloadTemplate} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Plantilla
                    </Button>
                    <Button onClick={onCancel} variant="outline">
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                    </Button>
                </div>
            </div>

            {/* Step 1: Upload */}
            {step === 'upload' && (
                <div className="space-y-6">
                    {/* Upload Card */}
                    <Card className="p-8">
                        <div className="text-center">
                            <FileSpreadsheet className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Seleccionar archivo Excel
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                El archivo debe contener las columnas: <strong>Grado</strong>, <strong>CIP</strong>, <strong>ApellidosNombres</strong>, <strong>NumeroPaginas</strong>, <strong>Ano</strong>
                            </p>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700 mb-4"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {loading ? 'Procesando...' : 'Seleccionar Archivo'}
                            </Button>
                            
                            {file && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 text-green-700">
                                        <FileSpreadsheet className="h-5 w-5" />
                                        <span className="text-sm font-medium">{file.name}</span>
                                        <span className="text-xs text-green-600">
                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Requirements Card */}
                    <Card className="p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Requisitos del archivo</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <h5 className="font-medium text-gray-700 mb-2">Formato:</h5>
                                <ul className="text-gray-600 space-y-1">
                                    <li>• Solo archivos .xlsx o .xls</li>
                                    <li>• Tamaño máximo: 10MB</li>
                                    <li>• Primera fila debe ser encabezados</li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-medium text-gray-700 mb-2">Columnas requeridas:</h5>
                                <ul className="text-gray-600 space-y-1">
                                    <li>• <strong>Grado:</strong> {validGrados.join(', ')}</li>
                                    <li>• <strong>CIP:</strong> Exactamente 9 dígitos numéricos, único</li>
                                    <li>• <strong>ApellidosNombres:</strong> Mínimo 3 caracteres</li>
                                    <li>• <strong>NumeroPaginas:</strong> Número entero &gt; 0</li>
                                    <li>• <strong>Ano:</strong> Año entre 1900 y 2100</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <strong>Valores automáticos:</strong> SituacionMilitar = &quot;Actividad&quot;, Estado = &quot;dentro&quot;, Ubicacion = &quot;Archivo Central&quot;
                            </p>
                        </div>
                    </Card>
                </div>
            )}

            {/* Step 2: Preview */}
            {step === 'preview' && (
                <div className="space-y-6">
                    {/* Summary */}
                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{excelData.length}</div>
                                <div className="text-sm text-blue-600">Total Registros</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{validRows.length}</div>
                                <div className="text-sm text-green-600">Registros Válidos</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{errorRows.length}</div>
                                <div className="text-sm text-red-600">Registros con Errores</div>
                            </div>
                        </div>
                    </Card>

                    {/* Data Preview */}
                    <Card className="overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                <Eye className="h-5 w-5" />
                                Vista Previa de Datos
                            </h3>
                            <p className="text-sm text-gray-500">Los errores se muestran en las primeras filas</p>
                        </div>
                        
                        <div className="overflow-x-auto max-h-96">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fila</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grado</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CIP</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apellidos y Nombres</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Núm. Páginas</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Año</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Errores</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* Primero mostrar errores */}
                                    {errorRows.map((row, index) => {
                                        // Usar color más sutil para la fila, destacar solo el CIP
                                        const rowClassName = row.duplicateColor 
                                            ? "bg-gray-50 border-l-4 border-gray-300" 
                                            : "bg-red-50";
                                        
                                        return (
                                            <tr key={`error-${index}`} className={rowClassName}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.rowIndex}</td>
                                                <td className="px-4 py-3">
                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.Grado}</td>
                                                <td className="px-4 py-3 text-sm font-medium">
                                                    {row.duplicateColor ? (
                                                        <span className={`px-3 py-2 rounded-lg border-2 text-sm font-bold shadow-sm ${row.duplicateColor}`}>
                                                            {row.CIP}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-900">{row.CIP}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.ApellidosNombres}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.NumeroPaginas}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.Ano}</td>
                                                <td className="px-4 py-3 text-sm">{row.errors && row.errors.length > 0 && (
                                                        <div className="text-red-600">
                                                            {row.errors.map((error, i) => (
                                                                <div key={i}>• {error}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* Luego mostrar registros válidos */}
                                    {validRows.map((row, index) => {
                                        // Color de fila sutil, destacar solo el CIP
                                        const rowClassName = row.duplicateColor 
                                            ? "bg-gray-50 border-l-4 border-gray-300 hover:bg-gray-100" 
                                            : "hover:bg-gray-50";
                                        
                                        return (
                                            <tr key={`valid-${index}`} className={rowClassName}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.rowIndex}</td>
                                                <td className="px-4 py-3">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.Grado}</td>
                                                <td className="px-4 py-3 text-sm font-medium">
                                                    {row.duplicateColor ? (
                                                        <span className={`px-3 py-2 rounded-lg border-2 text-sm font-bold shadow-sm ${row.duplicateColor}`}>
                                                            {row.CIP}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-900">{row.CIP}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.ApellidosNombres}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.NumeroPaginas}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{row.Ano}</td>
                                                <td className="px-4 py-3 text-sm text-green-600">
                                                    ✓ Válido
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Leyenda de Colores para Duplicados */}
                    {errorRows.some(row => row.duplicateColor) && (
                        <Card className="p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Leyenda de Duplicados</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {(() => {
                                    // Agrupar por CIP duplicado y mostrar solo un ejemplo de cada color
                                    const cipGroups = new Map<string, { cip: string; color: string; count: number }>();
                                    
                                    errorRows.forEach(row => {
                                        if (row.duplicateColor && row.CIP) {
                                            const cip = row.CIP.toString().trim();
                                            if (!cipGroups.has(cip)) {
                                                const count = errorRows.filter(r => r.CIP?.toString().trim() === cip).length;
                                                cipGroups.set(cip, { 
                                                    cip, 
                                                    color: row.duplicateColor,
                                                    count 
                                                });
                                            }
                                        }
                                    });

                                    return Array.from(cipGroups.values()).map((group, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${group.color}`}>
                                                {group.cip}
                                            </span>
                                            <span className="text-gray-600">
                                                ({group.count} registros)
                                            </span>
                                        </div>
                                    ));
                                })()}
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                                💡 Los CIPs duplicados se agrupan por color. Cada color representa un grupo diferente de duplicados.
                            </p>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between">
                        <Button onClick={resetImport} variant="outline">
                            Cargar Otro Archivo
                        </Button>
                        <div className="flex gap-2">
                            <Button onClick={onCancel} variant="outline">
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={validRows.length === 0 || importing}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Importar {validRows.length} Expedientes
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Importing */}
            {step === 'importing' && (
                <Card className="p-8">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Procesando archivo...
                        </h3>
                        <p className="text-sm text-gray-500">
                            El servidor está validando y procesando los expedientes. Por favor espere.
                        </p>
                    </div>
                </Card>
            )}

            {/* Step 4: Complete */}
            {step === 'complete' && importResults && (
                <div className="space-y-6">
                    {/* Results Summary */}
                    <Card className="p-6">
                        <div className="text-center mb-6">
                            {importResults.failed_imports === 0 ? (
                                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
                            ) : (
                                <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                            )}
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Importación Completada
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{importResults.total_processed}</div>
                                <div className="text-sm text-blue-600">Total Procesados</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{importResults.successful_imports}</div>
                                <div className="text-sm text-green-600">Exitosos</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{importResults.failed_imports}</div>
                                <div className="text-sm text-red-600">Fallidos</div>
                            </div>
                        </div>
                    </Card>

                    {/* Errors Detail */}
                    {importResults.errors && importResults.errors.length > 0 && (
                        <Card className="overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <FileX className="h-5 w-5 text-red-500" />
                                    Errores en Registros
                                </h4>
                            </div>
                            <div className="overflow-x-auto max-h-96">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fila</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Errores</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {importResults.errors.map((error, index) => (
                                            <tr key={index} className="bg-red-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{error.row}</td>
                                                <td className="px-4 py-3 text-sm text-red-600">
                                                    {error.errors.map((err, i) => (
                                                        <div key={i}>• {err}</div>
                                                    ))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex justify-center gap-2">
                        <Button onClick={resetImport} variant="outline">
                            Importar Otro Archivo
                        </Button>
                        <Button onClick={onImportComplete} className="bg-indigo-600 hover:bg-indigo-700">
                            Finalizar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}