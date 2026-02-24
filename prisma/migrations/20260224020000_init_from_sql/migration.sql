-- CreateEnum
CREATE TYPE "PlanTipo" AS ENUM ('basico', 'pro', 'clinica');

-- CreateEnum
CREATE TYPE "GeneroTipo" AS ENUM ('masculino', 'femenino', 'otro', 'no_especificado');

-- CreateEnum
CREATE TYPE "SesionEstado" AS ENUM ('agendada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_show');

-- CreateEnum
CREATE TYPE "PagoMetodo" AS ENUM ('efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito', 'otro');

-- CreateEnum
CREATE TYPE "PagoEstado" AS ENUM ('pendiente', 'pagado', 'parcial', 'reembolsado');

-- CreateEnum
CREATE TYPE "MembresiaEstado" AS ENUM ('activa', 'pausada', 'vencida', 'cancelada', 'pendiente_activacion');

-- CreateEnum
CREATE TYPE "NotificacionTipo" AS ENUM ('recordatorio_cita', 'sesion_por_vencer', 'membresia_vencida', 'seguimiento', 'ejercicio_pendiente', 'general');

-- CreateEnum
CREATE TYPE "LesionLado" AS ENUM ('izquierdo', 'derecho', 'bilateral', 'central', 'n_a');

-- CreateEnum
CREATE TYPE "DolorEscala" AS ENUM ('N0', 'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N10');

