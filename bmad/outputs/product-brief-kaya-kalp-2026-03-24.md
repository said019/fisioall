# Product Brief: Kaya Kalp — Plataforma Digital de Gestión y Agendamiento

**Date:** 2026-03-24
**Author:** Business Analyst (BMAD Framework)
**Status:** Draft — Pendiente validación con stakeholder (L.F.T. Paola Ríos Aguilar)
**Version:** 1.0

---

## 1. Executive Summary

Kaya Kalp es un centro de fisioterapia, masajes y tratamientos faciales ubicado en San Juan del Río, Querétaro, operado por la L.F.T. Paola Ríos Aguilar (CEO, especialista en suelo pélvico) y la L.F.T. Jenni Álvarez Álvarez (ejercicio terapéutico y rehabilitación). Actualmente gestionan citas, expedientes clínicos, fichas de evolución y tarjetas de lealtad de forma **manual** (WhatsApp, formatos físicos en papel, hojas de cálculo).

Se propone construir una **plataforma web** (landing page pública + portal privado para pacientes + panel administrativo) que digitalice todo el flujo operativo: desde que un nuevo usuario descubre Kaya Kalp hasta que completa su tratamiento y acumula beneficios en su tarjeta de lealtad.

**Key Points:**
- **Problema:** Gestión 100% manual genera citas perdidas, anticipos no cobrados, expedientes en papel difíciles de consultar, y tarjetas de lealtad sin seguimiento confiable
- **Solución:** Plataforma web con landing page, sistema de agendamiento, portal de pacientes (citas, ficha clínica, tarjeta de lealtad), y panel admin
- **Target Users:** Pacientes actuales y potenciales de Kaya Kalp + equipo terapéutico (Paola, Jenni, Gaby Aguilar cosmiatra)
- **Timeline:** MVP estimado en 3 fases (landing → agendamiento → portal completo)

---

## 2. Problem Statement

### The Problem

Kaya Kalp opera con procesos manuales que crean fricción en cada punto de contacto:

1. **Agendamiento por WhatsApp:** La coordinación de citas requiere múltiples mensajes de ida y vuelta, verificación manual de disponibilidad, solicitud manual del anticipo de $100 MXN, y confirmación manual 24h antes.
2. **Expedientes clínicos en papel:** Cada paciente nuevo requiere llenar a mano un expediente físico completo (datos personales, antecedentes patológicos, exploración física, escala de dolor, diagnóstico). Consultarlo para sesiones futuras implica buscar entre carpetas físicas.
3. **Fichas de evolución en papel:** El seguimiento sesión a sesión (objetivos a corto/mediano/largo plazo, evolución del dolor, tratamientos aplicados) se pierde o es difícil de consultar históricamente.
4. **Tarjetas de lealtad físicas:** Se marcan manualmente, se pierden, no hay visibilidad para el paciente de cuántos sellos lleva.
5. **Información para nuevos pacientes:** El protocolo de seguridad (nombre, edad, ocupación, cómo se enteró, red social, servicio de interés) se recopila por WhatsApp o en papel, fragmentando la información.

### Who Experiences This Problem

**Primary Users:**
- **Pacientes actuales** (~127 pacientes activos) — No pueden ver sus citas, historial, ni progreso de lealtad de forma autónoma
- **Pacientes potenciales** — No tienen forma de explorar servicios/precios y agendar online; dependen de WhatsApp
- **L.F.T. Paola Ríos Aguilar** (CEO) — Gestiona manualmente agenda, anticipos, expedientes, fichas, tarjetas de lealtad

**Secondary Users:**
- **L.F.T. Jenni Álvarez Álvarez** — Necesita acceso rápido a fichas de evolución y agenda de ejercicio terapéutico
- **Gaby Aguilar** (Cosmiatra) — Necesita agenda y expedientes de tratamientos faciales

### Current Situation

**How Users Currently Handle This:**
- Citas se agendan vía WhatsApp (427 165 92 04) con intercambio de ~5-10 mensajes
- Anticipo de $100 se solicita manualmente con datos de transferencia BBVA
- Expedientes clínicos se llenan en formatos físicos impresos
- Tarjetas de lealtad son tarjetas físicas con sellos
- Información de servicios se comparte vía PDFs por WhatsApp o redes sociales

