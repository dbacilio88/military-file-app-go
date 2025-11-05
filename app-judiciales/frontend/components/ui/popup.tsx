'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type PopupType = 'success' | 'error' | 'info' | 'warning';

interface PopupProps {
    id: string;
    type: PopupType;
    title?: string;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

export function Popup({ id, type, title, message, duration = 5000, onClose }: PopupProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-12 w-12 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-12 w-12 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
            case 'info':
                return <Info className="h-12 w-12 text-blue-500" />;
        }
    };

    const getTitle = () => {
        if (title) return title;
        switch (type) {
            case 'success':
                return 'Éxito';
            case 'error':
                return 'Error';
            case 'warning':
                return 'Advertencia';
            case 'info':
                return 'Información';
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50';
            case 'error':
                return 'bg-red-50';
            case 'warning':
                return 'bg-yellow-50';
            case 'info':
                return 'bg-blue-50';
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-fadeIn"
                onClick={() => onClose(id)}
            />

            {/* Popup Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md animate-scaleIn">
                <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                    {/* Icon Header */}
                    <div className={`${getBgColor()} p-6 flex justify-center`}>
                        {getIcon()}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                            {getTitle()}
                        </h3>

                        <p className="text-gray-600 text-center mb-6">
                            {message}
                        </p>

                        <button
                            onClick={() => onClose(id)}
                            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
