-- ============================================================
-- PLATAFORMA FISIOTERAPEUTAS - SCHEMA PostgreSQL
-- Versión 1.0 | Said Bain & Co. Tech
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- búsquedas fuzzy en nombres

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE plan_tipo AS ENUM ('basico', 'pro', 'clinica');
CREATE TYPE genero_tipo AS ENUM ('masculino', 'femenino', 'otro', 'no_especificado');
CREATE TYPE sesion_estado AS ENUM ('agendada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_show');
CREATE TYPE pago_metodo AS ENUM ('efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito', 'otro');
CREATE TYPE pago_estado AS ENUM ('pendiente', 'pagado', 'parcial', 'reembolsado');
CREATE TYPE membresía_estado AS ENUM ('activa', 'pausada', 'vencida', 'cancelada', 'pendiente_activacion');
CREATE TYPE notificacion_tipo AS ENUM ('recordatorio_cita', 'sesion_por_vencer', 'membresía_vencida', 'seguimiento', 'ejercicio_pendiente', 'general');
CREATE TYPE lesion_lado AS ENUM ('izquierdo', 'derecho', 'bilateral', 'central', 'n/a');
CREATE TYPE dolor_escala AS ENUM ('0','1','2','3','4','5','6','7','8','9','10');
CREATE TYPE ejercicio_tipo AS ENUM ('movilidad', 'fortalecimiento', 'estiramiento', 'cardio', 'equilibrio', 'respiracion', 'otro');
CREATE TYPE dia_semana AS ENUM ('lunes','martes','miercoles','jueves','viernes','sabado','domingo');

-- ============================================================
-- MÓDULO 1: TENANTS / CLÍNICAS
-- ============================================================

CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          VARCHAR(150) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,          -- URL amigable
    plan            plan_tipo NOT NULL DEFAULT 'basico',
    activo          BOOLEAN DEFAULT TRUE,
    logo_url        TEXT,
    color_primario  VARCHAR(7) DEFAULT '#2563EB',          -- hex
    telefono        VARCHAR(20),
    email_contacto  VARCHAR(150),
    direccion       TEXT,
    ciudad          VARCHAR(100),
    estado          VARCHAR(100),
    pais            VARCHAR(60) DEFAULT 'México',
    timezone        VARCHAR(60) DEFAULT 'America/Mexico_City',
    configuracion   JSONB DEFAULT '{}',                   -- ajustes varios del tenant
    stripe_customer_id VARCHAR(100),
    suscripcion_activa BOOLEAN DEFAULT FALSE,
    suscripcion_fin DATE,
    max_fisioterapeutas INT DEFAULT 1,
    max_pacientes_activos INT DEFAULT 50,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON tenants(slug);

-- ============================================================
-- MÓDULO 2: USUARIOS (FISIOTERAPEUTAS Y ADMINS)
-- ============================================================