**Pain Points:**
- Citas no confirmadas (sin anticipo) generan huecos en la agenda y pérdida de ingreso
- Expedientes en papel son vulnerables a pérdida, difíciles de consultar y no permiten análisis de datos
- Pacientes no saben cuántas sesiones llevan de su paquete ni cuántos sellos tienen en su tarjeta
- El equipo invierte tiempo significativo en tareas administrativas en lugar de atención clínica
- No hay forma de medir NPS, retención, ni métricas de negocio

### Impact & Urgency

**Impact if Unsolved:**
- Ingresos perdidos por citas no confirmadas y anticipos no cobrados
- Pacientes abandonan tratamiento por falta de seguimiento visible de su progreso
- Información clínica crítica puede perderse (riesgo regulatorio bajo Ley Federal de Protección de Datos)
- El negocio no puede escalar más allá de la capacidad administrativa manual de Paola

**Why Now:**
- El negocio ya tiene ~127 pacientes activos y 3 terapeutas — el volumen justifica la inversión
- Ya existe un proyecto Next.js (FisioAll) con infraestructura base en desarrollo
- La competencia en la zona (San Juan del Río) comienza a digitalizarse

**Frequency:**
- ~9 citas diarias promedio (dato del mock)
- Coordinación de anticipos y confirmaciones ocurre diariamente
- Expedientes se crean con cada paciente nuevo y se consultan en cada sesión

---

## 3. Target Users

### User Personas

#### Persona 1: María (Paciente Recurrente)
- **Role:** Paciente activa con paquete de 10 sesiones de fisioterapia
- **Goals:** Ver sus próximas citas, consultar cuántas sesiones le quedan del paquete, ver su tarjeta de lealtad, reagendar si es necesario
- **Pain Points:** No recuerda cuántas sesiones lleva, pierde su tarjeta de lealtad física, tiene que mandar WhatsApp para cualquier consulta
- **Technical Proficiency:** Media — usa WhatsApp y redes sociales diariamente, navega web en celular
- **Usage Pattern:** Accede 2-3 veces por semana antes de sus citas

#### Persona 2: Laura (Paciente Nueva)
- **Role:** Persona interesada en tratamientos faciales que encontró Kaya Kalp en Instagram (@kaya_kalp21)
- **Goals:** Explorar servicios disponibles y precios, agendar su primera cita de forma fácil, completar el protocolo de seguridad
- **Pain Points:** No encuentra precios claros online, tiene que mandar mensaje y esperar respuesta para agendar, no sabe qué esperar en su primera visita
- **Technical Proficiency:** Alta — busca y compara servicios online antes de decidir
- **Usage Pattern:** Una sola visita de exploración → conversión → se convierte en Persona 1

#### Persona 3: Paola (Administradora/Terapeuta)
- **Role:** CEO y terapeuta principal — gestiona todo el negocio
- **Goals:** Ver agenda del día completa, gestionar anticipos, acceder a expedientes y fichas rápidamente, ver métricas del negocio
- **Pain Points:** Pierde tiempo en WhatsApp coordinando citas, no tiene visibilidad de métricas, expedientes en papel son lentos de consultar
- **Technical Proficiency:** Media-Alta — usa herramientas digitales pero no técnica
- **Usage Pattern:** Uso continuo durante horario laboral L-V 9am-8pm

### User Needs

**Must Have (MVP):**
- Landing page con catálogo completo de servicios y precios
- Sistema de agendamiento de citas con selección de servicio, terapeuta, fecha y hora
- Registro de pacientes con protocolo de seguridad digital
- Login de pacientes por número de teléfono (WhatsApp)
- Vista de "Mis Citas" para el paciente

**Should Have (Fase 2):**
- Ficha clínica digital (expediente clínico completo)
- Ficha de evolución digital
- Tarjeta de lealtad digital visible para el paciente
- Recordatorios automáticos 24h antes (integración WhatsApp)
- Solicitud automática de anticipo con datos BBVA

**Nice to Have (Fase 3):**
- Panel administrativo con métricas (ingresos, pacientes, retención)
- Encuestas NPS post-sesión
- Body map interactivo digital para marcación de dolor
- Escala EVA digital con histórico
- Facturación integrada
- Pagos en línea (Stripe/Conekta)

---

## 4. Proposed Solution

### Solution Overview

Plataforma web construida sobre el proyecto Next.js existente (FisioAll) con tres capas:

1. **Landing Page Pública** — Escaparate digital de Kaya Kalp con catálogo de servicios, precios, equipo, ubicación, y CTA de agendamiento
2. **Portal del Paciente** — Área autenticada donde el paciente ve sus citas, ficha clínica, ficha de evolución, y tarjeta de lealtad
3. **Panel Administrativo** — Dashboard para Paola y equipo con gestión de agenda, pacientes, expedientes, anticipos y métricas

### Key Capabilities

1. **Catálogo Digital de Servicios**
   - Description: Presentación visual de todos los servicios con categorización (Fisioterapia/Masajes, Faciales, Corporales, Epilación), precios, duración, beneficios, y qué incluye cada uno
   - User Value: Los pacientes potenciales pueden explorar y decidir sin necesidad de preguntar por WhatsApp

2. **Sistema de Agendamiento Online**
   - Description: Flujo de reserva con selección de categoría → servicio → terapeuta → fecha/hora disponible → datos del paciente → solicitud de anticipo $100 → confirmación
   - User Value: Reduce el flujo de WhatsApp de ~10 mensajes a un proceso autoservicio de 2 minutos

3. **Portal del Paciente (con login por teléfono)**
   - Description: Área privada donde el paciente ve: próximas citas, historial de citas, progreso de paquete (ej. 6/10 sesiones), tarjeta de lealtad con sellos visuales, y su ficha clínica en modo lectura
   - User Value: Autonomía total — el paciente nunca necesita preguntar "¿cuántas sesiones me quedan?"

4. **Expediente Clínico Digital**
   - Description: Digitalización fiel del formato físico: datos personales, antecedentes patológicos hereditofamiliares (diabetes, HTA, alergia, cáncer, fracturas, cirugías), hábitos de salud, traslado, exploración física, escala de dolor EVA 0-10, diagnóstico en rehabilitación
   - User Value: Acceso instantáneo para la terapeuta, eliminación de riesgo de pérdida, cumplimiento normativo

5. **Tarjeta de Lealtad Digital**
   - Description: Tarjeta visual estilo wallet con nombre del paciente, tipo de servicio, 10 sellos con progreso visual, y beneficio al completar. El paciente la ve en su portal; la admin marca los sellos
   - User Value: Nunca se pierde, siempre visible, genera engagement y retención

### What Makes This Different

A diferencia de plataformas genéricas de agendamiento (Calendly, HotDoc), esta solución está diseñada específicamente para el flujo operativo de Kaya Kalp:
- Integra el **protocolo de seguridad** obligatorio para pacientes nuevos
- Incluye **expediente clínico fisioterapéutico** con body map y escala EVA
- Maneja **paquetes de sesiones** (10/20) con seguimiento de progreso
- Implementa **anticipo de $100** como parte del flujo de reserva
- Soporta **tarjetas de lealtad** por tipo de servicio

**Unique Value Proposition:**
"Una plataforma integral que conecta la experiencia del paciente desde el descubrimiento hasta la fidelización, eliminando la gestión manual y dando visibilidad total tanto al paciente como al equipo terapéutico."

### Minimum Viable Solution (MVP)

**Core Features for MVP:**
- Landing page con catálogo de servicios (Fisioterapia, Faciales, Corporales, Epilación) con precios
- Formulario de agendamiento (selección de servicio, terapeuta, fecha, hora, datos del paciente)
- Registro de pacientes con protocolo de seguridad (nombre, edad, ocupación, cómo se enteró, red social, servicio de interés)
- Login de pacientes por número de teléfono + código OTP por WhatsApp
- Vista "Mis Citas" con estado (pendiente, confirmada, completada)

**Deferred to Later:**
- Expediente clínico digital completo (Fase 2)
- Tarjeta de lealtad digital (Fase 2)
- Panel admin con métricas avanzadas (Fase 3)
- Pagos en línea (Fase 3)
- Recordatorios automáticos por WhatsApp (Fase 2)

---

## 5. Success Metrics

### Primary Metrics

**Tasa de Agendamiento Online**
- Baseline: 0% (todo es vía WhatsApp)
- Target: 60% de citas nuevas agendadas vía plataforma
- Timeline: 3 meses post-lanzamiento
- Measurement: Citas creadas en plataforma / Total de citas

