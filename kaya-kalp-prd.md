# Kaya Kalp — PRD v2.0
> Documento de requerimientos para Claude Code. Stack: Next.js 15 · Prisma · PostgreSQL · TypeScript · Tailwind · shadcn/ui

---

## Contexto del proyecto

FisioAll es la plataforma multi-tenant para Kaya Kalp, una clínica de fisioterapia y estética en San Juan del Río. El sistema ya tiene agenda, pacientes, pagos, tarjetas de lealtad y notas SOAP genéricas. Este PRD cubre las 5 funcionalidades nuevas que solicita la clienta (Pao Ríos).

**Tenant slug activo:** `kaya-kalp`  
**Stack de notificaciones:** Evolution API (WhatsApp) — cliente en `src/lib/evolution.ts`  
**Paleta:** `#4a7fa5` azul · `#3fa87c` verde · `#e89b3f` ámbar · `#d9534f` rojo · `#1e2d3a` texto

---

## Feature 1 — Anticipo obligatorio para confirmar cita

### Objetivo
Una cita no queda **confirmada** hasta que el paciente pague $200 MXN de anticipo. Sin pago, el slot se reserva 24h y luego se libera automáticamente.

### Cambios en Prisma schema

```prisma
// Agregar en model Cita
anticipoPagado   Boolean   @default(false)
anticipoPagoId   String?
anticipoVenceAt  DateTime? // now() + 24h al crear

// Agregar en model Pago
citaId           String?
cita             Cita?     @relation(fields: [citaId], references: [id])
```

Correr: `npx prisma migrate dev --name add_anticipo_fields`

### Server action — `src/app/dashboard/agenda/actions.ts`

Modificar `crearCita` para que al final, antes del `return { success: true }`, haga:

```typescript
// Crear pago de anticipo en estado pendiente
const pagoPendiente = await prisma.pago.create({
  data: {
    tenantId,
    pacienteId,
    monto: 200,
    metodo: "transferencia",
    concepto: "Anticipo de sesión",
    estado: "pendiente",
    registradoPor: userId,
    fechaPago: new Date(),
    citaId: cita.id,
  },
});

// Marcar la cita con vencimiento de anticipo (24h)
await prisma.cita.update({
  where: { id: cita.id },
  data: {
    estado: "pendiente_anticipo",
    anticipoVenceAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    anticipoPagoId: pagoPendiente.id,
  },
});
```

### Nueva action — `confirmarAnticipo`

```typescript
export async function confirmarAnticipo(citaId: string, metodo: string) {
  const { tenantId } = await requireAuth();

  const cita = await prisma.cita.findFirst({
    where: { id: citaId, tenantId },
    select: { anticipoPagoId: true },
  });

  if (!cita?.anticipoPagoId) return { error: "No hay anticipo registrado" };

  await prisma.$transaction([
    prisma.pago.update({
      where: { id: cita.anticipoPagoId },
      data: { estado: "pagado", metodo: metodo as any },
    }),
    prisma.cita.update({
      where: { id: citaId },
      data: { estado: "confirmada", anticipoPagado: true },
    }),
  ]);

  revalidatePath("/dashboard/agenda");
  return { success: true };
}
```

### Cron job — liberar slots vencidos

Crear `src/app/api/cron/anticipo/route.ts`:

```typescript
export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const vencidas = await prisma.cita.findMany({
    where: {
      estado: "pendiente_anticipo",
      anticipoVenceAt: { lte: new Date() },
    },
    select: { id: true, anticipoPagoId: true, pacienteId: true, tenantId: true },
  });

  for (const cita of vencidas) {
    await prisma.$transaction([
      prisma.cita.update({
        where: { id: cita.id },
        data: { estado: "cancelada" },
      }),
      ...(cita.anticipoPagoId ? [
        prisma.pago.update({
          where: { id: cita.anticipoPagoId },
          data: { estado: "cancelado" },
        })
      ] : []),
    ]);
    // Enviar WhatsApp de cancelación (best-effort)
  }

  return Response.json({ liberadas: vencidas.length });
}
```

En `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/anticipo", "schedule": "0 * * * *" },
    { "path": "/api/cron/recordatorios", "schedule": "0 10 * * *" }
  ]
}
```

### UI — modal de nueva cita

En `agenda-client.tsx`, modificar el `DialogFooter` del modal de nueva cita para agregar un banner de aviso antes del botón submit:

```tsx
{/* Aviso anticipo — mostrar siempre */}
<div className="bg-[#e89b3f]/10 border border-[#e89b3f]/30 rounded-lg p-3 mb-2">
  <p className="text-xs text-[#854f0b] font-medium flex items-start gap-2">
    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
    Se generará un anticipo de <strong>$200 MXN</strong>. La cita se confirma
    una vez que se valide el pago. Sin pago en 24h el slot se libera.
  </p>
</div>
```

