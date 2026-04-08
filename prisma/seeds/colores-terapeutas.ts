import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: "kaya-kalp" } });
  if (!tenant) return;

  const colores = [
    { nombre: "Paola", color: "#4a7fa5" },
    { nombre: "Jenni", color: "#3fa87c" },
    { nombre: "Gaby", color: "#e89b3f" },
  ];

  for (const { nombre, color } of colores) {
    await prisma.usuario.updateMany({
      where: { tenantId: tenant.id, nombre: { contains: nombre } },
      data: { colorAgenda: color },
    });
  }
  console.log("Colores asignados.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