**Tasa de Confirmación de Anticipos**
- Baseline: Desconocida (muchas citas sin anticipo según mock)
- Target: 85% de citas con anticipo confirmado antes de la sesión
- Timeline: 3 meses post-lanzamiento
- Measurement: Citas con anticipo pagado / Total citas agendadas

**Retención de Pacientes**
- Baseline: Sin medición actual
- Target: 70% de pacientes con paquete completan todas sus sesiones
- Timeline: 6 meses post-lanzamiento
- Measurement: Pacientes que completaron paquete / Pacientes que iniciaron paquete

### Secondary Metrics

- Tiempo promedio de agendamiento (objetivo: <3 minutos vs ~15 minutos actuales por WhatsApp)
- Número de pacientes nuevos por mes que llegan vía landing page
- NPS (Net Promoter Score) post-tratamiento
- Tasa de uso de tarjeta de lealtad (pacientes que llegan a 10/10 sellos)
- Ingresos semanales vs objetivo ($25,000/semana referencia del mock)

### Success Criteria

**Must Achieve:**
- 100% de servicios y precios publicados en la landing page y actualizados
- Pacientes pueden agendar cita sin necesidad de contacto por WhatsApp

**Should Achieve:**
- Reducción del 50% en tiempo administrativo de Paola dedicado a coordinación de citas
- 80% de pacientes activos con cuenta creada en la plataforma

---

## 6. Market & Competition

### Market Context

**Market Size:** San Juan del Río, Querétaro — ciudad de ~300,000 habitantes. Sector de fisioterapia y bienestar en crecimiento en México.

**Market Trends:**
- Digitalización acelerada post-pandemia en servicios de salud
- Pacientes esperan poder agendar online (estándar en ciudades medianas de México)
- Creciente demanda de tratamientos de bienestar y estética facial en mujeres 25-55 años

**Target Market Segment:** Mujeres y hombres 25-60 años en San Juan del Río que buscan fisioterapia, masajes terapéuticos, y/o tratamientos faciales, con capacidad de pago de $350-$800 MXN por sesión.

### Competitive Landscape

#### Competidor 1: Clínicas de fisioterapia locales tradicionales
- **Strengths:** Presencia física establecida, recomendaciones boca a boca
- **Weaknesses:** Sin presencia digital, sin agendamiento online, sin seguimiento digital de tratamientos
- **Pricing:** Similar ($350-$500 por sesión)
- **Market Position:** Tradicional, dependiente de referidos

#### Competidor 2: Plataformas genéricas (Doctoralia, TopDoctors)
- **Strengths:** Brand recognition, base de usuarios existente, SEO fuerte
- **Weaknesses:** No tienen expediente clínico fisioterapéutico, no manejan paquetes de sesiones, no tienen tarjeta de lealtad, comisión por cita
- **Pricing:** Cobran suscripción mensual + comisión por cita agendada
- **Market Position:** Generalistas — no especializados en fisioterapia/bienestar

#### Competidor 3: Spas y centros de estética de cadena
- **Strengths:** Marketing fuerte, múltiples sucursales, apps propias
- **Weaknesses:** Impersonal, no ofrecen fisioterapia clínica real, no tienen certificación CONOCER
- **Pricing:** Similar-superior en faciales, no ofrecen fisioterapia
- **Market Position:** Bienestar/lujo — no clínico

### Competitive Advantages

**Our Advantages:**
- **Certificación ante la SEP (CONOCER)** — diferenciador clave vs spas
- **Especialización en suelo pélvico** — nicho poco atendido en la zona
- **Equipo certificado** (L.F.T.) — credibilidad clínica que spas no tienen
- **Plataforma custom** con expediente clínico, ficha de evolución, y tarjeta de lealtad integrada

**Gaps We Need to Close:**
- Presencia digital (landing page profesional con SEO local)
- Capacidad de agendamiento online (estándar esperado por pacientes)

---

## 7. Business Model & Pricing

### Revenue Model

Modelo de ingreso directo por servicio prestado. No es SaaS ni marketplace — la plataforma es herramienta interna de Kaya Kalp.

### Pricing Strategy

Precios establecidos por Kaya Kalp (IVA incluido en fisioterapia):

**Fisioterapia y Masajes:**
| Servicio | Precio Sesión | Paquete 10 | Paquete 20 |
|----------|--------------|------------|------------|
| Normal/Antiestrés | $400 | $3,800 | $7,200 |
| Descarga de esfuerzo | $470 | — | — |
| Drenaje linfático | $520 | — | — |
| Presoterapia | $420 | — | — |
| Ejercicio terapéutico | $350 | — | — |
| Valoración | $450 | — | — |
| Suelo pélvico | $550 | — | — |