En la lista de citas del día, mostrar badge especial para citas `pendiente_anticipo`:

```typescript
// Agregar en estadoConfig de agenda-client.tsx
pendiente_anticipo: {
  label: "Anticipo pendiente",
  bg: "bg-[#e89b3f]/10",
  border: "border-[#e89b3f]/30",
  text: "text-[#e89b3f]"
},
```

En el modal de detalle de cita, si `estado === "pendiente_anticipo"` mostrar botones:
- **Confirmar transferencia** → llama `confirmarAnticipo(id, "transferencia")`
- **Confirmar efectivo** → llama `confirmarAnticipo(id, "efectivo")`
- **Cancelar cita** → llama `actualizarEstadoCita(id, "cancelada")`

---

## Feature 2 — Horarios y cubículos por terapeuta

### Objetivo
Cada terapeuta tiene su propio horario semanal y cubículo(s) asignado(s). El sistema de agenda solo muestra slots que estén libres tanto en el horario del terapeuta como en el cubículo.

### Nuevo modelo Prisma

```prisma
model HorarioUsuario {
  id        String   @id @default(cuid())
  tenantId  String
  usuarioId String
  diaKey    String   // "lunes" | "martes" | ... | "domingo"
  franjas   Json     // [{ inicio: "09:00", fin: "13:00" }, { inicio: "16:00", fin: "19:00" }]
  activo    Boolean  @default(true)
  updatedAt DateTime @updatedAt

  tenant  Tenant  @relation(fields: [tenantId], references: [id])
  usuario Usuario @relation(fields: [usuarioId], references: [id])

  @@unique([tenantId, usuarioId, diaKey])
  @@map("horarios_usuario")
}

model CubiculoUsuario {
  id           String   @id @default(cuid())
  tenantId     String
  usuarioId    String
  tipoSesion   String   // "fisioterapia" | "suelo_pelvico" | "cosme" | "ejercicio"
  cubiculoPref Int[]    // [2, 1] → preferido 2, fallback 1
  updatedAt    DateTime @updatedAt

  tenant  Tenant  @relation(fields: [tenantId], references: [id])
  usuario Usuario @relation(fields: [usuarioId], references: [id])

  @@unique([tenantId, usuarioId, tipoSesion])
  @@map("cubiculos_usuario")
}
```

Correr: `npx prisma migrate dev --name add_horario_cubiculo_usuario`

### Seed inicial — horarios de Kaya Kalp

Crear `prisma/seeds/horarios-kaya-kalp.ts` con los horarios reales:

```typescript
// Pao — Cubículo 1
// Lunes: 16:00-19:00
// Mar-Jue: 10:00-12:00 y 16:00-19:00
// Viernes: 10:00-13:00
const horariosPao = [
  { diaKey: "lunes",    franjas: [{ inicio: "16:00", fin: "19:00" }] },
  { diaKey: "martes",   franjas: [{ inicio: "10:00", fin: "12:00" }, { inicio: "16:00", fin: "19:00" }] },
  { diaKey: "miercoles",franjas: [{ inicio: "10:00", fin: "12:00" }, { inicio: "16:00", fin: "19:00" }] },
  { diaKey: "jueves",   franjas: [{ inicio: "10:00", fin: "12:00" }, { inicio: "16:00", fin: "19:00" }] },
  { diaKey: "viernes",  franjas: [{ inicio: "10:00", fin: "13:00" }] },
];

// Jenni — Cubículo 2, fallback 1
// Lun-Vie: 09:00-14:00 y 15:00-17:00 (bloqueo comida 14-15)
const horariosJenni = [
  { diaKey: "lunes",     franjas: [{ inicio: "09:00", fin: "14:00" }, { inicio: "15:00", fin: "17:00" }] },
  { diaKey: "martes",    franjas: [{ inicio: "09:00", fin: "14:00" }, { inicio: "15:00", fin: "17:00" }] },
  { diaKey: "miercoles", franjas: [{ inicio: "09:00", fin: "14:00" }, { inicio: "15:00", fin: "17:00" }] },
  { diaKey: "jueves",    franjas: [{ inicio: "09:00", fin: "14:00" }, { inicio: "15:00", fin: "17:00" }] },
  { diaKey: "viernes",   franjas: [{ inicio: "09:00", fin: "14:00" }, { inicio: "15:00", fin: "17:00" }] },
];

// Gaby — Cubículo 2
// Lun-Vie: 09:00-13:00 y 15:00-19:00 (bloqueo comida 13-15)
const horariosGaby = [
  { diaKey: "lunes",     franjas: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
  { diaKey: "martes",    franjas: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
  { diaKey: "miercoles", franjas: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
  { diaKey: "jueves",    franjas: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
  { diaKey: "viernes",   franjas: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
];
```

