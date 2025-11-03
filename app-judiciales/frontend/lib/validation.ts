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

// User validation schema
export const userSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(5, 'El email debe tener al menos 5 caracteres')
    .max(100, 'El email no puede exceder 100 caracteres'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
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
  telefono: z.string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  profile_id: z.string()
    .optional()
    .or(z.literal('')),
  roles: z.array(z.string()).optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
