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

/**
 * Appointment creation schema.
 */
export const citaSchema = z.object({
  pacienteId: z.string().uuid("Selecciona un paciente"),
  fisioterapeutaId: z.string().uuid("Selecciona un fisioterapeuta").optional(),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  horaInicio: z.string().min(1, "La hora de inicio es obligatoria"),
  duracion: z.number().int().min(15).max(180).default(45),
  tipoSesion: z
    .string()
    .max(100, "El tipo de sesión no puede exceder 100 caracteres")
    .optional(),
  sala: z
    .string()
    .max(60, "La sala no puede exceder 60 caracteres")
    .optional(),
});

export type CitaInput = z.infer<typeof citaSchema>;

/**
 * Payment registration schema.
 */
export const pagoSchema = z.object({
  pacienteId: z.string().uuid("Selecciona un paciente"),
  monto: z
    .number({ message: "Ingresa un monto válido" })
    .positive("El monto debe ser mayor a 0"),
  metodo: z.enum(["efectivo", "transferencia", "tarjeta_debito", "tarjeta_credito", "otro"], {
    message: "Selecciona un método de pago",
  }),
  concepto: z
    .string()
    .min(3, "El concepto debe tener al menos 3 caracteres")
    .max(300, "El concepto no puede exceder 300 caracteres"),
  referenciaExterna: z.string().max(200).optional().or(z.literal("")),
  fechaPago: z.string().optional(),
  notas: z.string().max(500).optional().or(z.literal("")),
});

export type PagoInput = z.infer<typeof pagoSchema>;

/**
 * SOAP note schema.
 */
export const notaSesionSchema = z.object({
  citaId: z.string().uuid("Selecciona una cita"),
  pacienteId: z.string().uuid("Selecciona un paciente"),
  subjetivo: z.string().max(2000).optional().or(z.literal("")),
  objetivo: z.string().max(2000).optional().or(z.literal("")),
  analisis: z.string().max(2000).optional().or(z.literal("")),
  plan: z.string().max(2000).optional().or(z.literal("")),
  dolorInicio: z.string().optional(),
  dolorFin: z.string().optional(),
});

export type NotaSesionInput = z.infer<typeof notaSesionSchema>;