**Tratamientos Faciales:**
| Servicio | Precio | Regalo |
|----------|--------|--------|
| Masaje Revitalizante | $450 | — |
| Limpieza Básica | $350 | Exfoliación de manos |
| Limpieza Profunda | $450 | Masaje facial relajante |
| Hidratación Profunda | $500 | Masaje facial + 20% desc próxima sesión |
| Rejuvenecimiento Facial | $550 | Exfoliación de manos |
| Gold Threads (Hilos de colágeno) | $800 / $7,200 (10 sesiones) | Exfoliación de manos |

**Tratamientos Corporales:** $600/sesión

**Epilación Roll-On:** $150 - $400 según zona

### Customer Acquisition

**Acquisition Channels:**
- Instagram (@kaya_kalp21) — canal principal actual
- Facebook (Kaya Kalp) — presencia activa
- Referidos / boca a boca — canal orgánico fuerte
- Landing page con SEO local (nuevo canal con la plataforma)

**Customer Acquisition Cost (CAC):** Actualmente ~$0 (orgánico) — se espera mantener bajo con SEO local

**Lifetime Value (LTV):** Paquete promedio de 10 sesiones × $400 = $3,800 + faciales recurrentes. LTV estimado: $5,000-$10,000 MXN por paciente activo.

---

## 8. Technical Considerations

### Technical Requirements

**Platform:** Next.js (proyecto FisioAll existente) — fullstack con React, desplegado en Railway

**Stack existente (ya configurado):**
- Next.js con App Router
- Prisma (ORM)
- Tailwind CSS + shadcn/ui
- Figtree + Fira Sans (tipografía)
- Railway (hosting)
- Zod (validación)

**Integrations Required:**
- WhatsApp Business API (o Twilio) — para envío de recordatorios 24h antes y OTP de login
- Pasarela de pagos (Conekta o Stripe Mexico) — para anticipo de $100 y pagos en línea (Fase 3)
- Google Calendar API (opcional) — para sync de agenda con calendarios personales de terapeutas

**Technical Constraints:**
- Debe funcionar bien en móvil (>80% de pacientes acceden desde celular)
- Cumplimiento con Ley Federal de Protección de Datos Personales (Art. 15 y 16) — aviso de privacidad obligatorio
- Datos médicos (expediente clínico) requieren almacenamiento seguro y encriptado
- Horario de atención: L-V 9:00am - 8:00pm (la agenda debe respetar estos slots)

### Scale Requirements

**Expected Usage:**
- Users: ~150-300 pacientes activos (año 1), 3-5 terapeutas
- Transactions: ~9-15 citas/día, ~45-75 citas/semana
- Data Volume: Bajo — expedientes de texto + imágenes eventualmente

**Performance Requirements:**
- Tiempo de carga de landing page < 2 segundos (Core Web Vitals)
- Flujo de agendamiento completable en < 3 minutos

### Security & Compliance

**Security Requirements:**
- Autenticación segura (OTP por WhatsApp o SMS)
- Datos médicos encriptados en reposo y tránsito (HTTPS + encriptación de DB)
- Roles de acceso: Paciente (solo su info), Terapeuta (pacientes asignados), Admin (todo)

**Compliance Requirements:**
- Aviso de Privacidad conforme a Art. 15 y 16 de la Ley Federal de Protección de Datos Personales
- Consentimiento informado digital (equivalente a la carta responsiva actual)
- Expediente clínico conforme a NOM-004-SSA3-2012 (Norma del expediente clínico)

---

## 9. Risks & Mitigation

### High Priority Risks

**Risk 1: Baja adopción por pacientes**
- Probability: Media
- Impact: Alto — si los pacientes no usan la plataforma, se mantiene la carga manual
- Mitigation: Onboarding guiado por WhatsApp, incentivo de primera cita con descuento al agendar online, Paola promueve activamente en cada consulta
- Owner: Paola Ríos Aguilar

**Risk 2: Complejidad del expediente clínico digital**
- Probability: Media
- Impact: Medio — si el formato digital no captura todo lo que el formato físico tiene, las terapeutas no lo usarán
- Mitigation: Digitalización fiel del formato físico actual, validación iterativa con Paola antes de lanzar
- Owner: Equipo de desarrollo