-- CreateEnum
CREATE TYPE "EjercicioTipo" AS ENUM ('movilidad', 'fortalecimiento', 'estiramiento', 'cardio', 'equilibrio', 'respiracion', 'otro');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "plan" "PlanTipo" NOT NULL DEFAULT 'basico',
    "activo" BOOLEAN DEFAULT true,
    "logo_url" TEXT,
    "color_primario" VARCHAR(7) DEFAULT '#2563EB',
    "telefono" VARCHAR(20),
    "email_contacto" VARCHAR(150),
    "direccion" TEXT,
    "ciudad" VARCHAR(100),
    "estado" VARCHAR(100),
    "pais" VARCHAR(60) DEFAULT 'México',
    "timezone" VARCHAR(60) DEFAULT 'America/Mexico_City',
    "configuracion" JSONB DEFAULT '{}',
    "stripe_customer_id" VARCHAR(100),
    "suscripcion_activa" BOOLEAN DEFAULT false,
    "suscripcion_fin" DATE,
    "max_fisioterapeutas" INTEGER DEFAULT 1,
    "max_pacientes_activos" INTEGER DEFAULT 50,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20),
    "password_hash" TEXT NOT NULL,
    "rol" VARCHAR(30) NOT NULL DEFAULT 'fisioterapeuta',
    "cedula_profesional" VARCHAR(50),
    "especialidades" TEXT[],
    "foto_url" TEXT,
    "bio" TEXT,
    "activo" BOOLEAN DEFAULT true,
    "ultimo_login" TIMESTAMPTZ,
    "token_recuperacion" TEXT,
    "token_exp" TIMESTAMPTZ,
    "refresh_token" TEXT,
    "configuracion" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_trabajo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "dia" "DiaSemana" NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fin" TIME NOT NULL,
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "horarios_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloqueos_horario" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "fecha_inicio" TIMESTAMPTZ NOT NULL,
    "fecha_fin" TIMESTAMPTZ NOT NULL,
    "motivo" VARCHAR(200),
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bloqueos_horario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "fisioterapeuta_id" UUID,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150),
    "telefono" VARCHAR(20) NOT NULL,
    "whatsapp" VARCHAR(20),
    "fecha_nacimiento" DATE,
    "genero" "GeneroTipo" DEFAULT 'no_especificado',
    "ocupacion" VARCHAR(100),
    "foto_url" TEXT,
    "contacto_emergencia_nombre" VARCHAR(150),
    "contacto_emergencia_tel" VARCHAR(20),
    "contacto_emergencia_relacion" VARCHAR(60),
    "peso_kg" DECIMAL(5,2),
    "altura_cm" DECIMAL(5,1),
    "tipo_sangre" VARCHAR(5),
    "alergias" TEXT[],
    "medicamentos_actuales" TEXT,
    "enfermedades_cronicas" TEXT[],
    "cirugias_previas" TEXT,
    "notas_medicas" TEXT,
    "activo" BOOLEAN DEFAULT true,
    "fecha_primera_cita" DATE,
    "total_sesiones" INTEGER DEFAULT 0,
    "wallet_pass_url" TEXT,
    "wallet_pass_id" VARCHAR(100),
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnosticos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paciente_id" UUID NOT NULL,
    "fisioterapeuta_id" UUID NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_DATE,
    "motivo_consulta" TEXT NOT NULL,
    "diagnostico_principal" VARCHAR(300) NOT NULL,
    "diagnostico_cie10" VARCHAR(10),
    "zona_lesion" VARCHAR(100),
    "lado_lesion" "LesionLado" DEFAULT 'n_a',
    "tipo_lesion" VARCHAR(100),
    "origen" VARCHAR(100),
    "cronificacion" BOOLEAN DEFAULT false,
    "objetivos_tratamiento" TEXT,
    "plan_tratamiento" TEXT,
    "numero_sesiones_estimadas" INTEGER,
    "observaciones" TEXT,
    "activo" BOOLEAN DEFAULT true,
    "fecha_cierre" DATE,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnosticos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "body_map_marcas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "diagnostico_id" UUID NOT NULL,
    "vista" VARCHAR(20) NOT NULL,
    "coord_x" DECIMAL(5,2) NOT NULL,
    "coord_y" DECIMAL(5,2) NOT NULL,
    "tipo" VARCHAR(30) DEFAULT 'dolor',
    "intensidad" "DolorEscala" DEFAULT 'N5',
    "color" VARCHAR(7) DEFAULT '#EF4444',
    "descripcion" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "body_map_marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expediente_adjuntos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paciente_id" UUID NOT NULL,
    "diagnostico_id" UUID,
    "nombre" VARCHAR(200) NOT NULL,
    "tipo" VARCHAR(50),
    "url" TEXT NOT NULL,
    "size_bytes" BIGINT,
    "descripcion" TEXT,
    "uploaded_by" UUID,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expediente_adjuntos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paquetes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "num_sesiones" INTEGER NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "duracion_dias" INTEGER,
    "activo" BOOLEAN DEFAULT true,
    "color" VARCHAR(7) DEFAULT '#2563EB',
    "notas_internas" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paquetes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membresias" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "paquete_id" UUID NOT NULL,
    "fisioterapeuta_id" UUID,
    "diagnostico_id" UUID,
    "estado" "MembresiaEstado" DEFAULT 'pendiente_activacion',
    "sesiones_total" INTEGER NOT NULL,
    "sesiones_usadas" INTEGER DEFAULT 0,
    "precio_pagado" DECIMAL(10,2) NOT NULL,
    "fecha_compra" DATE NOT NULL DEFAULT CURRENT_DATE,
    "fecha_activacion" DATE,
    "fecha_vencimiento" DATE,
    "activada_manualmente" BOOLEAN DEFAULT false,
    "notas_activacion" TEXT,
    "wallet_pass_id" VARCHAR(100),
    "wallet_serial" VARCHAR(100),
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membresias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "fisioterapeuta_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "membresía_id" UUID,
    "diagnostico_id" UUID,
    "fecha_hora_inicio" TIMESTAMPTZ NOT NULL,
    "fecha_hora_fin" TIMESTAMPTZ NOT NULL,
    "estado" "SesionEstado" DEFAULT 'agendada',
    "tipo_sesion" VARCHAR(100) DEFAULT 'rehabilitación',
    "numero_sesion" INTEGER,
    "sala" VARCHAR(60),
    "recordatorio_enviado" BOOLEAN DEFAULT false,
    "recordatorio_at" TIMESTAMPTZ,
    "confirmada_paciente" BOOLEAN DEFAULT false,
    "notas_previas" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_sesion" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "cita_id" UUID NOT NULL,
    "fisioterapeuta_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "fecha" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subjetivo" TEXT,
    "objetivo" TEXT,
    "analisis" TEXT,
    "plan" TEXT,
    "dolor_inicio" "DolorEscala",
    "dolor_fin" "DolorEscala",
    "tecnicas_utilizadas" TEXT[],
    "duracion_tecnicas" JSONB,
    "evolucion" VARCHAR(30) DEFAULT 'sin_cambios',
    "porcentaje_objetivo" INTEGER,
    "notas_adicionales" TEXT,
    "proxima_sesion_recomendacion" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesion_fotos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nota_sesion_id" UUID,
    "paciente_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "tipo" VARCHAR(50) DEFAULT 'postura',
    "descripcion" TEXT,
    "fecha" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "orden" INTEGER DEFAULT 0,

    CONSTRAINT "sesion_fotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "membresía_id" UUID,
    "cita_id" UUID,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo" "PagoMetodo" NOT NULL,
    "estado" "PagoEstado" DEFAULT 'pagado',
    "referencia_externa" VARCHAR(200),
    "concepto" TEXT NOT NULL,
    "notas" TEXT,
    "registrado_por" UUID,
    "fecha_pago" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ejercicios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "tipo" "EjercicioTipo" NOT NULL,
    "zona_corporal" TEXT[],
    "nivel_dificultad" VARCHAR(20) DEFAULT 'medio',
    "instrucciones" TEXT,
    "consejos" TEXT,
    "precauciones" TEXT,
    "video_url" TEXT,
    "imagen_url" TEXT,
    "gif_url" TEXT,
    "duracion_segundos" INTEGER,
    "series" INTEGER,
    "repeticiones" INTEGER,
    "es_global" BOOLEAN DEFAULT false,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ejercicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ejercicios_asignados" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "paciente_id" UUID NOT NULL,
    "ejercicio_id" UUID NOT NULL,
    "cita_id" UUID,
    "fisioterapeuta_id" UUID,
    "series" INTEGER,
    "repeticiones" INTEGER,
    "duracion_segundos" INTEGER,
    "frecuencia_dias" INTEGER DEFAULT 1,
    "instrucciones_personalizadas" TEXT,
    "fecha_inicio" DATE DEFAULT CURRENT_DATE,
    "fecha_fin" DATE,
    "activo" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ejercicios_asignados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ejercicios_registro" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "ejercicio_asignado_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_DATE,
    "completado" BOOLEAN DEFAULT true,
    "series_hechas" INTEGER,
    "rep_hechas" INTEGER,
    "dolor_durante" "DolorEscala",
    "notas_paciente" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ejercicios_registro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encuestas_sesion" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "cita_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "nps_score" INTEGER,
    "dolor_post" "DolorEscala",
    "satisfaccion" INTEGER,
    "mejoria_percibida" VARCHAR(30),
    "comentarios" TEXT,
    "enviada_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "respondida_at" TIMESTAMPTZ,
    "respondida" BOOLEAN DEFAULT false,

    CONSTRAINT "encuestas_sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "paciente_id" UUID,
    "usuario_id" UUID,
    "tipo" "NotificacionTipo" NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "canal" VARCHAR(30) DEFAULT 'whatsapp',
    "enviada" BOOLEAN DEFAULT false,
    "enviada_at" TIMESTAMPTZ,
    "leida" BOOLEAN DEFAULT false,
    "leida_at" TIMESTAMPTZ,
    "error" TEXT,
    "referencia_id" UUID,
    "referencia_tipo" VARCHAR(50),
    "programada_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantillas_mensaje" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" "NotificacionTipo" NOT NULL,
    "canal" VARCHAR(30) DEFAULT 'whatsapp',
    "asunto" VARCHAR(200),
    "cuerpo" TEXT NOT NULL,
    "activa" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plantillas_mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progreso_dolor" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "paciente_id" UUID NOT NULL,
    "diagnostico_id" UUID,
    "cita_id" UUID,
    "fecha" DATE NOT NULL,
    "dolor_inicio" INTEGER,
    "dolor_fin" INTEGER,
    "evolucion" VARCHAR(30),
    "numero_sesion" INTEGER,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progreso_dolor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_tenant_id_idx" ON "usuarios"("tenant_id");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_trabajo_usuario_id_dia_key" ON "horarios_trabajo"("usuario_id", "dia");