### Nueva action — `getSlotsDisponibles`

Crear en `agenda/actions.ts`:

```typescript
export async function getSlotsDisponibles(params: {
  fecha: string;           // YYYY-MM-DD
  fisioterapeutaId: string;
  tipoSesion: string;
  duracionMin?: number;    // default 60
}) {
  const { tenantId } = await requireAuth();
  const { fecha, fisioterapeutaId, tipoSesion, duracionMin = 60 } = params;

  const fechaObj = new Date(fecha + "T00:00:00");
  const diaKey = ["domingo","lunes","martes","miercoles","jueves","viernes","sabado"][fechaObj.getDay()];

  // 1. Obtener horario del terapeuta para ese día
  const horario = await prisma.horarioUsuario.findFirst({
    where: { tenantId, usuarioId: fisioterapeutaId, diaKey, activo: true },
  });
  if (!horario) return [];

  const franjas = horario.franjas as { inicio: string; fin: string }[];

  // 2. Obtener cubículo preferido para el tipo de sesión
  const cubiculoConfig = await prisma.cubiculoUsuario.findFirst({
    where: { tenantId, usuarioId: fisioterapeutaId, tipoSesion },
  });
  const cubiculosPref = cubiculoConfig?.cubiculoPref ?? [1];

  // 3. Obtener citas ocupadas ese día para los cubículos del terapeuta
  const inicioDia = new Date(fecha + "T00:00:00");
  const finDia    = new Date(fecha + "T23:59:59");

  const citasOcupadas = await prisma.cita.findMany({
    where: {
      tenantId,
      fechaHoraInicio: { gte: inicioDia, lte: finDia },
      estado: { notIn: ["cancelada"] },
    },
    select: { fechaHoraInicio: true, fechaHoraFin: true, sala: true },
  });

  // 4. Generar slots cada 60 min dentro de las franjas
  const slots: { hora: string; cubiculo: number; disponible: boolean }[] = [];

  for (const franja of franjas) {
    const [hIni, mIni] = franja.inicio.split(":").map(Number);
    const [hFin, mFin] = franja.fin.split(":").map(Number);
    let minutos = hIni * 60 + mIni;
    const finMinutos = hFin * 60 + mFin;

    while (minutos + duracionMin <= finMinutos) {
      const slotIni = new Date(fecha + "T00:00:00");
      slotIni.setMinutes(slotIni.getMinutes() + minutos);
      const slotFin = new Date(slotIni.getTime() + duracionMin * 60 * 1000);

      // Buscar cubículo libre (primero preferido, luego fallback)
      let cubiculoLibre: number | null = null;
      for (const cubId of cubiculosPref) {
        const cubiculoStr = `Cubículo ${cubId}`;
        const ocupado = citasOcupadas.some(c =>
          c.sala === cubiculoStr &&
          c.fechaHoraInicio < slotFin &&
          c.fechaHoraFin > slotIni
        );
        if (!ocupado) { cubiculoLibre = cubId; break; }
      }

      const hora = `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
      slots.push({ hora, cubiculo: cubiculoLibre ?? 0, disponible: cubiculoLibre !== null });
      minutos += duracionMin;
    }
  }

  return slots.filter(s => s.disponible);
}
```

### UI — selector de horario en modal de nueva cita

En `agenda-client.tsx`, reemplazar el `Select` de hora fija por un fetch dinámico:

```tsx
// Estado nuevo
const [slotsDisponibles, setSlotsDisponibles] = useState<
  { hora: string; cubiculo: number }[]
>([]);
const [loadingSlots, setLoadingSlots] = useState(false);

