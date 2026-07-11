
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { prisma } from "./prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    ...authConfig,
    providers: [
        ...authConfig.providers.filter((p: any) => p.id !== 'credentials'),
        Credentials({
            async authorize(credentials) {
                try {
                    const email = credentials.email as string
                    const password = credentials.password as string

                    if (!email || !password) return null

                    const user = await prisma.user.findUnique({ where: { email } })

                    if (!user || !user.password) return null

                    const passwordsMatch = await bcrypt.compare(password, user.password)

                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            favoriteStyle: (user as any).favoriteStyle,
                            headSize: (user as any).headSize,
                            favoriteMaterial: (user as any).favoriteMaterial,
                        } as any
                    }

                    return null
                } catch {
                    return null
                }
            }
        })
    ],
})

export async function requireAdmin() {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        throw new Error('No autorizado')
    }
    return session
}

export async function requireAuth() {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error('No autorizado')
    }
    return session
}