-- CreateIndex
CREATE INDEX "pacientes_tenant_id_idx" ON "pacientes"("tenant_id");

-- CreateIndex
CREATE INDEX "pacientes_fisioterapeuta_id_idx" ON "pacientes"("fisioterapeuta_id");

-- CreateIndex
CREATE INDEX "pacientes_telefono_idx" ON "pacientes"("telefono");

-- CreateIndex
CREATE INDEX "diagnosticos_paciente_id_idx" ON "diagnosticos"("paciente_id");

-- CreateIndex
CREATE INDEX "diagnosticos_fisioterapeuta_id_idx" ON "diagnosticos"("fisioterapeuta_id");

-- CreateIndex
CREATE INDEX "paquetes_tenant_id_idx" ON "paquetes"("tenant_id");

-- CreateIndex
CREATE INDEX "membresias_paciente_id_idx" ON "membresias"("paciente_id");

-- CreateIndex
CREATE INDEX "membresias_tenant_id_idx" ON "membresias"("tenant_id");

-- CreateIndex
CREATE INDEX "membresias_estado_idx" ON "membresias"("estado");

-- CreateIndex
CREATE INDEX "citas_fisioterapeuta_id_idx" ON "citas"("fisioterapeuta_id");

-- CreateIndex
CREATE INDEX "citas_paciente_id_idx" ON "citas"("paciente_id");

