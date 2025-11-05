import { z } from 'zod';

// Person validation schema
export const personSchema = z.object({
    dni: z.string()
        .length(8, 'DNI must be exactly 8 digits')
        .regex(/^\d{8}$/, 'DNI must contain only digits'),
    nombre: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters'),
    edad: z.number()
        .int('Age must be an integer')
        .min(0, 'Age cannot be negative')
        .max(150, 'Age cannot exceed 150'),
});

export type PersonFormData = z.infer<typeof personSchema>;

// User validation schema - Según Swagger
export const userSchema = z.object({
    email: z.string()
        .email('Email inválido')
        .min(5, 'El email debe tener al menos 5 caracteres')
        .max(100, 'El email no puede exceder 100 caracteres'),
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(100, 'La contraseña no puede exceder 100 caracteres')
        .optional()
        .or(z.literal('')),
    nombre: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    apellido: z.string()
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .max(100, 'El apellido no puede exceder 100 caracteres'),
    documento: z.string()
        .min(8, 'El documento debe tener al menos 8 caracteres')
        .max(20, 'El documento no puede exceder 20 caracteres'),
    profile_id: z.string()
        .min(1, 'Debe seleccionar un perfil'),
});

export type UserFormData = z.infer<typeof userSchema>;

// Profile validation schema - Según Swagger
export const profileSchema = z.object({
    name: z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    slug: z.string()
        .min(3, 'El slug debe tener al menos 3 caracteres')
        .max(50, 'El slug no puede exceder 50 caracteres')
        .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
    description: z.string()
        .max(500, 'La descripción no puede exceder 500 caracteres')
        .optional()
        .or(z.literal('')),
    active: z.boolean()
        .optional()
        .default(true),
    permissions: z.array(z.string())
        .optional()
        .default([]),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Expediente validation schema - Según Swagger
export const expedienteSchema = z.object({
    grado: z.enum(['GRAL', 'CRL', 'TTE CRL', 'MY', 'CAP', 'TTE', 'STTE', 'TCO', 'SSOO', 'EC', 'TROPA'], {
        required_error: 'Debe seleccionar un grado',
    }),
    apellidos_nombres: z.string()
        .min(3, 'Los apellidos y nombres deben tener al menos 3 caracteres')
        .max(200, 'Los apellidos y nombres no pueden exceder 200 caracteres'),
    cip: z.string()
        .length(9, 'El CIP debe tener exactamente 9 dígitos')
        .regex(/^\d{9}$/, 'El CIP debe contener solo números'),
    numero_paginas: z.number()
        .int('El número de páginas debe ser un entero')
        .min(1, 'El número de páginas debe ser al menos 1'),
    situacion_militar: z.enum(['Actividad', 'Retiro'], {
        required_error: 'Debe seleccionar una situación militar',
    }),
    ubicacion: z.string()
        .min(1, 'La ubicación es requerida')
        .max(200, 'La ubicación no puede exceder 200 caracteres'),
    orden: z.number()
        .int('El orden debe ser un entero')
        .min(1, 'El orden debe ser al menos 1'),
    estado: z.enum(['dentro', 'fuera'])
        .optional(),
});

export type ExpedienteFormData = z.infer<typeof expedienteSchema>;
