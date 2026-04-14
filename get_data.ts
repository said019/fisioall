import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tenants = await prisma.tenant.findMany();
    const usuarios = await prisma.usuario.findMany({
        select: { id: true, email: true, nombre: true, rol: true, tenant: { select: { slug: true } } }
    });
    const pacientes = await prisma.paciente.findMany({
        select: { id: true, email: true, nombre: true, tenant: { select: { slug: true } } }
    });

    console.log("=== TENANTS ===");
    console.log(JSON.stringify(tenants, null, 2));
    console.log("=== USUARIOS ===");
    console.log(JSON.stringify(usuarios, null, 2));
    console.log("=== PACIENTES ===");
    console.log(JSON.stringify(pacientes, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