-- CreateIndex
CREATE INDEX "citas_fecha_hora_inicio_idx" ON "citas"("fecha_hora_inicio");

-- CreateIndex
CREATE INDEX "citas_tenant_id_idx" ON "citas"("tenant_id");

-- CreateIndex
CREATE INDEX "citas_estado_idx" ON "citas"("estado");

-- CreateIndex
CREATE INDEX "notas_sesion_cita_id_idx" ON "notas_sesion"("cita_id");

-- CreateIndex
CREATE INDEX "notas_sesion_paciente_id_idx" ON "notas_sesion"("paciente_id");

-- CreateIndex
CREATE INDEX "pagos_tenant_id_idx" ON "pagos"("tenant_id");

-- CreateIndex
CREATE INDEX "pagos_paciente_id_idx" ON "pagos"("paciente_id");

-- CreateIndex
CREATE INDEX "pagos_membresía_id_idx" ON "pagos"("membresía_id");

-- CreateIndex
CREATE INDEX "pagos_fecha_pago_idx" ON "pagos"("fecha_pago");

-- CreateIndex
CREATE INDEX "ejercicios_tenant_id_idx" ON "ejercicios"("tenant_id");

-- CreateIndex
CREATE INDEX "ejercicios_tipo_idx" ON "ejercicios"("tipo");

-- CreateIndex
CREATE INDEX "encuestas_sesion_paciente_id_idx" ON "encuestas_sesion"("paciente_id");

-- CreateIndex
CREATE INDEX "notificaciones_tenant_id_idx" ON "notificaciones"("tenant_id");

-- CreateIndex
CREATE INDEX "notificaciones_paciente_id_idx" ON "notificaciones"("paciente_id");

-- CreateIndex
CREATE INDEX "progreso_dolor_paciente_id_idx" ON "progreso_dolor"("paciente_id");

