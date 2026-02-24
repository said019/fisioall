import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10)

    // Crear Tenant de prueba
    const tenant = await prisma.tenant.upsert({
        where: { slug: 'clinica-demo' },
        update: {},
        create: {
            nombre: 'Clínica Demo FisioAll',
            slug: 'clinica-demo',
            plan: 'pro',
            emailContacto: 'contacto@clinica-demo.com',
            telefono: '5551234567',
        },
    })

    // Crear Usuario Fisioterapeuta
    const usuario = await prisma.usuario.upsert({
        where: { email: 'doctor@clinica.com' },
        update: {},
        create: {
            tenantId: tenant.id,
            nombre: 'Dr. Fernando',
            apellido: 'Martínez',
            email: 'doctor@clinica.com',
            passwordHash,
            rol: 'admin',
            especialidades: ['Deportiva', 'Ortopédica'],
        },
    })

    console.log({ tenant, usuario })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
