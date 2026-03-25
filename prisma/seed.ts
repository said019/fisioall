import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Kaya Kalp database...");

  const passwordHash = await bcrypt.hash("password123", 12);

  // ── TENANT ─────────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "kaya-kalp" },
    update: {
      nombre: "Kaya Kalp",
      colorPrimario: "#4a7fa5",
      telefono: "427 274 0000",
      emailContacto: "contacto@kayakalp.com.mx",
      direccion: "San Juan del Río, Centro",
      ciudad: "San Juan del Río",
      estado: "Querétaro",
    },
    create: {
      nombre: "Kaya Kalp",
      slug: "kaya-kalp",
      plan: "pro",
      activo: true,
      colorPrimario: "#4a7fa5",
      telefono: "427 274 0000",
      emailContacto: "contacto@kayakalp.com.mx",
      direccion: "San Juan del Río, Centro",
      ciudad: "San Juan del Río",
      estado: "Querétaro",
      timezone: "America/Mexico_City",
      maxFisioterapeutas: 5,
      maxPacientesActivos: 500,
      suscripcionActiva: true,
    },
  });

  console.log("✅ Tenant:", tenant.nombre);

  // ── USUARIOS ───────────────────────────────────────────────────────────────
  const paola = await prisma.usuario.upsert({
    where: { email: "doctor@clinica.com" },
    update: {
      nombre: "Paola",
      apellido: "Ríos Aguilar",
      rol: "admin",
      tenantId: tenant.id,
      especialidades: ["Fisioterapia", "Masajes Terapéuticos", "Suelo Pélvico"],
      bio: "L.F.T. Paola Ríos Aguilar. Especializada en disfunciones de suelo pélvico, terapia manual y obstetricia. CEO de Kaya Kalp.",
    },
    create: {
      tenantId: tenant.id,
      nombre: "Paola",
      apellido: "Ríos Aguilar",
      email: "doctor@clinica.com",
      passwordHash,
      rol: "admin",
      cedulaProfesional: "LFT-12345",
      especialidades: ["Fisioterapia", "Masajes Terapéuticos", "Suelo Pélvico"],
      bio: "L.F.T. Paola Ríos Aguilar. Especializada en disfunciones de suelo pélvico, terapia manual y obstetricia. CEO de Kaya Kalp.",
      activo: true,
    },
  });

  const gaby = await prisma.usuario.upsert({
    where: { email: "gaby@kayakalp.com.mx" },
    update: {
      nombre: "Gaby",
      apellido: "Aguilar",
      rol: "cosmiatra",
      especialidades: ["Tratamientos Faciales", "Tratamientos Corporales"],
      tenantId: tenant.id,
    },
    create: {
      tenantId: tenant.id,
      nombre: "Gaby",
      apellido: "Aguilar",
      email: "gaby@kayakalp.com.mx",
      passwordHash,
      rol: "cosmiatra",
      especialidades: ["Tratamientos Faciales", "Tratamientos Corporales"],
      bio: "Cosmiatra certificada especializada en tratamientos faciales y corporales.",
      activo: true,
    },
  });

  const jenni = await prisma.usuario.upsert({
    where: { email: "jenni@kayakalp.com.mx" },
    update: {
      nombre: "Jenni",
      apellido: "Álvarez",
      rol: "fisioterapeuta",
      especialidades: ["Fisioterapia", "Rehabilitación"],
      tenantId: tenant.id,
    },
    create: {
      tenantId: tenant.id,
      nombre: "Jenni",
      apellido: "Álvarez",
      email: "jenni@kayakalp.com.mx",
      passwordHash,
      rol: "fisioterapeuta",
      especialidades: ["Fisioterapia", "Rehabilitación"],
      bio: "Licenciada en Fisioterapia, encargada del área de ejercicio terapéutico y rehabilitación.",
      activo: true,
    },
  });

  console.log("✅ Users: Paola, Gaby, Jenni");

  // ── PAQUETES ───────────────────────────────────────────────────────────────
  const paq10Fisio = await prisma.paquete.create({
    data: {
      tenantId: tenant.id,
      nombre: "Paquete 10 Sesiones Fisio",
      descripcion: "10 sesiones de fisioterapia. Vigencia 6 meses.",
      numSesiones: 10,
      precio: 4500,
      duracionDias: 180,
      color: "#4a7fa5",
    },
  });

  const paq20Fisio = await prisma.paquete.create({
    data: {
      tenantId: tenant.id,
      nombre: "Paquete 20 Sesiones Fisio",
      descripcion: "20 sesiones de fisioterapia, máximo ahorro. Vigencia 6 meses.",
      numSesiones: 20,
      precio: 8000,
      duracionDias: 180,
      color: "#4a7fa5",
    },
  });

  const paq10Facial = await prisma.paquete.create({
    data: {
      tenantId: tenant.id,
      nombre: "Paquete 10 Faciales",
      descripcion: "10 sesiones de tratamiento facial.",
      numSesiones: 10,
      precio: 5000,
      duracionDias: 180,
      color: "#9b59b6",
    },
  });

  const paq10Masaje = await prisma.paquete.create({
    data: {
      tenantId: tenant.id,
      nombre: "Paquete 10 Masajes",
      descripcion: "10 sesiones de masaje relajante o descontracturante.",
      numSesiones: 10,
      precio: 4500,
      duracionDias: 180,
      color: "#3fa87c",
    },
  });

  console.log("✅ 4 paquetes created");

  // ── PACIENTES ──────────────────────────────────────────────────────────────
  const pacientesData = [
    { nombre: "Carmen", apellido: "Ruiz López", tel: "427-123-4567", email: "carmen.ruiz@email.com", genero: "femenino" as const, fisio: paola.id, sesiones: 7 },
    { nombre: "Isabel", apellido: "Flores García", tel: "427-234-5678", email: "isabel.flores@email.com", genero: "femenino" as const, fisio: jenni.id, sesiones: 10 },
    { nombre: "Roberto", apellido: "Méndez Vega", tel: "427-345-6789", email: null, genero: "masculino" as const, fisio: paola.id, sesiones: 14 },
    { nombre: "Ana Sofía", apellido: "Torres", tel: "427-456-7890", email: "ana.torres@email.com", genero: "femenino" as const, fisio: paola.id, sesiones: 10 },
    { nombre: "Luis Ángel", apellido: "Ramos", tel: "427-567-8901", email: null, genero: "masculino" as const, fisio: gaby.id, sesiones: 3 },
    { nombre: "Patricia", apellido: "Morales Díaz", tel: "427-678-9012", email: "patricia.m@email.com", genero: "femenino" as const, fisio: jenni.id, sesiones: 18 },
    { nombre: "Fernando", apellido: "Díaz Castillo", tel: "427-789-0123", email: null, genero: "masculino" as const, fisio: gaby.id, sesiones: 5 },
    { nombre: "Valentina", apellido: "Ortega León", tel: "427-890-1234", email: null, genero: "femenino" as const, fisio: paola.id, sesiones: 10 },
  ];

  const pacientes = [];
  for (const pd of pacientesData) {
    const p = await prisma.paciente.create({
      data: {
        tenantId: tenant.id,
        fisioterapeutaId: pd.fisio,
        nombre: pd.nombre,
        apellido: pd.apellido,
        telefono: pd.tel,
        email: pd.email,
        genero: pd.genero,
        totalSesiones: pd.sesiones,
        activo: true,
      },
    });
    pacientes.push(p);
  }

  console.log(`✅ ${pacientes.length} pacientes created`);

  // ── MEMBRESÍAS ─────────────────────────────────────────────────────────────
  const en6m = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

  await Promise.all([
    prisma.membresia.create({
      data: { tenantId: tenant.id, pacienteId: pacientes[0].id, paqueteId: paq10Fisio.id, fisioterapeutaId: paola.id, estado: "activa", sesionesTotal: 10, sesionesUsadas: 7, precioPagado: 4500, fechaActivacion: new Date("2026-01-15"), fechaVencimiento: en6m },
    }),
    prisma.membresia.create({
      data: { tenantId: tenant.id, pacienteId: pacientes[1].id, paqueteId: paq10Facial.id, fisioterapeutaId: jenni.id, estado: "activa", sesionesTotal: 10, sesionesUsadas: 10, precioPagado: 5000, fechaActivacion: new Date("2025-11-01"), fechaVencimiento: new Date("2026-05-01") },
    }),
    prisma.membresia.create({
      data: { tenantId: tenant.id, pacienteId: pacientes[2].id, paqueteId: paq20Fisio.id, fisioterapeutaId: paola.id, estado: "activa", sesionesTotal: 20, sesionesUsadas: 14, precioPagado: 8000, fechaActivacion: new Date("2025-12-10"), fechaVencimiento: new Date("2026-06-10") },
    }),
    prisma.membresia.create({
      data: { tenantId: tenant.id, pacienteId: pacientes[4].id, paqueteId: paq10Masaje.id, fisioterapeutaId: gaby.id, estado: "activa", sesionesTotal: 10, sesionesUsadas: 3, precioPagado: 4500, fechaActivacion: new Date("2026-02-01"), fechaVencimiento: en6m },
    }),
    prisma.membresia.create({
      data: { tenantId: tenant.id, pacienteId: pacientes[5].id, paqueteId: paq10Facial.id, fisioterapeutaId: jenni.id, estado: "activa", sesionesTotal: 20, sesionesUsadas: 18, precioPagado: 9000, fechaActivacion: new Date("2025-10-15"), fechaVencimiento: new Date("2026-04-15") },
    }),
  ]);

  console.log("✅ 5 membresías created");

  // ── CITAS DE HOY ───────────────────────────────────────────────────────────
  const hoy = new Date();
  const hoyBase = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  const citasData = [
    { pac: 0, fisio: paola.id, hora: 9, dur: 60, tipo: "Valoración Fisioterapéutica", sala: "Sala 1", estado: "completada" as const },
    { pac: 2, fisio: paola.id, hora: 10, dur: 45, tipo: "Sesión de Fisioterapia", sala: "Sala 1", estado: "completada" as const },
    { pac: 4, fisio: gaby.id, hora: 10, dur: 50, tipo: "Rehabilitación Deportiva", sala: "Sala 2", estado: "en_curso" as const },
    { pac: 1, fisio: jenni.id, hora: 11, dur: 50, tipo: "Facial Hidratante", sala: "Sala 3", estado: "confirmada" as const },
    { pac: 5, fisio: jenni.id, hora: 12, dur: 60, tipo: "Limpieza Facial Profunda", sala: "Sala 3", estado: "agendada" as const },
    { pac: 3, fisio: paola.id, hora: 13, dur: 45, tipo: "Fisioterapia Suelo Pélvico", sala: "Sala 1", estado: "agendada" as const },
    { pac: 6, fisio: gaby.id, hora: 14, dur: 60, tipo: "Terapia Manual Ortopédica", sala: "Sala 2", estado: "agendada" as const },
    { pac: 7, fisio: paola.id, hora: 16, dur: 60, tipo: "Masaje Relajante", sala: "Sala 1", estado: "agendada" as const },
  ];

  for (const c of citasData) {
    const inicio = new Date(hoyBase.getTime() + c.hora * 60 * 60 * 1000);
    const fin = new Date(inicio.getTime() + c.dur * 60 * 1000);
    await prisma.cita.create({
      data: {
        tenantId: tenant.id, fisioterapeutaId: c.fisio, pacienteId: pacientes[c.pac].id,
        fechaHoraInicio: inicio, fechaHoraFin: fin, estado: c.estado,
        tipoSesion: c.tipo, sala: c.sala, createdBy: paola.id,
      },
    });
  }

  console.log(`✅ ${citasData.length} citas created`);

  // ── PAGOS ──────────────────────────────────────────────────────────────────
  const pagosData = [
    { pac: 0, monto: 4500, metodo: "transferencia" as const, concepto: "Paquete 10 Sesiones Fisio" },
    { pac: 1, monto: 5000, metodo: "efectivo" as const, concepto: "Paquete 10 Faciales" },
    { pac: 2, monto: 8000, metodo: "transferencia" as const, concepto: "Paquete 20 Sesiones Fisio" },
    { pac: 3, monto: 500, metodo: "efectivo" as const, concepto: "Sesión de Fisioterapia" },
    { pac: 5, monto: 550, metodo: "efectivo" as const, concepto: "Limpieza Facial Profunda" },
    { pac: 6, monto: 550, metodo: "transferencia" as const, concepto: "Terapia Manual Ortopédica" },
  ];

  for (const p of pagosData) {
    await prisma.pago.create({
      data: {
        tenantId: tenant.id, pacienteId: pacientes[p.pac].id,
        monto: p.monto, metodo: p.metodo, concepto: p.concepto,
        registradoPor: paola.id,
      },
    });
  }

  console.log(`✅ ${pagosData.length} pagos created`);

  console.log("\n🎉 Seed complete! Login: doctor@clinica.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
