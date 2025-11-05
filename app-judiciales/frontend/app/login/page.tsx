'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/toastContext';
import { login } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const toast = useToast();
    const [email, setEmail] = useState('admin@sistema.mil');
    const [password, setPassword] = useState('admin123');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await login(email, password);

            if (data.success && data.data) {
                // Guardar tokens en sessionStorage
                sessionStorage.setItem('access_token', data.data.access_token);
                sessionStorage.setItem('refresh_token', data.data.refresh_token);
                sessionStorage.setItem('user', JSON.stringify(data.data.user));

                toast.success('Sesión iniciada correctamente');

                // Redirigir al dashboard
                router.push('/');
            } else {
                toast.error('Error: No se recibieron los datos de autenticación');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sistema Expedientes Judiciales
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Ingrese sus credenciales
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-500 mt-4">
                            Credenciales por defecto:<br />
                            <span className="font-mono">admin@sistema.mil / admin123</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
