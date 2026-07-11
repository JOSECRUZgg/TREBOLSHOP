import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // Hash password for admin
  const adminPassword = await bcrypt.hash('12345', 10)

  // Categories / Qualities are strings in our schema (field: quality)
  // Subcategories are also strings (field: subcategory)

  // We will create some dummy products directly.

  const products = [
    // BASIC
    {
      code: "BAS-001",
      brand: "Generic",
      name: "Basic Snapback Red",
      commercialName: "Gorra Roja Básica",
      price: 150.00,
      quantity: 50,
      quality: "Básica",
      subcategory: "Snapback",
      material: "Polyester",
      style: "Urbana",
      audience: "Unisex",
      imageUrl: "/placeholder-cap-red.jpg"
    },
    {
      code: "BAS-002",
      brand: "Generic",
      name: "Basic Trucker Blue",
      commercialName: "Gorra Camionera Azul",
      price: 150.00,
      quantity: 40,
      quality: "Básica",
      subcategory: "Trucker",
      material: "Mesh/Foam",
      style: "Urbana",
      audience: "Unisex",
      imageUrl: "/placeholder-cap-blue.jpg"
    },
    // STANDARD
    {
      code: "STD-001",
      brand: "UrbanStyle",
      name: "Urban Flat Brim",
      commercialName: "Plana Urbana Negra",
      price: 350.00,
      quantity: 30,
      quality: "Estándar",
      subcategory: "Fitted",
      material: "Cotton",
      style: "Urbana",
      audience: "Men",
      imageUrl: "/placeholder-cap-black.jpg"
    },
    {
      code: "STD-002",
      brand: "SportTech",
      name: "Runner Dry",
      commercialName: "Gorra Deportiva DryFit",
      price: 380.00,
      quantity: 25,
      quality: "Estándar",
      subcategory: "Dad Hat",
      material: "Polyester",
      style: "Deportiva",
      audience: "Unisex",
      imageUrl: "/placeholder-cap-sport.jpg"
    },
    // PREMIUM
    {
      code: "PREM-001",
      brand: "LuxuryCaps",
      name: "Designer Edition Gold",
      commercialName: "Edición Limitada Oro",
      price: 1200.00,
      quantity: 10,
      quality: "Premium",
      subcategory: "Diseñador",
      material: "Leather/Suede",
      style: "Edición Limitada",
      audience: "Men",
      imageUrl: "/placeholder-cap-gold.jpg"
    },
    {
      code: "PREM-002",
      brand: "LuxuryCaps",
      name: "Designer Bean",
      commercialName: "Beanie Cachemir",
      price: 900.00,
      quantity: 15,
      quality: "Premium",
      subcategory: "Beanie",
      material: "Wool",
      style: "Diseñador",
      audience: "Women",
      imageUrl: "/placeholder-cap-wool.jpg"
    }
  ]

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    })
    console.log(`Created product with id: ${product.id}`)
  }

  // Seed one employee
  await prisma.employee.upsert({
    where: { dni: "12345678A" },
    update: {},
    create: {
      dni: "12345678A",
      firstName: "Juan",
      lastName: "Perez",
      address: "Calle Falsa 123",
      phone: "555-0192",
      socialSecurity: "SS-123456"
    }
  })
  console.log(`Created employee: Juan Perez`)

  // Seed Admin User
  // Email: admin@gorras.com
  // Password: 12345
  await prisma.user.upsert({
    where: { email: "admin@gorras.com" },
    update: {
      password: adminPassword
    },
    create: {
      email: "admin@gorras.com",
      name: "Super Admin",
      password: adminPassword,
      role: "ADMIN"
    }
  })
  console.log('Seeding finished.')
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