-- CreateIndex
CREATE INDEX "progreso_dolor_fecha_idx" ON "progreso_dolor"("fecha");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_trabajo" ADD CONSTRAINT "horarios_trabajo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueos_horario" ADD CONSTRAINT "bloqueos_horario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_fisioterapeuta_id_fkey" FOREIGN KEY ("fisioterapeuta_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosticos" ADD CONSTRAINT "diagnosticos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosticos" ADD CONSTRAINT "diagnosticos_fisioterapeuta_id_fkey" FOREIGN KEY ("fisioterapeuta_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "body_map_marcas" ADD CONSTRAINT "body_map_marcas_diagnostico_id_fkey" FOREIGN KEY ("diagnostico_id") REFERENCES "diagnosticos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expediente_adjuntos" ADD CONSTRAINT "expediente_adjuntos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expediente_adjuntos" ADD CONSTRAINT "expediente_adjuntos_diagnostico_id_fkey" FOREIGN KEY ("diagnostico_id") REFERENCES "diagnosticos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expediente_adjuntos" ADD CONSTRAINT "expediente_adjuntos_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paquetes" ADD CONSTRAINT "paquetes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_paquete_id_fkey" FOREIGN KEY ("paquete_id") REFERENCES "paquetes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_fisioterapeuta_id_fkey" FOREIGN KEY ("fisioterapeuta_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_diagnostico_id_fkey" FOREIGN KEY ("diagnostico_id") REFERENCES "diagnosticos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_fisioterapeuta_id_fkey" FOREIGN KEY ("fisioterapeuta_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_membresía_id_fkey" FOREIGN KEY ("membresía_id") REFERENCES "membresias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_diagnostico_id_fkey" FOREIGN KEY ("diagnostico_id") REFERENCES "diagnosticos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_sesion" ADD CONSTRAINT "notas_sesion_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "citas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_sesion" ADD CONSTRAINT "notas_sesion_fisioterapeuta_id_fkey" FOREIGN KEY ("fisioterapeuta_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_sesion" ADD CONSTRAINT "notas_sesion_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesion_fotos" ADD CONSTRAINT "sesion_fotos_nota_sesion_id_fkey" FOREIGN KEY ("nota_sesion_id") REFERENCES "notas_sesion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesion_fotos" ADD CONSTRAINT "sesion_fotos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_membresía_id_fkey" FOREIGN KEY ("membresía_id") REFERENCES "membresias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "citas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejercicios" ADD CONSTRAINT "ejercicios_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejercicios" ADD CONSTRAINT "ejercicios_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejercicios_asignados" ADD CONSTRAINT "ejercicios_asignados_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejercicios_asignados" ADD CONSTRAINT "ejercicios_asignados_ejercicio_id_fkey" FOREIGN KEY ("ejercicio_id") REFERENCES "ejercicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejercicios_asignados" ADD CONSTRAINT "ejercicios_asignados_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "citas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejercicios_asignados" ADD CONSTRAINT "ejercicios_asignados_fisioterapeuta_id_fkey" FOREIGN KEY ("fisioterapeuta_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejercicios_registro" ADD CONSTRAINT "ejercicios_registro_ejercicio_asignado_id_fkey" FOREIGN KEY ("ejercicio_asignado_id") REFERENCES "ejercicios_asignados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejercicios_registro" ADD CONSTRAINT "ejercicios_registro_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuestas_sesion" ADD CONSTRAINT "encuestas_sesion_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "citas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuestas_sesion" ADD CONSTRAINT "encuestas_sesion_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantillas_mensaje" ADD CONSTRAINT "plantillas_mensaje_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_dolor" ADD CONSTRAINT "progreso_dolor_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_dolor" ADD CONSTRAINT "progreso_dolor_diagnostico_id_fkey" FOREIGN KEY ("diagnostico_id") REFERENCES "diagnosticos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_dolor" ADD CONSTRAINT "progreso_dolor_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "citas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