// Efecto: cargar slots cuando cambia fecha o fisioterapeuta
useEffect(() => {
  if (!fechaCita || !fisioId) return;
  setLoadingSlots(true);
  getSlotsDisponibles({
    fecha: fechaCita,
    fisioterapeutaId: fisioId,
    tipoSesion: tipoSesion || "fisioterapia",
    duracionMin: Number(duracion),
  }).then(s => {
    setSlotsDisponibles(s);
    setLoadingSlots(false);
  });
}, [fechaCita, fisioId, tipoSesion, duracion]);
```

Reemplazar el Select de hora por una grilla de botones:

```tsx
<div className="grid grid-cols-4 gap-2">
  {loadingSlots ? (
    <p className="col-span-4 text-xs text-center text-[#1e2d3a]/40 py-3">Cargando horarios...</p>
  ) : slotsDisponibles.length === 0 ? (
    <p className="col-span-4 text-xs text-center text-[#1e2d3a]/40 py-3">Sin disponibilidad este día</p>
  ) : (
    slotsDisponibles.map(s => (
      <button
        key={s.hora}
        type="button"
        onClick={() => { setHoraInicio(s.hora); setSala(`Cubículo ${s.cubiculo}`); }}
        className={`px-2 py-2 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
          horaInicio === s.hora
            ? "bg-[#4a7fa5] text-white border-[#4a7fa5]"
            : "bg-white border-[#c8dce8] text-[#1e2d3a] hover:border-[#4a7fa5]"
        }`}
      >
        {s.hora}
        <span className={`block text-[9px] mt-0.5 ${horaInicio === s.hora ? "text-white/70" : "text-[#1e2d3a]/40"}`}>
          Cub. {s.cubiculo}
        </span>
      </button>
    ))
  )}
</div>
```

### Panel de configuración de horarios

Crear `src/app/dashboard/configuracion/horarios-terapeutas.tsx` con:
- Lista de usuarios del tenant
- Por cada usuario: toggles por día + selectores de franja horaria (inicio/fin)
- Posibilidad de agregar múltiples franjas por día (mañana + tarde)
- Selector de cubículo preferido + fallback por tipo de sesión
- Botón guardar que llame a `guardarHorariosTerapeutas()`

Agregar tab "Horarios del equipo" en `configuracion-client.tsx`.

---

## Feature 3 — Expedientes diferenciados por tipo de sesión

### Objetivo
Al abrir una nota/expediente, el formulario cambia según el tipo de sesión: fisioterapia general, suelo pélvico o cosmetología/facial.

### Nuevo modelo Prisma

```prisma
model ExpedienteEspecializado {
  id         String   @id @default(cuid())
  tenantId   String
  pacienteId String
  tipo       String   // "fisioterapia" | "suelo_pelvico" | "cosme"
  esInicial  Boolean  @default(true)
  datosJson  Json
  citaId     String?
  creadoPor  String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  tenant   Tenant   @relation(fields: [tenantId], references: [id])
  paciente Paciente @relation(fields: [pacienteId], references: [id])
  cita     Cita?    @relation(fields: [citaId], references: [id])
  creador  Usuario  @relation(fields: [creadoPor], references: [id])

  @@map("expedientes_especializados")
}
```

Correr: `npx prisma migrate dev --name add_expediente_especializado`

### Tipos TypeScript — `src/types/expedientes.ts`

```typescript
export interface ExpedienteSueloPelvico {
  // Evaluación inicial
  motivoConsulta: string;
  sintomatologia: {
    dolorPelvico: boolean;
    escapesOrina: boolean;
    escapesGas: boolean;
    presionAbdominopelvica: boolean;
    vidaSexualActiva: boolean;
    estrenimientoCronico: boolean;
  };
  datosFertilidad: {
    estabilidadCicloMenstrual: string;
    partos: number;
    cesareas: number;
    abortos: number;
  };
  antecedentesPatologicos: string;
  semanasGestacion: number | null;
  sintomasEmbarazo: string;
  expectativasSesiones: string;
}

export interface SeguimientoSueloPelvico {
  // Mismos campos que nota SOAP fisioterapia general
  subjetivo: string;
  objetivo: string;
  analisis: string;
  plan: string;
  dolorInicio: number;
  dolorFin: number;
  evolucion: "mejoria" | "sin_cambios" | "deterioro";
  porcentajeObjetivo: number;
  tecnicasUtilizadas: string[];
}

export type BiotipoCutaneo = "normal" | "seca" | "grasa" | "mixta";
export type EstadoPiel = "deshidratada" | "atopica" | "fotosensible" | "envejecida";
export type AlteracionPiel = "hipercromia" | "rosacea" | "acne";
export type TexturaPiel = "suave" | "engrosada" | "oleosa";
export type FototipoPiel = "I" | "II" | "III" | "IV";
export type LineasExpresion = "ninguna" | "suaves" | "profundas" | "arrugas" | "flacidez";

export interface ExpedienteCosme {
  // Evaluación inicial
  productosEnPiel: string;
  rutinaSkincare: string;
  alergias: string;
  usaProtectorSolar: boolean;
  pielAcartonada: boolean;
  consumoCafeinaAlcohol: string;
  tabaco: boolean;
  motivoVisita: string;
  expectativasSesiones: string;
  recomendadoPor: string;
}