**Risk 3: Cumplimiento normativo de datos de salud**
- Probability: Baja
- Impact: Alto — multas por manejo inadecuado de datos personales sensibles
- Mitigation: Implementar aviso de privacidad desde MVP, encriptar datos médicos, consentimiento informado digital
- Owner: Equipo de desarrollo + asesor legal

### Medium Priority Risks

- Integración con WhatsApp Business API puede requerir aprobación de Meta (proceso lento)
- Terapeutas pueden resistirse a cambiar de procesos manuales a digitales
- Costos de infraestructura pueden crecer si se agrega almacenamiento de imágenes médicas

### Assumptions

**Critical Assumptions:**
- Los pacientes de Kaya Kalp tienen acceso a smartphone con navegador web
- Paola y equipo están dispuestas a adoptar la plataforma como herramienta principal (no como canal adicional)
- El volumen de pacientes justifica la inversión de desarrollo (~127 activos actualmente)

**Validation Plan:**
Lanzar MVP (landing + agendamiento) primero y medir adopción durante 4 semanas antes de invertir en Fase 2 (expediente clínico, tarjeta de lealtad).

---

## 10. Resource Estimates

### Team Requirements

**Roles Needed:**
- Fullstack Developer (Next.js/React/Prisma): 1 persona, dedicación completa
- UI/UX Designer: 1 persona, parcial (diseño de landing y flujos)
- Paola Ríos Aguilar: Validación de flujos clínicos y contenido de servicios
- Asesor legal: Puntual — aviso de privacidad y consentimiento informado

### Timeline Estimate

**High-Level Phases:**

| Fase | Alcance | Duración |
|------|---------|----------|
| **Fase 1 — MVP** | Landing page + Catálogo de servicios + Agendamiento + Registro de pacientes | 3-4 semanas |
| **Fase 2 — Portal** | Login paciente + Mis Citas + Expediente clínico digital + Ficha de evolución + Tarjeta de lealtad + Recordatorios WhatsApp | 4-6 semanas |
| **Fase 3 — Admin** | Dashboard admin + Métricas + Encuestas NPS + Pagos en línea + Facturación | 4-6 semanas |

**Total Estimated Duration:** 11-16 semanas (~3-4 meses)

### Budget Estimate

**Development Costs:** Variable según equipo (interno vs freelance)

**Infrastructure Costs:** ~$20-50 USD/mes (Railway starter + DB)

**Other Costs:**
- WhatsApp Business API: ~$0.05 USD por mensaje (Twilio)
- Dominio: ~$15 USD/año
- SSL: Incluido en Railway

**Total Estimated Cost:** Bajo para infraestructura; principal inversión es tiempo de desarrollo.

---

## 11. Dependencies

### Internal Dependencies

- Contenido de servicios validado por Paola (precios, descripciones, duración) — **ya disponible en PDFs**
- Formato exacto del expediente clínico para digitalización — **ya disponible en formato físico**
- Formato de ficha de evolución — **ya disponible en formato físico**
- Fotos profesionales del equipo y consultorio — **parcialmente disponibles en PDFs**

### External Dependencies

- WhatsApp Business API aprobación (para OTP y recordatorios)
- Pasarela de pagos México (Conekta/Stripe) — para Fase 3
- Asesoría legal para aviso de privacidad de datos de salud

### Blockers

**Current Blockers:**
- Ninguno crítico — el proyecto Next.js ya tiene infraestructura base
- Decisión pendiente sobre método de autenticación (teléfono OTP vs email vs social login)

**Resolution Plan:**
Recomendar OTP por teléfono (el canal natural de los pacientes es WhatsApp). Como fallback temporal, email + password simple.

---

## 12. Next Steps

### Immediate Actions

1. **Validar este Product Brief con Paola Ríos Aguilar** — confirmar que los flujos, precios, y prioridades son correctos
2. **Definir la Fase 1 en detalle** — wireframes de landing page y flujo de agendamiento
3. **Revisar el proyecto Next.js existente** — evaluar qué ya está construido vs qué falta para el MVP

### Recommended Next Phase

Handoff a **Product Manager** para crear el PRD (Product Requirements Document) detallado de Fase 1, con wireframes, data model, y API endpoints.

