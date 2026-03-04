import { z } from "zod";

/**
 * Login form schema — validates email and password.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Patient creation schema — validates new patient form.
 */
export const pacienteSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  apellido: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(80, "El apellido no puede exceder 80 caracteres"),
  email: z
    .string()
    .email("Ingresa un correo válido")
    .optional()
    .or(z.literal("")),
  telefono: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .max(15, "El teléfono no puede exceder 15 dígitos")
    .regex(/^[\d\s+()-]+$/, "Solo se permiten números y caracteres de teléfono")
    .optional()
    .or(z.literal("")),
  edad: z
    .number({ error: "Ingresa una edad válida" })
    .int()
    .min(0, "La edad no puede ser negativa")
    .max(150, "Ingresa una edad válida"),
  diagnostico: z
    .string()
    .min(3, "El diagnóstico debe tener al menos 3 caracteres")
    .max(200, "El diagnóstico no puede exceder 200 caracteres"),
  cie10: z
    .string()
    .max(20, "Código CIE-10 demasiado largo")
    .optional()
    .or(z.literal("")),
  ciudad: z
    .string()
    .max(100, "La ciudad no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),
});

export type PacienteInput = z.infer<typeof pacienteSchema>;