export interface SeguimientoCosme {
  biotipoCutaneo: BiotipoCutaneo;
  estadoPiel: EstadoPiel[];
  alteraciones: AlteracionPiel[];
  textura: TexturaPiel;
  fototipo: FototipoPiel;
  lineasExpresion: LineasExpresion;
  observaciones: string;
  diagnosticoTratamiento: string;
  fechaPrimeraSesion: string;
}
```

### Server actions — `src/app/dashboard/expediente/especializado-actions.ts`

```typescript
"use server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function guardarExpedienteEspecializado(params: {
  pacienteId: string;
  tipo: "fisioterapia" | "suelo_pelvico" | "cosme";
  esInicial: boolean;
  datosJson: Record<string, unknown>;
  citaId?: string;
}) {
  const { tenantId, userId } = await requireAuth();

  await prisma.expedienteEspecializado.create({
    data: {
      tenantId,
      pacienteId: params.pacienteId,
      tipo: params.tipo,
      esInicial: params.esInicial,
      datosJson: params.datosJson,
      citaId: params.citaId ?? null,
      creadoPor: userId,
    },
  });

  revalidatePath("/dashboard/expediente");
  revalidatePath("/dashboard/pacientes");
  return { success: true };
}

export async function getExpedienteEspecializado(pacienteId: string) {
  const { tenantId } = await requireAuth();

  const expedientes = await prisma.expedienteEspecializado.findMany({
    where: { tenantId, pacienteId },
    orderBy: { createdAt: "desc" },
  });

  return expedientes;
}

export async function getTipoSesionDeCita(citaId: string) {
  const { tenantId } = await requireAuth();

  const cita = await prisma.cita.findFirst({
    where: { id: citaId, tenantId },
    select: { tipoSesion: true },
  });

  return cita?.tipoSesion ?? "fisioterapia";
}
```

### Componentes de formulario

Crear la carpeta `src/app/dashboard/expediente/forms/` con los siguientes archivos:

#### `ExpedienteFisioterapia.tsx`
El formulario SOAP actual ya existente. Sin cambios, solo moverlo a este archivo y exportarlo.

#### `ExpedienteSueloPelvico.tsx`

Estructura del formulario en orden visual:

```tsx
// Sección 1: Motivo de consulta
<textarea name="motivoConsulta" placeholder="Describe el motivo de consulta..." />

