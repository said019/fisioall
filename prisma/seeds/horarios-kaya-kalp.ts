/**
 * Seed: Horarios de Kaya Kalp
 *
 * Uso:
 *   npx tsx prisma/seeds/horarios-kaya-kalp.ts
 *
 * Prerequisitos:
 *   - Tenant "kaya-kalp" debe existir
 *   - Usuarios Pao, Jenni, Gaby deben existir y estar activos
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TENANT_SLUG = "kaya-kalp";

// ── Horarios ────────────────────────────────────────────────────────────────

// Pao — Cubículo 1
// Lunes: 16:00-19:00
// Mar-Jue: 10:00-12:00 y 16:00-19:00
// Viernes: 10:00-13:00
const horariosPao = [
  { diaKey: "lunes", franjas: [{ inicio: "16:00", fin: "19:00" }] },
  { diaKey: "martes", franjas: [{ inicio: "10:00", fin: "12:00" }, { inicio: "16:00", fin: "19:00" }] },
  { diaKey: "miercoles", franjas: [{ inicio: "10:00", fin: "12:00" }, { inicio: "16:00", fin: "19:00" }] },
  { diaKey: "jueves", franjas: [{ inicio: "10:00", fin: "12:00" }, { inicio: "16:00", fin: "19:00" }] },
  { diaKey: "viernes", franjas: [{ inicio: "10:00", fin: "13:00" }] },
];

const cubiculosPao = [
  { tipoSesion: "fisioterapia", cubiculoPref: [1] },
  { tipoSesion: "suelo_pelvico", cubiculoPref: [1] },
];

// Jenni — Cubículo 2, fallback 1
// Lun-Vie: 09:00-14:00 y 15:00-17:00 (bloqueo comida 14-15)
const horariosJenni = [
  { diaKey: "lunes", franjas: [{ inicio: "09:00", fin: "14:00" }, { inicio: "15:00", fin: "17:00" }] },
  { diaKey: "martes", franjas: [{ inicio: "09:00", fin: "14:00" }, { inicio: "15:00", fin: "17:00" }] },
  { diaKey: "miercoles", franjas: [{ inicio: "09:00", fin: "14:00" }, { inicio: "15:00", fin: "17:00" }] },
  { diaKey: "jueves", franjas: [{ inicio: "09:00", fin: "14:00" }, { inicio: "15:00", fin: "17:00" }] },
  { diaKey: "viernes", franjas: [{ inicio: "09:00", fin: "14:00" }, { inicio: "15:00", fin: "17:00" }] },
];

const cubiculosJenni = [
  { tipoSesion: "fisioterapia", cubiculoPref: [2, 1] },
  { tipoSesion: "suelo_pelvico", cubiculoPref: [2, 1] },
  { tipoSesion: "ejercicio", cubiculoPref: [3] },
];

// Gaby — Cubículo 2
// Lun-Vie: 09:00-13:00 y 15:00-19:00 (bloqueo comida 13-15)
const horariosGaby = [
  { diaKey: "lunes", franjas: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
  { diaKey: "martes", franjas: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
  { diaKey: "miercoles", franjas: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
  { diaKey: "jueves", franjas: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
  { diaKey: "viernes", franjas: [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }] },
];

const cubiculosGaby = [
  { tipoSesion: "cosme", cubiculoPref: [2] },
  { tipoSesion: "fisioterapia", cubiculoPref: [2] },
];

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) {
    console.error(`❌ Tenant "${TENANT_SLUG}" no encontrado.`);
    process.exit(1);
  }

  const usuarios = await prisma.usuario.findMany({
    where: { tenantId: tenant.id, activo: true },
    select: { id: true, nombre: true, apellido: true },
  });

  const findUser = (search: string) => {
    const u = usuarios.find(
      (u) =>
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (u.apellido ?? "").toLowerCase().includes(search.toLowerCase())
    );
    if (!u) {
      console.warn(`⚠️  Usuario "${search}" no encontrado, saltando...`);
    }
    return u;
  };

  const seedConfig = [
    { search: "Pao", horarios: horariosPao, cubiculos: cubiculosPao },
    { search: "Jenni", horarios: horariosJenni, cubiculos: cubiculosJenni },
    { search: "Gaby", horarios: horariosGaby, cubiculos: cubiculosGaby },
  ];

  for (const { search, horarios, cubiculos } of seedConfig) {
    const user = findUser(search);
    if (!user) continue;

    console.log(`\n📅 Seeding horarios para ${user.nombre} ${user.apellido ?? ""}...`);

    // Delete existing
    await prisma.horarioUsuario.deleteMany({
      where: { tenantId: tenant.id, usuarioId: user.id },
    });
    await prisma.cubiculoUsuario.deleteMany({
      where: { tenantId: tenant.id, usuarioId: user.id },
    });

    // Create horarios
    for (const h of horarios) {
      await prisma.horarioUsuario.create({
        data: {
          tenantId: tenant.id,
          usuarioId: user.id,
          diaKey: h.diaKey,
          franjas: h.franjas,
          activo: true,
        },
      });
      console.log(`  ✅ ${h.diaKey}: ${h.franjas.map((f) => `${f.inicio}-${f.fin}`).join(" | ")}`);
    }

    // Create cubículos
    for (const c of cubiculos) {
      await prisma.cubiculoUsuario.create({
        data: {
          tenantId: tenant.id,
          usuarioId: user.id,
          tipoSesion: c.tipoSesion,
          cubiculoPref: c.cubiculoPref,
        },
      });
      console.log(`  🏠 ${c.tipoSesion} → Cubículo(s) [${c.cubiculoPref.join(", ")}]`);
    }
  }

  console.log("\n✅ Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
