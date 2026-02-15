import { PrismaClient, MovementType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Buscar un usuario existente (el primero que encuentre)
  const user = await prisma.user.findFirst()
  
  if (!user) {
    console.log("❌ No hay usuarios para crear movimientos")
    return
  }

  console.log(`✅ Usuario encontrado: ${user.email}`)

  const movements = [
    {
      amount: 2500,
      concept: "Salario",
      date: new Date('2026-02-01'),
      type: MovementType.INCOME,
      userId: user.id
    },
    {
      amount: 120,
      concept: "Supermercado",
      date: new Date('2026-02-05'),
      type: MovementType.EXPENSE,
      userId: user.id
    },
    {
      amount: 450,
      concept: "Transferencia a ahorros",
      date: new Date('2026-02-10'),
      type: MovementType.EXPENSE,
      userId: user.id
    },
    {
      amount: 800,
      concept: "Ventas online",
      date: new Date('2026-02-12'),
      type: MovementType.INCOME,
      userId: user.id
    },
    {
      amount: 35.50,
      concept: "Netflix",
      date: new Date('2026-02-14'),
      type: MovementType.EXPENSE,
      userId: user.id
    }
  ]

  console.log(`🔄 Creando ${movements.length} movimientos...`)

  for (const movement of movements) {
    await prisma.movement.create({ data: movement })
  }

  console.log("✅ Movimientos de prueba creados exitosamente")
  
  // Verificar que se crearon
  const count = await prisma.movement.count()
  console.log(`📊 Total movimientos en BD: ${count}`)
}

main()
  .catch(e => {
    console.error("❌ Error en seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })