import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Tomar slug del primer arg, default "kaya-kalp"
  const slug = process.argv[2] ?? "kaya-kalp";
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) {
    console.error(`No existe tenant con slug "${slug}"`);
    process.exit(1);
  }

  const tenantId = tenant.id;
  console.log(`Seeding servicios para tenant: ${tenant.nombre} (${tenantId})`);

  // Verificar si ya hay servicios
  const existing = await prisma.servicio.count({ where: { tenantId } });
  if (existing > 0) {
    console.log(`Ya existen ${existing} servicios — saltando seed`);
    return;
  }

  const servicios = [
    // ── FISIOTERAPIA ──
    { nombre: "Normal / Antiestrés", descripcion: "Terapia manual enfocada en tren superior, complementada con aparatología", categoria: "fisioterapia", categoriaLabel: "Fisioterapia", categoriaColor: "#4a7fa5", especialidad: "Fisioterapia", duracion: 45, precio: 400, orden: 1 },
    { nombre: "Descarga de Esfuerzo", descripcion: "Enfoque manual en cuerpo completo para eliminar fatiga y cansancio", categoria: "fisioterapia", categoriaLabel: "Fisioterapia", categoriaColor: "#4a7fa5", especialidad: "Fisioterapia", duracion: 45, precio: 470, orden: 2 },
    { nombre: "Drenaje Linfático", descripcion: "Manipulaciones suaves para mejorar circulación y sistema linfático", categoria: "fisioterapia", categoriaLabel: "Fisioterapia", categoriaColor: "#4a7fa5", especialidad: "Fisioterapia", duracion: 45, precio: 520, orden: 3 },
    { nombre: "Presoterapia", descripcion: "Aparato para retorno venoso y drenaje por zonas del cuerpo", categoria: "fisioterapia", categoriaLabel: "Fisioterapia", categoriaColor: "#4a7fa5", especialidad: "Fisioterapia", duracion: 45, precio: 420, orden: 4 },
    { nombre: "Ejercicio Terapéutico", descripcion: "Rehabilitación personalizada de lesiones deportivas o post-quirúrgicas", categoria: "fisioterapia", categoriaLabel: "Fisioterapia", categoriaColor: "#4a7fa5", especialidad: "Fisioterapia", duracion: 45, precio: 350, orden: 5 },
    { nombre: "Valoración", descripcion: "Evaluación para diagnóstico acertado y propuesta de tratamiento", categoria: "fisioterapia", categoriaLabel: "Fisioterapia", categoriaColor: "#4a7fa5", especialidad: "Fisioterapia", duracion: 45, precio: 450, orden: 6 },

    // ── FACIALES ──
    { nombre: "Masaje Facial Revitalizante", descripcion: "Limpieza básica y masaje que tonifica la piel y promueve el colágeno", categoria: "faciales", categoriaLabel: "Faciales", categoriaColor: "#b07aa8", especialidad: "Tratamientos Faciales", duracion: 60, precio: 450, orden: 1 },
    { nombre: "Limpieza Facial Básica", descripcion: "Limpieza, exfoliación, tonificación, mascarilla y protección", categoria: "faciales", categoriaLabel: "Faciales", categoriaColor: "#b07aa8", especialidad: "Tratamientos Faciales", duracion: 60, precio: 350, orden: 2 },
    { nombre: "Limpieza Facial Profunda", descripcion: "Incluye extracción, alta frecuencia, vaporización y humectación", categoria: "faciales", categoriaLabel: "Faciales", categoriaColor: "#b07aa8", especialidad: "Tratamientos Faciales", duracion: 60, precio: 450, orden: 3 },
    { nombre: "Hidratación Profunda", descripcion: "Hidrofacial, nutrición, máscara LED y tonificación profunda", categoria: "faciales", categoriaLabel: "Faciales", categoriaColor: "#b07aa8", especialidad: "Tratamientos Faciales", duracion: 60, precio: 500, orden: 4 },
    { nombre: "Rejuvenecimiento Facial", descripcion: "Microdermoabrasión, hidroplástica y efecto lifting antiarrugas", categoria: "faciales", categoriaLabel: "Faciales", categoriaColor: "#b07aa8", especialidad: "Tratamientos Faciales", duracion: 60, precio: 550, orden: 5 },

    // ── SUELO PÉLVICO ──
    { nombre: "Sesión Suelo Pélvico", descripcion: "Tratamiento de disfunciones, incontinencia, prolapsos y obstetricia", categoria: "suelo_pelvico", categoriaLabel: "Suelo Pélvico", categoriaColor: "#0d9488", especialidad: "Suelo Pélvico", duracion: 50, precio: 550, orden: 1 },

    // ── CORPORALES ──
    { nombre: "Tratamiento Corporal", descripcion: "Cavitador, radiofrecuencia, lipoláser y vacum terapia para grasa localizada", categoria: "corporales", categoriaLabel: "Corporales", categoriaColor: "#e89b3f", especialidad: "Tratamientos Corporales", duracion: 60, precio: 600, orden: 1 },

    // ── EPILACIÓN ──
    { nombre: "Media Pierna Inferior", categoria: "epilacion", categoriaLabel: "Epilación", categoriaColor: "#3fa87c", especialidad: "Tratamientos Corporales", duracion: 30, precio: 250, orden: 1 },
    { nombre: "Media Pierna Superior", categoria: "epilacion", categoriaLabel: "Epilación", categoriaColor: "#3fa87c", especialidad: "Tratamientos Corporales", duracion: 30, precio: 300, orden: 2 },
    { nombre: "Piernas Completas", categoria: "epilacion", categoriaLabel: "Epilación", categoriaColor: "#3fa87c", especialidad: "Tratamientos Corporales", duracion: 45, precio: 400, orden: 3 },
    { nombre: "Axila", categoria: "epilacion", categoriaLabel: "Epilación", categoriaColor: "#3fa87c", especialidad: "Tratamientos Corporales", duracion: 15, precio: 200, orden: 4 },
    { nombre: "Bigote", categoria: "epilacion", categoriaLabel: "Epilación", categoriaColor: "#3fa87c", especialidad: "Tratamientos Corporales", duracion: 15, precio: 150, orden: 5 },
    { nombre: "Barbilla", categoria: "epilacion", categoriaLabel: "Epilación", categoriaColor: "#3fa87c", especialidad: "Tratamientos Corporales", duracion: 15, precio: 150, orden: 6 },
    { nombre: "Barba Completa", categoria: "epilacion", categoriaLabel: "Epilación", categoriaColor: "#3fa87c", especialidad: "Tratamientos Corporales", duracion: 20, precio: 200, orden: 7 },
    { nombre: "Área de Bikini", categoria: "epilacion", categoriaLabel: "Epilación", categoriaColor: "#3fa87c", especialidad: "Tratamientos Corporales", duracion: 30, precio: 250, orden: 8 },
  ];

  await prisma.servicio.createMany({
    data: servicios.map((s) => ({ ...s, tenantId })),
  });

  console.log(`✓ ${servicios.length} servicios creados`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