// Sección 2: Sintomatología — checkboxes con palomitas
<div className="grid grid-cols-2 gap-2">
  {[
    { key: "dolorPelvico", label: "Dolor pélvico o perineal" },
    { key: "escapesOrina", label: "Escapes de orina/gas" },
    { key: "presionAbdominopelvica", label: "Presión/pesadez abdominopélvica" },
    { key: "vidaSexualActiva", label: "Vida sexual activa" },
    { key: "estrenimientoCronico", label: "Estreñimiento crónico" },
  ].map(item => (
    <label key={item.key} className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer
      hover:bg-[#e4ecf2]/50 has-[:checked]:bg-[#4a7fa5]/10 has-[:checked]:border-[#4a7fa5]/40">
      <input type="checkbox" name={item.key} className="accent-[#4a7fa5]" />
      <span className="text-sm">{item.label}</span>
    </label>
  ))}
</div>

// Sección 3: Datos de fertilidad — campos numéricos
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
  <Input label="Ciclo menstrual" name="cicloMenstrual" placeholder="Regular / Irregular" />
  <Input label="Partos" name="partos" type="number" min="0" />
  <Input label="Cesáreas" name="cesareas" type="number" min="0" />
  <Input label="Abortos" name="abortos" type="number" min="0" />
</div>

// Sección 4: Campos adicionales
<Input label="Antecedentes patológicos" name="antecedentes" />
<Input label="Semanas de gestación (si aplica)" name="semanasGestacion" type="number" />
<textarea label="Síntomas de embarazo latentes" name="sintomasEmbarazo" />
<textarea label="¿Qué esperas de tus sesiones?" name="expectativas" />
```

Para seguimiento (esInicial=false): renderiza el formulario SOAP estándar de `ExpedienteFisioterapia`.

#### `ExpedienteCosme.tsx`

Para evaluación inicial (`esInicial=true`):

```tsx
// Todos campos de texto abierto o boolean
<textarea label="¿Acostumbras a usar algún producto en tu piel?" name="productosEnPiel" />
<textarea label="Menciona tu rutina de skincare" name="rutinaSkincare" />
<Input label="¿Eres alérgica a algún producto?" name="alergias" />

// Toggles / checkboxes
<ToggleField label="¿Usas protector solar?" name="usaProtectorSolar" />
<ToggleField label="¿Sientes tu piel acartonada o tirante?" name="pielAcartonada" />
<ToggleField label="¿Consumes tabaco?" name="tabaco" />

<Input label="Bebidas (cafeína, alcohol)" name="cafeinaAlcohol" />
<textarea label="Motivo de la visita" name="motivoVisita" />
<textarea label="¿Qué esperas obtener en tus sesiones?" name="expectativas" />
<Input label="Recomendada por" name="recomendadoPor" />
```

Para seguimiento (`esInicial=false`):

```tsx
// Selectores de evaluación clínica
<Select label="Biotipo cutáneo" name="biotipo" options={["Normal","Seca","Grasa","Mixta"]} />

// Multi-select estado de piel
<CheckboxGroup label="Estado de la piel"
  options={["Deshidratada","Atópica","Fotosensible","Envejecida"]}
  name="estadoPiel" />

// Multi-select alteraciones
<CheckboxGroup label="Alteraciones"
  options={["Hipercromía","Rosácea","Acné"]}
  name="alteraciones" />

<Select label="Textura" name="textura" options={["Suave","Engrosada","Oleosa"]} />
<Select label="Fototipo" name="fototipo" options={["I","II","III","IV"]} />
<Select label="Líneas de expresión"
  name="lineasExpresion"
  options={["Ninguna","Suaves","Profundas","Arrugas","Flacidez"]} />

<textarea label="Observaciones" name="observaciones" />
<textarea label="Diagnóstico y tratamiento" name="diagnosticoTratamiento" />
<Input label="Fecha de primera sesión" name="fechaPrimeraSesion" type="date" />
```

### Lógica de selección en `expediente-client.tsx`

```typescript
// Función helper para determinar tipo de formulario
function getTipoExpediente(tipoSesion: string): "fisioterapia" | "suelo_pelvico" | "cosme" {
  const s = tipoSesion.toLowerCase();
  if (s.includes("suelo pélvico") || s.includes("suelo pelvico")) return "suelo_pelvico";
  if (
    s.includes("facial") || s.includes("limpieza") ||
    s.includes("cosme") || s.includes("peeling") ||
    s.includes("dermaplaning") || s.includes("anti-edad") ||
    s.includes("hidratante") || s.includes("radiofrecuencia facial")
  ) return "cosme";
  return "fisioterapia";
}

// En el componente, antes del render:
const tipoExpediente = getTipoExpediente(sesion.tipoSesion);

// Render condicional del formulario:
{tipoExpediente === "suelo_pelvico" && <ExpedienteSueloPelvico pacienteId={paciente.id} citaId={citaId} esInicial={!tieneExpedienteInicial} />}
{tipoExpediente === "cosme" && <ExpedienteCosme pacienteId={paciente.id} citaId={citaId} esInicial={!tieneExpedienteInicial} />}
{tipoExpediente === "fisioterapia" && <ExpedienteFisioterapia /* props actuales */ />}
```

### Indicador visual del tipo en la cabecera

En la card de info de cita al inicio del expediente, agregar badge de tipo:

```tsx
const TIPO_BADGE = {
  fisioterapia:  { label: "Fisioterapia",   color: "bg-[#4a7fa5]/10 text-[#4a7fa5]" },
  suelo_pelvico: { label: "Suelo Pélvico",  color: "bg-[#0d9488]/10 text-[#0d9488]" },
  cosme:         { label: "Cosmetología",   color: "bg-[#e89b3f]/10 text-[#854f0b]" },
};
```

---

## Feature 4 — Recordatorios automáticos 24h antes

### Objetivo
El día anterior a cada cita confirmada, el sistema envía automáticamente un mensaje de WhatsApp al paciente.

### Cron route — `src/app/api/cron/recordatorios/route.ts`

```typescript
import { prisma } from "@/lib/prisma";
import { getEvolutionClient, formatPhone, isConfigured } from "@/lib/evolution";

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!isConfigured()) {
    return Response.json({ skipped: true, reason: "Evolution API no configurado" });
  }

  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const inicioManana = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0, 0, 0);
  const finManana    = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59);

  const citas = await prisma.cita.findMany({
    where: {
      fechaHoraInicio: { gte: inicioManana, lte: finManana },
      estado: { in: ["confirmada", "agendada"] },
      recordatorioEnviado: { not: true },
    },
    include: {
      paciente: { select: { nombre: true, apellido: true, telefono: true } },
      fisioterapeuta: { select: { nombre: true, apellido: true } },
    },
  });

  const client = getEvolutionClient();
  let enviados = 0;
  let errores = 0;

  for (const cita of citas) {
    if (!cita.paciente.telefono) continue;

    const fecha = cita.fechaHoraInicio.toLocaleDateString("es-MX", {
      weekday: "long", day: "numeric", month: "long",
    });
    const hora = cita.fechaHoraInicio.toLocaleTimeString("es-MX", {
      hour: "2-digit", minute: "2-digit",
    });

    const mensaje = [
      `Hola ${cita.paciente.nombre} 👋`,
      ``,
      `Te recordamos tu cita de mañana en *Kaya Kalp*:`,
      `📅 ${fecha}`,
      `🕐 ${hora} hrs`,
      `👩‍⚕️ ${cita.fisioterapeuta.nombre} ${cita.fisioterapeuta.apellido}`,
      cita.tipoSesion ? `📋 ${cita.tipoSesion}` : null,
      cita.sala ? `🏠 ${cita.sala}` : null,
      ``,
      `Si necesitas reagendar, contáctanos con anticipación.`,
      `¡Te esperamos! 💙`,
    ].filter(Boolean).join("\n");

    try {
      await client.sendText(formatPhone(cita.paciente.telefono), mensaje);
      await prisma.cita.update({
        where: { id: cita.id },
        data: { recordatorioEnviado: true, recordatorioAt: new Date() },
      });
      enviados++;
    } catch (err) {
      console.error(`[Recordatorio] Error cita ${cita.id}:`, err);
      errores++;
    }
  }

  return Response.json({ enviados, errores, total: citas.length });
}
```

### Recordatorio de anticipo pendiente — `src/app/api/cron/anticipo/route.ts`

Reutiliza la misma estructura pero busca citas `pendiente_anticipo` con más de 12h sin confirmar y envía WhatsApp antes de cancelar:

```typescript
const mensaje12h = [
  `Hola ${cita.paciente.nombre} 👋`,
  ``,
  `Notamos que tu cita del *${fecha}* a las *${hora}* aún tiene el anticipo pendiente de *$200 MXN*.`,
  ``,
  `Para confirmar tu lugar, realiza el pago y envíanos el comprobante.`,
  `Si no recibimos el anticipo en las próximas *12 horas*, el slot se liberará automáticamente.`,
  ``,
  `¿Necesitas ayuda? Escríbenos aquí mismo. 💙`,
].join("\n");
```

---

## Feature 5 — Panel de configuración de horarios del equipo

### Objetivo
Desde Configuración → pestaña "Equipo", la admin puede editar los horarios semanales de cada terapeuta y sus cubículos asignados por tipo de sesión.

### Componente — `src/app/dashboard/configuracion/horarios-panel.tsx`

UI completa del panel:

```
┌─────────────────────────────────────────────────────┐
│  Horarios del Equipo                    [Guardar]   │
├─────────────────────────────────────────────────────┤
│  [Pao ▼]  [Jenni]  [Gaby]   ← selector terapeuta  │
├─────────────────────────────────────────────────────┤
│  Lun  [●] Activo   09:00 ─── 14:00  [+franja]      │
│  Mar  [●] Activo   10:00 ─── 12:00  |  16:00-19:00 │
│  Mié  [●] Activo   10:00 ─── 12:00  |  16:00-19:00 │
│  Jue  [●] Activo   10:00 ─── 12:00  |  16:00-19:00 │
│  Vie  [●] Activo   10:00 ─── 13:00                  │
│  Sáb  [ ] Inactivo                                  │
│  Dom  [ ] Inactivo                                  │
├─────────────────────────────────────────────────────┤
│  Cubículos por tipo de sesión                        │
│  Fisioterapia     → Cubículo 1  (fallback: -)       │
│  Suelo Pélvico    → Cubículo 1  (fallback: -)       │
│  Cosme            → Cubículo 2  (fallback: -)       │
│  Ejercicio Terap. → Cubículo 3  (fallback: -)       │
└─────────────────────────────────────────────────────┘
```

### Server actions — `configuracion/actions.ts` (agregar)

```typescript
export async function getHorariosTerapeutas() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) return [];

  const [horarios, cubiculos, usuarios] = await Promise.all([
    prisma.horarioUsuario.findMany({ where: { tenantId: tenant.id } }),
    prisma.cubiculoUsuario.findMany({ where: { tenantId: tenant.id } }),
    prisma.usuario.findMany({ where: { tenantId: tenant.id, activo: true },
      select: { id: true, nombre: true, apellido: true, rol: true } }),
  ]);

  return usuarios.map(u => ({
    ...u,
    horarios: horarios.filter(h => h.usuarioId === u.id),
    cubiculos: cubiculos.filter(c => c.usuarioId === u.id),
  }));
}

