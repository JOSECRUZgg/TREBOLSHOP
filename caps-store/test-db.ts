
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Testing connection...')
        const userCount = await prisma.user.count()
        console.log('User count:', userCount)

        const firstUser = await prisma.user.findFirst()
        console.log('First user:', firstUser ? firstUser.email : 'No users found')

    } catch (error) {
        console.error('Error during database test:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