**Handoff To:** Product Manager → luego Architect → luego Developer

**Required Before Moving Forward:**
- Aprobación de este Product Brief por Paola
- Decisión sobre método de autenticación de pacientes
- Priorización final: ¿landing page primero o portal admin primero?

---

## Appendix

### Catálogo Completo de Servicios (Extraído de PDFs)

#### A. Fisioterapia y Masajes (PDF: KAYA KALP V20 MASAJES 2025)

| # | Servicio | Descripción | Precio | Duración |
|---|----------|-------------|--------|----------|
| 1 | Normal/Antiestrés | Terapia manual tren superior (espalda, hombros, cuello, brazos) + electroterapia, percusión, presoterapia en piernas y zona lumbar | $400 | ~50 min |
| 2 | Descarga de esfuerzo | Enfoque manual cuerpo completo + aparatología. Elimina fatiga y cansancio, previene lesiones | $470 | ~50 min |
| 3 | Drenaje linfático | Manipulaciones suaves para mejorar circulación y sistema linfático. Cuerpo completo | $520 | ~50 min |
| 4 | Presoterapia | Aparato para retorno venoso, drenaje linfático, drenar ácido láctico. Por zonas (extremidades inf/sup, abdomen-lumbar) | $420 | ~50 min |
| 5 | Ejercicio terapéutico | Rehabilitación de lesiones deportivas, laborales, post-quirúrgicas. Rutina personalizada | $350 | ~50 min |
| 6 | Valoración | Evaluación de lesión, diagnóstico, propuesta de tratamiento. Incluye primera terapia | $450 | ~50 min |
| 7 | Suelo pélvico | Disfunciones de suelo pélvico femenino, incontinencia, prolapsos, embarazo, post-parto | $550 | ~50 min |

**Paquetes de tratamiento de lesiones:**
- 10 sesiones (2/semana): $3,800
- 20 sesiones (2/semana): $7,200
- Pago por sesión: $400

#### B. Tratamientos Faciales (PDF: KAYA KALP V2025) — Cosmiatra: Gaby Aguilar

| # | Servicio | Incluye | Precio | Duración | Regalo |
|---|----------|---------|--------|----------|--------|
| 1 | Masaje Revitalizante | Limpieza básica, masaje | $450 | 60 min | — |
| 2 | Limpieza Básica | Limpieza, exfoliación, tonificación, mascarilla, protección | $350 | 60 min | Exfoliación de manos |
| 3 | Limpieza Profunda | Limpieza, exfoliación, vaporización, extracción, alta frecuencia, tonificación, humectación, protección | $450 | 60 min | Masaje facial relajante |
| 4 | Hidratación Profunda | Limpieza básica, hidrofacial, nutrición, mascarilla, tonificación, máscara LED, protección | $500 | 60 min | Masaje facial + 20% desc |
| 5 | Rejuvenecimiento Facial | Limpieza, nutrición, tonificación, microdermoabrasión, mascarilla, hidroplástica, protección | $550 | 60 min | Exfoliación de manos |
| 6 | Gold Threads (Hilos de colágeno) | Limpieza profunda, aplicación de hilos, mascarilla hidroplástica, tónico gold, crema de salida, drenaje linfático | $800 / $7,200 (10) | 60 min | Exfoliación de manos |

#### C. Tratamientos Corporales
- Tratamiento no invasivo para celulitis, estrías, piel de naranja, grasa localizada
- Zonas: piernas, abdomen, brazos, espalda
- Aparatología: cavitador, radiofrecuencia, lipoláser, vacum terapia
- Precio: $600/sesión

#### D. Epilación Roll-On
| Zona | Precio |
|------|--------|
| Media pierna inferior | $250 |
| Media pierna superior | $300 |
| Piernas completas | $400 |
| Axila | $200 |
| Bigote | $150 |
| Barbilla | $150 |
| Barba completa | $200 |
| Área de bikini | $250 |

### Políticas del Negocio

**Condiciones de pago:**
- Sesión única: Anticipo de $100 vía transferencia BBVA el mismo día que se agenda
- Paquete 10 sesiones: Transferencia del 50% para agendar
- Cancelación: Mínimo 24h antes, de lo contrario se pierde el anticipo
- Métodos: Depósito, Transferencia, Efectivo, Tarjeta de crédito
- Datos BBVA: Paola Ríos Aguilar — [datos de pago en sistema admin, no públicos]