export async function guardarHorariosTerapeutas(data: {
  usuarioId: string;
  horarios: { diaKey: string; activo: boolean; franjas: { inicio: string; fin: string }[] }[];
  cubiculos: { tipoSesion: string; cubiculoPref: number[] }[];
}) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) return { error: "Tenant no encontrado" };

  await prisma.$transaction([
    // Borrar horarios existentes del usuario y recrear
    prisma.horarioUsuario.deleteMany({
      where: { tenantId: tenant.id, usuarioId: data.usuarioId },
    }),
    ...data.horarios.filter(h => h.activo).map(h =>
      prisma.horarioUsuario.create({
        data: {
          tenantId: tenant.id,
          usuarioId: data.usuarioId,
          diaKey: h.diaKey,
          franjas: h.franjas,
          activo: true,
        },
      })
    ),
    // Borrar cubículos existentes y recrear
    prisma.cubiculoUsuario.deleteMany({
      where: { tenantId: tenant.id, usuarioId: data.usuarioId },
    }),
    ...data.cubiculos.map(c =>
      prisma.cubiculoUsuario.create({
        data: {
          tenantId: tenant.id,
          usuarioId: data.usuarioId,
          tipoSesion: c.tipoSesion,
          cubiculoPref: c.cubiculoPref,
        },
      })
    ),
  ]);

  revalidatePath("/dashboard/configuracion");
  revalidatePath("/dashboard/agenda");
  return { ok: true };
}
```

---

## Checklist de implementación

Ejecutar en este orden para evitar conflictos:

### Paso 1 — Migraciones de base de datos
```bash
# Agregar campos de anticipo a Cita y citaId a Pago
npx prisma migrate dev --name add_anticipo_fields

