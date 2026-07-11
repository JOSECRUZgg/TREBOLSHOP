
import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

const prisma = new PrismaClient()

async function main() {
    try {
        const employees = await prisma.employee.findMany()
        const users = await prisma.user.findMany({ take: 5 })

        const output = {
            employees,
            users: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }))
        }

        writeFileSync('db-content.json', JSON.stringify(output, null, 2))
        console.log('Data written to db-content.json')

    } catch (error) {
        console.error('Error fetching data:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