CREATE TABLE usuarios (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    telefono        VARCHAR(20),
    password_hash   TEXT NOT NULL,
    rol             VARCHAR(30) NOT NULL DEFAULT 'fisioterapeuta', -- owner, admin, fisioterapeuta, asistente
    cedula_profesional VARCHAR(50),
    especialidades  TEXT[],                                -- ej: ['deportiva','neurológica']
    foto_url        TEXT,
    bio             TEXT,
    activo          BOOLEAN DEFAULT TRUE,
    ultimo_login    TIMESTAMPTZ,
    token_recuperacion TEXT,
    token_exp       TIMESTAMPTZ,
    refresh_token   TEXT,
    configuracion   JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- ============================================================
-- MÓDULO 3: HORARIOS DE TRABAJO
-- ============================================================

CREATE TABLE horarios_trabajo (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    dia             dia_semana NOT NULL,
    hora_inicio     TIME NOT NULL,
    hora_fin        TIME NOT NULL,
    activo          BOOLEAN DEFAULT TRUE,
    UNIQUE(usuario_id, dia)
);

CREATE TABLE bloqueos_horario (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_inicio    TIMESTAMPTZ NOT NULL,
    fecha_fin       TIMESTAMPTZ NOT NULL,
    motivo          VARCHAR(200),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MÓDULO 4: PACIENTES
-- ============================================================

CREATE TABLE pacientes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    fisioterapeuta_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,  -- fisio principal
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    email           VARCHAR(150),
    telefono        VARCHAR(20) NOT NULL,
    whatsapp        VARCHAR(20),
    fecha_nacimiento DATE,
    genero          genero_tipo DEFAULT 'no_especificado',
    ocupacion       VARCHAR(100),
    foto_url        TEXT,
    
    -- Contacto de emergencia
    contacto_emergencia_nombre  VARCHAR(150),
    contacto_emergencia_tel     VARCHAR(20),
    contacto_emergencia_relacion VARCHAR(60),
    
    -- Información médica general
    peso_kg         DECIMAL(5,2),
    altura_cm       DECIMAL(5,1),
    tipo_sangre     VARCHAR(5),
    alergias        TEXT[],
    medicamentos_actuales TEXT,
    enfermedades_cronicas TEXT[],
    cirugias_previas TEXT,
    notas_medicas   TEXT,
    
    activo          BOOLEAN DEFAULT TRUE,
    fecha_primera_cita DATE,
    total_sesiones  INT DEFAULT 0,
    
    -- Digital wallet
    wallet_pass_url TEXT,
    wallet_pass_id  VARCHAR(100),
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pacientes_tenant ON pacientes(tenant_id);
CREATE INDEX idx_pacientes_fisio ON pacientes(fisioterapeuta_id);
CREATE INDEX idx_pacientes_nombre_trgm ON pacientes USING GIN (nombre gin_trgm_ops);
CREATE INDEX idx_pacientes_telefono ON pacientes(telefono);

-- ============================================================
-- MÓDULO 5: DIAGNÓSTICOS Y EXPEDIENTE CLÍNICO
-- ============================================================

CREATE TABLE diagnosticos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id     UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    fisioterapeuta_id UUID NOT NULL REFERENCES usuarios(id),
    fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
    motivo_consulta TEXT NOT NULL,
    diagnostico_principal VARCHAR(300) NOT NULL,
    diagnostico_cie10 VARCHAR(10),                        -- código CIE-10
    zona_lesion     VARCHAR(100),                          -- región anatómica
    lado_lesion     lesion_lado DEFAULT 'n/a',
    tipo_lesion     VARCHAR(100),                          -- muscular, ligamentaria, etc.
    origen          VARCHAR(100),                          -- deportivo, laboral, accidente, etc.
    cronificacion   BOOLEAN DEFAULT FALSE,                 -- lesión crónica?
    objetivos_tratamiento TEXT,
    plan_tratamiento TEXT,
    numero_sesiones_estimadas INT,
    observaciones   TEXT,
    activo          BOOLEAN DEFAULT TRUE,                  -- diagnóstico activo/cerrado
    fecha_cierre    DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diagnosticos_paciente ON diagnosticos(paciente_id);
CREATE INDEX idx_diagnosticos_fisio ON diagnosticos(fisioterapeuta_id);

-- Body map: zonas marcadas en el cuerpo del paciente
CREATE TABLE body_map_marcas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagnostico_id  UUID NOT NULL REFERENCES diagnosticos(id) ON DELETE CASCADE,
    vista           VARCHAR(20) NOT NULL CHECK (vista IN ('anterior','posterior','lateral_der','lateral_izq','superior','inferior')),
    coord_x         DECIMAL(5,2) NOT NULL,                -- % relativo al ancho del SVG
    coord_y         DECIMAL(5,2) NOT NULL,                -- % relativo al alto del SVG
    tipo            VARCHAR(30) DEFAULT 'dolor',          -- dolor, inflamacion, contractura, etc.
    intensidad      dolor_escala DEFAULT '5',
    color           VARCHAR(7) DEFAULT '#EF4444',         -- hex
    descripcion     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Adjuntos del expediente (RX, MRI, etc.)
CREATE TABLE expediente_adjuntos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id     UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    diagnostico_id  UUID REFERENCES diagnosticos(id) ON DELETE SET NULL,
    nombre          VARCHAR(200) NOT NULL,
    tipo            VARCHAR(50),                           -- imagen, pdf, video
    url             TEXT NOT NULL,
    size_bytes      BIGINT,
    descripcion     TEXT,
    uploaded_by     UUID REFERENCES usuarios(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MÓDULO 6: PAQUETES DE SESIONES
-- ============================================================

CREATE TABLE paquetes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nombre          VARCHAR(150) NOT NULL,
    descripcion     TEXT,
    num_sesiones    INT NOT NULL,
    precio          DECIMAL(10,2) NOT NULL,
    duracion_dias   INT,                                   -- vigencia en días (NULL = sin caducidad)
    activo          BOOLEAN DEFAULT TRUE,
    color           VARCHAR(7) DEFAULT '#2563EB',
    notas_internas  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_paquetes_tenant ON paquetes(tenant_id);

-- ============================================================
-- MÓDULO 7: MEMBRESÍAS (instancias de paquetes por paciente)
-- ============================================================

CREATE TABLE membresias (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    paciente_id     UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    paquete_id      UUID NOT NULL REFERENCES paquetes(id),
    fisioterapeuta_id UUID REFERENCES usuarios(id),
    diagnostico_id  UUID REFERENCES diagnosticos(id),
    
    estado          membresía_estado DEFAULT 'pendiente_activacion',
    sesiones_total  INT NOT NULL,
    sesiones_usadas INT DEFAULT 0,
    sesiones_restantes INT GENERATED ALWAYS AS (sesiones_total - sesiones_usadas) STORED,
    
    precio_pagado   DECIMAL(10,2) NOT NULL,
    fecha_compra    DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_activacion DATE,
    fecha_vencimiento DATE,
    
    activada_manualmente BOOLEAN DEFAULT FALSE,           -- pago previo (efectivo)
    notas_activacion TEXT,
    
    -- Wallet integration
    wallet_pass_id  VARCHAR(100),
    wallet_serial   VARCHAR(100),
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_membresias_paciente ON membresias(paciente_id);
CREATE INDEX idx_membresias_tenant ON membresias(tenant_id);
CREATE INDEX idx_membresias_estado ON membresias(estado);

-- ============================================================
-- MÓDULO 8: AGENDA Y CITAS
-- ============================================================

CREATE TABLE citas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    fisioterapeuta_id UUID NOT NULL REFERENCES usuarios(id),
    paciente_id     UUID NOT NULL REFERENCES pacientes(id),
    membresía_id    UUID REFERENCES membresias(id) ON DELETE SET NULL,
    diagnostico_id  UUID REFERENCES diagnosticos(id) ON DELETE SET NULL,
    
    fecha_hora_inicio TIMESTAMPTZ NOT NULL,
    fecha_hora_fin    TIMESTAMPTZ NOT NULL,
    duracion_minutos  INT GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (fecha_hora_fin - fecha_hora_inicio)) / 60
    ) STORED,
    
    estado          sesion_estado DEFAULT 'agendada',
    tipo_sesion     VARCHAR(100) DEFAULT 'rehabilitación',
    numero_sesion   INT,                                   -- sesión #N del tratamiento
    sala            VARCHAR(60),                           -- cubículo / sala
    
    -- Recordatorios
    recordatorio_enviado BOOLEAN DEFAULT FALSE,
    recordatorio_at  TIMESTAMPTZ,
    confirmada_paciente BOOLEAN DEFAULT FALSE,
    
    notas_previas   TEXT,
    created_by      UUID REFERENCES usuarios(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_citas_fisio ON citas(fisioterapeuta_id);
CREATE INDEX idx_citas_paciente ON citas(paciente_id);
CREATE INDEX idx_citas_fecha ON citas(fecha_hora_inicio);
CREATE INDEX idx_citas_tenant ON citas(tenant_id);
CREATE INDEX idx_citas_estado ON citas(estado);

-- ============================================================
-- MÓDULO 9: NOTAS SOAP DE SESIÓN
-- ============================================================

CREATE TABLE notas_sesion (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cita_id         UUID NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
    fisioterapeuta_id UUID NOT NULL REFERENCES usuarios(id),
    paciente_id     UUID NOT NULL REFERENCES pacientes(id),
    fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- SOAP
    subjetivo       TEXT,                                  -- S: lo que reporta el paciente
    objetivo        TEXT,                                  -- O: hallazgos clínicos observados
    analisis        TEXT,                                  -- A: interpretación/evaluación
    plan            TEXT,                                  -- P: plan de tratamiento
    
    -- Evaluación de la sesión
    dolor_inicio    dolor_escala,
    dolor_fin       dolor_escala,
    
    -- Técnicas utilizadas
    tecnicas_utilizadas TEXT[],                           -- ej: ['ultrasonido','masaje','electroterapia']
    duracion_tecnicas JSONB,                              -- {tecnica: minutos}
    
    -- Evolución
    evolucion       VARCHAR(30) DEFAULT 'sin_cambios',    -- mejoría, sin_cambios, deterioro
    porcentaje_objetivo INT,                              -- % cumplimiento del objetivo
    
    notas_adicionales TEXT,
    proxima_sesion_recomendacion TEXT,
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notas_cita ON notas_sesion(cita_id);
CREATE INDEX idx_notas_paciente ON notas_sesion(paciente_id);

-- Fotos de sesión (postura, comparativas)
CREATE TABLE sesion_fotos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nota_sesion_id  UUID REFERENCES notas_sesion(id) ON DELETE CASCADE,
    paciente_id     UUID NOT NULL REFERENCES pacientes(id),
    url             TEXT NOT NULL,
    thumbnail_url   TEXT,
    tipo            VARCHAR(50) DEFAULT 'postura',        -- postura, zona, comparativa
    descripcion     TEXT,
    fecha           TIMESTAMPTZ DEFAULT NOW(),
    orden           INT DEFAULT 0
);

-- ============================================================
-- MÓDULO 10: PAGOS
-- ============================================================

CREATE TABLE pagos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    paciente_id     UUID NOT NULL REFERENCES pacientes(id),
    membresía_id    UUID REFERENCES membresias(id) ON DELETE SET NULL,
    cita_id         UUID REFERENCES citas(id) ON DELETE SET NULL,
    
    monto           DECIMAL(10,2) NOT NULL,
    metodo          pago_metodo NOT NULL,
    estado          pago_estado DEFAULT 'pagado',
    
    referencia_externa VARCHAR(200),                      -- no. transferencia, ref. stripe, etc.
    concepto        TEXT NOT NULL,
    notas           TEXT,
    
    registrado_por  UUID REFERENCES usuarios(id),
    fecha_pago      TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pagos_tenant ON pagos(tenant_id);
CREATE INDEX idx_pagos_paciente ON pagos(paciente_id);
CREATE INDEX idx_pagos_membresía ON pagos(membresía_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha_pago);

-- ============================================================
-- MÓDULO 11: BIBLIOTECA DE EJERCICIOS
-- ============================================================

CREATE TABLE ejercicios (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,  -- NULL = global/sistema
    nombre          VARCHAR(200) NOT NULL,
    descripcion     TEXT,
    tipo            ejercicio_tipo NOT NULL,
    zona_corporal   TEXT[],                               -- ['cuádriceps','rodilla']
    nivel_dificultad VARCHAR(20) DEFAULT 'medio',        -- facil, medio, avanzado
    
    instrucciones   TEXT,
    consejos        TEXT,
    precauciones    TEXT,
    
    video_url       TEXT,
    imagen_url      TEXT,
    gif_url         TEXT,
    
    duracion_segundos INT,
    series          INT,
    repeticiones    INT,
    
    es_global       BOOLEAN DEFAULT FALSE,                -- disponible para todos los tenants
    created_by      UUID REFERENCES usuarios(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ejercicios_tenant ON ejercicios(tenant_id);
CREATE INDEX idx_ejercicios_tipo ON ejercicios(tipo);
CREATE INDEX idx_ejercicios_nombre_trgm ON ejercicios USING GIN (nombre gin_trgm_ops);

-- Asignación de ejercicios a paciente
CREATE TABLE ejercicios_asignados (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id     UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    ejercicio_id    UUID NOT NULL REFERENCES ejercicios(id),
    cita_id         UUID REFERENCES citas(id) ON DELETE SET NULL,
    fisioterapeuta_id UUID REFERENCES usuarios(id),
    
    series          INT,
    repeticiones    INT,
    duracion_segundos INT,
    frecuencia_dias INT DEFAULT 1,                        -- cada cuántos días
    
    instrucciones_personalizadas TEXT,
    fecha_inicio    DATE DEFAULT CURRENT_DATE,
    fecha_fin       DATE,
    activo          BOOLEAN DEFAULT TRUE,
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Registro de cumplimiento de ejercicios
CREATE TABLE ejercicios_registro (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ejercicio_asignado_id UUID NOT NULL REFERENCES ejercicios_asignados(id) ON DELETE CASCADE,
    paciente_id     UUID NOT NULL REFERENCES pacientes(id),
    fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
    completado      BOOLEAN DEFAULT TRUE,
    series_hechas   INT,
    rep_hechas      INT,
    dolor_durante   dolor_escala,
    notas_paciente  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MÓDULO 12: ENCUESTAS POST-SESIÓN
-- ============================================================

CREATE TABLE encuestas_sesion (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cita_id         UUID NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
    paciente_id     UUID NOT NULL REFERENCES pacientes(id),
    
    nps_score       INT CHECK (nps_score BETWEEN 0 AND 10),
    dolor_post      dolor_escala,
    satisfaccion    INT CHECK (satisfaccion BETWEEN 1 AND 5),
    mejoria_percibida VARCHAR(30),                        -- mucho, algo, igual, peor
    comentarios     TEXT,
    
    enviada_at      TIMESTAMPTZ DEFAULT NOW(),
    respondida_at   TIMESTAMPTZ,
    respondida      BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_encuestas_paciente ON encuestas_sesion(paciente_id);

-- ============================================================
-- MÓDULO 13: NOTIFICACIONES
-- ============================================================

CREATE TABLE notificaciones (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    paciente_id     UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    usuario_id      UUID REFERENCES usuarios(id) ON DELETE CASCADE,  -- notif interna al fisio
    tipo            notificacion_tipo NOT NULL,
    titulo          VARCHAR(200) NOT NULL,
    cuerpo          TEXT NOT NULL,
    canal           VARCHAR(30) DEFAULT 'whatsapp',       -- whatsapp, email, push, sms
    
    enviada         BOOLEAN DEFAULT FALSE,
    enviada_at      TIMESTAMPTZ,
    leida           BOOLEAN DEFAULT FALSE,
    leida_at        TIMESTAMPTZ,
    error           TEXT,
    
    referencia_id   UUID,                                  -- id de cita/membresía relacionada
    referencia_tipo VARCHAR(50),
    
    programada_at   TIMESTAMPTZ,                          -- cuándo enviar
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notificaciones_tenant ON notificaciones(tenant_id);
CREATE INDEX idx_notificaciones_paciente ON notificaciones(paciente_id);
CREATE INDEX idx_notificaciones_programada ON notificaciones(programada_at) WHERE enviada = FALSE;

-- ============================================================
-- MÓDULO 14: PLANTILLAS DE MENSAJES
-- ============================================================

CREATE TABLE plantillas_mensaje (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,  -- NULL = global
    nombre          VARCHAR(100) NOT NULL,
    tipo            notificacion_tipo NOT NULL,
    canal           VARCHAR(30) DEFAULT 'whatsapp',
    asunto          VARCHAR(200),
    cuerpo          TEXT NOT NULL,                        -- con variables {{nombre}}, {{fecha}}, etc.
    activa          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MÓDULO 15: REPORTES Y ANALYTICS (tablas de apoyo)
-- ============================================================

-- Vista materializada: progreso de dolor por paciente
CREATE TABLE progreso_dolor (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id     UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    diagnostico_id  UUID REFERENCES diagnosticos(id),
    cita_id         UUID REFERENCES citas(id),
    fecha           DATE NOT NULL,
    dolor_inicio    INT,
    dolor_fin       INT,
    evolucion       VARCHAR(30),
    numero_sesion   INT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_progreso_paciente ON progreso_dolor(paciente_id);
CREATE INDEX idx_progreso_fecha ON progreso_dolor(fecha);

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- Auto-updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER trg_%s_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        ', t, t);
    END LOOP;
END;
$$;

-- Trigger: decrementar sesiones al completar cita
CREATE OR REPLACE FUNCTION actualizar_sesiones_membresía()
RETURNS TRIGGER AS $$
BEGIN
    -- Cuando una cita cambia a 'completada'
    IF NEW.estado = 'completada' AND OLD.estado != 'completada' THEN
        IF NEW.membresía_id IS NOT NULL THEN
            UPDATE membresias
            SET sesiones_usadas = sesiones_usadas + 1
            WHERE id = NEW.membresía_id;
        END IF;
        -- Incrementar total del paciente
        UPDATE pacientes
        SET total_sesiones = total_sesiones + 1
        WHERE id = NEW.paciente_id;
    END IF;
    -- Revertir si se cancela después de completar
    IF OLD.estado = 'completada' AND NEW.estado = 'cancelada' THEN
        IF NEW.membresía_id IS NOT NULL THEN
            UPDATE membresias
            SET sesiones_usadas = GREATEST(sesiones_usadas - 1, 0)
            WHERE id = NEW.membresía_id;
        END IF;
        UPDATE pacientes
        SET total_sesiones = GREATEST(total_sesiones - 1, 0)
        WHERE id = NEW.paciente_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cita_sesiones
AFTER UPDATE ON citas
FOR EACH ROW EXECUTE FUNCTION actualizar_sesiones_membresía();

-- Trigger: registrar progreso de dolor automáticamente al guardar nota
CREATE OR REPLACE FUNCTION registrar_progreso_dolor()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.dolor_inicio IS NOT NULL OR NEW.dolor_fin IS NOT NULL THEN
        INSERT INTO progreso_dolor (paciente_id, cita_id, fecha, dolor_inicio, dolor_fin, evolucion, numero_sesion)
        SELECT
            NEW.paciente_id,
            NEW.cita_id,
            NOW()::DATE,
            NEW.dolor_inicio::INT,
            NEW.dolor_fin::INT,
            NEW.evolucion,
            c.numero_sesion
        FROM citas c WHERE c.id = NEW.cita_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_nota_progreso_dolor
AFTER INSERT ON notas_sesion
FOR EACH ROW EXECUTE FUNCTION registrar_progreso_dolor();

-- Función: verificar disponibilidad de fisioterapeuta
CREATE OR REPLACE FUNCTION verificar_disponibilidad(
    p_fisioterapeuta_id UUID,
    p_inicio TIMESTAMPTZ,
    p_fin TIMESTAMPTZ,
    p_cita_excluir UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflicto INT;
BEGIN
    SELECT COUNT(*)
    INTO conflicto
    FROM citas
    WHERE fisioterapeuta_id = p_fisioterapeuta_id
    AND estado NOT IN ('cancelada', 'no_show')
    AND id != COALESCE(p_cita_excluir, '00000000-0000-0000-0000-000000000000')
    AND tstzrange(fecha_hora_inicio, fecha_hora_fin) && tstzrange(p_inicio, p_fin);
    
    RETURN conflicto = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Vista: próximas citas del día con info completa
CREATE VIEW v_citas_hoy AS
SELECT
    c.id,
    c.fecha_hora_inicio,
    c.fecha_hora_fin,
    c.estado,
    c.tipo_sesion,
    c.sala,
    p.nombre || ' ' || p.apellido AS paciente_nombre,
    p.telefono AS paciente_tel,
    u.nombre || ' ' || u.apellido AS fisio_nombre,
    m.sesiones_restantes,
    c.tenant_id
FROM citas c
JOIN pacientes p ON c.paciente_id = p.id
JOIN usuarios u ON c.fisioterapeuta_id = u.id
LEFT JOIN membresias m ON c.membresía_id = m.id
WHERE c.fecha_hora_inicio::DATE = CURRENT_DATE
ORDER BY c.fecha_hora_inicio;

-- Vista: resumen de membresías activas
CREATE VIEW v_membresias_activas AS
SELECT
    m.id,
    m.paciente_id,
    p.nombre || ' ' || p.apellido AS paciente_nombre,
    p.telefono,
    pk.nombre AS paquete_nombre,
    m.sesiones_total,
    m.sesiones_usadas,
    m.sesiones_restantes,
    m.fecha_vencimiento,
    m.estado,
    m.tenant_id,
    CASE
        WHEN m.sesiones_restantes <= 2 THEN 'critico'
        WHEN m.sesiones_restantes <= 5 THEN 'advertencia'
        ELSE 'normal'
    END AS alerta_nivel
FROM membresias m
JOIN pacientes p ON m.paciente_id = p.id
JOIN paquetes pk ON m.paquete_id = pk.id
WHERE m.estado = 'activa';

-- Vista: dashboard financiero mensual por tenant
CREATE VIEW v_ingresos_mensuales AS
SELECT
    tenant_id,
    DATE_TRUNC('month', fecha_pago) AS mes,
    metodo,
    COUNT(*) AS num_transacciones,
    SUM(monto) AS total
FROM pagos
WHERE estado = 'pagado'
GROUP BY tenant_id, DATE_TRUNC('month', fecha_pago), metodo;

-- Vista: progreso del paciente (promedio de dolor por sesión)
CREATE VIEW v_progreso_paciente AS
SELECT
    pd.paciente_id,
    p.nombre || ' ' || p.apellido AS paciente_nombre,
    pd.diagnostico_id,
    pd.numero_sesion,
    pd.fecha,
    pd.dolor_inicio,
    pd.dolor_fin,
    pd.evolucion,
    AVG(pd.dolor_fin) OVER (
        PARTITION BY pd.paciente_id
        ORDER BY pd.fecha
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS promedio_movil_dolor
FROM progreso_dolor pd
JOIN pacientes p ON pd.paciente_id = p.id
ORDER BY pd.paciente_id, pd.fecha;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Multi-tenant
-- ============================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_sesion ENABLE ROW LEVEL SECURITY;
ALTER TABLE membresias ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Política base: cada tenant solo ve sus datos
-- (Se activa con SET app.current_tenant_id = 'UUID' en la sesión)

CREATE POLICY tenant_isolation ON pacientes
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation ON citas
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation ON membresias
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation ON pagos
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ============================================================
-- DATOS SEMILLA (SEED)
-- ============================================================

-- Paquetes globales de ejemplo
INSERT INTO paquetes (id, tenant_id, nombre, descripcion, num_sesiones, precio, duracion_dias, activo)
VALUES
    (uuid_generate_v4(), NULL, 'Paquete Básico', '5 sesiones de rehabilitación', 5, 1200.00, 60, FALSE),
    (uuid_generate_v4(), NULL, 'Paquete Estándar', '10 sesiones de rehabilitación', 10, 2200.00, 90, FALSE),
    (uuid_generate_v4(), NULL, 'Paquete Intensivo', '20 sesiones de rehabilitación', 20, 3800.00, 120, FALSE);

-- ============================================================
-- ÍNDICES ADICIONALES DE PERFORMANCE
-- ============================================================

CREATE INDEX idx_citas_rango ON citas USING GIST (tstzrange(fecha_hora_inicio, fecha_hora_fin));
CREATE INDEX idx_membresias_vencimiento ON membresias(fecha_vencimiento) WHERE estado = 'activa';
CREATE INDEX idx_ejercicios_asignados_activos ON ejercicios_asignados(paciente_id) WHERE activo = TRUE;
CREATE INDEX idx_notificaciones_pendientes ON notificaciones(programada_at) WHERE enviada = FALSE AND programada_at IS NOT NULL;

-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================