# Agregar tablas HorarioUsuario y CubiculoUsuario
npx prisma migrate dev --name add_horario_cubiculo_usuario

# Agregar tabla ExpedienteEspecializado
npx prisma migrate dev --name add_expediente_especializado

# Regenerar cliente
npx prisma generate
```

### Paso 2 — Variables de entorno
```env
CRON_SECRET=<generar con openssl rand -hex 32>
# Evolution API ya debe estar configurado:
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
EVOLUTION_INSTANCE_NAME=
```

### Paso 3 — Backend (en orden)
- [ ] `src/types/expedientes.ts` — tipos TypeScript
- [ ] `src/app/api/cron/recordatorios/route.ts`
- [ ] `src/app/api/cron/anticipo/route.ts`
- [ ] `src/app/dashboard/agenda/actions.ts` — modificar `crearCita`, agregar `confirmarAnticipo`, agregar `getSlotsDisponibles`
- [ ] `src/app/dashboard/expediente/especializado-actions.ts`
- [ ] `src/app/dashboard/configuracion/actions.ts` — agregar `getHorariosTerapeutas`, `guardarHorariosTerapeutas`
- [ ] `vercel.json` — cron jobs

### Paso 4 — Frontend (en orden)
- [ ] `src/app/dashboard/expediente/forms/ExpedienteFisioterapia.tsx`
- [ ] `src/app/dashboard/expediente/forms/ExpedienteSueloPelvico.tsx`
- [ ] `src/app/dashboard/expediente/forms/ExpedienteCosme.tsx`
- [ ] `src/app/dashboard/expediente/expediente-client.tsx` — lógica de bifurcación
- [ ] `src/app/dashboard/agenda/agenda-client.tsx` — banner anticipo, grilla de slots, badge `pendiente_anticipo`
- [ ] `src/app/dashboard/configuracion/horarios-panel.tsx`
- [ ] `src/app/dashboard/configuracion/configuracion-client.tsx` — agregar tab "Equipo"

### Paso 5 — Seed de datos iniciales
```bash
npx ts-node prisma/seeds/horarios-kaya-kalp.ts
```

---

## Notas para Claude Code

- El proyecto usa `"use server"` en todas las actions — no olvidar el directive.
- Prisma client se importa desde `@/lib/prisma`.
- Auth con `requireAuth()` desde `@/lib/auth` — retorna `{ tenantId, userId }`.
- Evolution API client con `getEvolutionClient()` desde `@/lib/evolution`.
- `revalidatePath` al final de toda action que mute datos.
- Paleta de colores consistente con el resto del sistema (ver variables al inicio).
- Todos los componentes cliente llevan `"use client"` como primera línea.
- Los modales usan `Dialog` de shadcn/ui siguiendo el patrón de `agenda-client.tsx`.
- Para formularios con múltiples secciones usar `border-l-4` con colores semánticos como en `expediente-client.tsx`.
