import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: "kaya-kalp" } });
  if (!tenant) return;

  // Paola Ríos — L.F.T., CEO, suelo pélvico, obstetricia, medios físicos, terapia manual
  await prisma.usuario.updateMany({
    where: { tenantId: tenant.id, nombre: { contains: "Paola" } },
    data: { especialidades: ["Fisioterapia", "Suelo Pélvico"] },
  });

  // Jenni Álvarez — L.F.T., ejercicio terapéutico, rehabilitación
  await prisma.usuario.updateMany({
    where: { tenantId: tenant.id, nombre: { contains: "Jenni" } },
    data: { especialidades: ["Fisioterapia"] },
  });

  // Gaby Aguilar — Cosmiatra (faciales, corporales, epilación)
  await prisma.usuario.updateMany({
    where: { tenantId: tenant.id, nombre: { contains: "Gaby" } },
    data: { especialidades: ["Tratamientos Faciales", "Tratamientos Corporales"] },
  });

  console.log("Especialidades asignadas correctamente.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