**Políticas de servicio (Faciales):**
1. Presentar INE
2. Ropa cómoda
3. Puntualidad — no se recuperan tiempos perdidos (sesiones de 60 min)
4. Rostro limpio, sin maquillaje
5. Se realiza expediente de historial clínico facial/corporal + carta responsiva
6. Seguimiento de tratamiento
7. Consentimiento firmado
8. Aviso de privacidad (Art. 15 y 16 Ley Federal de Protección de Datos)

**Políticas de servicio (Fisioterapia):**
1. Sesiones de ~50 minutos, puntualidad obligatoria
2. Ropa cómoda e higiene adecuada
3. Agendar con anticipación
4. Recordatorio WhatsApp 24h antes, cancelación sin 24h = pérdida de anticipo
5. Protocolo de seguridad obligatorio (nombre, edad, ocupación, cómo se enteró, red social, servicio de interés)
6. Facturación disponible con aviso anticipado

**Protocolo de seguridad (formulario nuevo paciente):**
- Nombre completo
- Edad
- Ocupación
- ¿Cómo te enteraste de Kaya Kalp?
- ¿Tienes alguna red social donde podamos seguirte?
- Especifica con tu usuario

**Pasos para agendar (flujo actual):**
1. Contactar y solicitar disponibilidad
2. Llenar protocolo de seguridad (indispensable)
3. Elegir tipo de sesión y pagar anticipo de $100
4. Próximas citas requieren anticipo también
5. Horario: L-V 9:00am - 8:00pm

### Equipo

| Nombre | Rol | Especialidad |
|--------|-----|-------------|
| L.F.T. Paola Ríos Aguilar | CEO | Medios físicos, terapia manual, suelo pélvico, obstetricia |
| L.F.T. Jenni Álvarez Álvarez | Terapeuta | Ejercicio terapéutico, rehabilitación, recepción, coordinación de citas |
| Gaby Aguilar | Cosmiatra | Tratamientos faciales y corporales |

### Datos de Contacto

- **Dirección:** Ave María No. 25, Fraccionamiento Las Huertas, Centro, San Juan del Río, Qro. (Entrada sobre calle Ayuntamiento, a la altura del Fracc. Tabachines)
- **WhatsApp:** 427 165 92 04
- **Facebook:** Kaya Kalp
- **Instagram:** @kaya_kalp21
- **Horario:** Lunes a Viernes 9:00am - 8:00pm
- **Significado del nombre:** "Kaya Kalp" proviene del latín y significa "cuerpo en calma"
- **Slogan:** "Dando vida a tu cuerpo"
- **Certificación:** Ante la SEP (CONOCER)

### Research Sources

- PDF: "KAYA KALP V20 MASAJES 2025" — Manual de Información de Masajes y Fisioterapia (14 páginas)
- PDF: "KAYA KALP V2025" — Catálogo de Tratamientos Faciales (18 páginas)
- Contexto proporcionado por el usuario sobre mock demo y documentos físicos analizados previamente
- Imágenes de ambos PDFs analizadas visualmente

### Interview Summary

Basado en información proporcionada por el stakeholder en conversaciones previas, incluyendo:
- Lista manuscrita de funciones del sistema deseado (agenda, recordatorios, anticipos, expedientes, fichas, tarjetas de lealtad, información a nuevos usuarios)
- Expediente clínico físico fotografiado
- Ficha de evolución manuscrita

**Stakeholders Consulted:**
- Cristopher (Developer / Product Owner proxy) — proporcionó todos los documentos y contexto
- L.F.T. Paola Ríos Aguilar (indirecta vía documentos) — CEO de Kaya Kalp

### Additional Notes

- El nombre "Kaya Kalp" viene del latín y significa "cuerpo en calma"
- La certificación ante la SEP (CONOCER) es un diferenciador importante que debe destacarse prominentemente en la landing page
- El mock demo HTML ya validó la estructura de 8 pantallas (Dashboard, Agenda, Pacientes, Expediente, Ficha de Evolución, Catálogo, Tarjetas de Lealtad, Nuevos Usuarios) — puede servir como referencia de UX
- Los precios incluyen IVA en sesiones de fisioterapia

---

**Document Status:** Draft v1.0 — Pendiente validación
**Last Updated:** 2026-03-24
**Next Review Date:** Después de validación con Paola Ríos Aguilar
